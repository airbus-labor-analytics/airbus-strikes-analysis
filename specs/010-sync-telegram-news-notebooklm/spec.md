# Feature Specification: Sincronización Integral de Telegram, Noticias/Redes y NotebookLM

**Feature Branch**: `010-sync-telegram-news-notebooklm`  
**Created**: 2026-08-31  
**Status**: Draft  
**Input**: "acciona la descarga de documentos del telegram para incluirlos en github y subida a notebooklm, al igual que la actualización de noticias, tweets, etc."

---

## 1. Visión y Objetivos

Este flujo de trabajo orquesta la adquisición continua, clasificación, archivo e ingestión de fuentes primarias del conflicto de Airbus España 2026 a través de 3 ejes fundamentales:
1. **Archivo y Extracción de Documentos de Telegram**: Descarga, normalización y catalogación indexada de actas de asamblea, comunicados, dossiers económicos y resoluciones del SIMA desde el canal oficial `EnfadadosconAirbus` (`https://t.me/+MnuqJDCAAgYyMGQ0`) en el repositorio GitHub (`data/telegram_archive/`).
2. **Actualización de Noticias, Redes Sociales y Termómetro de Presión**: Sindicación en vivo de noticias de prensa económica/aeronáutica (Google News RSS), redes sociales (Twitter/X, Reddit) y comunicados sindicales con cálculo dinámico del termómetro de conflicto (°C) en `data/thermometer_data.json`.
3. **Sincronización Automatizada con NotebookLM**: Ingestión estructurada de nuevos documentos, minutas y la Guía Estratégica en el cuaderno de investigación de Google NotebookLM (`602774aa-f859-4d52-a3e4-87afb7761d15`), garantizando un contexto primario 100% verificado para consultas de inteligencia artificial.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Descarga, Extracción e Indexación de Documentos de Telegram (Priority: P1) 🎯 MVP

Como analista o trabajador de Airbus, deseo que todos los documentos compartidos en el canal oficial de Telegram (minutas de asambleas de Getafe/San Pablo/Illescas, dossiers salariales y recursos legales) se descarguen, se estructuren en subcarpetas temáticas y se listen con su resumen y metadatos en un índice JSON y en el visor del dashboard.

**Why this priority**: Es la fuente primaria directa de la soberanía asamblearia y la evidencia legal más crítica del conflicto.

**Independent Test**: Ejecutar el sincronizador de Telegram y verificar que los archivos de texto/PDFs se ubican en `data/telegram_archive/` (`assembly_minutes/`, `legal_filings/`, `dossiers/`, `documents/`) y que `data/telegram_archive/telegram_index.json` refleja el recuento, tamaño y enlaces relativos.

**Acceptance Scenarios**:
1. **Given** nuevos archivos o fuentes compartidas en el canal, **When** se ejecuta la sincronización de Telegram, **Then** los documentos se descargan/extraen, se asigna su categoría temática y se actualiza `telegram_index.json`.
2. **Given** documentos ya descargados previamente, **When** se repite la sincronización, **Then** el sistema realiza una operación idempotente sin duplicar ficheros ni corromper metadatos existentes.

---

### User Story 2 - Actualización en Vivo de Noticias, Tweets y Termómetro de Presión (Priority: P2)

Como usuario del portal web, deseo que el feed de noticias, alertas de Twitter/X y medios especializados se actualice con las últimas publicaciones sobre la huelga, recalculando el índice de temperatura (°C) y el balance entre presión sindical y respuestas corporativas.

**Why this priority**: Mantiene informada a la plantilla en tiempo real sobre la cobertura mediática y el impacto reputacional del conflicto.

**Independent Test**: Ejecutar el motor de termómetro de sentimiento y comprobar que `data/thermometer_data.json` y `data/sync_status.json` reflejan la fecha/hora UTC actual, nuevas noticias parseadas y la temperatura media calculada.

**Acceptance Scenarios**:
1. **Given** fuentes RSS y feeds de redes disponibles, **When** se ejecuta el motor de noticias, **Then** se extraen los titulares relevantes, se categorizan por criticidad/sentimiento y se guarda el histórico consolidado.
2. **Given** una ejecución offline o fallo de conexión externa, **When** falla la consulta remota, **Then** el sistema preserva el dataset local existente sin degradar el dashboard ni generar excepciones no controladas.

---

### User Story 3 - Ingestión y Sincronización en Google NotebookLM (Priority: P3)

