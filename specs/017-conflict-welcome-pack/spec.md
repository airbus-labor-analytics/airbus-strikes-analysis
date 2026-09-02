# Feature Specification: Welcome Pack al Conflicto & Guía Cronológica Primaria

**Feature Branch**: `017-conflict-welcome-pack`  
**Created**: 2026-09-02  
**Status**: Draft  
**Input**: User description: "quiero un welcome pack al conflicto donde se explique que nos ha llevado aquí tomando referencias y citas de los documentos sacados de telegram, una cronologia hasta antes de la huelga, y una hasta la huelga indefinida, y finalmente hasta el día de hoy 2 de septiembre (ira actualizandose, marcar ultima fecha actualizada de los textos)"

---

## Executive Summary

El **Welcome Pack al Conflicto** es una guía integral de inducción, contextualización y pedagogía documental diseñada para trabajadores, delegados sindicales, comités de centro y la opinión pública. Su objetivo principal es articular de manera didáctica, rigurosa y 100% fundamentada en fuentes primarias las causas estructurales que han desencadenado la mayor huelga general en la historia de Airbus en España.

El documento estructura la narrativa en tres fases cronológicas diferenciadas con citas literales de las actas de asamblea y documentos de mediación en el SIMA, incorpora un sistema de sellos temporales que marca la última fecha de actualización (2 de septiembre de 2026), y enlaza directamente con el visor modal de minutas íntegras del archivo de Telegram.

## Clarifications

### Session 2026-09-02
- Q: ¿Cómo debe integrarse visual y funcionalmente el Welcome Pack dentro del cuadro de mando interactivo? → A: Pestaña principal dedicada (`#tab-welcome-pack` / Guía del Conflicto & Welcome Pack) en la barra de navegación superior + botón de acceso rápido («¿Qué nos ha llevado aquí?») en el banner superior.
- Q: ¿Cómo debe mantenerse y generarse el dossier físico/descargable (`docs/Welcome_Pack_Conflicto_Airbus_2026.md`) para evitar discrepancias futuras con los datos del cuadro de mando? → A: Generación automatizada mediante script Python (`src/generate_welcome_pack.py`) acoplado a `data/conflict_metrics.json` e integrado en la suite de pruebas unitarias.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consulta del Welcome Pack & Causas Estructurales (Priority: P1)

Como trabajador o nuevo participante en las asambleas de Airbus, quiero acceder a una guía ejecutiva ("Welcome Pack") que explique de forma clara e incontestable qué nos ha llevado a la huelga, para comprender la legitimidad económica y laboral de la plataforma de 11 puntos con citas textuales de los documentos oficiales.

**Why this priority**: Es la puerta de entrada indispensable para unificar la comprensión de toda la plantilla y contrarrestar la desinformación con datos económicos oficiales e irrefutables.

**Independent Test**: Acceder al módulo o guía del Welcome Pack y verificar que se exponen los antecedentes económicos (pérdida del 20,9% al 24,4% bajo el VI Convenio, 26.030 € de pérdida neta media por trabajador, 5.221 M€ de beneficio neto de Airbus SE en 2025) acompañados de citas textuales de los comunicados de Telegram.

**Acceptance Scenarios**:
1. **Given** un usuario que accede a la sección del Welcome Pack en la plataforma, **When** lee el bloque de introducción económica, **Then** visualiza la comparativa entre la inflación acumulada (+19,3% general / +31,2% alimentos) y los incrementos salariales fijos pactados en el VI Convenio (+1% en 2020, +1% en 2021, +1,5% en 2022, +4,4% en 2023).
2. **Given** el bloque de antecedentes, **When** el usuario inspecciona las citas primarias, **Then** encuentra fragmentos textuales autenticados del Dossier de Pérdida Salarial y los comunicados oficiales de la mayoría sindical.

---

### User Story 2 - Cronología en 3 Fases Documentadas con Citas y Minutas (Priority: P2)

Como delegado o integrante de los comités de huelga de planta, quiero consultar una cronología dividida en tres fases nítidas (Antecedentes hasta junio 2026, Escalada y Democracia Directa de julio a 24 de agosto, y Huelga Indefinida del 25 de agosto al 2 de septiembre), para disponer del histórico exacto de votaciones, asambleas y sesiones de mediación.

