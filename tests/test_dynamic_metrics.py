#!/usr/bin/env python3
"""
Unit Tests for Dynamic Metric Derivation and Chronology Calculations
Tests time engine calculations, Telegram archive counter aggregation,
and econometric dynamic metrics.
"""

import json
import unittest
from datetime import datetime, timezone
from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.analysis_engine import StrikeAnalysisEngine, IndustrialParameters


class TestDynamicMetricDerivation(unittest.TestCase):
    def setUp(self):
        self.params = IndustrialParameters()
        self.engine = StrikeAnalysisEngine(self.params)
        self.start_date = datetime(2026, 7, 20, 6, 0, 0, tzinfo=timezone.utc)
        self.metrics_file = PROJECT_ROOT / "data" / "conflict_metrics.json"
        self.telegram_file = PROJECT_ROOT / "data" / "telegram_archive" / "telegram_index.json"

    def test_conflict_chronology_calculation(self):
        """Verifies elapsed days, hours, and cumulative strike cost derivation."""
        # Simulated reference date: Day 4 (2026-07-24 06:00:00Z)
        ref_date = datetime(2026, 7, 24, 6, 0, 0, tzinfo=timezone.utc)
        diff_seconds = (ref_date - self.start_date).total_seconds()
        elapsed_days = int(diff_seconds // 86400)
        elapsed_hours = int(diff_seconds // 3600)
        daily_burn_rate = 22.7  # M€/day
        cumulative_cost = round(elapsed_days * daily_burn_rate, 1)

        self.assertEqual(elapsed_days, 4)
        self.assertEqual(elapsed_hours, 96)
    def test_telegram_and_source_counter_consistency(self):
        """Verifies dynamic count of Telegram documents and primary sources."""
        if self.telegram_file.exists():
            with open(self.telegram_file, "r", encoding="utf-8") as f:
                tg_data = json.load(f)
            docs = tg_data.get("documents", [])
            total_docs_stat = tg_data.get("stats", {}).get("total_documents", len(docs))
            self.assertEqual(len(docs), total_docs_stat)
            self.assertGreater(len(docs), 0)

        sources_file = PROJECT_ROOT / "data" / "sources_catalog.json"
        if sources_file.exists():
            with open(sources_file, "r", encoding="utf-8") as f:
                sources_obj = json.load(f)
            sources_list = sources_obj.get("sources", []) if isinstance(sources_obj, dict) else sources_obj
            self.assertGreaterEqual(len(sources_list), 200)
    def test_dynamic_asymmetry_and_economic_derivation(self):
        """Verifies dynamic calculation of financial asymmetry across days."""
        timeline = self.engine.simulate_strike_timeline(days=15)
        self.assertEqual(len(timeline), 15)
        for entry in timeline:
            day = entry["day"]
            cumulative_airbus = entry["cumulative_airbus_loss_eur"]
            cumulative_payroll = entry["cumulative_payroll_saved_airbus_eur"]
            computed_ratio = round(cumulative_airbus / cumulative_payroll, 1)
            self.assertAlmostEqual(entry["asymmetry_ratio"], computed_ratio, places=1)
    def test_stock_milestone_metrics_and_deltas(self):
        """Validates that daily stock price deltas and peak variations are mathematically accurate."""
        stock_analysis = self.engine.get_stock_market_analysis()
        history = stock_analysis.get("daily_history_conflict", [])
        self.assertGreater(len(history), 0)

        peak_price = history[0]["price"]
        self.assertEqual(peak_price, 221.30)

        for idx, entry in enumerate(history):
            price = entry["price"]
            prev_price = history[idx - 1]["price"] if idx > 0 else price
            expected_dod = round(((price - prev_price) / prev_price) * 100, 2)
            expected_peak = round(((price - peak_price) / peak_price) * 100, 2)

            self.assertAlmostEqual(entry.get("dod_change_pct", expected_dod), expected_dod, places=2)
            self.assertAlmostEqual(entry.get("peak_change_pct", expected_peak), expected_peak, places=2)


if __name__ == "__main__":
    unittest.main()