Como investigador o redactor estratégico, deseo que las minutas de asamblea, acuerdos del BOE, dossiers y la Guía Estratégica se sincronicen con el cuaderno de Google NotebookLM para permitir generación de podcasts, resúmenes ejecutivos y análisis semántico profundo.

**Why this priority**: Potencia la síntesis de inteligencia avanzada y la creación de material divulgativo a partir del archivo documental.

**Independent Test**: Ejecutar el pipeline de subida a NotebookLM y verificar que los documentos clave son procesados o listados como fuentes activas en el cuaderno de investigación correspondiente.

**Acceptance Scenarios**:
1. **Given** nuevos documentos de texto o PDFs en `data/telegram_archive/` o `docs/`, **When** se ejecuta el sincronizador de NotebookLM, **Then** se preparan y cargan las fuentes al ID de cuaderno configurado.

---

### Edge Cases

- **Fallo de conectividad o limitación de tasa (rate-limiting)**: Si una API externa o canal presenta bloqueos o timeout, el proceso debe registrar la advertencia y continuar con las fuentes restantes sin abortar la sincronización global.
- **Caracteres especiales y nombres de archivo complejos**: Los nombres de documentos con tildes, espacios o símbolos en Telegram deben normalizarse de forma segura para compatibilidad cross-platform en git.
- **Duplicidad de fuentes**: El sistema debe identificar documentos existentes mediante hash o identificadores unívocos para evitar fuentes redundantes.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE proveer un comando unificado para ejecutar la sincronización completa de documentos de Telegram, noticias RSS/redes y actualización de NotebookLM.
- **FR-002**: El extractor de Telegram DEBE clasificar automáticamente cada archivo en una de las cuatro categorías: `Minuta de Asamblea`, `Documento Legal / SIMA`, `Dossier Económico / Técnico` o `General / Comunicado`.
- **FR-003**: El sistema DEBE generar y mantener actualizado `data/telegram_archive/telegram_index.json` con el listado completo de documentos, incluyendo título, fecha, categoría, resumen, tamaño en caracteres y ruta relativa.
- **FR-004**: El motor de noticias DEBE sindicar titulares desde las fuentes configuradas (Google News RSS, comunidad, prensa especializada), calcular la temperatura de presión del conflicto (°C) y persistir el resultado en `data/thermometer_data.json`.
- **FR-005**: El sistema DEBE actualizar el registro de sincronización en `data/sync_status.json` registrando la marca temporal ISO 8601, recuento de fuentes procesadas y estado del pipeline.
- **FR-006**: El módulo de NotebookLM DEBE validar la disponibilidad de los documentos fuente y sincronizarlos con el cuaderno ID `602774aa-f859-4d52-a3e4-87afb7761d15`.
- **FR-007**: Todos los ficheros generados DEBEN ser versionables en git e integrarse limpiamente con los flujos de CI/CD (`.github/workflows/sync-news-data.yml`).

---

### Key Entities

- **TelegramDocument**: Archivo descargado del canal con atributos: `id`, `title`, `filename`, `category`, `date`, `summary`, `size_chars`, `file_path`, `url`.
- **NewsItem**: Noticia o publicación de red social con atributos: `id`, `title`, `source`, `channel`, `date`, `url`, `sentiment` (leverage/neutral/spin), `score`.
- **SyncStatus**: Estado de sincronización con atributos: `last_sync`, `status`, `news_count`, `telegram_docs_count`, `notebooklm_status`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% de los documentos extraídos de Telegram se catalogan en `telegram_index.json` con rutas de archivo locales válidas.
- **SC-002**: El dataset de noticias `thermometer_data.json` se actualiza con marcas temporales recientes (<24h) y cálculo matemático consistente del índice de temperatura.
- **SC-003**: La ejecución completa del pipeline de sincronización se completa en menos de 30 segundos en entornos locales estándar.
- **SC-004**: Cero regresiones en los tests unitarios (`python3 -m unittest discover tests`) y en los validadores de invariantes (`validate_invariants.py` y `validate_sources.py`).

---

## Assumptions

- El canal de Telegram y los feeds RSS son accesibles públicamente sin requerir autenticación de pago.
- Los documentos de texto plano y PDFs son compatibles con la API de NotebookLM y el visor del dashboard.
- La ejecución puede realizarse tanto de forma manual (CLI) como desatendida mediante GitHub Actions.
