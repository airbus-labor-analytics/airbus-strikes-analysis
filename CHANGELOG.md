# Changelog

All notable changes to the Airbus Spain 2026 Strike Analytics project will be documented in this file.

## [017-conflict-welcome-pack] - 2026-09-02

### Added
- **Welcome Pack al Conflicto & Primary Chronology (`#tab-welcome-pack`)**:
  - Executive introduction module summarizing structural causes, real purchasing power loss (-20.9% to -24.4%, -26,030 € net), and company economic capacity (€73.4B revenue, €4.96B net profit).
  - 4 authenticated primary quotes from assembly minutes (`Minutas_Asamblea_Getafe_*.txt`) and loss dossiers.
  - 3-Phase Chronology (Gestation, Escalation & Direct Democracy, Indefinite Strike up to Day 9 - 2026-09-02) with phase-filtering buttons.
  - 11-point Strike Committee platform summary cards with verified economic costs.
  - Dynamic freshness badge reflecting strike day (`Día 9 de Huelga General Indefinida`) and live Madrid timezone timestamp.
- **Automated Markdown Dossier Generator (`src/generate_welcome_pack.py`)**:
  - Compiles `docs/Welcome_Pack_Conflicto_Airbus_2026.md` directly from verified JSON metrics and primary sources.
- **Rule 16 Invariant & Unit Tests (`src/validate_invariants.py`, `tests/test_welcome_pack.py`)**:
  - Rule 16 validating Welcome Pack structure, 3 phases, quotes, and dossier compilation.
  - 6 new unit tests ensuring 100% mathematical and source integrity (total 92/92 tests passing).

### Changed
- **Dashboard Navigation & Dock (`dashboard/index.html`, `dashboard/app.js`)**:
  - Added direct quick access button in portal header («¿Qué nos ha llevado aquí?») and feature card in portal grid.
  - Added bottom dock button and URL hash routing aliases (`#tab-welcome-pack`, `#welcome`, `#guia`).

## [016-daily-timeline-assembly-validator-grounding] - 2026-09-02

### Fixed
- **Verbatim Assembly Minutes Grounding & Hallucination Elimination (`src/analysis_engine.py`)**:
  - Replaced all synthetic voting percentages and unverified logistics claims with 100% faithful transcriptions from primary assembly minutes.
  - Verified and linked exact primary source files across all 22 milestones from 2021 through September 2, 2026.
- **Full-Text Primary Source Reader Modal (`dashboard/app.js`, `dashboard/js/modules/evidence.js`)**:
  - Fixed `openSourceModal` identifier resolution to support telegram IDs (`tg_*`), file paths (`data/telegram_archive/...`), filenames, and timeline milestone IDs.
  - Embedded full verbatim text in client datasets (`data.js`, `conflict_metrics.json`) for instant zero-latency reading offline (`file://`) and online.
  - Fixed body scroll lock cleanup on modal close.

### Added
- **Day 9 (2026-09-02) Conflict Milestones (`src/analysis_engine.py`)**:
  - Real-time morning assembly and picket status registered for Day 9 of the indefinite strike.
  - Timezone-aware date freshness verified as `UP_TO_DATE` [EMERALD] across all invariant suites.

### Technical Notes
- Full test suite: 86/86 unit tests passing.
- Invariants: 15/15 rules verified with 100% mathematical, electoral, and factual consistency.

## [016-daily-timeline-assembly-validator] - 2026-09-01

### Added
- **Daily Timeline Freshness Validator (`src/validate_timeline_freshness.py`)**:
  - Timezone-aware date arithmetic using standard library `zoneinfo` (`Europe/Madrid`).
  - Operational status classification: `UP_TO_DATE` (Green), `PENDING_TODAY` (Amber), `WEEKEND_PAUSE` (Blue), and `STALE_ALERT` (Red).
  - Strict chronological monotonicity validation and primary source document existence checks.
- **Factory Assembly Minutes & Continuous Timeline (`data/conflict_metrics.json`, `src/analysis_engine.py`)**:
  - 21 chronological conflict milestones spanning from 2021 through September 1, 2026.
  - Direct cross-linking of 12 assembly events to factory minutes in `data/telegram_archive/assembly_minutes/`.
