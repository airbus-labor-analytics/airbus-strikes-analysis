# Quickstart Validation Guide: Platform-Wide Data Audit & Verification

**Feature Branch**: `002-verify-stock-data`  
**Date**: 2026-08-31  

---

## 1. Prerequisites

- Python 3.10+
- Standard repository workspace with `data/` and `src/` modules

---

## 2. Validation Steps

### Step 1: Run Full Mathematical & Stock Invariant Suite
Verify all 14 invariant rules and financial asymmetry calculations:
```bash
python3 src/validate_invariants.py
```
*Expected Outcome*: `[ALL INVARIANTS PASSED] 100% mathematical, electoral, financial, and factual consistency achieved across the entire dataset.` (Exit code 0).

### Step 2: Validate Primary Source Citations & URLs
Verify that every metric, table, and chart is grounded in official primary source links:
```bash
python3 src/validate_sources.py
```
*Expected Outcome*: `[ALL CHECKS PASSED] Every section, table, chart, and metric is backed by verified primary source links.` (Exit code 0).

### Step 3: Run Full Automated Test Suite
Execute unit and regression tests:
```bash
python3 -m unittest discover tests
```
*Expected Outcome*: All test cases pass with `OK`.

### Step 4: Verify Dashboard & Static Parity
Re-generate analytical engines and check static dataset parity:
```bash
python3 src/analysis_engine.py
```
*Expected Outcome*: `data/conflict_metrics.json` and `dashboard/data.js` updated with zero drift.