**Why this priority**: Permite reconstruir con total transparencia la secuencia democrática que culminó en el referéndum del 24 de julio y en el mandato asambleario de huelga indefinida.

**Independent Test**: Navegar por las tres fases temporales, verificar que cada hito contiene el resumen fáctico de la minuta del día, los resultados de las votaciones asamblearias registradas (sin invención de datos), y el botón para abrir la minuta íntegra en el visor modal.

**Acceptance Scenarios**:
1. **Given** la **Fase 1 (Gestación / Hasta antes de la huelga)**, **When** el usuario la consulta, **Then** visualiza el origen del conflicto en el VI Convenio y la convocatoria de paros del 30 de junio / 1 de julio.
2. **Given** la **Fase 2 (Escalada y Democracia Directa / Julio a 24 de Agosto)**, **When** el usuario revisa los hitos, **Then** visualiza la marcha del 16/07 (más de 4.000 trabajadores), el censo presencial de 1.700 trabajadores del 20/07, la rebelión del 23/07 tras el preacuerdo de las 02:00 AM, el escrutinio oficial del Referéndum del 24/07 (NO: 6.229 / 49,15% vs SÍ: 5.860 / 46,24%), la sesión SIMA del 21/08 sobre el método Bradford, y la asamblea del 24/08 donde gana por mayoría abrumadora la huelga indefinida desde el 25/08.
3. **Given** la **Fase 3 (Huelga Indefinida / 25 de Agosto a 2 de Septiembre - HOY)**, **When** el usuario navega por los 9 días de huelga, **Then** encuentra el registro diario de piquetes a las 05:30 h, la sesión SIMA con las amenazas de Carmen Maja-Rex del 26/08, la propuesta salarial de 11 puntos entregada en el SIMA del 27/08 (12% en tablas + 7.500€ + IPC+1,5%), las guardias de fin de semana y las asambleas simultáneas del 1 y 2 de septiembre.

---

### User Story 3 - Indicador Dinámico de Frescura y Actualización de Textos (Priority: P3)

Como usuario que consulta la documentación de huelga en tiempo real, quiero ver con total claridad el sello de última fecha de actualización de los textos (actualmente "2 de septiembre de 2026") y saber cuándo se han incorporado los últimos eventos.

**Why this priority**: Asegura que el usuario reconozca que la guía es un documento vivo que evoluciona día a día con el conflicto.

**Independent Test**: Comprobar que en la cabecera y en los bloques cronológicos figura visiblemente el badge de última actualización (`Última actualización: 2 de septiembre de 2026 - Día 9 de Huelga Indefinida`).

**Acceptance Scenarios**:
1. **Given** la interfaz del Welcome Pack, **When** se visualiza la cabecera principal, **Then** se renderiza un badge destacado indicando la fecha de frescura y el día activo de huelga.
2. **Given** una actualización de la cronología en días sucesivos, **When** se ejecute la sincronización de datos, **Then** el sello temporal se actualiza automáticamente.

---

## Edge Cases

- **Acceso sin conexión a Internet (modo offline / `file://`)**: El Welcome Pack y las transcripciones de las minutas deben ser accesibles al 100% mediante los datos precompilados en el cliente sin depender de llamadas de red externas.
- **Visualización en dispositivos móviles (smartphone en asamblea)**: La disposición tipográfica, tablas comparativas y citas en bloque deben ajustarse de forma fluida a pantallas pequeñas (320px – 768px).
- **Traducción o exportación a PDF / Markdown imprimible**: La guía debe estar disponible tanto en formato interactivo web como en fichero estructurado listo para impresión o descarga.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE proporcionar una sección estructurada de introducción ejecutiva ("Welcome Pack al Conflicto") con el desglose económico de la pérdida salarial 2020-2025 frente a los beneficios de Airbus SE.
- **FR-002**: El sistema DEBE incluir citas textuales directas de documentos primarios del canal de Telegram `EnfadadosconAirbus`, actas de asamblea, acuerdos del SIMA y convenios del BOE.
- **FR-003**: La cronología DEBE segmentarse de forma explícita en tres fases:
  1. *Fase 1: Antecedentes y Gestación (2020 – Junio 2026)*.
  2. *Fase 2: Escalada y Democracia Directa (1 de Julio – 24 de Agosto 2026)*.
  3. *Fase 3: Huelga General Indefinida en Curso (25 de Agosto – 2 de Septiembre 2026 / Día 9)*.
