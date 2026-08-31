# Feature Specification: Full Audit, Verification & Purge of Unverified Airbus Stock Data

**Feature Branch**: `002-verify-stock-data`  
**Created**: 2026-08-31  
**Status**: Draft  
**Input**: User description: "la parte de los valores de las acciones de airbus es incorrecta, los valores historicos son incorrectos, deben ser todos los valores e información verificados y los valores correctos, un pequeño fallo en alguna de la información que aparece la web, puede quitar toda la credebilidad de la misma, que es de especial sensibilidad, si existen datos no verificados o incorrectos, mejor que no esten"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Full Audit & Purge of Unverified Stock Values (Priority: P1) 🎯 MVP

As an analyst, union representative, or public observer inspecting the Airbus conflict dashboard, I need all equity and stock market figures to be 100% accurate and strictly verified against official market registries, so that zero unverified, synthetic, or inaccurate historical stock values appear on the website and compromise its credibility.

**Why this priority**: Absolute credibility is paramount for a labor dispute analytics suite. A single incorrect, synthetic, or unverified number destroys institutional trust. The core policy is: *if any data is unverified or incorrect, it must be purged immediately*.

**Independent Test**: Can be verified by running a full audit on `data/conflict_metrics.json`, `dashboard/data.js`, `dashboard/app.js`, `dashboard/index.html`, and `docs/` to confirm that 0 unverified or synthetic daily stock price points exist in the active dataset.

**Acceptance Scenarios**:

1. **Given** the historical stock data series in the platform, **When** audited against official Euronext Paris / Airbus IR publications, **Then** all unverified, estimated, or fabricated historical daily stock figures are removed or replaced with authentic, timestamped closing quotes.
2. **Given** any metric displayed in the web dashboard's Stock Market tab (`tab-stock`), **When** inspected by a user or third-party auditor, **Then** each number (closing price, market cap, shares outstanding, financial ratios) maps directly to verified official filings with zero speculative gaps.
3. **Given** an unverified or uncertain financial figure, **When** processed by the ingestion or presentation engines, **Then** the system omits the unverified figure rather than presenting an estimate.

---

### User Story 2 - Strict Verification & Grounding of Canonical Market Metrics (Priority: P2)

As a stakeholder reviewing the financial asymmetry analysis, I need the canonical Airbus SE market metrics (Ticker AIR.PA, ISIN NL0000235190, shares outstanding ~792.3M, official 2024–2026 fiscal figures) to be rigorously documented, mathematically consistent, and backed by direct primary source URLs.

**Why this priority**: Demonstrating the financial asymmetry between worker demands (e.g. 118.0 M€) and company capital destruction requires undeniable mathematical precision rooted in official corporate disclosures (Airbus SE Annual Reports and Euronext Paris).

**Independent Test**: Can be verified by running `src/validate_invariants.py` and `src/validate_sources.py` to confirm that all market cap calculations ($P \times S$), financial destruction ratios, and official IR links validate with zero errors.

**Acceptance Scenarios**:

1. **Given** the canonical share count ($S = 792,300,000$ shares) and verified market closing prices, **When** market capitalization is calculated, **Then** the resulting value matches $P \times S$ with exact precision and references the Euronext Paris product sheet.
2. **Given** financial balance metrics (EBIT Adjusted 7,100 M€, Net Income 4,960 M€, Dividends Paid 2,535.3 M€), **When** displayed in the company solvency and stock sections, **Then** they reference Airbus SE Full-Year 2025 financial disclosures.

---

### User Story 3 - Automated Market Data Invariant Gates (Priority: P3)

As a maintainer of the analysis pipeline, I need automated validation rules that gate all future market data updates, ensuring no unverified stock price or mismatched market cap can be committed or rendered.

**Why this priority**: Prevents future regressions or accidental insertion of unverified data during automatic data ingestion or manual edits.

**Independent Test**: Can be verified by running `python3 -m unittest discover tests` and `python3 src/validate_invariants.py`, including new automated tests checking that every market data object contains verified primary source links and adheres to algebraic invariants.

**Acceptance Scenarios**:

1. **Given** an ingestion run with updated market quotes, **When** invariant validation runs, **Then** it validates the price bounds, market cap formula, share count consistency, and primary source URL.
2. **Given** any broken or missing citation on a stock metric, **When** `src/validate_sources.py` runs, **Then** the validation fails and blocks the release.

---

### Edge Cases

