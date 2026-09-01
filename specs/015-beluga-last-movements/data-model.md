# Data Model: Beluga Fleet Recent Flight Movements Log

**Feature**: `015-beluga-last-movements`  
**Date**: 2026-09-01  
**Status**: Complete  

---

## 1. Entities & Schemas

### Entity 1: `BelugaMovement`
Represents an individual flight leg or movement record for a BelugaXL aircraft.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "BelugaMovement",
  "type": "object",
  "required": [
    "id",
    "aircraft_id",
    "registration",
    "callsign",
    "origin_code",
    "origin_name",
    "destination_code",
    "destination_name",
    "departure_time",
    "flight_status",
    "is_spain_connection",
    "component_payload"
  ],
  "properties": {
    "id": { "type": "string", "description": "Unique movement ID (e.g. MOV-20260901-01)" },
    "aircraft_id": { "type": "string", "enum": ["BXL-01", "BXL-02", "BXL-03", "BXL-04", "BXL-05", "BXL-06"] },
    "name": { "type": "string", "description": "Human aircraft name, e.g. BelugaXL 3" },
    "registration": { "type": "string", "enum": ["F-GXLG", "F-GXLH", "F-GXLI", "F-GXLJ", "F-GXLN", "F-GXLO"] },
    "callsign": { "type": "string", "description": "ATC callsign e.g. BGA221Y" },
    "origin_code": { "type": "string", "description": "4-letter ICAO code, e.g. LFRZ, LEGT, LFBO" },
    "origin_name": { "type": "string", "description": "Human name e.g. Saint-Nazaire" },
    "destination_code": { "type": "string", "description": "4-letter ICAO code, e.g. LFBO, EDHI" },
    "destination_name": { "type": "string", "description": "Human destination name e.g. Toulouse" },
    "departure_time": { "type": "string", "description": "ISO 8601 timestamp or formatted departure time" },
    "arrival_time": { "type": "string", "description": "ISO 8601 timestamp or status" },
    "flight_status": { "type": "string", "enum": ["Completado", "En Vuelo", "En Tierra", "Cancelado (Veto Huelga)"] },
    "is_spain_connection": { "type": "boolean", "description": "True if connects with Getafe LEGT or Sevilla LEZL" },
    "strike_relevance": { "type": "string", "description": "Logistics impact note e.g. Bloqueo HTP Getafe / Circulación Europea" },
    "component_payload": { "type": "string", "description": "Aerospace component transported or retained" },
    "duration_formatted": { "type": "string", "description": "Flight duration string e.g. 1h 15m" }
  }
}
```

---

### Entity 2: `BelugaFleetStatus` (Updated Root Schema in `data/beluga_status.json`)

```json
{
  "source": "BelugaWatch / OpenSky Network (https://beluga.simcoe.co.uk/)",
  "timestamp": "2026-09-01T16:45:00Z",
  "fleet_count": 6,
  "airborne_count": 2,
  "tracked_count": 5,
  "getafe_connected_aircraft": [],
  "other_airborne_aircraft": [],
  "grounded_aircraft": [],
  "all_aircraft": [],
  "european_routes": [],
  "blockade_status": "string",
  "jit_stress_level": "string",
  "strategic_notes": "string",
  "primary_source_citations": [],
  "recent_movements": [
    {
      "id": "MOV-20260901-01",
      "aircraft_id": "BXL-03",
      "name": "BelugaXL 3",
      "registration": "F-GXLI",
      "callsign": "BGA221Y",
      "origin_code": "LFRZ",
      "origin_name": "Saint-Nazaire",
      "destination_code": "LFBO",
      "destination_name": "Toulouse",
      "departure_time": "2026-09-01T14:30:00Z",
      "arrival_time": "2026-09-01T15:45:00Z",
      "flight_status": "Completado",
      "is_spain_connection": false,
      "strike_relevance": "Circulación Europea",
      "component_payload": "Secciones de Fuselaje A320",
      "duration_formatted": "1h 15m"
    }
  ]
}
```

---

## 2. Invariants & Validation Rules

1. **Airframe Registry Integrity**: Every movement record must match one of the 6 official BelugaXL registrations (`F-GXLG`..`F-GXLO`).
2. **Chronological Ordering**: `recent_movements` array must be sorted in descending chronological order (newest movements first).
3. **Getafe Embargo Integrity**: Any movement with `origin_code: "LEGT"` or `destination_code: "LEGT"` must have `is_spain_connection: true` and reflect strike disruption status.
