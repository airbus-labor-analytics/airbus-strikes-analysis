# Data Model: Beluga Logistics Engine & Real-Time Telemetry

**Feature**: `014-isolate-and-validate-beluga-engine`  
**Date**: 2026-09-01  
**Status**: Complete  

---

## 1. Entities & Schemas

### Entity 1: `BelugaFleetStatus` (Root Schema: `data/beluga_status.json`)

Represents the complete live logistics telemetry snapshot.

```typescript
interface BelugaFleetStatus {
  source: string;                         // e.g. "BelugaWatch / OpenSky Network (https://beluga.simcoe.co.uk/)"
  timestamp: string;                      // ISO-8601 UTC timestamp
  fleet_count: number;                    // Total fleet size (6 BelugaXL)
  airborne_count: number;                 // Number of aircraft currently airborne
  tracked_count: number;                  // Number of aircraft with active ADS-B telemetry
  getafe_connected_aircraft: BelugaAircraft[]; // Aircraft currently operating to/from LEGT
  other_airborne_aircraft: BelugaAircraft[];   // Active European flights outside Spain
  grounded_aircraft: BelugaAircraft[];         // Parked/grounded airframes across bases
  all_aircraft: BelugaAircraft[];              // Complete fleet list
  european_routes: LogisticsRoute[];           // Status of European factory supply routes
  blockade_status: string;                // Descriptive summary of Getafe corridor closure
  jit_stress_level: string;               // Qualitative supply chain stress indicator
  strategic_notes: string;                // Documented operational rationale
  primary_source_citations: SourceCitation[]; // Cited assembly minutes & factory specs
}
```

---

### Entity 2: `BelugaAircraft`

Represents an individual aircraft in the Airbus heavy-lift fleet.

```typescript
interface BelugaAircraft {
  id: string;                             // Unique identifier (e.g. "BXL-01")
  name: string;                           // Display name (e.g. "BelugaXL 1")
  registration: string;                   // EASA/DGAC tail code (e.g. "F-GXLG")
  callsign: string;                       // Active ICAO callsign (e.g. "BGA112" or "N/A")
  status: "En Vuelo" | "En Tierra";       // Real-time flight state
  current_site: string;                   // Airport name or "In Transit"
  location_label: string;                 // UI label (e.g. "At Toulouse" or "Cruising 28,000ft")
  route_from?: string;                    // Origin airport code/name
  route_to?: string;                      // Destination airport code/name
  lat?: number | null;                    // Geographic latitude
  lon?: number | null;                    // Geographic longitude
  altitude_ft?: number;                   // Current pressure altitude
  speed_kt?: number;                      // Ground speed in knots
  is_spain_connection: boolean;           // True if connecting with LEGT (Getafe)
  strike_relevance: string;               // Industrial interpretation (e.g. "Bloqueo HTP Getafe (Veto Salida)")
}
```

---

### Entity 3: `LogisticsRoute`

Represents a strategic aerospace supply chain corridor between manufacturing sites and final assembly lines.

```typescript
interface LogisticsRoute {
  origin: string;                         // Origin factory (e.g. "Getafe (LEGT)")
  destination: string;                    // Destination FAL (e.g. "Toulouse (LFBO)")
  component: string;                      // Component transported (e.g. "HTP A320 / A350")
  status: string;                         // Operational state (e.g. "Bloqueado (100%)" or "Operativo")
  color: "rose" | "sky" | "blue" | "emerald"; // UI status color token
  disruption_impact: string;              // Consequence of corridor failure (e.g. "Parada de FAL en 48-72h")
}
```

---

### Entity 4: `SourceCitation`

Represents a verified primary source document cited in support of logistics claims.

```typescript
interface SourceCitation {
  id: string;                             // File or source ID (e.g. "sources/721c0baa.txt")
  title: string;                          // Document title
  date: string;                           // Date of issuance / assembly
  verbatim_excerpt: string;               // Verbatim quote from primary source
  relevance: string;                      // Context in supply chain analysis
}
```

---

## 2. Validation & Invariant Rules

1. **Fleet Uniqueness**: Fleet contains exactly 6 unique BelugaXL registrations (`F-GXLG`, `F-GXLH`, `F-GXLI`, `F-GXLJ`, `F-GXLN`, `F-GXLO`).
2. **Aircraft State Consistency**: `airborne_count + len(grounded_aircraft) == len(all_aircraft)`.
3. **No Synthetic Historical Arrays**: The schema strictly excludes `period_definitions`, `getafe_flights_per_week`, or fake weekly arrays.
4. **Primary Source Grounding**: All qualitative claims must link to verified files in `sources/` or `data/sources_catalog.json`.
