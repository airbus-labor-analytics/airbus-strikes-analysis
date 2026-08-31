# Data Model: Dynamic BelugaXL Logistics & Retention Analytics

**Feature**: [specs/004-beluga-dynamic-metrics/spec.md](spec.md)
**Date**: 2026-08-31

---

## 1. Entities

### `BelugaFlightRecord`
Represents an individual aircraft sortie from ADS-B telemetry:
```json
{
  "callsign": "BGA112",
  "registration": "F-GXLJ",
  "origin_icao": "LEGT",
  "destination_icao": "LFBO",
  "origin_name": "Getafe",
  "destination_name": "Toulouse",
  "departure_timestamp": "2026-08-20T14:22:00Z",
  "arrival_timestamp": "2026-08-20T16:05:00Z",
  "status": "COMPLETED",
  "carries_htp": true
}
```

### `DynamicMovementPeriod`
Represents a chronological time window (e.g. Week 1–7) with dynamic metrics:
```json
{
  "period_id": "W34-2026",
  "label": "25-28 Ago (Huelga Indefinida)",
  "baseline_flights": 14,
  "actual_flights": 0,
  "cancelled_flights": 14,
  "accumulated_htp_retained": 28,
  "fal_stock_buffer_pct": 0.0,
  "fal_stock_buffer_hours": 0.0,
  "status_summary": "Bloqueo Total en LEGT"
}
```

### `RouteStatusItem`
Represents an aggregated operational route pair:
```json
{
  "route_id": "LEGT-LFBO",
  "origin": "Getafe (LEGT)",
  "destination": "Toulouse (LFBO)",
  "weekly_frequency": 0,
  "baseline_frequency": 10,
  "status": "Bloqueado",
  "color_code": "rose",
  "component_type": "HTP A320 / A350"
}
```

---

## 2. State & Data Flow Pipeline

```text
[BelugaWatch API / Local Flight Log Archive]
                   │
                   ▼
     [src/beluga_tracker.py]
  - filter_getafe_sorties()
  - compute_weekly_buckets()
  - compute_htp_retention()
  - compute_fal_buffer_depletion()
                   │
                   ▼
       [data/beluga_status.json]
                   │
       ┌───────────┴───────────┐
       ▼                       ▼
[dashboard/data.js]   [src/validate_invariants.py]
       │
       ▼
[dashboard/app.js: belugaHistoryChart]
```
