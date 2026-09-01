# Research & Technical Decisions: Beluga Logistics Engine Decoupling & Supply Chain Math Validation

**Feature**: `014-isolate-and-validate-beluga-engine`  
**Date**: 2026-09-01  
**Status**: Completed  

---

## 1. Decoupling Beluga Logistics from Media & Sentiment Analysis

### Decision
Completely isolate `src/beluga_tracker.py` as a standalone aerospace supply chain module. Remove all cross-imports, shared execution routines, and mingled data pipelines between Beluga logistics and `src/sentiment_thermometer.py`.

### Rationale
- Beluga logistics tracking deals with physical asset telemetry (ADS-B aircraft coordinates, flight statuses, airport codes, assembly bottlenecks) rather than media NLP, sentiment scoring, or press release categorizations.
- In `dashboard/app.js`, the composite function `initThermometerAndBeluga()` created unnecessary coupling where an error or delay in RSS scraping could delay or distort radar fleet updates.
- Decoupling creates clear bounded contexts:
  - `data/beluga_status.json`: purely aircraft and route status.
  - `data/thermometer_data.json`: purely media and community conflict temperature feeds.

### Alternatives Considered
- *Single Unified Operations Engine*: Keep everything in `analysis_engine.py`. Rejected because it creates monolithic files that are harder to maintain, test, and poll independently.

---

## 2. Elimination of Fabricated Weekly Charts & Historical Arrays

### Decision
Completely remove the `#belugaHistoryChart` canvas from `dashboard/index.html`, remove its dataset rendering logic from `dashboard/app.js`, and delete the synthetic `period_definitions` array / `calculate_dynamic_movements()` from `src/beluga_tracker.py`.

### Rationale
- The constitution (Principle I & Principle II) strictly prohibits fabricated, ungrounded, or synthetic data series.
- The weekly flight progression (`period_definitions` with hardcoded `W26..W34` flight counts and synthetic `accumulated_htp` curves) lacked timestamped historical ADS-B logs.
- Displaying synthetic trends as if they were live empirical measurements compromises the credibility of the entire platform.
- The UI will instead highlight verified real-time fleet radar cards, Getafe corridor blockade indicators, and official assembly minute evidence.

### Alternatives Considered
- *Labeling the chart as "Theoretical Simulation"*: Rejected per explicit user instruction ("no te inventes información, es preferible que no aparezca a que haya algo que es mentira"). Total elimination is the cleanest, most trustworthy solution.

---

## 3. Real-Time Radar Telemetry & Verified Aircraft Models

### Decision
Structure the Beluga tracking model around the 6 canonical BelugaXL aircraft operated by Airbus Transport International (ATI):

| ID | Name | Registration | Tail | Role / Base |
|---|---|---|---|---|
| BXL-01 | BelugaXL 1 | `F-GXLG` | XL1 | Heavy-lift transport (Toulouse / Broughton) |
| BXL-02 | BelugaXL 2 | `F-GXLH` | XL2 | Heavy-lift transport (Bremen / Hamburg) |
| BXL-03 | BelugaXL 3 | `F-GXLI` | XL3 | Heavy-lift transport (Toulouse / Saint-Nazaire) |
| BXL-04 | BelugaXL 4 | `F-GXLJ` | XL4 | Heavy-lift transport (Saint-Nazaire / Hamburg) |
| BXL-05 | BelugaXL 5 | `F-GXLN` | XL5 | Heavy-lift transport (Getafe HTP corridor / Toulouse) |
| BXL-06 | BelugaXL 6 | `F-GXLO` | XL6 | Heavy-lift transport (European network) |

### Rationale
- Matches official DGAC / EASA fleet registrations and BelugaWatch live ADS-B tracker feeds.
- Enables individual filtering in the dashboard by tail number (`XL1` through `XL6`).
- Provides deterministic fallback when live network is unavailable during offline testing or API downtime.

---

## 4. Supply Chain Impact & Primary Source Evidence Grounding

### Decision
Ground the industrial impact of the Beluga blockade in primary sources:
1. **Getafe HTP Monopoly**: Getafe is the sole manufacturing center for all Horizontal Tail Planes across the entire commercial aircraft family (A320/A321, A330, A350).
2. **Assembly Minutes**: Cite `sources/721c0baa.txt` (Minutas Asamblea en Huelga Getafe 17/07/2026: *"La producción de la planta de Marignan se ha visto impactada por nuestra huelga y sufrirá paros a partir de la semana que viene. El beluga ya no viene porque no tiene piezas que llevar a Toulouse"*).
3. **Route Disruption**: Getafe $\rightarrow$ Toulouse and Getafe $\rightarrow$ Hamburg routes are marked as 100% blocked, while European feeder lines (Broughton, Saint-Nazaire, Bremen) operate normally until FAL assembly lines starve.

---

## 5. Summary of Architecture Decisions

1. **Backend (`src/beluga_tracker.py`)**: Standalone CLI and module producing `data/beluga_status.json`.
2. **Data Model**: Real-time aircraft fleet list, route distribution matrix, blockade status summary, and primary source citations. Zero synthetic history.
3. **Frontend (`dashboard/index.html` & `dashboard/app.js`)**:
   - Remove `#belugaHistoryChart`.
   - Update `initBelugaLogistics()` to render fleet cards and European route status matrix independently.
   - Dedicated 30s background polling lifecycle.
4. **Validation (`src/validate_invariants.py`, `src/validate_sources.py`, `tests/`)**:
   - Automated checks ensuring zero unverified data and valid DOM tag balancing.
