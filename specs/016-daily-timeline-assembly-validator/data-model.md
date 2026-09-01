# Data Model: Daily Timeline Freshness Validator & Detailed Factory Assembly Minutes

**Feature**: `016-daily-timeline-assembly-validator` | **Date**: 2026-09-01

## 1. Timeline Milestone Entity (`TimelineMilestone`)

Represents an individual event, communication, SIMA session, or factory assembly in the conflict chronogram.

```json
{
  "id": "timeline-2026-09-01-getafe-asamblea",
  "date": "2026-09-01",
  "display_date": "1 de septiembre de 2026",
  "time": "10:30",
  "actor": "Asamblea",
  "actor_category": "assembly",
  "site": "Getafe",
  "title": "Asamblea General de Fábrica Getafe - Ratificación de Posiciones",
  "summary": "La asamblea de trabajadores en Puerta Sur analiza la última propuesta de la mediación del SIMA y acuerda por mayoría absoluta mantener el calendario de paros...",
  "key_points": [
    "Rechazo unánime a ofertas por debajo del IPC real acumulado (+15.8%)",
    "Coordinación intercentros con Illescas, San Pablo y CBC El Puerto",
    "Solidaridad con los piquetes informativos y caja de resistencia"
  ],
  "source_type": "telegram_document",
  "document_id": "tg-tg-doc-010",
  "source_url": "data/telegram_archive/assembly_minutes/Minutas_Asamblea_Getafe_20260824__1_.PDF.txt",
  "verified": true
}
```

### Field Definitions & Invariants
| Field | Type | Description | Invariant / Validation Rule |
| :--- | :--- | :--- | :--- |
| `id` | String | Unique milestone identifier | Format `timeline-YYYY-MM-DD-[slug]`, unique across dataset |
| `date` | String | ISO 8601 calendar date | `YYYY-MM-DD` |
| `display_date`| String | Human-readable Spanish date | Format `[D] de [mes] de [AAAA]` |
| `actor` | String | Primary initiator / actor | One of: `Empresa`, `SIPA`, `CCOO`, `UGT`, `CGT`, `ATP`, `SIMA`, `Asamblea`, `Gobierno`, `Prensa` |
| `actor_category`| String | Taxonomy tag for filtering | `company` \| `union` \| `sima` \| `assembly` \| `media` |
| `site` | String | Plant / geographic scope | One of: `Getafe`, `Illescas`, `San Pablo`, `CBC El Puerto`, `Albacete`, `Tablada`, `Barajas`, `Nacional`, `Internacional` |
| `title` | String | Concise headline | 10–120 characters |
| `summary` | String | Detailed report / minutes | Non-empty description of events and decisions |
| `key_points` | Array<String>| Bullet highlights | 1–6 items |
| `document_id` | String \| null | Linked archive doc ID | Valid ID in `telegram_archive` or null |
| `verified` | Boolean | Fact-checked status | Must be `true` for official timeline entries |

---

## 2. Timeline Freshness Status (`TimelineFreshnessStatus`)

Evaluated at runtime both in CLI validators and client-side browser logic.

```json
{
  "reference_date": "2026-09-01",
  "latest_milestone_date": "2026-09-01",
  "days_delta": 0,
  "status_code": "UP_TO_DATE",
  "is_weekend": false,
  "badge_color": "emerald",
  "headline": "Cronología al Día: Novedades de hoy registradas",
  "description": "Se han registrado eventos para la fecha actual (1 de septiembre de 2026).",
  "action_required": false
}
```

### Status Code Enumeration
- `UP_TO_DATE`: `latest_milestone_date == reference_date` (Emerald badge, no alert banner needed).
- `PENDING_TODAY`: `days_delta == 1` on a working day (Amber badge, warning banner with quick links).
- `STALE_ALERT`: `days_delta >= 2` on working days (Rose badge, critical warning banner).
- `WEEKEND_PAUSE`: `days_delta <= 2` during Saturday/Sunday (Sky badge, informational banner).

---

## 3. Factory Assembly Minutes Cross-Reference (`AssemblyMinutesReference`)

```json
{
  "milestone_id": "timeline-2026-09-01-getafe-asamblea",
  "site": "Getafe",
  "location": "Puerta Norte / Explanada P1",
  "attendees_estimated": 2800,
  "motions": [
    {
      "topic": "Ratificación de Huelga Indefinida",
      "result": "Aprobada por aclamación",
      "votes_in_favor_pct": 98.2
    }
  ],
  "archive_file": "Minutas_Asamblea_Getafe_20260824__1_.PDF.txt"
}
```
