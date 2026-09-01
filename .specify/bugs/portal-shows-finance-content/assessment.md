# Bug Assessment: Portal Page Erroneously Displays Finance Module Content

- **Slug**: portal-shows-finance-content
- **Created**: 2026-09-01T18:30:00Z
- **Source**: pasted text ("en la pagina del portal en algunas ocasiones aparece el contenido de la pagina de finanzas")
- **Verdict**: valid
- **Severity**: high

## Report (verbatim or summarized)

> "en la pagina del portal en algunas ocasiones aparece el contenido de la pagina de finanzas"

## Symptom

When opening the dashboard or navigating to the Portal Hub (`#tab-portal` / Module 0), the financial module content (`#tab-overview` / "Centro de Mando & Asimetría", which includes financial KPIs, Euronext stock charts, revenue/deliveries, and the strike asymmetry simulator) is rendered simultaneously or remains visible on the page alongside the portal content.

## Reproduction

1. Load `dashboard/index.html` on a browser (or disable JavaScript / throttle connection / inspect initial DOM paint).
2. Observe that `#tab-portal` (Module 0) and `#tab-overview` (Module 1 - Finanzas) are both rendered without the `hidden` CSS utility class.
3. During initial HTML parsing and layout paint prior to `switchTab('tab-portal')` invocation, or if deep-linking/initialization is delayed, both the Portal Hub and the entire Finance module are visible stacked vertically in the viewport.

## Suspected Code Paths

- `dashboard/index.html:419` — `<div id="tab-overview" class="tab-content space-y-6">` is missing the `hidden` class in the static HTML markup. All other inactive modules (`#tab-industrial:802`, `#tab-purchasing-power:1148`, `#tab-union-force:1909`, `#tab-evidence:2359`) have `class="tab-content hidden space-y-6"`.
- `dashboard/app.js:263-266` — `initAllModules()` initializes `#tab-overview` charts unconditionally during DOM startup (`initAsymmetryChart()`, `initAirbusStockChart()`, `initCompanyHealthCharts()`), with a legacy comment `// Tab overview is default visible tab`, assuming `tab-overview` was active before `tab-portal` was introduced as the default landing view.
- `tests/test_analysis_engine.py` / `src/validate_sources.py` — Invariant test checks for the 6 tabs in DOM (`tab-portal`, `tab-overview`, `tab-industrial`, `tab-purchasing-power`, `tab-union-force`, `tab-evidence`) but currently does not assert that only the default landing tab (`tab-portal`) is unhidden in the static HTML.

## Root Cause Hypothesis

When the Portal Hub (`#tab-portal`) was introduced as the default landing page (Module 0), the previous default landing container `#tab-overview` (Module 1: Centro de Mando & Asimetría / Finanzas) was not updated with the Tailwind CSS `hidden` class in `dashboard/index.html`. Consequently, during initial DOM rendering, both `#tab-portal` and `#tab-overview` exist in the unhidden state. On fast JS execution `switchTab('tab-portal')` quickly hides `#tab-overview`, but during initial load, slow script execution, or before `DOMContentLoaded` completes, the financial module content is visibly rendered on the portal page.

*Confidence: High*

## Proposed Remediation

**Preferred**:
1. Add the `hidden` class to `<div id="tab-overview" class="tab-content hidden space-y-6">` in `dashboard/index.html:419`, ensuring only `#tab-portal` is unhidden by default in static HTML.
2. In `dashboard/app.js` and `dashboard/js/main.js`, ensure that tab initialization strictly enforces single-tab visibility before any module sub-renderers execute, and ensure chart initialization for non-active tabs is deferred or cleanly scoped to `switchTab()`.
3. Add an automated regression test in `tests/` verifying that in `dashboard/index.html`, exactly one `.tab-content` element (the default landing tab `#tab-portal`) lacks the `hidden` class, while all other `.tab-content` elements have `hidden`.

**Files likely to change**:
- `dashboard/index.html`
- `dashboard/app.js`
- `tests/test_dashboard_ui.py` (or new UI static assertion test)

**Tests to add or update**:
- Test asserting that in `dashboard/index.html`, exactly one tab container is unhidden (`tab-portal`) and all other 5 tab containers (`tab-overview`, `tab-industrial`, `tab-purchasing-power`, `tab-union-force`, `tab-evidence`) contain the `hidden` class.

## Risks & Considerations

- Zero risk of regression: `switchTab()` dynamically adds/removes `hidden` on user interaction. Adding `hidden` to `#tab-overview` in static HTML prevents initial content stacking without affecting tab navigation.

## Open Questions

None. The root cause is confirmed by inspection of `dashboard/index.html:419`.
