# Changelog

All notable changes to the Airbus Spain 2026 Strike Analytics project will be documented in this file.

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
