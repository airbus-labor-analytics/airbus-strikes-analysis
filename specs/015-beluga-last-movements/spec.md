# Feature Specification: Beluga Fleet Recent Flight Movements Log

**Feature Branch**: `015-beluga-last-movements`  
**Created**: 2026-09-01  
**Status**: Draft  
**Input**: User description: "add a list of last movements of the belugas"

---

## Executive Summary

Provides an authenticated, chronologically ordered log of recent BelugaXL flight legs and transport movements across the European manufacturing network (Getafe, Toulouse, Hamburg, Broughton, Bremen, Saint-Nazaire). Integrated into Module 2 (*Impacto Industrial & Logística*), this feature allows factory delegates, negotiators, and analysts to inspect verified flight legs, timestamps, origin/destination corridors, and flight statuses, providing immediate visibility into whether the Getafe (LEGT) HTP export embargo remains 100% effective or if any evacuation sorties have been attempted.

---

## User Stories & Scenarios

### User Story 1 (P1 - MVP): Chronological Log of Recent Beluga Flight Movements

As a strike committee member or supply chain auditor,  
I want to view a chronological feed of recent BelugaXL flight movements with timestamps, aircraft registrations, origin, destination, and operational status,  
So that I can verify live transportation activity and confirm zero flight departures from Getafe (LEGT).

**Why this priority**: Direct visibility of individual flight legs is essential for validating the physical reality of the JIT logistics blockade without relying on aggregated summaries alone.

**Independent Test**: Can be tested by opening Module 2 (`#tab-industrial`) in `dashboard/index.html` and verifying that the Recent Movements container (`#beluga-recent-movements`) renders verified flight legs sorted newest first with accurate origin/destination airports, aircraft callsigns, and timestamps.

**Acceptance Scenarios**:
1. **Given** live or cached Beluga logistics data, **When** the user navigates to the Beluga logistics section in Module 2, **Then** a dedicated "Últimos Movimientos de la Flota BelugaXL" log displays the latest flight legs with origin airport, destination airport, registration, callsign, and timestamp.
2. **Given** any flight leg involving Getafe (LEGT), **When** rendered in the movements list, **Then** it is highlighted with a high-visibility alert badge ("Bloqueo Getafe / Veto HTP").
3. **Given** standard intra-European flights (e.g. Broughton ➔ Toulouse, Saint-Nazaire ➔ Toulouse), **When** rendered, **Then** they are labeled with their standard component transport role ("Circulación Europea / Alas / Fuselajes").

---

### User Story 2 (P2): Interactive Tail & Corridor Filtering

As an analyst inspecting a specific aircraft or route,  
I want to filter the recent movements log by aircraft registration (`F-GXLG` through `F-GXLO`) or by corridor (e.g., Getafe connections vs. European network),  
So that I can inspect the activity history of an individual BelugaXL airframe.

**Why this priority**: When a specific tail is selected in the fleet overview, the movements list should seamlessly filter to show only legs flown by that specific aircraft.

**Independent Test**: Select a tail filter button (e.g., `XL3 (F-GXLI)`) and verify that the movements feed displays only flight legs matching that registration.

**Acceptance Scenarios**:
1. **Given** the movements feed showing all fleet activity, **When** the user clicks a tail button in `#beluga-tail-filters` (e.g. `XL1 (F-GXLG)`), **Then** the movements list filters in real time to show only flights performed by `F-GXLG`.
2. **Given** a filtered state, **When** the user clicks "Todas (6)", **Then** the complete multi-aircraft chronological log is restored.

---

### User Story 3 (P3): Real-Time Telemetry Sync & 100% Offline Fallback

As a user consulting the dashboard under intermittent connectivity or offline demo mode,  
I want the movements log to update automatically during live background polling and maintain a verified fallback log when offline,  
So that no blank widgets or UI errors occur.

**Why this priority**: Robustness and reliability under offline/presentation environments.

**Independent Test**: Disconnect network access and verify that the movements log renders calibrated historical flight legs with zero console errors.

**Acceptance Scenarios**:
1. **Given** live background polling every 30 seconds, **When** new flight legs are detected in `data/beluga_status.json`, **Then** the movements list updates dynamically without full-page reloads.
2. **Given** network disconnection, **When** the dashboard loads or refreshes, **Then** calibrated fallback movements are displayed with a clear "Registro de Movimientos Calibrado" status tag.

---

## Functional Requirements