- **FR-004**: Cada hito cronológico DEBE registrar de forma fidedigna los datos de las minutas primarias: fecha, lugar, asistentes reales, votaciones exactas con sus opciones, acuerdos y cita destacada.
- **FR-005**: Cada hito con minuta asociada DEBE incorporar un enlace o disparador interactivo al modal de lectura íntegra del documento primario.
- **FR-006**: El sistema DEBE mostrar de forma destacada en la cabecera y en las secciones temporales el sello de última fecha actualizada (`Última actualización: 2 de septiembre de 2026`).
- **FR-007**: El Welcome Pack DEBE integrarse de forma nativa como pestaña principal dedicada en la barra de navegación (`#tab-welcome-pack` / "Guía del Conflicto") complementada por un botón de acceso rápido en el banner superior ("¿Qué nos ha llevado aquí?"), sincronizado con los datasets canónicos (`data/conflict_metrics.json` y `dashboard/data.js`).
- **FR-008**: DEBE generarse y mantenerse actualizado de forma automatizada un dossier estructurado en Markdown (`docs/Welcome_Pack_Conflicto_Airbus_2026.md`) mediante un script generador (`src/generate_welcome_pack.py`) sincronizado con `data/conflict_metrics.json` y validado por la suite de pruebas unitarias.

---

## Key Entities & Data Model

- **WelcomePackSection**:
  - `id`: Identificador único (ej. `sec-intro`, `sec-phase-1`, `sec-phase-2`, `sec-phase-3`).
  - `title`: Título de la sección.
  - `last_updated`: Fecha ISO y formato textual de actualización (`2026-09-02`, `2 de septiembre de 2026`).
  - `content_markdown`: Contenido explicativo con citas textuales integradas.
  - `primary_quotes`: Lista de citas textuales destacadas con autoría, fecha y enlace a fuente.
- **ChronologyPhase**:
  - `phase_id`: Identificador de fase (`phase_1_origin`, `phase_2_escalation`, `phase_3_strike`).
  - `phase_name`: Nombre formal de la fase.
  - `date_range`: Rango de fechas cubierto.
  - `milestones`: Lista de hitos vinculados a `conflict_metrics.json.timeline`.
  - `key_quote`: Cita primaria representativa de la fase.

---

## Success Criteria *(mandatory)*

1. **Comprensión Rápida**: Un trabajador o delegado puede comprender la justificación económica y la trayectoria democrática del conflicto en menos de 3 minutos de lectura.
2. **Fidelidad al 100% con Cero Invenciones**: El 100% de las cifras salariales, electorales y citas textuales provienen de fuentes primarias verificadas (BOE, SIMA, Telegram, INE).
3. **Acceso Inmediato a Minutas**: El 100% de los hitos con minuta permiten abrir el texto íntegro en el modal en menos de 100 milisegundos sin errores de carga.
4. **Visibilidad de Frescura**: El 100% de los usuarios visualizan el indicador de última actualización en la cabecera principal.
5. **Compatibilidad Total**: La guía se visualiza sin distorsiones en cualquier resolución de pantalla y bajo cualquier protocolo (`http:`, `https:`, `file:`).

---

## Assumptions & Dependencies

- **Dependencia de Datos**: Utiliza los datasets canónicos de `data/conflict_metrics.json`, `data/telegram_archive/` y `docs/Dossier_Perdida_Salarial_Airbus_2020_2025.txt`.
- **Integración Visual**: Se incorpora dentro del sistema de pestañas y modales del dashboard existente con Tailwind CSS y Lucide Icons sin requerir dependencias externas adicionales.
