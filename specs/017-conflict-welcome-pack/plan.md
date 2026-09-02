# Implementation Plan: Welcome Pack al Conflicto & Guía Cronológica Primaria

**Branch**: `017-conflict-welcome-pack` | **Date**: 2026-09-02 | **Spec**: `specs/017-conflict-welcome-pack/spec.md`

---

## Summary

Implementación integral del **Welcome Pack al Conflicto** y la **Guía Cronológica Primaria en 3 Fases** para dotar a la plantilla, asambleas y delegados de una herramienta didáctica, rigurosa y 100% fundamentada en fuentes primarias sobre las causas de la huelga en Airbus España hasta el 2 de septiembre de 2026 (Día 9 de Huelga Indefinida). Se compone de una nueva pestaña en el dashboard (`#tab-welcome-pack`), un generador automatizado de dossiers en Markdown (`src/generate_welcome_pack.py`), sincronización de datos con `data/conflict_metrics.json` y `dashboard/data.js`, e integración en la suite de pruebas unitarias.

---

## Technical Context

- **Language/Version**: Python 3.10+ (scripts de análisis y generación), JavaScript Vanilla ES2022 (dashboard cliente).
- **Primary Dependencies**: Tailwind CSS (estilos UI), Lucide Icons (iconografía), Python Standard Library (`json`, `pathlib`, `zoneinfo`, `unittest`).
- **Storage**: JSON estático precompilado (`data/conflict_metrics.json`, `dashboard/data.js`) optimizado para modo offline/`file://`.
- **Testing**: `python3 -m unittest discover tests/`, `python3 src/validate_invariants.py`, `python3 src/validate_timeline_freshness.py`, `python3 src/validate_sources.py`.
- **Target Platform**: Navegadores web modernos (Chrome, Firefox, Safari, Edge) y terminal/CLI Linux.
- **Project Type**: Client-side Dashboard + Data Analysis & Report Generation Engine.
- **Performance Goals**: Tiempo de carga inicial <100ms, latencia de renderizado de pestañas <50ms, apertura de modal <50ms.
- **Constraints**: 100% offline-first, cero dependencias NPM/Node.js en runtime, cumplimiento estricto de las 15 reglas de invariantes.
- **Scale/Scope**: 7 centros de trabajo de Airbus en España, 22+ hitos cronológicos, 3 fases temporales, 12.000+ trabajadores representados.

---

## Constitution Check

| Principle / Gate | Status | Evidence / Mitigation |
| :--- | :--- | :--- |
| **I. Mathematical & Invariant Integrity** | **PASS** | Todas las cifras salariales (20,9%-24,4%, -26.030 €) y resultados de votaciones (6.229 NO vs 5.860 SÍ) coinciden con los datasets canónicos auditados. |
| **II. Primary Source Grounding** | **PASS** | Todas las citas provienen de documentos oficiales de Telegram, SIMA y BOE indexados en `data/telegram_archive/`. |
| **III. Zero Synthetic Data** | **PASS** | Prohibición absoluta de cifras inventadas o aproximadas; cada hito refleja actas reales. |
| **VII. Timezone Awareness (Europe/Madrid)** | **PASS** | Timestamp explícito del 2 de septiembre de 2026 utilizando `zoneinfo.ZoneInfo("Europe/Madrid")`. |
| **VIII. Defense-in-Depth & Sanitization** | **PASS** | Todo el renderizado dinámico en el dashboard utiliza escapado seguro HTML contra XSS. |
| **Quality Gate: Invariants & Tests** | **PASS** | Verificación mediante `validate_invariants.py` y `unittest`. |

---

## Project Structure

### Documentation & Specifications
```text
specs/017-conflict-welcome-pack/
├── spec.md               # Feature specification
├── plan.md               # Implementation plan (this file)
├── research.md           # Architectural decisions & phase mapping
├── data-model.md         # Schema and entity definitions
├── quickstart.md         # Validation and test execution guide
├── contracts/
│   └── welcome-pack-schema.json # JSON Schema for Welcome Pack data
└── checklists/
    └── requirements.md   # Quality validation checklist
```

### Source Code & Artifacts
```text
data/
└── conflict_metrics.json # Canonical data store with welcome_pack structure

dashboard/
├── index.html            # UI with #tab-welcome-pack and quick access button
├── app.js                # Welcome pack rendering logic and tab routing
└── data.js               # Embedded client-side dataset mirror

src/
├── generate_welcome_pack.py # Script generating Markdown dossier
└── validate_invariants.py   # System invariant checks

docs/
└── Welcome_Pack_Conflicto_Airbus_2026.md # Generated printable dossier

tests/
├── test_analysis_engine.py  # Core unit test suite
└── test_welcome_pack.py     # Specific tests for welcome pack generation
```

---

## Architectural Decisions & Phasing

1. **Estructura de Datos Canónica**: Añadir la sección `welcome_pack` a `data/conflict_metrics.json` conteniendo `executive_summary`, desglose económico, citas primarias y definición de las 3 fases cronológicas.
2. **Generador en Python (`src/generate_welcome_pack.py`)**: Script idempotente que lee `data/conflict_metrics.json` y compila `docs/Welcome_Pack_Conflicto_Airbus_2026.md`.
3. **Módulo de Visualización en el Dashboard (`dashboard/app.js` + `index.html`)**:
   - Pestaña `#tab-welcome-pack` con diseño visual claro: Bloque de bienvenida, Comparativa Económica, Tarjetas de Citas Primarias y Timeline Cronológico Segmentado en 3 Fases con filtros y botones de apertura de modal.
   - Botón destacado en el hero banner principal para acceso inmediato.
4. **Verificación Automatizada**: Tests unitarios en `tests/test_welcome_pack.py` para asegurar que el dossier se genera correctamente y que todas las citas y enlaces a minutas existen.
