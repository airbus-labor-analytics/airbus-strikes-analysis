# Implementation Plan: Dashboard UI/UX Simplification & Thematic Reorganization

**Branch**: `003-simplify-dashboard` | **Date**: 2026-08-31 | **Spec**: [specs/003-simplify-dashboard/spec.md](spec.md)

**Input**: Feature specification from `specs/003-simplify-dashboard/spec.md`

---

## Summary

Consolidate the existing 15 fragmented tabs into **5 unified thematic modules** (`Centro de Mando & Asimetría`, `Impacto Industrial & Logística`, `Poder Adquisitivo & Negociación`, `Fuerza Sindical & Asamblea`, `Documentación & Evidencias`), remove the obsolete **"Auditor 6 Filtros Urna"** (`tab-checklist`), enhance typography and visual contrast, and ensure seamless Chart.js rendering across all devices with zero data drift or mathematical discrepancies.

---

## Technical Context

**Language/Version**: HTML5, Vanilla JavaScript (ES2022), Python 3.10+ (Data Validation & Engine)
**Primary Dependencies**: Tailwind CSS (CDN/utility), Lucide Icons, Chart.js 4.x
**Storage**: Static JSON (`data/conflict_metrics.json`) and embedded JS (`dashboard/data.js`)
**Testing**: Python `unittest` suite (`tests/test_analysis_engine.py`), `validate_invariants.py`, `validate_sources.py`, `audit_data_veracity.py`
**Target Platform**: Evergreen desktop & mobile browsers (Chromium, Firefox, Safari, WebKit)
**Project Type**: Single Page Application (SPA) Web Dashboard + Python Data Pipeline
**Performance Goals**: < 50ms tab switching latency, 60fps chart responsiveness, < 1MB total dashboard asset footprint
**Constraints**: 100% offline functionality from `data.js`, zero network dependency for core analytics, 100% mathematical fidelity with all 14 invariant rules

---

## Constitution Check

*GATE: All principles from `.specify/memory/constitution.md` satisfied.*

- **Principle I (Mathematical Integrity)**: Preserved 100% across all 5 consolidated views.
- **Principle II (Primary Source Grounding)**: 100% verified citations retained and accessible in every module.
- **Principle III (Dual-Surface Parity)**: Zero numerical drift between `data/`, `dashboard/`, and `docs/`.
- **Principle IV (Automated Invariant Testing)**: Expanded test scripts continuously gate all regressions.
- **Principle V (Operational Simplicity)**: Standard vanilla JavaScript and utility CSS without bulky frameworks.

---

## Project Structure

### Documentation (this feature)

```text
specs/003-simplify-dashboard/
├── plan.md              # Implementation Plan
├── research.md          # Phase 0 Architectural Decisions
├── data-model.md        # Phase 1 UI Component Mappings & Nav Model
├── quickstart.md        # Phase 1 Validation & Smoke Test Guide
├── contracts/
│   └── ui-contract.json # Navigation Schema & View Integrity Contract
└── checklists/
    └── requirements.md  # Specification Quality Checklist
```

### Source Code Modifications

```text
dashboard/
├── index.html           # Reorganize into 5 clean thematic tab-panes; purge tab-checklist
└── app.js               # Refactor switchTab, active buttons, and Chart.js lazy-init bindings
src/
├── validate_sources.py  # Update HTML scanner for 5-tab structure and 12 canvases
└── analysis_engine.py   # Verify exports and synchronization
tests/
└── test_analysis_engine.py # Add tests for UI navigation structure and invariant preservation
```

---

## Complexity Tracking

No constitution violations or unjustified abstractions. All changes are pure simplification and layout reorganization.
