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
    "salaryEvolutionChart",
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
        """Validates that all 6 module containers exist and have dock navigation buttons."""
        for tab_id in EXPECTED_TABS:
            pattern = rf'<div\s+id=["\']{tab_id}["\']\s+class=["\']tab-content\b'
            self.assertTrue(
                re.search(pattern, self.html_content),
                f"Missing or malformed tab container definition for '{tab_id}'"
            )
            self.assertIn(f'id="dock-{tab_id}"', self.html_content, f"Missing dock navigation button for '{tab_id}'")
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
        # 1. Check for scroll reset in switchTab
        self.assertTrue("scrollTop = 0" in self.app_js_content or "scrollTo" in self.app_js_content, "Missing scroll reset in switchTab")
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
        self.assertIn('id="sc1-salary-y1"', self.html_content, "Missing #sc1-salary-y1 in index.html")
        self.assertIn('id="sc2-salary-y1"', self.html_content, "Missing #sc2-salary-y1 in index.html")
        self.assertIn('id="sc3-salary-y1"', self.html_content, "Missing #sc3-salary-y1 in index.html")
        self.assertIn('id="kpi-diff-sima-5yr"', self.html_content, "Missing #kpi-diff-sima-5yr in index.html")
        self.assertIn('id="kpi-diff-comite-5yr"', self.html_content, "Missing #kpi-diff-comite-5yr in index.html")
        self.assertIn('id="roi-strike-cost"', self.html_content, "Missing #roi-strike-cost in index.html")
        self.assertIn('id="salaryEvolutionChart"', self.html_content, "Missing #salaryEvolutionChart in index.html")

        # App.js calculation & rendering functions
        self.assertIn("function calculateSalaryProposals(", self.app_js_content, "Missing calculateSalaryProposals() in app.js")
        self.assertIn("function updateSalaryEvolutionChart(", self.app_js_content, "Missing updateSalaryEvolutionChart() in app.js")
        self.assertIn("function renderSalaryProposalsMatrix(", self.app_js_content, "Missing renderSalaryProposalsMatrix() in app.js")
        self.assertIn("renderSalaryProposalsMatrix();", self.app_js_content, "renderSalaryProposalsMatrix() not invoked in app.js")

    def test_amoled_liquid_crystal_design_tokens(self):
        """Validates Feature 009: AMOLED Black background, Liquid Crystal glassmorphism, and Geist/Inter fonts."""
        # HTML font and theme tokens
        self.assertIn("Geist", self.html_content, "Geist font family missing in index.html")
        self.assertIn("JetBrains+Mono", self.html_content, "JetBrains Mono font family missing in index.html")
        self.assertIn("bg-black", self.html_content, "bg-black AMOLED class missing in index.html")
        self.assertIn(".glass-card-crystal", self.html_content, "glass-card-crystal CSS class missing in index.html")
        self.assertIn(".glow-cyan", self.html_content, "glow-cyan CSS class missing in index.html")
        self.assertIn(".glow-emerald", self.html_content, "glow-emerald CSS class missing in index.html")

        # App.js dark theme chart defaults
        self.assertIn("Chart.defaults.color = '#94a3b8'", self.app_js_content, "Dark theme Chart.defaults.color missing in app.js")
        self.assertIn("Geist Mono", self.app_js_content, "Geist Mono font family missing in Chart.defaults in app.js")

    def test_floating_hud_and_quick_drawer(self):
        """Validates Feature 009 User Story 3: Dynamic Island HUD, Slide-over Drawer, and Back-to-Top."""
        # HTML DOM Elements
        self.assertIn('id="floating-hud"', self.html_content, "Missing #floating-hud in index.html")
        self.assertIn('id="quick-calc-drawer"', self.html_content, "Missing #quick-calc-drawer in index.html")
        self.assertIn('id="back-to-top"', self.html_content, "Missing #back-to-top in index.html")
        self.assertIn('id="drawer-input-salary"', self.html_content, "Missing #drawer-input-salary in index.html")
        self.assertIn('id="drawer-slider-strike-days"', self.html_content, "Missing #drawer-slider-strike-days in index.html")

        # App.js Logic
        self.assertIn("function initFloatingHUD(", self.app_js_content, "Missing initFloatingHUD() in app.js")
        self.assertIn("function toggleQuickCalculatorDrawer(", self.app_js_content, "Missing toggleQuickCalculatorDrawer() in app.js")
        self.assertIn("function syncDrawerCalculator(", self.app_js_content, "Missing syncDrawerCalculator() in app.js")
        self.assertIn("function scrollToTop(", self.app_js_content, "Missing scrollToTop() in app.js")
    def test_custom_proposal_builder_controls_and_logic(self):
        """Validates dynamic custom proposal builder in Card 3, in-card keyboard controls, presets, IPC linkage, and RSG cap."""
        # In-card controls & keyboard inputs
        self.assertIn('id="sim-custom-raise"', self.html_content, "Missing #sim-custom-raise in index.html")
        self.assertIn('id="sim-custom-raise-input"', self.html_content, "Missing #sim-custom-raise-input in index.html")
        self.assertIn('id="sim-custom-raise-badge"', self.html_content, "Missing #sim-custom-raise-badge in index.html")
        self.assertIn('id="sim-custom-arrears"', self.html_content, "Missing #sim-custom-arrears in index.html")
        self.assertIn('id="sim-custom-ipc-linked"', self.html_content, "Missing #sim-custom-ipc-linked in index.html")
        self.assertIn('id="sim-custom-rsg-margin"', self.html_content, "Missing #sim-custom-rsg-margin in index.html")
        self.assertIn('id="sim-custom-rsg-mode"', self.html_content, "Missing #sim-custom-rsg-mode in index.html")
        self.assertIn('id="sim-custom-cap-toggle"', self.html_content, "Missing #sim-custom-cap-toggle in index.html")
        self.assertIn('id="sim-custom-rsg-cap"', self.html_content, "Missing #sim-custom-rsg-cap in index.html")
        self.assertIn('id="kpi-diff-custom-5yr"', self.html_content, "Missing #kpi-diff-custom-5yr in index.html")
        self.assertIn('id="kpi-diff-custom-5yr-real"', self.html_content, "Missing #kpi-diff-custom-5yr-real in index.html")

        # App.js functions
        self.assertIn("function getCustomProposalState(", self.app_js_content, "Missing getCustomProposalState() in app.js")
        self.assertIn("function evaluateAnnualRaise(", self.app_js_content, "Missing evaluateAnnualRaise() in app.js")
        self.assertIn("function solveRecoveryInitialRaise(", self.app_js_content, "Missing solveRecoveryInitialRaise() in app.js")
        self.assertIn("function setCustomProposalPreset(", self.app_js_content, "Missing setCustomProposalPreset() in app.js")
        self.assertIn("function setCustomArrearsQuick(", self.app_js_content, "Missing setCustomArrearsQuick() in app.js")
        self.assertIn("function onRsgModeSelectChange(", self.app_js_content, "Missing onRsgModeSelectChange() in app.js")

    def test_beluga_logistics_decoupling_and_chart_removal(self):
        """Validates Feature 014: complete removal of #belugaHistoryChart and presence of decoupled Beluga logistics UI."""
        # Verify #belugaHistoryChart is removed
        self.assertNotIn('id="belugaHistoryChart"', self.html_content, "#belugaHistoryChart canvas should be removed")
        self.assertNotIn('initBelugaHistoryChart', self.app_js_content, "initBelugaHistoryChart function should be removed")
        
        # Verify decoupled Beluga logistics DOM elements
        self.assertIn('id="beluga-fleet-grid"', self.html_content, "Missing #beluga-fleet-grid in index.html")
        self.assertIn('id="beluga-routes-grid"', self.html_content, "Missing #beluga-routes-grid in index.html")
        self.assertIn('id="beluga-tail-filters"', self.html_content, "Missing #beluga-tail-filters in index.html")
        self.assertIn('id="beluga-citations-container"', self.html_content, "Missing #beluga-citations-container in index.html")
        
        # Verify app.js standalone functions
        self.assertIn("function initBelugaLogistics(", self.app_js_content, "Missing initBelugaLogistics() in app.js")
        self.assertIn("function initThermometer(", self.app_js_content, "Missing initThermometer() in app.js")
        self.assertIn("function renderBelugaFleet(", self.app_js_content, "Missing renderBelugaFleet() in app.js")
        self.assertIn("function renderBelugaRoutes(", self.app_js_content, "Missing renderBelugaRoutes() in app.js")
        self.assertIn("function startBelugaLivePolling(", self.app_js_content, "Missing startBelugaLivePolling() in app.js")

    def test_beluga_recent_movements_log_ui(self):
        """Validates Feature 015: Beluga recent flight movements log DOM and controller functions."""
        self.assertIn('id="sec-industrial-movements"', self.html_content, "Missing #sec-industrial-movements in index.html")
        self.assertIn('id="beluga-movements-container"', self.html_content, "Missing #beluga-movements-container in index.html")
        self.assertIn('id="movements-count-badge"', self.html_content, "Missing #movements-count-badge in index.html")
        self.assertIn("function renderBelugaMovements(", self.app_js_content, "Missing renderBelugaMovements() in app.js")
if __name__ == "__main__":
    unittest.main()