- **FR-001**: System MUST include a structured `recent_movements` array in `data/beluga_status.json` and `BelugaFleetStatus` schema.
- **FR-002**: Each movement entry in `recent_movements` MUST contain:
  - `id`: Unique movement identifier.
  - `aircraft_id`: Identifier of the Beluga airframe (e.g., `BXL-01` to `BXL-06`).
  - `registration`: Airframe registration (`F-GXLG` to `F-GXLO`).
  - `callsign`: Flight callsign (e.g., `BGA111`, `BGA221Y`).
  - `origin_code`: 4-letter ICAO airport code of departure (e.g., `LEGT`, `LFBO`, `EDHI`, `EGNR`, `LFRZ`, `EDDW`).
  - `origin_name`: Human-readable airport name (e.g., `Getafe`, `Toulouse`, `Hamburgo`, `Broughton`).
  - `destination_code`: 4-letter ICAO airport code of arrival.
  - `destination_name`: Human-readable destination airport name.
  - `departure_time`: Timestamp of departure (ISO 8601 or formatted date/time).
  - `arrival_time`: Timestamp of arrival or "En Vuelo" status.
  - `flight_status`: Status label (`Completado`, `En Vuelo`, `En Tierra`, `Cancelado`).
  - `is_spain_connection`: Boolean flag indicating connection with Getafe (LEGT) or Sevilla (LEZL).
  - `component_payload`: Component transported or blocked (`HTP A320/A350`, `Alas A320`, `Secciones Fuselaje`, `Flaps & Slats`).
- **FR-003**: System MUST render the movements list in `dashboard/index.html` within `#sec-industrial-routes` or a dedicated `#sec-industrial-movements` container in `#tab-industrial`.
- **FR-004**: System MUST sort movements chronologically in descending order (most recent first).
- **FR-005**: System MUST provide an empty-state message if a filter returns 0 movements for an inactive aircraft.
- **FR-006**: System MUST link with the existing `selectedBelugaTail` state so filtering by tail synchronizes both the aircraft cards and the movements list.
- **FR-007**: System MUST adhere strictly to Principle I (*Zero Unverified Data*): all movements must stem from timestamped ADS-B radar logs or verified calibrated operational legs, without synthetic data curves.

---

## Success Criteria

- **SC-001**: The recent movements feed renders within $<25\text{ ms}$ upon switching to `#tab-industrial`.
- **SC-002**: 100% of movements entries display verified tail numbers, ICAO airport codes, and flight status badges.
- **SC-003**: Filtering by tail updates both the fleet card grid and the movements log simultaneously in a single UI event.
- **SC-004**: Zero unclosed HTML tags and zero JavaScript exceptions during live background polling or tab transitions.

---

## Key Entities & Data Model

```json
{
  "recent_movements": [
    {
      "id": "MOV-20260901-01",
      "aircraft_id": "BXL-03",
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
      "component_payload": "Secciones de Fuselaje A320"
    },
    {
      "id": "MOV-20260901-02",
      "aircraft_id": "BXL-05",
      "registration": "F-GXLN",
      "callsign": "BGA145N",
      "origin_code": "EGNR",
      "origin_name": "Broughton",
      "destination_code": "EDDW",
      "destination_name": "Bremen",
      "departure_time": "2026-09-01T11:15:00Z",
      "arrival_time": "2026-09-01T13:05:00Z",
      "flight_status": "Completado",
      "is_spain_connection": false,
      "component_payload": "Alas & Componentes"
    },
    {
      "id": "MOV-20260828-03",
      "aircraft_id": "BXL-02",
      "registration": "F-GXLH",
      "callsign": "BGA112",
      "origin_code": "LEGT",
      "origin_name": "Getafe",
      "destination_code": "LFBO",
      "destination_name": "Toulouse",
      "departure_time": "2026-08-28T08:00:00Z",
      "arrival_time": "Cancelado / Bloqueado",
      "flight_status": "Cancelado (Veto Huelga)",
      "is_spain_connection": true,
      "component_payload": "Estabilizador Horizontal (HTP) Retenido"
    }
  ]
}
```

---

## Assumptions & Dependencies

1. **Airports & Sites**: Beluga logistics operates between 6 primary European sites: Getafe (`LEGT`), Toulouse (`LFBO`), Hamburg (`EDHI`), Broughton (`EGNR`), Saint-Nazaire (`LFRZ`), and Bremen (`EDDW`).
2. **Strike Effect**: Getafe sorties remain halted or blocked during assembly strike actions as confirmed in `sources/721c0baa.txt`.
3. **No External Libraries**: Movement rendering is pure vanilla JavaScript and responsive Tailwind CSS markup, preserving zero-dependency architecture.
