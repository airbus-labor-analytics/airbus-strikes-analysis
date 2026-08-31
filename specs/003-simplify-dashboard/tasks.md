---
description: "Task list for Dashboard UI/UX Simplification & Thematic Reorganization"
---

# Tasks: Dashboard UI/UX Simplification & Thematic Reorganization

**Input**: Design documents from `/specs/003-simplify-dashboard/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Format: `[ID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story identifier ([US1], [US2], [US3])
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Set up validation criteria and contract schemas.

- [X] T001 [P] Validate UI navigation schema in `specs/003-simplify-dashboard/contracts/ui-contract.json` against current dashboard structure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Remove obsolete components and prepare state management for 5 unified modules.

**⚠️ CRITICAL**: Must complete before user story implementation begins.

- [X] T002 [P] Purge legacy `tab-checklist` ("Auditor 6 Filtros Urna") markup and navigation references in `dashboard/index.html`
- [X] T003 [P] Refactor navigation state management and `switchTab()` function in `dashboard/app.js` for 5 top-level views

**Checkpoint**: Obsolete checklist removed and 5-tab navigation state initialized.

---

## Phase 3: User Story 1 - Thematic Reorganization & Clutter Elimination (Priority: P1) 🎯 MVP

**Goal**: Consolidate 15 fragmented tabs into 5 logical thematic sections without data loss.

**Independent Test**: Open `dashboard/index.html` and verify that exactly 5 unified tabs exist, `tab-checklist` is gone, and all underlying metrics are cleanly accessible.

### Implementation for User Story 1

- [X] T004 [P] [US1] Restructure `tab-overview` (Module 1: Centro de Mando & Asimetría) to integrate stock market metrics and corporate financials in `dashboard/index.html`
- [X] T005 [P] [US1] Restructure `tab-industrial` (Module 2: Impacto Industrial & Logística) to integrate JIT buffers, FALs impact, Beluga flight log, and Thermometer in `dashboard/index.html`
- [X] T006 [P] [US1] Restructure `tab-purchasing-power` (Module 3: Poder Adquisitivo & Negociación) to integrate wage loss simulator, BOE loss tables, offer gaps, and 11-point platform in `dashboard/index.html`
- [X] T007 [P] [US1] Restructure `tab-union-force` (Module 4: Fuerza Sindical & Asamblea) to integrate plant/union delegate map, 24-J referendum voting, assembly chronology, and scenario trees in `dashboard/index.html`
- [X] T008 [P] [US1] Restructure `tab-evidence` (Module 5: Documentación & Evidencias) to integrate 269-source documentary annex, Telegram archive, and aerospace strike benchmarks in `dashboard/index.html`

**Checkpoint**: User Story 1 (MVP) complete — 5 unified modules fully populated with zero data loss.

---

## Phase 4: User Story 2 - Visual Simplification & Readability Enhancement (Priority: P2)

**Goal**: Clean typography, high-contrast text tokens, balanced padding, and responsive Chart.js rendering.

**Independent Test**: Inspect all 5 views on mobile (320px+) and desktop viewports to verify crisp readability and responsive chart rendering.

### Implementation for User Story 2

- [X] T009 [P] [US2] Streamline sidebar navigation header, badge styles, and mobile responsive drawer in `dashboard/index.html`
- [X] T010 [P] [US2] Optimize Chart.js rendering and lazy canvas resize handlers for all 12 charts in `dashboard/app.js`
- [X] T011 [P] [US2] Standardize typography hierarchy, high-contrast color tokens, and spacing across all metric cards in `dashboard/index.html`

**Checkpoint**: User Stories 1 AND 2 complete — clear visual design and responsive charts.

---

## Phase 5: User Story 3 - Streamlined Filtering & Interactive Exploration (Priority: P3)

**Goal**: Fast, frictionless interactive controls for wage simulations and documentary search.

**Independent Test**: Test wage simulator sliders and document search filtering in the browser for smooth real-time response.

### Implementation for User Story 3

- [X] T012 [P] [US3] Verify real-time Wage Simulator slider controls and event listeners in `dashboard/app.js`
- [X] T013 [P] [US3] Verify real-time documentary annex search filtering and link resolution in `dashboard/app.js`

**Checkpoint**: All 3 user stories complete with seamless interactivity.

---

## Phase 6: Polish & Verification

**Purpose**: End-to-end regression validation and full test suite execution.

- [X] T014 [P] Update source scanner in `src/validate_sources.py` to validate the 5-tab structure and all 12 Chart.js canvases
- [X] T015 [P] Run data synchronization with `src/analysis_engine.py` and verify zero data drift
- [X] T016 Run complete verification suite (`python3 src/validate_sources.py`, `python3 src/audit_data_veracity.py`, `python3 src/validate_invariants.py`, `python3 -m unittest discover tests`)

---

## Dependencies & Execution Order

```text
Phase 1: Setup (T001)
    │
    ▼
Phase 2: Foundational (T002, T003)
    │
    ▼
Phase 3: User Story 1 - Thematic Reorganization (T004, T005, T006, T007, T008) [MVP]
    │
    ├──► Phase 4: User Story 2 - Visual Simplification (T009, T010, T011)
    │
    └──► Phase 5: User Story 3 - Streamlined Filtering (T012, T013)
              │
              ▼
Phase 6: Polish & Verification (T014, T015, T016)
```

### Parallel Opportunities

- **Setup & Foundational**: T001, T002, and T003 can be prepared in parallel.
- **User Story 1**: T004, T005, T006, T007, and T008 represent separate module containers in `dashboard/index.html`.
- **User Story 2**: T009, T010, and T011 can run concurrently.
- **User Story 3**: T012 and T013 can run concurrently.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (User Story 1).
3. **STOP & VALIDATE**: Open `dashboard/index.html` and verify the 5 unified views render correctly without `tab-checklist`.

### Incremental Delivery
1. Phase 1 + 2: Purge obsolete checklist and initialize 5-tab state.
2. Phase 3: Populate 5 unified thematic modules (MVP).
3. Phase 4: Polish typography, contrast, and Chart.js responsiveness.
4. Phase 5: Polish interactive simulator and search filtering.
5. Phase 6: Run full validation scripts and test suite.
