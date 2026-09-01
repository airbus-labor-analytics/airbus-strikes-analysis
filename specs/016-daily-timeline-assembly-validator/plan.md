# Implementation Plan: Daily Timeline Freshness Validator & Detailed Factory Assembly Minutes

**Branch**: `016-daily-timeline-assembly-validator` | **Date**: 2026-09-01 | **Spec**: [specs/016-daily-timeline-assembly-validator/spec.md](spec.md)

**Input**: Feature specification from `specs/016-daily-timeline-assembly-validator/spec.md`

## Summary

Build an automated daily timeline freshness validator (`src/validate_timeline_freshness.py`), expand conflict timeline datasets in `data/conflict_metrics.json` with continuous daily updates from company communications, union releases, SIMA mediations, and factory assembly minutes up to today (September 1, 2026), integrate a dynamic freshness alert banner in `#sec-unions-timeline` with Telegram archive modal viewers, and register Rule 15 in `src/validate_invariants.py`.

---

## Technical Context

**Language/Version**: Python 3.11+ / JavaScript (Vanilla ES2022, zero build toolchain)  
**Primary Dependencies**: Standard Library (`datetime`, `zoneinfo`, `json`, `pathlib`, `unittest`)  
**Storage**: JSON flat files (`data/conflict_metrics.json`, `data/telegram_archive/telegram_index.json`)  
**Testing**: `python3 -m unittest`, `validate_invariants.py`, `validate_sources.py`  
**Target Platform**: Linux / Modern Web Browsers (Chrome, Firefox, Safari)  
**Project Type**: Strike analytics web dashboard and automated data validation suite  
**Performance Goals**: Instant client-side timeline rendering (<50ms), validator runtime <100ms  
**Constraints**: Zero client-side framework overhead; pure CSS + DOM manipulation; complete primary source traceability  
**Scale/Scope**: 7 Airbus manufacturing plants, 30+ chronological milestones and assembly minutes, 5 trade unions  

---

## Constitution Check

| Principle / Gate | Status | Evidence / Implementation Detail |
| :--- | :--- | :--- |
| **I. Mathematical & Invariant Integrity** | PASS | Timeline dates follow strict chronological monotonicity; no duplicate IDs; all references verified. |
| **II. Primary Source Grounding** | PASS | Every assembly minute and timeline milestone links directly to primary sources or authenticated documents in `data/telegram_archive/`. |
| **III. Zero-Blank-Screen Offline Baseline** | PASS | Timeline data is embedded directly in initial datasets without requiring dynamic external fetch failures. |
| **IV. Automated Invariant & Schema Testing** | PASS | Validator added as Rule 15 in `validate_invariants.py` and unit tests in `tests/test_timeline_freshness.py`. |
| **V. Radical Architectural Simplicity** | PASS | Pure Python standard library (`zoneinfo`, `datetime`), vanilla DOM rendering, no heavy dependencies. |
| **VI. Viewport & Canvas Lifecycle** | PASS | Timeline UI maintains responsive layout without chart container crashes or memory leaks. |

---

## Project Structure

### Documentation (this feature)

```text
specs/016-daily-timeline-assembly-validator/
├── spec.md               # Feature specification
├── plan.md               # Implementation plan
├── research.md           # Research & architecture decisions (Phase 0)
├── data-model.md         # Entity schemas & invariants (Phase 1)
├── quickstart.md         # Quickstart & validation guide (Phase 1)
├── contracts/            # JSON Schema contracts (Phase 1)
│   ├── timeline_freshness_contract.json
│   └── assembly_minutes_contract.json
└── checklists/
    └── requirements.md   # Specification quality checklist
```

### Source Code (affected components)

```text
src/
├── validate_timeline_freshness.py  # Standalone CLI validator for daily freshness
├── validate_invariants.py          # Adds Rule 15: Timeline Freshness & Monotonicity
└── analysis_engine.py              # Timeline metrics & status helper functions

data/
├── conflict_metrics.json           # Comprehensive timeline milestones & assembly minutes
└── telegram_archive/
    └── telegram_index.json         # Document catalog index

dashboard/
├── index.html                      # Freshness banner container & assembly minutes UI
├── app.js                          # Timeline rendering & freshness evaluation
└── js/modules/
    └── union_force.js              # Timeline filtering, search, and modal triggers

tests/
└── test_timeline_freshness.py      # Unit tests for freshness logic & timezone math
```

---

## Execution Phases

### Phase 0: Research & Alignment (Complete)
- Evaluated `Europe/Madrid` timezone handling with `zoneinfo`.
- Designed 4-state freshness status lifecycle (`UP_TO_DATE`, `PENDING_TODAY`, `STALE_ALERT`, `WEEKEND_PAUSE`).
- Documented in `research.md`.

### Phase 1: Data Contracts & Design (Complete)
- Defined `TimelineMilestone` and `TimelineFreshnessStatus` schemas in `data-model.md`.
- Authored contract schemas in `contracts/`.
- Authored verification walkthrough in `quickstart.md`.

### Phase 2: Tasks & Implementation Breakdown (Next via `/speckit.tasks`)
- Implement `src/validate_timeline_freshness.py`.
- Update `data/conflict_metrics.json` with comprehensive daily timeline entries up to September 1, 2026.
- Wire `Rule 15` in `src/validate_invariants.py`.
- Implement dynamic freshness banner & filterable timeline view in `dashboard/app.js` and `dashboard/index.html`.
- Create `tests/test_timeline_freshness.py` and validate all invariant suites.
