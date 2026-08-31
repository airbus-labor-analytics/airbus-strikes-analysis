# Research & Technical Decisions: Universal Dynamic Data Synchronization & Chart Resilience Engine

**Feature**: [specs/007-dynamic-data-and-charts-resilience/spec.md](spec.md)
**Date**: 2026-08-31

## Research Questions & Findings

### 1. Dynamic Elapsed Conflict Calculations & Date Normalization
- **Problem**: Static strings or hardcoded day counts (e.g. "Día 42 de huelga") become stale across days.
- **Decision**: Centralize dynamic chronology engine in `getConflictChronology()` returning:
  - `start_date`: `2026-07-20T06:00:00Z`
  - `now`: Current date/time (or mocked in unit tests)
  - `elapsed_days`: Exact integer days since strike onset
  - `elapsed_hours`: Total hours since onset (for JIT buffer depletion)
  - `cumulative_strike_cost_m_eur`: $\text{elapsed\_days} \times 22.7\text{ M€}$
- **Alternatives Considered**: Server-side rendering (rejected — violates static GitHub Pages & offline `file://` architecture).

### 2. Chart.js Instance Teardown & Lifecycle Resilience
- **Problem**: When `switchTab()` is called or background auto-sync refreshes data, re-instantiating `new Chart(ctx, ...)` on an existing canvas causes `"Canvas is already in use"` runtime errors or detached memory leaks.
- **Decision**: Wrap all 12 chart initializers in a centralized helper `renderResilientChart(canvasId, configBuilder)`:
  ```javascript
  const chartRegistry = {};
  function renderResilientChart(canvasId, configBuilder) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    if (chartRegistry[canvasId]) {
      try {
        chartRegistry[canvasId].destroy();
      } catch (e) {
        console.warn(`Error destroying chart ${canvasId}:`, e);
      }
      delete chartRegistry[canvasId];
    }
    try {
      const config = configBuilder(ctx);
      if (config) {
        chartRegistry[canvasId] = new Chart(ctx, config);
        return chartRegistry[canvasId];
      }
    } catch (err) {
      console.error(`Error rendering chart ${canvasId}:`, err);
    }
    return null;
  }
  ```
- **Rationale**: Completely prevents canvas collisions, guarantees clean memory cleanup, and safely isolates any charting errors from breaking the surrounding UI.

### 3. Dynamic Telegram Document Indexing & Archive Aggregation
- **Problem**: Document counts in the sidebar badge and Module 5 were previously updated manually.
- **Decision**: Derive all archive counts dynamically from `window.SOURCES_DATA` and `window.TELEGRAM_ARCHIVE_DATA`:
  - Total documents = `sourcesCatalogData.length`
  - Assembly minutas = documents where `category === 'Actas y Asambleas'`
  - Factory distribution = grouped by `site` attribute
- **Rationale**: Eliminates manual synchronization between document dumps and UI badges.

## Conclusion

All technical unknowns resolved. Ready to proceed with data model and contract definitions.
