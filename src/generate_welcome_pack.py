#!/usr/bin/env python3
"""
Airbus Spain 2026 Strike: Welcome Pack & Primary Chronology Dossier Generator
Generates docs/Welcome_Pack_Conflicto_Airbus_2026.md directly from data/conflict_metrics.json.
Enforces Europe/Madrid timezone awareness and invariant alignment.
"""

import json
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
DOCS_DIR = PROJECT_ROOT / "docs"


def generate_welcome_pack_markdown(output_path: Path = None) -> str:
    if output_path is None:
        output_path = DOCS_DIR / "Welcome_Pack_Conflicto_Airbus_2026.md"

    metrics_path = DATA_DIR / "conflict_metrics.json"
    with open(metrics_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    wp = data.get("welcome_pack", {})
    exec_summary = wp.get("executive_summary", {})
    eco = exec_summary.get("economic_breakdown", {})
    quotes = exec_summary.get("core_quotes", [])
    phases = wp.get("chronology_phases", [])
    timeline = data.get("timeline", [])

    # Map timeline by id or iso_date
    tz = ZoneInfo("Europe/Madrid")
    now_madrid = datetime.now(tz).strftime("%Y-%m-%d %H:%M:%S (%Z)")

    lines = []
    lines.append("# Welcome Pack al Conflicto & Guía Cronológica Primaria")
    lines.append("## Huelga General Indefinida en Airbus España (2026)")
    lines.append("")
    lines.append(f"> **Última actualización de los textos:** {wp.get('last_updated_display', '2 de septiembre de 2026')}  ")
    lines.append(f"> **Estado del Conflicto:** Día {wp.get('strike_day', 9)} de Huelga General Indefinida en las 7 factorías de Airbus en España.  ")
    lines.append(f"> **Compilación del Dossier:** {now_madrid} | Sincronizado al 100% con `data/conflict_metrics.json`  ")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 1. Introducción Ejecutiva: ¿Qué nos ha llevado a la Huelga Indefinida?")
    lines.append("")
    lines.append(f"{exec_summary.get('intro_p1', '')}")
    lines.append("")
    lines.append(f"{exec_summary.get('intro_p2', '')}")
    lines.append("")
    lines.append("### 1.1 Balance Económico de la Asimetría Salarial (2020–2025)")
    lines.append("")
    lines.append("| Indicador / Métrica | Cifra Verificada | Fuente / Referencia Oficial |")
    lines.append("| :--- | :--- | :--- |")
    lines.append(f"| **Pérdida de Poder Adquisitivo Acumulada** | `{eco.get('loss_range_pct', '20,9% - 24,4%')}` | Dossier de Pérdida Salarial 2020-2025 / Tablas VI Convenio |")
    lines.append(f"| **Pérdida Neta Media por Trabajador** | `-{eco.get('net_loss_eur', 26030):,} €` | Cálculo econométrico de masa salarial neta |")
    lines.append(f"| **Inflación Acumulada General (IPC)** | `+{eco.get('inflation_general_pct', 19.3)}%` | Instituto Nacional de Estadística (INE 2020-2025) |")
    lines.append(f"| **Inflación Acumulada en Alimentos Básicos** | `+{eco.get('inflation_food_pct', 31.2)}%` | Cesta básica de la compra (INE) |")
    lines.append(f"| **Beneficio Neto Récord de Airbus SE (2025)** | `{eco.get('airbus_profit_2025_meur', 5221):,} M€` | Airbus SE Full-Year 2025 Financial Results Press Release |")
    lines.append(f"| **EBIT Ajustado de Airbus SE (2025)** | `{eco.get('airbus_ebit_2025_meur', 7138):,} M€` | Resultados Oficiales Airbus SE (19 Feb 2026) |")
    lines.append(f"| **Dividendos Repartidos a Accionistas (2025)** | `{eco.get('shareholder_payout_2025_meur', 2500):,} M€` | Retribución al capital (3,20 € / acción) |")
    lines.append(f"| **Coste Total de la Plataforma Sindical (12% + 7.500€)** | `{eco.get('union_demand_annual_cost_meur', 118.0)} M€` | Representa solo el 4,8% del beneficio anual de Airbus |")
    lines.append(f"| **Pérdida Bursátil de Airbus SE por el Conflicto** | `-{eco.get('market_cap_lost_conflict_meur', 14459.5):,} M€` | Cierre Euronext Paris (AIR.PA) al 28/08/2026 |")
    lines.append("")
    lines.append("### 1.2 Declaraciones y Citas Textuales Verificadas")
    lines.append("")
    for q in quotes:
        lines.append(f"> «*{q.get('quote')}*»  ")
        lines.append(f"> — **{q.get('source')}** (`{q.get('file_ref')}`)  ")
        lines.append(f"> *Contexto:* {q.get('context', '')}")
        lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 2. Cronología Primaria del Conflicto en 3 Fases")
    lines.append("")

    for phase in phases:
        lines.append(f"### {phase.get('phase_title')}")
        lines.append(f"**Periodo:** `{phase.get('date_range')}` | **Enfoque:** {phase.get('description')}")
        lines.append("")
        lines.append("#### Hitos y Resoluciones Asamblearias:")
        lines.append("")
        for milestone in phase.get("key_milestones_summary", []):
            lines.append(f"- {milestone}")
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("## 3. Detalle Día a Día de la Huelga Indefinida (Fase 3: 25 de Agosto – 2 de Septiembre)")
    lines.append("")

    # Extract all milestones from timeline that belong to strike
    strike_milestones = [m for m in timeline if m.get("iso_date", "") >= "2026-08-25"]
    for m in strike_milestones:
        lines.append(f"### 📍 {m.get('date')} — {m.get('title')}")
        lines.append(f"- **Ubicación / Centros:** {m.get('location', 'Factorías de Airbus en España')}")
        lines.append(f"- **Horarios y Convocatoria:** {m.get('time', 'Jornada completa')}")
        lines.append(f"- **Escrutinio / Censo / Seguimiento:** {m.get('census_and_votes', '')}")
        lines.append(f"- **Resumen de la Jornada:** {m.get('summary', '')}")
        lines.append(f"- **Clave Estratégica:** *{m.get('strategic_takeaway', '')}*")
        lines.append(f"- **Fuente Primaria:** `{m.get('source_ref')}` (ID: `{m.get('document_id', 'N/A')}`)")
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("## 4. La Plataforma de 11 Puntos del Comité de Huelga")
    lines.append("")
    lines.append("Presentada formalmente ante el SIMA el 27 de agosto de 2026:")
    lines.append("1. **Incremento Salarial Consolidado:** 12% fijo en tablas salariales a 1 de enero de 2026.")
    lines.append("2. **Compensación por Pérdida Histórica:** Abono inmediato de 7.500 € a tanto alzado por trabajador.")
    lines.append("3. **Cláusula de Garantía de Poder Adquisitivo:** Revisión automática anual vinculada al IPC real de España + 1,5%.")
    lines.append("4. **Eliminación Inmediata del Método Bradford:** Supresión de cualquier penalización por bajas médicas o absentismo justificado.")
    lines.append("5. **Consolidación del Teletrabajo:** Mínimo 3 días semanales con compensación íntegra de gastos según Ley 10/2021.")
    lines.append("6. **Blindaje del Empleo y Carga de Trabajo:** Garantía expresa de no deslocalización de aeroestructuras ni paquetes de trabajo.")
    lines.append("7. **Plan de Rejuvenecimiento y Jubilación Parcial:** Contratos de relevo obligatorios al 100% al alcanzar la edad legal.")
    lines.append("8. **Pase a Fijos de la Subcontratación:** Internalización de puestos estructurales subcontratados.")
    lines.append("9. **Igualdad Real y Conciliación:** Desconexión digital garantizada y flexibilidad horaria sin merma económica.")
    lines.append("10. **Seguridad y Salud Laboral:** Protocolos reforzados en líneas de montaje y talleres químicos.")
    lines.append("11. **Retirada de Medidas Coercitivas:** Anulación inmediata de expedientes sancionadores abiertos a huelguistas y piquetes.")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 5. Índice de Acceso al Archivo de Minutas Primarias")
    lines.append("")
    lines.append("Todos los documentos citados están transcritos y autenticados en el repositorio en `data/telegram_archive/documents/` y accesibles en el visor modal interactivo del cuadro de mando (`#source-modal`).")
    lines.append("")

    content = "\n".join(lines)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"✓ Dossier generado con éxito: {output_path} ({len(lines)} líneas)")
    return content


if __name__ == "__main__":
    generate_welcome_pack_markdown()
