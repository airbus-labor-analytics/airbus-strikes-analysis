---
description: "Task list for Autonomous Live Data Ingestion & Periodic Updates"
---

# Tasks: Autonomous Live Data Ingestion & Periodic Updates

**Input**: Design documents from `/specs/001-autonomous-data-updates/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`  

## Format: `[ID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story identifier ([US1], [US2], [US3])
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Externalize data source configuration and initialize parser package architecture.

- [x] T001 [P] Create externalized data sources configuration in `config/sources.json` per `specs/001-autonomous-data-updates/contracts/sources-config-schema.json`
- [x] T002 [P] Initialize parser package structure with `src/parsers/__init__.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core configuration loader, atomic writer, and sync state tracking required by all user stories.

**⚠️ CRITICAL**: Must complete before user story implementation begins.

- [x] T003 [P] Implement configuration loader and environment variable override resolver in `src/parsers/config_loader.py`
- [x] T004 [P] Implement atomic file transaction writer with rollback support in `src/atomic_writer.py`
- [x] T005 Initialize default sync status state file in `data/sync_status.json` per `specs/001-autonomous-data-updates/contracts/sync-status-contract.json`

**Checkpoint**: Foundation ready — parsers, ingestion CLI, and dashboard live sync can proceed.

---

## Phase 3: User Story 1 - Autonomous Multi-Source Data Ingestion (Priority: P1) 🎯 MVP

**Goal**: Ingest raw data from Telegram archives/channels, news feeds, document drops, and economic indicators without hardcoded values, ensuring 100% mathematical invariant validity and atomic rollback on errors.

**Independent Test**: Execute `python3 src/data_ingestion.py --run-once` and verify `data/conflict_metrics.json` and `data/sync_status.json` update with passing invariants.

### Tests for User Story 1

- [x] T006 [P] [US1] Implement unit and invariant rollback tests in `tests/test_data_ingestion.py`

### Implementation for User Story 1

- [x] T007 [P] [US1] Implement Telegram archive & live API parser in `src/parsers/telegram_parser.py`
- [x] T008 [P] [US1] Implement RSS news feed & SIMA press release parser in `src/parsers/news_parser.py`
- [x] T009 [P] [US1] Implement economic indicators & Beluga logistics parser in `src/parsers/metric_parser.py`
- [x] T010 [US1] Implement main ingestion engine coordinator and CLI in `src/data_ingestion.py` integrating all parsers, atomic writer, and invariant validator `src/validate_invariants.py` (depends on T007, T008, T009)

**Checkpoint**: User Story 1 (MVP) is fully functional and testable independently via CLI.

---

## Phase 4: User Story 2 - Configurable Periodic Live Refresh (Priority: P2)

**Goal**: Support autonomous continuous background polling and real-time client-side dashboard polling with seamless in-place UI re-renders.

**Independent Test**: Start background polling `python3 src/data_ingestion.py --daemon` or trigger an update, and verify `dashboard/` polls `data/sync_status.json` and updates the UI in real time.

### Implementation for User Story 2

- [x] T011 [P] [US2] Implement continuous background polling loop and configurable interval scheduler in `src/data_ingestion.py`
- [x] T012 [P] [US2] Add live sync health status badge and connection indicator in `dashboard/index.html`
- [x] T013 [US2] Implement client-side HTTP polling loop and seamless DOM re-rendering in `dashboard/app.js`

**Checkpoint**: User Stories 1 AND 2 work together, providing autonomous background sync and live dashboard auto-refresh.

---

## Phase 5: User Story 3 - Transparent Source Grounding & File Ingestion (Priority: P3)

**Goal**: Extract and attach primary source citations to all ingested metrics and announcements, updating indices and dashboard citation links.

**Independent Test**: Run `python3 src/validate_sources.py` after an ingestion cycle to confirm 100% citation grounding and verify citations render in the web dashboard.

### Implementation for User Story 3

- [x] T014 [P] [US3] Implement citation and metadata indexing in `src/parsers/telegram_parser.py` updating `data/telegram_archive/telegram_index.json`
- [x] T015 [US3] Connect dynamic source citations to dashboard news feeds and assembly cards in `dashboard/app.js`

**Checkpoint**: All 3 user stories are complete, verified, and fully grounded in primary source documents.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: CI/CD integration, end-to-end quickstart validation, and full regression testing.

- [x] T016 [P] Update GitHub Actions automation in `.github/workflows/sync-news-data.yml` to execute `python3 src/data_ingestion.py --run-once`
- [x] T017 Execute end-to-end validation scenarios in `specs/001-autonomous-data-updates/quickstart.md`
- [x] T018 Run complete test suite `python3 -m unittest discover tests` and invariant validator `python3 src/validate_invariants.py`

---

## Dependencies & Execution Order

```text
Phase 1: Setup (T001, T002)
    │
    ▼
Phase 2: Foundational (T003, T004, T005)
    │
    ▼
Phase 3: User Story 1 - Multi-Source Ingestion (T006 → T007, T008, T009 → T010) [MVP]
    │
    ├──► Phase 4: User Story 2 - Live Refresh (T011, T012 → T013)
    │
    └──► Phase 5: User Story 3 - Source Grounding (T014 → T015)
              │
              ▼
Phase 6: Polish & Cross-Cutting (T016, T017, T018)
```

### Parallel Opportunities

- **Setup Phase**: T001 and T002 can run concurrently.
- **Foundational Phase**: T003 and T004 can run concurrently.
- **User Story 1**: T006 (tests), T007 (Telegram parser), T008 (news parser), and T009 (metrics parser) can all be implemented in parallel before T010 integrates them.
- **User Story 2**: T011 (daemon) and T012 (HTML badge) can run concurrently.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (User Story 1).
3. **STOP & VALIDATE**: Run `python3 src/data_ingestion.py --run-once` and verify `data/conflict_metrics.json` updates and invariants pass.

### Incremental Delivery
1. Phase 1 + 2: Core configuration and atomic write primitives ready.
2. Phase 3: Autonomous multi-source ingestion CLI operating with 100% invariant protection (MVP).
3. Phase 4: Continuous daemon scheduling and live client-side dashboard polling.
4. Phase 5: Full primary source citation indexing and UI link binding.
5. Phase 6: CI automation and final verification.
