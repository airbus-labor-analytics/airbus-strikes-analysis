# Feature Specification: Universal Dynamic Data Synchronization & Chart Resilience Engine

**Feature Branch**: `007-dynamic-data-and`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "todas las graficas, numeros, listados, etc que puedan ser dinamicos debidos a que beben de una fuente dinamica como belugatracker, documentos de telegram, dias de conflicto, etc. hazlo dinamicos para que siempre este todo lo más actualizado posible. además existen graficos que actualmente no funcionan, y eso no deberia poder suceder nunca"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-Time Dynamic Metric Derivation & Temporal Calculations (Priority: P1) 🎯 MVP

As an assembly representative, negotiator, or union analyst visiting the platform, I want all conflict counters, financial loss totals, document lists, and logistic metrics to be calculated dynamically from their respective live and cached sources (ADS-B Beluga feeds, indexed Telegram assembly records, elapsed strike calendar days), so that I always see the exact up-to-the-minute status of the conflict rather than outdated static snapshots.

**Why this priority**: Core platform credibility depends on live data fidelity. Any hardcoded numbers (e.g. fixed day counters, static document totals, hardcoded cumulative losses) create data drift and mislead stakeholders.

**Independent Test**: Load the dashboard and verify that conflict duration days, cumulative strike costs for Airbus SE, Telegram document counts, and Beluga buffer hours update dynamically relative to current timestamp and ingested datasets without manual intervention.

**Acceptance Scenarios**:

1. **Given** the strike start date of July 20, 2026, **When** the dashboard initializes on any calendar day, **Then** the total days of conflict and cumulative cost of the strike (days × 22.7 M€/day) are dynamically computed and rendered across all cards and simulators.
2. **Given** the indexed Telegram archive in `data/telegram_archive/`, **When** new document minutas or assemblies are synced, **Then** the document totals, factory counts, and assembly chronology update automatically in Module 5 without hardcoded totals.
3. **Given** live ADS-B flight feeds, **When** Beluga flights from Getafe remain at zero, **Then** the HTP retention counts, route statuses, and FAL buffer depletion rates calculate dynamically in real time.

---

### User Story 2 - Zero-Failure Chart.js Rendering & Safe Lifecycle Engine (Priority: P2)

As a dashboard user exploring various analytical tabs and resizing my browser or switching views rapidly, I want all 12 Chart.js visualizations (Asymmetry, Stock AIR.PA, Revenue, Deliveries, Shareholder structure, Beluga flight history, Wages loss, Union representation, Electoral evolution, Site delegates, Referendum outcome, and Referendum site breakdown) to render flawlessly without blank canvases, console errors, or canvas collision exceptions.

**Why this priority**: Chart rendering failures or silent script exceptions destroy user trust and break the analytical value of the platform. Visualizations must be completely resilient under all network, navigation, and rendering conditions.

**Independent Test**: Switch across all 6 tabs in random sequence, toggle browser viewport sizes, and verify that 100% of chart canvases render valid data, maintain correct aspect ratios, and handle chart destruction/re-instantiation safely.

**Acceptance Scenarios**:

1. **Given** any of the 12 dashboard chart canvases, **When** the user switches to its parent tab, **Then** the chart initializes cleanly, destroys any previous instance on the canvas, and displays properly formatted legends and tooltips.
2. **Given** missing or delayed remote API data, **When** a chart initializes, **Then** it safely renders from local baseline data without throwing uncaught JavaScript exceptions or leaving an empty white canvas.
3. **Given** rapid tab transitions, **When** `switchTab()` is triggered repeatedly, **Then** no "Canvas is already in use" Chart.js errors occur and visible charts automatically resize.

---

### User Story 3 - Autonomous Background Polling & Seamless DOM Synchronization (Priority: P3)

As a visitor keeping the dashboard open during active negotiation rounds, I want the client application to periodically poll updated local and remote datasets in the background and smoothly refresh DOM metrics and charts without requiring a full page reload or interrupting active user interactions.

**Why this priority**: Provides continuous situational awareness during critical strike days without disrupting user input (such as wage simulations or document searches).

**Independent Test**: Trigger a data refresh event in the background and confirm that flash KPIs, live sync indicators, and active charts update in-place without resetting scroll or form states.

**Acceptance Scenarios**:

1. **Given** an active dashboard session, **When** background data sync occurs, **Then** the live sync status indicator pulses green and updated values propagate to the DOM smoothly.
2. **Given** active user interaction in the wage calculator, **When** background polling completes, **Then** the simulator retains user-selected inputs while updating underlying economic baseline metrics.

---

### Edge Cases

- What happens when live network connectivity is completely offline? System seamlessly falls back to bundled `data.js` and local cache with zero rendering failures.
- How does the system handle corrupt or empty JSON responses from external APIs? Strict schema validation catches invalid payloads, logs a silent warning, and retains the last valid calibrated state.
- What happens if a Chart.js canvas element is missing from the DOM during tab switch? Null guards ensure safe exit without throwing uncaught errors.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST dynamically calculate the elapsed conflict duration (in days and hours) from the official start date (`2026-07-20T06:00:00Z`) relative to current client timestamp.
- **FR-002**: System MUST dynamically compute cumulative industrial and financial strike impact metrics (daily cost × elapsed days, cumulative FAL stoppage penalties) and update all dependent UI cards.
- **FR-003**: System MUST dynamically aggregate total documents, assembly minutes, and factory breakdowns from the live Telegram archive catalog.
- **FR-004**: System MUST guarantee safe instantiation, destruction, and resizing lifecycle across all 12 Chart.js visualizations.
- **FR-005**: All chart initializers MUST include strict DOM presence guards, data sanitization, and fallback datasets preventing unhandled errors.
- **FR-006**: System MUST provide dual-mode data loading: live asynchronous fetch with immediate local baseline fallback for 100% offline file:// compatibility.
- **FR-007**: System MUST maintain state preservation during background re-syncs, ensuring active user inputs in wage calculators and search filters are not wiped.
- **FR-008**: System MUST update all static badges, headers, and footer counters with dynamic expressions tied to canonical data models.

### Key Entities

- **ConflictChronology**: Tracks start timestamp, current timestamp, elapsed strike days, active strike phases, and cumulative financial burn rate.
- **DynamicLogisticsState**: Encapsulates Beluga ADS-B flight throughput, Getafe HTP retention totals, route matrix, and FAL buffer remaining hours.
- **ChartLifecycleRegistry**: Manages active Chart.js instances, canvas associations, resize handlers, and safe teardown routines.
- **DocumentCatalogIndex**: Represents indexed Telegram assembly records, primary sources, category tags, and factory origins.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the 12 dashboard charts render successfully without console errors or broken canvases across all 6 tabs.
- **SC-002**: 0% hardcoded calendar day counts or static cumulative cost totals remain in the codebase; all are derived dynamically.
- **SC-003**: 100% pass rate in automated UI and DOM hierarchy validation suites (`test_dashboard_ui.py`, `validate_sources.py`).
- **SC-004**: Dashboard operates with zero blank screens or crashes in both offline local mode (`file://`) and live GitHub Pages web environment.

## Assumptions

- Conflict start date is firmly anchored at July 20, 2026 (Day 1 of the open-ended general strike).
- Chart.js v4.x is loaded via CDN with local fallback bundled scripts if needed.
- Telegram archive index and conflict metrics JSON files serve as canonical local data sources when external APIs are unreachable.
