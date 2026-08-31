# Phase 0 Research: Welcome Portal Hub & Decoupled Navigation

**Feature**: [specs/005-modular-dashboards-portal/spec.md](spec.md)
**Date**: 2026-08-31

---

## 1. Landing View & Information Architecture

### Decision
Introduce a dedicated top-level tab `tab-portal` (`#portal`) which serves as the default entry point when no specific hash is provided.

### Rationale
- Immediate entry into complex charts and tables causes cognitive overload for first-time visitors.
- A landing hub provides clear context: platform mission (labor transparency, verified primary sources, worker sovereignty) and a visual map of what each dashboard offers.
- Existing bookmarks and deep-links (`#industrial`, `#purchasing-power`, etc.) continue to resolve smoothly via backward-compatible hash aliases.

---

## 2. Flash Summary KPIs Selection

### Decision
Render 4 high-impact global KPI cards on the Welcome Portal:
1. **Censo Total en Conflicto**: `15.562 trabajadores` (7 factorías).
2. **Impacto Bursátil en Airbus SE**: `-14.459,5 M€` (Ratio 122.5x vs. plataforma).
3. **Límite Buffers JIT FALs**: `60 horas` (Línea roja en Toulouse y Hamburgo).
4. **Pérdida Media Poder Adquisitivo**: `-26.027 €` (Periodo 2020–2025).

---

## 3. Viewport & Canvas Lifecycle Handling

### Decision
Ensure that clicking any site map card invokes `switchTab(targetTab)`:
- Sets `mainContainer.scrollTop = 0`
- Triggers Chart `.resize()` on visible charts in the target dashboard
- Updates browser URL hash without full page refresh

---

## Conclusion
All research questions resolved. Design ensures fast 1-click navigation to all analytical tools.
