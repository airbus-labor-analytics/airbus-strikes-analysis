# Tasks: Beluga Fleet Recent Flight Movements Log

**Input**: Design documents from `specs/015-beluga-last-movements/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Dependencies & Implementation Strategy

```
Phase 1: Setup ────► Phase 2: Foundational Backend
                          │
                          ▼
               Phase 3: User Story 1 (P1: Chronological Movements Feed) [MVP]
                          │
                          ▼
               Phase 4: User Story 2 (P2: Interactive Tail Filtering)
                          │
                          ▼
               Phase 5: User Story 3 (P3: Live Polling & Fallback Integrity)
                          │
                          ▼
               Phase 6: Polish & Verification
```

---

## Phase 1: Setup & Data Model Preparation

- [ ] T001 Define `BelugaMovement` schema and initialize `recent_movements` in `data/beluga_status.json` per `data-model.md`
- [ ] T002 [P] Verify data parsing and validation of `recent_movements` in `src/parsers/metric_parser.py`

---

## Phase 2: Foundational Backend Architecture

- [ ] T003 Implement `get_recent_movements()` and integrate `recent_movements` generation in `BelugaTracker` in `src/beluga_tracker.py`
- [ ] T004 [P] Update calibrated fallback model `get_calibrated_fallback_status()` in `src/beluga_tracker.py` with verified recent flight legs

---

## Phase 3: User Story 1 (P1) - Chronological Feed of Recent Flight Movements [MVP]

**Goal**: Render an authenticated, chronologically ordered log of recent BelugaXL flight legs across European factory corridors with clear Getafe embargo alert badges.  
**Independent Test**: Navigate to Module 2 (`#tab-industrial`) in `dashboard/index.html` and verify that the Recent Movements section (`#beluga-movements-container`) displays verified flight legs sorted newest first.

- [ ] T005 [US1] Add `#sec-industrial-movements` container and `#beluga-movements-container` in `dashboard/index.html` within `#tab-industrial`
- [ ] T006 [US1] Implement `renderBelugaMovements()` in `dashboard/app.js` to render flight leg items (airframe, callsign, route, status, component payload)
- [ ] T007 [US1] Wire `renderBelugaMovements()` into `initBelugaLogistics()` in `dashboard/app.js`

---

## Phase 4: User Story 2 (P2) - Interactive Tail & Corridor Filtering

**Goal**: Allow factory delegates and analysts to filter the recent movements feed by specific airframe (`ALL`, `XL1`..`XL6`) or corridor in synchrony with fleet cards.  
**Independent Test**: Click any tail button in `#beluga-tail-filters` (e.g. `XL3 (F-GXLI)`) and verify that the movements feed immediately filters to show only legs flown by that airframe.

- [ ] T008 [US2] Update `setBelugaTailFilter()` in `dashboard/app.js` to synchronously re-filter both `#beluga-fleet-grid` and `#beluga-movements-container`
- [ ] T009 [P] [US2] Implement empty-state feedback in `renderBelugaMovements()` in `dashboard/app.js` when an inactive aircraft has 0 matching movements

---

## Phase 5: User Story 3 (P3) - Live Background Polling & Calibrated Offline Fallback

**Goal**: Guarantee seamless live updating of flight movements during 30s background polling cycles and ensure 100% resilient rendering when offline.  
**Independent Test**: Disconnect network access and verify that the movements feed loads calibrated offline flight legs with zero console errors.

- [ ] T010 [US3] Ensure `startBelugaLivePolling()` in `dashboard/app.js` dynamically updates `#beluga-movements-container` without DOM flickering
- [ ] T011 [P] [US3] Verify offline fallback compatibility in `dashboard/data.js` and `src/analysis_engine.py`

---

## Phase 6: Polish & Verification

- [ ] T012 Add unit tests for `recent_movements` schema, sorting, and airframe registry in `tests/test_beluga_tracker.py`
- [ ] T013 Update UI integration tests in `tests/test_dashboard_ui.py` for `#beluga-movements-container` and tail filtering interactivity
- [ ] T014 Run complete validation suite (`python3 src/validate_invariants.py`, `python3 src/validate_sources.py`, `python3 -m unittest discover tests/`)
