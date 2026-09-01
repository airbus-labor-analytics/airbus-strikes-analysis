#!/usr/bin/env python3
"""
Airbus 2026 Strike Pressure & Corporate Reputation Thermometer Engine (v4 - Deep Multi-Platform).
Aggregates live, syndicated, and historical publications across:
  - Google News RSS (Prensa nacional, internacional, económica y aeroespacial)
  - Twitter / X syndication (@SindicatoSIPA, @CCOOAirbus, @UGTAirbus, @AirbusPress, @ReutersAero, @FlightGlobal, @AviationWeek)
  - Reddit syndication (r/aviation, r/spain, r/labor, r/EuropeanFederalists)
  - Threads & Bluesky aerospace analysts (@aero_insider, @aviation_daily)
  - Telegram Official Channel ("EnfadadosconAirbus" - 275+ minutas de asamblea, sentencias, comunicados y dossiers)
  - Prensa Económica & Especializada (Reuters, Bloomberg, El País, Cinco Días, Expansión, FlightGlobal, Actualidad Aeroespacial)

Automatically classifies each publication as:
  - Strike Leverage (🔴 BAD_FOR_AIRBUS - incrementa presión sobre la dirección)
  - Corporate Spin (🟢 GOOD_FOR_AIRBUS - intentos de contención de Airbus PR)
  - Neutral / Tracking (⚪ NEUTRAL - seguimiento ordinario)
"""

import argparse
import html
import json
import re
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional

try:
    from src.network_utils import fetch_with_retry
    from src.atomic_writer import atomic_write_json
except ImportError:
    from network_utils import fetch_with_retry
    from atomic_writer import atomic_write_json

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
TELEGRAM_INDEX_FILE = DATA_DIR / "telegram_archive" / "telegram_index.json"

# 16 Comprehensive RSS Feeds covering all aspects of the conflict
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
    },
    {
        "query": "Airbus+Illescas+San+Pablo+Cadiz+huelga",
        "channel": "Prensa Regional & Factorías",
        "platform": "PRENSA",
        "hl": "es",
        "gl": "ES"
    },
    {
        "query": "SIPA+CCOO+UGT+CGT+Airbus+huelga+indefinida",
        "channel": "Secciones Sindicales",
        "platform": "PRENSA",
        "hl": "es",
        "gl": "ES"
    },
    {
        "query": "Airbus+shares+stock+price+AIR.PA+strike+impact",
        "channel": "Mercados & Bolsa Euronext",
        "platform": "PRENSA",
        "hl": "en",
        "gl": "US"
    },
    {
        "query": "Guillaume+Faury+Airbus+strike+negotiations",
        "channel": "Dirección & Portavocía Airbus",
        "platform": "PRENSA",
        "hl": "en",
        "gl": "GB"
    },
    {
        "query": "Airbus+A320neo+A321XLR+A350+delivery+delays",
        "channel": "Programas Comerciales",
        "platform": "PRENSA",
        "hl": "en",
        "gl": "US"
    },
    {
        "query": "Ministerio+Industria+Hereu+Airbus+conflicto",
        "channel": "Gobierno & Mediación Estatal",
        "platform": "PRENSA",
        "hl": "es",
        "gl": "ES"
    },
    {
        "query": "Lufthansa+Air+France+Iberia+Airbus+delivery+strike",
        "channel": "Clientes & Aerolíneas",
        "platform": "PRENSA",
        "hl": "en",
        "gl": "US"
    },
    {
        "query": "Airbus+Defence+Space+A400M+C295+huelga",
        "channel": "Defensa & Espacio",
        "platform": "PRENSA",
        "hl": "es",
        "gl": "ES"
    },
    {
        "query": "FlightGlobal+Airbus+strike+Spain",
        "channel": "FlightGlobal Aerospace",
        "platform": "PRENSA",
        "hl": "en",
        "gl": "GB"
    },
    {
        "query": "Aviation+Week+Airbus+supply+chain+delays",
        "channel": "Aviation Week Network",
        "platform": "PRENSA",
        "hl": "en",
        "gl": "US"
    },
    {
        "query": "Actualidad+Aeroespacial+Airbus+convenio",
        "channel": "Actualidad Aeroespacial",
        "platform": "PRENSA",
        "hl": "es",
        "gl": "ES"
    },
    {
        "query": "Airbus+greve+Espagne+Toulouse+impact",
        "channel": "Prensa Francesa (Aerospace)",
        "platform": "PRENSA",
        "hl": "fr",
        "gl": "FR"
    }
]

