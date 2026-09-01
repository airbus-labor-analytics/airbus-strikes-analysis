# Tasks: Daily Timeline Freshness Validator & Detailed Factory Assembly Minutes

**Input**: Design documents from `specs/016-daily-timeline-assembly-validator/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

---

## Phase 1: Setup

- [X] T001 Initialize test fixtures and schema contract loaders in `tests/test_timeline_freshness.py`

---

## Phase 2: Foundational

- [X] T002 [P] Implement core timezone and date arithmetic helper in `src/validate_timeline_freshness.py`
- [X] T003 [P] Implement schema validator loader for `specs/016-daily-timeline-assembly-validator/contracts/timeline_freshness_contract.json` in `src/validate_timeline_freshness.py`

---

## Phase 3: User Story 1 - Validador de Frescura Diaria & Banner de Alerta (Priority: P1)

**Story Goal**: Detect if today's strike events are registered in Madrid timezone and display an actionable alert banner and HUD indicator when pending.

**Independent Test**: Run `python3 src/validate_timeline_freshness.py` and inspect browser UI at `#sec-unions-timeline` to confirm the dynamic status banner renders with correct badge and quick links.

- [X] T004 [P] [US1] Implement CLI freshness evaluator and status code logic (`UP_TO_DATE`, `PENDING_TODAY`, `STALE_ALERT`, `WEEKEND_PAUSE`) in `src/validate_timeline_freshness.py`
- [X] T005 [P] [US1] Create dynamic freshness banner container and styling in `dashboard/index.html`
- [X] T006 [US1] Implement `evaluateTimelineFreshness()` client-side engine and banner renderer in `dashboard/app.js`
- [X] T007 [US1] Wire floating Dynamic Island HUD status indicator for daily timeline freshness in `dashboard/app.js`

---

## Phase 4: User Story 2 - Cronología Exhaustiva Día a Día & Minutas de Fábrica (Priority: P2)

**Story Goal**: Provide a comprehensive day-by-day chronogram from July to September 1, 2026, integrating factory assembly minutes from all plants with modal document viewers.

**Independent Test**: Open `#sec-unions-timeline` in the dashboard, filter by plant (`Getafe`, `Illescas`, `San Pablo`, etc.) or actor (`Asamblea`, `SIMA`, etc.), and click an assembly minute entry to open the source document modal.

- [X] T008 [P] [US2] Update `data/conflict_metrics.json` with continuous daily milestones and assembly minutes up to 2026-09-01
- [X] T009 [P] [US2] Link Telegram archive assembly documents (`data/telegram_archive/assembly_minutes/`) to milestone entities in `data/conflict_metrics.json`
- [X] T010 [US2] Implement timeline filtering by plant, actor category, and document type in `dashboard/js/modules/union_force.js`
- [X] T011 [US2] Implement document modal reader trigger for timeline assembly minutes in `dashboard/js/modules/union_force.js`

---

## Phase 5: User Story 3 - Integración en Pipeline Automatizado y Guardas de Invariantes (Priority: P3)

**Story Goal**: Safeguard timeline integrity with Rule 15 in `validate_invariants.py`, GitHub Actions workflow integration, and full unit test coverage.

**Independent Test**: Run `python3 src/validate_invariants.py` and `python3 -m unittest tests/test_timeline_freshness.py` to confirm all assertions pass cleanly.

- [X] T012 [P] [US3] Register Rule 15 (Timeline Freshness & Chronological Monotonicity) in `src/validate_invariants.py`
- [X] T013 [P] [US3] Add timeline freshness validation step to `.github/workflows/sync-news-data.yml`
- [X] T014 [US3] Author comprehensive unit tests for freshness rules, timezone edge cases, and schema validation in `tests/test_timeline_freshness.py`

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T015 Run full validation test suite (`python3 src/validate_invariants.py`, `python3 src/validate_sources.py`, `python3 -m unittest discover tests/`)
- [X] T016 Verify static DOM structure and syntax consistency across `dashboard/app.js` and `dashboard/index.html`
