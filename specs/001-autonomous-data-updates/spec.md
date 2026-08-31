# Feature Specification: Autonomous Live Data Ingestion & Periodic Updates

**Feature Branch**: `001-autonomous-data-updates`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "la aplicacion debe poder actualizarse desde numeros, fuentes, archivos, noticias, telegram de manera autonoma, no debe estar hardcodeado, debe actualizarse en directo (cada x tiempo)"
## Clarifications

### Session 2026-08-31
- Q: What execution architecture should drive the autonomous background data ingestion from Telegram, news feeds, and files? → A: Option A (Hybrid Background Scheduler & On-Demand Trigger: configurable interval polling e.g. 15 min + on-demand CLI + file-drop detection).
- Q: How should the system ingest raw data from Telegram channels and assembly announcements? → A: Option A (Hybrid Ingestion: auto-ingest local archive drops in data/telegram_archive/ by default; connect to live Telegram API/Bot when credentials exist in .env).
- Q: How should the web dashboard detect and render live data updates in real time? → A: Option A (Client-Side HTTP Polling: dashboard periodically fetches JSON data with timestamp/ETag comparison, re-rendering in place when changes are detected, preserving zero-build static hosting).
- Q: How should the system handle invariant validation failures when incoming live data contains numerical contradictions? → A: Option A (Atomic Rollback & Health Degradation: abort the transaction, preserve existing verified snapshot, log error, and surface a sync warning badge in UI).
- Q: Where and in what format should data source endpoints, Telegram channels, and refresh intervals be configured? → A: Option A (JSON/YAML Configuration File with Env Overrides: dedicated configuration file e.g. config/sources.json defining feeds, channels, directories, and intervals, with .env overrides).


## User Scenarios & Testing *(mandatory)*

### User Story 1 - Autonomous Multi-Source Data Ingestion (Priority: P1)

As an analyst or strike committee member, I want the system to autonomously ingest raw data from Telegram messages, news feeds, document files, and external metrics without manual code modification, so that the dataset remains continuously up-to-date with reality.

**Why this priority**: Core value of the feature. Eliminates static hardcoding by connecting data pipelines directly to live communication channels and published sources.

**Independent Test**: Can be verified by placing a new primary document or feed entry into the ingestion pipeline and observing that metrics and text indexes update automatically without modifying application code.

**Acceptance Scenarios**:

1. **Given** a new assembly record or announcement arrives via Telegram or a document archive, **When** the ingestion cycle runs, **Then** the message text, sentiment indicators, and timestamp are extracted and cataloged into the structured data store without manual schema changes.
2. **Given** updated economic or logistics figures (inflation index, stock quote, Beluga logistics report), **When** ingested by the pipeline, **Then** dependent calculations (e.g. purchasing power loss, assembly sentiment score, logistics risk) update automatically based on active mathematical rules.
3. **Given** any incoming data update, **When** processed, **Then** all values pass project invariant validation checks before committing to the active dataset.

---

### User Story 2 - Configurable Periodic Live Refresh (Priority: P2)

As a researcher or dashboard visitor, I want the system and web interface to automatically check for and display fresh updates every X time interval without requiring manual page reloads or manual server triggers, so that I always see live status during ongoing negotiations.

**Why this priority**: Delivers real-time awareness and autonomous operation as specified by the user ("debe actualizarse en directo cada x tiempo").

**Independent Test**: Can be verified by configuring a refresh interval (e.g., 60 seconds), issuing a background data change, and observing that the user interface updates dynamically while reflecting the latest sync timestamp.

**Acceptance Scenarios**:

1. **Given** an active dashboard session and a configured sync interval of $T$ minutes, **When** $T$ minutes elapse, **Then** the interface fetches the latest dataset seamlessly and re-renders updated charts, KPIs, and status banners.
2. **Given** an automated background sync job configured on a schedule, **When** triggered on its cadence, **Then** it pulls external feeds, recalculates metrics, validates data integrity, and publishes the fresh snapshot.
3. **Given** a user viewing the live dashboard, **When** a periodic update succeeds, **Then** the interface clearly indicates the last updated timestamp and connection/sync health.

---

### User Story 3 - Transparent Source Grounding & File Ingestion (Priority: P3)

As a labor delegate or auditor, I want every newly ingested figure and claim to link back to its verifiable primary source file or URL, so that the analysis remains credible, auditable, and compliant with project governance principles.

**Why this priority**: Guarantees data trust and adherence to Constitution Principle II (Primary Source Grounding & Traceability).

**Independent Test**: Can be verified by inspecting any newly ingested metric or event in the dashboard and confirming it displays an actionable reference to its origin document or URL.

**Acceptance Scenarios**:

1. **Given** a new report or news item is ingested, **When** displayed in the interface, **Then** it includes origin metadata (source name, publishing date, excerpt, document link).
2. **Given** a source file format (PDF, structured JSON, plain text table, or RSS feed), **When** ingested, **Then** the parser extracts both the payload data and citation metadata.

