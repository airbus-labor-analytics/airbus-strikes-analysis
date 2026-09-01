#!/usr/bin/env python3
"""
Airbus Strikes Analysis - Daily Timeline Freshness Validator & Assembly Minutes Checker
Validates:
1. Europe/Madrid timezone date awareness
2. Daily freshness of strike timeline milestones against today's calendar date
3. Status determination: UP_TO_DATE, PENDING_TODAY, STALE_ALERT, WEEKEND_PAUSE
4. Chronological monotonicity of timeline entries
5. Linked assembly minutes and telegram document existence
"""

import json
import re
import sys
from datetime import datetime, date, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from zoneinfo import ZoneInfo

PROJECT_ROOT = Path(__file__).resolve().parent.parent
METRICS_PATH = PROJECT_ROOT / "data" / "conflict_metrics.json"
TELEGRAM_INDEX_PATH = PROJECT_ROOT / "data" / "telegram_archive" / "telegram_index.json"
CONTRACT_PATH = PROJECT_ROOT / "specs" / "016-daily-timeline-assembly-validator" / "contracts" / "timeline_freshness_contract.json"
MADRID_TZ = ZoneInfo("Europe/Madrid")

SPANISH_MONTHS = {
    "enero": 1, "febrero": 2, "marzo": 3, "abril": 4,
    "mayo": 5, "junio": 6, "julio": 7, "agosto": 8,
    "septiembre": 9, "octubre": 10, "noviembre": 11, "diciembre": 12
}

def get_madrid_now() -> datetime:
    """Returns current datetime in Europe/Madrid timezone."""
    return datetime.now(MADRID_TZ)

def parse_milestone_date(date_str: str) -> Optional[date]:
    """
    Parses date from various formats:
    - ISO: '2026-09-01'
    - Spanish text: '1 de septiembre de 2026', '29 de agosto de 2026 (HOY)', '24 de agosto'
    - Range: '2021 – 2025'
    """
    if not date_str or not isinstance(date_str, str):
        return None
    
    clean_str = date_str.strip().lower()
    clean_str = re.sub(r"\(hoy\)", "", clean_str).strip()
    
    # Range pattern like '2021 – 2025' or '2021-2025' -> use start date
    range_match = re.match(r"^(\d{4})\s*[-–—]\s*(\d{4})", clean_str)
    if range_match:
        return date(int(range_match.group(1)), 1, 1)
    
    # ISO pattern YYYY-MM-DD
    iso_match = re.match(r"^(\d{4})-(\d{1,2})-(\d{1,2})", clean_str)
    if iso_match:
        year, month, day = map(int, iso_match.groups())
        return date(year, month, day)
    
    # Spanish pattern: 'DD de [mes] de YYYY' or 'DD de [mes]'
    text_match = re.search(r"(\d{1,2})\s+de\s+([a-záéíóú]+)(?:\s+de\s+(\d{4}))?", clean_str)
    if text_match:
        day = int(text_match.group(1))
        month_name = text_match.group(2)
        year_str = text_match.group(3)
        year = int(year_str) if year_str else 2026
        
        month = SPANISH_MONTHS.get(month_name)
        if month:
            try:
                return date(year, month, day)
            except ValueError:
                return None
                
    return None

def evaluate_timeline_freshness(
    timeline: List[Dict[str, Any]], 
    reference_date: Optional[date] = None
) -> Dict[str, Any]:
    """
    Evaluates freshness status for a given timeline against a reference date (defaults to today in Madrid).
    """
    if reference_date is None:
        reference_date = get_madrid_now().date()
        
    parsed_dates = []
    for item in timeline:
        d = parse_milestone_date(item.get("date", ""))
        if d:
            parsed_dates.append((d, item))
            
    if not parsed_dates:
        return {
            "reference_date": reference_date.isoformat(),
            "latest_milestone_date": None,
            "days_delta": 999,
            "status_code": "STALE_ALERT",
            "is_weekend": reference_date.weekday() >= 5,
            "badge_color": "rose",
            "headline": "Alerta Crítica: Sin cronología disponible",
            "description": "No se encontraron fechas válidas en la cronología.",
            "action_required": True,
            "total_milestones": len(timeline)
        }
        
    # Sort chronological
    parsed_dates.sort(key=lambda x: x[0])
    latest_date, latest_item = parsed_dates[-1]
    
    days_delta = (reference_date - latest_date).days
    is_weekend = reference_date.weekday() >= 5  # 5=Saturday, 6=Sunday
    
    if days_delta <= 0:
        status_code = "UP_TO_DATE"
        badge_color = "emerald"
        headline = "Cronología al Día: Novedades de hoy registradas"
        description = f"Se han registrado eventos para la fecha actual ({reference_date.strftime('%d/%m/%Y')})."
        action_required = False
    elif days_delta == 1 and not is_weekend:
        status_code = "PENDING_TODAY"
        badge_color = "amber"
        headline = "Novedades de Hoy Pendientes de Registro"
        description = f"La última entrada registrada es del {latest_date.strftime('%d/%m/%Y')}. Pendiente actualizar con las asambleas y comunicados de hoy ({reference_date.strftime('%d/%m/%Y')})."
        action_required = True
    elif is_weekend and days_delta <= 2:
        status_code = "WEEKEND_PAUSE"
        badge_color = "sky"
        headline = "Fin de Semana / Pausa de Negociación"
        description = f"Última actividad registrada el {latest_date.strftime('%d/%m/%Y')}. Fin de semana sin asambleas generales ordinarias."
        action_required = False
    else:
        status_code = "STALE_ALERT"
        badge_color = "rose"
        headline = f"Alerta de Desactualización: {days_delta} días sin registrar"
        description = f"La cronología no registra actividad desde el {latest_date.strftime('%d/%m/%Y')}. Requiere sincronización urgente."
        action_required = True
        
    return {
        "reference_date": reference_date.isoformat(),
        "latest_milestone_date": latest_date.isoformat(),
        "days_delta": max(0, days_delta),
        "status_code": status_code,
        "is_weekend": is_weekend,
        "badge_color": badge_color,
        "headline": headline,
        "description": description,
        "action_required": action_required,
        "total_milestones": len(timeline),
        "latest_milestone": {
            "id": latest_item.get("id"),
            "date": latest_item.get("date"),
            "title": latest_item.get("title"),
            "actor": latest_item.get("actor")
        }
    }

