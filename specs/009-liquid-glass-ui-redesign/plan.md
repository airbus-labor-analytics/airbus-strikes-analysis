# Implementation Plan: Rediseño Visual y UX "Liquid Crystal" & AMOLED Black

**Branch**: `009-liquid-glass-ui-redesign` | **Date**: 2026-08-31 | **Spec**: `specs/009-liquid-glass-ui-redesign/spec.md`

---

## Summary

Ejecutar una transformación integral de la interfaz de usuario (UI/UX) del portal de la huelga de Airbus España, implementando un lenguaje de diseño premium basado en **AMOLED Black puro (`#000000`)**, tarjetas de **Cristal Líquido translúcido (`backdrop-filter: blur(24px)`)** con reflejos de borde especular, tipografía estética (*Geist Sans*, *Inter Display*, *JetBrains Mono*), y elementos flotantes contextuales de alta usabilidad (**Dynamic Island HUD superior**, **Quick Calculator Drawer lateral** y **Botón flotante Volver Arriba**), con disgregación modular y espaciados calculados en los 6 paneles temáticos.

---

## Technical Context

- **Language/Version**: Vanilla HTML5, CSS3 (Tailwind CSS CDN + Glassmorphism Custom Tokens), JavaScript (ES6+ Native, Zero Framework Build).
- **Primary Dependencies**: Chart.js 4.4.1 (Resilient lifecycle rendering), Lucide Icons, Google Fonts / Vercel Font CDN (*Geist*, *Inter*, *JetBrains Mono* con fallback nativo).
- **Storage**: In-memory JavaScript client state + URL Hash routing (`#portal`, `#financiero`, `#logistica`, `#salarios`, `#sindical`, `#evidencias`).
- **Testing**: Python `unittest` suite (`tests/test_dashboard_ui.py`, `tests/test_analysis_engine.py`, `tests/test_chart_resilience.py`), `src/validate_sources.py`, `src/validate_invariants.py`.
- **Target Platform**: Desktop (1080p, 2K, 4K), Laptops, Tablets, Smartphones (360px+ responsive viewport).
- **Project Type**: Client-Side Single Page Application (SPA) / Offline-capable static analysis dashboard.
- **Performance Goals**: 60 FPS transitions (<16ms frame budget), 0ms chart animation delay on tab switch, zero layout shift (CLS < 0.01).
- **Constraints**: 100% offline file:// execution support with zero blank screen glitches, WCAG AAA text contrast on AMOLED black.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Status |
|---|---|---|
| **I. Mathematical & Invariant Integrity** | Las modificaciones son estrictamente visuales y de interacción; no alteran fórmulas matemáticas ni modelos econométricos. | **PASS** |
| **II. Primary Source Grounding** | Todas las citas de fuentes (BOE, SIMA, INE, Airbus IR) se conservan y se integran en tooltips y badges glassmórficos de alta legibilidad. | **PASS** |
| **III. Single Source of Truth** | El dashboard sigue consumiendo exclusivamente `data/conflict_metrics.json` y `dashboard/data.js` sin duplicación ni divergencia semántica. | **PASS** |
| **IV. Automated Invariant & Schema Testing** | Se preservan y amplían los tests en `tests/test_dashboard_ui.py` para validar los nuevos contenedores DOM (`#floating-hud`, `#quick-calc-drawer`). | **PASS** |
| **V. Operational Simplicity & Zero-Build** | Se mantiene la arquitectura libre de build tools y bundlers: puro HTML/CSS/JS nativo. | **PASS** |
| **VI. Viewport & Canvas Lifecycle Management** | Todo cambio de pestaña en la Dynamic Island o la barra de navegación ejecuta `window.scrollTo(0,0)` y `.resize()` en los 12 lienzos Chart.js. | **PASS** |

---

## Project Structure

### Documentation (this feature)

```text
specs/009-liquid-glass-ui-redesign/
├── spec.md              # Feature specification with accepted user clarifications
├── plan.md              # This architecture and implementation plan
├── research.md          # Visual tokens, design decisions, and AMOLED glassmorphism research
├── data-model.md        # UI state model, drawer state, and component DOM hierarchy
├── contracts/
│   └── ui_contracts.md  # DOM IDs, CSS class contracts, and JS function lifecycle bindings
├── quickstart.md        # Visual verification guide and automated testing commands
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code Touched

```text
dashboard/
├── index.html           # AMOLED background, Liquid Crystal tokens, Dynamic Island HUD, Quick Calculator Drawer, typography CDN links, and panel padding re-architecture
├── app.js               # Dynamic Island scroll listener, Drawer open/close/sync handlers, and dark-theme Chart.js configuration updates
└── data.js              # Fallback local data preserved

tests/
└── test_dashboard_ui.py # DOM assertions for #floating-hud, #quick-calc-drawer, and typography tokens
```

---

## Complexity Tracking

> **No violations of constitutional principles detected.** Minimalist vanilla architecture preserved.
