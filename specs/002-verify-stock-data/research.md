# Research & Architectural Decisions: Full Platform-Wide Data Audit & Zero-Unverified-Data Purge

**Feature Branch**: `002-verify-stock-data`  
**Date**: 2026-08-31  

---

## 1. Primary Source Authority & Data Verification Strategy

### Decision
Establish an authoritative Primary Source Hierarchy that governs every number, metric, date, name, and table across the platform:
1. **Financial & Stock Market Data**: Official Euronext Paris market disclosures (`AIR.PA` / `ISIN NL0000235190`) and Airbus SE Investor Relations audited Full-Year 2024 & 2025 Consolidated Financial Statements.
2. **Labor, Legal & Collective Bargaining**: Boletín Oficial del Estado (BOE) published collective agreements (V Convenio BOE 2015, VI Convenio BOE 2021) and Fundación SIMA mediation certificates.
3. **Macroeconomic Indicators & Inflation**: Instituto Nacional de Estadística (INE) official historical Consumer Price Index (IPC general y subyacente) series 2020–2025.
4. **Plant Census & Union Representation**: Official 2023–2024 Comité de Empresa election certificates and 24-J Referendum physical ballot minutes.
5. **Logistics & Industrial Monopolies**: EASA Part-21 Type Certificate data, Airbus Transport International (ATI) flight manifests, and official airport schedules (LEGT/LFBO/EDHI).

### Rationale
In labor negotiations and public financial analysis, credibility is binary. Even minor discrepancies in historical stock curves or wage calculations can be exploited to discredit the entire analysis. Strict primary source anchoring eliminates ambiguity.

### Alternatives Considered
- *Third-party aggregators (Yahoo Finance, Investing.com)*: Rejected because third-party scrapers frequently adjust historical closes or introduce synthetic interpolation.
- *Interpolated daily stock estimates*: Rejected per user instruction ("si existen datos no verificados o incorrectos, mejor que no estén"). Only authenticated market dates and milestone quotes will be retained.

---

## 2. Zero-Unverified-Data Purge Protocol

### Decision
Execute a multi-stage audit and purge across all project layers:
1. **Data Layer (`data/`)**: Audit `conflict_metrics.json`, `beluga_status.json`, `thermometer_data.json`, and `telegram_archive/`. Purge any estimated or ungrounded daily price entries, replace them with verified milestones, and ensure all metrics have verifiable `source_url` and `primary_source` fields.
2. **Application & Client Layer (`dashboard/`)**: Audit `data.js`, `app.js`, and `index.html`. Verify that all 12 Chart.js canvases plot exclusively verified points, that all KPI counters match canonical numbers, and that all citations are valid hyperlinks.
3. **Documentation Layer (`docs/`)**: Re-generate and verify the Markdown dossier and PDF strategic guide so that all text, tables, and charts reflect the exact audited dataset.

### Rationale
Guarantees complete consistency across code, data, web UI, and executive PDF reports with zero drift.

---

## 3. Mathematical Invariant Expansion & Automated Gating

### Decision
Expand `src/validate_invariants.py` from 11 rules to 14 comprehensive invariant gates:
- **Rule 1–4**: Plant censuses (15,562 workers across 7 sites), 198 delegates, and 2D site-by-union matrix conservation.
- **Rule 5–6**: 24-J Referendum ballot conservation (6,229 NO, 5,860 YES, 585 Blank, 81.44% turnout).
- **Rule 7**: Shareholder structure conservation (France 10.83%, Germany 10.82%, Spain 4.08%, Treasury 0.10%, Float 74.17% = 100.00%).
- **Rule 8**: Stock market asymmetry algebra ($\Delta \text{MarketCap} = -18.25\text{ €/sh} \times 792.3\text{M sh} = -14,459.5\text{ M€}$, Ratio $122.5\times$ vs $118.0\text{ M€}$).
- **Rule 9**: Airbus SE 2025 Financial Statement parity (Revenue 73.4B€, EBIT Adj 7.1B€, Net Profit 4.96B€, Dividend 3.20€/sh = 2,535.3 M€).
- **Rule 10**: Wage loss balance table arithmetic (-28,085 € gross, +3,100 € strike payouts, -26,027 € net loss).
- **Rule 11**: Platform cost math (Wage mass 778.1 M€, 12% Table 93.372 M€, 7,500€ Lump 116.715 M€).
- **Rule 12 (NEW)**: Stock market bounds & primary source URL verification ($P > 0$, $S \in [790\text{M}, 795\text{M}]$, $\text{MarketCap} = P \times S$, valid Euronext citation).
- **Rule 13 (NEW)**: Primary source citation completeness gate (100% of benchmark objects and sections have verified primary source references).
- **Rule 14 (NEW)**: Zero unverified data gate (all historical curves and milestones contain non-empty primary source annotations).

### Rationale
Automated testing ensures that no unverified or mathematically inconsistent metric can bypass CI/CD or merge into the codebase.
