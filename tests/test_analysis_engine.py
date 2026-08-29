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
        self.assertEqual(self.params.total_workers_spain, 14000)
        self.assertEqual(self.params.total_workforce_including_contractors, 15562)
        self.assertEqual(self.params.avg_annual_salary, 50000.0)
        self.assertEqual(self.params.airbus_se_net_profit_2025, 4960000000.0)
        self.assertEqual(self.params.annual_delivery_target_2026, 870)
        self.assertEqual(self.params.getafe_htp_production_share, 1.0)
        self.assertEqual(self.params.fal_stock_buffer_hours, 60.0)

    def test_platform_cost_calculation(self):
        """Validates exact cost calculation of union demands (12% + 7500€ + Social Security)."""
        cost = self.engine.calculate_cost_of_platform()

        expected_wage_mass = 14000 * 50000.0  # 700 M€
        expected_12pct = expected_wage_mass * 0.12  # 84 M€
        expected_retroactive = 14000 * 7500.0  # 105 M€
        expected_ss_extra = expected_12pct * 0.31  # 26.04 M€
        expected_annual_recurrent = expected_12pct + expected_ss_extra  # 110.04 M€
        expected_first_year_total = expected_annual_recurrent + expected_retroactive  # 215.04 M€

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


if __name__ == "__main__":
    unittest.main()
