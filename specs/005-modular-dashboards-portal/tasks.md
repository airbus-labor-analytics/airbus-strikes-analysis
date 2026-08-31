---
description: "Task list for Modular Dashboards & Welcome Portal Hub"
---

# Tasks: Modular Dashboards & Welcome Portal Hub

**Input**: Design documents from `/specs/005-modular-dashboards-portal/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story identifier ([US1], [US2], [US3])
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Validate navigation contracts and setup portal DOM container.

- [X] T001 [P] Validate portal navigation contract schema in `specs/005-modular-dashboards-portal/contracts/portal-navigation-contract.json`
- [X] T002 [P] Create initial `tab-portal` container scaffolding and navigation tokens in `dashboard/index.html`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish default hash routing and breadcrumb controller.

**⚠️ CRITICAL**: Must complete before user story implementation begins.

- [X] T003 Update `switchTab()` router in `dashboard/app.js` to support `#portal` default route and 5 decoupled dashboard aliases
- [X] T004 Implement breadcrumb and back-to-portal navigation helpers in `dashboard/app.js`

**Checkpoint**: Core router handles `#portal` and decoupled dashboard hash transitions smoothly.

---

## Phase 3: User Story 1 - Welcome Portal Hub & Site Navigation Map (Priority: P1) 🎯 MVP

**Goal**: Render the Welcome Portal with platform mission, 4 executive flash KPIs, and interactive 5-card Site Map.

**Independent Test**: Load application root without hash and verify that `tab-portal` renders with founding principles, flash KPIs (15,562 workers, -14.4B€ market delta, 60h buffer, -26,027€ loss), and 1-click links to all 5 dashboards.

### Implementation for User Story 1

- [X] T005 [P] [US1] Build Welcome Portal mission statement banner and founding principles card in `dashboard/index.html`
- [X] T006 [P] [US1] Build 4 executive flash KPI summary cards in `dashboard/index.html`
- [X] T007 [US1] Build interactive 5-dashboard visual Site Map grid in `dashboard/index.html` with click-to-switch handlers

**Checkpoint**: User Story 1 (MVP) complete — first-time visitors receive clear mission context and 1-click navigation.

---

## Phase 4: User Story 2 - Focused, Decoupled Thematic Dashboards (Priority: P2)

**Goal**: Refine the 5 dedicated sub-dashboards with clean whitespace, reduced visual clutter, and domain isolation.

**Independent Test**: Navigate to each sub-dashboard (`#financiero`, `#logistica`, `#salarios`, `#sindical`, `#evidencias`) and verify domain component isolation and layout clarity.

### Implementation for User Story 2

- [X] T008 [P] [US2] Decouple `tab-overview` into dedicated Financial & Corporate Asymmetry view in `dashboard/index.html`
- [X] T009 [P] [US2] Decouple `tab-industrial` into dedicated Logistics & Beluga Radar view in `dashboard/index.html`
- [X] T010 [P] [US2] Decouple `tab-purchasing-power` into dedicated Wage & Pension Simulator view in `dashboard/index.html`
- [X] T011 [P] [US2] Decouple `tab-union-force` into dedicated Union Representation & Assembly Chronology view in `dashboard/index.html`
- [X] T012 [P] [US2] Decouple `tab-evidence` into dedicated Documentary Search & Primary Sources Archive in `dashboard/index.html`

**Checkpoint**: User Stories 1 AND 2 complete — all 5 dashboards isolated without visual clutter.

---

## Phase 5: User Story 3 - Persistent Global Navigation & Breadcrumb Bar (Priority: P3)

**Goal**: Provide persistent top navigation with "← Volver al Mapa Web" breadcrumb and zero-distortion chart resizing.

**Independent Test**: Navigate between sub-dashboards, verify breadcrumb updates, and confirm Chart.js canvases resize cleanly on view transitions.

### Implementation for User Story 3

- [X] T013 [P] [US3] Add persistent top breadcrumb bar with active section indicator and portal back-link in `dashboard/index.html`
- [X] T014 [US3] Enforce Principle VI lifecycle (scrollTop = 0, chart .resize()) in `dashboard/app.js` during portal transitions
- [X] T015 [US3] Add automated UI & DOM hierarchy tests in `tests/test_dashboard_ui.py` validating 6-tab routing matrix

---

## Phase 6: Polish & Verification

**Purpose**: Full regression testing and source invariant validation.

- [X] T016 [P] Run `python3 src/validate_sources.py` to verify tag balancing and DOM structure across all 6 tabs
- [X] T017 [P] Run `python3 src/validate_invariants.py` to ensure Rules 1–14 pass with zero errors
- [X] T018 Run complete test suite (`python3 -m unittest discover tests`)

---

## Dependencies & Execution Order

```text
Phase 1: Setup (T001, T002)
    │
    ▼
Phase 2: Foundational (T003, T004)
    │
    ▼
Phase 3: User Story 1 - Welcome Portal Hub (T005, T006, T007) [MVP]
    │
    ├──► Phase 4: User Story 2 - Decoupled Dashboards (T008–T012)
    │
    └──► Phase 5: User Story 3 - Global Navigation & Breadcrumbs (T013–T015)
              │
              ▼
Phase 6: Polish & Verification (T016, T017, T018)
```

### Parallel Opportunities

- **Setup**: T001 and T002 can run in parallel.
- **User Story 1**: T005 and T006 can run concurrently.
- **User Story 2**: T008, T009, T010, T011, and T012 can run concurrently.
- **Polish**: T016 and T017 can run concurrently.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 (Setup) and Phase 2 (Foundational Router).
2. Complete Phase 3 (Welcome Portal Hub).
3. **STOP & VALIDATE**: Test root landing view in browser.

### Incremental Delivery
1. Phase 1 + 2: Router setup and container scaffolding.
2. Phase 3: Welcome Portal Hub (MVP).
3. Phase 4: Decouple 5 specialized dashboard views.
4. Phase 5: Breadcrumb navigation and Chart.js lifecycle.
5. Phase 6: Run full invariant tests and DOM validation suite.
