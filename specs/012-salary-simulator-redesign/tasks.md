# Tasks: Rediseño del Módulo de Cálculo Salarial

**Input**: Design documents from `/specs/012-salary-simulator-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-contracts.md

## Phase 1: Setup & Tooltip Styling Infrastructure

- [X] T001 Define CSS math tooltip classes (`.math-tip`, `.tip-box`, `.tip-visible`) and mobile touch listener in `dashboard/index.html` and `dashboard/app.js`

## Phase 2: Foundational Cleanup (Remove Redundancies)

- [X] T002 Remove obsolete standalone audit panels (`#sec-wages-audit`), 14-row breakdown table (`#sec-wages-roi` left col), and 5-year text table in `dashboard/index.html`
- [X] T003 Remove obsolete DOM ID references (`ea-loss-*`, `ipc-audit-*`, `tb-base-*`, `tb-prop-*`, `kpi-diff-cgt-*`) from `updateWageSimulation()` in `dashboard/app.js`

## Phase 3: User Story 1 (P1) - Proposal Scenario Cards with Math Tooltips

*Goal*: Render 3 scenario cards (Empresa +5%, SIMA +9.5%, Comité +12%) with math tooltips on every KPI.
*Independent Test*: Set salary to 50k €; verify each card displays exact year 1 salary, monthly net raise, arrears, RSG clause, and year 1 net benefit with interactive formula tooltips.

- [X] T004 [US1] Implement HTML markup for 3 scenario cards (`#sec-wages-scenarios`) with `.math-tip` elements containing algebraic formulas in `dashboard/index.html`
- [X] T005 [US1] Wire scenario card IDs (`#sc1-*`, `#sc2-*`, `#sc3-*`) to `updateWageSimulation()` calculations in `dashboard/app.js`

## Phase 4: User Story 2 (P2) - Year-by-Year Salary Evolution Chart

*Goal*: Interactive 6-year line chart (2025–2030) comparing the 3 proposals against real purchasing power.
*Independent Test*: Select IPC 3.8%; verify the chart renders with Empresa decaying in real terms while SIMA stays constant and Comité grows.

- [X] T006 [US2] Add canvas container `#salaryEvolutionChart` in `dashboard/index.html`
- [X] T007 [US2] Implement `initSalaryEvolutionChart()` and `updateSalaryEvolutionChart(baseSalary, ipcRate)` with 4 datasets (Empresa, SIMA, Comité, Real Deflated Area) in `dashboard/app.js`
- [X] T008 [US2] Hook `salaryEvolutionChart` into `initAllModules()`, `switchTab()`, and `updateWageSimulation()` in `dashboard/app.js`

## Phase 5: User Story 3 (P3) - Compact ROI Calculator & Differential KPIs

*Goal*: Streamlined strike ROI calculator and 2 differential 5-year KPI cards without redundant tables.
*Independent Test*: Set strike days to 5; verify ROI shows 1.6 months amortization and differential cards show Comité vs Empresa and SIMA vs Empresa.

- [X] T009 [US3] Implement compact ROI calculator and differential KPI cards layout (`#sec-wages-roi`) in `dashboard/index.html`
- [X] T010 [US3] Wire ROI and differential IDs (`#roi-*`, `#kpi-diff-comite-5yr`, `#kpi-diff-sima-5yr`) in `dashboard/app.js`

## Phase 6: Polish & Verification

- [X] T011 Run `python3 src/validate_sources.py` to ensure 100% balanced HTML tags and primary source citations
- [X] T012 Run `python3 src/validate_invariants.py` and `python -m unittest discover tests/`
- [X] T013 Perform interactive browser verification with screenshot artifact (`11-salary-redesign-complete.png`)
