# Feature Specification: Comparativa de Evolución Salarial Bruta y Análisis Exhaustivo de Propuestas Salariales

**Feature Branch**: `008-compare-salary-proposals`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "añade tambien una comparativa de la evolucion salarial anual bruta cada año con cada una de las propuestas mostradas, deben aparecer en la parte de calculo salarial la ultima oferta de la empresa, la ultima oferta de CGT, y la ultima oferta de la comision negociadora de la huelga. usar las fuentes de telegram y generales de notebooklm para validar los datos de toda la web. ademas deberia aparecer todas estas ofertas salariales explicadas detalladamente y mostrando las diferencias claramente entre ellas en cada uno de sus puntos, junto a la fecha de la propuesta y otros datos relevantes"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Multi-Proposal Gross Annual Wage Evolution Simulator (Priority: P1) 🎯 MVP

As an Airbus worker, assembly delegate, or negotiation analyst, I want to compare the projected 5-year gross annual salary evolution across the 3 competing wage proposals (Company's Last Offer, CGT's Platform, and Strike Committee's 11-Point Unanimous Platform) for any configurable base salary, so that I can see the exact year-by-year gross earnings, retroactive payments, and cumulative purchasing power difference between them.

**Why this priority**: Workers need immediate clarity on how much money each proposal actually puts in their pockets year-by-year (2026 to 2030) versus the accumulated inflation loss from 2020-2025.

**Independent Test**: Load the wage calculation module, adjust the base gross annual salary slider (e.g. 35.000 €, 50.000 €, 65.000 €), and verify that all 3 proposals dynamically calculate and render their nominal year-by-year gross salaries, retroactive arrears payouts, and 5-year cumulative totals in both a comparison chart and summary metrics cards.

**Acceptance Scenarios**:

1. **Given** a baseline salary input of 50.000 €/year, **When** the simulator computes the 5-year trajectory, **Then** it calculates:
   - **Company Offer (27/08/2026)**: 2026 (+5% fraccionado a mitad de año + 0 € atrasos 2026 = 51.250 € bruto), 2027 (+5% condicionado + 2.000 € paga única = 55.812 € bruto), y progresión a 2030 con techo del 1% anual o 7,6% a 5 años.
   - **CGT Platform**: 2026 (+14% lineal consolidado + 8.500 € pago único atrasos = 65.500 € bruto), y progresión 2027–2030 con IPC real + 2,0% garantizado sin topes.
   - **Strike Committee 11-Point Platform (27/08/2026)**: 2026 (+12% consolidado en tablas a 01/01 + 7.500 € pago único atrasos = 63.500 € bruto), y progresión 2027–2030 con IPC real + 1,5% RSG consolidada sin topes.
2. **Given** any inflation rate parameter (default 2.5% IPC real anual), **When** toggling between nominal gross euros and inflation-adjusted real purchasing power, **Then** the simulator shows the exact gross gap in cumulative euros between the Company's offer and the Union/CGT demands over the 5-year horizon.

---

### User Story 2 - Comprehensive Point-by-Point Proposal Breakdown & Difference Matrix (Priority: P2)

As a trade union negotiator or factory assembly member, I want an exhaustive, point-by-point comparative matrix explaining every clause of the 3 proposals (Company, CGT, and Strike Committee 11-Points), including submission dates, scope, non-wage clauses (Bradford IT, telework, Bromo, strike pay, relief contracts), and source citations, so that I can evaluate the qualitative and legal differences beyond base salary percentages.

**Why this priority**: Contract negotiations are not only about percentage tables; crucial dispute blockers (like Bradford sick leave penalties, Bromo job security, and telework subsidies) dictate the acceptability of an offer.

**Independent Test**: Navigate to the detailed proposal breakdown section and verify that all 3 offers display their official submission dates, promoters, formal status in SIMA, and itemized comparisons across all 10 core bargaining categories with primary source tags.

**Acceptance Scenarios**:

1. **Given** the point-by-point comparison view, **When** the user inspects any bargaining dimension (e.g., "Atrasos y Pago Único", "Método Bradford / IT", "Teletrabajo", "Garantías Bromo"), **Then** the table displays the exact position of the Company (Airbus SE), CGT, and the Strike Committee with source verification badges (Telegram minutes, SIMA filings, BOE).
2. **Given** the differences highlight mode, **When** viewing the comparison, **Then** distinct color-coded badges highlight whether each point represents a "Retroceso / Bloqueo", "Avance Parcial", or "Mandato Asambleario Blindado".

---

### User Story 3 - Interactive Proposal Selector & Visual Differential Chart (Priority: P3)

As a platform visitor, I want to toggle proposals in the chart legend and view a differential delta card showing the net monetary gain of the Strike Committee platform and CGT platform relative to Airbus SE's offer, so that I can easily communicate the cost of concession to fellow workers.

**Why this priority**: Enables clear visual communication for assembly meetings and union bulletins.

**Independent Test**: Select/deselect proposal series in the chart and verify that the differential KPI cards dynamically compute the exact difference in cumulative gross euros for the chosen base salary.

**Acceptance Scenarios**:

1. **Given** a 50.000 € base salary, **When** comparing the Strike Committee platform against the Company offer, **Then** the differential card displays the exact cumulative 5-year surplus (+42.500 € a +58.000 € brutos adicionales acumulados) and explains the primary drivers (12% initial consolidation + 7.500 € lump-sum + IPC+1.5% RSG).

---

### Edge Cases

- What happens if the user enters an extreme base salary (e.g., 15.000 € or 150.000 €)? The system clamps inputs to valid aerospace collective agreement salary brackets (20.000 € to 120.000 €) with clean mathematical scaling.
- What happens if inflation (IPC) spikes to 5% or drops to 0%? The RSG formulas dynamically adjust the out-year projections (2027–2030) according to each proposal's specific revision clause rules (Company cap vs. Union uncapped).
- How are fractional first-year effective dates handled? The simulator models exact consolidation timing (Company's delayed April effect vs. Union's retroactive 1st of January consolidation).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a dedicated 3-way Gross Annual Salary Evolution Simulator incorporating:
  1. *Última Oferta Empresa (Airbus SE / RRHH - 27/08/2026)*: 5% 2026 fraccionado, 5% 2027 condicionado, 2.000 € paga única aplazada a 2027, o 7,6% a 5 años.
  2. *Última Oferta CGT (Plataforma Asamblearia - Agosto 2026)*: 14% consolidado a 01/01/2026, 8.500 € pago único retroactivo, RSG = IPC real + 2,0% sin topes, jornada 32h/35h.
  3. *Última Oferta Comité de Huelga Soberano (11 Puntos SIMA - 27/08/2026)*: 12% consolidado a 01/01/2026, 7.500 € pago único retroactivo, RSG = IPC real + 1,5% sin topes.
- **FR-002**: System MUST calculate year-by-year gross earnings from Year 0 (2025 Base) through Year 5 (2030) for each proposal based on user-selected base salary (default 50.000 €/year) and inflation assumption (default 2.5% IPC).
- **FR-003**: System MUST compute and display cumulative 5-year gross earnings, total arrears payouts, and monetary delta versus the Company offer for all proposals.
- **FR-004**: System MUST render an interactive multi-line Chart.js visualization (`salaryProposalsChart` / `wagesChart` extension) with distinct styling:
  - Company Offer: Red / Rose line (`#f43f5e`, dashed or solid).
  - CGT Platform: Emerald / Green line (`#10b981`).
  - Strike Committee 11-Points: Amber / Purple line (`#f59e0b` / `#8b5cf6`).
  - Inflation Benchmark (IPC Real): Slate dashed line (`#64748b`).
- **FR-005**: System MUST include a Comprehensive Point-by-Point Proposal Breakdown Table detailing:
  - Fecha formal de presentación y registro en SIMA / Asambleas.
  - Incremento inicial en tablas y fecha de consolidación efectiva.
  - Pago único retroactivo (Atrasos).
  - Cláusula de revisión salarial (RSG) y topes de inflación.
  - Vigencia temporal del convenio.
  - Método Bradford / Nulidad y reintegro de complementos de IT.
  - Regulación y compensación de gastos de teletrabajo.
  - Empleo y carga industrial (Garantía Bromo, internalización de subcontratas).
  - Prejubilaciones y contrato de relevo al 100%.
  - Salarios devengados en jornadas de huelga e indemnidad laboral.
- **FR-006**: All data points, dates, and percentages MUST be validated against canonical primary sources: official SIMA minutes, Telegram assembly minutes (`data/telegram_archive/`), and Airbus SE financial dossiers.
- **FR-007**: System MUST synchronize all calculation models between the backend analytical engine (`src/analysis_engine.py`) and client dashboard (`dashboard/app.js`, `dashboard/data.js`), satisfying 100% data parity.
- **FR-008**: System MUST update the static HTML structure in `dashboard/index.html` within Module 3 (`tab-purchasing-power` / `#tab-wages`) to present the 3-way simulator, KPI delta cards, and expandable detail accordion/tabs without layout breakage.

### Key Entities

- **WageProposal**: Represents a formal bargaining proposal with attributes: `id`, `name`, `proposer` (Company, CGT, Strike Committee), `date`, `status`, `initial_increase_pct`, `consolidation_date`, `retroactive_lump_sum_eur`, `rsg_formula`, `rsg_cap_pct`, `duration_years`, and `non_wage_clauses`.
- **AnnualWageProjection**: Represents projected gross annual salary per year (2025 to 2030), nominal earnings, real deflated earnings, annual wage increase, and cumulative 5-year totals.
- **ProposalComparisonMatrix**: Represents the multidimensional category-by-category comparison across all active and historical offers.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can interactively compare gross annual salaries across all 3 proposals with instant (<16ms) calculation and chart rendering upon moving sliders or switching toggles.
- **SC-002**: 100% data parity between `src/analysis_engine.py`, `data/conflict_metrics.json`, and `dashboard/data.js` across all 3 proposal models.
- **SC-003**: 100% of the 10 bargaining dimensions in the point-by-point matrix have verified dates, clauses, and primary source citations.
- **SC-004**: Automated unit test suites (`test_analysis_engine.py`, `test_dashboard_ui.py`) achieve 100% pass rate with zero regression in existing 14 invariant rules.

## Assumptions

- Base gross annual salaries are standard aerospace gross earnings (Group 1–5 white/blue collar ranges: 25.000 € to 85.000 €/year; median 50.000 €).
- Inflation baseline assumes an average annual IPC of 2.5%, adjustable between 1.0% and 6.0%.
- Proposals are grounded in official records: Airbus SIMA offer (27/08/2026), CGT assembly platform (July/August 2026), and Strike Committee 11 Points (27/08/2026).
