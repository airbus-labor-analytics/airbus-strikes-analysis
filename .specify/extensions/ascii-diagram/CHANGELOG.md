# Changelog

## [1.1.0] - 2026-08-16

### Added

- `after_analyze` hook: offers a requirement↔task coverage/traceability diagram right after `/speckit.analyze` reports.
- `analyze` as a recognized `$ARGUMENTS` target for manual invocation (`/speckit.ascii-diagram.render analyze`).

### Changed

- `analyze` output is printed inline in the conversation only — never written to a file, since `analyze` is a strictly read-only command and this extension respects that constraint.

## [1.0.0] - 2026-08-16

### Added

- Initial release.
- `speckit.ascii-diagram.render` command: draws a text-based diagram (state machine, architecture, flow, or dependency graph) for the current feature's `spec.md` / `plan.md` / `tasks.md` and appends it under a clearly marked, replaceable section.
- Optional hooks on `after_specify`, `after_plan`, and `after_tasks` that offer to run the command at the point in the workflow it's most useful.
