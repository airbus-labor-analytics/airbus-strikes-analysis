# Implementation Plan: Constructor y Simulador de Oferta Salarial Personalizada

**Branch**: `013-custom-wage-proposal-builder` | **Date**: 2026-09-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/013-custom-wage-proposal-builder/spec.md`

## Summary

Eliminación de la oferta ficticia de mediación SIMA (+9,5%) y sustitución por un **Constructor y Simulador de Oferta Salarial Personalizada** en `#tab-purchasing-power`. Los usuarios podrán calibrar interactivamente su propia propuesta salarial (subida inicial en tablas, atrasos, modo RSG con o sin vínculo al IPC, márgenes, y topes/caps anuales) con recálculo instantáneo de tarjetas de escenario, tooltips algebraicos, gráficos multianuales y cálculo de meta de recuperación de poder adquisitivo a 2030.

## Technical Context

**Language/Version**: Python 3.10+ (backend engines & test suites), Vanilla JavaScript ES2022 / HTML5 / CSS3 (client dashboard)  
**Primary Dependencies**: Chart.js 4.4.x (via CDN), Lucide Icons (CDN), Tailwind CSS (CDN)  
**Storage**: JSON static schemas (`data/conflict_metrics.json`, `dashboard/data.js`)  
**Testing**: Python `unittest`, `src/validate_invariants.py`, `src/validate_sources.py`  
**Target Platform**: Modern web browsers (Chromium, Firefox, WebKit), Mobile responsive viewports  
**Project Type**: Single-page static analytics dashboard + Python econometric engine  
**Performance Goals**: Instant client-side reactive recalculation (< 20 ms) on slider/input changes; zero visual lag  
**Constraints**: Zero build step (vanilla HTML/JS); zero external tooltip/modal libraries; 100% adherence to mathematical conservation invariants  
**Scale/Scope**: 1 dashboard tab (`#tab-purchasing-power`), 2 chart canvases (`salaryEvolutionChart`, `wagesChart`), 1 calculation engine module (`src/analysis_engine.py`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [X] **Principle I (Mathematical & Invariant Integrity)**: All formulas for nominal compounding, CPI deflation, caps, and recovery horizons maintain exact algebraic consistency.
- [X] **Principle II (Primary Source Grounding & Traceability)**: Removes unverified SIMA wage offer claims. Official benchmarks remain strictly grounded in BOE agreements and published union platforms.
- [X] **Principle III (Single Source of Truth & Dual-Surface Parity)**: Calculation logic synchronized between `src/analysis_engine.py` and `dashboard/app.js`.
- [X] **Principle IV (Automated Invariant & Schema Testing)**: Test suite in `tests/test_analysis_engine.py` and `tests/test_dashboard_ui.py` updated to validate custom proposal parameters and removal of SIMA references.
- [X] **Principle V (Zero-Build Dashboard & Operational Simplicity)**: Pure vanilla JS/CSS implementation without npm build steps or heavy dependencies.
- [X] **Principle VI (Viewport & Canvas Lifecycle Management)**: Chart resizing and responsive layout guaranteed across desktop and mobile.

## Project Structure

### Documentation (this feature)

```text
specs/013-custom-wage-proposal-builder/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── ui-contracts.md
└── tasks.md             # Phase 2 output
```

### Source Code

```text
dashboard/
├── index.html           # 3rd Scenario Card converted to Custom Offer Builder + Presets
├── app.js               # Reactive custom proposal calculation engine & Chart.js updates
└── data.js              # Canonical dataset mirror

src/
├── analysis_engine.py   # Multi-proposal comparator updated with custom parameter model
├── validate_invariants.py
└── validate_sources.py

tests/
├── test_analysis_engine.py
└── test_dashboard_ui.py
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
