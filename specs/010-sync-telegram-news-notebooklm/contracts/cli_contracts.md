# CLI & Automation Interface Contracts: Sincronización Integral

**Feature**: `010-sync-telegram-news-notebooklm`  
**Date**: 2026-08-31  

---

## 1. Comandos CLI Unificados

### 1.1. Ingestión y Extracción Completa de Telegram
```bash
python3 src/telegram_channel_sync.py [--force] [--json]
```
- **Entrada**: Ninguna requerida (opcional `--force` para regenerar índice completo).
- **Salida**: Genera/actualiza archivos en `data/telegram_archive/` y `data/telegram_archive/telegram_index.json`.
- **Exit Code**: `0` en éxito o advertencias no bloqueantes; `1` en error fatal de I/O.

### 1.2. Sindicación de Noticias y Termómetro
```bash
python3 src/sentiment_thermometer.py [--dry-run]
```
- **Entrada**: Consulta RSS remotos y feeds locales.
- **Salida**: Escribe `data/thermometer_data.json` y actualiza `data/sync_status.json`.
- **Exit Code**: `0` en éxito/fallback; `1` en fallo de persistencia.

### 1.3. Subida / Sincronización a NotebookLM
```bash
python3 src/upload_to_notebooklm.py [--notebook-id ID] [--check-only]
```
- **Entrada**: Variables de entorno `NOTEBOOKLM_TOKEN` o cookies locales.
- **Salida**: Registra logs de subida y actualiza metadatos en `sync_status.json`.
- **Exit Code**: `0` (inclusive en fallback/skip); `1` en error crítico no recuperable.

---

## 2. Contrato de Orquestación GitHub Actions (`.github/workflows/sync-news-data.yml`)

- **Triggers**:
  - Cron `0 6-20/2 * * *` (Cada 2 horas en horario 06-20 UTC).
  - Cron `0 0 * * *` (Medianoche UTC).
  - `workflow_dispatch` (Manual).
- **Pasos secuenciales**:
  1. `Checkout` y `setup-python`.
  2. `python3 src/telegram_channel_sync.py`
  3. `python3 src/sentiment_thermometer.py`
  4. `python3 src/upload_to_notebooklm.py || true` (Fallback suave)
  5. `python3 src/analysis_engine.py` (Regeneración de datasets consolidados)
  6. `python3 src/validate_invariants.py && python3 src/validate_sources.py` (Quality Gates)
  7. `git add data/ dashboard/data.js` & `git commit` & `git push origin main`
