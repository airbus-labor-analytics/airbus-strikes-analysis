# Data Model: Universal Dynamic Data Synchronization & Chart Resilience Engine

**Feature**: [specs/007-dynamic-data-and-charts-resilience/spec.md](spec.md)
**Date**: 2026-08-31

## Entities & Schemas

### 1. `ConflictChronology`
Represents the dynamic time elapsed since the start of the general strike and dependent cost aggregations.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "ConflictChronology",
  "type": "object",
  "required": [
    "start_iso",
    "current_iso",
    "elapsed_days",
    "elapsed_hours",
    "daily_burn_rate_m_eur",
    "cumulative_strike_cost_m_eur"
  ],
  "properties": {
    "start_iso": { "type": "string", "format": "date-time" },
    "current_iso": { "type": "string", "format": "date-time" },
    "elapsed_days": { "type": "integer", "minimum": 1 },
    "elapsed_hours": { "type": "number", "minimum": 0 },
    "daily_burn_rate_m_eur": { "type": "number", "const": 22.7 },
    "cumulative_strike_cost_m_eur": { "type": "number", "minimum": 0 }
  }
}
```

### 2. `ChartRegistration`
Tracks the lifecycle, canvas reference, and resize handler for each of the 12 dashboard Chart.js canvases.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "ChartRegistration",
  "type": "object",
  "required": ["canvas_id", "tab_id", "instance_active", "last_rendered_iso"],
  "properties": {
    "canvas_id": {
      "type": "string",
      "enum": [
        "asymmetryChart",
        "airbusStockChart",
        "companyRevenueChart",
        "companyDeliveriesChart",
        "shareholderPieChart",
        "belugaHistoryChart",
        "wagesChart",
        "unionShareChart",
        "unionEvolutionChart",
        "siteDelegatesChart",
        "referendumPieChart",
        "referendumSitesChart"
      ]
    },
    "tab_id": { "type": "string" },
    "instance_active": { "type": "boolean" },
    "last_rendered_iso": { "type": "string", "format": "date-time" }
  }
}
```

### 3. `DynamicDocumentArchive`
Maintains dynamic metrics derived from `telegram_index.json` and `conflict_metrics.json`.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "DynamicDocumentArchive",
  "type": "object",
  "required": ["total_documents", "assembly_minutes", "total_factories", "last_updated"],
  "properties": {
    "total_documents": { "type": "integer", "minimum": 0 },
    "assembly_minutes": { "type": "integer", "minimum": 0 },
    "total_factories": { "type": "integer", "const": 7 },
    "last_updated": { "type": "string", "format": "date-time" }
  }
}
```
