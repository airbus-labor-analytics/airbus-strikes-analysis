#!/usr/bin/env python3
"""
Unit and Integration Tests for Dashboard UI, DOM Hierarchy, and Controller Contracts.
Validates HTML tag balancing, 5-tab modular structure, Chart.js registration,
and viewport/canvas lifecycle guarantees (Principle VI).
"""

import unittest
import os
import re
import json
from pathlib import Path
from html.parser import HTMLParser

PROJECT_ROOT = Path(__file__).resolve().parent.parent
HTML_PATH = PROJECT_ROOT / "dashboard" / "index.html"
APP_JS_PATH = PROJECT_ROOT / "dashboard" / "app.js"
DATA_JS_PATH = PROJECT_ROOT / "dashboard" / "data.js"
METRICS_JSON_PATH = PROJECT_ROOT / "data" / "conflict_metrics.json"

EXPECTED_TABS = [
    "tab-portal",
    "tab-overview",
    "tab-industrial",
    "tab-purchasing-power",
    "tab-union-force",
    "tab-evidence"
]

EXPECTED_CANVASES = [
    "asymmetryChart",
    "airbusStockChart",
    "companyRevenueChart",
    "companyDeliveriesChart",
    "shareholderPieChart",
    "belugaHistoryChart",
    "wagesChart",
    "unionShareChart",
    "unionEvolutionChart",
    "siteDelegatesChart",
    "referendumPieChart",
    "referendumSitesChart"
]


