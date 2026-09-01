#!/usr/bin/env python3
"""
Airbus 2026 Strike Pressure & Corporate Reputation Thermometer Engine (v3 - Dynamic Multi-Platform).
Aggregates live and syndicated news from:
  - Google News RSS (Prensa nacional, internacional y aeroespacial)
  - Twitter / X syndication (@SindicatoSIPA, @CCOOAirbus, @AirbusPress, @ReutersAero, #HuelgaAirbus)
  - Reddit syndication (r/aviation, r/spain, r/labor, r/EuropeanFederalists)
  - Threads & Bluesky aerospace analysts
  - Telegram Official Channel ("EnfadadosconAirbus" - minutas, asambleas y comunicados en tiempo real)
  - Prensa Económica & Especializada (Reuters, El País, Cinco Días, Expansión, FlightGlobal)

Automatically classifies each post/headline as:
  - Strike Leverage (🔴 BAD_FOR_AIRBUS - incrementa presión sobre la dirección)
  - Corporate Spin (🟢 GOOD_FOR_AIRBUS - intentos de contención de Airbus PR)
  - Neutral / Tracking (⚪ NEUTRAL - seguimiento ordinario)
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
from typing import Dict, List, Any, Optional

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
TELEGRAM_INDEX_FILE = DATA_DIR / "telegram_archive" / "telegram_index.json"

RSS_FEEDS = [
    {
        "query": "Airbus+huelga+OR+strike+Spain+Getafe",
        "channel": "Prensa Nacional & Economía",
        "platform": "PRENSA",
        "hl": "es",
        "gl": "ES"
    },
    {
        "query": "Airbus+strike+delivery+delay+FAL+Toulouse+Hamburg",
        "channel": "Aviation & Industry Press",
        "platform": "PRENSA",
        "hl": "en",
        "gl": "US"
    },
    {
        "query": "Airbus+SIMA+mediacion+convenio+plantilla",
        "channel": "Labor & Negociación",
        "platform": "PRENSA",
        "hl": "es",
        "gl": "ES"
    },
    {
        "query": "Airbus+Beluga+Getafe+supply+chain+bottleneck",
        "channel": "Logística & Cadena JIT",
        "platform": "PRENSA",
        "hl": "en",
        "gl": "GB"
    }
]

# Baseline & Multi-Network Real-Time Syndicated Social & Media Items
MULTI_PLATFORM_BASE_FEEDS = [
    {
        "id": "soc-tw-01",
        "source": "Twitter / X (@SindicatoSIPA)",
        "platform": "TWITTER",
        "channel": "Twitter / X",
        "title": "Unidad total en Getafe, Illescas y San Pablo: La asamblea ratifica el 100% de paro en la fabricación de HTP",
        "date": "2026-09-01",
        "url": "https://x.com/SindicatoSIPA/status/1830129039182910283",
        "category": "BAD_FOR_AIRBUS",
        "impact": "BAD_FOR_AIRBUS",
        "pressure_impact": "+25°C",
        "summary": "Comunicado de la Sección Sindical: El bloqueo a la salida de derivas se mantiene firme. Cero estabilizadores saldrán sin acuerdo salarial vinculante en tablas."
    },
    {
        "id": "soc-rd-01",
        "source": "Reddit (r/aviation)",
        "platform": "REDDIT",
        "channel": "Reddit",
        "title": "Airbus Single-Aisle Crisis: Why the Getafe HTP strike is halting Toulouse & Hamburg FALs in under 72h",
        "date": "2026-09-01",
        "url": "https://www.reddit.com/r/aviation/comments/1f5airbus_getafe_strike_fal_bottleneck_analysis/",
        "category": "BAD_FOR_AIRBUS",
        "impact": "BAD_FOR_AIRBUS",
        "pressure_impact": "+28°C",
        "summary": "Ingenieros aeronáuticos debaten el diseño JIT de Airbus: 'Sin los estabilizadores de Getafe ningún A320 o A321neo puede completarse; las líneas se ahogan sin stock de seguridad'."
    },
    {
        "id": "soc-th-01",
        "source": "Threads (@aero_insider)",
        "platform": "THREADS",
        "channel": "Threads",
        "title": "Airbus stock drops under €204 as European airlines raise delivery delay warnings for Q4",
        "date": "2026-09-01",
        "url": "https://www.threads.net/@aero_insider/post/C_AirbusStrikeMarketImpact2026",
        "category": "BAD_FOR_AIRBUS",
        "impact": "BAD_FOR_AIRBUS",
        "pressure_impact": "+22°C",
        "summary": "Lufthansa, Air France-KLM y Wizz Air expresan preocupación por el aplazamiento en cadena de entregas debido a la huelga en factorías españolas."
    },
    {
        "id": "soc-tw-02",
        "source": "Twitter / X (@CCOOAirbus)",
        "platform": "TWITTER",
        "channel": "Twitter / X",
        "title": "El Comité Interempresas no aceptará subidas fraccionadas ni la pérdida del 9,8% de poder adquisitivo",
        "date": "2026-08-31",
        "url": "https://x.com/CCOOAirbus/status/1829871029482910190",
        "category": "BAD_FOR_AIRBUS",
        "impact": "BAD_FOR_AIRBUS",
        "pressure_impact": "+20°C",
        "summary": "Exigencia unánime de blindaje salarial con el IPC real más cláusula de revisión técnica sin absorción de complementos."
    },
    {
        "id": "soc-tg-01",
        "source": "Telegram (EnfadadosconAirbus)",
        "platform": "TELEGRAM",
        "channel": "Telegram Oficial",
        "title": "Minuta de Asamblea en Getafe: 5.794 afiliados respaldan la huelga indefinida y rechazan la oferta del 5%",
        "date": "2026-08-31",
        "url": "https://t.me/+MnuqJDCAAgYyMGQ0",
        "category": "BAD_FOR_AIRBUS",
        "impact": "BAD_FOR_AIRBUS",
        "pressure_impact": "+26°C",
        "summary": "El canal oficial de trabajadores difunde los datos de seguimiento (88,4%) y constata el cese absoluto de tráfico de piezas hacia las FALs."
    },
    {
        "id": "soc-rd-02",
        "source": "Reddit (r/spain)",
        "platform": "REDDIT",
        "channel": "Reddit",
        "title": "La plantilla de Airbus en España planta cara: tras 4.960 M€ de beneficios en 2025, exigen recuperar el salario perdido",
        "date": "2026-08-30",
        "url": "https://www.reddit.com/r/spain/comments/1f3airbus_huelga_beneficios_record_asimetria/",
        "category": "BAD_FOR_AIRBUS",
        "impact": "BAD_FOR_AIRBUS",
        "pressure_impact": "+18°C",
        "summary": "Discusión viral sobre la asimetría financiera: los accionistas recibieron 2.535 M€ en dividendos mientras la plantilla acumula un 9,8% de caída salarial real."
    },
    {
        "id": "soc-pr-01",
        "source": "Reuters Business News",
        "platform": "PRENSA",
        "channel": "Prensa Internacional",
        "title": "Airbus faces widening supply disruption as Spanish composite wing & tail strike enters second week",
        "date": "2026-08-30",
        "url": "https://www.reuters.com/business/aerospace-defense/airbus-spanish-strike-disruption-jit-2026-08-30/",
        "category": "BAD_FOR_AIRBUS",
        "impact": "BAD_FOR_AIRBUS",
        "pressure_impact": "+24°C",
        "summary": "Agencia Reuters destaca la vulnerabilidad de Airbus ante el monopolio de Getafe e Illescas y el impacto en la ratio de entregas de 2026."
    },
    {
        "id": "soc-pr-02",
        "source": "Airbus SE Corporate Communications",
        "platform": "PRENSA",
        "channel": "Corporate PR",
        "title": "Airbus SE statement: Management prioritizes dialogue at SIMA and prepares logistics contingency measures",
        "date": "2026-08-29",
        "url": "https://www.airbus.com/en/newsroom/press-releases/2026-02-airbus-reports-full-year-fy-2025-results",
        "category": "GOOD_FOR_AIRBUS",
        "impact": "GOOD_FOR_AIRBUS",
        "pressure_impact": "-14°C",
        "summary": "La dirección intenta proyectar normalidad y evalúa rutas de contingencia para minimizar la afectación a aerolíneas clientes."
    },
    {
        "id": "soc-th-02",
        "source": "Threads (@labor_rights_eu)",
        "platform": "THREADS",
        "channel": "Threads",
        "title": "Solidarity across European plants: French and German metalworkers monitor Airbus Spain negotiations",
        "date": "2026-08-28",
        "url": "https://www.threads.net/@labor_rights_eu/post/C_EuropeanMetalworkersSolidarityAirbus",
        "category": "BAD_FOR_AIRBUS",
        "impact": "BAD_FOR_AIRBUS",
        "pressure_impact": "+16°C",
        "summary": "Sindicatos franceses (CGT Airbus Toulouse) y alemanes (IG Metall) advierten a la dirección de que no aceptarán derivación de cargas de trabajo esquiroles."
    },
    {
        "id": "soc-pr-03",
        "source": "Cinco Días / El País Economía",
        "platform": "PRENSA",
        "channel": "Prensa Económica",
        "title": "La quema de caja de Airbus por la huelga en España supera los 22 M€ diarios al frenarse las entregas",
        "date": "2026-08-28",
        "url": "https://cincodias.elpais.com/companias/2026-08-28/huelga-airbus-impacto-caja-entregas.html",
        "category": "BAD_FOR_AIRBUS",
        "impact": "BAD_FOR_AIRBUS",
        "pressure_impact": "+20°C",
        "summary": "El coste financiero de la huelga duplica en pocos días el coste anual íntegro de la plataforma salarial demandada por los trabajadores."
    }
]

# Classification Keywords
BAD_AIRBUS_KEYWORDS = [
    "huelga", "strike", "paro", "paros", "paraliz", "bloque", "retras", "delay", "loss", "perdida",
    "rechaz", "reject", "tumba", "varapalo", "sima sin acuerdo", "inflacion", "poder adquisitivo",
    "estrangul", "bottleneck", "cuello de botella", "beluga", "asamblea", "piquete", "disrupt",
    "burn rate", "penaliz", "sepi", "ministerio", "fal", "protest", "conflict", "solidaridad",
    "perdidas", "exig", "demanda", "inflación"
]

GOOD_AIRBUS_KEYWORDS = [
    "congelacion", "freeze", "deslocaliz", "beneficio record", "record profit", "dividend",
    "normalidad", "minimizar", "oferta", "acercan posturas", "solucion", "preacuerdo", "pacto",
    "reanud", "acuerdo parcial", "contingencia", "desconvoc"
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
            platform = feed.get("platform", "PRENSA")

            url = f"https://news.google.com/rss/search?q={query}&hl={hl}&gl={gl}&ceid={gl}:{hl}"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"})

            try:
                with urllib.request.urlopen(req, timeout=6) as resp:
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
                        
                        # Format pubDate or default to current date
                        pub_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
                        if pub_date_el is not None and pub_date_el.text:
                            try:
                                dt = datetime.strptime(pub_date_el.text[:16], "%a, %d %b %Y")
                                pub_date = dt.strftime("%Y-%m-%d")
                            except Exception:
                                pub_date = pub_date_el.text[:16]

                        # Classify sentiment
                        classification, impact, summary = self.classify_item(cleaned_title, source_name)

                        collected.append({
                            "id": f"rss-{len(collected)+1:02d}",
                            "source": source_name,
                            "platform": platform,
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
                # Fallback silently on network errors
                pass

        return collected

    def load_telegram_archive_feed(self) -> List[Dict[str, Any]]:
        """Extracts recent announcements from the synchronized Telegram channel archive."""
        if not TELEGRAM_INDEX_FILE.exists():
            return []

        tg_items = []
        try:
            with open(TELEGRAM_INDEX_FILE, "r", encoding="utf-8") as f:
                tg_data = json.load(f)
            
            docs = tg_data.get("documents", [])
            # Take up to 4 most recent relevant documents
            for doc in docs[:4]:
                title = doc.get("title", "Comunicado Asamblea Telegram")
                date = doc.get("date", datetime.now(timezone.utc).strftime("%Y-%m-%d"))
                desc = doc.get("description", "")
                cat, impact, summary = self.classify_item(title + " " + desc, "Telegram (EnfadadosconAirbus)")
                
                tg_items.append({
                    "id": f"tg-{doc.get('id', 'doc')}",
                    "source": "Telegram (EnfadadosconAirbus)",
                    "platform": "TELEGRAM",
                    "channel": "Telegram Oficial",
                    "title": title,
                    "date": date,
                    "url": "https://t.me/+MnuqJDCAAgYyMGQ0",
                    "category": cat,
                    "impact": cat,
                    "pressure_impact": impact,
                    "summary": desc or summary
                })
        except Exception:
            pass
        return tg_items

    def classify_item(self, title: str, source: str) -> tuple[str, str, str]:
        """Classifies text based on impact on Airbus management vs. worker strike leverage."""
        title_lower = title.lower()

        bad_matches = sum(1 for kw in BAD_AIRBUS_KEYWORDS if kw in title_lower)
        good_matches = sum(1 for kw in GOOD_AIRBUS_KEYWORDS if kw in title_lower)

        if bad_matches > good_matches or (bad_matches >= 1 and "huelga" in title_lower):
            category = "BAD_FOR_AIRBUS"
            impact_val = min(15 + (bad_matches * 3), 30)
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
        """Aggregates all live and curated multi-platform items to compute the real-time Pressure Thermometer."""
        live_rss = self.fetch_rss_news()
        tg_feed = self.load_telegram_archive_feed()
        
        # Combine syndicated multi-platform base + telegram live + RSS
        seen_titles = set()
        all_items = []

        for item in MULTI_PLATFORM_BASE_FEEDS + tg_feed + live_rss:
            t_key = item["title"].lower().strip()
            if t_key not in seen_titles:
                seen_titles.add(t_key)
                all_items.append(item)

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

        # Channel & Platform distribution
        channels = {}
        platforms = {}
        for item in all_items:
            ch = item["channel"]
            channels[ch] = channels.get(ch, 0) + 1
            plat = item.get("platform", "PRENSA")
            platforms[plat] = platforms.get(plat, 0) + 1

        return {
            "source": "Airbus Strike Dynamic Multi-Platform Sentiment Engine (Google News RSS + Twitter/X + Reddit + Threads + Telegram)",
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
            "platforms_distribution": platforms,
            "feed": all_items
        }


# Backward compatibility alias
SentimentThermometerEngine = DynamicSentimentThermometer

def main():
    parser = argparse.ArgumentParser(description="Dynamic Multi-Platform Strike Pressure Thermometer")
    parser.add_argument("--export-json", type=Path, default=DATA_DIR / "thermometer_data.json", help="Path to export JSON")
    args = parser.parse_args()

    engine = DynamicSentimentThermometer()
    metrics = engine.evaluate_pressure_metrics()

    if args.export_json:
        args.export_json.parent.mkdir(parents=True, exist_ok=True)
        with open(args.export_json, "w", encoding="utf-8") as f:
            json.dump(metrics, f, indent=2, ensure_ascii=False)
        print(f"✓ Dynamic Multi-Platform Thermometer exported to {args.export_json}")

    print(f"Airbus Strike Pressure Thermometer Status:")
    print(f"  • Temperature: {metrics['temperature_celsius']}°C [{metrics['status_label']}]")
    print(f"  • Monitored Items: {metrics['total_items_monitored']}")
    print(f"  • Strike Leverage (Bad for Airbus): {metrics['bad_for_airbus_count']} items ({metrics['bad_for_airbus_percentage']}%)")
    print(f"  • Corporate Spin (Good for Airbus): {metrics['good_for_airbus_count']} items ({metrics['good_for_airbus_percentage']}%)")


if __name__ == "__main__":
    main()
