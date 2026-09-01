# Implementation Plan: Beluga Logistics Engine Decoupling & Supply Chain Math Validation

**Branch**: `014-isolate-and-validate-beluga-engine` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/014-isolate-and-validate-beluga-engine/spec.md`

---

## Summary

Decouples the Beluga logistics monitoring engine from the general media/news/sentiment scrapers, completely eliminates fabricated weekly flight trajectories and synthetic HTP progression curves (`#belugaHistoryChart`), grounds the supply chain analysis exclusively in verified real-time ADS-B radar telemetry (OpenSky/BelugaWatch) and cited factory assembly minutes (`sources/721c0baa.txt`), and ensures isolated client-side polling and component rendering.

---

## Technical Context

**Language/Version**: Python 3.10+ (standard library only: `urllib.request`, `json`, `argparse`, `pathlib`, `datetime`, `unittest`) & Vanilla JavaScript (ES2022+ / Zero-Build)  
**Primary Dependencies**: None (Standard Library, Tailwind CSS CDN, Lucide Icons, Chart.js CDN for remaining charts)  
**Storage**: JSON data artifacts under `data/` (`data/beluga_status.json`, `data/conflict_metrics.json`, `dashboard/data.js`)  
**Testing**: `python3 -m unittest discover -s tests`, `src/validate_invariants.py`, `src/validate_sources.py`  
**Target Platform**: GitHub Pages Static Web App & Python CLI  
**Project Type**: Standalone Analytics Tool & Real-Time Logistics Monitor  
**Performance Goals**: Sub-25ms execution latency for local telemetry analysis; sub-16ms DOM rendering; 30s background live polling  
**Constraints**: Zero unverified or fabricated data series; 100% offline fallback resilience; zero unclosed HTML tags  
**Scale/Scope**: 6 BelugaXL heavy-lift aircraft; 5 European factory supply routes; 100% Getafe HTP monopoly  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I: Mathematical & Invariant Integrity**: All supply chain metrics, flight counts, and route states are mathematically rigorous and mutually balanced.
- [x] **Principle II: Primary Source Grounding & Traceability**: Completely eliminates ungrounded historical weekly arrays (`period_definitions`); all qualitative claims cite authenticated assembly minutes (`sources/721c0baa.txt`).
- [x] **Principle III: Single Source of Truth & Dual-Surface Parity**: `data/beluga_status.json` acts as the canonical data artifact consumed synchronously by both backend engines and client dashboard.
- [x] **Principle IV: Automated Invariant & Schema Testing**: Tested via `validate_invariants.py`, `validate_sources.py`, and `test_dashboard_ui.py`.
- [x] **Principle V: Operational Simplicity & Zero-Build Dashboard**: Pure standard library Python and vanilla HTML/JS without framework bloat.
- [x] **Principle VI: Viewport & Canvas Lifecycle Management**: Viewport layout verified across desktop, tablet, and mobile views.

---

## Project Structure

### Documentation (this feature)

```text
specs/014-isolate-and-validate-beluga-engine/
├── plan.md              # Implementation plan (/speckit.plan output)
├── research.md          # Phase 0 decisions (/speckit.plan output)
├── data-model.md        # Data models & schemas (/speckit.plan output)
├── quickstart.md        # Validation & execution guide (/speckit.plan output)
├── contracts/           # API & UI contracts (/speckit.plan output)
│   ├── beluga-logistics-contract.md
│   └── ui-contracts.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Implementation tasks (/speckit.tasks output)
```

### Source Code (repository root)

```text
src/
├── beluga_tracker.py        # Standalone BelugaXL fleet tracker & route monitor
├── sentiment_thermometer.py # Media pressure & sentiment engine (decoupled from Beluga)
├── analysis_engine.py       # Main econometric engine orchestrating data integration
├── validate_invariants.py   # Invariant validation suite
└── validate_sources.py      # Source grounding and DOM tag validation

dashboard/
├── index.html               # Web UI (removed #belugaHistoryChart; isolated Beluga panel)
├── app.js                   # Client app (initBelugaLogistics, renderBelugaFleet, live polling)
└── data.js                  # Canonical bundled dashboard payload

data/
├── beluga_status.json       # Standalone Beluga logistics data artifact
└── conflict_metrics.json    # Canonical conflict dataset

tests/
├── test_analysis_engine.py  # Backend analytics unit tests
└── test_dashboard_ui.py     # UI integrity and DOM tests
```

---

## Implementation Strategy & Phases

### Phase 1: Decoupling & Backend Engine Refactor (`src/beluga_tracker.py`)
- Remove cross-dependencies between `beluga_tracker.py` and `sentiment_thermometer.py`.
- Delete `calculate_dynamic_movements()` and synthetic `period_definitions` array.
- Standardize `BelugaTracker` to output the clean `BelugaFleetStatus` schema with real-time aircraft, route matrix, and primary source citations.
- Ensure CLI `--json` and `--update` support.

### Phase 2: Dashboard UI & Client Engine Refactor (`dashboard/index.html`, `dashboard/app.js`)
- Remove `<canvas id="belugaHistoryChart">` from `dashboard/index.html`.
- Split `initThermometerAndBeluga()` into `initBelugaLogistics()` and `initThermometer()`.
- Update `renderBelugaFleet()` to render aircraft cards and the European route disruption matrix.
- Ensure independent 30s background polling lifecycle in `startBelugaLivePolling()`.

### Phase 3: Quality Gates, Tests & Validation
- Update `src/validate_sources.py` to remove `belugaHistoryChart` from the required canvas checklist.
- Update `tests/test_analysis_engine.py` and `tests/test_dashboard_ui.py` to assert decoupled execution and absence of synthetic charts.
- Execute full validation suite (`validate_invariants.py`, `validate_sources.py`, and `unittest`).

---

## Complexity Tracking

*No violations. All principles and constraints satisfied with standard library and vanilla web architecture.*
