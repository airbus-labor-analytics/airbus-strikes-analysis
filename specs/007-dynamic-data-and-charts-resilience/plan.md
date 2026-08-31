# Implementation Plan: Universal Dynamic Data Synchronization & Chart Resilience Engine

**Branch**: `007-dynamic-data-and` | **Date**: 2026-08-31 | **Spec**: [specs/007-dynamic-data-and-charts-resilience/spec.md](spec.md)

**Input**: Feature specification from `/specs/007-dynamic-data-and-charts-resilience/spec.md`

## Summary

Refactor client-side and backend pipeline scripts to replace all remaining static constants (e.g. hardcoded elapsed conflict days, fixed cumulative strike costs, static document counters) with dynamic algorithmic derivation. Establish an ultra-resilient Chart.js lifecycle management engine with safe canvas destroy/rebuild handling, strict null-safe DOM guards, and zero-failure data sanitization across all 12 chart instances.

## Technical Context

**Language/Version**: Python 3.10+ (Data Ingestion & Invariant Engine) & Vanilla JavaScript ES2022 (Dashboard Client).

**Primary Dependencies**: Chart.js v4.4.x, Lucide Icons, Tailwind CSS CDN; Python standard library (`urllib.request`, `json`, `datetime`, `unittest`).

**Storage**: Local JSON files (`data/conflict_metrics.json`, `data/beluga_status.json`, `data/sync_status.json`, `data/telegram_archive/telegram_index.json`) and in-memory JS state (`data.js`).

**Testing**: Python `unittest` suite (`tests/test_dashboard_ui.py`, `tests/test_beluga_tracker.py`, `tests/test_analysis_engine.py`), `validate_invariants.py`, and `validate_sources.py`.

**Target Platform**: Modern Web Browsers (Chrome, Firefox, Safari, Edge) & GitHub Pages static hosting with 100% offline `file://` support.

**Project Type**: Real-Time Web Analytics Platform & Econometric Data Pipeline.

**Performance Goals**: <60ms tab transition, 0ms chart collision latency, 60fps responsive canvas resize.

**Constraints**: Zero runtime external NPM build steps (Single-page Vanilla JS + Tailwind), 100% data parity between JSON and JS, zero uncaught JS exceptions.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Total Veracity & Invariant Preservation**: All 14 mathematical rules remain strictly enforced without deviation.
- **Principle II: Dual-Data Parity**: JSON files (`conflict_metrics.json`) and JS globals (`data.js`) synchronize atomically with zero drift.
- **Principle III: Primary Source Grounding**: Every derived metric links directly to primary sources (SIMA, BOE, Euronext, ADS-B).
- **Principle IV: Sensitive Information Badging**: Maintained via `.badge-sensitive` tokens.
- **Principle V: Responsive Layout & Mobile Accessibility**: Retains flex/grid layouts and accessible ARIA attributes.
- **Principle VI: Viewport & Canvas Lifecycle Management**: Enforces strict `scrollTop = 0` and `.resize()` routines upon every tab change.

## Project Structure

### Documentation (this feature)

```text
specs/007-dynamic-data-and-charts-resilience/
├── plan.md              # Implementation Plan
├── research.md          # Phase 0 Research & Technical Decisions
├── data-model.md        # Phase 1 Data Models & Schemas
├── quickstart.md        # Phase 1 Verification & Quickstart Guide
├── contracts/           # Phase 1 Interface Contracts
│   ├── chart-resilience-contract.json
│   └── dynamic-chronology-contract.json
└── checklists/
    └── requirements.md  # Requirements Quality Checklist
```

### Source Code (repository root)

```text
src/
├── analysis_engine.py          # Econometric & dynamic impact derivation
├── beluga_tracker.py           # ADS-B logistics, HTP retention, FAL buffer calculations
├── parsers/
│   ├── metric_parser.py        # External metrics & logistics parsers
│   └── telegram_parser.py      # Dynamic Telegram archive indexer
└── validate_invariants.py      # Rules 1-14 verification

dashboard/
├── index.html                  # 6-tab modular HTML structure & Chart.js canvas elements
├── app.js                      # Dynamic calculations, chart lifecycle & auto-sync engine
└── data.js                     # Canonical offline JS dataset

tests/
├── test_dashboard_ui.py        # DOM hierarchy, canvas registration & router tests
└── test_beluga_tracker.py      # Dynamic logistics unit tests
```

## Phase 0: Research & Key Decisions

- **Decision 1: Dynamic Date & Elapsed Days Derivation Engine**: Use `Date.now()` and anchor start `2026-07-20T06:00:00Z` to dynamically compute `elapsed_days` ($D = \lfloor (t - t_0) / 86400000 \rfloor$) and propagate to strike cost ($C = D \times 22.7\text{ M€/day}$).
- **Decision 2: Chart Instance Registry & Safe Lifecycle Engine**: Implement global `activeCharts = {}` map with `safeRenderChart(canvasId, createFn)` helper that invokes `activeCharts[id].destroy()` prior to canvas re-creation, wrapped in `try/catch` error boundaries.
- **Decision 3: Zero-Failure Fallback Data Ingestion**: Guarantee that any missing data point defaults to calibrated baseline without throwing null pointer exceptions.

## Phase 1: Design & Contracts

- Data entities specified in `data-model.md`.
- JSON schema contracts in `contracts/`.
- Quickstart validation guide in `quickstart.md`.
