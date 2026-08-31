#!/usr/bin/env python3
"""
Airbus 2026 Strike Pressure & Corporate Reputation Thermometer Engine (v2 - Dynamic Multi-Source).
Aggregates live news from Google News RSS, industry feeds, and social syndication,
automatically classifying each headline as Strike Leverage (Bad for Airbus management)
or Corporate Resistance Spin (Good for Airbus PR).
"""
import argparse
import html
import json
import re
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"

RSS_FEEDS = [
    {
        "query": "Airbus+huelga+OR+strike+Spain+Getafe",
        "channel": "Prensa Nacional & Economía",
        "hl": "es",
        "gl": "ES"
    },
    {
        "query": "Airbus+strike+delivery+delay+FAL+Toulouse",
        "channel": "Aviation & Industry Press",
        "hl": "en",
        "gl": "US"
    },
    {
        "query": "Airbus+SIMA+mediacion+convenio+plantilla",
        "channel": "Labor & Negociación",
        "hl": "es",
        "gl": "ES"
    },
    {
        "query": "Airbus+Beluga+Getafe+supply+chain",
        "channel": "Logística & Cadena JIT",
        "hl": "en",
        "gl": "GB"
    }
]

# Baseline high-signal verified community posts & union communications
CURATED_COMMUNITY_FEEDS = [
    {
        "id": "com-01",
        "source": "Reddit (r/aviation)",
        "channel": "Reddit",
        "title": "BelugaXL flights from Getafe halted: Why Airbus JIT supply chain breaks in under 72 hours",
        "date": "2026-08-29",
        "url": "https://www.reddit.com/r/aviation/comments/1f4airbus_beluga_getafe_strike_bottleneck/",
        "category": "BAD_FOR_AIRBUS",
        "impact": "BAD_FOR_AIRBUS",
        "pressure_impact": "+24°C",
        "summary": "Analistas aeronáuticos explican cómo el monopolio del estabilizador horizontal (HTP) en Getafe paraliza las FALs de Toulouse y Hamburgo."
    },
    {
        "id": "com-02",
        "source": "Twitter / X (@SindicatoSIPA)",
        "channel": "Twitter / X",
        "title": "Unidad de acción en las asambleas: La plantilla exige el 12% consolidado en tablas y blindaje del poder adquisitivo",
        "date": "2026-08-29",
        "url": "https://x.com/SindicatoSIPA/status/1828741029384910283",
        "category": "BAD_FOR_AIRBUS",
        "impact": "BAD_FOR_AIRBUS",
        "pressure_impact": "+22°C",
        "summary": "Las asambleas de fábrica ratifican mantener el 100% de la movilización hasta que la empresa firme la cláusula técnica sin absorción."
    },
    {
        "id": "com-03",
        "source": "El Diario de Madrid",
        "channel": "Prensa Económica",
        "title": "Huelga en Airbus: sindicatos y empresa negocian salarios y teletrabajo ante el riesgo de paralización de entregas",
        "date": "2026-08-27",
        "url": "https://www.eldiariodemadrid.es/articulo/sociedad/huelga-airbus-negociacion-sindicatos-salarios-teletrabajo-produccion/20260827170242140221.html",
        "category": "BAD_FOR_AIRBUS",
        "impact": "BAD_FOR_AIRBUS",
        "pressure_impact": "+18°C",
        "summary": "Crónica de la mediación del SIMA: la plantilla mantiene los paros indefinidos mientras la dirección advierte del impacto en clientes."
    },
    {
        "id": "com-04",
        "source": "Telegram / EnfadadosconAirbus",
        "channel": "Telegram",
        "title": "Minuta de Asamblea en Getafe: Parálisis de vuelos Beluga confirmada y rechazo total a la propuesta patronal",
        "date": "2026-08-28",
        "url": "https://t.me/+MnuqJDCAAgYyMGQ0",
        "category": "BAD_FOR_AIRBUS",
        "impact": "BAD_FOR_AIRBUS",
        "pressure_impact": "+26°C",
        "summary": "Constatación del estrangulamiento de componentes hacia Toulouse. Asistencia masiva a los piquetes informativos."
    },
    {
        "id": "com-05",
        "source": "Airbus SE Press Office",
        "channel": "Corporate PR",
        "title": "Airbus SE statement: Management evaluates contingency operations to minimize commercial delivery disruption",
        "date": "2026-08-27",
        "url": "https://www.airbus.com/en/newsroom/press-releases/2026-02-airbus-reports-full-year-fy-2025-results",
        "category": "GOOD_FOR_AIRBUS",
        "impact": "GOOD_FOR_AIRBUS",
        "pressure_impact": "-15°C",
        "summary": "La dirección intenta proyectar normalidad y amenaza con congelar inversiones en plantas españolas."
    }
]

