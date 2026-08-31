# Feature Specification: Dynamic BelugaXL Movement & Component Retention Analytics

**Feature Branch**: `004-beluga-dynamic-metrics`
**Created**: 2026-08-31
**Status**: Draft
**Input**: User description: "los valores registrados en Registro de Movimientos BelugaXL & Retención de Componentes me da la sensacion que son incorrectos, debe hacerse el calculo de manera dinamica desde los datos de beluga watch"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dynamic Movement & Retention Derivation from BelugaWatch (Priority: P1) 🎯 MVP

As a strike logistics analyst, assembly representative, or worker,
I want the Beluga flight movements, Getafe HTP component retention counts, and FAL buffer exhaustion rates to be calculated dynamically from actual BelugaWatch flight logs and ADS-B event data rather than relying on static hardcoded arrays,
So that the dashboard accurately reflects actual aerospace logistics bottlenecks, real-time flight cancellations, and precise HTP component quantities accumulated at the Getafe plant.

**Why this priority**:
Currently, the movement history and component retention counts in `data/beluga_status.json` and `src/beluga_tracker.py` use static fallback arrays that do not dynamically react to flight logs from `https://beluga.simcoe.co.uk/api/belugas.php`. Making this calculation fully dynamic eliminates data discrepancies and provides an authoritative real-time indicator of supply chain pressure.

**Independent Test**:
Can be fully tested by running `python3 src/beluga_tracker.py` and verifying that `historical_movements`, `accumulated_htp_retained`, `getafe_flights_per_week`, and `european_routes_distribution` are computed algorithmically from the flight records in `data/beluga_status.json` with zero hardcoded static timeline values.

**Acceptance Scenarios**:
1. **Given** raw Beluga flight records in `data/beluga_status.json`, **When** the logistics tracker processes the data, **Then** weekly and daily flight counts connecting Getafe (LEGT) with European FALs (Toulouse LFBO and Hamburg EDHI) are calculated dynamically from actual flight histories and active fleet statuses.
2. **Given** baseline weekly throughput (14 flights/week baseline = 2 flights/day) and actual completed flights, **When** calculating retained stock, **Then** accumulated HTP sets retained in plant are computed dynamically as `(baseline_flights - actual_flights) * htp_capacity_per_flight`.
3. **Given** the elapsed duration of the flight blockade, **When** calculating FAL buffer reserves, **Then** remaining buffer percentages and hours for Toulouse (LFBO) and Hamburg (EDHI) are computed dynamically from the initial buffer (60 hours) minus elapsed production consumption hours.
4. **Given** the active fleet and flight logs, **When** rendering the European Routes Status Matrix, **Then** flight counts and operational statuses (Bloqueado, Operativo, Ruta Interna) are aggregated directly from origin-destination pairs.

---

### User Story 2 - Real-Time Dashboard Synchronization & Chart Interactivity (Priority: P2)

As a dashboard user,
I want the "Registro de Movimientos BelugaXL & Retención de Componentes" chart and route cards to update dynamically during client polling without page reload,
So that when new flight data arrives or when the live radar polls, all component curves and buffer levels reflect the latest ADS-B positions instantly.

**Why this priority**:
The client dashboard (`dashboard/app.js`) must seamlessly consume the dynamic data structure provided by the backend sync engine so that workers and delegates in assemblies see real-time updates without layout shifts.

**Independent Test**:
Can be tested by opening `dashboard/index.html`, navigating to Module 2 ("Impacto Industrial & Logística"), and verifying that `belugaHistoryChart` renders the dynamically calculated series with responsive tooltips and accurate axis labels.

**Acceptance Scenarios**:
1. **Given** updated Beluga status data delivered via background sync, **When** `switchTab('tab-industrial')` or live polling executes, **Then** `belugaHistoryChart` and `#beluga-routes-grid` update smoothly with the latest dynamic values.
2. **Given** the historical movement chart, **When** the user hovers over weekly milestones, **Then** tooltips clearly show actual flights, baseline flights, retained HTP units, and FAL stock buffer percentages.

---

### User Story 3 - Invariant Verification & Multi-Surface Data Consistency (Priority: P3)

As an auditor or observer,
I want dynamic Beluga logistics calculations to satisfy repository-wide invariant testing and maintain strict dual-surface parity between `data/beluga_status.json`, `data/conflict_metrics.json`, and `dashboard/data.js`,
So that no calculation discrepancy or unverified data enters the canonical records.

