# Quickstart & Verification Guide: Sincronización Integral

**Feature**: `010-sync-telegram-news-notebooklm`  
**Date**: 2026-08-31  

---

## 1. Escenario de Validación 1: Sincronización de Archivo Telegram

Ejecutar el script de extracción y verificar la creación/actualización de los archivos y del índice JSON:

```bash
python3 src/telegram_channel_sync.py
```

**Verificaciones esperadas**:
1. `data/telegram_archive/telegram_index.json` existe y contiene un array de `documents`.
2. Todos los `file_path` de los documentos existen físicamente bajo `data/telegram_archive/`.

---

## 2. Escenario de Validación 2: Sindicación de Noticias y Termómetro

Ejecutar el motor de noticias:

```bash
python3 src/sentiment_thermometer.py
```

**Verificaciones esperadas**:
1. `data/thermometer_data.json` contiene `overall_temperature_celsius` (número entre 0 y 100).
2. `data/sync_status.json` refleja `last_sync` con timestamp actual UTC.

---

## 3. Escenario de Validación 3: Pipeline de Ingestión NotebookLM con Fallback

Ejecutar el script de subida a NotebookLM:

```bash
python3 src/upload_to_notebooklm.py
```

**Verificaciones esperadas**:
1. Si no hay credenciales, emite mensaje informativo y finaliza con código de salida `0` sin lanzar excepciones no controladas.
2. Si hay credenciales, valida o sube las fuentes al cuaderno `602774aa-f859-4d52-a3e4-87afb7761d15`.

---

## 4. Escenario de Validación 4: Quality Gates e Invariantes

Ejecutar la suite completa de validadores y tests:

```bash
python3 src/validate_invariants.py
python3 src/validate_sources.py
python3 -m unittest discover tests
```

**Resultado esperado**:
- 100% de reglas e invariantes pasando sin errores.
