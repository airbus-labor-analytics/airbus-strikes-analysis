# Bug Fix: Portal Page Erroneously Displays Finance Module Content

- **Slug**: portal-shows-finance-content
- **Fixed**: 2026-09-01T18:35:00Z
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Added the `hidden` utility class to the `#tab-overview` (Finance/Asymmetry Module) container in `dashboard/index.html` to guarantee that only the default landing page (`#tab-portal`) is visible during initial static DOM rendering. Removed unconditional chart initialization during `initAllModules()` in `dashboard/app.js` and added an automated regression test in `tests/test_dashboard_ui.py`.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `dashboard/index.html` | modified | Added `hidden` class to `<div id="tab-overview" class="tab-content hidden space-y-6">` |
| `dashboard/app.js` | modified | Removed legacy chart initialization from `initAllModules()` that forced off-screen `#tab-overview` chart rendering |
| `tests/test_dashboard_ui.py` | added test | Added `test_static_tab_visibility_defaults()` asserting that exactly `#tab-portal` is unhidden in static HTML markup |

## Diff Highlights

```html
<!-- dashboard/index.html -->
-      <div id="tab-overview" class="tab-content space-y-6">
+      <div id="tab-overview" class="tab-content hidden space-y-6">
```

```javascript
// dashboard/app.js (initAllModules)
   updateAsymmetrySimulation();
   updateWageSimulation();
-  // Tab overview is default visible tab
-  initAsymmetryChart();
-  initAirbusStockChart();
-  initCompanyHealthCharts();
   if (window.lucide) lucide.createIcons();
```

## Tests Added or Updated

- `tests/test_dashboard_ui.py::TestDashboardUI.test_static_tab_visibility_defaults` — Validates that across all 6 tab containers in `dashboard/index.html`, only `tab-portal` lacks the `hidden` class, while `tab-overview`, `tab-industrial`, `tab-purchasing-power`, `tab-union-force`, and `tab-evidence` are hidden by default.

## Local Verification

- Commands run:
  - `python3 -m unittest discover tests/` → 78/78 tests passed.
  - `python3 src/validate_invariants.py` → 14/14 rules verified.
  - `python3 src/validate_sources.py` → 100% checks passed.
  - `node -c dashboard/app.js dashboard/data.js dashboard/js/core.js dashboard/js/main.js dashboard/js/modules/*.js` → 0 syntax errors.

## Deviations from Assessment

None. The remediation directly followed the assessment plan.

## Follow-ups

- None required. All tab switches dynamically manage visibility and chart rendering seamlessly.
