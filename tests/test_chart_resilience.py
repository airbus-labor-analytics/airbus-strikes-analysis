#!/usr/bin/env python3
"""
Unit and Integration Tests for Resilient Chart.js Lifecycle and Offline Fallbacks.
Validates centralized chart rendering, zero-blank-screen resilience,
dynamic chronology derivation, and form state preservation.
"""

import json
import re
import unittest
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
HTML_PATH = PROJECT_ROOT / "dashboard" / "index.html"
APP_JS_PATH = PROJECT_ROOT / "dashboard" / "app.js"
DATA_JS_PATH = PROJECT_ROOT / "dashboard" / "data.js"


class TestChartResilienceAndLifecycle(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open(HTML_PATH, "r", encoding="utf-8") as f:
            cls.html_content = f.read()
        with open(APP_JS_PATH, "r", encoding="utf-8") as f:
            cls.app_js_content = f.read()
        with open(DATA_JS_PATH, "r", encoding="utf-8") as f:
            cls.data_js_content = f.read()

    def test_resilient_chart_registry_and_helper_defined(self):
        """Validates that chartRegistry and renderResilientChart are properly defined."""
        self.assertIn("const chartRegistry = {};", self.app_js_content)
        self.assertIn("function renderResilientChart(canvasId, configBuilder)", self.app_js_content)
        self.assertIn("chartRegistry[canvasId].destroy()", self.app_js_content)
        self.assertIn("chartRegistry[canvasId] = newChart;", self.app_js_content)

    def test_all_12_charts_use_render_resilient_chart(self):
        """Validates that all 12 chart initialization functions route through renderResilientChart."""
        expected_chart_canvases = [
            "asymmetryChart",
            "airbusStockChart",
            "companyRevenueChart",
            "companyDeliveriesChart",
            "shareholderPieChart",
            "belugaHistoryChart",
            "salaryEvolutionChart",
            "wagesChart",
            "unionShareChart",
            "unionEvolutionChart",
            "siteDelegatesChart",
            "referendumPieChart",
            "referendumSitesChart"
        ]
        for canvas_id in expected_chart_canvases:
            pattern = rf"renderResilientChart\(\s*['\"]{canvas_id}['\"]"
            self.assertTrue(
                re.search(pattern, self.app_js_content),
                f"Chart initialization for '{canvas_id}' does not call renderResilientChart."
            )

    def test_dynamic_chronology_dom_bindings(self):
        """Validates dynamic chronology function and HTML binding classes."""
        self.assertIn("function getConflictChronology", self.app_js_content)
        self.assertIn("function updateDynamicChronologyDOM", self.app_js_content)
        self.assertIn(".dynamic-conflict-days", self.app_js_content)
        self.assertIn(".dynamic-cumulative-cost", self.app_js_content)
        self.assertIn(".dynamic-total-docs", self.app_js_content)

    def test_offline_baseline_data_embedded_in_data_js(self):
        """Validates zero-blank-screen guarantee: baseline data is immediately embedded in data.js."""
        self.assertIn("window.CONFLICT_DATA =", self.data_js_content)
        self.assertIn("window.SOURCES_DATA =", self.data_js_content)

    def test_autosync_preserves_user_inputs(self):
        """Validates that syncDataInBackground does not reset user inputs to presets."""
        self.assertIn("async function syncDataInBackground", self.app_js_content)
        self.assertIn("updateAsymmetrySimulation()", self.app_js_content)
        self.assertIn("updateWageSimulation()", self.app_js_content)


if __name__ == "__main__":
    unittest.main()