def validate_timeline_integrity(timeline: List[Dict[str, Any]]) -> Tuple[bool, List[str]]:
    """
    Validates chronological monotonicity (strictly ascending or strictly descending),
    non-empty fields, and primary document linkages.
    """
    errors = []
    seen_ids = set()
    parsed_entries = []
    
    for idx, item in enumerate(timeline):
        item_id = item.get("id")
        if not item_id:
            errors.append(f"Milestone index {idx} lacks an 'id' field.")
        elif item_id in seen_ids:
            errors.append(f"Duplicate milestone id '{item_id}' at index {idx}.")
        else:
            seen_ids.add(item_id)
            
        m_date = parse_milestone_date(item.get("date", ""))
        if not m_date:
            errors.append(f"Milestone '{item_id}' has invalid date format: '{item.get('date')}'.")
        else:
            parsed_entries.append((m_date, item_id))
            
        # Verify linked document if file_path or source_url is present
        file_path = item.get("source_url") or item.get("file_path")
        if file_path and isinstance(file_path, str) and file_path.startswith("data/"):
            resolved_doc = PROJECT_ROOT / file_path
            if not resolved_doc.exists():
                errors.append(f"Milestone '{item_id}' references non-existent file: {file_path}")
                
    # Check monotonicity
    if len(parsed_entries) >= 2:
        dates = [d for d, _ in parsed_entries]
        is_ascending = all(dates[i] <= dates[i+1] for i in range(len(dates)-1))
        is_descending = all(dates[i] >= dates[i+1] for i in range(len(dates)-1))
        if not (is_ascending or is_descending):
            errors.append("Timeline entries are not monotonically ordered (must be consistent ascending or descending).")
                
    return len(errors) == 0, errors

def main() -> int:
    """CLI execution entrypoint."""
    if not METRICS_PATH.exists():
        print(f"[ERROR] Conflict metrics file not found at: {METRICS_PATH}", file=sys.stderr)
        return 1
        
    with open(METRICS_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    timeline = data.get("timeline", [])
    if not timeline:
        print("[ERROR] No 'timeline' key or empty timeline in conflict_metrics.json", file=sys.stderr)
        return 1
        
    is_valid, errors = validate_timeline_integrity(timeline)
    madrid_now = get_madrid_now()
    report = evaluate_timeline_freshness(timeline, madrid_now.date())
    
    print(f"=== Airbus Strikes Analysis - Timeline Freshness Validator ===")
    print(f"Madrid Reference Date: {report['reference_date']} (Time: {madrid_now.strftime('%H:%M:%S %Z')})")
    print(f"Total Milestones:      {report['total_milestones']}")
    print(f"Latest Milestone Date: {report['latest_milestone_date']} (Delta: {report['days_delta']} days)")
    print(f"Status Code:           {report['status_code']} [{report['badge_color'].upper()}]")
    print(f"Headline:              {report['headline']}")
    print(f"Description:           {report['description']}")
    print(f"Action Required:       {report['action_required']}")
    print("---------------------------------------------------------------")
    
    if not is_valid:
        print(f"[FAIL] Timeline integrity errors found ({len(errors)}):", file=sys.stderr)
        for err in errors:
            print(f"  - {err}", file=sys.stderr)
        return 1
        
    print("[PASS] Timeline integrity and chronological monotonicity verified.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
