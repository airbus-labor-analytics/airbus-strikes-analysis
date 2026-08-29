#!/usr/bin/env python3
"""
Scrape all 269 NotebookLM sources + Telegram archive into:
  - sources/fulltext/<safe>_<id8>.json      (raw API response)
  - dashboard/data/sources/<id8>.txt        (plain text for web)
  - data/sources_catalog.json              (master catalog)
  - dashboard/data/sources_catalog.json    (copy for web)
"""
import asyncio
import json
import re
import sys
from pathlib import Path

# ── paths ──────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
FULLTEXT_DIR = ROOT / "sources" / "fulltext"
DASHBOARD_SOURCES = ROOT / "dashboard" / "data" / "sources"
DATA_DIR = ROOT / "data"
SOURCES_INDEX = ROOT / "sources" / "sources_index.json"
TELEGRAM_INDEX = ROOT / "data" / "telegram_archive" / "telegram_index.json"
NOTEBOOK_ID = "602774aa-f859-4d52-a3e4-87afb7761d15"
CONCURRENCY = 12

FULLTEXT_DIR.mkdir(parents=True, exist_ok=True)
DASHBOARD_SOURCES.mkdir(parents=True, exist_ok=True)

# ── category classifier ────────────────────────────────────────────────────────
# Rules checked title-only first, then title+preview — prevents preview text
# from overpowering a clear title signal.
CATEGORY_RULES: list[tuple[list[str], str]] = [
    (
        ["sima", "acta asamblea", "acta de asamblea", "mediacion", "arbitraje", "easa",
         "rd-ley", "rd ley", "real decreto", "estatuto trabajadores", "juzgado",
         "auto judicial", "sentencia", "demanda", "rdl 17", "17/1977",
         "reunión comité de huelga", "reunion comite de huelga",
         "pliego de garantias", "comisión negociadora"],
        "Actas SIMA & Legal",
    ),
    (
        ["poder adquisitivo", "pérdida salarial", "perdida salarial", "dossier",
         "bradford", "purchasing power", "dossier económico", "dossier economico",
         "recuperacion salarial", "recuperación salarial", "resumen ejecutivo"],
        "Dossiers Económicos & Salariales",
    ),
    (
        ["airbus annual report", "airbus results", "h1 2026", "h1 2025", "h1 2024",
         "csrd report", "guidance", "annual report", "half year results",
         "financial result", "quarterly result", "earnings release",
         "documentation for the annual general meeting"],
        "Informes Airbus SE & Financieros",
    ),
    # Benchmark before Convenios so Boeing/IAM titles don't fall through
    (
        ["boeing iam", "iam 751", "iam district", "spirit aerosystems", "rmt",
         "network rail", "sncf", "acerinox", "machinists' strike", "machinists strike",
         "boeing machinists", "boeing engineers", "boeing union", "boeing strike",
         "boeing factory strike", "boeing – speea", "boeing, engineers",
         "patco", "professional air traffic", "1981 patco",
         "huelga boeing", "huelga de acerinox"],
        "Benchmark Internacional",
    ),
    (
        ["vi convenio", "v convenio", "convenio colectivo", "industrias cárnicas",
         "industrias carnicas", "metal de cádiz", "metal de cadiz",
         "siderometalúrgicas", "siderometalurgicas", "construcción - ccoo",
         "convenio renault", "convenio de renault", "convenio empresa renault",
         "boe-a-", "bocm-", "boletín oficial del estado", "boletin oficial",
         "tabla salarial", "tablas salariales", "acuerdo marco interprofesional",
         "iii convenio colectivo", "vii convenio", "nuevo convenio"],
        "Convenios Colectivos & BOE",
    ),
    (
        ["comunicado", "nota de prensa", "convocatoria huelga", "minuta asamblea",
         "minutas asamblea", "asamblea getafe", "asamblea en huelga",
         "preaviso huelga", "mayoria sindical", "mayoría sindical",
         "guía huelga", "guia huelga", "caja de resistencia",
         "consul ta a la plantilla", "consulta a la plantilla",
         "plataforma reivindicativa", "propuesta_", "sipa", "útil sindicato",
         "ig metall tarift", "ig metall gehalt"],
        "Comunicados Sindicales & Huelga",
    ),
    (
        ["supply chain", "cadena de suministro", "cadena suministro",
         "just-in-time", "just in time", "iata", "mckinsey aerospace",
         "beluga", "backlog", "supply chain disruption", "supply chain risk",
         "aerospace supply chain", "commercial aerospace"],
        "Cadena de Suministro & Logística",
    ),
    (
        ["informes airbus se", "airbus csrd", "airbus se results",
         "airbus reports", "airbus h1", "airbus fy", "investor relations"],
        "Informes Airbus SE & Financieros",
    ),
]

