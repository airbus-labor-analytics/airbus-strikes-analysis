# Feature Specification: Rediseño del Módulo de Cálculo Salarial

**Feature Branch**: `012-salary-simulator-redesign`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "Mejoras en la parte del cálculo salarial, actualmente es un caos, no se entiende, mucha información duplicada, las ofertas propuestas no se entienden los cálculos que deberían explicados a nivel matemático y junto a la frase que lo justifica de forma de popup, hagámoslo sencillo, además añadir gráfica con evolución salarial con subidas generales año a año en cada una de las propuestas"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Trabajador compara propuestas de forma clara (Priority: P1)

Un trabajador de Airbus introduce su salario bruto actual y en un vistazo inmediato ve las tres propuestas (Empresa, SIMA, Comité de Huelga) con su impacto neto real en euros. Cada cifra tiene un tooltip con la fórmula matemática exacta que la genera, explicada en términos comprensibles y con la cláusula del convenio que la justifica. No hay tablas redundantes ni secciones repetidas.

**Why this priority**: Es el valor central del módulo. Sin claridad en las propuestas, el simulador no sirve como herramienta sindical de persuasión.

**Independent Test**: Configurar salario base a 50.000 €, verificar que cada tarjeta muestra exactamente: salario año 1, subida mensual neta, atrasos, RSG y beneficio neto total año 1, sin que ningún valor se repita en otra sección inferior.

**Acceptance Scenarios**:

1. **Given** el usuario introduce 50.000 € de salario, **When** el módulo calcula, **Then** las 3 tarjetas muestran salarios año 1 correctos (52.500 / 54.750 / 56.000 €) con delta mensual neto calculado con la tasa IRPF correspondiente.
2. **Given** el usuario pasa el cursor (o toca en móvil) sobre "Subida neta/mes", **When** aparece el tooltip, **Then** muestra la fórmula `Δ mensual = (S₁ − S₀) / 14 × (1 − tasa_IRPF)` y la referencia al artículo del Convenio o la cláusula SIMA.
3. **Given** el usuario cambia el salario de 50.000 a 34.000 €, **When** el módulo recalcula, **Then** todos los valores en las 3 tarjetas se actualizan instantáneamente sin recarga de página.
4. **Given** se visualiza el módulo, **Then** no existe ninguna fila o tabla que repita datos ya mostrados en las tarjetas de propuesta.

---

### User Story 2 — Trabajador entiende el impacto del IPC / RSG a 5 años mediante gráfica (Priority: P2)

El trabajador visualiza una gráfica de líneas donde el eje X son los años 2025–2030 y el eje Y el salario bruto anual. Cada propuesta es una línea con color y el área bajo la curva de la propuesta sin RSG muestra la erosión del poder adquisitivo. Cambiar el IPC en el selector actualiza la gráfica en tiempo real.

**Why this priority**: El argumento más poderoso del sindicato es la diferencia acumulada a 5 años. Un gráfico visual convierte un número abstracto en argumento persuasivo para las asambleas.

**Independent Test**: Con salario 50.000 €, IPC 2,5% y propuesta Empresa (+5% sin RSG), la línea roja debe converger hacia el poder real del salario base después de 4 años por ausencia de RSG.

**Acceptance Scenarios**:

1. **Given** el usuario selecciona IPC 3,8% (Media España), **When** el gráfico se actualiza, **Then** la línea de "Empresa +5%" se aplana visiblemente mientras las líneas SIMA y Comité siguen creciendo, evidenciando la erosión.
2. **Given** el usuario pasa el cursor sobre un punto del gráfico, **When** aparece el tooltip del chart, **Then** muestra el año, la propuesta, el salario nominal y el salario real (deflactado) en ese punto.
3. **Given** la vista es móvil (viewport < 640px), **Then** el gráfico es legible, tiene eje X con años abreviados, y no hay overflow horizontal.

---

### User Story 3 — ROI de la huelga integrado y sin duplicados (Priority: P3)

El cálculo de ROI (días de huelga vs ganancia permanente) se muestra en una sección compacta debajo de las tarjetas, con la fórmula de amortización en tooltip, y los diferenciales globales a 5 años en dos KPI cards. Nada de esta información aparece en ninguna tabla adicional.

**Why this priority**: Cierra el argumento: ¿cuánto tardo en recuperar lo que pierdo en huelga? La respuesta rápida impulsa la acción.

**Independent Test**: Con 5 días de huelga y ganancia mensual neta de 308 €, la amortización debe ser 1,6 meses (≈ sacrificio neto ÷ ganancia mensual neta).

**Acceptance Scenarios**:

1. **Given** el slider de huelga está en 5 días y el salario en 50.000 €, **When** se calcula, **Then** `roi-amortization-time` muestra ≈ 1,6 meses.
2. **Given** el tooltip del KPI "Amortización" es visible, **Then** muestra `Meses = coste_huelga_neto / ganancia_mensual_neta`.
3. **Given** no existe tabla de 14 filas ni sección `sec-wages-audit` separada, **Then** `validate_sources.py` pasa sin errores de DOM.

---

### Edge Cases

