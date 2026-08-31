# Bug Fix: Dinamización y corrección de serie de cotización AIR.PA e hitos bursátiles

- **Slug**: fix-stock-chart-values
- **Fixed**: 2026-08-31
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Corregidos los porcentajes de variación bursátil para `AIR.PA` (Euronext Paris) calculando de forma estricta tanto la variación respecto a la sesión anterior ($\Delta_{\text{DoD}}$) como la caída acumulada desde el máximo del año ($\Delta_{\text{Peak}}$). Sustituidas las tarjetas estáticas HTML por un contenedor dinámico `#stock-milestones-container` renderizado en `dashboard/app.js`, manteniendo paridad matemática exacta con `data/conflict_metrics.json` e invariantes del proyecto.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `src/analysis_engine.py` | modified | Incorporados campos `dod_change_pct`, `peak_change_pct` e `is_milestone` en cada entrada de `daily_history_conflict`. |
| `dashboard/index.html` | modified | Sustituidas las 4 tarjetas estáticas de hitos por `#stock-milestones-container`. |
| `dashboard/app.js` | modified | Implementada función `renderStockMilestones()` e integradas actualizaciones de KPIs dinámicos en `initAirbusStockChart()`. |
| `dashboard/data.js` | modified | Regenerado con los nuevos cálculos y esquemas de series bursátiles. |
| `data/conflict_metrics.json` | modified | Regenerado con paridad de datos para la serie histórica completa. |
| `tests/test_dynamic_metrics.py` | modified | Añadido `test_stock_milestone_metrics_and_deltas` para verificar cálculos DoD y Peak. |
| `tests/test_dashboard_ui.py` | modified | Añadido `test_dynamic_stock_milestones_container` para verificar contenedor e inyección JS. |

## Diff Highlights

```javascript
// dashboard/app.js
function renderStockMilestones(stockData) {
  const container = document.getElementById('stock-milestones-container');
  if (!container || !stockData || stockData.length === 0) return;
  const peakPrice = stockData[0]?.price || 221.30;
  // Dynamic milestone generation with DoD and Peak calculations
  ...
}
```

## Tests Added or Updated

- `tests/test_dynamic_metrics.py::TestDynamicMetricDerivation::test_stock_milestone_metrics_and_deltas` - Valida que las variaciones porcentuales diarias y acumuladas coincidan exactamente con la fórmula matemática de mercado.
- `tests/test_dashboard_ui.py::TestDashboardUI::test_dynamic_stock_milestones_container` - Valida la existencia del contenedor dinámico en `index.html` y la función de renderizado en `app.js`.

## Local Verification

- Commands run:
  - `python3 src/analysis_engine.py` -> `✓ conflict_metrics.json` & `✓ dashboard/data.js` regenerados con éxito.
  - `python3 src/validate_sources.py` -> `[PASS]` 100% etiquetas HTML balanceadas y 12/12 gráficos validados.
  - `python3 src/validate_invariants.py` -> `[ALL INVARIANTS PASSED]` 14/14 reglas de invariantes cumplidas.
  - `python3 -m unittest discover tests` -> `Ran 46 tests in 5.143s - OK`.

## Deviations from Assessment

None.

## Follow-ups

- Mantener la sincronización diaria de cotizaciones en `daily_history_conflict` conforme avance el conflicto laboral.
