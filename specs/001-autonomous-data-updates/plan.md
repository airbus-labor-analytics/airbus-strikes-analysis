# Implementation Plan: Autonomous Live Data Ingestion & Periodic Updates

**Branch**: `001-autonomous-data-updates` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-autonomous-data-updates/spec.md`

## Summary

Build an autonomous, multi-source data ingestion pipeline that continuously pulls raw information from Telegram archives/channels, news feeds, document drops, and economic indicators. Externalize all endpoints and intervals into `config/sources.json`. Enforce strict invariant verification before committing data snapshots atomically, and equip the web dashboard with client-side HTTP polling to render live updates seamlessly in real time without hardcoded values or manual page refreshes.

## Technical Context

**Language/Version**: Python 3.10+ (Backend analysis & ingestion), Vanilla JavaScript / HTML5 / CSS3 (Client dashboard)

**Primary Dependencies**: Python standard library (`json`, `urllib.request`, `pathlib`, `re`, `time`, `argparse`, `hashlib`), zero external NPM/JS runtime frameworks (pure zero-build static web)

**Storage**: File-backed JSON data fixtures in `data/` (`conflict_metrics.json`, `sync_status.json`, `beluga_status.json`, `thermometer_data.json`, `data/telegram_archive/`)

**Testing**: Python `unittest` suite (`tests/test_analysis_engine.py`, `tests/test_data_ingestion.py`), invariant validator (`src/validate_invariants.py`), source validator (`src/validate_sources.py`)

**Target Platform**: Linux / macOS POSIX environments, modern evergreen web browsers

**Project Type**: CLI data ingestion daemon / tool + interactive static web dashboard

**Performance Goals**: End-to-end ingestion and invariant check < 1.5 seconds; client polling latency < 50ms; zero UI flicker during dashboard live re-renders

**Constraints**: Zero hardcoded values in logic or UI templates; 100% mathematical invariant conservation; zero-build frontend architecture

**Scale/Scope**: 7 industrial manufacturing sites, 15,562 workforce census, 198 delegates, 100+ primary source documents, 15-minute background ingestion cadence, 30-second client dashboard polling

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Plan Status | Notes |
|---|---|---|---|
| **I. Mathematical & Invariant Integrity** | 100% algebraic and conservation balance; zero hallucinations | **PASS** | Ingestion pipeline executes `validate_invariants.py` on staged data; atomic rollback if any rule fails |
| **II. Primary Source Grounding** | Direct traceability to verifiable documents (BOE, SIMA, IR, INE) | **PASS** | Parsers capture and record `SourceCitation` metadata for every extracted metric/announcement |
| **III. Single Source of Truth & Dual Parity** | `data/` is authoritative; analysis scripts and dashboard stay in parity | **PASS** | Both `src/` and `dashboard/` read directly from shared JSON data stores with synchronized schema contracts |
| **IV. Automated Testing** | Automated invariant and schema tests guard all changes | **PASS** | New automated tests in `tests/test_data_ingestion.py` covering parser feeds, scheduling, and rollback |
| **V. Operational Simplicity** | Standard libraries, zero-build vanilla frontend, no bloat | **PASS** | Implemented using standard Python `urllib`/`json` and vanilla JS client polling; no heavy message queues |

*Post-Design Evaluation*: All 5 constitutional gates pass with zero exceptions.

## Project Structure

### Documentation (this feature)

```text
specs/001-autonomous-data-updates/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Architecture and design decisions
├── data-model.md        # Entities, schemas, and invariant definitions
├── quickstart.md        # Runnable verification scenarios
└── contracts/
    ├── sources-config-schema.json    # JSON schema for config/sources.json
    ├── sync-status-contract.json      # JSON schema for data/sync_status.json
    └── ingestion-cli-contract.md      # CLI interface contract for data_ingestion.py
```

### Source Code (repository root)

```text
config/
└── sources.json                 # Externalized data sources configuration

src/
├── data_ingestion.py           # Ingestion coordinator, background scheduler, and CLI
├── analysis_engine.py          # Econometric and strike fund modeling engine
├── sentiment_thermometer.py    # Assembly sentiment analysis engine
├── validate_invariants.py      # Mathematical invariant validator
├── validate_sources.py         # Primary source link and citation validator
└── parsers/
    ├── __init__.py             # Parser module registry
    ├── telegram_parser.py      # Archive folder & live Telegram feed parser
    ├── news_parser.py          # RSS/Atom news and SIMA press release parser
    └── metric_parser.py        # External economic indicators & logistics parser

data/
├── sync_status.json            # Live sync metadata, health indicators, and timestamps
├── conflict_metrics.json       # Canonical strike dataset
├── thermometer_data.json       # Assembly sentiment metrics
├── beluga_status.json          # Logistics and flight disruption indicators
└── telegram_archive/           # Primary source document archive and index
    └── telegram_index.json

dashboard/
├── index.html                  # Dashboard HTML structure with live sync status badge
├── app.js                      # Application logic with client-side polling and re-renders
└── data.js                     # Local fallback fixtures

tests/
├── test_analysis_engine.py     # Existing analysis engine tests
└── test_data_ingestion.py      # Ingestion pipeline, parsers, and rollback tests
```

**Structure Decision**: Clean, single-project layout extending `src/` with a modular `src/parsers/` package, introducing `config/sources.json` for externalized settings, and updating `dashboard/app.js` with client polling logic while preserving static file serving.

## Complexity Tracking

> **No constitutional violations detected. Zero unnecessary abstractions introduced.**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| *None* | N/A | Standard Python libraries and vanilla JS fulfill all requirements cleanly. |
