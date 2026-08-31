# Feature Specification: Modular Dashboards & Welcome Portal Hub

**Feature Branch**: `005-modular-dashboards-portal`
**Created**: 2026-08-31
**Status**: Draft
**Input**: User description: "trata de disgregar la información de manera que un dashboard no este altamente poblado, ya que es complicado navegar y entender todas las funcionalidades. por ejemplo, el calculo salarial debe ser un dashboard, la información sindical otra, etc. genera tambien una pagina de bienvenida donde se liste un mapa de la web con cada uno de los apartados se explique los fundamentos de la creacion de la web, y sirva para echar un vistazo rapido de los valores generales de la web"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Welcome Portal Hub & Site Navigation Map (Priority: P1) 🎯 MVP

As a worker, union delegate, journalist, or interested citizen visiting the platform for the first time,
I want a clean, dedicated Welcome Portal that explains the core purpose and founding principles of the website, provides a high-level executive summary of key conflict figures, and presents an interactive Site Map of all analytical modules,
So that I can quickly understand what the platform offers, grasp the overall strike situation in under 15 seconds, and effortlessly navigate directly to the specific dashboard I need without cognitive overload.

**Why this priority**:
Currently, loading the application immediately drops the user into dense data tables and charts. A welcoming landing portal establishes context, transparency, and clear navigation paths for all user types.

**Independent Test**:
Can be fully tested by opening the application root and verifying that the Welcome Portal loads as the primary default view, displays the repository's mission/principles, presents top-level summary KPIs (Census, Stock impact, Wage Loss, JIT buffer), and contains a complete Site Map card grid linking to every dedicated dashboard.

**Acceptance Scenarios**:
1. **Given** the user lands on the root URL, **When** the page renders, **Then** they see the Welcome Portal featuring:
   - Platform Mission Statement: Why this analytical tool was built (labor transparency, mathematical veracity, defense of purchasing power, primary source grounding).
   - Executive Flash Summary: Top 4 high-level KPI cards (15,562 workers, -14.4B€ market cap delta, 60h FAL buffer limit, -26,027€ average 5-year purchasing power loss).
   - Visual Site Map: Dedicated interactive portal cards for each of the 5 specialized sub-dashboards with concise descriptions and 1-click launch buttons.
2. **Given** the visual site map on the Welcome Portal, **When** the user clicks on any module card (e.g. "Calculadora Salarial" or "Logística Beluga"), **Then** the interface navigates smoothly to that dedicated dashboard view.

---

### User Story 2 - Focused, Decoupled Thematic Dashboards (Priority: P2)

As an analytical user, negotiator, or assembly member,
I want each thematic area (Wage Calculator, Union & Assembly, Logistics & Beluga, Financial Asymmetry, Documentary Archive) to be isolated in its own focused, uncluttered dashboard,
So that each view is spacious, intuitive, and dedicated purely to its specific analytical purpose without unnecessary visual noise or overlapping widgets.

**Why this priority**:
Grouping too many complex widgets into cramped multi-purpose views overwhelms users. Isolating tools (like the Wage Simulator or Beluga Flight Radar) into dedicated, spacious layouts dramatically improves readability and usability during fast-paced assembly discussions.

**Independent Test**:
Can be tested by navigating through each of the 5 dedicated dashboards to confirm that each view presents only its relevant domain cards, charts, and interactive controls with balanced whitespace, clear typography, and zero irrelevant widgets.

**Acceptance Scenarios**:
1. **Given** the "Calculadora Salarial & Convenio" dashboard, **When** active, **Then** it focuses exclusively on the interactive salary simulator, 5-year purchasing power loss tables, and the 11-point platform cost model.
2. **Given** the "Fuerza Sindical & Asamblea" dashboard, **When** active, **Then** it focuses exclusively on plant censuses, the 198-delegate distribution matrix, 24-J referendum tallies, and the conflict chronology.
3. **Given** the "Logística & Monitor BelugaXL" dashboard, **When** active, **Then** it focuses exclusively on live ADS-B fleet movements, HTP stock retention accumulation, and FAL buffer depletion gauges.
4. **Given** the "Centro Financiero & Asimetría" dashboard, **When** active, **Then** it focuses exclusively on Airbus SE 2025 earnings, shareholder dividend distributions, and EURONEXT market cap tracking.
5. **Given** the "Evidencias & Archivo Documental" dashboard, **When** active, **Then** it focuses exclusively on full-text search across 269 primary sources, Telegram archive index, and aerospace strike benchmarks.

---

### User Story 3 - Persistent Global Navigation & Breadcrumb Navigation (Priority: P3)

