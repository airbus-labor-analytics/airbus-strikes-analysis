# Changelog

All notable changes to the Airbus Spain 2026 Strike Analytics project will be documented in this file.

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