---

### Edge Cases

- **Network or Feed Unavailability**: What happens when an external feed (Telegram API, news provider, flight status endpoint) times out or returns an HTTP error? The system MUST gracefully retain the last verified snapshot, mark the source as degraded with a timestamp, and continue serving valid cached metrics without crashing or corrupting existing records.
- **Malformed or Inconsistent Ingestion Data**: What happens when an incoming document or feed contains mathematically contradictory numbers (e.g. plant census sum mismatch or broken percentage totals)? The system MUST abort the update transaction, retain the previous verified snapshot, record the validation error in an audit log, and surface a degraded sync status badge in the dashboard.
- **Concurrent Ingestion & Read Requests**: What happens when a user views the dashboard at the exact moment a background sync cycle writes new data? The system MUST perform atomic writes so that readers never observe partially written or malformed JSON payloads.
- **Rate Limiting & Polling Throttling**: What happens when polling intervals are set too aggressively against external endpoints? The system MUST implement jitter and bounded backoff to respect external rate limits.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an autonomous ingestion pipeline that ingests data via a hybrid connector model: auto-parsing local document/Telegram exports in watched directories (e.g. `data/telegram_archive/`) and connecting directly to live external APIs (Telegram, news feeds) when credentials are provided in configuration.
- **FR-002**: System MUST externalize all data source configurations (feed URLs, Telegram channels, watched folder paths, polling intervals) into a dedicated configuration file (e.g., `config/sources.json`), overridable via environment variables.
- **FR-003**: System MUST execute background data synchronization via a hybrid architecture supporting configurable interval polling (default 15 minutes), on-demand CLI triggering, and automatic file-drop detection in watched directories.
- **FR-004**: System MUST perform automated mathematical and factual invariant validation on all newly ingested data before updating the canonical data files.
- **FR-005**: If invariant validation fails during an ingestion run, the system MUST execute an atomic rollback (preserving the active verified snapshot), write an error log detailing the failed invariant rule, and surface a degraded sync health indicator on the dashboard.
- **FR-006**: System MUST update live metrics, assembly sentiment scores, Beluga flight disruption status, and negotiation metrics derived from the newly ingested raw inputs.
- **FR-007**: The web dashboard MUST implement client-side HTTP polling (checking every 30–60s) with timestamp/hash comparisons to seamlessly re-render charts, KPIs, and status banners when updated data is detected without a full page refresh.
- **FR-008**: The web dashboard MUST visually display the current synchronization status, connection health, and timestamp of the last successful live update.
- **FR-009**: The system MUST store and preserve audit trails and timestamps for all ingested updates, mapping each derived figure to its primary source reference.
- **FR-010**: The ingestion engine MUST support on-demand manual trigger invocation in addition to scheduled periodic runs.

---

### Key Entities

- **DataSource**: Represents an external or local origin of raw data (Telegram archive, RSS/news endpoint, document folder, financial index). Attributes: identifier, source type, URI/path, polling cadence, authentication/access credentials reference, active status.
- **IngestionEvent**: Represents a discrete execution of the data extraction pipeline. Attributes: event ID, timestamp, source ID, status (success, failed, degraded), items ingested count, validation outcome.
- **ConflictMetricsSnapshot**: The canonical, validated collection of strike analytics, plant censuses, voting percentages, strike fund balances, and financial loss calculations produced after invariant verification.
- **SourceCitation**: Metadata linking a specific metric or statement to its origin document, file path, publication date, and excerpt.
- **LiveSyncState**: State object tracking client-facing freshness, last sync timestamp, update frequency, and pending changes.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of data points, news items, and sentiment figures displayed in the application are loaded dynamically from configured data stores with zero hardcoded metrics in presentation or analysis code.
- **SC-002**: Live web dashboard reflects newly ingested data within 5 seconds of the scheduled polling cycle without manual user intervention.
- **SC-003**: Ingestion engine maintains 100% invariant validity: 0 instances of mathematically inconsistent snapshots committed to the active dataset.
- **SC-004**: In the event of source feed failure, system recovers gracefully with 0% downtime on the client dashboard, serving verified cached data accompanied by a freshness warning.
- **SC-005**: Adding a new primary source document or news feed requires only configuration entry addition, with 0 lines of application logic code changed.

---

## Assumptions

- **Operational Environment**: Ingestion engine runs in a POSIX-compliant environment with standard network access to configured external data feeds and filesystem access to `data/`.
- **Primary Source Availability**: External news feeds and Telegram channels follow standard syndication or export formats (RSS/Atom, JSON, or structured text).
- **Client Architecture**: The web dashboard runs as a client-side web application capable of periodic asynchronous background fetching against the served JSON endpoints.
- **Governance Alignment**: All data parsing and calculation rules strictly enforce the mathematical invariants and primary source grounding established in Constitution Principle I and II.
