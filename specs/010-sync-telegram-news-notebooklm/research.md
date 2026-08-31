# Research & Technical Decisions: Sincronización Integral de Telegram, Noticias/Redes y NotebookLM

**Feature**: `010-sync-telegram-news-notebooklm`  
**Date**: 2026-08-31  
**Status**: Completed  

---

## 1. Arquitectura de Extracción y Almacenamiento de Telegram

### Decisión 1.1: Extracción Dual (Texto Indexable + Archivo Fuente Normalizado)
- **Decisión**: Los archivos del canal oficial de Telegram se descargan y clasifican en subdirectorios temáticos (`assembly_minutes/`, `legal_filings/`, `dossiers/`, `documents/`) bajo `data/telegram_archive/`. Para cada documento se genera simultáneamente un archivo de texto plano estructurado (`.txt`/`.md`) con codificación UTF-8 para visualización en el modal del dashboard y lectura directa por LLMs.
- **Razón**: Permite búsqueda full-text instantánea y renderizado sin dependencias de visores PDF en cliente, manteniendo a la vez el archivo primario original para descarga y verificación forense.
- **Alternativas descartadas**:
  - *Extracción en memoria / JSON único*: Ineficiente para archivos grandes y limita la descarga individual de documentos.
  - *Solo binarios originales*: Imposibilita la búsqueda en cliente y la subida de texto limpio a NotebookLM sin librerías pesadas de extracción PDF en el frontend.

### Decisión 1.2: Indexación Unificada Idempotente (`telegram_index.json`)
- **Decisión**: El índice `data/telegram_archive/telegram_index.json` actúa como registro canónico con metadatos completos: `id`, `title`, `filename`, `category`, `date`, `summary`, `size_chars`, `file_path`, `url`. La ejecución del sincronizador es idempotente: verifica hashes y marcas temporales para evitar re-descargas redundantes.
- **Razón**: Mantiene la paridad dual requerida por la Constitución (Principio III) y garantiza consistencia en el explorador documental de la Pestaña 5 (`#tab-evidence`).

---

## 2. Sindicación de Noticias y Cálculo del Termómetro de Presión

### Decisión 2.1: Multi-Feed RSS + Curación Comunitaria y Fallback Offline
- **Decisión**: `src/sentiment_thermometer.py` consulta 4 canales temáticos de Google News RSS (Prensa Nacional, Aviation Industry, Labor/SIMA, Logística/Beluga) complementados con feeds de redes sociales (Reddit, Twitter/X, comunicados sindicales). Si una petición remota falla o se ejecuta offline, el motor captura la excepción, conserva el dataset anterior y emite una advertencia sin romper la ejecución.
- **Razón**: Máxima resiliencia operativa en CI/CD y entornos locales con conectividad restringida.

### Decisión 2.2: Persistencia del Estado de Sincronización
- **Decisión**: Cada ciclo de ejecución actualiza `data/sync_status.json` con marca temporal ISO 8601, estado del pipeline, número de noticias analizadas y número de documentos de Telegram catalogados.
- **Razón**: Proporciona telemetría transparente consumida por el botón y micro-badge de sincronización en vivo en la cabecera del dashboard.

---

## 3. Ingestión y Sincronización en Google NotebookLM

### Decisión 3.1: Integración con Secretos de GitHub Actions y Fallback Tolerante
- **Decisión**: `src/upload_to_notebooklm.py` y `src/notebooklm_sync.py` validan la presencia del secreto de entorno `NOTEBOOKLM_TOKEN` (o cookies de sesión locales). Si están disponibles, preparan y cargan los documentos al cuaderno `602774aa-f859-4d52-a3e4-87afb7761d15`. Si las credenciales no existen o expiran, el proceso emite un aviso informativo y continúa exitosamente con la sincronización de Telegram y noticias.
- **Razón**: Evita bloqueos en el pipeline de GitHub Actions cuando expiran los tokens temporales de Google, manteniendo los datos y la web siempre actualizados.

---

## 4. Orquestación Automatizada en GitHub Actions

### Decisión 4.1: Programación Cron Dinámica y Disparo Manual
- **Decisión**: `.github/workflows/sync-news-data.yml` se configura con:
  - `cron: '0 6-20/2 * * *'` (cada 2 horas durante horas laborales/asambleas de 06:00 a 20:00 UTC).
  - `cron: '0 0 * * *'` (sincronización nocturna a medianoche UTC).
  - `workflow_dispatch` (ejecución manual instantánea desde GitHub UI o CLI).
- **Razón**: Optimiza el consumo de minutos de GitHub Actions manteniendo alta frescura de datos durante el seguimiento de la huelga.