# Broader keywords checked only on title (not preview) to avoid false positives
_TITLE_ONLY_RULES: list[tuple[list[str], str]] = [
    (["ugt", "ccoo", "cgt airbus", "ig metall", "fo signe", "fo airbus",
      "reload", "classification survey", "grille des minima", "minima métallurgie",
      "grille de salaires", "nouvelle grille", "gehaltsstufen", "wie viel verdient",
      "wie viel kann", "ausbildung", "entgelttabelle", "tarifrunde",
      "verhandlungsergebnis", "tarifabschluss"],
     "Comunicados Sindicales & Huelga"),
    (["renault", "renault group", "renault españa"],
     "Convenios Colectivos & BOE"),
    (["boeing", "speea", "iam "],
     "Benchmark Internacional"),
    (["airbus annual", "airbus results", "airbus reports", "airbus h1", "passion for progress"],
     "Informes Airbus SE & Financieros"),
    (["ipc", "poder adquisitivo", "salario mínimo", "salaire minimum", "smic"],
     "Dossiers Económicos & Salariales"),
    (["wikipedia", "heraldnet", "guardian", "reuters", "bloomberg", "el país",
      "el pais", "la razón", "la razon", "cadena ser", "expansion.com",
      "cinco días", "five days", "cenital", "monthly review"],
     "Noticias & Medios"),
]


def classify(title: str, text_preview: str = "") -> str:
    title_lc = title.lower()
    # 1. Check title-only against both rule sets
    for keywords, category in CATEGORY_RULES:
        if any(kw in title_lc for kw in keywords):
            return category
    for keywords, category in _TITLE_ONLY_RULES:
        if any(kw in title_lc for kw in keywords):
            return category
    # 2. Fall back to title+preview (looser, may false-positive)
    combined = (title_lc + " " + text_preview[:300].lower())
    for keywords, category in CATEGORY_RULES:
        if any(kw in combined for kw in keywords):
            return category
    return "Noticias & Medios"  # default


def safe_filename(title: str) -> str:
    clean = re.sub(r'[\\/*?:"<>|]', "", title)
    clean = clean.replace(" ", "_").strip("._")
    return clean[:80]


# ── notebooklm scraping ────────────────────────────────────────────────────────
async def fetch_one(client, sem: asyncio.Semaphore, source: dict, idx: int, total: int) -> dict | None:
    """Fetch fulltext for one source with retry on rate-limit."""
    sid = source["id"]
    id8 = sid[:8]
    title = source.get("title", sid)

    json_path = FULLTEXT_DIR / f"{safe_filename(title)}_{id8}.json"
    txt_path = DASHBOARD_SOURCES / f"{id8}.txt"

    # Re-use cached file if both exist
    if json_path.exists() and txt_path.exists():
        try:
            cached = json.loads(json_path.read_text())
            text = cached.get("text") or cached.get("content", "")
            print(f"  [{idx}/{total}] CACHED {id8} {title[:50]}")
            return {
                "id": sid,
                "index": source.get("index", idx),
                "title": title,
                "category": classify(title, text[:500]),
                "type": source.get("type", "unknown"),
                "url": source.get("url"),
                "char_count": len(text),
                "summary": text[:300].replace("\n", " ").strip(),
                "file_path": f"sources/{id8}.txt",
                "fulltext_preview": text[:800],
            }
        except Exception:
            pass  # re-fetch on corrupt cache

    for attempt in range(4):
        async with sem:
            try:
                ft = await client.sources.get_fulltext(NOTEBOOK_ID, sid, output_format="text")
                text = ft.content if hasattr(ft, "content") else str(ft)
                char_count = len(text)

                # Save JSON blob
                blob = {
                    "id": sid,
                    "title": title,
                    "type": source.get("type"),
                    "url": source.get("url"),
                    "content": text,
                    "char_count": char_count,
                }
                json_path.write_text(json.dumps(blob, ensure_ascii=False, indent=2))
                txt_path.write_text(text, encoding="utf-8")

                print(f"  [{idx}/{total}] OK {id8} {title[:50]} ({char_count} chars)")
                return {
                    "id": sid,
                    "index": source.get("index", idx),
                    "title": title,
                    "category": classify(title, text[:500]),
                    "type": source.get("type", "unknown"),
                    "url": source.get("url"),
                    "char_count": char_count,
                    "summary": text[:300].replace("\n", " ").strip(),
                    "file_path": f"sources/{id8}.txt",
                    "fulltext_preview": text[:800],
                }
            except Exception as e:
                msg = str(e).lower()
                if "rate" in msg or "429" in msg or "quota" in msg:
                    wait = 5 * (2 ** attempt)
                    print(f"  [{idx}/{total}] RATE-LIMIT {id8}, retry in {wait}s")
                    await asyncio.sleep(wait)
                elif "not found" in msg or "404" in msg:
                    print(f"  [{idx}/{total}] NOT_FOUND {id8}: {e}")
                    return None
                else:
                    print(f"  [{idx}/{total}] ERR attempt {attempt+1} {id8}: {e}")
                    if attempt == 3:
                        return None
                    await asyncio.sleep(2)
    return None


