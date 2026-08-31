---
description: "Task list for Dynamic BelugaXL Movement & Component Retention Analytics"
---

# Tasks: Dynamic BelugaXL Movement & Component Retention Analytics

**Input**: Design documents from `/specs/004-beluga-dynamic-metrics/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story identifier ([US1], [US2], [US3])
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Set up contract validation and data model scaffolding.

- [X] T001 [P] Validate beluga logistics JSON schema contract in `specs/004-beluga-dynamic-metrics/contracts/beluga-logistics-contract.json`
- [X] T002 [P] Initialize dynamic movement structures in `src/parsers/metric_parser.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extract raw flight logs and establish dynamic aggregation utilities.

**⚠️ CRITICAL**: Must complete before user story implementation begins.

- [X] T003 [P] Implement raw flight history parsing and origin/destination filtering in `src/parsers/metric_parser.py`
- [X] T004 Build ISO weekly chronological window bucketer in `src/beluga_tracker.py`

**Checkpoint**: Foundational flight log processing operational.

---

## Phase 3: User Story 1 - Dynamic Movement & Retention Derivation (Priority: P1) 🎯 MVP

**Goal**: Dynamically compute weekly flight frequencies, Getafe HTP retention counts, and FAL buffer exhaustion rates from flight logs.

**Independent Test**: Run `python3 src/beluga_tracker.py --update` and verify that `dynamic_movement_history`, `accumulated_htp_retained_total`, and `current_fal_buffer_hours` are calculated algorithmically without static hardcoded arrays.

### Implementation for User Story 1

- [X] T005 [P] [US1] Implement dynamic Getafe flight frequency and cancellation derivation in `src/beluga_tracker.py`
- [X] T006 [P] [US1] Implement accumulated HTP component retention formula in `src/beluga_tracker.py`
- [X] T007 [US1] Implement FAL stock buffer depletion calculation (60h baseline minus elapsed hours) in `src/beluga_tracker.py`
- [X] T008 [US1] Create unit tests for dynamic movement and retention formulas in `tests/test_beluga_tracker.py`

**Checkpoint**: User Story 1 (MVP) complete — dynamic logistics calculations verified.

---

## Phase 4: User Story 2 - Real-Time Dashboard Synchronization & Chart Interactivity (Priority: P2)

**Goal**: Render the dynamic Beluga movement history and component retention curves in the client dashboard with responsive tooltips.

**Independent Test**: Open `dashboard/index.html`, navigate to `#logistica`, and verify that `belugaHistoryChart` and `#beluga-routes-grid` render the dynamically computed series.

### Implementation for User Story 2

- [X] T009 [P] [US2] Update `dashboard/app.js` `initThermometerAndBeluga()` to consume dynamic movement series
- [X] T010 [P] [US2] Update European routes matrix card generation in `dashboard/app.js` from dynamic aggregated routes
- [X] T011 [US2] Add DOM & Chart.js rendering tests for Beluga logistics in `tests/test_dashboard_ui.py`

**Checkpoint**: User Stories 1 AND 2 complete — UI visualizes real-time dynamic logistics data.

---

## Phase 5: User Story 3 - Invariant Verification & Multi-Surface Data Consistency (Priority: P3)

**Goal**: Synchronize dynamic logistics metrics across `data/beluga_status.json`, `data/conflict_metrics.json`, and `dashboard/data.js` with zero data drift.

**Independent Test**: Run `python3 src/validate_invariants.py` and verify that Rules 1–14 pass with full mathematical consistency.

### Implementation for User Story 3

- [X] T012 [P] [US3] Update `src/analysis_engine.py` to synchronize dynamic Beluga logistics metrics
- [X] T013 [US3] Synchronize `data/beluga_status.json`, `data/conflict_metrics.json`, and `dashboard/data.js` via atomic write
- [X] T014 [US3] Add automated invariant checks for Beluga throughput bounds in `src/validate_invariants.py`

**Checkpoint**: All 3 user stories complete with verified multi-surface parity.

---

## Phase 6: Polish & Verification

**Purpose**: End-to-end regression validation and full test suite execution.

- [X] T015 [P] Run `python3 src/validate_sources.py`
- [X] T016 [P] Run `python3 src/validate_invariants.py`
- [X] T017 Run complete test suite (`python3 -m unittest discover tests`)

---

## Dependencies & Execution Order

```text
Phase 1: Setup (T001, T002)
    │
    ▼
Phase 2: Foundational (T003, T004)
    │
    ▼
Phase 3: User Story 1 - Dynamic Logistics Derivation (T005–T008) [MVP]
    │
    ├──► Phase 4: User Story 2 - Real-Time Dashboard Sync (T009–T011)
    │
    └──► Phase 5: User Story 3 - Invariant Verification (T012–T014)
              │
              ▼
Phase 6: Polish & Verification (T015, T016, T017)
```

### Parallel Opportunities

- **Setup**: T001 and T002 can run in parallel.
- **User Story 1**: T005 and T006 can run concurrently.
- **User Story 2**: T009 and T010 can run concurrently.
- **Polish**: T015 and T016 can run concurrently.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 (Setup) and Phase 2 (Foundational Parser).
2. Complete Phase 3 (Dynamic Logistics Derivation).
3. **STOP & VALIDATE**: Run `python3 src/beluga_tracker.py --update`.

### Incremental Delivery
1. Phase 1 + 2: Scaffolding and flight log parser.
2. Phase 3: Dynamic movement & HTP retention engine (MVP).
3. Phase 4: Client dashboard chart integration.
4. Phase 5: Multi-surface dataset synchronization.
5. Phase 6: Invariant verification and unit test suite.
