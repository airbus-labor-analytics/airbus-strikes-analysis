# Feature Specification: Beluga Logistics Engine Decoupling & Supply Chain Math Validation

**Feature Branch**: `014-isolate-and-validate-beluga-engine`  
**Created**: 2026-09-01  
**Status**: Draft  
**Input**: User description: "separa la parte de beluga del analizador de noticias, tweets, etc. ademas la parte de beluga no luce que haga los calculos correctamente, valida y corrige"

---

## Clarifications

### Session 2026-09-01
- **Q**: ¿Cómo debe tratarse el gráfico de evolución semanal de vuelos Beluga y retención de HTPs que carece de registros históricos verificados? → **A**: **Eliminación total del gráfico histórico sintético (`#belugaHistoryChart`) y de los arrays ficticios semanales (`period_definitions`, `getafe_flights_per_week`)**. El sistema se adhiere a la regla constitucional de *Zero Datos Inventados*. En su lugar, el módulo se centra exclusivamente en:
  1. Telemetría de radar en tiempo real verificada (BelugaWatch / OpenSky Network) para las 6 aeronaves BelugaXL (`F-GXLG` a `F-GXLO`).
  2. Detección en vivo del bloqueo de Getafe (LEGT) frente a vuelos europeos activos.
  3. Matriz de rutas europeas y parámetros de cuello de botella industrial JIT respaldados por fuentes documentales primarias (actas de asamblea y especificaciones de fábrica).

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

### User Story 2 - Elimination of Fabricated Weekly Charts & Strict Data Grounding (Priority: P2)

As a dashboard user and data integrity auditor, I need the application to completely remove fabricated weekly historical flight arrays and synthetic HTP curves (`#belugaHistoryChart`), ensuring that 100% of displayed logistics data stems from verified real-time ADS-B radar feeds and cited assembly minutes.

**Why this priority**: Displaying synthetic historical series that cannot be corroborated with timestamped ADS-B logs damages the credibility of the entire platform. Elimination of unverified historical charts aligns with the core project constitution (*Zero Unverified Data*).

**Independent Test**: Can be tested by verifying that `#belugaHistoryChart` and synthetic `period_definitions` are absent from DOM and payloads, and that live radar metrics rely solely on verified OpenSky/BelugaWatch telemetry and cited factory documentation.

**Acceptance Scenarios**:

1. **Given** the Beluga logistics panel, **When** loaded, **Then** no synthetic weekly flight progression or simulated historical HTP retention chart is rendered.
2. **Given** the data payload (`data/beluga_status.json`), **When** generated, **Then** it contains only real-time aircraft coordinates, current site, flight status, and cited assembly minute evidence (`sources/721c0baa.txt`), with zero fabricated historical weeks.

---

### User Story 3 - Real-Time Fleet State & European Route Disruption Matrix (Priority: P3)

As a dashboard user, I need to inspect the live status of all 6 BelugaXL airframes and European transit routes, differentiating between 100% blocked Getafe export corridors and operational intra-European feeder routes.

**Why this priority**: Visualizing individual aircraft (`F-GXLG` through `F-GXLO`) and routing status provides transparent empirical proof of the logistics blockade without inventing historical data.

**Independent Test**: Can be tested by filtering aircraft by tail registration and asserting that route matrices accurately classify Getafe corridors as "Bloqueado" while other European feeder routes display their respective operational status.

**Acceptance Scenarios**:

1. **Given** the 6 BelugaXL fleet members (`XL1`–`XL6`), **When** selecting individual aircraft tails, **Then** the interface displays exact position, callsign, current base, and Spain-blockade relevance.
2. **Given** the European route matrix, **When** rendered, **Then** the Getafe $\rightarrow$ Toulouse (LFBO) and Getafe $\rightarrow$ Hamburg (EDHI) routes are marked as 100% blocked HTP bottlenecks, whereas Broughton $\rightarrow$ Toulouse (Wings) and Saint-Nazaire $\rightarrow$ Toulouse (Fuselage) reflect feeder operational status.

---

### Edge Cases

- **BelugaWatch API network failure or rate limiting**: The engine must gracefully fall back to a calibrated deterministic fallback model without crashing or blocking dashboard initialization.
- **Aircraft diversion to alternative airfields**: If a BelugaXL lands outside standard bases (e.g. Zaragoza or Bordeaux), the engine must log the anomaly and categorize the flight relevance appropriately.
- **Unverified historical data requests**: The engine must refuse to extrapolate or fabricate non-existent historical days/weeks.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST decouple the Beluga logistics engine into a standalone module with its own data models, dedicated JSON artifact (`data/beluga_status.json`), and isolated execution pipeline.
- **FR-002**: News, media feeds, and Twitter/Telegram sentiment scrapers MUST NOT import, execute, or overwrite Beluga logistics metrics during sentiment evaluation.
- **FR-003**: System MUST completely remove `#belugaHistoryChart` and all synthetic weekly flight/HTP arrays (`period_definitions`, `getafe_flights_per_week`, simulated `accumulated_htp` curves) from the codebase and UI.
- **FR-004**: System MUST track all 6 BelugaXL fleet registrations (`F-GXLG`, `F-GXLH`, `F-GXLI`, `F-GXLJ`, `F-GXLN`, `F-GXLO`) using live radar telemetry from BelugaWatch / OpenSky Network.
- **FR-005**: System MUST evaluate real-time Getafe blockade status by checking whether any tracked BelugaXL is operating in, departing from, or arriving at Getafe (LEGT).
- **FR-006**: System MUST display an interactive European route matrix distinguishing blocked Getafe routes from operational intra-European links.
- **FR-007**: System MUST ground industrial impact assertions in verified primary source documents (e.g. Minutas de Asamblea de Getafe 17/07/2026: *"El beluga ya no viene porque no tiene piezas que llevar a Toulouse"*).
- **FR-008**: Dashboard client application MUST manage an isolated polling lifecycle for Beluga logistics without coupling to the sentiment feed or wage calculator.
- **FR-009**: All Beluga code and validation assertions MUST pass automated invariant checks with zero fabricated historical assumptions.

---

### Key Entities

- **BelugaAircraft**: Represents an individual transport aircraft in the fleet (Registration, Name, Callsign, Status, Current Base, Route, Spain Blockade Relevance).
- **LogisticsRoute**: Represents an aerospace supply route between Airbus factories (Origin, Destination, Component Carried, Status, Blockade Percentage).
- **LiveBlockadeStatus**: Real-time evaluation of Getafe corridor closure based on live ADS-B positions and factory assembly minute evidence.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% separation of Beluga logistics code from news/sentiment scraping with zero cross-module circular dependencies.
- **SC-002**: Zero fabricated historical data series or synthetic weekly curves in data payloads and UI components.
- **SC-003**: Beluga logistics calculation engine executes and returns live telemetry in under 25ms locally.
- **SC-004**: Dashboard Beluga fleet view and European route matrix render reactively with zero JavaScript errors.
- **SC-005**: Network fallback model provides 100% reliable offline data continuity when live radar APIs are unreachable.

---

## Assumptions

- Getafe (LEGT) factory maintains a worldwide single-source monopoly for all Airbus commercial Horizontal Tail Planes (HTP).
- The 6 BelugaXL airframes represent the core strategic heavy-lift transport fleet for European commercial programs (A320/A321, A330, A350).
- Real-time radar positions obtained from BelugaWatch / OpenSky Network provide sufficient empirical grounding for live fleet tracking without needing synthetic historical interpolation.
