# Data Model & State Specifications: Sincronización Integral

**Feature**: `010-sync-telegram-news-notebooklm`  
**Date**: 2026-08-31  

---

## 1. Entidades del Dominio

### 1.1. `TelegramDocument` (`data/telegram_archive/telegram_index.json`)
Representa cada acta, minuta, dossier o comunicado extraído del canal oficial de Telegram.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | `string` | Sí | Identificador alfanumérico único normalizado (slug) |
| `title` | `string` | Sí | Título descriptivo del documento |
| `filename` | `string` | Sí | Nombre del archivo físico descargado |
| `category` | `string` | Sí | Uno de: `Actas de Asamblea`, `Comunicados & Huelga`, `Dossiers & Tablas`, `Planes de Mantenimiento`, `Jurídico & Sentencias` |
| `date` | `string` | Sí | Fecha de publicación / asamblea en formato `YYYY-MM-DD` |
| `summary` | `string` | Sí | Resumen ejecutivo del contenido del documento |
| `size_chars` | `integer` | Sí | Tamaño total en número de caracteres extraídos |
| `file_path` | `string` | Sí | Ruta relativa al archivo de texto plano o PDF (`data/telegram_archive/...`) |
| `url` | `string \| null` | No | Enlace a la fuente original o mensaje de Telegram si aplica |

---

### 1.2. `NewsItem` (`data/thermometer_data.json`)
Representa un titular de noticia o publicación comunitaria sindicada.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | `string` | Sí | Identificador único del feed |
| `title` | `string` | Sí | Titular o texto del post |
| `source` | `string` | Sí | Medio de comunicación o plataforma (e.g. `El Economista`, `Reuters`, `Reddit`) |
| `channel` | `string` | Sí | Canal temático (`Prensa Nacional & Economía`, `Aviation & Industry Press`, `Labor & Negociación`, `Logística & Cadena JIT`) |
| `date` | `string` | Sí | Fecha/hora de publicación en formato ISO 8601 |
| `url` | `string` | Sí | Enlace URL directo a la noticia |
| `sentiment` | `string` | Sí | Uno de: `leverage` (presión sindical), `spin` (comunicación corporativa), `neutral` |
| `score` | `number` | Sí | Puntuación de temperatura de 0 a 100 °C |

---

### 1.3. `SyncStatus` (`data/sync_status.json`)
Representa el estado operativo y telemetría de la última sincronización.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `last_sync` | `string` | Sí | Marca temporal ISO 8601 de la última ejecución exitosa |
| `status` | `string` | Sí | `OK` o `WARNING` |
| `news_count` | `integer` | Sí | Número total de noticias activas en el termómetro |
| `telegram_docs_count` | `integer` | Sí | Número total de documentos catalogados en el archivo de Telegram |
| `notebooklm_sync` | `object` | Sí | Metadatos de subida a NotebookLM (`status`, `uploaded_count`, `last_attempt`) |

---

## 2. Invariantes del Modelo de Datos
- `data/telegram_archive/telegram_index.json` DEBE contener una lista de `documents` donde cada elemento tiene un `file_path` que resuelve a un archivo existente en disco.
- Los recuentos en `data/sync_status.json` DEBEN coincidir exactamente con el total de elementos de `telegram_index.json` y `thermometer_data.json`.
- La fecha `last_sync` DEBE estar en formato ISO 8601 con zona horaria UTC (`Z`).
