# Bug Assessment: Renderizado instantáneo de gráficos Chart.js sin retardo de animación

- **Slug**: instant-chart-rendering
- **Created**: 2026-08-31
- **Source**: "los graficos tardan mucho en renderizar y aparecer, tienen que aparecer instantaneamente"
- **Verdict**: valid
- **Severity**: medium

## Report (verbatim or summarized)

User report: *"los graficos tardan mucho en renderizar y aparecer, tienen que aparecer instantaneamente"*.
The user reports that dashboard charts across all modules exhibit noticeable lag before appearing when loading the page or switching between tabs, requesting that all visualizations render and display instantaneously.

## Symptom

When opening any dashboard module or switching tabs (e.g. from `#tab-portal` to `#tab-overview`, `#tab-industrial`, `#tab-purchasing-power`, or `#tab-union-force`), charts take approximately 1.0 to 1.1 seconds to appear. This is caused by:
1. Chart.js default progressive easing animations (1000ms duration per dataset).
2. An artificial `setTimeout(..., 60)` delay inside `requestAnimationFrame` within `switchTab()`.
3. Complete teardown and recreation of chart instances during tab navigation without `animation: false`.

Expected behavior: All 12 charts must render immediately (0ms animation delay) upon tab activation and page load, displaying crisp, static, settled data instantly.

## Reproduction

1. Open `dashboard/index.html` in any web browser.
2. Click on `1. Centro de Mando & Asimetría` (`#tab-overview`) or `2. Impacto Industrial & Logística` (`#tab-industrial`).
3. Observe that chart lines, bars, and doughnut segments take ~1000ms to progressively grow and draw onto the canvas, during which the user waits for data to become readable.
4. Switch to `3. Poder Adquisitivo y Negociación` (`#tab-purchasing-power`) and observe the 60ms DOM timer lag followed by another 1000ms animation loop.

## Suspected Code Paths

- `dashboard/app.js:95-136` (`renderResilientChart`) — Does not set global `Chart.defaults.animation = false` or `duration: 0` for canvas builds.
- `dashboard/app.js:490-527` (`switchTab`) — Contains an unnecessary `setTimeout(..., 60)` inside `requestAnimationFrame` that delays chart initializations and `.resize()` routines.
- `dashboard/app.js:583-1620, 2479` — Individual chart builder functions (`initAsymmetryChart`, `initWagesChart`, `initAirbusStockChart`, `initCompanyRevenueChart`, `initCompanyDeliveriesChart`, `initShareholderPieChart`, `initUnionShareChart`, `initUnionEvolutionChart`, `initSiteDelegatesChart`, `initReferendumPieChart`, `initReferendumSitesChart`, `initBelugaHistoryChart`) do not explicitly disable animation transitions.

## Root Cause Hypothesis

Chart.js v4 enables a default 1000ms easing animation on all newly instantiated charts and dataset updates. Because `dashboard/app.js` recreates canvas instances via `renderResilientChart()` on tab switches and introduces an artificial 60ms timeout in `switchTab()`, the browser triggers full redraw animation loops every time a tab is shown. Disabling animations globally via `Chart.defaults.animation = false` and removing the artificial timeout will eliminate the ~1.1s lag completely and render all charts in <16ms (within a single frame).

Confidence: High.

## Proposed Remediation

**Preferred**:
1. **Global Zero-Latency Chart Configuration**: Configure `Chart.defaults.animation = false` and `Chart.defaults.transitions = { active: { animation: { duration: 0 } } }` at the top of `dashboard/app.js` right before chart initializations.
2. **Eliminate Artificial Timeout in `switchTab()`**: Remove `setTimeout(..., 60)` from `switchTab()` and invoke chart initializers directly inside `requestAnimationFrame()` or synchronously upon unhiding the active tab.
3. **Instant Update Options**: Ensure calls to `chart.update()` (such as wage simulations and asymmetry slider updates) use `chart.update('none')` or zero-duration updates so slider changes reflect immediately without frame stutter.
4. **Automated Verification**: Add tests in `tests/test_dashboard_ui.py` confirming `Chart.defaults.animation` is disabled and `switchTab` contains no artificial timeout delay.

**Alternatives**:
- *Keep subtle 150ms animation*: Still produces visible delay on rapid tab switching; rejected in favor of instant 0ms rendering requested by the user.

**Files likely to change**:
- `dashboard/app.js`
- `tests/test_dashboard_ui.py`

**Tests to add or update**:
- Test in `tests/test_dashboard_ui.py` validating that chart animation is disabled in `app.js` and `switchTab` executes chart initializations without setTimeout delays.

## Risks & Considerations

- Zero risk to mathematical calculations, census numbers, or invariant consistency.
- Improves perceived performance and UI responsiveness across mobile and desktop viewports.

## Open Questions

- None. Requirements are clear and verifiable.
