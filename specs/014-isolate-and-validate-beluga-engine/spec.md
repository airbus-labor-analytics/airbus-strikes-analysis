# Feature Specification: Beluga Logistics Engine Decoupling & Supply Chain Math Validation

**Feature Branch**: `014-isolate-and-validate-beluga-engine`  
**Created**: 2026-09-01  
**Status**: Draft  
**Input**: User description: "separa la parte de beluga del analizador de noticias, tweets, etc. ademas la parte de beluga no luce que haga los calculos correctamente, valida y corrige"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dedicated & Autonomous Beluga Logistics Tracking (Priority: P1) [MVP]

As an industrial analyst, worker delegate, or strike strategist, I need the Beluga JIT supply chain logistics monitoring engine to operate completely independently from the general news, social media feeds, and sentiment thermometer, so that flight tracking and factory bottleneck data remain clean, focused, and free from noise or unrelated media mixing.

**Why this priority**: Decoupling the Beluga logistics tracker from the media/news sentiment analyzer establishes clean domain boundaries, prevents cross-module polling failures, and allows dedicated logistics telemetry to be inspected and updated autonomously.

**Independent Test**: Can be tested by running the Beluga logistics ingestion and viewing the Beluga logistics dashboard panel independently without triggering news RSS scraping or sentiment evaluation, verifying clean isolation of data contracts.

**Acceptance Scenarios**:

1. **Given** a request for Beluga logistics status, **When** the logistics engine executes, **Then** it produces standalone flight tracking, fleet position, and route status data without querying or depending on news RSS feeds, Twitter/X scrapers, or Reddit media channels.
2. **Given** the dashboard view, **When** navigating to the Industrial & Logistics tab, **Then** the Beluga logistics interface operates with its own dedicated polling lifecycle, tail filtering, and status display, entirely separated from the media sentiment thermometer feed.

---

### User Story 2 - Accurate JIT Supply Chain & HTP Buffer Math Engine (Priority: P2)

As a labor union negotiator or operational analyst, I need the mathematical models for Getafe HTP retention, FAL stock buffer depletion, and delivery delay financial penalties to be rigorously verified against aerospace industry standards and Airbus factory specs, so that the published bottleneck metrics are 100% mathematically sound and indisputable.

**Why this priority**: Accurate calculations of Just-In-Time (JIT) stock exhaustion (60h baseline, 48–72h FAL starvation threshold) and cumulative HTP retention are critical for labor leverage and factual credibility during negotiations.

**Independent Test**: Can be tested by running mathematical invariant checks and parametric unit tests verifying that flight frequencies, HTP retention, stock buffer curves, and assembly line delay penalties match exact formulas across all conflict phases.

**Acceptance Scenarios**:

1. **Given** a zero-flight status from Getafe (LEGT), **When** calculating weekly HTP retention, **Then** the engine applies the verified factor of 1.5–2.0 HTP sets per missed sortie against the 14 flights/week normal baseline, correctly calculating cumulative factory stock retention.
2. **Given** prolonged strike duration, **When** evaluating FAL stock buffer remaining, **Then** the model computes exact remaining buffer hours starting from a 60.0h safety threshold down to 0.0h (Critical Assembly Halt) at a realistic consumption cadence of ~2.5 sets/day.
3. **Given** stalled final assembly lines in Toulouse and Hamburg, **When** computing delivery delay penalties, **Then** the engine models the standard commercial contract penalty of 420.000 €/day per delayed airframe up to 4.96 M€/day across all affected FALs.

---

### User Story 3 - Real-Time Fleet State & European Route Disruption Matrix (Priority: P3)

As a dashboard user, I need to inspect the live status of all 6 BelugaXL airframes and European transit routes, differentiating between 100% blocked Getafe export corridors and operational intra-European feeder routes.

**Why this priority**: Visualizing individual aircraft (`F-GXLG` through `F-GXLO`) and routing status provides transparent empirical proof of the logistics blockade.

**Independent Test**: Can be tested by filtering aircraft by tail registration and asserting that route matrices accurately classify Getafe corridors as "Bloqueado" while other European feeder routes display their respective operational status.

**Acceptance Scenarios**:

