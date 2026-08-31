#!/usr/bin/env python3
"""
tests/test_data_ingestion.py
============================
Automated unit and integration test suite for the autonomous data ingestion pipeline,
modular parsers, atomic writer, validation manifests, and invariant failure rollback.
"""

import json
import os
import shutil
import tempfile
import unittest
from pathlib import Path

from src.parsers.config_loader import load_sources_config, get_source_by_id
from src.atomic_writer import atomic_write_json, AtomicTransaction, AtomicWriteError
from src.parsers.telegram_parser import (
    parse_telegram_archive,
    generate_strike_update_manifest,
    extract_sima_and_committee_proposals
)
from src.parsers.news_parser import parse_rss_feed, parse_news_sources
from src.parsers.metric_parser import parse_economic_metrics, parse_beluga_logistics
from src.data_ingestion import (
    run_ingestion_cycle,
    IngestionCoordinator,
    format_validation_manifest_table,
    apply_validated_manifest
)


class TestConfigLoader(unittest.TestCase):
    """Test configuration loading and environment overrides."""

    def test_load_default_config(self):
        config = load_sources_config()
        self.assertIn("sources", config)
        self.assertGreaterEqual(len(config["sources"]), 4)

    def test_get_source_by_id(self):
        config = load_sources_config()
        telegram_src = get_source_by_id(config, "telegram_archive")
        self.assertIsNotNone(telegram_src)
        self.assertTrue(telegram_src["enabled"])

    def test_env_interval_override(self):
        os.environ["POLLING_INTERVAL_MINUTES"] = "45"
        try:
            config = load_sources_config()
            self.assertEqual(config.get("polling_interval_minutes"), 45)
        finally:
            del os.environ["POLLING_INTERVAL_MINUTES"]


class TestAtomicWriter(unittest.TestCase):
    """Test atomic file writing and rollback safety."""

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_atomic_write_json(self):
        target = Path(self.test_dir) / "test.json"
        data = {"status": "ok", "count": 42}
        atomic_write_json(target, data)
        self.assertTrue(target.exists())
        with open(target, "r", encoding="utf-8") as f:
            self.assertEqual(json.load(f), data)

    def test_atomic_transaction_success(self):
        t1 = Path(self.test_dir) / "f1.json"
        t2 = Path(self.test_dir) / "f2.json"
        with AtomicTransaction() as tx:
            tx.write_json(t1, {"file": 1})
            tx.write_json(t2, {"file": 2})

        self.assertTrue(t1.exists())
        self.assertTrue(t2.exists())

    def test_atomic_transaction_rollback_on_error(self):
        t1 = Path(self.test_dir) / "f1.json"
        t2 = Path(self.test_dir) / "f2.json"

        # Pre-seed t1
        atomic_write_json(t1, {"name": "first"})

        with self.assertRaises(RuntimeError):
            with AtomicTransaction() as tx:
                tx.write_json(t1, {"name": "modified"})
                tx.write_json(t2, {"name": "second"})
                raise RuntimeError("Forced simulation error")

        # t1 must retain initial state and t2 must not exist
        self.assertFalse(t2.exists())
        with open(t1, "r", encoding="utf-8") as f:
            self.assertEqual(json.load(f)["name"], "first")


class TestParsers(unittest.TestCase):
    """Test multi-source parsers."""

    def test_telegram_archive_parser(self):
        archive_dir = Path("data/telegram_archive")
        if archive_dir.exists():
            res = parse_telegram_archive(archive_dir)
            self.assertIn("documents", res)
            self.assertGreater(res["total_documents"], 0)

    def test_metric_parser_beluga(self):
        beluga_file = Path("data/beluga_status.json")
        if beluga_file.exists():
            res = parse_beluga_logistics(beluga_file)
            self.assertIn("fleet_count", res)
            self.assertIn("timestamp", res)


class TestValidationManifest(unittest.TestCase):
    """Test Strike Data Update Validation Manifest extraction and gating."""

    def test_generate_strike_update_manifest(self):
        manifest = generate_strike_update_manifest()
        self.assertIn("manifest_id", manifest)
        self.assertIn("items", manifest)
        self.assertEqual(manifest["overall_status"], "PENDING_USER_REVIEW")
        self.assertGreaterEqual(len(manifest["items"]), 2)

        item_ids = [it["id"] for it in manifest["items"]]
        self.assertIn("upd-sima-27aug-salary-terms", item_ids)
        self.assertIn("upd-committee-11-points-platform", item_ids)

    def test_format_validation_manifest_table(self):
        manifest = generate_strike_update_manifest()
        md_table = format_validation_manifest_table(manifest)
        self.assertIn("Strike Data Update Validation Manifest", md_table)
        self.assertIn("upd-sima-27aug-salary-terms", md_table)

    def test_apply_validated_manifest_dry_run(self):
        manifest = generate_strike_update_manifest()
        res = apply_validated_manifest(manifest, dry_run=True)
        self.assertEqual(res["status"], "success")
        self.assertTrue(res["dry_run"])
        self.assertGreater(res["applied_count"], 0)


class TestIngestionCoordinator(unittest.TestCase):
    """Test end-to-end ingestion cycle and invariant preservation."""

    def test_dry_run_cycle(self):
        coordinator = IngestionCoordinator()
        result = coordinator.execute_cycle(dry_run=True)
        self.assertEqual(result["status"], "success")
        self.assertTrue(result["invariants_passed"])
        self.assertGreater(result["items_processed"], 0)

    def test_run_once_execution(self):
        result = run_ingestion_cycle(dry_run=False)
        self.assertEqual(result["status"], "success")
        self.assertTrue(result["invariants_passed"])

        # Confirm sync_status.json is valid
        sync_file = Path("data/sync_status.json")
        self.assertTrue(sync_file.exists())
        with open(sync_file, "r", encoding="utf-8") as f:
            status = json.load(f)
        self.assertEqual(status["system_status"], "healthy")
        self.assertTrue(status["sources"]["metrics"]["invariants_pass"])


if __name__ == "__main__":
    unittest.main()
