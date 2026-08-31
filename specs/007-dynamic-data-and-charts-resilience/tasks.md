---
description: "Task list for Universal Dynamic Data Synchronization & Chart Resilience Engine"
---

# Tasks: Universal Dynamic Data Synchronization & Chart Resilience Engine

**Input**: Design documents from `/specs/007-dynamic-data-and-charts-resilience/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story identifier ([US1], [US2], [US3])
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Set up contract validation and initial state definitions.

- [ ] T001 [P] Validate JSON schema contracts in `specs/007-dynamic-data-and-charts-resilience/contracts/`
- [ ] T002 [P] Initialize chart registry and dynamic chronology scaffolding in `dashboard/app.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish dynamic time engine and centralized chart lifecycle manager.

**⚠️ CRITICAL**: Must complete before user story implementation begins.

- [ ] T003 Implement `getConflictChronology()` time engine and cost calculator in `dashboard/app.js`
- [ ] T004 Implement centralized `renderResilientChart(canvasId, configBuilder)` lifecycle helper in `dashboard/app.js`

**Checkpoint**: Core calculation engine and chart lifecycle manager operational.

---

## Phase 3: User Story 1 - Dynamic Metric Derivation & Temporal Calculations (Priority: P1) 🎯 MVP

**Goal**: Dynamically calculate strike duration days, daily cost accumulation, Telegram archive counts, and Beluga buffer hours in real time.

**Independent Test**: Load the dashboard and verify that conflict duration days, cumulative strike costs for Airbus SE, Telegram document counts, and Beluga buffer hours update dynamically without static hardcoding.

### Implementation for User Story 1

- [ ] T005 [P] [US1] Replace static conflict days and cumulative strike cost text in `dashboard/index.html` with dynamic DOM binders
- [ ] T006 [P] [US1] Update `src/analysis_engine.py` and `dashboard/app.js` to derive dynamic economic aggregations
- [ ] T007 [P] [US1] Implement dynamic Telegram archive and document index counter aggregation in `dashboard/app.js`
- [ ] T008 [US1] Create unit tests in `tests/test_dynamic_metrics.py` for chronology, day counting, and cost calculations

**Checkpoint**: User Story 1 (MVP) complete — all metric counters dynamically computed.

---

## Phase 4: User Story 2 - Zero-Failure Chart.js Rendering & Safe Lifecycle Engine (Priority: P2)

**Goal**: Render all 12 Chart.js visualizations with zero canvas collisions, clean memory teardown, and safe fallback handling.

**Independent Test**: Switch across all 6 tabs in random sequence, toggle browser viewport sizes, and verify that 100% of chart canvases render valid data and resize smoothly.

### Implementation for User Story 2

- [ ] T009 [P] [US2] Refactor Asymmetry, Stock, and Company Health charts (`asymmetryChart`, `airbusStockChart`, `companyRevenueChart`, `companyDeliveriesChart`, `shareholderPieChart`) in `dashboard/app.js` with `renderResilientChart`
- [ ] T010 [P] [US2] Refactor Beluga Logistics and Wage Simulator charts (`belugaHistoryChart`, `wagesChart`) in `dashboard/app.js` with `renderResilientChart`
- [ ] T011 [P] [US2] Refactor Union Force, Electoral Evolution, and Referendum charts (`unionShareChart`, `unionEvolutionChart`, `siteDelegatesChart`, `referendumPieChart`, `referendumSitesChart`) in `dashboard/app.js` with `renderResilientChart`
- [ ] T012 [US2] Add comprehensive chart instantiation and lifecycle integration tests in `tests/test_dashboard_ui.py`

**Checkpoint**: User Stories 1 AND 2 complete — 100% chart availability and zero-failure rendering.

---

## Phase 5: User Story 3 - Autonomous Continuous Polling & Seamless DOM Refresh (Priority: P3)

**Goal**: Periodically poll updated local and remote datasets in the background and smoothly refresh DOM metrics without resetting user inputs.

**Independent Test**: Trigger background data sync and verify that active wage simulator inputs and search filters are preserved during in-place DOM updates.

### Implementation for User Story 3

- [ ] T013 [P] [US3] Refactor `startAutoSyncEngine()` in `dashboard/app.js` to preserve user form inputs during live data re-sync
- [ ] T014 [US3] Add fallback state handlers and zero-blank-screen offline resilience in `dashboard/app.js`

**Checkpoint**: All 3 user stories complete with seamless background synchronization.

---

## Phase 6: Polish & Verification

**Purpose**: End-to-end regression validation and full test suite execution.

- [ ] T015 [P] Run `python3 src/validate_sources.py`
- [ ] T016 [P] Run `python3 src/validate_invariants.py`
- [ ] T017 Run complete test suite (`python3 -m unittest discover tests`)

---

## Dependencies & Execution Order

```text
Phase 1: Setup (T001, T002)
    │
    ▼
Phase 2: Foundational (T003, T004)
    │
    ▼
Phase 3: User Story 1 - Dynamic Metric Derivation (T005–T008) [MVP]
    │
    ├──► Phase 4: User Story 2 - Zero-Failure Chart.js Rendering (T009–T012)
    │
    └──► Phase 5: User Story 3 - Continuous Polling & Seamless DOM Refresh (T013–T014)
              │
              ▼
Phase 6: Polish & Verification (T015, T016, T017)
```

### Parallel Opportunities

- **Setup**: T001 and T002 can run in parallel.
- **User Story 1**: T005, T006, and T007 can run concurrently.
- **User Story 2**: T009, T010, and T011 can run concurrently.
- **Polish**: T015 and T016 can run concurrently.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 (Setup) and Phase 2 (Foundational Engine).
2. Complete Phase 3 (Dynamic Metric Derivation).
3. **STOP & VALIDATE**: Run `python3 -m unittest tests/test_dynamic_metrics.py`.

### Incremental Delivery
1. Phase 1 + 2: Scaffolding and resilient chart helper.
2. Phase 3: Dynamic chronology and metric derivation (MVP).
3. Phase 4: 12-chart resilient lifecycle refactor.
4. Phase 5: Seamless background polling and input preservation.
5. Phase 6: Run full invariant tests and DOM validation suite.
