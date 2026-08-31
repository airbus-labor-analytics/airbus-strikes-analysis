# Implementation Plan: Comparativa de Evolución Salarial Bruta Anual y Análisis Exhaustivo de Propuestas

**Branch**: `008-compare-salary-proposals` | **Date**: 2026-08-31 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/008-compare-salary-proposals/spec.md`

## Summary

Implement a comprehensive 3-way Gross Annual Salary Evolution Simulator and a detailed Point-by-Point Proposal Breakdown in Module 3 (Purchasing Power & Negotiations) comparing:
1. **Última Oferta Empresa (Airbus SE / RRHH - 27/08/2026)**: 5% fraccionado en 2026, 5% condicionado en 2027, 2.000 € paga única aplazada o 7,6% a 5 años.
2. **Última Propuesta CGT (Plataforma Asamblearia - Agosto 2026)**: 14% consolidado en tablas a 01/01/2026, 8.500 € pago único retroactivo, RSG = IPC real + 2,0% sin topes, jornada 32h/35h.
3. **Última Oferta Comisión Negociadora / Comité de Huelga Soberano (11 Puntos SIMA - 27/08/2026)**: 12% consolidado a 01/01/2026, 7.500 € pago único retroactivo, RSG = IPC real + 1,5% sin topes.

Includes full mathematical simulation (2025–2030), multi-line Chart.js visualization, 10-dimension comparison matrix, and full data synchronization across Python engine, JSON fixtures, and client dashboard.

---

## Technical Context

**Language/Version**: Python 3.11+ (Backend calculation & invariant testing), Vanilla JavaScript ES2022 (Frontend zero-build dashboard).

**Primary Dependencies**: Chart.js v4.4.x (via CDN), Lucide Icons (via CDN), standard Python libraries (`json`, `math`, `unittest`, `dataclasses`).

**Storage**: Canonical structured JSON datasets in `data/conflict_metrics.json`.

**Testing**: Python `unittest` (`test_analysis_engine.py`, `test_dashboard_ui.py`), custom invariant checker (`validate_invariants.py`, `validate_sources.py`).

**Target Platform**: Modern Web Browsers (Chrome, Firefox, Safari, Edge, Mobile Responsive), Zero-Build Static Hosting (GitHub Pages).

**Project Type**: Single static web application with analytical Python data pipeline.

**Performance Goals**: Sub-16ms synchronous calculation and DOM update on slider interactions; zero memory leaks across tab switches.

**Constraints**: Dual-surface parity between Python and JS calculations; strict adherence to official primary sources (SIMA, BOE, Telegram archives).

**Scale/Scope**: 15.562 Airbus workers impacted in Spain; 6 major factories; 3 competing bargaining platforms modeled over 5-year projections (2025–2030).

---

## Constitution Check

*GATE: Verified before Phase 0 research and after Phase 1 design.*

| Principle | Requirement | Compliance & Strategy | Status |
|---|---|---|---|
| **I. Mathematical Integrity** | All metrics & projections mathematically balanced | Complete algebraic formulations in `research.md` and `data-model.md` | **PASSED** |
| **II. Primary Source Grounding** | All claims traced to verifiable primary sources | Grounded in SIMA 27/08 records, BOE collective agreements, and authenticated assembly minutes | **PASSED** |
| **III. Dual-Surface Parity** | `src/` and `dashboard/` share identical schemas and logic | `calculateSalaryProposals` and `get_salary_proposals_comparison` share identical math and JSON structure | **PASSED** |
| **IV. Automated Testing** | Guarded by invariant checks and unit tests | Added test cases in `test_analysis_engine.py` and `test_dashboard_ui.py` | **PASSED** |
| **V. Zero-Build Simplicity** | Pure Vanilla JS + standard Python libraries | Zero npm build tools, transpilers, or heavy frameworks | **PASSED** |
| **VI. Viewport & Canvas** | Resilient chart rendering and resize lifecycle | Leverages `renderResilientChart` with zero-delay updates | **PASSED** |

---

## Project Structure

### Documentation (this feature)

```text
specs/008-compare-salary-proposals/
├── plan.md              # This implementation plan
├── research.md          # Phase 0 mathematical and technical research
├── data-model.md        # Phase 1 data entities and validation rules
├── quickstart.md        # Phase 1 quickstart and testing guide
├── contracts/           # Phase 1 JSON and UI schemas
│   ├── salary_proposals_schema.json
│   └── ui_contracts.md
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── analysis_engine.py            # Backend analytical engine with salary proposals model
├── validate_invariants.py        # Invariant and mathematical consistency validation
└── validate_sources.py           # Primary source verification and DOM validator

data/
└── conflict_metrics.json         # Canonical dataset with proposal definitions & matrix

dashboard/
├── index.html                    # Static HTML layout for Module 3 with proposals matrix & simulator
├── app.js                        # Client-side reactivity, slider bindings, Chart.js updates
└── data.js                       # Offline fallback baseline dataset

tests/
├── test_analysis_engine.py       # Unit tests for backend salary proposal calculations
└── test_dashboard_ui.py          # Static DOM tests verifying UI bindings and elements
```

---

## Design & Architecture Decisions

| Decision | Problem Addressed | Chosen Alternative & Rationale |
|---|---|---|
| **3-Way Dynamic Projection Engine** | Need to compare Company, CGT, and Strike Committee proposals simultaneously | Single unified calculation function parameterizing base salary ($W_0$) and inflation ($i$) across all 3 proposals to guarantee synchronous calculation and chart rendering. |
| **10-Dimension Bargaining Matrix** | Need to explain all non-wage clauses and legal differences | Structured JSON comparison matrix dynamically rendered in HTML table with badge tags for easy reading in assemblies. |
| **Multi-line Chart with CPI Baseline** | Need to visualize cumulative earnings and purchasing power loss | Chart.js 4-dataset line chart with distinct colors, tooltips, and real deflators. |
