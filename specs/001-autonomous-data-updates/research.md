# Research & Architecture Decisions: Autonomous Live Data Ingestion

**Feature**: Autonomous Live Data Ingestion & Periodic Updates  
**Branch**: `001-autonomous-data-updates`  
**Date**: 2026-08-31  

## Phase 0 Research Topics

### 1. Ingestion Execution Architecture & Scheduling

- **Decision**: Implement a Python-based hybrid runner (`src/data_ingestion.py`) supporting:
  1. `daemon` / `poll` mode: Configurable sleep loop (default 15m) running in background.
  2. `once` / CLI mode: On-demand manual trigger (`python3 src/data_ingestion.py --run-once`).
  3. `watch` mode: Directory watcher monitoring `data/telegram_archive/` and `data/fixtures/` for new file drops.
- **Rationale**:
  - Requires zero heavy third-party task runners (no Celery, Redis, or RabbitMQ needed).
  - Works identically on local development machines, persistent server daemons, and CI/CD cron schedules (e.g., GitHub Actions workflow `sync-news-data.yml`).
  - Strict compliance with Constitution Principle V (Operational Simplicity).
- **Alternatives Considered**:
  - *Celery / Redis*: Rejected due to unnecessary operational overhead, external services dependency, and complexity for a file-centric data project.
  - *Cron only*: Cron alone lacks directory watching and programmatic integration hooks.

---

### 2. Multi-Source Connectors & Modular Parsers

- **Decision**: Modular parser architecture under `src/parsers/`:
  - `telegram_parser.py`: Auto-discovers and parses plain-text/PDF assembly minutes and exported chats in `data/telegram_archive/`. Supports direct Telegram Bot/MTProto channel polling when `TELEGRAM_BOT_TOKEN` / `TELEGRAM_API_ID` are configured in `.env`.
  - `news_parser.py`: Fetches and extracts news items, press releases, and SIMA updates from RSS/Atom feeds and validated HTML sources listed in `config/sources.json`.
  - `metric_parser.py`: Ingests external economic indicators (INE inflation rates, stock quotes, Beluga transport status) into structured numeric fields.
- **Rationale**:
  - Decouples raw extraction from metric computation.
  - Adding a new source requires adding an entry in `config/sources.json` and a small parser handler without touching core analysis engines.
- **Alternatives Considered**:
  - *Monolithic single script*: Hard to test, maintain, and expand as news sources evolve.

---

### 3. Invariant Verification & Atomic Commit Pipeline

- **Decision**: Staged update with atomic rollback:
  1. Ingest raw inputs to staging memory.
  2. Compute derived metrics via `src/analysis_engine.py` and `src/sentiment_thermometer.py`.
  3. Run `src/validate_invariants.py` against the staged metrics snapshot.
  4. If all invariants pass: atomically write `data/conflict_metrics.json`, `data/thermometer_data.json`, `data/beluga_status.json`, and update `data/sync_status.json` with timestamp and source digest.
  5. If invariants fail: abort transaction, write error details to `data/sync_status.json` (status: `degraded`), and emit alerts without altering active data files.
- **Rationale**:
  - Satisfies Constitution Principle I (100% Mathematical & Invariant Integrity).
  - Guarantees readers and dashboard clients never observe half-written files, partial records, or mathematically corrupted models.
- **Alternatives Considered**:
  - *Direct in-place file mutation*: Rejected because an error mid-write corrupts JSON data and crashes consumers.

---

### 4. Client-Side Live Polling & Seamless Dashboard Re-render

- **Decision**: Vanilla JavaScript client polling loop in `dashboard/app.js`:
  - Periodically requests `data/sync_status.json` (with cache-busting timestamp/ETag every 30 seconds).
  - If `last_updated_timestamp` is newer than the client's rendered version, fetch updated metric files and trigger targeted DOM updates (thermometer needle, KPI cards, charts, and sync badge).
  - Display live connection indicator: Green (Healthy / Live), Amber (Degraded / Fallback Cached), Gray (Checking).
- **Rationale**:
  - Preserves static zero-build deployment (compatible with GitHub Pages, local static servers, and CDNs).
  - Requires zero WebSocket infrastructure while providing immediate real-time feel to users.
- **Alternatives Considered**:
  - *WebSockets / SSE*: Requires running an active WebSocket server, breaking static hosting simplicity and adding unnecessary connection lifecycle management.
