# Tasks: Welcome Pack al Conflicto & Guía Cronológica Primaria

**Input**: Design documents from `/specs/017-conflict-welcome-pack/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`  
**Status**: Ready for Implementation

---

## Phase 1: Setup & Data Foundations

- [X] T001 Initialize unit test suite for Welcome Pack in `tests/test_welcome_pack.py`
- [X] T002 Enrich canonical dataset in `data/conflict_metrics.json` with the complete `welcome_pack` schema (executive summary, economic breakdown, primary quotes, 3 chronology phases up to 2026-09-02)
- [X] T003 [P] Synchronize client-side dataset mirror in `dashboard/data.js` with `WELCOME_PACK_DATA`

---

## Phase 2: Core Generation Engine & Invariant Verification

- [X] T004 Implement automated Markdown dossier generator in `src/generate_welcome_pack.py` connecting to `data/conflict_metrics.json` with Europe/Madrid timezone awareness
- [X] T005 [P] Integrate Welcome Pack data consistency checks and invariant rules into `src/validate_invariants.py`
- [X] T006 Compile initial Markdown dossier `docs/Welcome_Pack_Conflicto_Airbus_2026.md` using `src/generate_welcome_pack.py` and verify formatting

---

## Phase 3: User Story 1 - Consulta del Welcome Pack & Causas Estructurales (Priority: P1)

**Story Goal**: Permitir a cualquier trabajador o delegado consultar la introducción ejecutiva con la justificación económica verificada (pérdida salarial del 20,9% al 24,4%, -26.030 € netos, beneficios récord de Airbus de 5.221 M€) y citas textuales de fuentes primarias.

**Independent Test Criteria**: Acceder al Welcome Pack y verificar el renderizado del bloque de introducción, desglose económico y citas autenticadas del Dossier de Pérdida Salarial.

- [X] T007 [US1] Add `#tab-welcome-pack` container and Quick Access Button («¿Qué nos ha llevado aquí?») to `dashboard/index.html`
- [X] T008 [US1] Implement executive summary and economic asymmetry cards rendering in `dashboard/app.js`
- [X] T009 [P] [US1] Implement primary quotes block with links to source documents in `dashboard/app.js`

---

## Phase 4: User Story 2 - Cronología en 3 Fases Documentadas con Citas y Minutas (Priority: P2)

**Story Goal**: Desplegar la cronología interactiva segmentada en las 3 fases clave (Gestación, Escalada/Democracia Directa y Huelga Indefinida hasta el Día 9 - 2 de septiembre) con datos de votaciones reales y enlace al modal de minutas íntegras.

**Independent Test Criteria**: Navegar por las 3 fases temporales, filtrar por fase, y abrir el modal `OpenSourceModal` con el texto íntegro de la minuta seleccionada.

- [X] T010 [US2] Implement 3-phase chronology timeline cards renderer in `dashboard/app.js`
- [X] T011 [US2] Wire interactive modal triggers for assembly minutes (`OpenSourceModal`) in `dashboard/app.js` and `dashboard/index.html`
- [X] T012 [P] [US2] Implement phase-filtering buttons (Todas / Fase 1 / Fase 2 / Fase 3) for the Welcome Pack timeline in `dashboard/app.js`

---

## Phase 5: User Story 3 - Indicador Dinámico de Frescura y Actualización de Textos (Priority: P3)

**Story Goal**: Mostrar visiblemente el sello de frescura temporal («Última actualización: 2 de septiembre de 2026 - Día 9 de Huelga Indefinida») en cabecera y secciones para garantizar la trazabilidad en tiempo real.

**Independent Test Criteria**: Comprobar que la fecha de actualización y el día de huelga se renderizan dinámicamente tanto en la UI como en el dossier generado.

- [X] T013 [US3] Implement dynamic freshness badge and strike day indicator in `dashboard/app.js` and `dashboard/index.html`
- [X] T014 [P] [US3] Add automated freshness validation assert to `tests/test_welcome_pack.py` ensuring zero stale dates

---

## Phase 6: Polish, End-to-End Verification & Documentation

- [X] T015 Run full invariant validation suite (`python3 src/validate_invariants.py` and `python3 src/validate_timeline_freshness.py`)
- [X] T016 Run comprehensive test suite (`python3 -m unittest discover tests/`) and verify 100% green test passes
- [X] T017 Validate offline functionality (`file://`), responsive layout across mobile and desktop, and zero console errors in `dashboard/index.html`