- **Interactive Timeline Banner & Factory Filters (`dashboard/index.html`, `dashboard/app.js`, `dashboard/js/modules/union_force.js`)**:
  - Dynamic freshness banner (`#timeline-freshness-banner`) and floating Dynamic Island HUD pill (`#hud-timeline-freshness`).
  - Fast filter bar by 7 manufacturing plants and 4 actor categories.
  - Modal viewer trigger for full assembly minutes transcripts.
- **Rule 15 Invariant & CI/CD Automated Verification (`src/validate_invariants.py`, `.github/workflows/sync-news-data.yml`)**:
  - Rule 15 integrated into comprehensive invariant suite.
  - Freshness checking step added to continuous news sync GitHub Actions workflow.
  - 6 unit test suites added in `tests/test_timeline_freshness.py` bringing total unit tests to 86.

### Technical Notes
- Full test suite: 86/86 unit tests passing.
- Invariants: 15/15 rules verified with 100% mathematical, electoral, and factual consistency.

## [016-repo-wide-hardening-and-security] - 2026-09-01

### Added
- **Resilient Network Utilities (`src/network_utils.py`)**:
  - Implemented `fetch_with_retry()` with exponential backoff, jitter, timeout handling, and client-error avoidance (404/401) using Python standard library.
- **Frontend Architecture & ES6 Modularization (`dashboard/js/`)**:
  - Modularized dashboard architecture into `core.js`, `main.js`, and specialized submodules (`overview.js`, `industrial.js`, `purchasing_power.js`, `union_force.js`, `evidence.js`).
- **Automated Test Suites (`tests/`)**:
  - Created `tests/test_backend_resilience.py` validating network retries, atomic file writes, transactions, and fallback handling.
  - Created `tests/test_security_sanitization.py` enforcing XSS prevention and safe external link attributes.

### Changed
- **Frontend Security Hardening (`dashboard/app.js`, `dashboard/index.html`)**:
  - Systematically sanitized all dynamic DOM renderers using `escapeHTML()` and `sanitizeURL()`.
  - Added `rel="noopener noreferrer"` across all external links with `target="_blank"`.
  - Replaced blocking `alert()` dialogs with non-blocking toast notifications.
- **CI/CD Pipeline Optimization (`.github/workflows/`)**:
  - Added npm and pip caching to `test.yml`, `deploy.yml`, and `sync-news-data.yml`.
  - Added comprehensive syntax and compilation checks (`python3 -m py_compile`, `node -c`) for Python and JavaScript bundles.
- **Backend Atomic Writes**:
  - Migrated `src/beluga_tracker.py`, `src/sentiment_thermometer.py`, `src/telegram_channel_sync.py`, and `src/notebooklm_sync.py` to use atomic JSON persistence (`atomic_write_json`).

### Technical Notes
- Full test suite passed: 77/77 tests passing.
- Invariants & Sources: 14/14 rules verified with 100% mathematical consistency.

## [015-beluga-last-movements] - 2026-09-01

### Added
- **Recent Beluga Flight Movements Feed (User Story 1 - MVP)**:
  - Implemented `#sec-industrial-movements` container and `#beluga-movements-container` in Module 2 (`#tab-industrial`).
  - Added `renderBelugaMovements()` in `dashboard/app.js` displaying verified flight legs sorted newest first with route corridors, flight status badges, timestamps, component payloads, and Getafe embargo indicators.
  - Created `BelugaMovement` schema and integrated `get_recent_movements()` in `src/beluga_tracker.py` combining live airborne flights and calibrated European legs.
- **Interactive Airframe & Corridor Filtering (User Story 2)**:
  - Linked `setBelugaTailFilter()` in `dashboard/app.js` to synchronously re-filter both `#beluga-fleet-grid` and `#beluga-movements-container` across `ALL` and individual BelugaXL airframes (`XL1`..`XL6`).
  - Added dynamic empty-state feedback with active filter indicators.
- **Resilient Background Polling & Calibrated Fallback (User Story 3)**:
  - Integrated seamless movement updates into 30s background live polling (`startBelugaLivePolling()`) with zero DOM flicker.
  - Provided deterministic calibrated fallback data for offline and demo environments.
- **Dynamic Multi-Platform Social & Media Feed (Relocated to Evidencias)**:
  - Relocated `#sec-evidence-media-feed` to Module 5 (`#tab-evidence`), keeping Module 2 100% focused on industrial Beluga logistics.
  - Enhanced `src/sentiment_thermometer.py` with multi-platform real-time syndication across Twitter/X, Reddit, Threads, Telegram, and press.
  - Added platform pills (`Todas las Redes`, `Twitter / X`, `Reddit`, `Threads`, `Telegram`, `Prensa`) and impact filters (`🔴 Palanca Huelga`, `🟢 Spin Empresa`).

