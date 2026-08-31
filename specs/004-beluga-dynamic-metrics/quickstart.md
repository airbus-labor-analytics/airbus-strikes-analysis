# Quickstart & Verification Guide: Dynamic Beluga Logistics

**Feature**: [specs/004-beluga-dynamic-metrics/spec.md](spec.md)
**Date**: 2026-08-31

---

## 1. Execution & Testing

1. Run the dynamic logistics tracker:
   ```bash
   python3 src/beluga_tracker.py --update
   ```
2. Verify contract and schema compliance:
   ```bash
   python3 -c "import json; data=json.load(open('data/beluga_status.json')); assert len(data['dynamic_movement_history']) >= 5"
   ```
3. Run automated invariant tests:
   ```bash
   python3 src/validate_invariants.py
   ```
4. Run full unit test suite:
   ```bash
   python3 -m unittest discover tests
   ```

---

## 2. Acceptance Scenarios

| Scenario | Input | Expected Output | Status |
|---|---|---|:---:|
| Dynamic Movement Extraction | `data/beluga_status.json` | Calculated weekly buckets without static arrays | Ready |
| HTP Retention Formula | W34 (0 flights completed) | Accumulated retention = 28 HTP shipsets | Ready |
| FAL Buffer Depletion | Strike Day 4 (96h elapsed) | Buffer hours = 0.0h (100% depleted) | Ready |
| Client UI Parity | `dashboard/app.js` | `belugaHistoryChart` renders dynamic series | Ready |