- ¿Qué ocurre si el IPC slider se lleva a 8% con propuesta Empresa? → La línea "Empresa" debe caer por debajo de la línea base (poder adquisitivo se reduce aunque el sueldo nominal sube 5%).
- ¿Qué ocurre si los días de huelga = 0? → ROI muestra "0 días de sacrificio" y amortización = "inmediata".
- ¿Qué ocurre si el salario introducido es el mínimo (20.000 €)? → Los cálculos de IRPF deben usar la tasa mínima (21%) correctamente.
- Tooltips en móvil: debe ser accesible via tap (no requiere hover).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El módulo DEBE mostrar exactamente 3 tarjetas de propuesta (Empresa, SIMA, Comité), cada una con: salario año 1, subida mensual neta, atrasos, cláusula RSG y beneficio neto año 1. Sin repetición en ninguna sección inferior.
- **FR-002**: Cada línea de dato en las tarjetas DEBE tener un elemento de tooltip (hover/tap) con: (a) la fórmula matemática en notación algebraica clara, (b) un ejemplo concreto con los valores actuales del simulador, (c) la fuente o cláusula del convenio que la origina.
- **FR-003**: Los tooltips DEBEN ser accesibles en pantallas táctiles (tap para mostrar, tap fuera para ocultar).
- **FR-004**: El módulo DEBE incluir una gráfica de líneas "Evolución Salarial Año a Año (2025–2030)" con 3 series (una por propuesta) y el área de poder adquisitivo real bajo la propuesta sin RSG marcada visualmente.
- **FR-005**: La gráfica DEBE actualizarse en tiempo real al cambiar cualquier parámetro del simulador (salario, IPC, pensiones).
- **FR-006**: DEBEN eliminarse todas las secciones duplicadas: la tabla de 14 filas `sec-wages-roi` (breakdown de beneficios), los paneles `sec-wages-audit` (Efecto Abril e IPC), y la tabla de evolución 5 años ya existente abajo — sustituidas por la gráfica nueva y los tooltips en tarjetas.
- **FR-007**: El ROI de huelga DEBE mantenerse, integrado compactamente en una sola sección junto a los 2 KPI diferenciales.
- **FR-008**: Todo cálculo mostrado DEBE pasar `validate_invariants.py` (matemáticas correctas) y `validate_sources.py` (HTML balanceado). El gráfico existente `wagesChart` (acumulado) DEBE mantenerse para no romper tests existentes.
- **FR-009**: El IDs DOM `sc1-*`, `sc2-*`, `sc3-*` de las tarjetas nuevas DEBEN estar conectados a `updateWageSimulation()` en `dashboard/app.js`.
- **FR-010**: La gráfica nueva (`salaryEvolutionChart`) DEBE inicializarse en `initAllModules()` y actualizarse en `updateWageSimulation()` con los valores calculados, no con datos estáticos hardcodeados.

### Key Entities

- **Propuesta salarial**: Conjunto {porcentaje de subida, tipo de consolidación, atrasos, RSG, pensiones, teletrabajo, Bradford} que define un escenario de negociación.
- **Tooltip matemático**: Overlay informativo asociado a cada KPI de propuesta: fórmula, ejemplo numérico instanciado, fuente normativa.
- **Gráfica de evolución**: Chart.js line chart con 3 datasets (Empresa, SIMA, Comité) y un dataset de área (poder adquisitivo sin RSG) sobre eje temporal 2025–2030.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un trabajador puede entender el impacto de las 3 propuestas en menos de 30 segundos sin necesidad de leer ninguna tabla adicional.
- **SC-002**: Cada cifra clave en las tarjetas tiene un tooltip visible con fórmula matemática — 100% de los 5 KPIs por tarjeta = 15 tooltips totales.
- **SC-003**: La sección `tab-purchasing-power` tiene ≤ 50% del HTML actual (eliminación de duplicados medible en líneas).
- **SC-004**: El gráfico de evolución responde a cambios de parámetros en < 100ms (próxima renderización del frame).
- **SC-005**: `python3 src/validate_sources.py` pasa al 100% (HTML balanceado, sin elementos rotos).
- **SC-006**: `python -m unittest discover tests/` 55/55 tests verdes sin modificar ningún test existente.
- **SC-007**: En viewport móvil (375px), todas las tarjetas y la gráfica son legibles sin overflow horizontal.

## Assumptions

- El gráfico acumulado `wagesChart` existente se mantiene (tests existentes lo validan) pero se reubica debajo de la sección nueva.
- Los cálculos matemáticos del simulador no cambian — solo la presentación y la eliminación de duplicados.
- Los tooltips se implementan en CSS puro (`:hover` + `:focus`) con un fallback `onclick` para móvil, sin librerías externas adicionales.
- La gráfica de evolución usa Chart.js (ya cargado en el proyecto) con un canvas nuevo `salaryEvolutionChart`.
- "Efecto Abril" sigue siendo calculable pero su panel standalone desaparece — la información se integra en el tooltip de "Salario Año 1" de la tarjeta de Empresa.
- La fuente de datos continúa siendo `conflict_metrics.json` + parámetros del simulador en tiempo real; no se añade ningún endpoint nuevo.
