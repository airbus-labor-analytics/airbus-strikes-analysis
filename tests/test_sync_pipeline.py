#!/usr/bin/env python3
"""
Unit tests for Feature 010: Telegram Document Extraction, Sentiment Thermometer,
NotebookLM upload fallback, and Sync Status Pipeline.
"""

import json
import os
import unittest
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

class TestSyncPipeline(unittest.TestCase):
    def setUp(self):
        self.data_dir = PROJECT_ROOT / "data"
        self.telegram_dir = self.data_dir / "telegram_archive"
        self.sync_status_file = self.data_dir / "sync_status.json"
        self.workflow_file = PROJECT_ROOT / ".github" / "workflows" / "sync-news-data.yml"

    def test_telegram_archive_directories_and_index(self):
        """Validates User Story 1: Subdirectories exist and telegram_index.json is structured."""
        for sub in ["assembly_minutes", "legal_filings", "dossiers", "documents"]:
            sub_path = self.telegram_dir / sub
            self.assertTrue(sub_path.exists(), f"Missing subfolder: {sub_path}")

        index_file = self.telegram_dir / "telegram_index.json"
        self.assertTrue(index_file.exists(), "Missing telegram_index.json")

        with open(index_file, "r", encoding="utf-8") as f:
            index_data = json.load(f)

        self.assertIn("channel_metadata", index_data)
        self.assertIn("stats", index_data)
        self.assertIn("documents", index_data)
        self.assertIsInstance(index_data["documents"], list)
        self.assertGreater(len(index_data["documents"]), 0)

        # Check document item structure and file existence
        for doc in index_data["documents"][:10]:
            self.assertIn("id", doc)
            self.assertIn("title", doc)
            self.assertIn("category", doc)
            self.assertIn("file_path", doc)
            target_path = PROJECT_ROOT / doc["file_path"]
            self.assertTrue(target_path.exists(), f"Document file does not exist: {target_path}")

    def test_sentiment_thermometer_data_and_bounds(self):
        """Validates User Story 2: Thermometer data JSON structure and temperature bounds."""
        thermo_file = self.data_dir / "thermometer_data.json"
        self.assertTrue(thermo_file.exists(), "Missing thermometer_data.json")

        with open(thermo_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        self.assertIn("temperature_celsius", data)
        self.assertIn("status_label", data)
        self.assertIn("feed", data)
        temp = data["temperature_celsius"]
        self.assertGreaterEqual(temp, 18.0)
        self.assertLessEqual(temp, 96.5)

    def test_sync_status_schema_conformance(self):
        """Validates that sync_status.json has all required fields."""
        self.assertTrue(self.sync_status_file.exists(), "Missing sync_status.json")

        with open(self.sync_status_file, "r", encoding="utf-8") as f:
            status = json.load(f)

        self.assertIn("last_sync", status)
        self.assertIn("status", status)
        self.assertIn("news_count", status)
        self.assertIn("telegram_docs_count", status)
        self.assertIn("notebooklm_sync", status)
        self.assertIn(status["status"], ["OK", "WARNING", "ERROR"])
        self.assertIn(status["notebooklm_sync"]["status"], ["SUCCESS", "SKIPPED", "FAILED", "OFFLINE"])

    def test_github_actions_workflow_configuration(self):
        """Validates User Story 3: GitHub Actions workflow cron and execution steps."""
        self.assertTrue(self.workflow_file.exists(), "Missing sync-news-data.yml")

        content = self.workflow_file.read_text(encoding="utf-8")
        self.assertIn("cron: '0 6-20/2 * * *'", content, "Dynamic 2h schedule missing in workflow")
        self.assertIn("cron: '0 0 * * *'", content, "Midnight cron schedule missing in workflow")
        self.assertIn("workflow_dispatch:", content, "Manual dispatch trigger missing in workflow")
        self.assertIn("telegram_channel_sync.py", content)
        self.assertIn("sentiment_thermometer.py", content)
        self.assertIn("upload_to_notebooklm.py", content)

if __name__ == "__main__":
    unittest.main()
