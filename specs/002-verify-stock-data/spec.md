# Feature Specification: Full Platform-Wide Data Audit, Verification & Zero-Unverified-Data Purge

**Feature Branch**: `002-verify-stock-data`  
**Created**: 2026-08-31  
**Status**: Draft  
**Input**: User description: "no solo ha de ser con los valores de las acciones, tiene que ser con todos los datos que aparecen en la web. Un pequeño fallo en alguna de la información que aparece la web, puede quitar toda la credibilidad de la misma, que es de especial sensibilidad, si existen datos no verificados o incorrectos, mejor que no estén"

---

## Clarifications

### Session 2026-08-31
- Q: Should the data audit and zero-unverified-data purge apply exclusively to stock figures or across all web metrics? → A: **Whole-Platform Scope**: Every metric, table, chart, census number, delegate matrix, referendum tally, wage simulation parameter, Beluga flight log, timeline event, and assembly summary across the entire website, JSON datasets, and documentation must be audited and verified against authenticated primary sources. Any unverified or inaccurate data point must be purged immediately to guarantee 100% institutional credibility.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Whole-Platform Data Audit & Purge of Unverified Content (Priority: P1) 🎯 MVP

As an analyst, union delegate, worker, or public observer accessing the Airbus Spain Strike Analytics Suite, I need every single figure, chart, table, and claim across all 15 dashboard tabs and reports to be 100% verified against primary sources, with all unverified, speculative, or synthetic figures completely purged, so that the credibility of the entire platform is unassailable.

**Why this priority**: In labor conflicts and collective bargaining analysis, even a minor discrepancy or unverified figure destroys the platform's credibility. The fundamental governing rule is: *if any data point is unverified or incorrect, it MUST NOT exist on the web*.

**Independent Test**: Can be verified by running a repository-wide data audit script across `data/`, `src/`, `dashboard/`, and `docs/`, confirming that 0 unverified or synthetic numbers remain in canonical datasets or client presentation templates.

**Acceptance Scenarios**:

1. **Given** all dataset files (`data/conflict_metrics.json`, `data/beluga_status.json`, `data/thermometer_data.json`, `data/telegram_archive/`), **When** audited against primary sources (BOE, SIMA, Euronext, Airbus IR, INE), **Then** all unverified, estimated, or fabricated data points are completely removed or replaced with authentic, verified facts.
2. **Given** any metric displayed in any tab of the web dashboard (Overview, Stock Market, Solvency, Plant Census, Union Representation, Wage Simulator, Beluga Logistics, Timeline, Telegram Archive, Legal Dossier), **When** inspected by a user, **Then** every single value is traceable to an official primary source URL or document excerpt.
3. **Given** an unverified or uncertain figure, **When** processed by the ingestion engine or rendered on the dashboard, **Then** the system omits the figure entirely rather than displaying an unverified approximation.

---

### User Story 2 - Rigorous Primary Source Grounding Across All 15 Dashboard Domains (Priority: P2)

As a negotiator or journalist reviewing the dossier and dashboard, I need every domain area (Plant Census: 15,562 workers, 198 delegates; 24-J Referendum: 6,229 NO vs 5,860 YES; Historical Purchasing Power Loss: -28,085 € gross; Airbus 2025 Financials: 73.4B€ revenue, 7.1B€ EBIT, 4.96B€ profit; Stock AIR.PA: Euronext Paris data) to display direct, clickable primary source links.

**Why this priority**: Transparency and rigorous source citations prevent misinformation claims and provide verifiable evidentiary grounding for all union arguments and economic models.

**Independent Test**: Can be verified by running `python3 src/validate_sources.py` and checking that 100% of sections, benchmarks, and interactive charts contain verified primary source citations that resolve successfully.

**Acceptance Scenarios**:

1. **Given** plant census numbers (Getafe, Illescas, Puerto Real, San Pablo, Tablada, CBC, Albacete), **When** viewed on the Plant & Union Map tab, **Then** they match official 2023–2024 Comité de Empresa election certificates.
2. **Given** wage loss simulations and cumulative inflation figures (2020–2025: 18.25% IPC vs 12.0% convenios), **When** computed in the simulator, **Then** the IPC rates match official INE historical series and BOE collective agreements (V & VI Convenio Colectivo Airbus).

---

### User Story 3 - Automated Whole-Dataset Invariant Gates & Regression Protection (Priority: P3)

As a maintainer of the analysis platform, I need comprehensive automated validation rules in `src/validate_invariants.py` and `src/validate_sources.py` covering all data domains, preventing any unverified, unbalanced, or mathematically inconsistent metric from being committed or deployed.

**Why this priority**: Ensures that future data ingestion cycles or content updates automatically enforce the Zero Unverified Data Policy and mathematical integrity rules.

**Independent Test**: Can be verified by running `python3 -m unittest discover tests`, `python3 src/validate_invariants.py`, and `python3 src/validate_sources.py`, passing with 100% compliance across all 11+ mathematical and factual invariant rules.

**Acceptance Scenarios**:

