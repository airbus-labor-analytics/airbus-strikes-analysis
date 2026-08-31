# Phase 0 Research: Dynamic BelugaXL Logistics & Retention Modeling

**Feature**: [specs/004-beluga-dynamic-metrics/spec.md](spec.md)
**Date**: 2026-08-31

---

## 1. Dynamic Flight Aggregation & Throughput Baseline

### Decision
Aggregate raw ADS-B flight history into chronological 7-day buckets starting from the initial conflict date (2026-07-01 to 2026-08-28).
Baseline normal throughput is established as 14 flights/week (2 flights/day) between Getafe (LEGT) and European FALs (Toulouse LFBO / Hamburg EDHI).

### Rationale
- Flight records in `data/beluga_status.json` represent real aircraft movements. Grouping by ISO week intervals produces continuous historical trends.
- Getafe manufactures 100% of European Horizontal Tail Planes (HTPs) for A320, A330, and A350 programs.
- Each missing flight represents uncollected components that remain stockpiled at the Getafe facility.

---

## 2. Component Retention & FAL Buffer Mathematical Formulas

### Formulas
1. **Accumulated HTP Shipsets Retained**:
   $$\text{HTP Retained}_w = \sum_{i=1}^{w} \max(0, \text{Baseline Flights}_i - \text{Actual Getafe Departures}_i) \times 1.5$$
   *(where $1.5$ is the average HTP shipset capacity per BelugaXL sortie).*

2. **FAL Stock Buffer Depletion**:
   $$\text{Buffer Hours}(t) = \max\left(0, 60.0 - \frac{t_{\text{strike hours}}}{1.0}\right)$$
   $$\text{Buffer \%}(t) = \frac{\text{Buffer Hours}(t)}{60.0} \times 100\%$$

---

## 3. Network Outage & Offline Resilience

### Decision
When the live BelugaWatch API (`https://beluga.simcoe.co.uk/api/belugas.php`) is unreachable or times out, the parser falls back to the deterministic local flight log archive in `data/beluga_status.json` rather than crashing or emitting static placeholders.

---

## Conclusion
All research questions resolved. Architecture adheres to standard library Python and pure browser Chart.js.
