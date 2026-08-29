# ✈️ Airbus Spain 2026 Strike: Strategic Intelligence & Analytics Suite

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)
[![NotebookLM: Synced](https://img.shields.io/badge/NotebookLM-269%20Sources%20Synced-brightgreen)](sources/sources_index.json)
[![Status: Active Conflict](https://img.shields.io/badge/Status-Mesa%20SIMA%202026-rose)](docs/Guia_Estrategica_Negociacion_Huelga_Airbus_2026.md)

An end-to-end strategic intelligence suite, econometric modeling engine, publication-grade PDF generator, Google NotebookLM integration, and interactive analytical web dashboard for evaluating the **Airbus Spain 2026 collective bargaining conflict (VII Convenio Colectivo)**.

---

## 📌 Executive Summary

Airbus Spain represents **15,562 workers** across 5 strategic manufacturing facilities (*Getafe, Illescas, Puerto Real, Sevilla San Jerónimo, Sevilla Tablada*). This repository models the industrial, financial, and strategic dynamics of the collective conflict:

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
│   └── app.js                                               # Interactive calculations & chart controllers
├── data/
│   └── conflict_metrics.json                                # Exported dataset from econometric engine
├── sources/
│   ├── sources_index.json                                   # Complete metadata catalog of all 269+ NotebookLM sources
│   ├── artifacts/                                           # Synced NotebookLM reports, mind maps, and infographics
│   │   ├── artifacts_index.json
│   │   ├── Resumen_Ejecutivo_Estrategia_de_Asamblea,...md
│   │   ├── Airbus_Mapa.json
│   │   └── Crisis_laboral_en_sector_aeroespacial.png
│   └── fulltext/                                            # Downloaded indexed full texts of primary sources
├── src/
│   ├── analysis_engine.py                                   # Econometric models & Monte Carlo probability engine
│   ├── generate_pdf.py                                      # Headless Chromium publication PDF compiler
│   ├── notebooklm_sync.py                                   # Automated Google NotebookLM sync & source downloader
│   ├── render_document.js                                   # Markdown parser & 6 SVG vector diagram renderers
│   └── diagram_helpers.js                                   # Reusable SVG vector badge and card components
├── .github/
│   └── workflows/
│       └── deploy.yml                                       # GitHub Actions: automated PDF build & Pages deploy
├── cli.py                                                   # Unified Python CLI entry point
├── run.sh                                                   # Quick bash runner
├── package.json                                             # Node scripts & dependencies
└── requirements.txt                                         # Python dependencies
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Chromium / Google Chrome** *(only required for compiling the PDF)*
- **NotebookLM CLI** *(optional for syncing fresh sources from NotebookLM: `pip install notebooklm-py`)*

```bash
# Clone the repository
git clone https://github.com/sergiomh499/airbus-strikes-analysis.git
cd airbus-strikes-analysis

# Install Node dependencies (marked parser)
npm install
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
Recompile the 8-page executive PDF with all 6 custom vector infographics:
```bash
./run.sh pdf
# OR
python3 src/generate_pdf.py
```
Output is saved to `docs/Guia_Estrategica_Negociacion_Huelga_Airbus_2026.pdf`.

### 4. Synchronize Sources from Google NotebookLM
Download and synchronize all 269+ primary sources, full texts, and generated artifacts into the repository:
```bash
./run.sh sync
# OR
python3 src/notebooklm_sync.py --all
```

### 5. Run the Econometric Analysis Engine
Execute the data modeling engine to recompute financial curves and export `data/conflict_metrics.json`:
```bash
./run.sh data
# OR
python3 src/analysis_engine.py
```

---

## 📊 Features of the Interactive Dashboard

| Module | Description |
|---|---|
| **Asymmetry Calculator** | Live interactive slider calculating financial bleed for Airbus SE vs. collective payroll impact over 1 to 45 strike days. |
| **JIT Supply Chain Tracker** | Plant-by-plant dependency mapping (*Getafe, Illescas, Puerto Real, Sevilla*) and European FAL cascade disruption countdown. |
| **Wage & Purchasing Power Simulator** | Real wage erosion calculator (2021-2028) comparing Union Platform (*12% + IPC+1.5%*) vs. Company Offer (*3% cap*). |
| **SIMA Decision Tree & Scenarios** | Probability matrix of conflict outcomes: Full Union Victory (58%), Compromise Pact (27%), Arbitration (11%), Imposition (4%). |
| **6-Filter Assembly Audit Tool** | Real-time compliance auditor for workers to grade any pre-agreement before casting their secret ballot. |
| **Benchmark Explorer** | Comparative scorecards of historical aerospace strikes (*Boeing IAM 751, Spirit AeroSystems, Acerinox, RMT Network Rail*). |
| **Primary Document Archive** | Searchable database of 17 primary source citations with direct page references. |

---

## 📚 Documentary Compendium & Primary Sources

All metrics, legal interpretations, and timelines are cross-referenced with primary documentary evidence:
1. **SIMA Mediation Minutes:** Sessions of August 25 & August 27, 2026.
2. **Airbus SE Financial Filings:** *Annual Report 2025* (Consolidated Net Profit: 5,221 M€; EBIT: 5,838 M€) and *H1 2026 Results*.
3. **Official Statistics:** National Statistics Institute (INE), Bank of Spain (BdE), and ECB inflation indices (2021–2025).
4. **Labor Jurisprudence:** Spanish Workers' Statute (RD-Leg 2/2015), Royal Decree-Law 17/1977 (Art. 8.2), and Constitutional Court Rulings (STC 11/1981 on strike protection).

---

## 📄 License
This project is open-source under the **MIT License**.