1. **Given** the 6 BelugaXL fleet members (`XL1`–`XL6`), **When** selecting individual aircraft tails, **Then** the interface displays exact position, callsign, current base, and Spain-blockade relevance.
2. **Given** the European route matrix, **When** rendered, **Then** the Getafe $\rightarrow$ Toulouse (LFBO) and Getafe $\rightarrow$ Hamburg (EDHI) routes are marked as 100% blocked HTP bottlenecks, whereas Broughton $\rightarrow$ Toulouse (Wings) and Saint-Nazaire $\rightarrow$ Toulouse (Fuselage) reflect feeder operational status.

---

### Edge Cases

- **BelugaWatch API network failure or rate limiting**: The engine must gracefully fall back to a calibrated deterministic fallback model without crashing or blocking dashboard initialization.
- **Aircraft diversion to alternative airfields**: If a BelugaXL lands outside standard bases (e.g. Zaragoza or Bordeaux), the engine must log the anomaly and categorize the flight relevance appropriately.
- **Partial flight recovery during mediation windows**: The math model must support variable non-zero sortie counts (e.g. 2, 6, or 9 flights/week) and compute exact intermediate buffer recharge/drain rates dynamically.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST decouple the Beluga logistics engine into a standalone module with its own data models, dedicated JSON artifact (`data/beluga_status.json`), and isolated execution pipeline.
- **FR-002**: News, media feeds, and Twitter/Telegram sentiment scrapers MUST NOT import, execute, or overwrite Beluga logistics metrics during sentiment evaluation.
- **FR-003**: The Beluga calculations engine MUST calculate weekly flight deficits against the canonical baseline of 14 normal sorties/week from Getafe (LEGT).
- **FR-004**: System MUST compute cumulative HTP (Horizontal Tail Plane) retention using the standard conversion factor of 1.5–2.0 shipsets per flight.
- **FR-005**: System MUST compute FAL stock buffer exhaustion hours and remaining percentage from a baseline of 60.0 hours down to 0.0 hours (FAL Starvation).
- **FR-006**: System MUST compute financial delay penalty exposure based on the standard aerospace delay penalty of 420.000 €/day per aircraft and 4.96 M€/day cumulative assembly line stoppage.
- **FR-007**: System MUST track all 6 BelugaXL fleet registrations (`F-GXLG`, `F-GXLH`, `F-GXLI`, `F-GXLJ`, `F-GXLN`, `F-GXLO`) and their flight state.
- **FR-008**: System MUST display an interactive European route matrix distinguishing blocked Getafe routes from operational intra-European links.
- **FR-009**: Dashboard client application MUST manage an isolated polling lifecycle for Beluga logistics without coupling to the sentiment feed or wage calculator.
- **FR-010**: All Beluga calculations and invariant assertions MUST pass automated mathematical validation in the test suite.

---

### Key Entities

- **BelugaAircraft**: Represents an individual transport aircraft in the fleet (Registration, Name, Callsign, Status, Current Base, Route, Spain Blockade Relevance).
- **LogisticsRoute**: Represents an aerospace supply route between Airbus factories (Origin, Destination, Component Carried, Status, Blockade Percentage).
- **FALStockBuffer**: Models the remaining inventory buffer in hours and percentage for FAL Toulouse and FAL Hamburg before complete assembly line shutdown.
- **BelugaMovementPeriod**: Historical conflict period representing weekly flight trends, actual sorties, retained HTP units, and operational stress level.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% separation of Beluga logistics code from news/sentiment scraping with zero cross-module circular dependencies.
- **SC-002**: All mathematical formulas for HTP retention, buffer decay, and delivery penalties validated with 100% passing invariant checks.
- **SC-003**: Beluga logistics calculation engine executes and returns full analytics in under 25ms locally.
- **SC-004**: Dashboard Beluga fleet view and historical flight trajectory charts render reactively with zero JavaScript errors.
- **SC-005**: Network fallback model provides 100% reliable offline data continuity when live radar APIs are unreachable.

---

## Assumptions

- Getafe (LEGT) factory maintains a worldwide single-source monopoly for all Airbus commercial Horizontal Tail Planes (HTP).
- Normal pre-conflict operational cadence is 14 Beluga sorties per week connecting Getafe with Toulouse and Hamburg.
- Safety buffer in European FALs before supply disruption halts assembly is 60.0 hours.
- The 6 BelugaXL airframes represent the core strategic heavy-lift transport fleet for European commercial programs (A320/A321, A330, A350).
