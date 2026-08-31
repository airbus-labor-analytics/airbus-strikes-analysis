---
description: "Task list for Full Platform-Wide Data Audit, Verification & Zero-Unverified-Data Purge"
---

# Tasks: Full Platform-Wide Data Audit, Verification & Zero-Unverified-Data Purge

**Input**: Design documents from `/specs/002-verify-stock-data/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`  

## Format: `[ID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story identifier ([US1], [US2], [US3])
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Set up data audit harness and verify contract schemas.

- [X] T001 [P] Validate data integrity schema in `specs/002-verify-stock-data/contracts/data-integrity-contract.json` against canonical datasets
- [X] T002 [P] Create repository-wide audit script `src/audit_data_veracity.py` to scan all metrics across `data/` and `dashboard/` for unverified figures

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Audit and cleanse canonical datasets in `data/` before updating frontend or documentation.

**⚠️ CRITICAL**: Must complete before user story implementation begins.

- [X] T003 [P] Audit and purge all ungrounded historical stock curves and synthetic numbers in `data/conflict_metrics.json`, retaining only verified Euronext Paris milestones
- [X] T004 [P] Audit and verify plant censuses (15,562), delegate matrix (198), and 24-J Referendum counts in `data/conflict_metrics.json` against official certificates
- [X] T005 [P] Audit and verify corporate financials (Airbus FY2024/FY2025 results) and wage loss tables in `data/conflict_metrics.json` against Airbus IR and BOE convenios

**Checkpoint**: Canonical backend dataset is 100% verified and purged of ungrounded figures.

---

## Phase 3: User Story 1 - Whole-Platform Data Audit & Purge of Unverified Content (Priority: P1) 🎯 MVP

**Goal**: Purge all unverified, simulated, or inaccurate historical stock values and ungrounded figures across the frontend dashboard and datasets, ensuring 100% institutional credibility.

**Independent Test**: Run `python3 src/audit_data_veracity.py` and verify that 0 unverified or synthetic numbers exist across `data/conflict_metrics.json`, `dashboard/data.js`, and `dashboard/app.js`.

### Implementation for User Story 1

- [X] T006 [P] [US1] Cleanse `dashboard/data.js` to eliminate all unverified synthetic daily stock series, matching canonical audited dataset
- [X] T007 [P] [US1] Audit and update `initAirbusStockChart()` and all 12 Chart.js canvases in `dashboard/app.js` to render exclusively verified milestone quotes with source citations
- [X] T008 [P] [US1] Audit all KPI cards, metrics, and text summaries in `dashboard/index.html` (Stock Tab, Overview, Solvency, Wage Simulator) to purge ungrounded estimates
- [X] T009 [US1] Re-generate consolidated datasets with `src/analysis_engine.py` and verify zero data drift between backend and dashboard

**Checkpoint**: User Story 1 (MVP) complete — all unverified stock and platform data purged, web dashboard rendering only verified facts.

---

## Phase 4: User Story 2 - Rigorous Primary Source Grounding Across All 15 Dashboard Domains (Priority: P2)

**Goal**: Ground every single metric, table, chart, and section in verifiable primary source citations (Euronext Paris, Airbus IR, BOE, SIMA, INE).

**Independent Test**: Run `python3 src/validate_sources.py` to confirm that 100% of sections, benchmarks, and interactive charts contain verified primary source citations that resolve successfully.

### Implementation for User Story 2

- [X] T010 [P] [US2] Update and verify primary source URLs (`Euronext Paris AIR.PA`, `Airbus IR`, `BOE`, `SIMA`, `INE`) across all benchmarks in `data/conflict_metrics.json`
- [X] T011 [P] [US2] Verify and update all source citation badges and hyperlinks in `dashboard/index.html` across all 15 navigation tabs
- [X] T012 [P] [US2] Audit and update the executive Markdown dossier in `docs/Guia_Estrategica_Negociacion_Huelga_Airbus_2026.md` for 100% numerical and citation parity
- [X] T013 [US2] Re-generate the official executive PDF using `python3 src/generate_pdf.py` and verify complete visual and textual parity

**Checkpoint**: User Stories 1 AND 2 complete — 100% primary source citation coverage across web and print publications.

---

## Phase 5: User Story 3 - Automated Whole-Dataset Invariant Gates & Regression Protection (Priority: P3)

**Goal**: Expand automated validation rules to continuously enforce the Zero Unverified Data Policy and mathematical consistency on all future updates.

**Independent Test**: Run `python3 src/validate_invariants.py` and verify that all 14 invariant rules pass with 0 discrepancies.

### Implementation for User Story 3

- [X] T014 [P] [US3] Expand `src/validate_invariants.py` with Rules 12, 13, and 14 for stock bounds, primary source completeness, and zero unverified data
- [X] T015 [P] [US3] Expand `src/validate_sources.py` to enforce 100% primary source citation coverage across all JSON schemas and Markdown dossiers
- [X] T016 [P] [US3] Add automated unit tests in `tests/test_analysis_engine.py` asserting zero unverified stock data and mathematical consistency

**Checkpoint**: All 3 user stories complete with continuous automated regression gating.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end quickstart validation and full test suite execution.

- [X] T017 Execute complete quickstart validation suite per `specs/002-verify-stock-data/quickstart.md`
- [X] T018 Run complete regression test suite `python3 -m unittest discover tests` and invariant validator `python3 src/validate_invariants.py`

---

## Dependencies & Execution Order

```text
Phase 1: Setup (T001, T002)
    │
    ▼
Phase 2: Foundational (T003, T004, T005)
    │
    ▼
Phase 3: User Story 1 - Audit & Purge (T006, T007, T008 → T009) [MVP]
    │
    ├──► Phase 4: User Story 2 - Source Grounding (T010, T011, T012 → T013)
    │
    └──► Phase 5: User Story 3 - Invariant Gates (T014, T015, T016)
              │
              ▼
Phase 6: Polish & Cross-Cutting (T017, T018)
```

### Parallel Opportunities

- **Setup Phase**: T001 and T002 can run concurrently.
- **Foundational Phase**: T003, T004, and T005 can run concurrently.
- **User Story 1**: T006, T007, and T008 can run concurrently before T009 integrates them.
- **User Story 2**: T010, T011, and T012 can run concurrently before T013 re-generates the PDF.
- **User Story 3**: T014, T015, and T016 can run concurrently.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (User Story 1).
3. **STOP & VALIDATE**: Run `python3 src/analysis_engine.py` and verify `data/conflict_metrics.json` and `dashboard/data.js` contain 0 unverified stock figures.

### Incremental Delivery
1. Phase 1 + 2: Audit tools and canonical dataset cleansing.
2. Phase 3: Web dashboard and chart audit (MVP).
3. Phase 4: Source citations and publication dossier updates.
4. Phase 5: Automated invariant gates and test harness expansion.
5. Phase 6: Final verification and CI/CD validation.
