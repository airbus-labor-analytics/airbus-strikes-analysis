---
description: "Task list for Strike Data Sync, Sensitive Information Badges & User Validation Gate"
---

# Tasks: Strike Data Sync, Sensitive Information Badges & User Validation Gate

**Input**: Design documents from `/specs/006-sync-strike-data-updates/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story identifier ([US1], [US2], [US3])
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Set up validation contract schemas and manifest parser scaffolding.

- [ ] T001 [P] Validate sync validation manifest contract schema in `specs/006-sync-strike-data-updates/contracts/sync-validation-contract.json`
- [ ] T002 [P] Initialize validation manifest structures in `src/parsers/telegram_parser.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extract latest Telegram archive filings and establish data extraction pipeline.

**⚠️ CRITICAL**: Must complete before user story implementation begins.

- [ ] T003 [P] Implement Telegram document extraction for SIMA 27/08 meeting minutes (`Reuni_n_Comit__de_Huelga_en_el_SIMA_el_27-08-2026__1_.pdf.txt`) in `src/parsers/telegram_parser.py`
- [ ] T004 [P] Implement extraction of 11-point strike committee proposal (`Propuesta_ComiteHuelga270826.pdf.txt`) in `src/parsers/telegram_parser.py`
- [ ] T005 Integrate change manifest generator into `src/data_ingestion.py`

**Checkpoint**: Foundational extraction engine ready to build candidate update diffs.

---

## Phase 3: User Story 1 - Interactive User Validation Gate (Priority: P1) 🎯 MVP

**Goal**: Present an itemized diff of proposed additions/deletions and prompt user via chat for explicit confirmation before writing to canonical files.

**Independent Test**: Run `python3 src/data_ingestion.py --interactive-review` and verify that all extracted changes (SIMA 27/08 7500€ paga única, 12% subida, IPC+1.5%) are presented in a structured validation table requiring user confirmation.

### Implementation for User Story 1

- [ ] T006 [P] [US1] Build interactive CLI / chat review prompt formatter in `src/data_ingestion.py`
- [ ] T007 [P] [US1] Implement approval/rejection decision handler and atomic dataset updater in `src/data_ingestion.py`
- [ ] T008 [US1] Create unit tests for validation manifest generation and confirmation logic in `tests/test_data_ingestion.py`

**Checkpoint**: User Story 1 (MVP) complete — safe interactive human validation gate operational.

---

## Phase 4: User Story 2 - Sensitive / Unreviewed Information Badges (Priority: P2)

**Goal**: Render high-contrast Amber badges (`⚠️ Información Sensible en Revisión / Negociación Activa`) on dashboard cards containing provisional data.

**Independent Test**: Open `dashboard/index.html`, view the negotiation proposal cards, and verify that the amber badge and context tooltip render cleanly with responsive styling.

### Implementation for User Story 2

- [ ] T009 [P] [US2] Add reusable Amber badge CSS tokens and markup in `dashboard/index.html` for provisional strike proposals
- [ ] T010 [P] [US2] Update `dashboard/app.js` to dynamically inject sensitive info markers and tooltips on provisional metrics
- [ ] T011 [US2] Add DOM hierarchy tests in `tests/test_dashboard_ui.py` to verify sensitive badge elements and tooltips

**Checkpoint**: User Stories 1 AND 2 complete — unreviewed/provisional figures clearly marked in UI.

---

## Phase 5: User Story 3 - Multi-Document & Dataset Synchronization (Priority: P3)

**Goal**: Synchronously propagate validated updates across `data/conflict_metrics.json`, `dashboard/data.js`, and `docs/Guia_Estrategica_Negociacion_Huelga_Airbus_2026.md`.

**Independent Test**: Run data sync and verify that canonical JSON, client JS data, and Markdown dossiers reflect the validated figures with zero numerical drift.

### Implementation for User Story 3

- [ ] T012 [P] [US3] Update econometric calculations and platform cost model in `src/analysis_engine.py` for approved 27/08 SIMA proposal terms
- [ ] T013 [P] [US3] Update `docs/Guia_Estrategica_Negociacion_Huelga_Airbus_2026.md` with validated SIMA 27/08 negotiations and assembly resolutions
- [ ] T014 [US3] Synchronize `dashboard/data.js` and `data/conflict_metrics.json` via atomic export

**Checkpoint**: All 3 user stories complete with seamless multi-surface parity.

---

## Phase 6: Polish & Verification

**Purpose**: End-to-end regression validation and full test suite execution.

- [ ] T015 [P] Run `python3 src/validate_sources.py` to ensure all primary source links and HTML tags balance
- [ ] T016 [P] Run `python3 src/validate_invariants.py` to ensure Rules 1–14 pass with zero errors
- [ ] T017 Run complete test suite (`python3 -m unittest discover tests`)

---

## Dependencies & Execution Order

```text
Phase 1: Setup (T001, T002)
    │
    ▼
Phase 2: Foundational (T003, T004, T005)
    │
    ▼
Phase 3: User Story 1 - Interactive Validation Gate (T006, T007, T008) [MVP]
    │
    ├──► Phase 4: User Story 2 - Sensitive Badges (T009, T010, T011)
    │
    └──► Phase 5: User Story 3 - Multi-Document Sync (T012, T013, T014)
              │
              ▼
Phase 6: Polish & Verification (T015, T016, T017)
```

### Parallel Opportunities

- **Setup & Foundational**: T001, T002, T003, and T004 can run in parallel.
- **User Story 2**: T009 and T010 can run concurrently.
- **User Story 3**: T012 and T013 can run concurrently.
- **Polish**: T015 and T016 can run concurrently.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (User Story 1).
3. **STOP & VALIDATE**: Test the interactive validation gate with `python3 src/data_ingestion.py`.

### Incremental Delivery
1. Phase 1 + 2: Scaffolding and Telegram extraction.
2. Phase 3: Interactive validation gate (MVP).
3. Phase 4: UI Amber badges for sensitive information.
4. Phase 5: Full multi-surface synchronization.
5. Phase 6: Run full invariant tests and unit test suites.