1. **Given** any new or updated dataset, **When** `src/validate_invariants.py` executes, **Then** it validates plant census sums, union delegate balances, referendum voter conservation, shareholder structure sums, market cap formulas ($P \times S$), financial statement balances, and wage loss arithmetic.
2. **Given** any missing citation link, unverified field, or mathematical discrepancy, **When** validation executes, **Then** the process immediately aborts the update and flags the exact unverified item.

---

### Edge Cases

- **Unavailable Historical Granularity (Stock, Logistics, Assemblies)**: When official daily records for specific past dates cannot be authenticated with a verified primary source citation, the system MUST NOT interpolate synthetic numbers; it must render only verified snapshot dates and authenticated milestones.
- **Contradictory Press Reports**: When media outlets report conflicting figures (e.g. strike participation percentages), the official SIMA minutes, Comité de Huelga official press releases, or physical ballot counts take precedence; unverified media estimates must be discarded.
- **Zero-Data Fallback**: When an entire subsection lacks verified primary source backing, the entire subsection is removed from the web dashboard and report rather than displaying ungrounded content.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST conduct a complete, exhaustive audit across all repository files (`data/`, `src/`, `dashboard/`, `docs/`) to identify and catalog every number, metric, date, name, and table.
- **FR-002**: System MUST strictly enforce the **Zero Unverified Data Policy**: any metric, chart point, table row, or text statement that cannot be substantiated with an official primary source citation MUST be purged immediately from the codebase and UI.
- **FR-003**: System MUST audit and verify all stock and market data (Ticker `AIR.PA` / Euronext Paris, ISIN `NL0000235190`, total shares outstanding ~792.3M, closing prices, and market cap math $\Delta \text{MarketCap} = \Delta P \times S_{\text{total}}$).
- **FR-004**: System MUST audit and verify all plant census and electoral data (total 15,562 workers across 7 sites; 198 delegates across CCOO, UGT, SIPA, ATP, CGT; 2D site-by-union matrix conservation).
- **FR-005**: System MUST audit and verify all referendum results (24-J Referendum: 12,674 total census, 10,317 ballots cast, 81.44% turnout; NO: 6,229 [49.15%], YES: 5,860 [46.24%], Blank: 585 [4.62%]).
- **FR-006**: System MUST audit and verify all corporate financial figures (Airbus SE 2025: Revenue 73.4B€, EBIT Adjusted 7.1B€, Net Profit 4.96B€, Dividend 3.20€/sh [2,535.3 M€ total], Gross Wage Mass 778.1 M€).
- **FR-007**: System MUST audit and verify all wage loss tables and inflation metrics (2020–2025 INE IPC real cumulative 18.25% vs 12.0% convenios; net loss table balances per worker tier).
- **FR-008**: System MUST audit and verify Beluga logistics and JIT disruption parameters (FAL buffer 48–72h, Getafe 100% HTP monopoly, fleet tracking grounded in ADS-B/flight log evidence).
- **FR-009**: System MUST audit all timeline entries and assembly minutes against authenticated files in `data/telegram_archive/`.
- **FR-010**: System MUST verify that all 12 Chart.js canvases in `dashboard/app.js` render only verified historical data points, removing all simulated or unverified daily curves.
- **FR-011**: System MUST ensure 100% textual, numerical, and citation parity between `data/conflict_metrics.json`, `dashboard/data.js`, `dashboard/index.html`, and `docs/Guia_Estrategica_Negociacion_Huelga_Airbus_2026.md`.
- **FR-012**: System MUST expand `src/validate_invariants.py` and `src/validate_sources.py` to continuously enforce whole-platform data verification and block deployment on any ungrounded metric.

---

### Key Entities

- **PlatformAuditRecord**: Record tracking every data field, its primary source URI, verification status (VERIFIED / PURGED), date of verification, and mathematical invariant constraint.
- **CanonicalMetricsRegistry**: The authoritative, 100% verified dataset container residing in `data/conflict_metrics.json`.
- **PrimarySourceCitation**: Cryptographically hashed or URL-referenced link to official publications (BOE, SIMA, Euronext, Airbus IR, INE, EASA, authenticated assembly acta).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: **0 unverified data points repository-wide**: 100% of displayed metrics, tables, and chart points are substantiated by official primary sources.
- **SC-002**: **100% Primary Source Link Coverage**: Every KPI card, chart, and table in the dashboard and report includes a functional, verified citation link.
- **SC-003**: **100% Mathematical Invariant Validation**: `src/validate_invariants.py` confirms that 100% of algebraic, census, financial, electoral, and market rules hold with 0 discrepancies.
- **SC-004**: **Dual-Surface Zero Drift**: Canonical JSON datasets, JavaScript frontend models, HTML UI components, and PDF/Markdown dossiers reflect identical numbers with 0 semantic or numerical drift.
- **SC-005**: **Zero Speculation Guarantee**: In the absence of an official record, the platform renders only verified facts and strictly suppresses ungrounded approximations.

---

## Assumptions

- **Primary Source Hierarchy**: Official gazettes (BOE), mediation records (SIMA), stock exchange filings (Euronext Paris), corporate audited financials (Airbus SE IR), and national statistics (INE) constitute absolute source authority.
- **Institutional Sensitivity**: The platform is an analytical instrument for labor dispute assessment; total veracity is the single most critical quality attribute.
