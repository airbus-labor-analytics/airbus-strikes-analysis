# Tasks: Rehaul Visual Flotante "Liquid Glass" y Navegación Global Multicapa

**Input**: Design documents from `/specs/011-floating-glass-ui-rehaul/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-contracts.md

## Phase 1: Setup & Global Navigation Framework (Completed)
- [x] **T01**: Remove left `<aside>` sidebar and restore centered full-width panoramic container `max-w-7xl mx-auto` (`dashboard/index.html`).
- [x] **T02**: Deploy Top Dynamic Island HUD (`#floating-hud`) with scroll auto-contraction/expansion (`dashboard/index.html`, `dashboard/app.js`).
- [x] **T03**: Implement Global Floating Dock (`#global-floating-dock`) with 6 module buttons, return-to-top, and active glow (`dashboard/index.html`, `dashboard/app.js`).
- [x] **T04**: Implement Subtle Right-Hand Floating Section Index (`#floating-section-nav`) with hairline guide, active zoom, and ScrollSpy (`dashboard/index.html`, `dashboard/app.js`).
- [x] **T05**: Fix and validate HTML tag balancing across all 6 tabs in `dashboard/index.html`.

## Phase 2: User Story 1 - Portal Hub (Module 0) Visual Refinement
- [x] **T06**: Refine Hero banner with mission statement, primary badges, and dark AMOLED gradient (`#sec-portal-mission`).
- [x] **T07**: Disaggregate 4 executive Flash KPIs with tabular typography and primary source links (`#sec-portal-kpis`).
- [x] **T08**: Format 5 direct access module cards with micro-badges and quick links (`#sec-portal-sitemap`).

## Phase 3: User Story 2 - Financial Center & Asymmetry (Module 1) Refinement
- [x] **T09**: Format high-impact visual comparative block: "Airbus SE (4,960 M€ profit) vs Workers' Platform (118 M€ cost)" (`#sec-overview-kpis`, `#sec-overview-chart`).
- [x] **T10**: Decouple interactive Asymmetry Simulator (185x) with dynamic slider and tabular cards (`#sec-overview-asymmetry`).
- [x] **T11**: Format Euronext AIR.PA stock evolution monitor with milestone chronology cards (`#sec-overview-stock`, `#sec-overview-solvency`).

## Phase 4: User Story 3 - Industrial Impact & Beluga Logistics (Module 2) Refinement
- [x] **T12**: Refine Pressure Thermometer ($18.0^\circ\text{C} \le T \le 96.5^\circ\text{C}$) and corporate reputation tracker (`#sec-industrial-thermo`).
- [x] **T13**: Format Beluga fleet status radar and grounded aircraft cards (`#sec-industrial-fleet`, `#sec-industrial-history`).
- [x] **T14**: Disaggregate HTP monopoly bottleneck cards and European FAL autonomy indicators (`#sec-industrial-feed`, `#sec-industrial-fals`).

## Phase 5: User Story 4 - Purchasing Power, Salary Simulator & 10D Matrix (Module 3) Refinement
- [x] **T15**: Implement multivariate salary simulator with gross salary, inflation preset, and April Effect audit (`#sec-wages-simulator`, `#sec-wages-audit`).
- [x] **T16**: Disaggregate 3 comparative proposal scenario cards with 5-year purchasing power projection (`#sec-wages-scenarios`).
- [x] **T17**: Format detailed benefits breakdown table and strike ROI calculator (`#sec-wages-roi`, `#sec-wages-losses`).
- [x] **T18**: Render 10-dimension negotiation proposal comparison matrix with interactive filter tabs (`#sec-wages-negotiation`).

## Phase 6: User Story 5 - Union Representation, Referendum & Evidence Hub (Modules 4 & 5) Refinement
- [x] **T19**: Format 198-delegate union representation cards and site-by-site explorer (`#sec-unions-delegates`, `#sec-unions-sections`).
- [x] **T20**: Render 24-July Referendum official scrutiny charts (doughnut and site comparison) (`#sec-unions-referendum`).
- [x] **T21**: Format assembly timeline, sociological drivers, and strike committee workflows (`#sec-unions-sociology`, `#sec-unions-timeline`, `#sec-unions-workflows`).
- [x] **T22**: Verify primary sources directory (269+ items) and Telegram archive with Centered Glass Modal integration (`#sec-evidence-sources`, `#sec-evidence-telegram`, `#sec-evidence-benchmarks`).

## Phase 7: Verification & Final Polish
- [x] **T23**: Run automated invariant validation: `python3 src/validate_invariants.py`.
- [x] **T24**: Run automated source citation validation: `python3 src/validate_sources.py`.
- [x] **T25**: Run full unittest suite: `python3 -m unittest discover tests/` (55 tests passing).
- [x] **T26**: Capture verified screenshot previews across all modules.
