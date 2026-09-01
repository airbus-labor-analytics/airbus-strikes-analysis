# Implementation Plan: Beluga Fleet Recent Flight Movements Log

**Branch**: `015-beluga-last-movements` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/015-beluga-last-movements/spec.md`

---

## Summary

Adds an authenticated chronological log of recent BelugaXL flight legs and transport movements across European manufacturing sites (`LEGT`, `LFBO`, `EDHI`, `EGNR`, `LFRZ`, `EDDW`). Integrates into Module 2 (*Impacto Industrial & Logística*), synchronizes reactively with airframe tail filters (`ALL`, `XL1`..`XL6`), and adheres strictly to the *Zero Unverified Data* principle with 100% offline fallback compatibility.

---

## Technical Context

- **Language/Version**: Python 3.10+ (standard library only for backend) & JavaScript (ES6+ vanilla for dashboard).
- **Primary Dependencies**: Chart.js 4.x, Tailwind CSS, Lucide icons (already embedded).
- **Project Structure**:
  - Backend: `src/beluga_tracker.py`, `src/analysis_engine.py`, `src/parsers/metric_parser.py`
  - Data: `data/beluga_status.json`, `data/conflict_metrics.json`, `dashboard/data.js`
  - Frontend: `dashboard/index.html`, `dashboard/app.js`
  - Tests: `tests/test_beluga_tracker.py`, `tests/test_analysis_engine.py`, `tests/test_dashboard_ui.py`

---

## Constitution Check

| Gate | Principle | Status | Evaluation |
|------|-----------|--------|------------|
| **Gate I** | Mathematical Integrity | ✅ PASS | All flight leg timestamps, airport codes, and counts maintain exact balance. |
| **Gate II** | Primary Source Grounding | ✅ PASS | Getafe blockade status and European routes grounded in verified assembly minutes and ADS-B logs. |
| **Gate III** | Dynamic Reactivity | ✅ PASS | Synchronizes with live 30s background polling and tail filter button selections. |
| **Gate IV** | Transparent Scenarios | ✅ PASS | Displays clear status badges (`Completado`, `En Vuelo`, `Bloqueo Getafe / Veto HTP`). |
| **Gate V** | Zero Unverified Data | ✅ PASS | Zero synthetic weekly curves; only real, timestamped flight legs. |
| **Gate VI** | Zero-Glitch Mobile & AMO | ✅ PASS | Fully responsive Tailwind layout with AMOLED black styling and `<25ms` rendering. |

---

## Implementation Phases

### Phase 1: Backend Data Model & Extraction (`src/beluga_tracker.py`)
- Implement `get_recent_movements()` in `BelugaTracker`.
- Incorporate `recent_movements` in `analyze_fleet_status()` and `get_calibrated_fallback_status()`.
- Ensure `--update` exports `recent_movements` to `data/beluga_status.json`.

### Phase 2: Dashboard UI & Client Engine (`dashboard/index.html`, `dashboard/app.js`)
- Add `#sec-industrial-movements` container in `dashboard/index.html` under Module 2.
- Implement `renderBelugaMovements(beluga)` in `dashboard/app.js`.
- Update `setBelugaTailFilter(tail)` to filter both fleet cards and the movements log.
- Wire `renderBelugaMovements` into `initBelugaLogistics()`.

### Phase 3: Validation & Tests
- Add unit tests in `tests/test_beluga_tracker.py` asserting `recent_movements` schema and ordering.
- Add UI assertions in `tests/test_dashboard_ui.py` for `#beluga-movements-container` and filter interactivity.
- Run complete validation suite (`validate_invariants.py`, `validate_sources.py`, `unittest`).
