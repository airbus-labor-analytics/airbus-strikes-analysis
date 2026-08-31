# Bug Fix: Renderizado instantáneo de gráficos Chart.js sin retardo de animación

- **Slug**: instant-chart-rendering
- **Fixed**: 2026-08-31
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Desactivadas las animaciones progresivas por defecto de Chart.js (`Chart.defaults.animation = false`, `responsiveAnimationDuration: 0`) y eliminado el retardo artificial `setTimeout(..., 60)` en `switchTab()`, permitiendo que todos los gráficos se rendericen y muestren de forma instantánea al navegar entre módulos o interactuar con los simuladores de nóminas y asimetría.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `dashboard/app.js` | modified | Configuradas animaciones en cero en `Chart.defaults` y `renderResilientChart()`; eliminado `setTimeout` en `switchTab()`; actualizado `wagesChart.update('none')`. |
| `tests/test_dashboard_ui.py` | modified | Añadido `test_instant_chart_rendering_configuration` para verificar que la configuración de animación desactivada y la ausencia de delays en `switchTab` se preservan. |

## Diff Highlights

```javascript
// dashboard/app.js
if (typeof Chart !== 'undefined') {
  Chart.defaults.animation = false;
  Chart.defaults.responsiveAnimationDuration = 0;
  if (Chart.defaults.transitions && Chart.defaults.transitions.active) {
    Chart.defaults.transitions.active.animation = { duration: 0 };
  }
}
```

```javascript
// dashboard/app.js - switchTab()
requestAnimationFrame(() => {
  if (normalizedTabId === 'tab-overview') {
    initAsymmetryChart();
    ...
  }
  // Clean, zero-latency immediate resize on visible canvases
});
```

## Tests Added or Updated

- `tests/test_dashboard_ui.py::TestDashboardUI::test_instant_chart_rendering_configuration` — Valida que `Chart.defaults.animation = false` esté definido y que `switchTab()` no contenga llamadas a `setTimeout` que retrasen el dibujado.

## Local Verification

- Commands run:
  - `node --check dashboard/app.js` → sintaxis JS válida.
  - `python3 -m unittest tests/test_dashboard_ui.py` → 11/11 tests superados (`OK`).
  - `python3 src/validate_sources.py` → 100% de tags balanceados y 12/12 gráficos validados.
  - `python3 src/validate_invariants.py` → 14/14 reglas de invariantes cumplidas (`[ALL INVARIANTS PASSED]`).
  - `python3 -m unittest discover tests` → 47 tests superados sin fallos.

## Deviations from Assessment

None.

## Follow-ups

- Ninguno.