### Technical Notes
- All 14 mathematical invariants and 62 unit/integration tests verified passing with zero regressions.

## [014-isolate-and-validate-beluga-engine] - 2026-09-01

### Added
- **Dedicated & Autonomous Beluga Logistics Tracking (User Story 1 - MVP)**:
  - Completely decoupled `src/beluga_tracker.py` from sentiment analysis and news scraper workflows, eliminating all query and background task dependencies.
  - Implemented standalone CLI commands (`--update`, `--json`) and resilient local schema ingestion via `src/parsers/metric_parser.py`.
  - Added autonomous 30-second background live polling cycle in `dashboard/app.js` (`startBelugaLivePolling()`) with robust fallback caching.
- **Real-Time Fleet Telemetry & European Disruption Matrix (User Story 3)**:
  - Integrated live ADS-B radar tracking across all 6 Airbus Transport International BelugaXL aircraft (`F-GXLG` through `F-GXLO`).
  - Added interactive tail filters (`ALL`, `XL1`..`XL6`) in `dashboard/app.js` (`setBelugaTailFilter()`) and dynamic aircraft card rendering (`#beluga-fleet-grid`).
  - Implemented European Route Disruption Matrix (`#beluga-routes-grid`) showing operational status of intra-European corridors vs. 100% Getafe blockade.
  - Grounded factory logistics bottleneck in cited primary assembly minutes (`sources/721c0baa.txt`).

### Changed & Removed
- **Elimination of Fabricated Historical Charts & Synthetic Arrays (User Story 2)**:
  - Completely removed `#belugaHistoryChart` canvas from `dashboard/index.html` and deleted its Chart.js rendering configuration from `dashboard/app.js`.
  - Deleted all synthetic weekly series (`period_definitions`, `getafe_flights_per_week`, `accumulated_htp` curves) from `src/beluga_tracker.py`, upholding the core project constitution (*Zero Unverified Data*).
  - Split `initThermometerAndBeluga()` into independent `initBelugaLogistics()` and `initThermometer()` functions.

### Technical Notes
- 100% offline fallback compatibility with calibrated model.
- Validated against all 14 mathematical invariants and 58 automated unit/integration tests with zero errors.

## [013-custom-wage-proposal-builder] - 2026-09-01

### Added
- **Dynamic Custom Salary Proposal Builder & Simulator (User Story 2)**:
  - Added in-card interactive controls inside Card 3 (`#sc3-custom`): Dual keyboard-writable numeric inputs paired with range sliders for initial wage increase ($S_1\%$) and retroactive arrears (€), quick chips (`0€`, `2k€`, `4k€`, `7.5k€`, `10k€`), RSG inflation protection modes (`100% IPC`, `IPC + Margen`, `Tasa fija`), IPC linkage toggle, custom margin input ($\pm\Delta\%$), and configurable hyperinflation cap input.
  - Added 3 instant one-click presets: *Pérdida Cero* ($r_0 = \text{IPC}$, 0 € arrears), *Recuperación 2030* (solved $r^*$ horizon rate + 5.000 € arrears + IPC + 1%), and *Equilibrio* (8,0% initial + 4.000 € arrears + 3% cap).
  - Implemented client-side compounding engine `evaluateAnnualRaise()` and recovery horizon solver `solveRecoveryInitialRaise()` executing in $<20\text{ ms}$.
- **Canonical Offers & Fictional SIMA Offer Elimination (User Story 1 - MVP)**:
  - Eliminated hardcoded references to unverified 9.5% SIMA wage figures across codebase and dashboard.
  - Standardized canonical benchmark scenario cards: *Oferta Patronal (+5% Fraccionado)* and *Plataforma del Comité (+12% Íntegro en Tablas)*.
  - Added explicit algebraic formula tooltips (`.math-tip`) across all 3 comparison cards detailing April Effect deductions, inflation decay, compounding factors $(1+r)^t$, deflators $(1+i)^t$, and net tax adjustments.
