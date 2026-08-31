# Implementation Plan: Full Platform-Wide Data Audit, Verification & Zero-Unverified-Data Purge

**Branch**: `002-verify-stock-data` | **Date**: 2026-08-31 | **Spec**: [specs/002-verify-stock-data/spec.md](spec.md)

**Input**: Feature specification from `/specs/002-verify-stock-data/spec.md`

---

## Summary

Execute an exhaustive data audit across the entire repository to purge all unverified, simulated, or inaccurate numbers (focusing on Airbus SE historical stock prices, plant censuses, electoral balances, wage simulations, and Beluga logistics). Ground every retained metric in official primary sources (Euronext Paris, Airbus Investor Relations, BOE, SIMA, INE) and expand automated validation gates in `src/validate_invariants.py` and `src/validate_sources.py` to enforce the *Zero Unverified Data Policy*.

---

## Technical Context

**Language/Version**: Python 3.10+ and Vanilla JavaScript (ES6+)  
**Primary Dependencies**: None (Standard Python library: `json`, `math`, `urllib`, `unittest`; Vanilla JS with CDN Chart.js & Lucide)  
**Storage**: File-based structured JSON (`data/conflict_metrics.json`, `data/beluga_status.json`, `data/thermometer_data.json`)  
**Testing**: Python `unittest`, custom invariant assertion harness (`src/validate_invariants.py`), and source citation verifier (`src/validate_sources.py`)  
**Target Platform**: Linux/POSIX, GitHub Pages / Modern Web Browsers  
**Project Type**: Econometric Analysis Suite & Interactive Web Dashboard  
**Performance Goals**: Sub-second invariant validation across entire canonical dataset  
**Constraints**: Zero data drift between backend datasets, static JS representations, HTML UI, and PDF/Markdown dossiers. Zero tolerance for unverified data.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I (Mathematical & Invariant Integrity)**: All formulas, plant census sums (15,562), delegate allocations (198), voting results, market cap calculations, and financial loss balances strictly satisfy exact algebraic invariants.
- [x] **Principle II (Primary Source Grounding & Traceability)**: Every data point links directly to verified primary source documents (Euronext Paris `AIR.PA`, Airbus IR, BOE, SIMA, INE).
- [x] **Principle III (Single Source of Truth & Dual-Surface Parity)**: `data/conflict_metrics.json` is canonical; `dashboard/data.js` and `dashboard/index.html` maintain exact numerical parity.
- [x] **Principle IV (Automated Invariant & Schema Testing)**: Expanded invariant gatekeeper runs in CI and on commit.
- [x] **Principle V (Operational Simplicity & Zero-Build Dashboard)**: Pure Python and Vanilla JS with zero build step.

---

## Project Structure

### Documentation (this feature)

```text
specs/002-verify-stock-data/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Architecture decisions & primary source hierarchy
├── data-model.md        # Mathematical model & invariant definitions
├── quickstart.md        # Step-by-step verification commands
├── contracts/           # Data integrity schemas and CLI contracts
└── checklists/          # Requirements quality checklist
```

### Source Code

```text
data/
├── conflict_metrics.json           # Canonical audited metrics registry
├── beluga_status.json              # Verified flight & JIT logistics data
├── thermometer_data.json           # Verified sentiment & press records
└── telegram_archive/               # Verbatim assembly minutes & documents

src/
├── validate_invariants.py          # 14 mathematical & factual invariant rules
├── validate_sources.py             # 100% primary source citation verifier
├── analysis_engine.py              # Consolidated dataset generator
└── parsers/                        # Multi-source ingestion parsers

dashboard/
├── index.html                      # Interactive dashboard markup & citation links
├── app.js                          # Chart.js renderers & verified data mappings
└── data.js                         # Synchronized client-side dataset mirror

docs/
├── Guia_Estrategica_Negociacion_Huelga_Airbus_2026.md   # Audited Markdown dossier
└── Guia_Estrategica_Negociacion_Huelga_Airbus_2026.pdf  # Generated executive PDF

tests/
├── test_analysis_engine.py         # Engine regression tests
└── test_data_ingestion.py          # Ingestion & rollback tests
```

---

## Complexity Tracking

*No constitution violations. Pure standard library architecture preserved.*