async def scrape_notebooklm(sources_meta: list[dict]) -> list[dict]:
    import notebooklm

    async with notebooklm.client.NotebookLMClient.from_storage() as client:
        sem = asyncio.Semaphore(CONCURRENCY)
        total = len(sources_meta)
        print(f"Fetching {total} sources (concurrency={CONCURRENCY})…")
        tasks = [
            fetch_one(client, sem, src, i + 1, total)
            for i, src in enumerate(sources_meta)
        ]
        results = await asyncio.gather(*tasks)

    return [r for r in results if r is not None]


# ── telegram integration ────────────────────────────────────────────────────────
TELEGRAM_CATEGORY_MAP = {
    "Minuta de Asamblea": "Comunicados Sindicales & Huelga",
    "Minutas de Asamblea": "Comunicados Sindicales & Huelga",
    "Documento Legal / SIMA": "Actas SIMA & Legal",
    "Documentos Legales / SIMA": "Actas SIMA & Legal",
    "Dossier Económico": "Dossiers Económicos & Salariales",
    "Dossiers Económicos": "Dossiers Económicos & Salariales",
    "Comunicado Sindical": "Comunicados Sindicales & Huelga",
    "Comunicados Sindicales": "Comunicados Sindicales & Huelga",
}


def integrate_telegram(nb_catalog: list[dict]) -> list[dict]:
    """Add Telegram archive files to the catalog (skip duplicates already in NB)."""
    already_ids = {e["id"] for e in nb_catalog}
    # also map by original_source_id
    already_src = {e["id"] for e in nb_catalog}

    if not TELEGRAM_INDEX.exists():
        print("  telegram_index.json not found, skipping Telegram integration.")
        return nb_catalog

    tg = json.loads(TELEGRAM_INDEX.read_text())
    docs = tg.get("documents", [])
    added = 0

    for doc in docs:
        orig_id = doc.get("original_source_id", "")
        if orig_id and orig_id in already_src:
            # already in NB catalog — skip (avoid duplicates)
            continue
        if doc["id"] in already_ids:
            continue

        raw_cat = doc.get("category", "Otros")
        category = TELEGRAM_CATEGORY_MAP.get(raw_cat) or classify(doc.get("title", ""))

        # Try to read text from file_path
        fp = ROOT / doc.get("file_path", "")
        text = ""
        if fp.exists():
            text = fp.read_text(encoding="utf-8", errors="replace")
            # copy into dashboard/data/sources/<tg-doc-XXX>.txt
            dst = DASHBOARD_SOURCES / f"{doc['id']}.txt"
            if not dst.exists():
                dst.write_text(text, encoding="utf-8")

        nb_catalog.append({
            "id": doc["id"],
            "index": len(nb_catalog) + 1,
            "title": doc.get("title", doc["id"]),
            "category": category,
            "type": "telegram_document",
            "url": doc.get("group_url"),
            "char_count": doc.get("size_chars", len(text)),
            "summary": doc.get("summary", text[:300]).replace("\n", " ").strip()[:300],
            "file_path": f"sources/{doc['id']}.txt",
            "fulltext_preview": text[:800],
        })
        added += 1

    print(f"  Telegram: added {added} unique documents.")
    return nb_catalog


# ── main ────────────────────────────────────────────────────────────────────────
async def main() -> None:
    # Load sources index (already fetched metadata)
    meta = json.loads(SOURCES_INDEX.read_text())
    sources_meta = meta["sources"]
    print(f"Loaded {len(sources_meta)} sources from sources_index.json")

    catalog = await scrape_notebooklm(sources_meta)
    print(f"\nFetched {len(catalog)}/{len(sources_meta)} sources successfully.")

    catalog = integrate_telegram(catalog)

    # Sort by index
    catalog.sort(key=lambda x: x.get("index", 9999))

    out = {
        "notebook_id": NOTEBOOK_ID,
        "total": len(catalog),
        "sources": catalog,
    }

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    cat_path = DATA_DIR / "sources_catalog.json"
    cat_path.write_text(json.dumps(out, ensure_ascii=False, indent=2))
    print(f"\nWrote {cat_path} ({len(catalog)} entries)")

    dash_cat = ROOT / "dashboard" / "data" / "sources_catalog.json"
    dash_cat.parent.mkdir(parents=True, exist_ok=True)
    dash_cat.write_text(json.dumps(out, ensure_ascii=False, indent=2))
    print(f"Copied to {dash_cat}")

    # Summary by category
    from collections import Counter
    counts = Counter(s["category"] for s in catalog)
    print("\nCategory breakdown:")
    for cat, n in sorted(counts.items()):
        print(f"  {n:3d}  {cat}")


if __name__ == "__main__":
    asyncio.run(main())