- **Differential KPIs & Multi-Series Chart Reactivity (User Story 3)**:
  - Replaced SIMA differential KPI card with *Tu Propuesta Personalizada vs. Oferta Patronal (+5%)* calculating 5-year nominal and real purchasing power differentials.
  - Updated `#salaryEvolutionChart` and `#wagesChart` datasets with dynamic live-updated series for custom proposals (Cyan `#38bdf8`).

### Fixed
- Replaced rigid dropdowns with bidirectional keyboard-writable numeric inputs in the custom proposal builder and locked chart reactivity.
- Added comprehensive mathematical transparency tooltips across all proposal scenario cards.

### Technical Notes
- Preserved 100% mathematical invariant integrity across all 14 validation rules.
- Fully compatible with shared URL parameters for instant scenario restoration.
## [012-salary-simulator-redesign] - 2026-09-01

### Added
- **3-Proposal Scenario Cards with Pure CSS Math Tooltips (User Story 1 - MVP)**:
  - Replaced crowded text breakdown with 3 responsive scenario cards: *Oferta Patronal Airbus (+5% Fraccionado)*, *Preacuerdo SIMA (+9,5% Consolidado)*, and *Plataforma del Comité (+12,0% en Tablas)*.
  - Added pure CSS monospace formula tooltips (`.math-tip`) displaying algebraic calculations for Year 1 Salary ($S_1 = S_0 \times (1 + r)$), monthly net raises, 5-year deflated real purchasing power, arrears, RSG revision clauses, and total net benefit.
- **Interactive Year-by-Year Wage Evolution Chart (User Story 2)**:
  - Added `#salaryEvolutionChart` (Chart.js) rendering 6-year trajectory lines (2025–2030) comparing the 3 proposals against inflation decay, including shaded area for unhedged real wage erosion.
  - Integrated chart lifecycle with `renderResilientChart()` and reactive updates on salary, shift, seniority, and CPI adjustments.
- **Compact Strike ROI Calculator & Differential 5-Year KPIs (User Story 3)**:
  - Added streamlined strike sacrifice calculator vs. permanent table gain (amortization in ~1.6–1.9 months).
  - Integrated differential KPI summary cards highlighting 5-year cumulative gains (*Comité vs. Empresa* and *SIMA vs. Empresa* in nominal and real terms).

### Changed
- Streamlined `#tab-purchasing-power` layout by removing redundant 14-row breakdown tables and disconnected audit blocks.

### Technical Notes
- Zero external tooltip dependencies: pure CSS hover/focus popup with touch support for mobile viewports.
- Maintained 100% mathematical and constitutional invariant integrity across all 14 validation rules.

## [010-sync-telegram-news-notebooklm] - 2026-08-31

### Added
- **Autonomous Telegram Document Extraction & Dual Cataloging (User Story 1 - MVP)**:
  - Implemented `src/telegram_channel_sync.py` to scan `data/telegram_archive/` subdirectories (`assembly_minutes`, `legal_filings`, `dossiers`, `documents`) and catalog all files.
  - Automated categorization across 5 critical legal and labor domains: *Actas de Asamblea*, *Jurídico & Sentencias*, *Dossiers & Tablas*, *Planes de Mantenimiento*, and *Comunicados & Huelga*.
  - Generated verified chronological catalog at `data/telegram_archive/telegram_index.json`.
- **Dynamic Multi-Source RSS & Sentiment Pressure Thermometer (User Story 2)**:
  - Enhanced `src/sentiment_thermometer.py` with multi-source Google News RSS ingestion across aerospace and labor queries with resilient local fallbacks.
  - Calculated real-time conflict temperature ($18.0^\circ\text{C} \le T \le 96.5^\circ\text{C}$) based on strike leverage and corporate spin ratios.
  - Maintained live telemetry synchronization with `data/thermometer_data.json` and `data/sync_status.json`.
- **NotebookLM Ingestion Engine & Soft Fallback (User Story 3)**:
  - Enhanced `src/upload_to_notebooklm.py` with graceful fallback when API credentials are unconfigured, ensuring automated CI runs succeed without failing deployment.
  - Automated generation and validation of BOE agreements (V & VI Convenios Colectivos) and econometric loss dossiers for NotebookLM upload.
  - Configured high-frequency cron scheduling (`0 6-20/2 * * *` and `0 0 * * *`) and workflow dispatch in `.github/workflows/sync-news-data.yml`.
- **Comprehensive Test Suite & Pipeline Verification**:
  - Added `tests/test_sync_pipeline.py` covering directory structures, JSON schemas, temperature bounds, and workflow configuration.