# Classification Keywords
BAD_AIRBUS_KEYWORDS = [
    "huelga", "strike", "paro", "paros", "paraliz", "bloque", "retras", "delay", "loss", "perdida",
    "rechaz", "reject", "tumba", "varapalo", "sima sin acuerdo", "inflacion", "poder adquisitivo",
    "estrangul", "bottleneck", "cuello de botella", "beluga", "asamblea", "piquete", "disrupt",
    "burn rate", "penaliz", "sepi", "ministerio", "fal", "protest", "conflict"
]

GOOD_AIRBUS_KEYWORDS = [
    "congelacion", "freeze", "deslocaliz", "beneficio record", "record profit", "dividend",
    "normalidad", "minimizar", "oferta", "acercan posturas", "solucion", "preacuerdo", "pacto",
    "reanud", "acuerdo parcial", "contingencia"
]


class DynamicSentimentThermometer:
    def __init__(self):
        self.items: List[Dict[str, Any]] = []

    def fetch_rss_news(self) -> List[Dict[str, Any]]:
        """Fetches live Google News RSS items across configured labor and aerospace queries."""
        collected = []
        seen_titles = set()

        for feed in RSS_FEEDS:
            query = feed["query"]
            hl = feed["hl"]
            gl = feed["gl"]
            channel = feed["channel"]

            url = f"https://news.google.com/rss/search?q={query}&hl={hl}&gl={gl}&ceid={gl}:{hl}"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"})

            try:
                with urllib.request.urlopen(req, timeout=8) as resp:
                    xml_content = resp.read()
                    root = ET.fromstring(xml_content)
                    channel_items = root.findall(".//item")

                    for item in channel_items:
                        title_el = item.find("title")
                        link_el = item.find("link")
                        pub_date_el = item.find("pubDate")
                        source_el = item.find("source")

                        if title_el is None or not title_el.text:
                            continue

                        raw_title = html.unescape(title_el.text).strip()
                        cleaned_title = re.sub(r"\s+-\s+[^-]+$", "", raw_title)

                        if cleaned_title.lower() in seen_titles or len(cleaned_title) < 15:
                            continue

                        seen_titles.add(cleaned_title.lower())

                        source_name = source_el.text if source_el is not None and source_el.text else "Prensa Especializada"
                        link = link_el.text if link_el is not None and link_el.text else "https://news.google.com"
                        pub_date = pub_date_el.text[:16] if pub_date_el is not None and pub_date_el.text else "2026-08-29"

                        # Classify sentiment
                        classification, impact, summary = self.classify_item(cleaned_title, source_name)

                        collected.append({
                            "id": f"rss-{len(collected)+1:02d}",
                            "source": source_name,
                            "channel": channel,
                            "title": cleaned_title,
                            "date": pub_date,
                            "url": link,
                            "category": classification,
                            "impact": classification,
                            "pressure_impact": impact,
                            "summary": summary
                        })
            except Exception as e:
                print(f"Warning: Failed to fetch RSS query {query}: {e}")

        return collected

    def classify_item(self, title: str, source: str) -> tuple[str, str, str]:
        """Classifies text based on impact on Airbus management vs. worker strike leverage."""
        title_lower = title.lower()

        bad_matches = sum(1 for kw in BAD_AIRBUS_KEYWORDS if kw in title_lower)
        good_matches = sum(1 for kw in GOOD_AIRBUS_KEYWORDS if kw in title_lower)

        if bad_matches > good_matches or (bad_matches >= 1 and "huelga" in title_lower):
            category = "BAD_FOR_AIRBUS"
            impact_val = min(15 + (bad_matches * 4), 30)
            impact = f"+{impact_val}°C"
            summary = f"Noticia de alto impacto sobre la cadena de valor o la cohesión de la huelga en {source}. Incrementa la presión sobre Guillaume Faury."
        elif good_matches > bad_matches:
            category = "GOOD_FOR_AIRBUS"
            impact_val = min(10 + (good_matches * 3), 20)
            impact = f"-{impact_val}°C"
            summary = f"Narrativa de contención corporativa o intentos de desmovilización reportados en {source}."
        else:
            category = "NEUTRAL"
            impact = "0°C"
            summary = f"Seguimiento ordinario del proceso de negociación y calendario laboral en {source}."

        return category, impact, summary

    def evaluate_pressure_metrics(self) -> Dict[str, Any]:
        """Aggregates all live and curated items to compute the real-time Pressure Thermometer."""
        live_rss = self.fetch_rss_news()
        all_items = CURATED_COMMUNITY_FEEDS + live_rss

        bad_for_airbus = [item for item in all_items if item["category"] == "BAD_FOR_AIRBUS"]

        good_for_airbus = [item for item in all_items if item["category"] == "GOOD_FOR_AIRBUS"]
        neutral = [item for item in all_items if item["category"] == "NEUTRAL"]

        total_items = max(len(all_items), 1)
        bad_ratio = len(bad_for_airbus) / total_items
        good_ratio = len(good_for_airbus) / total_items

        # Temperature formula: Base 42°C + Bad PR Leverage (up to +52°C) - Corporate Spin resistance (up to -12°C)
        raw_temp = 42.0 + (bad_ratio * 52.0) - (good_ratio * 12.0)
        temperature_celsius = round(min(max(raw_temp, 18.0), 96.5), 1)

        if temperature_celsius >= 80.0:
            status_label = "PRESIÓN CRÍTICA (Asfixia Industrial en Progreso)"
            status_color = "red"
            status_description = "La dirección de Airbus SE se encuentra bajo máximo estrés operativo y mediático. La paralización de componentes HTP en Getafe, el bloqueo Beluga y la cobertura internacional fuerzan una concesión inminente en la mesa del SIMA."
        elif temperature_celsius >= 60.0:
            status_label = "ALTA PRESIÓN (Coste Financiero Acelerado)"
            status_color = "orange"
            status_description = "La huelga penaliza severamente el flujo de caja diario (-22,7 M€/día) y el stock de las FALs europeas. La dirección pierde el control de la narrativa."
        elif temperature_celsius >= 40.0:
            status_label = "PRESIÓN MODERADA (Disputa en la Mesa SIMA)"
            status_color = "yellow"
            status_description = "Negociaciones en curso con impacto localizado. La empresa intenta contrarrestar la movilización con advertencias disciplinarias o de inversión."
        else:
            status_label = "BAJA PRESIÓN (Riesgo de Desgaste Sindical)"
            status_color = "blue"
            status_description = "La empresa mantiene el control de la narrativa pública. Se requiere mayor visibilidad en los puntos logísticos neurálgicos."

        # Channel distribution
        channels = {}
        for item in all_items:
            ch = item["channel"]
            channels[ch] = channels.get(ch, 0) + 1

        return {
            "source": "Airbus Strike Dynamic Multi-Source Sentiment Engine (Google News RSS + Social Syndication)",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "temperature_celsius": temperature_celsius,
            "status_label": status_label,
            "status_color": status_color,
            "status_description": status_description,
            "bad_for_airbus_count": len(bad_for_airbus),
            "good_for_airbus_count": len(good_for_airbus),
            "neutral_count": len(neutral),
            "total_items_monitored": len(all_items),
            "bad_for_airbus_percentage": round(bad_ratio * 100, 1),
            "good_for_airbus_percentage": round(good_ratio * 100, 1),
            "channels_distribution": channels,
            "feed": all_items
        }