**Why this priority**:
Enforces Constitution Principle I (Mathematical & Invariant Integrity) and Principle III (Single Source of Truth & Dual-Surface Parity).

**Independent Test**:
Can be tested by running `python3 src/validate_invariants.py`, `python3 src/validate_sources.py`, and `python3 -m unittest discover tests` to ensure 100% green status across all invariant rules.

**Acceptance Scenarios**:
1. **Given** dynamic Beluga metrics, **When** `validate_invariants.py` runs, **Then** all retention sums and buffer calculations reconcile with industrial parameters (15,562 workers, 100% Getafe HTP monopoly, 60h FAL buffer).
2. **Given** dataset exports, **When** `conflict_metrics.json` and `dashboard/data.js` are updated, **Then** both surfaces match with zero numerical divergence.

---

## Edge Cases

- **BelugaWatch API Rate Limit or Network Outage**: When live network calls fail, the tracker must fall back to deterministic dynamic calculations based on the confirmed historical flight archive up to the current conflict date, rather than emitting undefined fields or crashing.
- **Intermediate / Multi-Leg Flights**: If an aircraft flies a multi-leg route (e.g. Getafe -> Saint-Nazaire -> Toulouse), the flight parser must accurately attribute the Getafe leg to the HTP supply route.
- **Full Flight Blockade (Zero Getafe Departures)**: When zero flights depart Getafe during an active indefinite strike, component retention accumulation must progress linearly according to standard daily manufacturing pace (~2 HTP shipsets/day).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST compute weekly and daily Beluga flight frequencies connecting Getafe (LEGT) dynamically from ADS-B flight history records in `data/beluga_status.json`.
- **FR-002**: System MUST dynamically calculate accumulated HTP units retained at the Getafe plant using the difference between scheduled baseline flights and actual completed flights multiplied by HTP shipset capacity.
- **FR-003**: System MUST dynamically compute remaining FAL stock buffer percentages and depletion hours for Toulouse (LFBO) and Hamburg (EDHI) based on elapsed strike duration and baseline inventory (60h).
- **FR-004**: System MUST dynamically aggregate European route frequencies and status classifications from the fleet flight log records.
- **FR-005**: System MUST eliminate all hardcoded static timeline arrays in `src/beluga_tracker.py` and replace them with dynamic algorithmic processing.
- **FR-006**: System MUST update `dashboard/app.js` to render the dynamic Beluga movement history, component retention curves, and route matrix seamlessly.
- **FR-007**: System MUST synchronize the computed dynamic logistics metrics across `data/beluga_status.json`, `data/conflict_metrics.json`, and `dashboard/data.js` with zero data drift.
- **FR-008**: System MUST validate all dynamic Beluga logistics calculations through automated invariant tests in `src/validate_invariants.py` and `tests/`.

---

### Key Entities

- **BelugaFlightLog**: Represents an individual aircraft movement with origin, destination, timestamp, callsign, registration, and flight duration.
- **DynamicMovementPeriod**: A chronological time bucket (week or day) containing baseline flights, actual completed flights, missing flights, accumulated retained components, and FAL buffer levels.
- **RouteStatus**: An aggregated route connection (e.g. LEGT ➔ LFBO) with flight volume, operational status, and color code.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of data points in the Beluga movement history and component retention chart are dynamically calculated from flight log data with zero hardcoded arrays.
- **SC-002**: Component retention calculations accurately reflect daily manufacturing throughput and actual flight cancellations across all 7 conflict weeks.
- **SC-003**: Real-time polling updates the client-side chart and route cards within 1 second of receiving updated status data.
- **SC-004**: 100% pass rate across repository invariant validation suites (`validate_invariants.py`, `validate_sources.py`, and all unit tests).

---

## Assumptions

- Standard Getafe HTP dispatch throughput is calibrated at ~2 Beluga flights per calendar day (14 flights per week baseline) under normal operating conditions.
- Each BelugaXL flight on the Getafe axis carries 1 to 2 complete HTP shipsets (A320/A350/A330 family components).
- Baseline FAL buffer stock in Toulouse and Hamburg without replenishment covers 60 hours of continuous final assembly operations.
- The BelugaWatch API (`https://beluga.simcoe.co.uk/api/belugas.php`) provides the primary external flight telemetry, with local historical archives serving as fallback during network disruption.
