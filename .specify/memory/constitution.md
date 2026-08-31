<!--
Sync Impact Report
==================
- Version change: 1.0.0 → 1.1.0
- Modified principles:
  - Added VI. Viewport & Canvas Lifecycle Management
- Added sections:
  - Quality Gates updated with static HTML tag validation and UI lifecycle verification
- Removed sections:
  - None
- Deferred items / TODOs:
  - None
-->

# Airbus Strikes Analysis Constitution

## Core Principles

### I. Mathematical & Invariant Integrity (NON-NEGOTIABLE)
All strike analytics, econometrics, census numbers, delegate distributions, and financial
metrics MUST be mathematically rigorous, mutually balanced, and free of hallucinations.
Every calculation—including purchasing power loss tables, strike fund ("caja de resistencia")
burn rates, stock capital loss ratios, and the 2D site-by-union delegate matrix—MUST satisfy
exact algebraic and conservation invariants without discrepancy.

### II. Primary Source Grounding & Traceability
Every metric, historical milestone, legal clause, and assembly sentiment score MUST trace
directly to verifiable primary source documents. Valid sources include official BOE
collective agreements (Convenio Colectivo), SIMA mediation minutes, Airbus SE Investor
Relations financial reports, National Statistics Institute (INE) inflation data, and
authenticated assembly minutes. Unverified secondary claims MUST NEVER enter canonical datasets.

### III. Single Source of Truth & Dual-Surface Parity
Canonical data resides exclusively in structured datasets under `data/` (e.g.,
`conflict_metrics.json`, `beluga_status.json`, `thermometer_data.json`). Both the backend
analytical engines (`src/`) and the interactive client dashboard (`dashboard/`) MUST consume
the same underlying data schemas with zero semantic drift. Any update to metrics or models MUST
be reflected across all consuming interfaces simultaneously.

### IV. Automated Invariant & Schema Testing
Changes to analysis models, source fixtures, or data schemas MUST be guarded by automated
invariants tests (`src/validate_invariants.py`, `src/validate_sources.py`, and `tests/`).
No PR or feature branch may merge with failing invariant or source validation checks.
New metrics or models MUST define corresponding programmatic validation rules prior to adoption.

### V. Operational Simplicity & Zero-Build Dashboard
The project favors boring, robust technology: standard Python libraries for analytical
computation and pure vanilla HTML/CSS/JavaScript for the web dashboard. Complex build tools,
transpilers, and unneeded framework abstractions SHOULD be avoided unless direct platform
capabilities fall demonstrably short.

### VI. Viewport & Canvas Lifecycle Management
Every interactive dashboard view and tab switcher MUST explicitly reset container scroll
offsets (`scrollTop = 0`) and trigger responsive `.resize()` handlers on all unhidden chart
canvases to guarantee zero visual distortion, layout clipping, or label overlap across viewports.
*(Learned from: 003-simplify-dashboard retro)*

## Data Architecture & Domain Constraints

- **Data Immutability & Auditability**: Raw archives under `data/telegram_archive/` and historical legal filings MUST be preserved verbatim. Derived analytical summaries MUST be reproducible from raw fixtures via deterministic scripts.
- **Precision Standards**: Monetary metrics are denominated in Euros (€) or Millions of Euros (M€) with explicit scale definitions. Percentages MUST maintain precision consistent with official referendum and electoral tallies (e.g. 2 decimal places).
- **Domain Alignment**: Terminology and entities MUST match official Spanish labor law frameworks (Comité de Empresa, SIMA, Convenio Colectivo, Huelga Indefinida, IPC Real, Censo Electoral).

## Quality Gates & Verification Workflow

- **Pre-Commit Invariant Gate**: All updates to `data/` or `src/` MUST pass `python3 src/validate_invariants.py` and `python3 -m unittest discover tests`.
- **Source & DOM Verification Gate**: Markdown dossiers, HTML tag hierarchies, and dashboard citations MUST satisfy `python3 src/validate_sources.py` ensuring all reference domains resolve and zero unclosed HTML tags exist.
- **Visual & Functional Parity**: Dashboard UI modifications MUST be verified to ensure responsive layout, scroll reset on tab change, legible data cards, and error-free console logs.

## Governance

This Constitution supersedes all ad-hoc conventions and undocumented practices across the repository.
Amendments require explicit rationale, updated invariant tests (if applicable), and documentation in the
Sync Impact Report.

- **Amendment Policy**: Changes to core principles require a version bump (MAJOR for removals/redefinitions, MINOR for additions/expansions, PATCH for clarifications).
- **Compliance Enforcement**: Every pull request, spec, and plan MUST verify adherence to the core principles before approval.
- **Reference**: Use `.specify/memory/constitution.md` as the authoritative guideline for all Spec Kit workflows (`/speckit.specify`, `/speckit.plan`, `/speckit.tasks`, `/speckit.implement`).

**Version**: 1.1.0 | **Ratified**: 2026-08-31 | **Last Amended**: 2026-08-31
