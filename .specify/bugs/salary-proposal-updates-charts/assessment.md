# Bug Assessment: Modifying Custom Salary Proposal Does Not Update Charts and Metrics

- **Slug**: salary-proposal-updates-charts
- **Created**: 2026-09-01T18:50:00Z
- **Source**: pasted text ("modificar mi propuesta de oferta salarial no actualiza practicamente ningun grafico y numero relevante como por ejemplo Evolución del Salario Bruto Anual: 3 Propuestas vs. Inflación (2025 – 2030) , Tu Propuesta vs. Empresa (+5%) , ente otros, corrigelo en todos los que sean de relevancia")
- **Verdict**: valid
- **Severity**: high

## Report (verbatim or summarized)

> "modificar mi propuesta de oferta salarial no actualiza practicamente ningun grafico y numero relevante como por ejemplo Evolución del Salario Bruto Anual: 3 Propuestas vs. Inflación (2025 – 2030) , Tu Propuesta vs. Empresa (+5%) , ente otros, corrigelo en todos los que sean de relevancia"

## Symptom

When a user adjusts the sliders, inputs, or presets in the custom salary proposal builder (e.g., initial raise %, retroactive arrears, RSG inflation linkage, margin, or cap) in Module 3 (`#tab-purchasing-power`), the changes do not reflect in the relevant charts and KPI cards:
1. `salaryEvolutionChart` ("Evolución del Salario Bruto Anual: 3 Propuestas vs. Inflación (2025 – 2030)") remains static or does not redraw with the user's custom proposal trajectory.
2. The differential KPI card `kpi-diff-custom-5yr` ("Tu Propuesta vs. Empresa (+5%)") does not update.
3. Multi-proposal 5-year comparison table values (`tb-prop-*`) do not recalculate.
4. `wagesChart` ("Pérdida/Ganancia de Poder Adquisitivo Acumulado") does not reflect the custom curve.

## Reproduction

1. Open `dashboard/index.html` and switch to `#tab-purchasing-power`.
2. Locate the "Constructor de Propuesta Personalizada" section.
3. Modify the initial raise input (`#sim-custom-raise-input`) from `8.0%` to `15.0%` or adjust the retroactive arrears (`#sim-custom-arrears`).
4. Inspect the browser console: a runtime error `Uncaught ReferenceError: medBaseSalary is not defined at updateWageSimulation (app.js:1376)` is thrown.
5. Observe that the execution of `updateWageSimulation()` halts at line 1376, before reaching `calculateSalaryProposals()`, `updateSalaryEvolutionChart()`, and `updateWagesChart()`.

## Suspected Code Paths

- `dashboard/app.js:1376-1381` — `updateWageSimulation()` contains legacy leftover lines attempting to set text content for obsolete mediation scenario elements (`scen-med-salary`, `scen-med-salary-5yr`, `scen-med-real-5yr`, `scen-med-monthly`, `scen-med-net-monthly`, `scen-med-net-total`) referencing undeclared variables (`medBaseSalary`, `medNomYear5`, `medRealYear5`, `medRealGainPct`, `medMonthlyIncrease`, `medNetMonthlyIncrease`, `medNetTotalGain`).
- `dashboard/app.js:1457-1501` — All logic after line 1376 (`calculateSalaryProposals()`, differential KPI cards `kpi-diff-custom-5yr`, `updateSalaryEvolutionChart()`, and `updateWagesChart()`) is blocked from executing due to the uncaught `ReferenceError`.
- `tests/test_dashboard_ui.py` / `tests/test_chart_resilience.py` — Tests verify initial chart rendering but do not simulate user input events on `sim-custom-raise-input` or assert dynamic chart data updates on custom proposal changes.

## Root Cause Hypothesis

During a previous redesign of the salary simulator, a legacy 4th "Mediation Proposal" scenario was removed from the simulation logic, but 6 lines attempting to populate `scen-med-*` DOM elements using `medBaseSalary` variables were left in `dashboard/app.js`. When any input or slider in the proposal builder triggers `updateWageSimulation()`, the function throws `ReferenceError: medBaseSalary is not defined` at line 1376 and aborts execution before reaching the multi-proposal calculations, the differential KPI card updates (`kpi-diff-custom-5yr`), and the chart redraw calls (`updateSalaryEvolutionChart` and `updateWagesChart`).

*Confidence: High*

## Proposed Remediation

**Preferred**:
1. Remove the dead legacy lines 1376–1381 in `dashboard/app.js:updateWageSimulation()`.
2. Verify and ensure that `updateWageSimulation()` cleanly executes to completion, updating:
   - Scenario 3 UI cards (`sc3-*`)
   - Breakdown tables (`tb-*` and `tb-prop-*`)
   - Differential KPI cards (`kpi-diff-custom-5yr` and `kpi-diff-custom-5yr-real`)
   - `salaryEvolutionChart` via `updateSalaryEvolutionChart(curSalary, ipcRate)`
   - `wagesChart` via `updateWagesChart(curSalary, ipcRate)`
   - Simulator share URL sync via `syncSimulatorURL()`
3. Add an automated unit and integration test in `tests/test_dashboard_ui.py` or `tests/test_chart_resilience.py` that verifies:
   - `updateWageSimulation()` and custom proposal state calculations execute with zero exceptions for arbitrary user inputs.
   - Modifying custom proposal inputs (raise %, arrears, margin, cap) updates `salaryEvolutionChart` dataset 1 and `kpi-diff-custom-5yr`.

**Files likely to change**:
- `dashboard/app.js`
- `tests/test_chart_resilience.py` (or `tests/test_dashboard_ui.py`)

**Tests to add or update**:
- Test simulating custom salary proposal changes and validating that `salaryEvolutionChart` dataset and differential metrics recalculate without errors.

## Risks & Considerations

- Zero risk of regression: The removed lines referenced non-existent variables and non-existent DOM elements. Removing them allows `updateWageSimulation()` to complete normally.

## Open Questions

None. The root cause is fully verified.
