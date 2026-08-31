# Implementation Plan: Rehaul Visual Flotante "Liquid Glass" y Navegación Global Multicapa

**Branch**: `011-floating-glass-ui-rehaul` | **Date**: 2026-08-31 | **Spec**: [specs/011-floating-glass-ui-rehaul/spec.md](spec.md)

**Input**: Feature specification from `specs/011-floating-glass-ui-rehaul/spec.md`

## Summary

Complete visual rehaul of the Airbus Spain 2026 Strike analytics web dashboard into a pure AMOLED (`#000000`) panoramic interface (`max-w-7xl mx-auto`). Eliminates the legacy fixed left sidebar in favor of a multi-layer floating navigation architecture: Top auto-contracting Dynamic Island HUD, Global Floating Dock (`#global-floating-dock`), centered Glass Modal (`#glass-detail-modal`), and a subtle right-hand hairline floating section index (`#floating-section-nav`). Implements atomic card disaggregation, structured "Company vs Workers" comparative blocks, and full tabular typography.

## Technical Context

**Language/Version**: Vanilla HTML5, Modern ECMAScript (ES2022+), CSS3 (Tailwind CSS via CDN), Python 3.10+ (for validation and invariant engines).

**Primary Dependencies**: Tailwind CSS, Lucide Icons, Chart.js (v4+), Canvas-Confetti. Zero heavy frontend build tools (pure vanilla static web app).

**Storage**: Local JSON files (`data/conflict_metrics.json`, `data/beluga_status.json`, `data/thermometer_data.json`, `data/telegram_archive/telegram_index.json`).

**Testing**: Python `unittest` suite (`tests/`), invariant validation (`src/validate_invariants.py`), primary source audit (`src/validate_sources.py`), headless browser visual testing (`xd://browser` / Puppeteer).

**Target Platform**: Modern desktop, tablet, and mobile web browsers (Chromium, Firefox, Safari, WebKit).

**Project Type**: Interactive analytical web dashboard + econometric validation suite.

**Performance Goals**: Tab switching under 16ms, zero layout shifts (CLS < 0.01), immediate Chart.js canvas redraw with zero distortion across viewports (360px to 4K).

**Constraints**: Zero-build dashboard (direct `file://` and static hosting support without Node/Webpack compilation), 100% mathematical and electoral consistency with primary sources.

**Scale/Scope**: 6 comprehensive analytical modules, 12 interactive resilient charts, 269 primary sources, 15,562 workers census, 198 elected delegates.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Mathematical & Invariant Integrity**: All economic figures, formulas, census tallies, and strike costs conform to canonical invariants in `data/conflict_metrics.json`.
- [x] **II. Primary Source Grounding**: Every metric and claim cites BOE, SIMA, INE, Airbus IR, or assembly minutes with verified hyperlinks.
- [x] **III. Single Source of Truth**: UI consumes structured data from `data/` and `data.js` without semantic drift.
- [x] **IV. Automated Testing**: `python3 src/validate_invariants.py` and `python3 -m unittest discover tests` pass 100%.
- [x] **V. Operational Simplicity**: Pure vanilla HTML/CSS/JS without build steps or heavyweight frameworks.
- [x] **VI. Viewport & Canvas Lifecycle**: `switchTab` enforces scroll reset (`scrollTop = 0`) and automatic Chart.js `.resize()` triggers.

## Project Structure

### Documentation (this feature)

```text
specs/011-floating-glass-ui-rehaul/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Architecture and design decisions
├── data-model.md        # UI state entities and component data contracts
├── quickstart.md        # Validation scenarios and execution guide
├── contracts/           # UI interface contracts and event schemas
│   └── ui-contracts.md
└── tasks.md             # Ordered execution task list
```

### Source Code (repository root)

```text
dashboard/
├── index.html           # Panoramic layout, HUD, floating dock, section index, 6 modules
├── app.js               # Tab switching, ScrollSpy, reactive charts, simulation engines
├── data.js              # Offline-first bundled dataset and source catalogs
└── screenshots/         # Verified visual proof across all modules

data/
├── conflict_metrics.json
├── beluga_status.json
├── thermometer_data.json
└── telegram_archive/

src/
├── validate_invariants.py
├── validate_sources.py
└── analysis_engine.py

tests/
├── test_dashboard_ui.py
└── test_analysis_engine.py
```

**Structure Decision**: Single project architecture with separation between core analytical data models (`data/`), data validation engines (`src/`), unit test suites (`tests/`), and static frontend presentation (`dashboard/`).

## Complexity Tracking

| Aspect | Justification | Simpler Alternative Rejected Because |
|---|---|---|
| Dynamic Floating Index | Minimal text-only hairline guide on 2xl | Fixed sidebar steals horizontal width; no navigation makes long pages difficult to scan |
| Multi-surface Floating Nav | Top HUD + Bottom Dock + Side Index | Single nav bar cannot simultaneously provide live KPI telemetry and instant thumb-friendly tab switching |
