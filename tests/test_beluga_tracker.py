#!/usr/bin/env python3
"""
tests/test_beluga_tracker.py
============================
Automated unit tests for dynamic Beluga movement calculations,
HTP component retention accumulation, and FAL stock buffer depletion.
"""

import json
import unittest
from pathlib import Path

from src.beluga_tracker import BelugaTracker, calculate_dynamic_movements


class TestBelugaTrackerDynamic(unittest.TestCase):
    """Test dynamic algorithmic calculation of Beluga logistics."""

    def test_calculate_dynamic_movements_structure(self):
        res = calculate_dynamic_movements()
        self.assertIn("weeks", res)
        self.assertIn("getafe_flights_per_week", res)
        self.assertIn("normal_baseline_flights", res)
        self.assertIn("accumulated_htp_retained", res)
        self.assertIn("toulouse_fal_stock_buffer_pct", res)
        self.assertIn("hamburg_fal_stock_buffer_pct", res)
        self.assertIn("dynamic_movement_history", res)
        self.assertIn("accumulated_htp_retained_total", res)
        self.assertIn("current_fal_buffer_hours", res)

        self.assertEqual(len(res["weeks"]), 7)
        self.assertEqual(len(res["getafe_flights_per_week"]), 7)
        self.assertGreater(res["accumulated_htp_retained_total"], 30)

    def test_htp_retention_accumulation_monotonic(self):
        res = calculate_dynamic_movements()
        retained = res["accumulated_htp_retained"]
        for i in range(1, len(retained)):
            self.assertGreaterEqual(retained[i], retained[i - 1], "Retention curve must be non-decreasing")

    def test_fal_buffer_depletion_monotonic(self):
        res = calculate_dynamic_movements()
        buffer_toulouse = res["toulouse_fal_stock_buffer_pct"]
        for i in range(1, len(buffer_toulouse)):
            self.assertLessEqual(buffer_toulouse[i], buffer_toulouse[i - 1], "Buffer percentage must be non-increasing")

    def test_tracker_live_fallback_integration(self):
        tracker = BelugaTracker()
        data = tracker.fetch_live_data()
        self.assertIn("fleet_count", data)
        self.assertIn("historical_movements", data)
        self.assertIn("dynamic_movement_history", data)
        self.assertEqual(len(data["historical_movements"]["weeks"]), 7)


if __name__ == "__main__":
    unittest.main()
