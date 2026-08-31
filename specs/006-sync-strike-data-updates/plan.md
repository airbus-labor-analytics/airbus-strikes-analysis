# Implementation Plan: Strike Data Sync, Sensitive Information Badges & User Validation Gate

**Branch**: `006-sync-strike-data-updates` | **Date**: 2026-08-31 | **Spec**: [specs/006-sync-strike-data-updates/spec.md](spec.md)

---

## Summary

Implement an interactive user validation gate for strike data updates parsed from Telegram archives and source documents, introduce prominent visual badges for sensitive/unreviewed negotiation information on the dashboard, and synchronize approved metrics across all canonical datasets (`data/conflict_metrics.json`, `dashboard/data.js`, `docs/Guia_Estrategica_Negociacion_Huelga_Airbus_2026.md`) with 100% invariant consistency.

---

## Technical Context

**Language/Version**: Python 3.10+ / Vanilla JavaScript (ES2022)
**Primary Dependencies**: Standard Python libraries (`json`, `urllib`, `re`, `html.parser`, `pathlib`), Chart.js 4.4, Tailwind CSS, Lucide Icons
**Storage**: JSON files under `data/` (`conflict_metrics.json`, `beluga_status.json`, `telegram_index.json`, `sources_catalog.json`)
**Testing**: Python `unittest` (`python3 -m unittest discover tests`), `python3 src/validate_sources.py`, `python3 src/validate_invariants.py`
**Target Platform**: Browser (HTTP & local `file:///`), Linux server / GitHub Actions CI
**Project Type**: Analytical data ingestion engine + client-side web dashboard
**Performance Goals**: Instantaneous validation prompt, sub-second dataset synchronization, zero client layout lag
**Constraints**: 100% adherence to Constitution Principles I–VI (Invariant Integrity, Grounded Citations, Dual-Surface Parity, Automated Testing, Zero-Build Dashboard, Viewport/Canvas Lifecycle).

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Notes |
|---|:---:|---|
| **I. Mathematical & Invariant Integrity** | ✅ PASS | All parsed strike metrics (e.g. 7500€ lump-sum, 12% retroactive increase, 15,562 workers) must satisfy conservation rules 1–14 in `validate_invariants.py`. |
| **II. Primary Source Grounding** | ✅ PASS | All new items must cite verifiable primary filings (e.g. SIMA 27/08 certificate, Strike Committee proposal `Propuesta_ComiteHuelga270826.pdf.txt`). |
| **III. Single Source of Truth & Dual-Surface Parity** | ✅ PASS | Updates written to `data/conflict_metrics.json` must synchronously propagate to `dashboard/data.js` and Markdown guides without divergence. |
| **IV. Automated Testing** | ✅ PASS | Updates will be validated against `test_analysis_engine.py`, `test_data_ingestion.py`, and `test_dashboard_ui.py`. |
| **V. Operational Simplicity & Zero-Build Dashboard** | ✅ PASS | UI badges and prompts use vanilla HTML/JS and Tailwind classes with zero build steps. |
| **VI. Viewport & Canvas Lifecycle Management** | ✅ PASS | Modifying DOM elements preserves `scrollTop = 0` and `.resize()` canvas lifecycle contracts. |

---

## Project Structure

### Documentation (this feature)

```text
specs/006-sync-strike-data-updates/
├── plan.md              # This implementation plan
├── research.md          # Phase 0: Technical decisions on validation prompts and sensitive badging
├── data-model.md        # Phase 1: Data schemas for sync items, validation manifests, and markers
├── quickstart.md        # Phase 1: Verification runbook
├── contracts/           # Phase 1: JSON schema for validation manifest & ingestion events
│   └── sync-validation-contract.json
└── checklists/
    └── requirements.md
```

### Source Code Layout

```text
src/
├── data_ingestion.py       # Ingestion CLI coordinator & Telegram parser updates
├── analysis_engine.py      # Econometric calculations & 11-point platform cost models
├── validate_invariants.py  # Repository invariant validation gates (Rules 1-14)
├── validate_sources.py     # HTML tag balancer & primary source link scanner
└── parsers/
    └── telegram_parser.py  # Telegram archive extraction & sensitive info classification

data/
├── conflict_metrics.json   # Canonical data source of truth
├── beluga_status.json      # Beluga logistics tracking dataset
├── sources_catalog.json    # Primary sources catalog (269 sources)
└── telegram_archive/       # Verbatim Telegram files and assembly minutes

dashboard/
├── index.html              # Dashboard markup with sensitive info badges
├── app.js                  # View-controller & live polling logic
└── data.js                 # Synchronized client-side dataset mirror

tests/
├── test_analysis_engine.py # Unit tests for econometric calculations
├── test_data_ingestion.py  # Ingestion pipeline & validation tests
└── test_dashboard_ui.py    # UI hierarchy, tag balancing, and lifecycle tests
```

**Structure Decision**: Single project layout with direct modular scripts in `src/` and zero-build static frontend in `dashboard/`.

---

## Complexity Tracking

*No constitution violations. All solutions adhere to stdlib Python and vanilla frontend.*
