# ✈️ Airbus Spain 2026 Strike: Strategic Intelligence & Analytics Suite

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)
[![NotebookLM: Synced](https://img.shields.io/badge/NotebookLM-269%20Sources%20Synced-brightgreen)](data/telegram_archive/telegram_index.json)
[![Status: Active Conflict](https://img.shields.io/badge/Status-Mesa%20SIMA%202026-rose)](docs/Guia_Estrategica_Negociacion_Huelga_Airbus_2026.md)
[![Invariants: 15/15 Passed](https://img.shields.io/badge/Invariants-15%2F15%20Rules%20100%25-emerald)](src/validate_invariants.py)
[![Tests: 86 Passing](https://img.shields.io/badge/Tests-86%20Passed-emerald)](tests/)

An end-to-end strategic intelligence suite, econometric modeling engine, publication-grade PDF generator, Google NotebookLM integration, and interactive analytical web dashboard for evaluating the **Airbus Spain 2026 collective bargaining conflict (VII Convenio Colectivo)**.

---

## 📌 Executive Summary

Airbus Spain represents **15,562 workers** and **198 union delegates** across 7 industrial manufacturing sites (*Getafe, Illescas, Puerto Real, San Pablo, Tablada, CBC El Puerto, Albacete*). This repository models the industrial, financial, and strategic dynamics of the collective conflict:

1. **Strategic Supply Chain Monopolies:**
   * **Getafe:** Concentrates **100% of European Horizontal Tail Plane (HTP)** assembly for all civil aircraft lines (*A320, A321XLR, A330, A350*). No alternative manufacturing capacity exists worldwide.
   * **Just-In-Time (JIT) Bottleneck:** Buffer stock in European Final Assembly Lines (FALs in Toulouse, Hamburg, Mobile, Tianjin) is only **48h to 72h**.
   * **Delivery Target at Risk:** Airbus SE has committed to **870 aircraft deliveries in 2026** (requiring ~90 deliveries/month). A sustained strike in Spain halts European final assembly within 3 to 5 days.

2. **Extreme Financial Damage Asymmetry (185x Ratio):**
   * **Corporate Impact on Airbus SE:** **~22.7 M€ / day** in operational burn rate, disrupted FALs, and late delivery customer penalty clauses.
   * **Worker Salary Sacrifice:** **~98 € / day** net deduction per worker (based on 50,000 € gross baseline salary).
   * **Financial Feasibility:** Fulfilling the union's full platform (*12% consolidated in tables + 7,500 € signing bonus*) represents **<4.6% of Airbus SE's 2025 net profit (5,221 M€)** and <2.8% of annual operating cash flow.

---

## 🗂️ Repository Architecture

```
airbus-strikes-analysis/
├── docs/
│   ├── Guia_Estrategica_Negociacion_Huelga_Airbus_2026.md   # Source executive guide (bilingual)
│   └── Guia_Estrategica_Negociacion_Huelga_Airbus_2026.pdf  # 8-page publication PDF with 6 vector diagrams
├── dashboard/
│   ├── index.html                                           # Modern responsive web dashboard (Tailwind + Chart.js)
│   ├── app.js                                               # Main frontend orchestration, HUD & chart controllers
│   ├── data.js                                              # Pre-compiled static data artifact for zero-latency loading
│   └── js/
│       ├── core.js                                          # Shared utilities, math models, DOM helpers, toast & sanitization
│       ├── main.js                                          # Lifecycle bootstrap & module coordination
│       └── modules/
│           ├── overview.js                                  # Module 1: Command Center & Asymmetry models
│           ├── industrial.js                                # Module 2: Industrial Impact, Logistics & BelugaXL movements
│           ├── purchasing_power.js                          # Module 3: Purchasing Power & Custom Wage Proposal Builder
│           ├── union_force.js                               # Module 4: Assembly Timeline, Freshness Validator & Minutes
│           └── evidence.js                                  # Module 5: Searchable Primary Documents Archive & Modal
├── data/
│   ├── conflict_metrics.json                                # Master dataset computed by econometric engine
│   ├── beluga_status.json                                   # Beluga fleet status & live flight legs
│   ├── thermometer_data.json                                # Assembly sentiment data
│   └── telegram_archive/
│       ├── telegram_index.json                              # Indexed telegram channels & official communiques
│       └── assembly_minutes/                                # 17 unedited factory assembly transcripts
├── src/
│   ├── analysis_engine.py                                   # Econometric models & Monte Carlo probability engine
│   ├── beluga_tracker.py                                    # Live BelugaXL flight movements tracker & corridor engine
│   ├── network_utils.py                                     # Resilient network fetcher with exponential backoff & jitter
│   ├── validate_invariants.py                               # Master validation gate for 15 mathematical & factual rules
│   ├── validate_timeline_freshness.py                       # Timezone-aware (Europe/Madrid) daily timeline validator
│   ├── validate_sources.py                                  # Primary source URL & DOM tag integrity validator
│   ├── generate_pdf.py                                      # Headless Chromium publication PDF compiler
│   └── notebooklm_sync.py                                   # Automated Google NotebookLM sync & source downloader
├── tests/
│   ├── test_analysis_engine.py                              # Core econometric calculation tests
│   ├── test_beluga_engine.py                                # Beluga fleet & logistics movement tests
│   ├── test_timeline_freshness.py                           # Timezone arithmetic & freshness state transition tests
│   ├── test_backend_resilience.py                           # Network retry, atomic write & fallback tests
│   └── test_security_sanitization.py                        # XSS prevention & safe link attribute tests
├── .github/
│   └── workflows/
│       ├── deploy.yml                                       # Automated PDF build & GitHub Pages deploy
│       ├── sync-news-data.yml                               # Automated 2-hour Telegram & News sync pipeline
│       └── test.yml                                         # CI test runner across Python & JS test suites
├── cli.py                                                   # Unified Python CLI entry point
├── run.sh                                                   # Quick runner script
├── package.json                                             # Node scripts & dependencies
└── requirements.txt                                         # Python dependencies
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Chromium / Google Chrome** *(only required for compiling the PDF)*

```bash
# Clone the repository
git clone https://github.com/sergiomh499/airbus-strikes-analysis.git
cd airbus-strikes-analysis

# Install Node dependencies
npm install

# Run the validation test suite
python3 src/validate_invariants.py
python3 src/validate_timeline_freshness.py
python3 -m unittest discover tests/
```

### 2. Launch the Interactive Web Dashboard
Run the dashboard server and open it in your browser:
```bash
./run.sh dashboard
# OR
python3 cli.py dashboard
```
Navigate to `http://localhost:8080/dashboard/`.

### 3. Generate the Executive PDF Document
Recompile the 8-page executive PDF with all custom vector infographics:
```bash
./run.sh pdf
# OR
python3 src/generate_pdf.py
```
Output is saved to `docs/Guia_Estrategica_Negociacion_Huelga_Airbus_2026.pdf`.

### 4. Run the Econometric Analysis Engine
Execute the data modeling engine to recompute financial curves and export `data/conflict_metrics.json`:
```bash
./run.sh data
# OR
python3 src/analysis_engine.py
```

---

## 📊 Features of the 5 Thematic Modules

| Module | Core Features | Key Visualizations |
|---|---|---|
| **1. Centro de Mando & Asimetría** | Asymmetry Ratio Slider (1–45 days), Global Telemetry HUD, Strike Cost Breakdown, Stock Market Impact. | Dual-axis damage curve, Euronext stock drop chart, Cost distribution donut. |
| **2. Impacto Industrial & Logística** | JIT Supply Chain Disruption Countdown, Live BelugaXL Movement Feed, Airframe Filter (XL1–XL6), FAL Buffer Exhaustion Tracker. | Beluga route corridors, Factory dependency mapping, FAL stoppage forecast. |
| **3. Poder Adquisitivo & Negociación** | Custom Wage Proposal Builder, Platform vs Company Comparative Tables, Strike Fund ("Caja de Resistencia") Estimator. | Wage trajectory comparison (2021–2028), Purchasing power erosion bar chart. |
| **4. Fuerza Sindical & Asamblea** | Daily Timeline Freshness Validator (Europe/Madrid), 21 Chronological Milestones, Plant Filters, Assembly Minutes Modal. | Interactive event timeline, Plant filter pills, Document reader dialog. |
| **5. Documentación & Evidencias** | 17 Verified Primary Source Citations, Direct PDF Transcripts, SIMA Mediation Minutes, BOE Collective Agreements. | Searchable citation catalog, Verifiable URL audit table. |

---

## 🛡️ Invariant Integrity & Quality Gates

The repository is guarded by **15 automated mathematical and factual rules** defined in `src/validate_invariants.py`:

1. **Plant Census Conservation**: Exact sum across 7 manufacturing sites = 15,562 workers.
2. **Plant Delegate Conservation**: Sum of plant delegates = 198.
3. **Union Share Delegate Conservation**: Sum across union delegates = 198.
4. **2D Delegate Matrix Balance**: Sites $\times$ Unions matrix perfectly balanced.
5. **Referendum Consistency**: 24-J voting results validated (NO: 49.15%, YES: 46.24%, Blank: 4.62%, Turnout: 81.44%).
6. **Referendum Arithmetic Sum**: YES + NO + Blank = Total Valid Votes.
7. **Shareholder Structure Sum**: 100.00% exact equity distribution (France, Germany, Spain, Treasury, Float).
8. **Stock Capital Destruction**: Market cap loss calculated at exact share price difference $\times$ 792.3M shares.
9. **Financial Filings Consistency**: Airbus SE FY2025 audited revenue, EBIT, Net Profit, and dividends verified.
10. **Yearly Loss Table Balance**: Mathematical balance between gross wage deductions and strike fund compensations.
11. **Wage Platform Arithmetic**: Base wage mass (778.1 M€), 12% consolidation (93.372 M€), and 7,500€ bonus (116.715 M€).
12. **Stock Market Price Grounding**: Euronext Paris (AIR.PA) market pricing and market capitalization grounded.
13. **Strategic Benchmarks Grounding**: All 8 aerospace strike benchmarks grounded with verified primary URLs.
14. **Zero-Unverified-Data Gate**: All historical stock milestones 100% verified.
15. **Timeline Freshness & Monotonicity**: Daily timeline verified in Madrid timezone with verified primary assembly documents.

---

## 📄 License
This project is open-source under the **MIT License**.
