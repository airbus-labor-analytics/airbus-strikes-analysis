# Quickstart Validation Guide: Dashboard UI/UX Simplification

**Feature Branch**: `003-simplify-dashboard`
**Date**: 2026-08-31

---

## 1. Prerequisites
- Python 3.10+
- Modern Web Browser (Chromium / Firefox)

---

## 2. Validation Scenarios

### Scenario 1: Source & Structure Validation
```bash
# Verify all HTML source links, 5 navigation tabs, and 12 Chart.js canvases
python3 src/validate_sources.py
```
**Expected Outcome**:
- `Found 5 tabs in dashboard`
- `Found 12 Chart.js canvases`
- `[ALL CHECKS PASSED]`

### Scenario 2: Numerical Invariant & Veracity Verification
```bash
# Verify zero unverified data across backend and dashboard
python3 src/audit_data_veracity.py
python3 src/validate_invariants.py
python3 -m unittest discover tests
```
**Expected Outcome**:
- All 14 invariant rules pass.
- 0 mathematical or data drift issues detected.

### Scenario 3: Visual & Browser Navigation Smoke Test
```bash
# Open dashboard/index.html in browser or local static server
python3 -m http.server 8080 --directory dashboard &
# Verify the 5 tabs switch cleanly without console errors
```
