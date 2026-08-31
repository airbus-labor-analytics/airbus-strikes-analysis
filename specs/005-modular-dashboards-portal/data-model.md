# Data Model: Modular Dashboards & Welcome Portal Hub

**Feature**: [specs/005-modular-dashboards-portal/spec.md](spec.md)
**Date**: 2026-08-31

---

## 1. Entities

### `SiteMapItem`
Represents an individual dashboard entry in the Welcome Portal grid:
```json
{
  "id": "tab-purchasing-power",
  "hash": "#salarios",
  "title": "Calculadora Salarial & Retorno de Huelga",
  "badge": "Módulo Retributivo",
  "badge_color": "emerald",
  "description": "Simula el impacto en tu nómina con atrasos de 7.500€, subida del 12% a tablas, cláusula IPC+1,5% y días de paro amortizados.",
  "icon": "calculator",
  "highlights": ["Simulador Nómina Personalizado", "Pérdidas 2020-2025", "Plataforma 11 Puntos"]
}
```

### `FlashKPIItem`
Represents an executive KPI card on the Welcome Portal:
```json
{
  "label": "Impacto Bursátil Airbus SE",
  "value": "-14.459,5 M€",
  "subtitle": "Ratio 122.5x vs. coste anual de plataforma (118.0 M€)",
  "color": "rose",
  "icon": "trending-down"
}
```

---

## 2. Navigation State Map

```text
               ┌──────────────────────────────┐
               │    #portal (tab-portal)      │
               │   Welcome Hub & Site Map     │
               └──────────────┬───────────────┘
                              │
       ┌──────────────┬───────┴──────┬──────────────┬──────────────┐
       ▼              ▼              ▼              ▼              ▼
  #financiero    #logistica      #salarios      #sindical     #evidencias
 (tab-overview) (tab-industrial)(tab-purchasing)(tab-union)   (tab-evidence)
```
