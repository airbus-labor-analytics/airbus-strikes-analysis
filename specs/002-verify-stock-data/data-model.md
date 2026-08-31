# Data Model & Mathematical Invariants: Full Platform-Wide Data Audit

**Feature Branch**: `002-verify-stock-data`  
**Date**: 2026-08-31  

---

## 1. Entities & Schemas

### 1.1 StockMarketSnapshot (`data/conflict_metrics.json -> stock_market_analysis`)
Represents the verified market capitalization and equity state of Airbus SE.

```typescript
interface StockMarketSnapshot {
  ticker: string;                         // "AIR.PA (Euronext Paris) / ISIN NL0000235190"
  primary_source: string;                 // Official description of registry source
  source_url: string;                     // "https://live.euronext.com/en/product/equities/NL0000235190-XPAR"
  current_price_eur: number;              // Current verified quote in Euros (e.g. 203.05)
  pre_conflict_price_eur: number;          // Verified pre-conflict benchmark price (e.g. 221.30)
  ytd_high_price_eur: number;             // 52-week verified high (e.g. 221.30)
  ytd_low_price_eur: number;              // 52-week verified low (e.g. 157.42)
  total_shares_outstanding: number;       // Exact ordinary shares (e.g. 792,300,000)
  current_market_cap_eur_m: number;       // P * S / 1e6 (e.g. 160,876.5)
  pre_conflict_market_cap_eur_m: number;  // P_pre * S / 1e6 (e.g. 175,336.0)
  market_cap_lost_conflict_eur_m: number; // ΔP * S / 1e6 (e.g. 14,459.5)
  conflict_price_change_pct: number;      // (P - P_pre) / P_pre * 100 (e.g. -8.25%)
  annual_union_demand_cost_eur_m: number; // Verified cost of union platform (e.g. 118.0)
  financial_asymmetry_ratio: number;      // market_cap_lost / union_demand (e.g. 122.5x)
  dividends_2025_paid_eur_m: number;      // Verified FY2025 dividend payout (e.g. 2,535.3)
  net_income_2025_eur_m: number;          // Verified FY2025 net income (e.g. 4,960.0)
  ebit_adjusted_2025_eur_m: number;       // Verified FY2025 adjusted EBIT (e.g. 7,100.0)
  is_modeled: boolean;                    // false (strictly primary-source grounded)
  daily_history_conflict: VerifiedMilestoneQuote[];
}

interface VerifiedMilestoneQuote {
  date: string;                           // ISO YYYY-MM-DD
  price: number;                          // Verified Euronext closing quote (€)
  event: string;                          // Historical conflict milestone citation
  volume_k?: number;                      // Verified trading volume in thousands (if authenticated)
}
```

### 1.2 ElectoralCensusMatrix (`data/conflict_metrics.json -> plant_census, union_shares`)
Represents the 100% balanced site-by-union electoral and census distribution across 7 Spanish factories.

```typescript
interface PlantCensusEntry {
  plant_name: string;                     // "Getafe", "Illescas", "Puerto Real", "San Pablo", "Tablada", "CBC", "Albacete"
  census: number;                         // Total registered workforce
  delegates: number;                      // Total elected union delegates
  union_breakdown: Record<string, number>;// { "CCOO": number, "UGT": number, "SIPA": number, "ATP": number, "CGT": number }
}
```

---

## 2. Mathematical Invariant Verification Rules

| Rule # | Mathematical Invariant | Formula / Equation | Tolerance |
|---|---|---|---|
| **Rule 1** | Total Plant Census Sum | $\sum_{i=1}^7 \text{Census}_i = 15,562$ | Exact (0) |
| **Rule 2** | Total Plant Delegates Sum | $\sum_{i=1}^7 \text{Delegates}_i = 198$ | Exact (0) |
| **Rule 3** | Union Shares Delegates Sum | $\sum_{u \in \text{Unions}} \text{Delegates}_u = 198$ | Exact (0) |
| **Rule 4** | 2D Site-Union Matrix | $\forall u: \sum_{i=1}^7 \text{Matrix}_{i, u} = \text{UnionDelegates}_u$ | Exact (0) |
| **Rule 5** | 24-J Referendum Turnout | $\frac{\text{NO} + \text{YES} + \text{Blank}}{\text{Total Census}} = 81.44\%$ | $\pm 0.05\%$ |
| **Rule 6** | 24-J Referendum Vote Split | $\text{NO} (6,229) + \text{YES} (5,860) + \text{Blank} (585) = 12,674$ | Exact (0) |
| **Rule 7** | Shareholder Ownership Sum | $\text{FR}(10.83\%) + \text{DE}(10.82\%) + \text{ES}(4.08\%) + \text{Treasury}(0.10\%) + \text{Float}(74.17\%) = 100.00\%$ | Exact (0) |
| **Rule 8** | Stock Market Destruction Algebra | $\Delta \text{MarketCap} = -18.25 \times 792.3\text{M} = -14,459.5\text{ M€}$ ($\text{Ratio} = 122.5\times$) | $\pm 0.1\text{ M€}$ |
| **Rule 9** | Airbus SE 2025 Financials | $\text{Rev}=73.4\text{B€}, \text{EBIT}=7.1\text{B€}, \text{Net}=4.96\text{B€}, \text{Div}=3.20\text{€/sh}$ | Exact (0) |
| **Rule 10** | Yearly Loss Table Balance | $\text{Gross Loss}(-28,085) + \text{Payouts}(+3,100) = \text{Net Loss}(-26,027\text{ €})$ | Exact (0) |
| **Rule 11** | Platform Cost Math | $\text{Mass}=778.1\text{ M€}, \text{Table}=93.372\text{ M€}, \text{Lump}=116.715\text{ M€}$ | Exact (0) |
| **Rule 12** | Stock Bounds & Integrity | $P > 0 \land S \in [790\text{M}, 795\text{M}] \land \text{MarketCap} = P \times S$ | $\pm 0.1\text{ M€}$ |
| **Rule 13** | Primary Source Link Veracity | $\forall \text{Metric } m: \text{SourceURL}(m) \neq \text{null} \land \text{ValidURL}(\text{SourceURL}(m))$ | 100% coverage |
| **Rule 14** | Zero Unverified Data Gate | $\forall \text{HistoricalPoint } h: \text{Citation}(h) \neq \text{empty}$ | 100% coverage |
