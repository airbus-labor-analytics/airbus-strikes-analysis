# Data Model: Autonomous Live Data Ingestion

**Feature**: Autonomous Live Data Ingestion & Periodic Updates  
**Branch**: `001-autonomous-data-updates`  
**Date**: 2026-08-31  

## Entity Definitions

### 1. DataSource (`config/sources.json`)

Represents a configured external or local origin of raw data.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | String | Yes | Unique alphanumeric slug (e.g. `telegram_getafe_assembly`, `sima_news_rss`) |
| `name` | String | Yes | Human-readable label (e.g. `Getafe Assembly Minutes`) |
| `type` | String | Yes | Enum: `telegram_archive`, `telegram_api`, `rss_feed`, `web_scraper`, `file_watcher`, `economic_api` |
| `endpoint` | String | Yes | URI, URL, or filesystem path (e.g. `data/telegram_archive/assembly_minutes/`, `https://example.com/rss`) |
| `polling_interval_minutes` | Integer | Yes | Frequency of checks (e.g. `15`, `60`) |
| `enabled` | Boolean | Yes | Active flag for scheduling |
| `auth_env_var` | String | No | Name of `.env` variable containing API key or token if required |

---

### 2. IngestionEvent (`data/sync_status.json`)

Represents a recorded execution of the ingestion and sync cycle.

| Field | Type | Required | Description |
|---|---|---|---|
| `event_id` | String | Yes | Unique execution identifier (e.g. `evt_20260831_180000`) |
| `timestamp` | String (ISO 8601) | Yes | Execution timestamp |
| `duration_ms` | Integer | Yes | Total execution time in milliseconds |
| `sources_checked` | Array<String> | Yes | List of `DataSource.id` values polled |
| `sources_updated` | Array<String> | Yes | List of `DataSource.id` values with new data |
| `status` | String | Yes | Enum: `healthy`, `degraded`, `failed` |
| `invariants_validated` | Boolean | Yes | Outcome of `src/validate_invariants.py` |
| `validation_error` | String / Null | No | Failure details if invariant validation failed |
| `items_processed` | Integer | Yes | Count of parsed messages, files, and articles |

---

### 3. LiveSyncState (Exposed to Dashboard)

Root status metadata served in `data/sync_status.json`.

```json
{
  "version": "1.0.0",
  "last_successful_sync": "2026-08-31T18:00:00Z",
  "system_status": "healthy",
  "polling_interval_seconds": 30,
  "sources": {
    "telegram": { "status": "active", "last_message_ts": "2026-08-31T17:45:00Z", "total_docs": 105 },
    "news": { "status": "active", "last_article_ts": "2026-08-31T16:30:00Z", "total_articles": 42 },
    "metrics": { "status": "active", "invariants_pass": true }
  },
  "latest_event": {
    "event_id": "evt_20260831_180000",
    "duration_ms": 412,
    "status": "healthy"
  }
}
```

---

### 4. Canonical Snapshots (Persisted Data Stores)

- **`data/conflict_metrics.json`**: Primary metrics dataset (census, delegate allocations, voting figures, shareholder shares, stock capital loss calculations, wage mass platform tables).
- **`data/thermometer_data.json`**: Assembly sentiment scores, tension indicators, and trend records.
- **`data/beluga_status.json`**: Logistics disruption levels, plant bottlenecks, and flight impact indicators.
- **`data/telegram_archive/telegram_index.json`**: Categorized index of primary source text documents with metadata and citations.

---

## Validation & Invariant Enforcement

Before any `ConflictMetricsSnapshot` or `LiveSyncState` is committed:
1. **Census Conservation**: $\sum \text{Plant Census} = 15,562$.
2. **Delegate Conservation**: $\sum \text{Plant Delegates} = \sum \text{Union Delegates} = 198$.
3. **2D Matrix Symmetry**: Plant-by-union delegate matrix rows and columns must balance.
4. **Referendum Consistency**: Total Votes $\le$ Census, $\text{NO} + \text{YES} + \text{Blank} = \text{Total}$.
5. **Economic Conservation**: Purchasing power loss components must balance ($\text{Gross} - \text{Payouts} = \text{Net Loss}$).