## [009-liquid-glass-ui-redesign] - 2026-08-31

### Added
- **AMOLED Black (#000000) & Liquid Crystal 2.0 Glassmorphism Design System (User Story 1 - MVP)**:
  - Transformed entire dashboard viewport and cards to pure AMOLED Black (`#000000`) with high-fidelity glassmorphism (`backdrop-filter: blur(24px) saturate(180%)`), specular highlight borders (`rgba(255, 255, 255, 0.12)`), and aerodynamic micro-glows (`glow-cyan`, `glow-emerald`, `glow-rose`).
  - Implemented modern international typography hierarchy featuring Geist Sans / Inter Display and Geist Mono / JetBrains Mono with tabular font alignment (`tabular-nums`) for jitter-free data readouts.
- **Spatial Disaggregation & 8pt Grid Hierarchy (User Story 2)**:
  - Re-structured Tab 0 (Portal Hub), Tab 1 (Financial Center), and Tab 3 (Purchasing Power) with decoupled atomic cards, generous spatial padding (`gap-6` to `gap-8`), and distinct contextual zones eliminating visual cognitive fatigue.
- **Dynamic Island HUD & Quick Salary Calculator Drawer (User Story 3)**:
  - Added `#floating-hud` top Dynamic Island pill with live conflict status, loss counter, quick action triggers, and scroll-to-top automation.
  - Added `#quick-calc-drawer` slide-over drawer providing instant salary deduction and platform recovery calculations with synchronized two-way reactive controls.
- **Dark Theme Chart.js Aesthetic Alignments & DOM Regressions**:
  - Configured global Chart.js dark-theme typography, subtle gridlines (`rgba(255, 255, 255, 0.05)`), and glassmorphic tooltips across all 12 analytical charts.
  - Added comprehensive automated regression assertions in `tests/test_dashboard_ui.py` covering all design tokens, fonts, HUD components, and drawer controllers.

## [008-compare-salary-proposals] - 2026-08-31

### Added
- **Multi-Proposal Gross Annual Wage Evolution Simulator (User Story 1 - MVP)**:
  - Analytical engine function `get_salary_proposals_comparison(base_salary, cpi_rate)` in `src/analysis_engine.py` projecting 5-year gross nominal and real (CPI-deflated) salary trajectories across Airbus SE offer, CGT platform, and Strike Committee 11-point platform.
  - Client-side reactive simulator `calculateSalaryProposals(baseSalary, ipcRate)` in `dashboard/app.js` with dynamic two-way data binding to salary and IPC sliders.
  - 3-proposal comparison table and metrics in Module 3 (`#tab-purchasing-power`) of `dashboard/index.html`.
- **Comprehensive 10-Dimension Comparative Bargaining Matrix (User Story 2)**:
  - Standardized 10-dimension comparison matrix (`salary_proposals_comparison.comparison_matrix`) in `data/conflict_metrics.json` and `dashboard/data.js` covering base salary, arrears, revision clause, telework, working hours, employment guarantees, seniority, healthcare, strike sanctions, and union oversight.
  - Dynamic renderer `renderSalaryProposalsMatrix()` in `dashboard/app.js` injecting interactive table rows with status badges and primary source citations.
  - Sub-Section 5 in `dashboard/index.html` presenting the full 10-dimension bargaining contrast.
- **Interactive 4-Series Salary Visualization & Differential KPI Cards (User Story 3)**:
  - Multi-line Chart.js visualization in `wagesChart` with 4 distinct series: Plataforma CGT (+14%), Comité de Huelga (+12%), Oferta Empresa (+5%), and Real CPI Inflation Baseline.
  - 5-year cumulative differential KPI summary cards highlighting net gains vs. Airbus SE offer (+46.2k€ for CGT, +43.6k€ for Strike Committee).
- **Comprehensive Test Suite & Invariant Validation**:
  - Unit tests in `tests/test_analysis_engine.py` verifying year-by-year nominal/real compounding and delta inequalities ($C_{\text{CGT}} > C_{\text{Comité}} > C_{\text{Empresa}}$).
  - DOM assertion tests in `tests/test_dashboard_ui.py` confirming HTML elements, containers, and JS function lifecycle bindings.

### Changed
- Re-aligned `dashboard/app.js` chart lifecycle to synchronously update 4 wage datasets upon slider movements without lag or canvas collisions.
- Synchronized fallback fixtures and canonical JSON exports across `data/conflict_metrics.json` and `dashboard/data.js`.

## [007-dynamic-data-and-charts-resilience] - 2026-08-31

### Added
- **Dynamic Chronology & Temporal Derivation Engine**: Real-time calculation of elapsed conflict days, daily burn rate (22.7 M€/day), and cumulative financial loss without static hardcoded dates.
- **Centralized Resilient Chart.js Lifecycle Manager**: `renderResilientChart(canvasId, configBuilder)` helper with registry-backed destruction preventing canvas collisions and memory leaks across all 12 analytical charts.
- **Instant Chart Rendering Engine**: Disabled Chart.js animation easing loops (`duration: 0`) and removed artificial `setTimeout` delays in `switchTab()` for instantaneous sub-16ms chart displays.
- **Dynamic Document & Archive Index Aggregator**: Automated derivation of total Telegram documents, factory breakdown, and primary sources in Module 5 and sidebar badges.
- **Integration & UI Test Suites**: Added `tests/test_dynamic_metrics.py` and `tests/test_chart_resilience.py` bringing total test suite to 47 tests.

### Changed
- Refactored all 12 Chart.js visualizations (`asymmetryChart`, `airbusStockChart`, `companyRevenueChart`, `companyDeliveriesChart`, `shareholderPieChart`, `belugaHistoryChart`, `wagesChart`, `unionShareChart`, `unionEvolutionChart`, `siteDelegatesChart`, `referendumPieChart`, `referendumSitesChart`) to route through `renderResilientChart`.
- Updated `dashboard/app.js` background auto-sync engine to preserve active user form inputs (wage simulator, asymmetry sliders) during live data re-sync.
- Embedded local offline baseline data (`window.CONFLICT_DATA` and `window.SOURCES_DATA`) in `dashboard/data.js` for 100% offline file:// compatibility with zero blank screen glitches.

### Fixed
- **Stock Market Delatas & Milestones (`fix-stock-chart-values`)**: Calculated exact session deltas ($\Delta_{\text{DoD}}$) and cumulative peak drops ($\Delta_{\text{Peak}}$), replacing static HTML cards with dynamic `#stock-milestones-container`.
- **Chart Render Latency (`instant-chart-rendering`)**: Eliminated ~1.1s lag on tab transitions and slider interactions by executing synchronous zero-delay chart rendering.

## [005-modular-dashboards-portal] - 2026-08-31

### Added
- **Welcome Portal Hub & Visual Site Map (`tab-portal` / `#portal`)**: Landing interface featuring founding mission principles, 4 executive flash KPIs (15,562 workers, -14.4B€ market delta, 60h buffer, -26,027€ loss), and an interactive 5-card navigation grid to decoupled analytical modules.
- **Dynamic Beluga Logistics & Component Retention (`004-beluga-dynamic-metrics`)**: Algorithmic derivation of weekly ADS-B flight throughput, accumulated Getafe HTP component retentions, and FAL buffer exhaustion rates from flight logs.
- Unit test suite in `tests/test_beluga_tracker.py` validating dynamic formulas and schema conformance, bringing total test suite to 36 tests.

### Changed
- Refactored `src/beluga_tracker.py` and `src/parsers/metric_parser.py` replacing static arrays with dynamic calculations.
- Updated `dashboard/app.js` and `dashboard/index.html` to establish `tab-portal` as default route with direct shorthand aliases (`#financiero`, `#logistica`, `#salarios`, `#sindical`, `#evidencias`).
- Updated `tests/test_dashboard_ui.py` and `src/validate_sources.py` validating 6-tab routing matrix and DOM integrity.

## [006-sync-strike-data-updates] - 2026-08-31

### Added
- **Interactive Validation Gate**: Autonomous manifest generator in `src/parsers/telegram_parser.py` parsing SIMA filings, 11-point platforms, and assembly resolutions.
- Ingestion review CLI in `src/data_ingestion.py` (`--interactive-review`, `--apply-all`) with itemized Markdown diff table and atomic commit.
- Sensitive information badging: high-contrast Amber badge CSS tokens (`.badge-sensitive`) and tooltip helpers in `dashboard/index.html` and `dashboard/app.js`.
- Dynamic 11-Point Strike Committee Platform section in the Purchasing Power & Negotiation dashboard tab.
- Comprehensive unit tests in `tests/test_data_ingestion.py` and `tests/test_dashboard_ui.py` bringing total suite to 31 tests.

### Changed
- Synchronized canonical datasets (`data/conflict_metrics.json`, `dashboard/data.js`, `docs/Guia_Estrategica_Negociacion_Huelga_Airbus_2026.md`) with latest SIMA 27/08 terms (7,500 € lump-sum, 12% retroactive table increase, IPC+1.5%).
- Extended `AtomicTransaction` in `src/atomic_writer.py` with Python context manager protocol (`__enter__` / `__exit__`).
- Enhanced `src/parsers/config_loader.py` with polymorphic `get_source_by_id` and environment overrides.

## [003-simplify-dashboard-patch1] - 2026-08-31

### Added
- **Constitution Principle VI**: *Viewport & Canvas Lifecycle Management* requiring `scrollTop = 0` and `.resize()` handlers.
- Static HTML DOM hierarchy & tag balancer in `src/validate_sources.py`.
- Dedicated UI & lifecycle integration test suite (`tests/test_dashboard_ui.py`) bringing suite to 25 tests.

### Fixed
- Repaired DOM hierarchy mismatch in Module 3 (`tab-purchasing-power`) restoring full-width `wagesChart` rendering.
- Resolved scroll retention on tab switch by resetting `mainContainer.scrollTop = 0`.
- Fixed Chart.js canvas resize glitch on tab transitions.

## [003-simplify-dashboard] - 2026-08-31

### Added
- 5 unified thematic modules consolidating 15 disparate tabs:
  1. `Centro de Mando & Asimetría` (Overview, Stock AIR.PA, Airbus Financials).
  2. `Impacto Industrial & Logística` (JIT Buffers, Beluga Flight Monitor, Thermometer).
  3. `Poder Adquisitivo & Negociación` (Wage Simulator, BOE Losses, Offer Gaps, 11 Points).
  4. `Fuerza Sindical & Asamblea` (198 Delegates Map, 24-J Referendum, Chronology, Workflows).
  5. `Documentación & Evidencias` (269 Sources Annex, Telegram Archive, Benchmarks).
- High-contrast responsive typography, mobile navigation drawer, and Chart.js canvas resize lifecycle.

### Changed
- Refactored `dashboard/app.js` `switchTab()` controller with backward-compatible aliases.
- Updated `src/validate_sources.py` scanner to enforce 5-tab structure and 12 canvas elements.

### Removed
- Legacy "Auditor 6 Filtros Urna" (`tab-checklist`) component and redundant micro-filters.

## [002-verify-stock-data] - 2026-08-31

### Added
- Repository-wide data veracity audit script (`src/audit_data_veracity.py`).
- Rules 12, 13, and 14 in `src/validate_invariants.py` for stock bounds, primary source completeness, and zero unverified data gates.
- Strict data integrity contract (`specs/002-verify-stock-data/contracts/data-integrity-contract.json`).

### Changed
- Grounded all stock market metrics to Euronext Paris (AIR.PA / ISIN NL0000235190) and Airbus Investor Relations.
- Synchronized `dashboard/data.js` and `data/conflict_metrics.json` with zero numerical drift.

## [001-autonomous-data-updates] - 2026-08-31

### Added
- Externalized data source configuration registry (`config/sources.json`) with environment variable overrides.
- Multi-source modular parsers in `src/parsers/` (Telegram archives, RSS feeds, Beluga logistics, economic APIs).
- Atomic file transactions and automatic rollback protection in `src/atomic_writer.py`.
- Unified data ingestion CLI coordinator in `src/data_ingestion.py` supporting `--run-once`, `--daemon`, and interval scheduling.
- Real-time client-side HTTP polling (30s cadence) and live sync health indicator badge in `dashboard/index.html` and `dashboard/app.js`.
- Automated unit and integration test suite in `tests/test_data_ingestion.py`.

### Changed
- Updated scheduled GitHub Actions workflow `.github/workflows/sync-news-data.yml` to trigger autonomous ingestion.
- Enhanced `dashboard/app.js` to dynamically handle `sync_status.json` states (`healthy` vs `degraded`).

### Technical Notes
- Enforces strict invariant validation (`src/validate_invariants.py`) prior to committing dataset updates.
- Adheres to 100% primary source citation grounding across all metrics and documents.
