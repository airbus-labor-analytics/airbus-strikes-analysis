# Bug Assessment: Fix Dashboard Charts Rendering and Interface Structural Issues

- **Slug**: fix-dashboard-charts
- **Created**: 2026-08-31
- **Source**: Pasted text ("muchos fallos en la interfaz graficos que no se ven")
- **Verdict**: valid
- **Severity**: high

## Report (verbatim or summarized)

> "muchos fallos en la interfaz graficos que no se ven"

The user reports multiple visual and functional failures in the dashboard interface, specifically that charts and visual components are either not visible, cropped, or not rendering correctly when navigating the web application.

## Symptom

1. Visual layout distortion in Module 3 (`tab-purchasing-power`): Sections of the view ("Histórico de Convenios", "Pérdidas Salariales", "Evolución de Ofertas", and "Plataforma de 11 Puntos") leak outside their container div due to broken HTML tag nesting at lines 1453-1454 in `dashboard/index.html`.
2. When switching between tabs via sidebar navigation or top navbar shortcuts, the scroll position (`main.scrollTop`) is retained from previous views rather than resetting to `0`. This causes newly opened modules to appear scrolled deep down into secondary tables/feeds rather than displaying the primary charts and KPIs at the top.
3. Legacy URL hash aliases (e.g. `#tab-wages`, `#tab-stock`, `#tab-unions`) fail to activate on initial page load because `DOMContentLoaded` checks `document.getElementById(initialHash)` before resolving backward-compatibility aliases.
4. `wagesChart` and other Chart.js canvas elements experience container dimension constraints due to mismatched parent wrappers.

## Reproduction

1. Open `dashboard/index.html` in a web browser.
2. Scroll down on the initial tab (`1. Centro de Mando & Asimetría`).
3. Click on another tab in the sidebar (e.g. `2. Impacto Industrial & Logística` or `3. Poder Adquisitivo & Negociación`).
4. Notice that the page does not start at the top; instead, the view is stuck midway down, hiding the top KPIs, gauges, and header charts.
5. Inspect Module 3 (`3. Poder Adquisitivo & Negociación`): observe that content below `wagesChart` is rendered outside the `#tab-purchasing-power` container due to premature closing `</div>` tags.
6. Attempt to open a deep link with a legacy hash like `dashboard/index.html#tab-wages`: notice that the tab switcher does not navigate to `tab-purchasing-power`.

## Suspected Code Paths

- `dashboard/index.html:1453-1454` — Premature closing `</div></div>` tags closing `#tab-purchasing-power` before the historical losses and 11-point platform sections.
- `dashboard/index.html:1636-1639` — Dangling closing `</div>` tags prior to `#tab-union-force`.
- `dashboard/app.js:337-425` (`switchTab`) — Missing `main.scrollTop = 0` reset upon tab switching.
- `dashboard/app.js:93-104` (`DOMContentLoaded`) — Missing alias resolution before checking `document.getElementById(initialHash)`.
- `dashboard/app.js:397-424` — Need explicit `chart.resize()` / clean layout render triggers when activating tabs containing Chart.js instances.

## Root Cause Hypothesis

**Confidence: High**

The root cause is a combination of two defects:
1. **HTML DOM malformation**: In `dashboard/index.html`, lines 1453-1454 contained extra closing tags that truncated the container `#tab-purchasing-power` prematurely, causing subsequent cards to render outside the tab container hierarchy and disrupting sibling tab visibility states.
2. **Tab Controller Navigation UX**: In `dashboard/app.js`, `switchTab()` altered CSS display classes (`hidden`) but did not reset the scroll offset of the parent `<main>` scroll container, causing newly switched tabs to preserve the scroll offset of the prior view. Furthermore, hash-based alias routing only evaluated un-aliased IDs on load.

## Proposed Remediation

**Preferred**:
1. Correct the HTML nesting in `dashboard/index.html`:
   - Remove the premature closing `</div>` tags around `wagesChart` (line 1454).
   - Balance the closing tags properly at the end of Module 3 (`tab-purchasing-power`).
2. Update `switchTab(tabId)` in `dashboard/app.js`:
   - Add `const mainContainer = document.querySelector('main'); if (mainContainer) mainContainer.scrollTop = 0;` to ensure every tab switch starts cleanly at the top.
   - Trigger `chart.resize()` or clean re-initialization on all visible Chart.js instances.
3. Update hash initialization in `dashboard/app.js`:
   - Normalize and alias-resolve `window.location.hash` before invoking `switchTab()`.
4. Validate all 12 Chart.js canvases across all 5 tabs using the headless browser verification suite.

**Files likely to change**:
- `dashboard/index.html`
- `dashboard/app.js`

**Tests to add or update**:
- Run automated browser check across all 5 tabs ensuring every canvas has positive dimensions, visible `hasChartInstance: true`, and correct DOM nesting.
- Run `python3 src/validate_sources.py`, `python3 src/validate_invariants.py`, and `python3 -m unittest discover tests`.

## Risks & Considerations

- Low risk: changes are strictly confined to UI layout, HTML tag balancing, and client-side tab state navigation.
- No impact on data models (`data/conflict_metrics.json`), calculations, or primary source grounding.

## Open Questions

- None. The issue has been directly reproduced and isolated using headless browser inspection.
