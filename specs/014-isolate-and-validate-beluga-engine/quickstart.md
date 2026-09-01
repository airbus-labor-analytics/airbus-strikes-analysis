# Quickstart & Validation Guide: Beluga Logistics Engine Decoupling

**Feature**: `014-isolate-and-validate-beluga-engine`  
**Date**: 2026-09-01  
**Status**: Ready  

---

## 1. Prerequisites

Ensure Python 3.10+ and Node.js are available:

```bash
python3 --version
node --version
```

---

## 2. Standalone Beluga Logistics Execution

Verify that the Beluga tracker executes autonomously without running news scraping or sentiment evaluation:

```bash
# 1. Fetch live telemetry or calibrated fallback and print JSON
python3 src/beluga_tracker.py --json

# 2. Update data/beluga_status.json artifact directly
python3 src/beluga_tracker.py --update
```

**Verification Criteria**:
- Exit code is `0`.
- Output JSON matches `BelugaFleetStatus` schema from `data-model.md`.
- `data/beluga_status.json` contains exactly 6 BelugaXL aircraft.
- Zero synthetic `period_definitions` or `accumulated_htp` weekly arrays are present.

---

## 3. End-to-End Analysis Engine Ingestion

Verify that the main analysis engine integrates the decoupled Beluga tracker cleanly:

```bash
python3 src/analysis_engine.py
```

**Verification Criteria**:
- `data/conflict_metrics.json` and `dashboard/data.js` are updated.
- `beluga_logistics` payload is embedded without errors.

---

## 4. Invariant, Quality, and Syntax Validation

Run the full invariant and test validation suite:

```bash
# 1. Validate JavaScript syntax
node -c dashboard/app.js && node -c dashboard/data.js

# 2. Run source citation & DOM validation gate
python3 src/validate_sources.py

# 3. Run mathematical and invariant validation suite
python3 src/validate_invariants.py

# 4. Run automated unit and UI test suite
python3 -m unittest discover -s tests
```

**Expected Outcome**:
- All 14 invariant rules pass with 100% mathematical consistency.
- UI tests pass with 0 unclosed HTML tags and confirmed removal of `#belugaHistoryChart`.
- All unit tests in `tests/test_analysis_engine.py` and `tests/test_dashboard_ui.py` pass.
