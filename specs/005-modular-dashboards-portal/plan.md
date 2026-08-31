# Implementation Plan: Modular Dashboards & Welcome Portal Hub

**Branch**: `005-modular-dashboards-portal` | **Date**: 2026-08-31 | **Spec**: [specs/005-modular-dashboards-portal/spec.md](spec.md)

---

## Summary

Implement a dedicated Welcome Portal (`#portal` / `tab-portal`) as the default landing view. The Welcome Portal will showcase the platform's mission and founding principles, present an executive flash overview with 4 global summary KPIs, and provide an interactive visual Site Map linking to 5 decoupled, uncluttered analytical sub-dashboards:
1. **Centro de Mando Financiero & Asimetría** (`#financiero` / `tab-overview`)
2. **Impacto Industrial & Logística BelugaXL** (`#logistica` / `tab-industrial`)
3. **Poder Adquisitivo, Salarios & Convenio** (`#salarios` / `tab-purchasing-power`)
4. **Fuerza Sindical, Asamblea & Referéndum** (`#sindical` / `tab-union-force`)
5. **Documentación, Telegram & Evidencias** (`#evidencias` / `tab-evidence`)

---

## Technical Context

- **Frontend**: Vanilla JavaScript (ES2022), Chart.js 4.4+, Tailwind CSS (standalone CDN), Lucide Icons
- **Routing**: Client-side hash routing (`#portal`, `#financiero`, `#logistica`, `#salarios`, `#sindical`, `#evidencias`) with legacy fallback aliases
- **Lifecycle Guarantees**: Strict enforcement of Constitution Principle VI (`mainContainer.scrollTop = 0` on switch, explicit Chart `.resize()` calls, zero cumulative layout shift)
- **Testing**: `tests/test_dashboard_ui.py`, `src/validate_sources.py`

---

## Constitution & Invariant Compliance

- **Principle V (Zero-Build Frontend)**: Pure static HTML/JS without webpack/vite build steps.
- **Principle VI (Viewport & Canvas Lifecycle Management)**: Every view transition cleans up prior canvas state and resets scroll position.
- **Principle III (Single Source of Truth)**: All flash summary KPIs rendered from `window.CONFLICT_DATA`.

---

## Project Structure & File Changes

```text
dashboard/
├── index.html            # Add tab-portal section, site map cards, principles banner, breadcrumb bar
├── app.js                # Update switchTab router, default route to #portal, breadcrumb controller
└── data.js               # Unchanged: Shared canonical data object
tests/
└── test_dashboard_ui.py  # Update: Verify #tab-portal, 6-tab routing matrix, and breadcrumbs
```

---

## Complexity Tracking

No constitutional violations. Lightweight DOM markup and router extension without external libraries.
