# Tasks: Beluga Logistics Engine Decoupling & Supply Chain Math Validation

**Input**: Design documents from `specs/014-isolate-and-validate-beluga-engine/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Dependencies & Implementation Strategy

```
Phase 1: Setup ────► Phase 2: Foundational Backend
                          │
                          ▼
               Phase 3: User Story 1 (P1: Module Decoupling & Autonomous Polling) [MVP]
                          │
                          ▼
               Phase 4: User Story 2 (P2: Elimination of Fabricated Weekly Charts)
                          │
                          ▼
               Phase 5: User Story 3 (P3: Real-Time Fleet Telemetry & Route Matrix)
                          │
                          ▼
               Phase 6: Polish & Verification
```

---

## Phase 1: Setup & Data Model Preparation

- [X] T001 Audit and decouple `src/beluga_tracker.py` and `src/sentiment_thermometer.py` cross-dependencies
- [X] T002 [P] Initialize standalone `data/beluga_status.json` structure according to `data-model.md`

---

## Phase 2: Foundational Backend Architecture

- [X] T003 Refactor `BelugaTracker` in `src/beluga_tracker.py` with standalone `fetch_live_data()`, `analyze_fleet_status()`, and `get_calibrated_fallback_status()`
- [X] T004 [P] Update `src/analysis_engine.py` to ingest standalone Beluga logistics telemetry without sentiment coupling
- [X] T005 [P] Update `src/parsers/metric_parser.py` to parse and validate decoupled `data/beluga_status.json`

---

## Phase 3: User Story 1 (P1) - Dedicated & Autonomous Beluga Logistics Tracking [MVP]

**Goal**: Garantizar que el monitor de logística Beluga funciona de manera autónoma, con ciclo de polling independiente y sin acoplamiento a las noticias o feed de sentimiento.  
**Independent Test**: Ejecutar la ingestión de Beluga y cargar el panel logístico sin dependencias de fuentes RSS de noticias ni cálculo de termómetro mediático.

- [X] T006 [US1] Remove Beluga-specific query coupling from `src/sentiment_thermometer.py`
- [X] T007 [US1] Split `initThermometerAndBeluga()` in `dashboard/app.js` into independent `initBelugaLogistics()` and `initThermometer()`
- [X] T008 [US1] Implement dedicated 30s background polling in `startBelugaLivePolling()` in `dashboard/app.js`

---

## Phase 4: User Story 2 (P2) - Elimination of Fabricated Weekly Charts & Strict Data Grounding

**Goal**: Eliminar por completo el gráfico semanal ficticio (`#belugaHistoryChart`) y los arrays sintéticos (`period_definitions`, `getafe_flights_per_week`, `accumulated_htp`), cumpliendo la regla constitucional de *Zero Datos Inventados*.  
**Independent Test**: Verificar en DOM y en los payloads JSON que no existe rastro del gráfico histórico sintético `#belugaHistoryChart` ni de arrays de semanas inventadas.

- [X] T009 [US2] Remove `#belugaHistoryChart` canvas and parent container from `dashboard/index.html`
- [X] T010 [P] [US2] Remove `belugaHistoryChart` Chart.js dataset config, lifecycle, and `updateBelugaChart()` from `dashboard/app.js`
- [X] T011 [P] [US2] Delete `calculate_dynamic_movements()`, `period_definitions`, and synthetic `accumulated_htp` from `src/beluga_tracker.py`
- [X] T012 [US2] Remove `belugaHistoryChart` from required canvas checklist in `src/validate_sources.py`

---

## Phase 5: User Story 3 (P3) - Real-Time Fleet State & European Route Disruption Matrix

**Goal**: Renderizar la telemetría en tiempo real de las 6 aeronaves BelugaXL (`F-GXLG` a `F-GXLO`), filtros interactivos por matrícula, detección del bloqueo en Getafe y matriz de rutas europeas con fuentes primarias.  
**Independent Test**: Filtrar aeronaves por matrícula (`XL1`..`XL6`) en la interfaz y verificar que las rutas de Getafe muestran bloqueo (100%) mientras las rutas europeas muestran su estado operativo.

- [X] T013 [US3] Implement `renderBelugaFleet()` in `dashboard/app.js` for dynamic aircraft cards and European route disruption badges
- [X] T014 [P] [US3] Implement `setBelugaTailFilter()` in `dashboard/app.js` for interactive tail filtering (`ALL`, `F-GXLG`..`F-GXLO`)
- [X] T015 [US3] Ground Getafe corridor closure in cited assembly minutes (`sources/721c0baa.txt`) in `src/beluga_tracker.py` and `dashboard/index.html`

---

## Phase 6: Polish & Verification

- [X] T016 Update backend tests in `tests/test_analysis_engine.py` to assert decoupled Beluga schema and zero synthetic series
- [X] T017 Update UI tests in `tests/test_dashboard_ui.py` to assert absence of `#belugaHistoryChart` and presence of `#beluga-fleet-grid`
- [X] T018 Run complete invariant, citation, and regression test suites (`python3 src/validate_invariants.py`, `python3 src/validate_sources.py`, `unittest`)
