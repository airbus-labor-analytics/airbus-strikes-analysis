#!/usr/bin/env python3
"""
src/parsers/news_parser.py
==========================
Parses RSS/Atom feeds and news announcements from SIMA, labor press, and industry sources.
"""

import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


def parse_rss_feed(feed_url: str, timeout: int = 5, max_items: int = 20) -> List[Dict[str, Any]]:
    """
    Fetch and parse an RSS or Atom feed with graceful degradation on network error.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AirbusStrikesAnalysis/1.0"
    }

    req = urllib.request.Request(feed_url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            xml_data = response.read()
    except Exception:
        # Graceful degradation on unreachable feed
        return []

    articles: List[Dict[str, Any]] = []
    try:
        root = ET.fromstring(xml_data)

        # Standard RSS 2.0 (<channel><item>...)
        items = root.findall(".//item")
        if not items:
            # Atom feed (<feed><entry>...)
            items = root.findall(".//{http://www.w3.org/2005/Atom}entry")

        for item in items[:max_items]:
            title_node = item.find("title") or item.find("{http://www.w3.org/2005/Atom}title")
            link_node = item.find("link") or item.find("{http://www.w3.org/2005/Atom}link")
            desc_node = item.find("description") or item.find("summary") or item.find("{http://www.w3.org/2005/Atom}summary")
            date_node = item.find("pubDate") or item.find("published") or item.find("{http://www.w3.org/2005/Atom}updated")

            title = title_node.text.strip() if title_node is not None and title_node.text else "Untitled"
            
            link = ""
            if link_node is not None:
                link = link_node.text or link_node.attrib.get("href", "")

            summary = desc_node.text.strip() if desc_node is not None and desc_node.text else ""
            pub_date = date_node.text.strip() if date_node is not None and date_node.text else datetime.now(timezone.utc).isoformat()

            articles.append({
                "title": title,
                "link": link,
                "summary": summary[:300],
                "published": pub_date,
                "source_feed": feed_url
            })
    except Exception:
        # If XML parsing fails, attempt regex extraction fallback
        title_matches = re.findall(r'<title[^>]*>(.*?)</title>', xml_data.decode('utf-8', errors='ignore'), re.DOTALL)
        link_matches = re.findall(r'<link[^>]*>(.*?)</link>', xml_data.decode('utf-8', errors='ignore'), re.DOTALL)
        for t, l in zip(title_matches[1:max_items+1], link_matches[1:max_items+1]):
            articles.append({
                "title": re.sub(r'<[^>]+>', '', t).strip(),
                "link": re.sub(r'<[^>]+>', '', l).strip(),
                "summary": "",
                "published": datetime.now(timezone.utc).isoformat(),
                "source_feed": feed_url
            })

    return articles


def parse_news_sources(sources_list: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Poll all enabled news and RSS sources and return aggregated articles.
    """
    aggregated: List[Dict[str, Any]] = []
    feed_statuses: Dict[str, Dict[str, Any]] = {}

    for src in sources_list:
        if src.get("type") == "rss_feed" and src.get("enabled"):
            src_id = src.get("id", "unknown")
            endpoint = src.get("endpoint", "")
            items = parse_rss_feed(endpoint)
            
            feed_statuses[src_id] = {
                "status": "active" if items else "idle",
                "endpoint": endpoint,
                "count": len(items),
                "last_poll": datetime.now(timezone.utc).isoformat()
            }
            aggregated.extend(items)

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_articles": len(aggregated),
        "feed_statuses": feed_statuses,
        "articles": aggregated
    }
