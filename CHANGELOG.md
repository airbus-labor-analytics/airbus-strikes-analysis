# Changelog

All notable changes to the Airbus Spain 2026 Strike Analytics project will be documented in this file.

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
