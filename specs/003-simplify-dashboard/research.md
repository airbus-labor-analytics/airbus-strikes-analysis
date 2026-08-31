# Research & Architectural Decisions: Dashboard UI/UX Simplification & Thematic Reorganization

**Feature Branch**: `003-simplify-dashboard`
**Date**: 2026-08-31

---

## 1. Information Architecture & Navigation Consolidation

### Decision
Consolidate 15 fragmented tabs into **5 top-level thematic views**:
1. **`tab-overview` (Centro de Mando & Asimetría)**: Macro KPIs, Stock Market (AIR.PA), Airbus SE 2025 Financials, Asymmetry ratio.
2. **`tab-industrial` (Impacto Industrial & Logística)**: JIT Supply Chain buffer, FALs bottleneck (Toulouse/Hamburg), Beluga flight monitor, Thermometer.
3. **`tab-purchasing-power` (Poder Adquisitivo & Negociación)**: Real wage loss simulator, historical BOE agreements loss table, offer gap analysis, 11-point union platform.
4. **`tab-union-force` (Fuerza Sindical & Asamblea)**: Plant/union delegate map (198 delegates across 7 plants), 24-J referendum voting breakdown, chronological assembly timeline, and scenario decision trees.
5. **`tab-evidence` (Documentación & Evidencias)**: Primary sources documentary annex (269 items), Telegram archive, and aerospace strike benchmarks.

### Rationale
- Reduces user cognitive load by 66% while preserving 100% of underlying data, charts, and calculations.
- Eliminates context switching between closely related topics (e.g. separating JIT from Beluga, or separating salary simulator from BOE losses).

### Alternatives Considered
- *Single-page continuous scroll*: Rejected due to large dataset size and Chart.js memory overhead when rendering all 12 charts simultaneously.
- *Nested sub-tabs / tab inside tab*: Rejected as it introduces hidden content and mobile navigation clunkiness.

---

## 2. Removal of Obsolete / Low-Utility Tools

### Decision
Permanently remove **"Auditor 6 Filtros Urna"** (`tab-checklist`).

### Rationale
- The 6-filter checklist is an artificial, static widget that duplicates information already present in the Offer Gap Analysis and 11-Point Platform.
- Removing it cleans up the navigation and eliminates redundant UI state.

---

## 3. UI/UX Hierarchy, Typography & Chart Responsiveness

### Decision
- Standardize on clean Tailwind CSS utility classes with high-contrast color tokens:
  - Backgrounds: Dark slate palette (`bg-slate-900`, `bg-slate-950`, `border-slate-800`).
  - Accents: Emerald (`#10B981`) for union gains/positive margins, Rose (`#F43F5E`) for losses/stock drops, Sky/Blue (`#0284C7`) for corporate data/links.
  - Interactive charts: Maintain 12 Chart.js instances with responsive aspect ratios (`maintainAspectRatio: false`, lazy rendering on tab switch to avoid hidden canvas size calculation bugs).

### Rationale
- Ensures instant readability on mobile screens (assemblies/factory gates) and projector presentations.
