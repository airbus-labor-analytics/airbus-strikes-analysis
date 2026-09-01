#!/usr/bin/env python3
"""
Unit and Integration Tests for Daily Timeline Freshness Validator and Factory Assembly Minutes.
Validates:
- Europe/Madrid timezone conversion & date parsing
- Freshness threshold calculation (UP_TO_DATE, PENDING_TODAY, STALE_ALERT, WEEKEND_PAUSE)
- Chronological monotonicity and schema validation
- Primary source document linking for factory assembly minutes
"""

import json
import unittest
from datetime import datetime, date, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

PROJECT_ROOT = Path(__file__).resolve().parent.parent

import sys
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.validate_timeline_freshness import (
    get_madrid_now,
    parse_milestone_date,
    evaluate_timeline_freshness,
    validate_timeline_integrity
)

class TestTimelineFreshnessSuite(unittest.TestCase):
    def setUp(self):
        self.metrics_path = PROJECT_ROOT / "data" / "conflict_metrics.json"
        self.telegram_index_path = PROJECT_ROOT / "data" / "telegram_archive" / "telegram_index.json"
        self.contract_path = PROJECT_ROOT / "specs" / "016-daily-timeline-assembly-validator" / "contracts" / "timeline_freshness_contract.json"
        self.madrid_tz = ZoneInfo("Europe/Madrid")

    def test_schema_contract_exists_and_loads(self):
        """Validates that the freshness schema contract exists and is valid JSON."""
        self.assertTrue(self.contract_path.exists(), f"Contract file not found at {self.contract_path}")
        with open(self.contract_path, "r", encoding="utf-8") as f:
            contract = json.load(f)
        self.assertEqual(contract["title"], "TimelineFreshnessReport")
        self.assertIn("status_code", contract["properties"])

    def test_timezone_conversion_and_madrid_offset(self):
        """Validates that Madrid timezone is correctly resolved with UTC offset."""
        now_madrid = get_madrid_now()
        self.assertEqual(now_madrid.tzinfo.key, "Europe/Madrid")
        # In summer (CEST), offset is UTC+2 (7200 seconds)
        offset = now_madrid.utcoffset()
        self.assertIn(offset, [timedelta(hours=1), timedelta(hours=2)])

    def test_date_parsing_various_formats(self):
        """Tests parsing of ISO dates, Spanish localized strings, (HOY) tags, and ranges."""
        self.assertEqual(parse_milestone_date("2026-09-01"), date(2026, 9, 1))
        self.assertEqual(parse_milestone_date("1 de septiembre de 2026"), date(2026, 9, 1))
        self.assertEqual(parse_milestone_date("29 de agosto de 2026 (HOY)"), date(2026, 8, 29))
        self.assertEqual(parse_milestone_date("24 de agosto"), date(2026, 8, 24))
        self.assertEqual(parse_milestone_date("2021 – 2025"), date(2021, 1, 1))
        self.assertEqual(parse_milestone_date("2021-2025"), date(2021, 1, 1))
        self.assertIsNone(parse_milestone_date("invalid-date-string"))
        self.assertIsNone(parse_milestone_date(""))

    def test_freshness_status_evaluation_states(self):
        """Validates status code transitions: UP_TO_DATE, PENDING_TODAY, STALE_ALERT, WEEKEND_PAUSE."""
        ref_tuesday = date(2026, 9, 1)  # Tuesday (weekday=1)
        ref_sunday = date(2026, 8, 30)   # Sunday (weekday=6)
        
        # 1. UP_TO_DATE (same day)
        tl_today = [{"id": "m1", "date": "2026-09-01", "title": "Hoy"}]
        res_today = evaluate_timeline_freshness(tl_today, ref_tuesday)
        self.assertEqual(res_today["status_code"], "UP_TO_DATE")
        self.assertEqual(res_today["badge_color"], "emerald")
        self.assertFalse(res_today["action_required"])

        # 2. PENDING_TODAY (1 day gap on Tuesday)
        tl_yesterday = [{"id": "m1", "date": "2026-08-31", "title": "Ayer"}]
        res_yesterday = evaluate_timeline_freshness(tl_yesterday, ref_tuesday)
        self.assertEqual(res_yesterday["status_code"], "PENDING_TODAY")
        self.assertEqual(res_yesterday["badge_color"], "amber")
        self.assertTrue(res_yesterday["action_required"])

        # 3. WEEKEND_PAUSE (1-2 day gap on Sunday)
        tl_friday = [{"id": "m1", "date": "2026-08-28", "title": "Viernes"}]
        res_weekend = evaluate_timeline_freshness(tl_friday, ref_sunday)
        self.assertEqual(res_weekend["status_code"], "WEEKEND_PAUSE")
        self.assertEqual(res_weekend["badge_color"], "sky")
        self.assertFalse(res_weekend["action_required"])

        # 4. STALE_ALERT (3+ days gap on working day)
        tl_stale = [{"id": "m1", "date": "2026-08-27", "title": "Hace 5 dias"}]
        res_stale = evaluate_timeline_freshness(tl_stale, ref_tuesday)
        self.assertEqual(res_stale["status_code"], "STALE_ALERT")
        self.assertEqual(res_stale["badge_color"], "rose")
        self.assertTrue(res_stale["action_required"])

    def test_timeline_integrity_and_monotonicity_rules(self):
        """Validates that valid timelines pass integrity check and non-monotonic ones fail."""
        valid_descending = [
            {"id": "m3", "date": "2026-09-01", "title": "3"},
            {"id": "m2", "date": "2026-08-31", "title": "2"},
            {"id": "m1", "date": "2026-08-30", "title": "1"}
        ]
        is_val, errs = validate_timeline_integrity(valid_descending)
        self.assertTrue(is_val)
        self.assertEqual(len(errs), 0)

        non_monotonic = [
            {"id": "m1", "date": "2026-08-30", "title": "1"},
            {"id": "m3", "date": "2026-09-01", "title": "3"},
            {"id": "m2", "date": "2026-08-31", "title": "2"}
        ]
        is_val_bad, errs_bad = validate_timeline_integrity(non_monotonic)
        self.assertFalse(is_val_bad)
        self.assertTrue(any("monotonically" in e for e in errs_bad))

    def test_live_conflict_metrics_timeline_completeness(self):
        """Validates that real data/conflict_metrics.json satisfies Rule 15 and has linked assembly documents."""
        with open(self.metrics_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        timeline = data.get("timeline", [])
        self.assertGreaterEqual(len(timeline), 20)
        
        is_val, errs = validate_timeline_integrity(timeline)
        self.assertTrue(is_val, f"Integrity errors in live timeline: {errs}")
        
        # Verify that assembly documents linked in timeline exist on disk
        linked_docs = [m for m in timeline if m.get("source_url") and m["source_url"].startswith("data/")]
        self.assertGreater(len(linked_docs), 5)
        for m in linked_docs:
            doc_file = PROJECT_ROOT / m["source_url"]
            self.assertTrue(doc_file.exists(), f"Missing linked document file: {doc_file}")
            self.assertGreater(doc_file.stat().st_size, 0)

if __name__ == "__main__":
    unittest.main()
