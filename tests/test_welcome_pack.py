#!/usr/bin/env python3
"""
Unit tests for Welcome Pack data, generation, and invariants.
Feature: 017-conflict-welcome-pack
"""

import json
import os
import unittest
from pathlib import Path
from zoneinfo import ZoneInfo
from datetime import datetime

REPO_ROOT = Path(__file__).resolve().parent.parent


class TestWelcomePack(unittest.TestCase):
    """Test suite for Welcome Pack consistency, generation, and fresh data."""

    @classmethod
    def setUpClass(cls):
        cls.metrics_path = REPO_ROOT / "data" / "conflict_metrics.json"
        with open(cls.metrics_path, "r", encoding="utf-8") as f:
            cls.metrics = json.load(f)

    def test_welcome_pack_structure_present(self):
        """Verify welcome_pack key exists with mandatory subfields."""
        self.assertIn("welcome_pack", self.metrics, "data/conflict_metrics.json must contain 'welcome_pack'")
        wp = self.metrics["welcome_pack"]
        self.assertIn("last_updated", wp)
        self.assertIn("last_updated_display", wp)
        self.assertIn("strike_day", wp)
        self.assertIn("executive_summary", wp)
        self.assertIn("chronology_phases", wp)

    def test_economic_data_integrity(self):
        """Verify economic breakdown numbers align with financial asymmetry and purchasing power loss."""
        wp = self.metrics["welcome_pack"]
        eco = wp["executive_summary"]["economic_breakdown"]
        self.assertEqual(eco["loss_range_pct"], "20,9% - 24,4%")
        self.assertEqual(eco["net_loss_eur"], 26030)
        self.assertGreaterEqual(eco["inflation_general_pct"], 19.0)
        self.assertGreaterEqual(eco["inflation_food_pct"], 30.0)
        self.assertGreaterEqual(eco["airbus_profit_2025_meur"], 4960)

    def test_chronology_phases_count_and_content(self):
        """Verify 3 distinct chronology phases exist and milestones are mapped."""
        wp = self.metrics["welcome_pack"]
        phases = wp["chronology_phases"]
        self.assertEqual(len(phases), 3, "Must have exactly 3 chronological phases")
        
        phase_ids = [p["phase_id"] for p in phases]
        self.assertIn("phase_1_gestation", phase_ids)
        self.assertIn("phase_2_escalation", phase_ids)
        self.assertIn("phase_3_indefinite_strike", phase_ids)

        for p in phases:
            self.assertTrue(len(p["milestone_ids"]) > 0, f"Phase {p['phase_id']} must have milestone_ids")
            self.assertTrue(p["phase_title"])
            self.assertTrue(p["description"])

    def test_primary_quotes_sources_exist(self):
        """Verify all primary quotes link to real existing files."""
        wp = self.metrics["welcome_pack"]
        quotes = wp["executive_summary"]["core_quotes"]
        self.assertTrue(len(quotes) >= 3, "Must have at least 3 core verified quotes")
        for q in quotes:
            ref_path = REPO_ROOT / q["file_ref"]
            self.assertTrue(ref_path.exists(), f"Primary quote file does not exist: {q['file_ref']}")

    def test_temporal_freshness_stamp(self):
        """Verify last_updated is 2026-09-02 and strike_day is 9 in Europe/Madrid."""
        wp = self.metrics["welcome_pack"]
        self.assertEqual(wp["last_updated"], "2026-09-02")
        self.assertEqual(wp["strike_day"], 9)
        self.assertIn("2 de septiembre de 2026", wp["last_updated_display"])
    def test_generator_produces_valid_markdown_dossier(self):
        """Verify src/generate_welcome_pack.py produces a comprehensive markdown document."""
        from src.generate_welcome_pack import generate_welcome_pack_markdown
        dossier_path = REPO_ROOT / "docs" / "Welcome_Pack_Conflicto_Airbus_2026.md"
        content = generate_welcome_pack_markdown(dossier_path)
        self.assertTrue(dossier_path.exists())
        self.assertIn("# Welcome Pack al Conflicto", content)
        self.assertIn("Día 9 de Huelga General Indefinida", content)
        self.assertIn("Fase 1: Antecedentes y Gestación", content)
        self.assertIn("Fase 2: Escalada y Democracia Directa", content)
        self.assertIn("Fase 3: Huelga General Indefinida en Curso", content)
        self.assertIn("La Plataforma de 11 Puntos del Comité de Huelga", content)
        self.assertGreater(len(content), 2000)



if __name__ == "__main__":
    unittest.main()
