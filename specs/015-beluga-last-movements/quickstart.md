# Quickstart & Validation Guide: Beluga Fleet Recent Movements Log

**Feature**: `015-beluga-last-movements`  
**Date**: 2026-09-01  
**Status**: Ready  

---

## 1. Prerequisites

Ensure Python 3.10+ and Node.js are available.

```bash
python3 --version
```

---

## 2. Standalone Data Fetch & Export

Test fetching and exporting recent Beluga movements:

```bash
# Fetch and update data/beluga_status.json
python3 src/beluga_tracker.py --update

# Verify that recent_movements exists and is non-empty
python3 -c "import json; data=json.load(open('data/beluga_status.json')); assert len(data.get('recent_movements', [])) > 0, 'Missing movements'; print('Movements count:', len(data['recent_movements']))"
```

---

## 3. Invariant & Source Consistency Validation

Run the full integrity suite:

```bash
# Re-generate consolidated datasets
python3 src/analysis_engine.py

# Run invariant validator
python3 src/validate_invariants.py

# Run DOM and sources validator
python3 src/validate_sources.py
```

---

## 4. Automated Tests

Execute the unit and UI test suite:

```bash
python3 -m unittest discover tests/
```

---

## 5. Acceptance Verification Checklist

- [ ] `data/beluga_status.json` contains a structured `recent_movements` array with valid flight legs.
- [ ] `#beluga-movements-container` is present in `dashboard/index.html` within `#sec-industrial-movements`.
- [ ] Filtering by tail in `dashboard/app.js` updates both `#beluga-fleet-grid` and `#beluga-movements-container`.
- [ ] All 14 invariant rules pass with 100% mathematical consistency.
- [ ] DOM structure passes HTML parser with 0 unclosed elements.
