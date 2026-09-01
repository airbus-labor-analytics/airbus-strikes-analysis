# Implementation Plan: Rediseño Módulo de Cálculo Salarial

**Branch**: `012-salary-simulator-redesign` | **Date**: 2026-08-31 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/012-salary-simulator-redesign/spec.md`

## Summary

El módulo `tab-purchasing-power` del dashboard muestra información salarial triplicada (tarjetas de escenario + tabla detallada de 14 filas + tabla de 5 años), sin fórmulas visibles y sin gráfico de evolución año a año. El rediseño elimina las secciones duplicadas, añade tooltips con fórmulas matemáticas inline en cada KPI de las tarjetas, e introduce un chart.js nuevo (`salaryEvolutionChart`) con 3 líneas (una por propuesta) + área de poder adquisitivo real sin RSG, actualizable en tiempo real.

## Technical Context

**Language/Version**: Vanilla JS (ES2022), HTML5, CSS3 — sin transpiladores

**Primary Dependencies**: Chart.js 4.x (ya cargado), Lucide Icons (ya cargados), Tailwind CSS via CDN (ya cargado)

**Storage**: N/A — los datos residen en `data/conflict_metrics.json` y en los inputs del simulador en tiempo real

**Testing**: `python3 src/validate_invariants.py`, `python3 src/validate_sources.py`, `python -m unittest discover tests/`

**Target Platform**: Navegador moderno (Chrome/Firefox/Safari), responsive 375px–1920px

**Project Type**: Dashboard HTML/JS de página única (zero-build)

**Performance Goals**: Actualización del chart < 100ms tras cambio de parámetro; sin janky en móvil

**Constraints**: Sin librerías adicionales; HTML debe balancear tags al 100%; cálculos matemáticos deben ser idénticos a los actuales (solo presentación cambia)

**Scale/Scope**: 2 archivos modificados (`dashboard/index.html`, `dashboard/app.js`), 1 archivo nuevo no creado (canvas inline en HTML), 1 canvas nuevo (`salaryEvolutionChart`)

## Constitution Check

| Principio | Estado | Verificación |
|-----------|--------|-------------|
| **I. Integridad Matemática** | ✅ PASS | Los cálculos de `updateWageSimulation()` no cambian, solo la presentación. Los tooltips muestran las fórmulas reales ya implementadas. |
| **II. Trazabilidad de Fuentes** | ✅ PASS | Cada tooltip referencia la cláusula de convenio (BOE/SIMA) que origina el concepto. |
| **III. Single Source of Truth** | ✅ PASS | `wagesChart` existente se preserva. El nuevo `salaryEvolutionChart` consume los mismos cálculos de `updateWageSimulation()`. |
| **IV. Tests Automatizados** | ✅ PASS | Ningún invariante matemático cambia. `validate_sources.py` se ejecuta tras cada cambio HTML. |
| **V. Zero-Build** | ✅ PASS | Todo en HTML/CSS/JS puro. El tooltip se implementa con CSS `:hover`/`:focus` + un listener `touchstart` mínimo. |
| **VI. Viewport & Canvas** | ✅ PASS | `salaryEvolutionChart` incluirá `.resize()` en el handler de `switchTab`. |

**GATE: PASSED** — Sin violaciones. No se requiere Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/012-salary-simulator-redesign/
├── plan.md              ← este archivo
├── research.md          ← Phase 0
├── data-model.md        ← Phase 1
├── quickstart.md        ← Phase 1
├── contracts/           ← Phase 1
│   └── ui-contracts.md
└── tasks.md             ← Phase 2 (/speckit.tasks)
```

### Source Code (repository root)

```text
dashboard/
├── index.html           ← sección tab-purchasing-power reemplazada
└── app.js               ← nuevas funciones + IDs wired

tests/                   ← sin cambios (55 tests existentes)
src/
├── validate_invariants.py  ← sin cambios
└── validate_sources.py     ← sin cambios
```

**Structure Decision**: Proyecto web single-file. Todos los cambios en `dashboard/`. No se crean nuevos archivos JS/CSS — el código nuevo va inline en `app.js` siguiendo la convención existente.

---

## Phase 0: Research

### R-001: Tooltips accesibles sin librería externa

**Decisión**: CSS `:hover` + `:focus-within` para escritorio; listener `touchstart` que añade/quita clase `.tip-visible` en móvil. Un `<style>` inline en la sección del simulador define `.math-tip` y `.tip-box`.

**Alternativas descartadas**:
- Tippy.js: dependencia externa innecesaria (ponytail: YAGNI)
- `title` HTML nativo: no permite HTML, ilegible en móvil
- `<dialog>`: overkill para texto corto

### R-002: Chart de evolución año a año

**Decisión**: Canvas nuevo `salaryEvolutionChart` con Chart.js `type: 'line'`. 4 datasets:
1. Empresa +5% (rojo, sin RSG — cae en términos reales)
2. SIMA +9,5% (azul cielo, RSG=IPC — plano en términos reales)
3. Comité +12% (verde, RSG=IPC+1,5% — crece en términos reales)
4. Poder real sin RSG (gris área, `backgroundColor` semitransparente) = serie de empresa deflactada

Los valores se computan desde `updateWageSimulation()` usando los mismos coeficientes ya validados.

**Alternativas descartadas**:
- Reutilizar `wagesChart`: ese chart es de acumulado nominal distinto; mantenerlo evita romper tests
- SVG manual: más código sin beneficio

### R-003: IDs DOM para las nuevas tarjetas

Los IDs `scen-co-*`, `scen-med-*`, `scen-union-*` de las tarjetas actuales se reemplazarán por `sc1-*`, `sc2-*`, `sc3-*` (más cortos, semánticamente equivalentes). Los IDs `roi-*`, `kpi-diff-*` se preservan sin cambio.

La tabla de 14 filas (`tb-base-cur`, `tb-base-co`, etc.) y los paneles `ea-loss-*`, `ipc-audit-*` se **eliminan** del HTML — sus IDs desaparecen. `updateWageSimulation()` se actualiza para no escribir en esos IDs inexistentes.

---

## Phase 1: Design & Contracts

### data-model.md

Ver [`data-model.md`](data-model.md).

### contracts/ui-contracts.md

Ver [`contracts/ui-contracts.md`](contracts/ui-contracts.md).

### quickstart.md

Ver [`quickstart.md`](quickstart.md).
