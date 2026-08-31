#!/usr/bin/env python3
"""
Unit and Integration Tests for Airbus Strike Analysis Engine
Validates mathematical consistency of econometric models, supply chain buffer calculations,
and data export schemas.
"""

import unittest
import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.analysis_engine import StrikeAnalysisEngine, IndustrialParameters


class TestStrikeAnalysisEngine(unittest.TestCase):
    def setUp(self):
        self.params = IndustrialParameters()
        self.engine = StrikeAnalysisEngine(self.params)

    def test_industrial_parameters_consistency(self):
        """Validates default industrial parameters for Airbus Spain."""
        self.assertEqual(self.params.total_workers_spain, 15562)
        self.assertEqual(self.params.total_workforce_including_contractors, 15562)
        self.assertEqual(self.params.avg_annual_salary, 50000.0)
        self.assertEqual(self.params.airbus_se_net_profit_2025, 4960000000.0)
        self.assertEqual(self.params.annual_delivery_target_2026, 870)
        self.assertEqual(self.params.getafe_htp_production_share, 1.0)
        self.assertEqual(self.params.fal_stock_buffer_hours, 60.0)
    def test_platform_cost_calculation(self):
        """Validates exact cost calculation of union demands (12% + 7500€ + Social Security)."""
        cost = self.engine.calculate_cost_of_platform()

        expected_wage_mass = 15562 * 50000.0  # 778.1 M€
        expected_12pct = expected_wage_mass * 0.12  # 93.372 M€
        expected_retroactive = 15562 * 7500.0  # 116.715 M€
        expected_ss_extra = expected_12pct * 0.31  # 28.945 M€
        expected_annual_recurrent = expected_12pct + expected_ss_extra  # 122.317 M€
        expected_first_year_total = expected_annual_recurrent + expected_retroactive  # 239.032 M€

        self.assertAlmostEqual(cost["annual_wage_mass_spain_eur"], expected_wage_mass, delta=1.0)
        self.assertAlmostEqual(cost["cost_12pct_increase_eur"], expected_12pct, delta=1.0)
        self.assertAlmostEqual(cost["cost_one_time_payment_eur"], expected_retroactive, delta=1.0)
        self.assertAlmostEqual(cost["annual_recurrent_consolidated_cost_eur"], expected_annual_recurrent, delta=1.0)
        self.assertAlmostEqual(cost["total_first_year_impact_eur"], expected_first_year_total, delta=1.0)

        # Ensure % of profit is < 5%
        self.assertLess(cost["pct_of_annual_net_profit"], 5.0)
        self.assertGreater(cost["pct_of_annual_net_profit"], 4.0)
    def test_strike_timeline_jit_transition(self):
        """Validates supply chain buffer exhaustion transition from Spanish plant to European FALs."""
        timeline = self.engine.simulate_strike_timeline(days=10)
        self.assertEqual(len(timeline), 10)

        # Day 1 & 2 (24h, 48h) should be buffer consumption phase
        self.assertIn("Consuming stock buffer", timeline[0]["buffer_status"])
        self.assertIn("Consuming stock buffer", timeline[1]["buffer_status"])
        self.assertEqual(timeline[0]["daily_airbus_loss_eur"], 6500000.0)

        # Day 3 (72h) should be throttled buffer phase
        self.assertIn("Buffer exhausted", timeline[2]["buffer_status"])

        # Cumulative losses must be strictly increasing
        for i in range(1, len(timeline)):
            self.assertGreater(timeline[i]["cumulative_airbus_loss_eur"], timeline[i-1]["cumulative_airbus_loss_eur"])
            self.assertGreater(timeline[i]["worker_net_loss_per_person_eur"], timeline[i-1]["worker_net_loss_per_person_eur"])

    def test_full_dataset_export_schema(self):
        """Validates export structure and presence of all key dashboard data sections."""
        data = self.engine.export_full_dataset()

        required_keys = [
            "parameters",
            "platform_cost",
            "strike_timeline_30d",
            "timeline",
            "negotiation_evolution",
            "historical_agreements_and_losses",
            "stock_market_analysis",
            "company_financial_health",
            "benchmarks",
            "telegram_archive"
        ]

        for key in required_keys:
            self.assertIn(key, data, f"Missing required top-level key: {key}")

        self.assertGreaterEqual(len(data["timeline"]), 15)
        self.assertIn("current_gap_analysis", data["negotiation_evolution"])
        self.assertIn("failed_pacts_and_betrayals", data["historical_agreements_and_losses"])

    def test_trade_union_site_breakdown(self):
        """Validates site-by-site trade union representation and 24-J referendum data."""
        union_data = self.engine.get_trade_union_representation()
        self.assertIn("site_breakdown", union_data)
        sites = union_data["site_breakdown"]
        self.assertEqual(len(sites), 7)

        # Total direct factory census across 7 main sites (15,562)
        total_census = sum(s["census"] for s in sites)
        self.assertEqual(total_census, 15562)

        # Total plant committee delegates across 7 main sites (198)
        total_delegates = sum(s["total_delegates"] for s in sites)
        self.assertEqual(total_delegates, 198)

        # Sum by union across all sites must match state-wide delegate count
        union_sums = {"CCOO": 0, "UGT": 0, "ATP": 0, "SIPA": 0, "CGT": 0}
        for s in sites:
            for u, count in s["delegates_by_union"].items():
                union_sums[u] += count

        expected_shares = {"CCOO": 76, "UGT": 36, "ATP": 31, "SIPA": 30, "CGT": 25}
        self.assertEqual(union_sums, expected_shares)

        # Check Getafe specific delegates and referendum
        getafe = next(s for s in sites if s["site_id"] == "getafe")
        self.assertEqual(getafe["total_delegates"], 45)
        self.assertEqual(getafe["delegates_by_union"]["SIPA"], 15)
        self.assertEqual(getafe["delegates_by_union"]["CCOO"], 13)
        self.assertGreater(getafe["referendum_24j"]["no_pct"], 50.0)
    def test_trade_union_delegates_exact_match(self):
        """Validates that total and union delegates across all sites match exactly 198."""
        tu = self.engine.get_trade_union_representation()
        shares = tu["current_shares"]
        sites = tu["site_breakdown"]

        # 1. Total across current_shares
        total_shares = sum(u.get("delegates", 0) for u in shares)
        self.assertEqual(total_shares, 198)

        # 2. Total across sites
        total_sites = sum(s.get("total_delegates", 0) for s in sites)
        self.assertEqual(total_sites, 198)

        # 3. Sum by union across all sites
        union_sums = {}
        for s in sites:
            for u, count in s.get("delegates_by_union", {}).items():
                union_sums[u] = union_sums.get(u, 0) + count

        self.assertEqual(union_sums.get("CCOO"), 76)
        self.assertEqual(union_sums.get("UGT"), 36)
        self.assertEqual(union_sums.get("ATP"), 31)
        self.assertEqual(union_sums.get("SIPA"), 30)
        self.assertEqual(union_sums.get("CGT"), 25)
        self.assertEqual(sum(union_sums.values()), 198)
    def test_company_offer_detailed_breakdown(self):
        """Validates the 5 key negotiation points in company_offer_detailed_breakdown."""
        nego = self.engine.get_negotiation_evolution()
        self.assertIn("company_offer_detailed_breakdown", nego)
        offers = nego["company_offer_detailed_breakdown"]
        self.assertEqual(len(offers), 5)

        point_ids = [o["id"] for o in offers]
        self.assertIn("offer-wages", point_ids)
        self.assertIn("offer-lumpsum", point_ids)
        self.assertIn("offer-telework", point_ids)
        self.assertIn("offer-shifts", point_ids)
        self.assertIn("offer-bromo", point_ids)

        # Validate math calculations exist for point 1
        wages_offer = next(o for o in offers if o["id"] == "offer-wages")
        self.assertIn("math_calculation", wages_offer)
        self.assertIn("salary_base_example", wages_offer["math_calculation"])
        self.assertIn("company_saving_collective", wages_offer["math_calculation"])
        self.assertIn("net_loss_gap_annual", wages_offer["math_calculation"])

    def test_stock_market_analysis_veracity(self):
        """Validates stock market analysis bounds, Euronext URL, and market cap formula."""
        data = self.engine.export_full_dataset()
        stock = data.get("stock_market_analysis", {})
        self.assertTrue(stock.get("current_price_eur", 0) > 0)
        self.assertTrue("euronext.com" in stock.get("source_url", "") or "airbus.com" in stock.get("source_url", ""))
        shares = stock.get("total_shares_outstanding", 0)
        self.assertTrue(790_000_000 <= shares <= 795_000_000)
        calc_mcap = round((stock["current_price_eur"] * shares) / 1_000_000, 1)
        self.assertAlmostEqual(stock["current_market_cap_eur_m"], calc_mcap, delta=10.0)

    def test_audit_data_veracity_runner(self):
        """Runs full audit_data_veracity audit check."""
        from src.audit_data_veracity import audit_conflict_metrics, audit_dashboard_parity
        conflict_path = PROJECT_ROOT / "data" / "conflict_metrics.json"
        data_js_path = PROJECT_ROOT / "dashboard" / "data.js"
        m_ok, m_issues = audit_conflict_metrics(conflict_path)
        self.assertTrue(m_ok, f"Metrics issues: {m_issues}")
        p_ok, p_issues = audit_dashboard_parity(data_js_path, conflict_path)
        self.assertTrue(p_ok, f"Parity issues: {p_issues}")

    def test_comprehensive_invariants_runner(self):
        """Runs full validate_all() from validate_invariants module."""
        from src.validate_invariants import validate_all
        self.assertTrue(validate_all())
if __name__ == "__main__":
    unittest.main()