As a power user navigating between multiple specialized tools,
I want a unified top navigation bar with persistent breadcrumbs and quick-switch tabs,
So that I can return to the Welcome Hub or jump between specialized dashboards with a single click while preserving active filter states.

**Why this priority**:
Smooth, persistent navigation ensures users never get lost across decoupled dashboards and can always jump back to the central hub.

**Independent Test**:
Can be tested by navigating between several sub-dashboards and clicking the "Inicio / Portal Hub" breadcrumb to verify instant return to the landing overview.

**Acceptance Scenarios**:
1. **Given** any active sub-dashboard, **When** viewing the top navigation, **Then** a prominent "← Volver al Portal / Mapa Web" link and a clear section breadcrumb are visible.
2. **Given** navigation between dashboards, **When** switched, **Then** the view scroll position resets to top (`scrollTop = 0`), and any chart canvas within the newly displayed dashboard triggers responsive resizing without distortion.

---

## Edge Cases

- **Direct Deep-Linking (e.g. `#portal`, `#salarios`, `#beluga`, `#sindical`)**: The router must load the specified dashboard directly if a hash is present in the URL, while defaulting to `#portal` (Welcome Hub) when no hash is specified.
- **Small Mobile Screens (< 380px)**: The Welcome Portal site map cards must stack vertically in a clean single column, with easy touch targets for mobile devices.
- **Offline / Local File Protocol (`file:///`)**: The Welcome Portal and all decoupled dashboards must render instantly from local datasets (`dashboard/data.js`) without requiring an active internet connection.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a dedicated Welcome Portal (`#portal` / `tab-portal`) serving as the default landing view.
- **FR-002**: Welcome Portal MUST display the platform's founding principles and mission statement (transparency, verified primary sources, labor economics, worker sovereignty).
- **FR-003**: Welcome Portal MUST present an executive flash overview with 4 global summary KPIs (Total Workforce, Stock Market Delta, FAL Buffer Hours, Average 5-Year Loss).
- **FR-004**: Welcome Portal MUST present an interactive Site Map grid containing visual access cards for all 5 specialized sub-dashboards.
- **FR-005**: System MUST decouple information into 5 dedicated, uncrowded dashboards:
  1. `Centro de Mando Financiero & Asimetría` (`#financiero`)
  2. `Logística Industrial & Monitor BelugaXL` (`#logistica`)
  3. `Calculadora Salarial & Retorno de Huelga` (`#salarios`)
  4. `Fuerza Sindical, Asamblea & Referéndum` (`#sindical`)
  5. `Evidencias, Telegram & Fuentes Primarias` (`#evidencias`)
- **FR-006**: Each specialized dashboard MUST isolate its specific charts, tables, and interactive controls with clean spacing, avoiding clutter and information overload.
- **FR-007**: System MUST provide a persistent global header with quick navigation tabs and a "Volver al Mapa Web" portal shortcut.
- **FR-008**: System MUST maintain full mathematical parity and data fidelity across all decoupled dashboards consuming `data/conflict_metrics.json`.
- **FR-009**: System MUST ensure that switching views resets scroll offsets (`scrollTop = 0`) and triggers responsive `.resize()` on visible Chart.js instances.

---

### Key Entities

- **WelcomePortal**: Landing view presenting mission principles, flash KPIs, and the interactive site map.
- **SiteMapCard**: Interactive navigation widget detailing a specific sub-dashboard's purpose, contents, and direct access link.
- **ModularDashboard**: A self-contained, dedicated analytical view focused on one domain area (Finance, Logistics, Salaries, Union/Assembly, Evidence).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of first-time visitors landing on the site view the Welcome Portal with clear founding principles and global flash KPIs.
- **SC-002**: Reduction in perceived cognitive load: each specialized dashboard contains strictly relevant domain components, reducing on-screen data density per view by over 50%.
- **SC-003**: Navigation to any specific tool (e.g. Salary Simulator, Beluga Radar, Referendum tallies) accessible in 1 click from the Welcome Portal.
- **SC-004**: 100% pass rate across repository invariant validation suites (`validate_invariants.py`, `validate_sources.py`, and `tests/test_dashboard_ui.py`).

---

## Assumptions

- Single-page vanilla JavaScript with Tailwind CSS remains the core stack, utilizing clean hash routing (`#portal`, `#salarios`, etc.) without introducing heavy frontend framework dependencies.
- All existing verified datasets (`data/conflict_metrics.json`, `data/beluga_status.json`) will be reused with 100% mathematical consistency.
