# UI Contracts & Interaction Schemas

## 1. Global Navigation Contract

### Function: `switchTab(tabId: string): void`
- **Input**: Target tab DOM id (e.g. `'tab-portal'`, `'tab-overview'`, `'tab-industrial'`, `'tab-purchasing-power'`, `'tab-union-force'`, `'tab-evidence'`). Supports alias resolution (`'finanzas'`, `'beluga'`, `'salarios'`, `'sindical'`, `'evidencias'`).
- **Behavior**:
  1. Hides all `.tab-content` containers.
  2. Unhides target container element.
  3. Resets viewport scroll: `window.scrollTo({ top: 0, behavior: 'instant' })`.
  4. Updates active button styling in `#global-floating-dock`.
  5. Updates URL hash smoothly (`#tab-overview`).
  6. Dispatches `updateSectionNav(normalizedTabId)` to refresh the right-hand floating index.
  7. Invokes Chart.js `.resize()` on all visible canvases via `requestAnimationFrame`.

---

## 2. Floating Section Index Contract

### Function: `scrollToSection(sectionId: string): void`
- **Input**: Element ID (e.g. `'sec-overview-asymmetry'`).
- **Behavior**: Smoothly scrolls window to element offset with a 90px top margin buffer.

### Function: `handleScrollSpy(): void`
- **Trigger**: Passive `window.scroll` event wrapped in `requestAnimationFrame`.
- **Behavior**: Computes active section based on vertical scroll position (`window.pageYOffset + 130`) and applies `text-sky-400 font-semibold scale-105 origin-left border-sky-400` to the corresponding `#nav-btn-[sectionId]`.

---

## 3. Modal Contract

### Function: `openSourceModal(sourceId: string): void` / `closeSourceModal(): void`
- **Behavior**: Opens centered Glass Modal with backdrop blur (`#source-modal`), binds `Escape` keyboard listener, locks background body scroll if open, and cleanly restores on close.
