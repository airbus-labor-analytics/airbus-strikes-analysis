# Tasks: Constructor y Simulador de Oferta Salarial Personalizada

**Input**: Design documents from `specs/013-custom-wage-proposal-builder/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/ui-contracts.md`, `quickstart.md`

## Dependencies & Implementation Strategy

```
Phase 1: Setup ────► Phase 2: Foundational Engine
                          │
                          ▼
               Phase 3: User Story 1 (P1: SIMA Cleanup & Canonical Cards) [MVP]
                          │
                          ▼
               Phase 4: User Story 2 (P2: In-Card Controls & Presets)
                          │
                          ▼
               Phase 5: User Story 3 (P3: Differential KPIs & Charts)
                          │
                          ▼
               Phase 6: Polish & Verification
```

---

## Phase 1: Setup & Data Sanitization

- [x] T001 Audit and remove all hardcoded references to SIMA 9.5% wage offer from `src/analysis_engine.py` and `dashboard/data.js`
- [x] T002 [P] Initialize custom proposal configuration state and default parameters in `dashboard/data.js`

---

## Phase 2: Foundational Engine

- [x] T003 Implement `evaluate_custom_proposal_series` and RSG cap evaluation logic in `src/analysis_engine.py`
- [x] T004 [P] Implement client-side `evaluateAnnualRaise` and compounding calculation engine in `dashboard/app.js`
- [x] T005 [P] Implement recovery horizon solver ($r^*$ calculation for 2026–2030) in `src/analysis_engine.py` and `dashboard/app.js`

---

## Phase 3: User Story 1 (P1) - Canonical Offers & SIMA Cleanup [MVP]

**Goal**: Garantizar que el simulador presenta de forma limpia las dos ofertas oficiales reales (Empresa +5% y Comité +12%) y transforma la 3ª tarjeta en "Tu Propuesta Personalizada".  
**Independent Test**: Verificar en DOM que no existe rastro de "+9,5% SIMA" y que las tarjetas 1 y 2 muestran los valores oficiales con sus badges.

- [x] T006 [US1] Update `get_salary_proposals_comparison` in `src/analysis_engine.py` to output canonical benchmarks (Company, Committee, Custom)
- [x] T007 [US1] Refactor Card 3 DOM structure in `dashboard/index.html` from SIMA static card to `#sc3-custom` ("Tu Propuesta Personalizada")
- [x] T008 [US1] Update baseline rendering logic for scenario cards in `dashboard/app.js`

---

## Phase 4: User Story 2 (P2) - In-Card Controls & Presets

**Goal**: Permitir al usuario calibrar interactivamente su propia propuesta con sliders, selectores y 3 presets rápidos con recálculo instantáneo.  
**Independent Test**: Modificar sliders y pulsar presets en la 3ª tarjeta; verificar que los valores de salario Año 1, nómina neta mensual, poder real a 5 años y tooltips matemáticos se actualizan en $<20\text{ ms}$.

- [x] T009 [US2] Insert in-card controls (raise slider, arrears input, RSG mode select, cap select) and preset buttons in `dashboard/index.html`
- [x] T010 [P] [US2] Style in-card compact controls and preset pill buttons with AMOLED glass aesthetics in `dashboard/index.html`
- [x] T011 [US2] Implement preset click handlers (`preset-loss-zero`, `preset-recovery-2030`, `preset-equilibrium`) in `dashboard/app.js`
- [x] T012 [US2] Wire event listeners for live recalculation on input changes in `dashboard/app.js`
- [x] T013 [US2] Update dynamic mathematical tooltips for custom proposal metrics in `dashboard/app.js`

---

## Phase 5: User Story 3 (P3) - Differential KPIs & Multiannual Chart Reactivity

**Goal**: Reflejar la propuesta personalizada en el cuadro de KPI diferencial acumulado a 5 años y en las curvas de los gráficos interactivos.  
**Independent Test**: Cambiar la propuesta personalizada y comprobar que el KPI diferencial vs. Empresa (+5%) y las series en `#salaryEvolutionChart` y `#wagesChart` se redibujan de forma reactiva y sincronizada.

- [x] T014 [US3] Replace SIMA differential KPI card with "Tu Oferta vs. Oferta Patronal (+5%)" in `dashboard/index.html`
- [x] T015 [US3] Update differential calculation logic for 5-year cumulative nominal/real gains in `dashboard/app.js`
- [x] T016 [P] [US3] Update `#salaryEvolutionChart` dataset configuration in `dashboard/app.js` to render the custom proposal series
- [x] T017 [P] [US3] Update `#wagesChart` dataset configuration in `dashboard/app.js` to render the custom cumulative wage trajectory

---

## Phase 6: Polish & Verification

- [x] T018 Update unit tests in `tests/test_analysis_engine.py` to assert custom proposal formulas and verify SIMA absence
- [x] T019 Update UI tests in `tests/test_dashboard_ui.py` to validate custom proposal DOM IDs and presets
- [x] T020 Run full invariant validation suite (`src/validate_invariants.py`, `src/validate_sources.py`, and `unittest`)