class StrictHTMLTagValidator(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.errors = []
        self.void_tags = {'meta', 'link', 'input', 'img', 'br', 'hr', 'source', 'wbr'}

    def handle_starttag(self, tag, attrs):
        if tag.lower() not in self.void_tags:
            pos = self.getpos()
            self.stack.append((tag.lower(), pos))

    def handle_endtag(self, tag):
        tag_lower = tag.lower()
        if tag_lower in self.void_tags:
            return
        if not self.stack:
            pos = self.getpos()
            self.errors.append(f"Unexpected closing tag </{tag_lower}> at line {pos[0]}, col {pos[1]}")
            return
        last_tag, pos = self.stack.pop()
        if last_tag != tag_lower:
            end_pos = self.getpos()
            self.errors.append(f"Mismatched tag: expected </{last_tag}> (opened line {pos[0]}:{pos[1]}), found </{tag_lower}> at line {end_pos[0]}:{end_pos[1]}")


class TestDashboardUI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open(HTML_PATH, "r", encoding="utf-8") as f:
            cls.html_content = f.read()
        with open(APP_JS_PATH, "r", encoding="utf-8") as f:
            cls.app_js_content = f.read()
        with open(METRICS_JSON_PATH, "r", encoding="utf-8") as f:
            cls.metrics_data = json.load(f)

    def test_html_tag_balancing(self):
        """Validates that 100% of HTML tags in index.html are balanced with zero unclosed elements."""
        validator = StrictHTMLTagValidator()
        validator.feed(self.html_content)
        self.assertEqual(validator.errors, [], f"HTML tag hierarchy errors: {validator.errors}")
        self.assertEqual(validator.stack, [], f"Unclosed HTML tags: {validator.stack}")

    def test_tab_containers_structure(self):
        """Validates that all 6 module containers (portal + 5 specialized) exist and have the tab-content class."""
        for tab_id in EXPECTED_TABS:
            pattern = rf'<div\s+id=["\']{tab_id}["\']\s+class=["\']tab-content\b'
            self.assertTrue(
                re.search(pattern, self.html_content),
                f"Missing or malformed tab container definition for '{tab_id}'"
            )
            self.assertIn(f'id="btn-{tab_id}"', self.html_content, f"Missing sidebar navigation button for '{tab_id}'")

    def test_purged_obsolete_tabs(self):
        """Validates that obsolete legacy tabs (like tab-checklist) are completely removed."""
        self.assertNotIn('id="tab-checklist"', self.html_content)
        self.assertNotIn('btn-tab-checklist', self.html_content)

    def test_chart_canvases_registered(self):
        """Validates that all 12 Chart.js canvases exist in index.html and have init functions in app.js."""
        for canvas_id in EXPECTED_CANVASES:
            self.assertIn(f'id="{canvas_id}"', self.html_content, f"Canvas '{canvas_id}' missing from index.html")
            self.assertIn(canvas_id, self.app_js_content, f"Canvas '{canvas_id}' not referenced in app.js")

    def test_viewport_scroll_and_resize_lifecycle_contract(self):
        """Validates Principle VI: switchTab resets scrollTop and triggers .resize() on visible charts."""
        # 1. Check for scrollTop reset in switchTab
        self.assertIn("mainContainer.scrollTop = 0", self.app_js_content, "Missing scrollTop = 0 reset in switchTab")
        # 2. Check for Chart resize calls
        self.assertIn("chartInstance.resize()", self.app_js_content, "Missing chartInstance.resize() in switchTab")

    def test_url_alias_map_integrity(self):
        """Validates that all legacy hash aliases map to one of the 5 canonical tabs."""
        alias_map_match = re.search(r'const tabAliases = \{([^}]+)\};', self.app_js_content)
        self.assertIsNotNone(alias_map_match, "tabAliases dictionary missing in app.js")
        
        alias_entries = re.findall(r"['\"](tab-[a-zA-Z0-9_-]+)['\"]\s*:\s*['\"](tab-[a-zA-Z0-9_-]+)['\"]", alias_map_match.group(1))
        self.assertGreaterEqual(len(alias_entries), 10, "Expected at least 10 backward compatibility aliases")
        
        for alias, target in alias_entries:
            self.assertIn(target, EXPECTED_TABS, f"Alias '{alias}' points to invalid target '{target}'")

    def test_data_parity_constants(self):
        """Validates data parity between data/conflict_metrics.json and dashboard/data.js."""
        with open(DATA_JS_PATH, "r", encoding="utf-8") as f:
            data_js_content = f.read()

        # Check total workers
        workers = self.metrics_data.get("industrial_parameters", {}).get("total_workers_spain", 15562)
        self.assertIn(str(workers), data_js_content)

        # Check net profit
        profit = self.metrics_data.get("industrial_parameters", {}).get("airbus_se_net_profit_2025", 4960000000.0)
        self.assertIn(str(int(profit)), data_js_content)

    def test_sensitive_info_badges_and_platform_grid(self):
        """Validates that .badge-sensitive and committee-11points-grid exist in HTML and app.js."""
        self.assertIn(".badge-sensitive", self.html_content, "Missing .badge-sensitive CSS rule in index.html")
        self.assertIn("committee-11points-grid", self.html_content, "Missing committee-11points-grid container in index.html")
        self.assertIn("renderSensitiveBadge", self.app_js_content, "Missing renderSensitiveBadge helper in app.js")

    def test_portal_hub_components(self):
        """Validates Feature 005 components: mission statement, 4 flash KPIs, and 5-card Site Map."""
        self.assertIn("Portal de Inteligencia Estratégica", self.html_content)
        self.assertIn("15.562 trab.", self.html_content)
        self.assertIn("-14.459,5 M€", self.html_content)
        self.assertIn("60 horas", self.html_content)
        self.assertIn("-26.027 €", self.html_content)
        self.assertIn("Mapa de Navegación del Portal", self.html_content)
        for target_tab in ["tab-overview", "tab-industrial", "tab-purchasing-power", "tab-union-force", "tab-evidence"]:
            self.assertIn(f"switchTab('{target_tab}')", self.html_content)

    def test_dynamic_stock_milestones_container(self):
        """Validates that stock milestones container is dynamic and renderStockMilestones is defined."""
        self.assertIn('id="stock-milestones-container"', self.html_content, "Missing #stock-milestones-container in index.html")
        self.assertIn("function renderStockMilestones(", self.app_js_content, "Missing renderStockMilestones() in app.js")

    def test_instant_chart_rendering_configuration(self):
        """Validates that Chart.js animations are disabled globally for instant rendering."""
        self.assertIn("Chart.defaults.animation = false", self.app_js_content, "Missing Chart.defaults.animation = false in app.js")
        self.assertIn("Chart.defaults.responsiveAnimationDuration = 0", self.app_js_content, "Missing Chart.defaults.responsiveAnimationDuration = 0 in app.js")
        self.assertNotIn("setTimeout(() => {", self.app_js_content[self.app_js_content.find("function switchTab"):self.app_js_content.find("function switchTab") + 1500], "switchTab should not have artificial setTimeout delay")
    def test_salary_proposals_comparison_dom_and_logic(self):
        """Validates Feature 008 components: 10-dimension matrix, 3-proposal comparison, differential KPIs, and calculation engine."""
        # HTML DOM containers and IDs
        self.assertIn('id="salary-proposals-matrix-body"', self.html_content, "Missing #salary-proposals-matrix-body in index.html")
        self.assertIn('id="tb-prop-co-y1-nom"', self.html_content, "Missing #tb-prop-co-y1-nom in index.html")
        self.assertIn('id="tb-prop-cgt-y1-nom"', self.html_content, "Missing #tb-prop-cgt-y1-nom in index.html")
        self.assertIn('id="tb-prop-comite-y1-nom"', self.html_content, "Missing #tb-prop-comite-y1-nom in index.html")
        self.assertIn('id="kpi-diff-cgt-5yr"', self.html_content, "Missing #kpi-diff-cgt-5yr in index.html")
        self.assertIn('id="kpi-diff-comite-5yr"', self.html_content, "Missing #kpi-diff-comite-5yr in index.html")

        # App.js calculation & rendering functions
        self.assertIn("function calculateSalaryProposals(", self.app_js_content, "Missing calculateSalaryProposals() in app.js")
        self.assertIn("function renderSalaryProposalsMatrix(", self.app_js_content, "Missing renderSalaryProposalsMatrix() in app.js")
        self.assertIn("renderSalaryProposalsMatrix();", self.app_js_content, "renderSalaryProposalsMatrix() not invoked in app.js")
if __name__ == "__main__":
    unittest.main()
