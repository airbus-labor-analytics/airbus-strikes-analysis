#!/usr/bin/env python3
"""
tests/test_data_ingestion.py
============================
Automated unit and integration test suite for the autonomous data ingestion pipeline,
modular parsers, atomic writer, and invariant failure rollback.
"""

import json
import os
import shutil
import tempfile
import unittest
from pathlib import Path

from src.parsers.config_loader import load_sources_config, get_source_by_id
from src.atomic_writer import atomic_write_json, AtomicTransaction, AtomicWriteError
from src.parsers.telegram_parser import parse_telegram_archive
from src.parsers.news_parser import parse_rss_feed, parse_news_sources
from src.parsers.metric_parser import parse_economic_metrics, parse_beluga_logistics
from src.data_ingestion import run_ingestion_cycle, IngestionCoordinator


class TestConfigLoader(unittest.TestCase):
    """Test configuration loading and environment overrides."""

    def test_load_default_config(self):
        config = load_sources_config()
        self.assertIn("sources", config)
        self.assertGreaterEqual(len(config["sources"]), 4)

        telegram_src = get_source_by_id("telegram_archive", config)
        self.assertIsNotNone(telegram_src)
        self.assertEqual(telegram_src["type"], "telegram_archive")
        self.assertTrue(telegram_src["enabled"])

    def test_env_interval_override(self):
        os.environ["POLLING_INTERVAL_MINUTES"] = "45"
        try:
            config = load_sources_config()
            self.assertEqual(config["default_polling_interval_minutes"], 45)
        finally:
            del os.environ["POLLING_INTERVAL_MINUTES"]


class TestAtomicWriter(unittest.TestCase):
    """Test atomic file writing and rollback safety."""

    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp())

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_atomic_write_single_file(self):
        target = self.test_dir / "test.json"
        data = {"key": "value", "count": 42}
        atomic_write_json(target, data)

        self.assertTrue(target.exists())
        with open(target, "r", encoding="utf-8") as f:
            loaded = json.load(f)
        self.assertEqual(loaded, data)

    def test_transaction_commit_and_rollback(self):
        file1 = self.test_dir / "file1.json"
        file2 = self.test_dir / "file2.json"

        # Test successful commit
        tx = AtomicTransaction()
        tx.stage_json(file1, {"name": "first"})
        tx.stage_json(file2, {"name": "second"})
        tx.commit()

        self.assertTrue(file1.exists())
        self.assertTrue(file2.exists())

        # Test rollback on exception
        tx_fail = AtomicTransaction()
        tx_fail.stage_json(file1, {"name": "overwritten"})
        tx_fail.rollback()

        # file1 should still hold original value
        with open(file1, "r", encoding="utf-8") as f:
            self.assertEqual(json.load(f)["name"], "first")


class TestParsers(unittest.TestCase):
    """Test multi-source parsers."""

    def test_telegram_archive_parser(self):
        archive_dir = Path("data/telegram_archive")
        if archive_dir.exists():
            result = parse_telegram_archive(archive_dir)
            self.assertIn("documents", result)
            self.assertIn("total_count", result)
            self.assertGreater(result["total_count"], 0)

    def test_metric_parser_beluga(self):
        beluga_file = Path("data/beluga_status.json")
        if beluga_file.exists():
            res = parse_beluga_logistics(beluga_file)
            self.assertIn("fleet_count", res)
            self.assertIn("timestamp", res)


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
