# Feature Specification: Daily Timeline Freshness Validator & Detailed Factory Assembly Minutes

**Feature Branch**: `016-daily-timeline-assembly-validator`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User description: "la Línea Temporal & Minutas Detalladas de Asambleas de Fábrica debe estar actualizada dia a dia, debe haber un validador que verifique el dia actual hay novedades si no destacar y poner un aviso para que tengamos que actualizarlo con los ultimos avances de las ultimas comunicaciones de la empresa, sindicatos, actas de sima, actas de reuniones y actas de asamblea"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-Time Daily Freshness Validator & Warning Banner (Priority: P1)

Workers, assembly delegates, and analysts viewing the dashboard need immediate visibility into whether the conflict timeline and assembly minutes are current for the current calendar day (`today`). If no milestone or document has been logged for today, the dashboard and validation scripts must display a prominent warning banner/callout indicating that an update is pending, highlighting the need to review the latest communications from the company, union releases, SIMA minutes, negotiation meetings, and factory assemblies.

**Why this priority**: Ensures the platform never presents stale chronological information during active strike and negotiation phases.

**Independent Test**: Can be tested by running the validator against the dataset with today's date present vs. absent, observing the warning banner in `#sec-unions-timeline` when no entry exists for today and the green badge when today is up to date.

**Acceptance Scenarios**:

1. **Given** no timeline entry or assembly minute has been logged for the current date, **When** a user visits Module 4 (`#tab-union-force`) or runs the validation command, **Then** an amber alert banner is displayed stating "⚠️ Actualización del Día Pendiente: Sin eventos registrados para hoy" with quick action prompts to check Telegram and news feeds.
2. **Given** at least one verified milestone or assembly event is logged for the current date, **When** the dashboard loads, **Then** a green badge is shown stating "🟢 Cronología al Día: Novedades de hoy registradas" with the timestamp of the latest event.

---

### User Story 2 - Comprehensive Daily Timeline & Detailed Factory Assembly Minutes (Priority: P2)

Delegates and workers need day-by-day granularity across all key conflict dates up to today, detailing:
- Official Airbus SE management communications and proposals.
- Union press releases and strike committee announcements (SIPA, CCOO, UGT, CGT, ATP).
- SIMA conciliation/mediation sessions and paritary commission minutes.
- Factory assemblies across all 7 production sites (Getafe, Illescas, San Pablo, CBC El Puerto, Albacete, Tablada, Barajas).

**Why this priority**: Provides full evidentiary backing and historical context for every day of the strike and negotiation.

**Independent Test**: Can be tested by inspecting `#sec-unions-timeline` in Module 4 and verifying that each chronological milestone includes source badges, site tags, actor tags, summary, and links to verified documents.

**Acceptance Scenarios**:

1. **Given** a user navigates the timeline, **When** clicking on an assembly minute or SIMA entry, **Then** the card displays the factory site, unions involved, agreed resolutions, voting counts (if applicable), and an action button to open the full verified document in the modal reader.
2. **Given** the user applies filters by actor (`Empresa`, `SIPA`, `CCOO`, `UGT`, `CGT`, `SIMA`, `Asamblea`), **When** filtering, **Then** the timeline smoothly updates to show only relevant events without layout jitter.

---

### User Story 3 - Automated Pipeline Validation & Invariant Guard (Priority: P3)

Maintainers and automated CI/CD workflows require a deterministic CLI validator (`src/validate_timeline_freshness.py` and rule in `validate_invariants.py`) that checks if the timeline is chronologically ordered, monotonically increasing, verified against primary sources, and flags any multi-day staleness gaps during active conflict periods.

**Why this priority**: Prevents silent staleness regressions during scheduled auto-sync runs.

**Independent Test**: Can be tested by executing `python3 src/validate_timeline_freshness.py` and `python3 -m unittest discover tests/`, returning exit code 0 when all criteria pass.

**Acceptance Scenarios**:

1. **Given** the CI scheduled sync workflow runs, **When** the validator detects that the newest milestone is older than 24 hours during an active weekday, **Then** a warning is emitted in the workflow logs and summary.
2. **Given** all timeline milestones have valid primary source links and sequential dates, **When** running validation checks, **Then** the invariant suite passes 100%.

---

### Edge Cases

- **Weekend / Non-working days**: On Saturdays, Sundays, or public holidays with no active negotiations, the validator should distinguish between "No events scheduled (Weekend)" and "Missing weekday updates".
- **Multiple events on the same day**: The system must support and correctly order multiple simultaneous events on a single date (e.g., Morning Getafe assembly + Afternoon SIMA mediation + Evening union communique).
- **Timezone consistency**: Date comparison must strictly use `Europe/Madrid` (UTC+2 in summer / CEST) to prevent false staleness alerts near midnight UTC.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a daily timeline validator that compares the latest recorded event date against the current date in the `Europe/Madrid` timezone.
- **FR-002**: The dashboard MUST render a prominent status indicator in `#sec-unions-timeline` and the floating HUD showing whether today's timeline is current or pending update.
- **FR-003**: The conflict timeline in `conflict_metrics.json` MUST contain continuous chronological entries covering company communications, union releases, SIMA acts, and factory assembly minutes up to the current date.
- **FR-004**: Each timeline milestone MUST record: `date` (YYYY-MM-DD), `title`, `actor` (`Empresa`, `Sindicatos`, `SIMA`, `Asamblea`, `Gobierno`), `site` (`Getafe`, `Illescas`, `San Pablo`, `CBC`, `Albacete`, `Tablada`, `Barajas`, `Nacional`), `summary`, `impact_rating`, `source_url`, and `document_id` (if archived).
- **FR-005**: If no milestone is recorded for the current active day, the UI MUST display an actionable "Aviso de Novedades Pendientes" with direct shortcuts to the Telegram Archive and Live Media Feed to facilitate rapid cataloging.
- **FR-006**: The system MUST include an automated test suite (`tests/test_timeline_freshness.py`) verifying chronological integrity, timezone handling, and banner state transitions.
- **FR-007**: The automated scheduled sync pipeline (`.github/workflows/sync-news-data.yml`) MUST execute the timeline freshness check on every scheduled cycle.

### Key Entities

- **TimelineMilestone**: Represents a single chronological milestone (`date`, `title`, `actor`, `site`, `summary`, `impact_level`, `source_url`, `document_ref`).
- **AssemblyMinute**: Represents detailed proceedings of a factory assembly (`date`, `site`, `attendance_estimate`, `presiding_unions`, `key_motions`, `voting_outcome`, `document_file`).
- **TimelineFreshnessStatus**: System state object (`is_up_to_date_today`, `last_event_date`, `days_since_last_event`, `is_weekend_or_holiday`, `status_badge_text`, `status_color`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of days during the active conflict period (July–September 2026) have verified chronological documentation in the dataset.
- **SC-002**: Freshness validator executes and renders the visual status banner in under 50ms upon page load.
- **SC-003**: 0 missing mandatory fields across all timeline milestones (date, title, actor, summary, source).
- **SC-004**: 100% pass rate across all automated unit and invariant validation tests.

## Assumptions

- Current active timezone for all Airbus Spain factory operations is `Europe/Madrid`.
- Primary documentary sources for factory assembly minutes are authenticated files indexed in `data/telegram_archive/` and official union releases.
- Weekends without formal assembly calls or SIMA sessions are marked with appropriate non-staleness status.
