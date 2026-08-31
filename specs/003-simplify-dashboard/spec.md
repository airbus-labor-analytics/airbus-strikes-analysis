# Feature Specification: Dashboard UI/UX Simplification & Thematic Reorganization

**Feature Branch**: `003-simplify-dashboard`
**Created**: 2026-08-31
**Status**: Draft
**Input**: User description: "haz una revision de la web completa, eliminando cosas inservibles, haciendo la interfaz mas sencilla visual, legible y entendible, por ejemplo cosas a quitar, auditor 6 filtros de urna. validar si los paneles actuales tienen sentido o si es preferible reorganizarlos y agruparlos de diferente manera"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Thematic Reorganization & Clutter Elimination (Priority: P1) 🎯 MVP

As an Airbus worker, union representative, or public observer,
I want to navigate a clean, coherent dashboard organized into 5 logical thematic sections rather than 15 fragmented, overlapping tabs,
So that I can immediately understand key conflict metrics, industrial bottlenecks, and negotiation status without cognitive overload.

**Why this priority**:
The current interface suffers from severe fragmentation (15 tabs with overlapping content such as stock vs financial health, JIT vs thermometer, and separate wage/loss tabs), creating friction and confusion. Removing obsolete tools (like the 6-filter ballot auditor) and consolidating views immediately elevates usability.

**Independent Test**:
Can be fully tested by opening the web dashboard and verifying that exactly 5 unified navigation modules exist, the obsolete "Auditor 6 Filtros Urna" tab is completely removed, and all existing verified metrics are logically nested without data loss.

**Acceptance Scenarios**:
1. **Given** the user visits the dashboard, **When** they view the sidebar/navigation, **Then** they see 5 streamlined thematic sections instead of 15 disjointed tabs:
   - `1. Centro de Mando & Asimetría` (Executive summary, stock market, corporate financials, key KPIs).
   - `2. Impacto Industrial & Logística` (JIT supply chain, FALs impact, Beluga flight monitor, Thermometer).
   - `3. Poder Adquisitivo & Negociación` (Wage loss simulator, historical BOE pacts, offer gap analysis, 11-point platform).
   - `4. Fuerza Sindical & Asamblea` (Site/union delegate map, 24-J referendum results, conflict chronology, scenarios).
   - `5. Documentación & Evidencias` (Primary source annex, Telegram archive, aerospace strike benchmarks).
2. **Given** the user navigates across the application, **When** searching for the legacy "Auditor 6 Filtros Urna", **Then** that obsolete tab and its checklist are completely absent from the UI and navigation.
3. **Given** any existing chart or dataset, **When** accessed within its new thematic section, **Then** all underlying calculations, primary source links, and data bindings remain 100% functional.

---

### User Story 2 - Visual Simplification & Readability Enhancement (Priority: P2)

As a mobile or desktop reader,
I want clean typography, balanced spacing, high-contrast text, and uncluttered data cards,
So that complex economic calculations and labor tables can be read and understood in under 5 seconds.

**Why this priority**:
Excessive visual clutter (cramped cards, dense borders, redundant badge tags, repetitive headings) makes critical data hard to digest during urgent assembly discussions.

**Independent Test**:
Can be tested by inspecting each of the 5 views on both desktop and mobile viewports to verify that typography is legible, padding/margins are consistent, Chart.js visual containers are clean and responsive, and visual noise is eliminated.

**Acceptance Scenarios**:
1. **Given** any data card or metric panel, **When** viewed on small or large screens, **Then** font sizes, line heights, and padding follow a clean hierarchical design system with readable contrast.
2. **Given** interactive charts (e.g. Asymmetry, Stock milestones, Referendum votes, Beluga flights), **When** rendered, **Then** chart legends, axes, and tooltips are clearly visible without overlapping labels.
3. **Given** data tables (e.g. plant censuses, delegate distributions, wage loss tables), **When** displayed, **Then** columns are neatly aligned with distinct headers, subtle hover states, and clear summary totals.

---

### User Story 3 - Streamlined Filtering & Interactive Exploration (Priority: P3)

As an analytical user,
I want simple, intuitive interactive controls (such as plant selectors, wage sliders, and documentary search) without redundant micro-filters,
So that I can quickly simulate outcomes and locate primary evidence with minimal effort.

