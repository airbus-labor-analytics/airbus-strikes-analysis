#!/usr/bin/env python3
"""
tests/test_backend_resilience.py
================================
Unit tests for backend resilience, atomic writes, network retry utilities,
and graceful degradation mechanisms.
"""

import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch
import urllib.error

from src.network_utils import fetch_with_retry
from src.atomic_writer import atomic_write_json, AtomicTransaction, AtomicWriteError
from src.beluga_tracker import BelugaTracker
from src.parsers.metric_parser import parse_economic_metrics
from src.parsers.news_parser import parse_rss_feed


class TestNetworkUtils(unittest.TestCase):
    """Tests for resilient network fetch utility."""

    @patch("urllib.request.urlopen")
    def test_fetch_success_first_try(self, mock_urlopen):
        mock_resp = MagicMock()
        mock_resp.read.return_value = b'{"status": "ok", "value": 42}'
        mock_resp.__enter__.return_value = mock_resp
        mock_urlopen.return_value = mock_resp

        data = fetch_with_retry("https://api.example.com/data", decode_json=True, max_retries=2)
        self.assertEqual(data, {"status": "ok", "value": 42})
        self.assertEqual(mock_urlopen.call_count, 1)

    @patch("time.sleep", return_value=None)
    @patch("urllib.request.urlopen")
    def test_fetch_retry_on_transient_error(self, mock_urlopen, mock_sleep):
        mock_fail = urllib.error.URLError("Temporary connection reset")
        mock_ok = MagicMock()
        mock_ok.read.return_value = b"Hello Resilient World"
        mock_ok.__enter__.return_value = mock_ok

        # Fail once, then succeed
        mock_urlopen.side_effect = [mock_fail, mock_ok]

        result = fetch_with_retry("https://api.example.com/text", max_retries=3, backoff_factor=0.01)
        self.assertEqual(result, b"Hello Resilient World")
        self.assertEqual(mock_urlopen.call_count, 2)
        mock_sleep.assert_called_once()

    @patch("time.sleep", return_value=None)
    @patch("urllib.request.urlopen")
    def test_fetch_exhausted_retries_returns_none(self, mock_urlopen, mock_sleep):
        mock_urlopen.side_effect = urllib.error.URLError("Server unreachable")

        result = fetch_with_retry("https://api.example.com/fail", max_retries=2, backoff_factor=0.01)
        self.assertIsNone(result)
        self.assertEqual(mock_urlopen.call_count, 2)

    @patch("urllib.request.urlopen")
    def test_client_error_404_stops_retry_immediately(self, mock_urlopen):
        err_404 = urllib.error.HTTPError("https://api.example.com/404", 404, "Not Found", {}, None)
        mock_urlopen.side_effect = err_404

        result = fetch_with_retry("https://api.example.com/404", max_retries=3)
        self.assertIsNone(result)
        # Should NOT retry after 404
        self.assertEqual(mock_urlopen.call_count, 1)


class TestAtomicWriter(unittest.TestCase):
    """Tests for atomic file writes and transactions."""

    def test_atomic_write_json_success(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            target = Path(tmpdir) / "sub" / "data.json"
            payload = {"key": "value", "count": 100}

            atomic_write_json(target, payload)
            self.assertTrue(target.exists())

            with open(target, "r", encoding="utf-8") as f:
                loaded = json.load(f)
            self.assertEqual(loaded, payload)

    def test_atomic_transaction_commit(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            file_a = Path(tmpdir) / "a.json"
            file_b = Path(tmpdir) / "b.json"

            with AtomicTransaction() as tx:
                tx.stage_json(file_a, {"name": "Alice"})
                tx.stage_json(file_b, {"name": "Bob"})
                tx.commit()

            self.assertTrue(file_a.exists())
            self.assertTrue(file_b.exists())

    def test_atomic_transaction_rollback_on_error(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            file_a = Path(tmpdir) / "a.json"

            try:
                with AtomicTransaction() as tx:
                    tx.stage_json(file_a, {"name": "Alice"})
                    raise RuntimeError("Simulated failure before commit")
            except RuntimeError:
                pass

            self.assertFalse(file_a.exists())


class TestModuleGracefulFallbacks(unittest.TestCase):
    """Tests that modules gracefully fall back on network outages."""

    @patch("src.beluga_tracker.fetch_with_retry", return_value=None)
    def test_beluga_tracker_fallback(self, mock_fetch):
        tracker = BelugaTracker(api_url="https://invalid.example/beluga")
        status = tracker.fetch_live_data()

        self.assertIn("european_routes", status)
        self.assertGreaterEqual(len(status["european_routes"]), 4)

    @patch("src.parsers.metric_parser.fetch_with_retry", return_value=None)
    def test_economic_metrics_fallback(self, mock_fetch):
        result = parse_economic_metrics("https://ine.es/api/cpi")
        self.assertEqual(result["source"], "local_baseline")
        self.assertEqual(result["status"], "cached")

    @patch("src.parsers.news_parser.fetch_with_retry", return_value=None)
    def test_news_parser_fallback_on_network_error(self, mock_fetch):
        articles = parse_rss_feed("https://news.example.com/rss")
        self.assertEqual(articles, [])


if __name__ == "__main__":
    unittest.main()
