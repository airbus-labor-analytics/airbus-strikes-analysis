# Quickstart & Verification Guide: Universal Dynamic Data Synchronization & Chart Resilience Engine

**Feature**: [specs/007-dynamic-data-and-charts-resilience/spec.md](spec.md)
**Date**: 2026-08-31

## 1. Prerequisites
- Python 3.10+
- Modern Web Browser (or local headless test harness)
- Standard repository dependencies

## 2. Verification Scenarios

### Scenario 1: Dynamic Date & Strike Cost Calculation
1. Open the dashboard or inspect via headless browser.
2. Verify that conflict elapsed days matches `(Date.now() - 2026-07-20) / 86400000`.
3. Verify that total strike cost in `tab-overview` matches `elapsed_days * 22.7 M€/day`.

```bash
python3 -c "import unittest; from tests.test_dashboard_ui import TestDashboardUI; suite = unittest.TestLoader().loadTestsFromTestCase(TestDashboardUI); unittest.TextTestRunner().run(suite)"
```

### Scenario 2: Chart.js Canvas Teardown & Collision Resilience
1. Navigate between `#portal`, `#financiero`, `#logistica`, `#salarios`, `#sindical`, and `#evidencias` in rapid succession.
2. Confirm zero "Canvas is already in use" errors in console.
3. Confirm all 12 charts instantiate cleanly.

```bash
python3 -m unittest discover tests
```

### Scenario 3: Mathematical Invariant Rule Checks
Run the full invariant and citation validation suite:

```bash
python3 src/validate_invariants.py
python3 src/validate_sources.py
```

Expected result: 100% PASS on all invariant rules (1–14) and 0 unclosed/mismatched HTML tags.