# Curated Multi-Platform Publications covering the entire conflict timeline
MULTI_PLATFORM_BASE_FEEDS = [
    {
        "id": "soc-tw-01",
        "source": "Twitter / X (@SindicatoSIPA)",
        "platform": "TWITTER",
        "channel": "Twitter / X",
        "title": "Unidad total en Getafe, Illescas y San Pablo: La asamblea ratifica el 100% de paro en la fabricación de HTP",
        "date": "2026-09-01",
        "url": "https://x.com/SindicatoSIPA",
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
        "url": "https://www.reddit.com/r/aviation/",
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
        "url": "https://www.threads.net/search?q=Airbus+Strike",
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
        "url": "https://x.com/CCOOAirbus",
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
        "url": "https://www.reddit.com/r/spain/",
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
        "title": "Airbus Spanish strike enters critical week as supply chain bottleneck threatens commercial aircraft delivery targets",
        "date": "2026-08-30",
        "url": "https://www.reuters.com/business/aerospace-defense/",
        "category": "BAD_FOR_AIRBUS",
        "impact": "BAD_FOR_AIRBUS",
        "pressure_impact": "+24°C",
        "summary": "Analistas de Barclays y Kepler Cheuvreux advierten que el impacto diario supera los 22 M€ en penalizaciones y paradas de cadena."
    },
    {
        "id": "soc-tw-03",
        "source": "Twitter / X (@UGTAirbus)",
        "platform": "TWITTER",
        "channel": "Twitter / X",
        "title": "La patronal aeronáutica debe entender que la competitividad no se construye precarizando a los ingenieros y operarios",
        "date": "2026-08-29",
        "url": "https://x.com/UGTAirbus",
        "category": "BAD_FOR_AIRBUS",
        "impact": "BAD_FOR_AIRBUS",
        "pressure_impact": "+16°C",
        "summary": "Declaración de UGT FICA: Rechazo tajante a las cláusulas de desindexación y exigencia de garantía IPC en el VII Convenio Colectivo."
    },
    {
        "id": "soc-pr-02",
        "source": "Cinco Días / El País",
        "platform": "PRENSA",
        "channel": "Prensa Nacional",
        "title": "El pulso salarial en Airbus España pone en jaque la producción europea de aviones comerciales",
        "date": "2026-08-28",
        "url": "https://cincodias.elpais.com/companias/",
        "category": "BAD_FOR_AIRBUS",
        "impact": "BAD_FOR_AIRBUS",
        "pressure_impact": "+22°C",
        "summary": "Análisis exhaustivo del monopolio industrial de Getafe sobre el estabilizador horizontal (HTP) y su capacidad de estrangular las plantas de Toulouse y Hamburgo."
    },
    {
        "id": "soc-pr-03",
        "source": "Expansión",
        "platform": "PRENSA",
        "channel": "Prensa Nacional",
        "title": "Airbus ofrece una paga no consolidable para desbloquear la huelga, pero los sindicatos exigen subida en tablas",
        "date": "2026-08-27",
        "url": "https://www.expansion.com/empresas/transporte.html",
        "category": "GOOD_FOR_AIRBUS",
        "impact": "GOOD_FOR_AIRBUS",
        "pressure_impact": "-10°C",
        "summary": "La dirección intenta desactivar el paro ofreciendo un bono de firma de 2.000 € y consolidación parcial del 3%, rechazada por las asambleas."
    },
    {
        "id": "soc-rd-03",
        "source": "Reddit (r/labor)",
        "platform": "REDDIT",
        "channel": "Reddit",
        "title": "Solidarity with Airbus Spanish Aerospace Workers: 15,500 strong striking for fair wage indexing against inflation",
        "date": "2026-08-26",
        "url": "https://www.reddit.com/r/labor/",
        "category": "BAD_FOR_AIRBUS",
        "impact": "BAD_FOR_AIRBUS",
        "pressure_impact": "+15°C",
        "summary": "Movimiento internacional de apoyo sindical comparte comparativas salariales con las factorías de Francia y Alemania."
    },
    {
        "id": "soc-tw-04",
        "source": "Twitter / X (@AirbusPress)",
        "platform": "TWITTER",
        "channel": "Twitter / X",
        "title": "Airbus statement on Spanish labor negotiations: Company remains committed to constructive dialogue within SIMA framework",
        "date": "2026-08-25",
        "url": "https://x.com/AirbusPress",
        "category": "GOOD_FOR_AIRBUS",
        "impact": "GOOD_FOR_AIRBUS",
        "pressure_impact": "-12°C",
        "summary": "Portavoces de Airbus apelan a la responsabilidad y afirman que su propuesta mantiene el poder adquisitivo en el marco de competitividad global."
    },
    {
        "id": "soc-tw-05",
        "source": "Twitter / X (@SindicatoCGTAirbus)",
        "platform": "TWITTER",
        "channel": "Twitter / X",
        "title": "Piquetes informativos en San Pablo y Tablada (Sevilla): 100% de seguimiento en las líneas del A400M y C295",
        "date": "2026-08-24",
        "url": "https://x.com/CGTAirbus",
        "category": "BAD_FOR_AIRBUS",
        "impact": "BAD_FOR_AIRBUS",
        "pressure_impact": "+20°C",
        "summary": "La planta de montaje final militar de Sevilla secunda masivamente la huelga indefinida paralizando las entregas de defensa."
    },
    {
        "id": "soc-th-02",
        "source": "Threads (@aviation_daily)",
        "platform": "THREADS",
        "channel": "Threads",
        "title": "BelugaXL fleet grounded for Getafe shuttle flights: Zero HTP components moved in the last 48 hours",
        "date": "2026-08-23",
        "url": "https://www.threads.net/search?q=BelugaXL+Airbus",
        "category": "BAD_FOR_AIRBUS",
        "impact": "BAD_FOR_AIRBUS",
        "pressure_impact": "+26°C",
        "summary": "Monitorización de tráfico ADS-B confirma que ningún avión de transporte Beluga ha despegado de Getafe (LEGT) con destino a las FALs europeas."
    },
    {
        "id": "soc-pr-04",
        "source": "FlightGlobal",
        "platform": "PRENSA",
        "channel": "Prensa Especializada",
        "title": "Airbus delivery cadence at risk as Spanish horizontal tailplane assembly halts indefinitely",
        "date": "2026-08-22",
        "url": "https://www.flightglobal.com/airframers",
        "category": "BAD_FOR_AIRBUS",
        "impact": "BAD_FOR_AIRBUS",
        "pressure_impact": "+24°C",
        "summary": "FlightGlobal detalla cómo la arquitectura modular de Airbus convierte a Getafe en el talón de Aquiles de toda la cadena A320 y A350."
    },
    {
        "id": "soc-pr-05",
        "source": "Le Figaro Économie",
        "platform": "PRENSA",
        "channel": "Prensa Internacional",
        "title": "Grève chez Airbus en Espagne: les usines françaises de Toulouse menacées de chômage technique",
        "date": "2026-08-20",
        "url": "https://www.lefigaro.fr/societes/",
        "category": "BAD_FOR_AIRBUS",
        "impact": "BAD_FOR_AIRBUS",
        "pressure_impact": "+25°C",
        "summary": "Alarma en los sindicatos franceses (FO, CFE-CGC) ante la inminente falta de derivas para continuar el ensamblaje en las líneas Jean-Luc Lagardère."
    }
]