- **Lack of Official Intraday/Daily Historical Granularity**: If official historical daily price tables for specific past dates cannot be authenticated with a verified primary source citation, the system MUST collapse or purge the unverified daily points, presenting only verified snapshot dates or official quarterly/annual market milestones.
- **Corporate Action or Share Count Changes**: If Airbus SE executes share buybacks, ESOP issuances, or capital reductions, the system MUST source the updated share count strictly from official AGM / Universal Registration Documents and update the invariant baseline.
- **Third-Party API Discrepancies**: If a financial feed returns an unverified or delayed quote that contradicts official Euronext closing data, the official Euronext Paris closing price takes absolute precedence.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST conduct a comprehensive audit across all datasets (`data/conflict_metrics.json`, `data/telegram_archive/`, `dashboard/data.js`), scripts (`src/`), and UI templates (`dashboard/index.html`, `dashboard/app.js`) to identify and purge all unverified, simulated, or inaccurate historical stock values.
- **FR-002**: System MUST enforce the **Zero Unverified Data Policy**: any financial figure or historical series that cannot be 100% verified against primary sources (Euronext Paris, Airbus Investor Relations, BME, or official audit filings) MUST be completely removed from the platform.
- **FR-003**: System MUST standardize the canonical equity metrics for Airbus SE:
  - Ticker: `AIR.PA` (Euronext Paris) / `AIR.MC` (Bolsas y Mercados Españoles)
  - ISIN: `NL0000235190`
  - Nominal Capital & Outstanding Shares: Verified against Airbus SE Annual Report & Financial Statements ($792.3\text{M}$ to $793.0\text{M}$ ordinary shares).
- **FR-004**: System MUST verify and document the exact primary source URL for every displayed stock metric, linking directly to Euronext Paris Live Market Data (`https://live.euronext.com/en/product/equities/NL0000235190-XPAR`).
- **FR-005**: The interactive Stock Market chart in `dashboard/app.js` and `dashboard/index.html` MUST render ONLY verified, authenticated market price milestones, with clear visual tooltips identifying the primary source and event for each data point.
- **FR-006**: The financial asymmetry calculation (comparing market cap variations against the annual cost of the union platform) MUST be explicitly defined, algebraically exact ($\Delta \text{MarketCap} = \Delta P \times S_{\text{total}}$), and fully transparent in its methodology.
- **FR-007**: System MUST extend `src/validate_invariants.py` with explicit invariant rules validating market data integrity (e.g. verifying $P > 0$, $S_{\text{total}} \in [790\text{M}, 795\text{M}]$, $\text{MarketCap} = P \times S$, and non-null verified primary source link).
- **FR-008**: System MUST update the PDF guide and Markdown dossier (`docs/Guia_Estrategica_Negociacion_Huelga_Airbus_2026.md`) to ensure 100% textual and numerical parity with the audited market dataset.

---

### Key Entities

- **AirbusStockMarketSnapshot**: Canonical market state container containing verified closing price, pre-conflict baseline price, 52-week high/low, total shares outstanding, calculated market capitalization, and primary source URL.
- **VerifiedMarketMilestone**: Discrete historical market data point consisting of verified date, official closing price (€), trading volume (if authenticated), verified event description, and primary source citation.
- **FinancialAsymmetryMetric**: Mathematical model quantifying the ratio between corporate market capitalization impact and the annual investment required to fulfill union collective bargaining demands.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: **0 unverified data points**: 100% of stock prices, market capitalizations, and equity figures across the entire repository are verified against official primary sources.
- **SC-002**: **100% Citation Grounding**: Every stock metric displayed on the web dashboard or mentioned in documentation contains an actionable primary source link to Euronext Paris or Airbus SE Investor Relations.
- **SC-003**: **100% Invariant Compliance**: Invariant validator `src/validate_invariants.py` confirms exact mathematical consistency across all stock KPIs and ratios without exception.
- **SC-004**: **Complete Presentation Parity**: `data/conflict_metrics.json`, `dashboard/data.js`, `dashboard/index.html`, and `docs/` display identical, audited stock values with zero discrepancies.
- **SC-005**: **Zero Fallacy / Zero Speculation Guarantee**: In the absence of an official record for a specific date, no speculative interpolation is shown; the system renders only verified milestone quotes.

---

## Assumptions

- **Market Source Authority**: Euronext Paris (`ISIN: NL0000235190`, Symbol: `AIR.PA`) is the primary listing market and authoritative reference for Airbus SE equity prices.
- **Corporate Financial Authority**: Airbus SE Full-Year 2024 and 2025 Consolidated Financial Statements and AGM notices provide authoritative baseline figures for share capital and financial results.
- **Editorial Sensitivity**: The website is an econometric analysis tool for a live labor negotiation; factual accuracy and source transparency are non-negotiable prerequisites for public credibility.
