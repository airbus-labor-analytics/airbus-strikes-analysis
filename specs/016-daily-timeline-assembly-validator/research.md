# Research & Technical Decisions: Daily Timeline Freshness Validator & Factory Assembly Minutes

**Feature**: `016-daily-timeline-assembly-validator` | **Date**: 2026-09-01

## 1. Daily Freshness Detection & Timezone Standard

### Decision
Use standard `datetime.now(timezone.utc)` converted to `Europe/Madrid` (CEST / UTC+2 in summer) to determine the current calendar date (`YYYY-MM-DD`). The freshness validator evaluates the delta between `today` and the most recent milestone date in `conflict_timeline`.

### Rationale
- Airbus Spain production plants (Getafe, Illescas, San Pablo, CBC, Albacete, Tablada, Barajas) and SIMA/Comité sessions operate exclusively under the `Europe/Madrid` timezone.
- Calculating staleness in UTC without timezone offset causes false positives or false negatives during the 2-hour window between 22:00 UTC and 00:00 UTC (midnight in Madrid).
- Pure standard library Python (`datetime`, `zoneinfo.ZoneInfo("Europe/Madrid")`) guarantees zero third-party dependencies.

### Alternatives Considered
- *Naive UTC timestamp*: Rejected due to date rollover discrepancies late at night.
- *External NTP server / API check*: Rejected as unnecessary network overhead; local system clock with timezone localization is reliable and instantaneous.

---

## 2. Dynamic Banner & HUD Alert Architecture in Dashboard

### Decision
Implement a centralized client-side evaluator `evaluateTimelineFreshness(timelineData)` in `dashboard/app.js` and `dashboard/js/modules/union_force.js`.
- Renders a high-visibility status banner at the top of `#sec-unions-timeline`:
  - **Status A (Current Day Updated)**: `🟢 Cronología al Día — Última novedad: [Fecha / Evento]`.
  - **Status B (Pending Today's Events)**: `⚠️ Novedades de Hoy Pendientes de Registro — Sin eventos indexados para el [Fecha de Hoy]`.
  - **Status C (Weekend / Scheduled Pause)**: `🔵 Fin de Semana / Pausa de Negociación Programada`.
- Adds a dynamic indicator dot and tooltip in the Floating Dynamic Island HUD.

### Rationale
- Gives immediate feedback to assembly delegates and coordinators upon loading the page.
- Direct links in the pending alert banner point to the Telegram Explorer and the Live News Feed to enable instant document registration.

### Alternatives Considered
- *Blocking modal popup*: Rejected as disruptive to normal dashboard reading.
- *Static hardcoded date banner*: Rejected because it requires daily manual HTML changes.

---

## 3. Factory Assembly Minutes & Telegram Document Linking

### Decision
Link each timeline entry directly to its underlying primary document reference (`document_id` / `file_path` in `data/telegram_archive/`).
- Clicking an assembly milestone in the timeline directly triggers `openSourceModal(docId)`, immediately displaying the authenticated transcription/minutes without page reload.
- Milestone data model in `conflict_metrics.json` is expanded with structured fields:
  - `date`: `YYYY-MM-DD`
  - `display_date`: Human-readable localized date
  - `actor`: `Empresa` | `SIPA` | `CCOO` | `UGT` | `CGT` | `SIMA` | `Asamblea` | `Gobierno`
  - `site`: Factory name or `Nacional` / `Internacional`
  - `title`: Concise title
  - `summary`: Structured proceedings / resolution notes
  - `source_url`: Primary source URL or document reference
  - `document_id`: Telegram archive document ID (if archived)

### Rationale
- Adheres to Core Principle II (Primary Source Grounding & Traceability).
- Seamlessly reuses the modal reader mechanism enhanced in previous modules.

---

## 4. Automated CLI Validator & Pipeline Integration

### Decision
Create `src/validate_timeline_freshness.py` as a standalone executable validator, and link it into:
1. `src/validate_invariants.py` (Rule 15: Timeline Freshness & Chronological Monotonicity).
2. `.github/workflows/sync-news-data.yml` (automated check in step 6).
3. `tests/test_timeline_freshness.py` (comprehensive unit test suite).

### Rationale
- Follows Core Principle IV (Automated Invariant & Schema Testing).
- Fails or warns automatically during CI if the timeline suffers chronological regression or multi-day gaps during active strike phases.
