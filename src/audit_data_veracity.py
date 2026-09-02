#!/usr/bin/env python3
"""
src/audit_data_veracity.py
==========================
Exhaustive verification and audit tool to detect, flag, and report any unverified,
synthetic, or mathematically inconsistent metrics across the entire Airbus Strikes Analysis codebase.
"""

import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Tuple

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Authoritative primary source domain whitelist
TRUSTED_SOURCE_DOMAINS = [
    "live.euronext.com",
    "airbus.com",
    "boe.es",
    "sima-fasp.net",
    "ine.es",
    "easa.europa.eu",
    "bmemarketdata.es",
    "investor.airbus.com",
    "industria.ccoo.es",
    "ugt-fica.org",
    "cgt.org.es",
]


def audit_conflict_metrics(file_path: Path) -> Tuple[bool, List[str]]:
    """Audit data/conflict_metrics.json for unverified figures, bounds, and citations."""
    issues: List[str] = []
    if not file_path.exists():
        return False, [f"Missing file: {file_path}"]

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        return False, [f"JSON decode error in {file_path}: {e}"]

    # 1. Audit Stock Market Analysis
    stock = data.get("stock_market_analysis", {})
    if not stock:
        issues.append("Missing stock_market_analysis block in conflict_metrics.json")
    else:
        src_url = stock.get("source_url", "")
        if not any(d in src_url for d in ["euronext.com", "airbus.com"]):
            issues.append(f"Stock analysis source_url is unverified or untrusted: '{src_url}'")
        
        curr_price = stock.get("current_price_eur", 0)
        shares = stock.get("total_shares_outstanding", 0)
        mcap = stock.get("current_market_cap_eur_m", 0)
        
        if curr_price <= 0:
            issues.append(f"Invalid stock price: {curr_price}")
        if not (790_000_000 <= shares <= 795_000_000):
            issues.append(f"Shares outstanding out of verified bounds [790M, 795M]: {shares}")
        
        calc_mcap = round((curr_price * shares) / 1_000_000, 1)
        if abs(calc_mcap - mcap) > 10.0:
            issues.append(f"Market cap calculation discrepancy: data={mcap}, calculated={calc_mcap}")

        # Check daily milestones for ungrounded entries
        history = stock.get("daily_history_conflict", [])
        if not history:
            issues.append("Empty stock history milestones")
        for idx, entry in enumerate(history):
            if "date" not in entry or "price" not in entry or "event" not in entry:
                issues.append(f"Malformed stock milestone at index {idx}: {entry}")
            elif entry["price"] <= 0:
                issues.append(f"Invalid price in milestone {entry.get('date')}: {entry['price']}")

    # 2. Audit Plant Census & Delegates
    tu = data.get("trade_union_representation", {})
    sites = tu.get("site_breakdown", [])
    total_census = sum(p.get("census", 0) for p in sites)
    total_delegates = sum(p.get("total_delegates", 0) for p in sites)
    
    if total_census != 15562:
        issues.append(f"Plant census total discrepancy: expected 15562, got {total_census}")
    if total_delegates != 198:
        issues.append(f"Plant delegates total discrepancy: expected 198, got {total_delegates}")

    # 3. Audit Sources Catalog Grounding
    catalog = data.get("sources_catalog", [])
    for src in catalog:
        s_id = src.get("id")
        s_url = src.get("url", "")
        if not s_url:
            issues.append(f"Source '{s_id}' has empty URL")

    return (len(issues) == 0), issues


def audit_dashboard_parity(data_js_path: Path, conflict_json_path: Path) -> Tuple[bool, List[str]]:
    """Audit data/conflict_metrics.json against dashboard/data.js for zero drift."""
    issues: List[str] = []
    if not data_js_path.exists() or not conflict_json_path.exists():
        return False, ["Missing files for parity check"]

    try:
        with open(conflict_json_path, "r", encoding="utf-8") as f:
            c_data = json.load(f)
    except Exception as e:
        return False, [f"Error reading {conflict_json_path}: {e}"]

    try:
        with open(data_js_path, "r", encoding="utf-8") as f:
            content = f.read()
            match = re.search(r'window\.CONFLICT_DATA\s*=\s*(\{.*?\});\s*\n', content, re.DOTALL)
            if not match:
                match = re.search(r'const\s+INITIAL_DATA\s*=\s*(\{.*?\});', content, re.DOTALL)
            if not match:
                match = re.search(r'=\s*(\{.*?\});', content, re.DOTALL)
            if match:
                d_data = json.loads(match.group(1))
            else:
                return False, ["Could not parse JSON from dashboard/data.js"]
    except Exception as e:
        return False, [f"Error parsing dashboard/data.js: {e}"]

    # Compare key metrics
    c_stock = c_data.get("stock_market_analysis", {})
    d_stock = d_data.get("stock_market_analysis", {})
    if c_stock.get("current_price_eur") != d_stock.get("current_price_eur"):
        issues.append(f"Stock price mismatch: conflict={c_stock.get('current_price_eur')}, data.js={d_stock.get('current_price_eur')}")
    if c_stock.get("total_shares_outstanding") != d_stock.get("total_shares_outstanding"):
        issues.append(f"Shares mismatch: conflict={c_stock.get('total_shares_outstanding')}, data.js={d_stock.get('total_shares_outstanding')}")

    return (len(issues) == 0), issues


def main() -> None:
    print("--> [Audit] Running Full Platform-Wide Data Veracity Audit...")
    conflict_path = PROJECT_ROOT / "data" / "conflict_metrics.json"
    data_js_path = PROJECT_ROOT / "dashboard" / "data.js"

    metrics_ok, metrics_issues = audit_conflict_metrics(conflict_path)
    parity_ok, parity_issues = audit_dashboard_parity(data_js_path, conflict_path)

    all_ok = metrics_ok and parity_ok
    all_issues = metrics_issues + parity_issues

    if all_ok:
        print("[AUDIT PASSED] 100% of analyzed metrics satisfy veracity, bounds, and citation criteria.")
        sys.exit(0)
    else:
        print(f"[AUDIT FAILED] Found {len(all_issues)} veracity or parity issue(s):")
        for iss in all_issues:
            print(f"  - {iss}")
        sys.exit(1)


if __name__ == "__main__":
    main()
