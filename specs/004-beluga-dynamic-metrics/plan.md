# Implementation Plan: Dynamic BelugaXL Movement & Component Retention Analytics

**Branch**: `004-beluga-dynamic-metrics` | **Date**: 2026-08-31 | **Spec**: [specs/004-beluga-dynamic-metrics/spec.md](spec.md)

---

## Summary

Refactor the Beluga logistics analytics engine (`src/beluga_tracker.py` and `src/parsers/metric_parser.py`) to eliminate static hardcoded timeline arrays and derive weekly flight frequencies, Getafe HTP component retention counts, FAL buffer hours, and European route distributions dynamically from actual BelugaWatch flight logs and ADS-B event streams. Synchronize results with `data/beluga_status.json`, `data/conflict_metrics.json`, and `dashboard/app.js`.

---

## Technical Context

- **Language/Version**: Python 3.10+ (standard library: `json`, `datetime`, `pathlib`, `typing`, `urllib.request`, `math`)
- **Frontend**: Vanilla JavaScript (ES2022), Chart.js 4.4+, Tailwind CSS (standalone)
- **Data Stores**: Canonical JSON (`data/beluga_status.json`, `data/conflict_metrics.json`, `dashboard/data.js`)
- **Testing**: Python `unittest`, `src/validate_invariants.py`, `src/validate_sources.py`
- **Architecture**: Ingestion Parser ➔ Dynamic Aggregation Engine ➔ Atomic Writer ➔ Client Chart Controller

---

## Constitution & Invariant Compliance

- **Principle I (Mathematical & Invariant Integrity)**: All retention figures derived from explicit formulas:
  $$\text{Retained HTP} = (\text{Baseline Flights} - \text{Actual Flights}) \times \text{HTP Capacity}$$
  $$\text{FAL Buffer Hours} = \max(0, 60.0 - \text{Elapsed Strike Hours})$$
- **Principle III (Dual-Surface Parity)**: Exact alignment between `data/beluga_status.json`, `data/conflict_metrics.json`, and `dashboard/data.js`.
- **Principle V (Zero-Build Frontend)**: Pure browser-native DOM and Chart.js integration without node/npm bundles.

---

## Project Structure & File Changes

```text
src/
├── beluga_tracker.py             # Refactor: Replace static arrays with dynamic aggregation
├── parsers/metric_parser.py     # Refactor: Extract flight logs dynamically
data/
└── beluga_status.json           # Output: Dynamic movements, HTP retention, routes matrix
dashboard/
├── app.js                       # Update: initThermometerAndBeluga() chart renderer
└── data.js                      # Output: Client-synchronized payload
tests/
└── test_beluga_tracker.py       # New: Dedicated tests for dynamic algorithm verification
```

---

## Complexity Tracking

No constitutional violations. Pure standard library implementation with zero external runtime dependencies.
