#!/usr/bin/env python3
"""
tests/test_beluga_tracker.py
============================
Automated unit tests for decoupled Beluga logistics telemetry,
real-time ADS-B radar processing, and zero-synthetic-series invariants.
"""

import json
import unittest
from pathlib import Path

from src.beluga_tracker import BelugaTracker, AIRBUS_SITES, EUROPEAN_ROUTES, PRIMARY_SOURCE_CITATIONS


class TestBelugaTrackerDecoupled(unittest.TestCase):
    """Test decoupled Beluga logistics tracking grounded in live telemetry."""

    def setUp(self):
        self.tracker = BelugaTracker()

    def test_tracker_schema_and_zero_synthetic_data(self):
        """Validates that fetch_live_data adheres to data-model.md and contains zero synthetic series."""
        data = self.tracker.fetch_live_data()
        self.assertIn("source", data)
        self.assertIn("timestamp", data)
        self.assertEqual(data["fleet_count"], 6)
        self.assertIn("tracked_count", data)
        self.assertIn("all_aircraft", data)
        self.assertIn("european_routes", data)
        self.assertIn("blockade_status", data)
        self.assertIn("jit_stress_level", data)
        self.assertIn("primary_source_citations", data)

        # Zero synthetic series invariant
        self.assertNotIn("historical_movements", data)
        self.assertNotIn("dynamic_movement_history", data)
        self.assertNotIn("period_definitions", data)
        self.assertNotIn("getafe_flights_per_week", data)
        self.assertNotIn("accumulated_htp_retained", data)

    def test_calibrated_fallback_model(self):
        """Validates deterministic calibrated fallback when network is unavailable."""
        fallback = self.tracker.get_calibrated_fallback_status()
        self.assertEqual(fallback["fleet_count"], 6)
        self.assertEqual(len(fallback["all_aircraft"]), 6)
        self.assertIn("Bloqueo Activo", fallback["blockade_status"])
        self.assertEqual(len(fallback["european_routes"]), 5)
        self.assertGreaterEqual(len(fallback["primary_source_citations"]), 1)

    def test_analyze_fleet_status_getafe_detection(self):
        """Validates detection of Getafe flights vs European routes."""
        sample_raw = {
            "generatedAt": "2026-09-01T12:00:00Z",
            "fleetCount": 6,
            "liveCount": 2,
            "aircraft": [
                {
                    "id": "BXL-01",
                    "name": "BelugaXL 1",
                    "registration": "F-GXLG",
                    "callsign": "BGA111",
                    "airborne": True,
                    "currentSite": "Getafe",
                    "routeFrom": "Getafe",
                    "routeTo": "Toulouse",
                    "locationLabel": "Departing Getafe"
                },
                {
                    "id": "BXL-02",
                    "name": "BelugaXL 2",
                    "registration": "F-GXLH",
                    "callsign": "BGA222",
                    "airborne": True,
                    "currentSite": "Broughton",
                    "routeFrom": "Broughton",
                    "routeTo": "Bremen",
                    "locationLabel": "En route Bremen"
                }
            ]
        }
        analyzed = self.tracker.analyze_fleet_status(sample_raw)
        self.assertEqual(len(analyzed["getafe_connected_aircraft"]), 1)
        self.assertEqual(analyzed["getafe_connected_aircraft"][0]["registration"], "F-GXLG")
        self.assertEqual(len(analyzed["other_airborne_aircraft"]), 1)
        self.assertEqual(analyzed["other_airborne_aircraft"][0]["registration"], "F-GXLH")
        self.assertIn("Alerta de Vuelo", analyzed["blockade_status"])

    def test_primary_source_citations_grounding(self):
        """Validates primary source citation linking for supply chain claims."""
        citations = PRIMARY_SOURCE_CITATIONS
        self.assertTrue(any("sources/721c0baa.txt" in c["id"] for c in citations))
        for c in citations:
            self.assertIn("verbatim_excerpt", c)
            self.assertIn("relevance", c)
            self.assertIn("title", c)


if __name__ == "__main__":
    unittest.main()
