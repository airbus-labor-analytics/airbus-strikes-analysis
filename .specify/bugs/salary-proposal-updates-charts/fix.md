# Bug Fix: Modifying Custom Salary Proposal Does Not Update Charts and Metrics

- **Slug**: salary-proposal-updates-charts
- **Fixed**: 2026-09-01T18:55:00Z
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Removed dead legacy code lines in `dashboard/app.js:updateWageSimulation()` that referenced undeclared variables (`medBaseSalary`, `medNomYear5`, etc.). This resolves the uncaught `ReferenceError` exception, allowing `updateWageSimulation()` to complete execution and dynamically update all multi-proposal calculations, differential KPI cards (`kpi-diff-custom-5yr`), `salaryEvolutionChart`, and `wagesChart`.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `dashboard/app.js` | modified | Removed 6 dead legacy lines (1376–1381) referencing non-existent `medBaseSalary` variables |
| `tests/test_chart_resilience.py` | added tests | Added `test_salary_proposal_chart_update_bindings()` and `test_no_undefined_med_references()` |

## Diff Highlights

```javascript
// dashboard/app.js (updateWageSimulation)
   setText('scen-co-net-monthly', `+${Math.round(coNetMonthlyIncrease).toLocaleString()} €/mes`);
   setText('scen-co-net-total', `+${Math.round(coNetTotalGain).toLocaleString()} €`);
-  setText('scen-med-salary', `${Math.round(medBaseSalary).toLocaleString()} €`);
-  setText('scen-med-salary-5yr', `${Math.round(medNomYear5).toLocaleString()} €`);
-  setText('scen-med-real-5yr', `${Math.round(medRealYear5).toLocaleString()} € (+${medRealGainPct.toFixed(1).replace('.', ',')}%)`);
-  setText('scen-med-monthly', `+${Math.round(medMonthlyIncrease).toLocaleString()} €/mes`);
-  setText('scen-med-net-monthly', `+${Math.round(medNetMonthlyIncrease).toLocaleString()} €/mes`);
-  setText('scen-med-net-total', `+${Math.round(medNetTotalGain).toLocaleString()} €`);
   setText('scen-union-salary', `${Math.round(unionBaseSalary).toLocaleString()} €`);
   setText('scen-union-salary-5yr', `${Math.round(unionNomYear5).toLocaleString()} €`);
```

## Tests Added or Updated

- `tests/test_chart_resilience.py::TestChartResilienceAndLifecycle.test_salary_proposal_chart_update_bindings` — Validates that `updateWageSimulation()` binds to `getCustomProposalState()`, updates differential cards (`kpi-diff-custom-5yr`), and triggers `updateSalaryEvolutionChart()` and `updateWagesChart()`.
- `tests/test_chart_resilience.py::TestChartResilienceAndLifecycle.test_no_undefined_med_references` — Enforces that no legacy `medBaseSalary` or `scen-med` references exist in `dashboard/app.js`.

## Local Verification

- Commands run:
  - `python3 -m unittest discover tests/` → 80/80 tests passed.
  - `python3 src/validate_invariants.py` → 14/14 rules verified.
  - `python3 src/validate_sources.py` → 100% DOM and sources checks passed.
  - `node -c dashboard/app.js dashboard/data.js dashboard/js/core.js dashboard/js/main.js dashboard/js/modules/*.js` → 0 syntax errors.

## Deviations from Assessment

None.

## Follow-ups

- None.