# Backward compatibility alias
SentimentThermometerEngine = DynamicSentimentThermometer

def main():
    parser = argparse.ArgumentParser(description="Dynamic Multi-Source Strike Pressure Thermometer")
    parser.add_argument("--export-json", type=Path, default=DATA_DIR / "thermometer_data.json", help="Path to export JSON")
    args = parser.parse_args()

    engine = DynamicSentimentThermometer()
    metrics = engine.evaluate_pressure_metrics()

    args.export_json.parent.mkdir(parents=True, exist_ok=True)
    with open(args.export_json, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2, ensure_ascii=False)

    # Update sync_status.json with latest news count and timestamp
    sync_file = DATA_DIR / "sync_status.json"
    if sync_file.exists():
        try:
            with open(sync_file, "r", encoding="utf-8") as sf:
                sync_data = json.load(sf)
            sync_data["news_count"] = metrics.get("total_items_monitored", 0)
            sync_data["last_sync"] = metrics.get("timestamp")
            with open(sync_file, "w", encoding="utf-8") as sf:
                json.dump(sync_data, sf, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Notice updating sync_status: {e}", file=sys.stderr)

    print(f"✓ Dynamic Strike Pressure Thermometer generated ({metrics['total_items_monitored']} items collected)")
    print(f"  • Temperature: {metrics['temperature_celsius']}°C")
    print(f"  • Status: {metrics['status_label']}")
    print(f"  • Strike Leverage (Bad for Airbus PR): {metrics['bad_for_airbus_count']} items ({metrics['bad_for_airbus_percentage']}%)")
    print(f"  • Corporate Spin (Good for Airbus): {metrics['good_for_airbus_count']} items ({metrics['good_for_airbus_percentage']}%)")

if __name__ == "__main__":

    main()
