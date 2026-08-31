# Data Model: Strike Data Sync, Sensitive Information Badges & User Validation Gate

**Feature**: [specs/006-sync-strike-data-updates/spec.md](spec.md)
**Date**: 2026-08-31

---

## 1. Entities

### `StrikeUpdateItem`
Represents an individual proposed metric addition, modification, or deletion extracted from Telegram or external source feeds.

| Field | Type | Description |
|---|---|---|
| `id` | String | Unique identifier (e.g. `upd-sima-27aug-salary`) |
| `operation` | Enum (`ADD`, `MODIFY`, `DELETE`) | Proposed mutation type |
| `target_dataset` | String | Target file path (`data/conflict_metrics.json`, `data/beluga_status.json`) |
| `key_path` | String | Dot-notated JSON path (e.g. `proposals.sima_27aug.one_time_payment_eur`) |
| `old_value` | Any \| null | Existing value in dataset (or null for new additions) |
| `proposed_value` | Any \| null | New proposed value (or null for deletions) |
| `source_document` | String | Relative path to source file (e.g. `data/telegram_archive/legal_filings/Reuni_n_Comit__de_Huelga_en_el_SIMA_el_27-08-2026__1_.pdf.txt`) |
| `sensitivity_level` | Enum (`VERIFIED`, `SENSITIVE_UNREVIEWED`, `PROVISIONAL_NEGOTIATION`) | Status classification |
| `validation_status` | Enum (`PENDING`, `APPROVED`, `REJECTED`) | User validation verdict |

---

### `ValidationManifest`
Collection of proposed update items presented to the user during an interactive validation session.

| Field | Type | Description |
|---|---|---|
| `manifest_id` | String | UUID or timestamp identifier (e.g. `manifest-20260831-213000`) |
| `generated_at` | ISO 8601 String | Timestamp when scan completed |
| `source_scan_summary` | Object | Summary of scanned Telegram files and source documents |
| `items` | Array<StrikeUpdateItem> | List of all pending update items |
| `overall_status` | Enum (`PENDING_USER_REVIEW`, `PARTIALLY_APPROVED`, `APPROVED`, `REJECTED`) | Overall manifest state |

---

### `SensitiveDataMarker`
UI badge metadata attached to metrics or negotiation cards on the dashboard.

| Field | Type | Description |
|---|---|---|
| `marker_id` | String | Unique marker identifier (e.g. `marker-sima-27aug`) |
| `badge_label` | String | Text displayed on UI badge (`⚠️ Información Sensible en Revisión`) |
| `badge_color` | String | Tailwind CSS color tokens (`amber-500/20 text-amber-300 border-amber-500/40`) |
| `tooltip_explanation` | String | Extended text explaining negotiation context and pending ratification |
| `linked_source_url` | String | Primary source document link |

---

## 2. State Lifecycle

```text
[Telegram / Sources Ingestion]
           │
           ▼
[Extracted StrikeUpdateItems]
           │
           ▼
[Generate ValidationManifest] ──► (sensitivity_level: PROVISIONAL_NEGOTIATION)
           │
           ▼
[Interactive User Validation Gate] (ask / prompt)
     │                     │
     ├──► [APPROVED] ─────► [Atomic Write to conflict_metrics.json & data.js]
     │                           │
     │                           ▼
     │                      [Render on Dashboard with SensitiveDataMarker]
     │
     └──► [REJECTED] ─────► [Discard & Log in sync_status.json]
```
