#!/usr/bin/env python3
"""
src/data_ingestion.py
=====================
Autonomous multi-source data ingestion engine and background scheduler for Airbus Strikes Analysis.
Coordinates parsers, validates mathematical invariants, performs atomic commits, and updates live status.
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Add project root to sys.path to allow relative and absolute module imports
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.parsers.config_loader import load_sources_config, get_enabled_sources
from src.parsers.telegram_parser import parse_telegram_archive, parse_live_telegram
from src.parsers.news_parser import parse_news_sources
from src.parsers.metric_parser import parse_beluga_logistics
from src.atomic_writer import atomic_write_json, AtomicTransaction
from src.validate_invariants import validate_all


class IngestionCoordinator:
    """Coordinates multi-source data collection, validation, and atomic commits."""

    def __init__(self, config_path: Optional[Path] = None) -> None:
        self.config_path = config_path or (PROJECT_ROOT / "config" / "sources.json")
        self.config = load_sources_config(self.config_path)

    def execute_cycle(self, target_source: Optional[str] = None, dry_run: bool = False) -> Dict[str, Any]:
        """
        Execute one complete ingestion and invariant validation cycle.
        """
        start_time = time.time()
        now_iso = datetime.now(timezone.utc).isoformat()
        event_id = f"evt_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
        sources_to_run = get_enabled_sources(self.config)

        if target_source:
            sources_to_run = [s for s in sources_to_run if s.get("id") == target_source]

        sources_checked: List[str] = []
        sources_updated: List[str] = []
        items_count = 0
        source_details: Dict[str, Any] = {}

        # 1. Parse Telegram Archives & Channels
        for src in sources_to_run:
            src_id = src.get("id", "")
            src_type = src.get("type", "")
            sources_checked.append(src_id)

            if src_type == "telegram_archive":
                archive_dir = PROJECT_ROOT / src.get("endpoint", "data/telegram_archive")
                tg_result = parse_telegram_archive(archive_dir)
                items_count += tg_result.get("total_count", 0)
                sources_updated.append(src_id)
                source_details[src_id] = {
                    "status": "active",
                    "total_docs": tg_result.get("total_count", 0),
                    "last_message_ts": tg_result.get("last_indexed")
                }
                if not dry_run:
                    index_path = archive_dir / "telegram_index.json"
                    atomic_write_json(index_path, tg_result)

            elif src_type == "telegram_api":
                live_res = parse_live_telegram(src.get("endpoint", ""), src.get("auth_token"))
                source_details[src_id] = live_res

        # 2. Parse News and Press Feeds
        news_sources = [s for s in sources_to_run if s.get("type") in ("rss_feed", "web_scraper")]
        if news_sources:
            news_res = parse_news_sources(news_sources)
            items_count += news_res.get("total_articles", 0)
            for feed_id, f_stat in news_res.get("feed_statuses", {}).items():
                sources_checked.append(feed_id)
                if f_stat.get("count", 0) > 0:
                    sources_updated.append(feed_id)
                source_details[feed_id] = {
                    "status": f_stat.get("status", "active"),
                    "total_articles": f_stat.get("count", 0),
                    "last_article_ts": f_stat.get("last_poll")
                }

        # 3. Parse Beluga & Metrics
        for src in sources_to_run:
            if src.get("id") == "beluga_transport_status":
                beluga_res = parse_beluga_logistics()
                source_details["beluga_transport_status"] = {
                    "status": beluga_res.get("status", "active"),
                    "last_message_ts": beluga_res.get("timestamp")
                }

        # 4. Invariant Validation Gate
        invariants_passed = False
        validation_error = None
        try:
            # Run invariant validation across canonical dataset
            invariants_passed = validate_all()
        except Exception as e:
            invariants_passed = False
            validation_error = str(e)

        duration_ms = int((time.time() - start_time) * 1000)
        system_status = "healthy" if invariants_passed else "degraded"

        source_details["metrics"] = {
            "status": "active" if invariants_passed else "error",
            "invariants_pass": invariants_passed,
            "error_message": validation_error
        }

        sync_status_payload = {
            "version": "1.0.0",
            "last_successful_sync": now_iso if invariants_passed else None,
            "system_status": system_status,
            "polling_interval_seconds": 30,
            "sources": source_details,
            "latest_event": {
                "event_id": event_id,
                "duration_ms": duration_ms,
                "status": system_status,
                "error_message": validation_error
            }
        }

        # If previous sync was successful, preserve last_successful_sync on degradation
        sync_file = PROJECT_ROOT / "data" / "sync_status.json"
        if not invariants_passed and sync_file.exists():
            try:
                with open(sync_file, "r", encoding="utf-8") as f:
                    old_status = json.load(f)
                    sync_status_payload["last_successful_sync"] = old_status.get("last_successful_sync")
            except Exception:
                pass

        if not dry_run:
            atomic_write_json(sync_file, sync_status_payload)

        return {
            "event_id": event_id,
            "status": "success" if invariants_passed else "degraded",
            "invariants_passed": invariants_passed,
            "sources_polled": sources_checked,
            "sources_updated": sources_updated,
            "items_processed": items_count,
            "duration_ms": duration_ms,
            "error": validation_error
        }


def run_ingestion_cycle(target_source: Optional[str] = None, dry_run: bool = False) -> Dict[str, Any]:
    """Helper to run a single ingestion cycle."""
    coordinator = IngestionCoordinator()
    return coordinator.execute_cycle(target_source=target_source, dry_run=dry_run)


def run_daemon_loop(interval_minutes: Optional[int] = None) -> None:
    """Run continuous background ingestion daemon."""
    coordinator = IngestionCoordinator()
    cfg_interval = coordinator.config.get("default_polling_interval_minutes", 15)
    interval = interval_minutes or cfg_interval
    interval_seconds = max(10, interval * 60)

    print(f"--> [Daemon] Starting Autonomous Data Ingestion Daemon (Interval: {interval}m / {interval_seconds}s)")
    print(f"--> [Daemon] Press CTRL+C to terminate.")

    try:
        while True:
            ts = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')
            print(f"[{ts}] Running scheduled ingestion cycle...")
            res = coordinator.execute_cycle()
            print(f"[{ts}] Cycle {res['event_id']} finished: {res['status'].upper()} (Items: {res['items_processed']}, Invariants: {res['invariants_passed']})")
            time.sleep(interval_seconds)
    except KeyboardInterrupt:
        print("\n--> [Daemon] Terminated gracefully by user.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Autonomous Data Ingestion Pipeline for Airbus Strikes Analysis")
    parser.add_argument("-1", "--run-once", action="store_true", help="Run a single ingestion cycle and exit")
    parser.add_argument("-d", "--daemon", action="store_true", help="Start continuous background polling daemon")
    parser.add_argument("-i", "--interval", type=int, help="Override polling interval in minutes")
    parser.add_argument("-s", "--source", type=str, help="Target specific source ID")
    parser.add_argument("-c", "--config", type=Path, help="Path to sources.json configuration")
    parser.add_argument("-n", "--dry-run", action="store_true", help="Validate and parse without writing files")
    parser.add_argument("-j", "--json", action="store_true", help="Output machine-readable JSON summary")

    args = parser.parse_args()

    if args.daemon:
        run_daemon_loop(interval_minutes=args.interval)
        sys.exit(0)

    # Default to single run if --run-once is set or no mode specified
    coordinator = IngestionCoordinator(config_path=args.config)
    result = coordinator.execute_cycle(target_source=args.source, dry_run=args.dry_run)

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(f"--> [Ingestion] Event: {result['event_id']}")
        print(f"--> [Ingestion] Status: {result['status'].upper()} (Invariants: {'PASS' if result['invariants_passed'] else 'FAIL'})")
        print(f"--> [Ingestion] Items processed: {result['items_processed']} across {len(result['sources_polled'])} sources")
        print(f"--> [Ingestion] Elapsed time: {result['duration_ms']}ms")

    sys.exit(0 if result["invariants_passed"] else 1)


if __name__ == "__main__":
    main()
