# Feature Specification: Strike Data Sync, Sensitive Information Badges & User Validation Gate

**Feature Branch**: `006-sync-strike-data-updates`
**Created**: 2026-08-31
**Status**: Draft
**Input**: User description: "actualiza los datos de la web de acuerdo a la ultima documentación en la fuentes y en los archivos del grupo de telegram, siendo consecuentes siempre los datos de la web con la situación actual de la empresa, si no añadir algun marcador indicando que hay información sensible sin revisar debido a actualizaciones en el avance de la huelga, de cara a la actualizacion de datos de la web y otros documentos generados, se debe pedir al usuario por aqui que valide la nueva información añadida o eliminación de la antigua"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Interactive User Validation Gate for Data Updates (Priority: P1) 🎯 MVP

As a project maintainer, strike coordinator, or dataset curator,
I want the synchronization process to present a clear, itemized diff of all proposed data additions (e.g. new assembly minutes, SIMA proposals, updated CPI figures) and removals (obsolete parameters) for interactive user validation before writing to canonical datasets,
So that no unapproved or inaccurate changes enter the public web dashboard or generated dossier documents.

**Why this priority**:
User validation is a mandatory safety boundary. Presenting proposed changes via an interactive confirmation gate prevents hallucinated or unverified strike developments from altering canonical statistics without human authorization.

**Independent Test**:
Can be fully tested by running the update pipeline, verifying that all extracted additions and deletions from the Telegram archive (e.g. SIMA 27-August proposal, 7,500€ lump-sum payment terms, 12% retroactive table increase) are surfaced to the user with an explicit approval prompt before any dataset modification occurs.

**Acceptance Scenarios**:
1. **Given** newly discovered documents in `data/telegram_archive/` or external feeds, **When** the synchronization engine processes the updates, **Then** it generates an itemized change manifest listing:
   - Proposed New Data / Metrics to Add.
   - Proposed Obsolete Data to Remove or Supersede.
   - Exact source references and citation files.
2. **Given** the itemized change manifest, **When** prompted for validation, **Then** the user can explicitly approve, modify, or reject specific items before they are written to `data/conflict_metrics.json`, `data/beluga_status.json`, `docs/`, or `dashboard/data.js`.

---

### User Story 2 - Sensitive / Unreviewed Strike Information Badging (Priority: P2)

As a worker, journalist, or public observer browsing the dashboard,
I want any fast-evolving or unconfirmed strike developments (such as active SIMA negotiations, unratified counter-proposals, or provisional march dates) to be clearly flagged with a distinct visual badge (`⚠️ Información Sensible en Revisión / Negociación Activa`),
So that I can immediately distinguish between verified canonical invariants and provisional negotiation drafts.

**Why this priority**:
During active labor disputes, information changes rapidly. Clearly marking provisional proposals prevents misinformation while maintaining radical transparency.

**Independent Test**:
Can be tested by viewing updated components on the web dashboard (e.g. the 27-August SIMA proposal card or negotiation status banner) and confirming that the sensitive information badge renders with clear explanatory tooltips.

**Acceptance Scenarios**:
1. **Given** any metric or proposal currently under assembly review or mediation, **When** displayed in the dashboard or PDF guide, **Then** it displays an amber visual banner: `⚠️ En Revisión Asamblearia / Información Sensible`.
2. **Given** a sensitive information badge, **When** hovered or clicked, **Then** an informative tooltip explains the status (e.g., "Propuesta presentada en SIMA el 27/08/2026 pendiente de ratificación en asamblea").

---

### User Story 3 - Comprehensive Multi-Document Synchronization (Priority: P3)

As an analyst utilizing the repository's datasets,
I want all generated artifacts (`Guia_Estrategica_Negociacion_Huelga_Airbus_2026.md`, `dashboard/data.js`, `data/conflict_metrics.json`, and PDF exports) to reflect the validated strike timeline in perfect synchronization,
So that there is zero semantic drift between the web dashboard and offline dossier files.

**Why this priority**:
Enforces Constitution Principle III (Single Source of Truth & Dual-Surface Parity) and Principle IV (Automated Invariant & Schema Testing).

**Independent Test**:
Can be tested by running `python3 src/validate_sources.py`, `python3 src/validate_invariants.py`, and `python3 -m unittest discover tests` to confirm 100% agreement across all surfaces.

**Acceptance Scenarios**:
1. **Given** approved strike updates, **When** synchronized, **Then** `conflict_metrics.json`, `dashboard/data.js`, and `Guia_Estrategica_Negociacion_Huelga_Airbus_2026.md` update simultaneously.
2. **Given** the updated files, **When** invariant validation runs, **Then** 100% of mathematical and primary source checks pass.

---

## Edge Cases

- **User Rejects Proposed Update**: The engine must discard the rejected item, preserve existing verified values, and record the rejection in the sync log without crashing.
- **Conflicting Data Between Assembly Minutes and Press Reports**: Primary assembly minutes (`data/telegram_archive/assembly_minutes/`) and official SIMA filings take precedence over external press commentary.
- **Offline / Local Execution**: The validation prompt and data updates must function seamlessly in local command-line environments without external cloud dependencies.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST scan latest documents in `data/telegram_archive/` (including 27-August SIMA minutes, strike committee proposals, and assembly resolutions).
- **FR-002**: System MUST generate an itemized change manifest detailing all proposed new metrics, modified fields, and obsolete items to remove.
- **FR-003**: System MUST prompt the user for explicit approval/validation before applying any proposed addition or deletion to canonical datasets.
- **FR-004**: System MUST apply a distinct visual indicator (`⚠️ Información Sensible en Revisión`) to any provisional or unratified strike metric on the web dashboard.
- **FR-005**: System MUST synchronize approved updates across `data/conflict_metrics.json`, `dashboard/data.js`, and `docs/Guia_Estrategica_Negociacion_Huelga_Airbus_2026.md`.
- **FR-006**: System MUST maintain 100% compliance with mathematical invariants (Rules 1-14 in `src/validate_invariants.py`).
- **FR-007**: System MUST update primary source references and verify them via `src/validate_sources.py`.
- **FR-008**: System MUST preserve auditability by logging every approved change in the changelog and sync status files.

---

### Key Entities

- **StrikeUpdateItem**: A proposed discrete data modification with category, key name, old value, proposed new value, source document link, and sensitivity classification.
- **ValidationManifest**: Collection of `StrikeUpdateItem` objects presented to the user for interactive approval.
- **SensitiveDataMarker**: UI badge styling and metadata attached to provisional negotiation items.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of new data additions and deletions are validated and approved by the user prior to canonical commitment.
- **SC-002**: 100% of provisional negotiation metrics (e.g. SIMA 27/08 draft proposal) feature the sensitive/unreviewed visual marker on the dashboard.
- **SC-003**: Zero discrepancy across `data/conflict_metrics.json`, `dashboard/data.js`, and strategic Markdown guides.
- **SC-004**: 100% pass rate across repository invariant validation suites and unit tests.

---

## Assumptions

- User interaction for validating changes occurs directly within the active agent session using clear itemized prompts.
- Verified historical legal filings and official SIMA mediation certificates remain the highest authority for strike figures.
- Vanilla HTML/JS with Tailwind CSS badge styling will be used for the sensitive information markers without adding extra framework overhead.