**Why this priority**:
Redundant, non-standard filtering widgets create interface friction. Consolidating search and filtering makes tools like the Wage Simulator and Documentary Annex instantly actionable.

**Independent Test**:
Can be tested by interacting with the Wage Calculator sliders and the Document search input to verify smooth real-time updates and clear reset capabilities.

**Acceptance Scenarios**:
1. **Given** the Wage Simulator within section 3, **When** the user adjusts the salary or inflation slider, **Then** the updated comparison values render immediately with clear visual feedback.
2. **Given** the Documentary Annex within section 5, **When** the user types a search query (e.g. "SIMA", "Euronext", "BOE"), **Then** results filter in real time with direct verified external links.

---

## Edge Cases

- **Small mobile screens (< 380px)**: The navigation drawer must collapse smoothly, and responsive tables must allow horizontal scrolling without breaking page layout.
- **Offline / No Network**: Cached dataset (`dashboard/data.js`) must render all 5 thematic views without requiring external network calls.
- **Deep Linking / Tab Switching**: Navigating between the 5 consolidated sections must maintain application state (e.g., active simulator parameters or search queries).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST consolidate all dashboard views into exactly 5 top-level thematic modules (`Centro de Mando & Asimetría`, `Impacto Industrial & Logística`, `Poder Adquisitivo & Negociación`, `Fuerza Sindical & Asamblea`, `Documentación & Evidencias`).
- **FR-002**: System MUST completely remove the obsolete "Auditor 6 Filtros Urna" tab (`tab-checklist`), its navigation button, and its unused DOM markup.
- **FR-003**: System MUST unify the Stock Market (AIR.PA) and Corporate Financial Health sections into the `Centro de Mando & Asimetría` module.
- **FR-004**: System MUST merge the JIT Supply Chain, FALs impact, Beluga flight log, and Thermometer into the `Impacto Industrial & Logística` module.
- **FR-005**: System MUST merge Historical BOE Losses, Wage Simulator, Negotiation Evolution, and 11-point Platform into the `Poder Adquisitivo & Negociación` module.
- **FR-006**: System MUST combine Social Map/Delegates, 24-J Referendum results, Conflict Chronology, and Scenario Trees into the `Fuerza Sindical & Asamblea` module.
- **FR-007**: System MUST consolidate Primary Sources Annex, Telegram Archive, and Strategic Aerospace Benchmarks into the `Documentación & Evidencias` module.
- **FR-008**: System MUST maintain 100% data parity and calculation fidelity with `data/conflict_metrics.json` and `dashboard/data.js`.
- **FR-009**: System MUST ensure all 12 Chart.js canvases render cleanly within their designated modules without rendering glitches or memory leaks.
- **FR-010**: System MUST provide a responsive, accessible sidebar navigation with clear active states and mobile drawer toggle.
- **FR-011**: System MUST retain all verified primary source links and official PDF download shortcuts in the top navigation header.
- **FR-012**: System MUST eliminate redundant badge indicators, repetitive text headers, and excessive borders across all components.

---

### Key Entities

- **ThematicModule**: Represents one of the 5 top-level views containing related analytical cards, interactive charts, and data tables.
- **MetricCard**: High-contrast KPI visual block presenting verified summary numbers with primary source badges.
- **InteractiveTool**: Client-side interactive widget (e.g., Wage Simulator, Document Search filter) bound to `CONFLICT_DATA`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Top-level navigation items reduced by 66% (from 15 fragmented tabs to 5 unified thematic sections).
- **SC-002**: 100% removal of obsolete, low-value components (including the 6-filter ballot auditor and redundant sub-headers).
- **SC-003**: Time required for a first-time user to locate key metrics (e.g. wage loss, referendum vote, FAL buffer) reduced by over 50%.
- **SC-004**: Zero regressions in mathematical calculations, invariant rules, and primary source links across all 5 views.
- **SC-005**: 100% responsive display on mobile (320px+), tablet, and desktop viewports without layout clipping.

---

## Assumptions

- The underlying data schema in `data/conflict_metrics.json` and `dashboard/data.js` remains the single source of truth and does not require schema changes.
- Modern CSS (Tailwind CSS utility classes) and vanilla JavaScript with Lucide icons and Chart.js will continue to be used without adding heavy frontend frameworks.
- The 5 unified modules adequately cover all analytical and documentary requirements of workers, union delegates, and analysts.
