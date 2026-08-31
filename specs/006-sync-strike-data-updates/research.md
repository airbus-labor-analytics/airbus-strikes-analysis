# Phase 0 Research: Strike Data Sync, Sensitive Information Badges & User Validation Gate

**Feature**: [specs/006-sync-strike-data-updates/spec.md](spec.md)
**Date**: 2026-08-31

---

## 1. Interactive User Validation Gate Mechanism

### Decision
Implement an itemized validation gate within the data update workflow that presents proposed metric additions and deletions in an aligned markdown table (Source, Key, Old Value, Proposed New Value, Sensitivity Level) and prompts the user via chat/CLI confirmation prior to modifying canonical datasets.

### Rationale
- Prevents unverified secondary claims or provisional assembly rumors from modifying canonical statistics without human authorization.
- Fulfills the user's explicit requirement: *"se debe pedir al usuario por aqui que valide la nueva información añadida o eliminación de la antigua"*.
- Provides a clear audit log of what was changed and when.

### Alternatives Considered
- **Silent Automated Ingestion**: Rejected because raw Telegram chat archives can contain unratified drafts or contradictory figures that require human verification.
- **Separate Unmerged Staging JSON**: Rejected because maintaining unmerged forks increases codebase complexity; an interactive gate in the primary pipeline is simpler and safer.

---

## 2. Sensitive / Unreviewed Strike Information Badging

### Decision
Use a standardized Amber warning badge (`bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg text-xs font-bold`) on dashboard cards containing provisional negotiation terms (e.g. SIMA 27/08 draft proposal). The badge includes a tooltip explaining the status: *"Información sensible en negociación / pendiente de ratificación asamblearia"*.

### Rationale
- Fulfills user requirement: *"añadir algun marcador indicando que hay información sensible sin revisar debido a actualizaciones en el avance de la huelga"*.
- Distinct from verified green badges (e.g. BOE legal pacts, official referendum tallies) and red warning badges (loss indicators).
- Promotes radical transparency without confusing verified historical facts with evolving negotiation points.

### Alternatives Considered
- **Hiding provisional data entirely**: Rejected because workers and delegates benefit from seeing current proposal figures as long as they are clearly marked as provisional.
- **Plain text disclaimer at footer**: Rejected because individual cards need contextual markers where the numbers appear.

---

## 3. Multi-Surface Synchronization Pipeline

### Decision
Extend `src/data_ingestion.py` and `src/analysis_engine.py` to write validated updates to `data/conflict_metrics.json`, and immediately re-export `dashboard/data.js` via atomic file write (`src/atomic_writer.py`) with zero numerical divergence.

### Rationale
- Enforces Constitution Principle III (Single Source of Truth & Dual-Surface Parity).
- Guaranteed by automated invariant checking (`src/validate_invariants.py`).

---

## Conclusion

All research questions resolved. Design and contracts can proceed to Phase 1.