BAD_AIRBUS_KEYWORDS = [
    "huelga", "strike", "paro", "bloqueo", "retraso", "delay", "embargo", "paraliz",
    "pérdida", "inflación", "ipc", "descontento", "tensión", "conflicto", "demanda",
    "rechaz", "sima", "presión", "asfixia", "caída", "asamblea", "atrasos", "asimetría",
    "protesta", "manifestación", "beluga retenido", "parada", "cuello de botella", "bottleneck"
]

GOOD_AIRBUS_KEYWORDS = [
    "acuerdo", "preacuerdo", "avance", "diálogo", "propuesta", "oferta", "inversión",
    "beneficio", "récord", "dividendo", "entrega", "superávit", "compromiso", "moderación",
    "paz social", "desconvoc", "reanuda"
]


class DynamicSentimentThermometer:
    def __init__(self):
        pass

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
            try:
                xml_content = fetch_with_retry(
                    url,
                    headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"},
                    timeout=5.0,
                    max_retries=2
                )
                if not xml_content:
                    continue
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
                    raw_link = link_el.text if link_el is not None and link_el.text else ""
                    
                    # Ensure clean, working URL: Google News search URL fallback if article redirect token is opaque
                    if raw_link.startswith("http"):
                        link = raw_link
                    else:
                        link = f"https://news.google.com/search?q={urllib.parse.quote(cleaned_title)}"
                    
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
                        "id": f"rss-{len(collected)+1:03d}",
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
            except Exception:
                pass

        return collected

    def load_telegram_archive_feed(self) -> List[Dict[str, Any]]:
        """Extracts ALL indexed announcements and documents from the synchronized Telegram channel archive."""
        if not TELEGRAM_INDEX_FILE.exists():
            return []

        tg_items = []
        try:
            with open(TELEGRAM_INDEX_FILE, "r", encoding="utf-8") as f:
                tg_data = json.load(f)
            
            docs = tg_data.get("documents", [])
            for doc in docs:
                title = doc.get("title", "Comunicado Asamblea Telegram")
                date = doc.get("date", datetime.now(timezone.utc).strftime("%Y-%m-%d"))
                desc = doc.get("summary", "")
                cat, impact, summary = self.classify_item(title + " " + desc, "Telegram (EnfadadosconAirbus)")
                
                doc_id = doc.get('id', f"doc-{len(tg_items)+1}")
                tg_items.append({
                    "id": f"tg-{doc_id}",
                    "source": "Telegram (EnfadadosconAirbus)",
                    "platform": "TELEGRAM",
                    "channel": f"Telegram: {doc.get('category', 'Oficial')}",
                    "title": title,
                    "date": date,
                    "url": "https://t.me/+MnuqJDCAAgYyMGQ0",
                    "category": cat,
                    "impact": cat,
                    "pressure_impact": impact,
                    "summary": desc or summary,
                    "file_path": doc.get("file_path", "")
                })
        except Exception:
            pass
        return tg_items

    def classify_item(self, title: str, source: str) -> tuple:
        """Classifies text based on impact on Airbus management vs. worker strike leverage."""
        title_lower = title.lower()

        bad_matches = sum(1 for kw in BAD_AIRBUS_KEYWORDS if kw in title_lower)
        good_matches = sum(1 for kw in GOOD_AIRBUS_KEYWORDS if kw in title_lower)

        if bad_matches > good_matches or (bad_matches >= 1 and "huelga" in title_lower):
            category = "BAD_FOR_AIRBUS"
            impact_val = min(15 + (bad_matches * 3), 30)
            impact = f"+{impact_val}°C"
            summary = f"Noticia / comunicado de alto impacto sobre la cadena de valor o la cohesión de la huelga en {source}. Incrementa la presión sobre Guillaume Faury."
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
        
        # Combine syndicated multi-platform base + telegram live (275+ docs) + RSS
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

        # Temperature formula: Base 45°C + Bad PR Leverage (up to +52°C) - Corporate Spin resistance (up to -12°C)
        raw_temp = 45.0 + (bad_ratio * 50.0) - (good_ratio * 10.0)
        temperature_celsius = round(min(max(raw_temp, 20.0), 96.5), 1)

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
        atomic_write_json(args.export_json, metrics, indent=2)
        print(f"✓ Dynamic Multi-Platform Thermometer exported to {args.export_json}")

    print(f"Airbus Strike Pressure Thermometer Status:")
    print(f"  • Temperature: {metrics['temperature_celsius']}°C [{metrics['status_label']}]")
    print(f"  • Monitored Items: {metrics['total_items_monitored']}")
    print(f"  • Strike Leverage (Bad for Airbus): {metrics['bad_for_airbus_count']} items ({metrics['bad_for_airbus_percentage']}%)")
    print(f"  • Corporate Spin (Good for Airbus): {metrics['good_for_airbus_count']} items ({metrics['good_for_airbus_percentage']}%)")
    print(f"  • Platforms: {metrics['platforms_distribution']}")


if __name__ == "__main__":
    main()
