# Data Model: Welcome Pack al Conflicto & Guía Cronológica Primaria

**Feature**: `017-conflict-welcome-pack`  
**Date**: 2026-09-02  
**Status**: Completed

---

## 1. Entities & Schema Definition

### 1.1 `WelcomePackData` (Canonical Entity in `data/conflict_metrics.json`)

```json
{
  "welcome_pack": {
    "last_updated": "2026-09-02",
    "last_updated_display": "2 de septiembre de 2026",
    "strike_day": 9,
    "executive_summary": {
      "title": "Welcome Pack al Conflicto: Causas, Cifras y Democracia de Base",
      "hook": "¿Qué nos ha llevado a la mayor huelga general en la historia de Airbus en España?",
      "economic_breakdown": {
        "loss_range_pct": "20,9% - 24,4%",
        "net_loss_eur": 26030,
        "inflation_general_pct": 19.3,
        "inflation_food_pct": 31.2,
        "airbus_profit_2025_meur": 5221,
        "airbus_ebit_2025_meur": 7138,
        "shareholder_payout_2025_meur": 2500
      },
      "core_quotes": [
        {
          "quote": "La pérdida de poder adquisitivo acumulada durante el VI Convenio supera el 20%, mientras Airbus bate récord histórico con 5.221 millones de euros de beneficio neto.",
          "source": "Dossier de Pérdida Salarial 2020-2025",
          "file_ref": "docs/Dossier_Perdida_Salarial_Airbus_2020_2025.txt"
        }
      ]
    },
    "chronology_phases": [
      {
        "phase_id": "phase_1_gestation",
        "phase_title": "Fase 1: Antecedentes y Gestación (2020 – Junio 2026)",
        "date_range": "2020-01-01 / 2026-06-30",
        "description": "Orígenes del conflicto salarial bajo el VI Convenio y primeros paros.",
        "milestone_ids": [1, 2, 3]
      },
      {
        "phase_id": "phase_2_escalation",
        "phase_title": "Fase 2: Escalada y Democracia Directa (Julio – 24 de Agosto 2026)",
        "date_range": "2026-07-01 / 2026-08-24",
        "description": "Marchas multitudinarias, asambleas de planta, referéndum vinculante y convocatoria de huelga indefinida.",
        "milestone_ids": [4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
      },
      {
        "phase_id": "phase_3_indefinite_strike",
        "phase_title": "Fase 3: Huelga General Indefinida en Curso (25 de Agosto – 2 de Septiembre 2026 / Día 9)",
        "date_range": "2026-08-25 / 2026-09-02",
        "description": "Paro total en los 7 centros, piquetes a las 05:30 h, mediación SIMA y unidad asamblearia.",
        "milestone_ids": [14, 15, 16, 17, 18, 19, 20, 21, 22]
      }
    ]
  }
}
```

---

## 2. Invariants & Validation Rules

1. **Integridad Cronológica**: Cada `milestone_id` referenciado en `chronology_phases` DEBE existir en `timeline` con fecha válida y formato ordenado monótonamente.
2. **Coherencia Económica**: `loss_range_pct`, `net_loss_eur`, `airbus_profit_2025_meur` DEBEN coincidir exactamente con `purchasing_power_loss` y `financial_asymmetry` de `data/conflict_metrics.json`.
3. **Respaldo Documental**: Cada elemento en `core_quotes` DEBE vincularse a un archivo existente en `data/telegram_archive/` o `docs/`.
4. **Sello Temporal**: `last_updated` DEBE ser `2026-09-02` (Día 9) en zona horaria `Europe/Madrid`.
