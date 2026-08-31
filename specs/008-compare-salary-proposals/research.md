# Research & Technical Decisions: Gross Annual Wage Evolution & Proposal Comparison

**Feature**: `008-compare-salary-proposals`
**Date**: 2026-08-31
**Status**: Completed

## 1. Mathematical Formulation for Gross Annual Wage Evolution (2025–2030)

### 1.1 Baseline Parameters
Let $W_0$ be the base gross annual salary in 2025 (e.g. 50.000 €).
Let $i$ be the annual inflation rate (CPI / IPC Real, default $i = 0.025$).
Let $Y \in \{0, 1, 2, 3, 4, 5\}$ represent years from 2025 (Year 0) to 2030 (Year 5).

### 1.2 Proposal 1: Empresa (Airbus SE / RRHH - 27/08/2026)
- **Year 0 (2025)**: $W_{0, \text{co}} = W_0$.
- **Year 1 (2026)**:
  $$\text{Nominal Base} = W_0 \times (1 + 0.05) - \text{EfectoAbrilLossQ1}$$
  $$\text{Arrears} = 0 \text{ € (paga aplazada a 2027)}$$
  $$W_{1, \text{co}} = W_0 \times 1.05 - (W_0 \times 0.05 \times 0.25) = W_0 \times 1.0375$$
- **Year 2 (2027)**:
  $$W_{2, \text{co}} = (W_0 \times 1.05) \times (1 + \min(i \times 0.25, 0.01)) + 2.000 \text{ € (Paga Única)}$$
- **Years 3–5 (2028–2030)**:
  $$W_{y, \text{co}} = W_{y-1, \text{co,base}} \times (1 + \min(i \times 0.25, 0.01))$$
  (where company out-year escalation is capped at 1.0% per annum under the 7.6% 5-year cap).

### 1.3 Proposal 2: CGT (Plataforma Asamblearia - Agosto 2026)
- **Year 0 (2025)**: $W_{0, \text{cgt}} = W_0$.
- **Year 1 (2026)**:
  $$\text{Nominal Base} = W_0 \times (1 + 0.14) = W_0 \times 1.14 \text{ (Consolidado 100% a 01/01/2026)}$$
  $$\text{Arrears} = 8.500 \text{ € (Pago Único Reparación 2020–2025)}$$
  $$W_{1, \text{cgt}} = W_0 \times 1.14 + 8.500 \text{ €}$$
- **Years 2–5 (2027–2030)**:
  $$W_{y, \text{cgt}} = W_{y-1, \text{cgt,base}} \times (1 + i + 0.02) \text{ (IPC + 2.0% RSG)}$$

### 1.4 Proposal 3: Comité de Huelga Soberano (11 Puntos SIMA - 27/08/2026)
- **Year 0 (2025)**: $W_{0, \text{comite}} = W_0$.
- **Year 1 (2026)**:
  $$\text{Nominal Base} = W_0 \times (1 + 0.12) = W_0 \times 1.12 \text{ (Consolidado 100% a 01/01/2026)}$$
  $$\text{Arrears} = 7.500 \text{ € (Pago Único Atrasos)}$$
  $$W_{1, \text{comite}} = W_0 \times 1.12 + 7.500 \text{ €}$$
- **Years 2–5 (2027–2030)**:
  $$W_{y, \text{comite}} = W_{y-1, \text{comite,base}} \times (1 + i + 0.015) \text{ (IPC + 1.5% RSG)}$$

### 1.5 Cumulative 5-Year Earnings & Differential Formulation
For any proposal $P \in \{\text{Empresa}, \text{CGT}, \text{Comité}\}$:
$$\text{CumulativeNominal}(P) = \sum_{y=1}^{5} W_{y, P}$$
$$\text{CumulativeReal}(P) = \sum_{y=1}^{5} \frac{W_{y, P}}{(1 + i)^y}$$
$$\Delta_{\text{Nominal}}(P) = \text{CumulativeNominal}(P) - \text{CumulativeNominal}(\text{Empresa})$$
$$\Delta_{\text{Real}}(P) = \text{CumulativeReal}(P) - \text{CumulativeReal}(\text{Empresa})$$

---

## 2. Technical Decisions & Architecture

### Decision 1: Backend & Frontend Calculation Parity
- **Rationale**: Constitution Principle III requires Dual-Surface Parity. The Python engine (`src/analysis_engine.py`) and client dashboard (`dashboard/app.js`, `dashboard/data.js`) must implement the exact identical formulas and rounding rules.
- **Implementation**:
  - `src/analysis_engine.py`: Function `get_salary_proposals_comparison(base_salary, cpi_rate)` returns structured JSON data containing detailed projections for all 3 proposals.
  - `dashboard/app.js`: Function `calculateSalaryProposals(baseSalary, ipcRate)` executes identical logic in JavaScript for client-side zero-latency slider interactions.

### Decision 2: Multi-line Visual Chart Integration
- **Rationale**: Chart.js v4 canvas in `#tab-purchasing-power` should visually differentiate all 3 proposals + inflation baseline with high contrast, color-blind friendly palettes, and tooltip inspection.
- **Styling**:
  - CGT Platform: Emerald `#10b981` (Solid 3px line, shaded area).
  - Strike Committee (11 Puntos): Amber `#f59e0b` / Sky `#38bdf8` (Solid 3px line).
  - Airbus SE Offer: Rose `#f43f5e` (Dashed line 2.5px).
  - Real CPI Deflator / No Strike Baseline: Slate `#64748b` (Dotted 1.5px).

### Decision 3: Comprehensive Point-by-Point Comparison Matrix
- **Rationale**: The user requested a detailed, point-by-point breakdown covering all non-wage clauses, submission dates, and primary source citations.
- **Structure**: 10 canonical dimensions:
  1. Incremento Salarial Inicial en Tablas
  2. Pago Único / Atrasos Retroactivos
  3. Cláusula de Revisión Salarial (RSG) y Topes
  4. Vigencia Temporal del Convenio Colectivo
  5. Jornada Anual y Flexibilidad
  6. Método Bradford e Incapacidad Temporal (IT)
  7. Teletrabajo y Compensación de Gastos
  8. Empleo y Carga Industrial (Proyecto Bromo)
  9. Prejubilaciones y Contrato de Relevo (100%)
  10. Salarios de Huelga, Indemnidad y Cláusula de Cierre
