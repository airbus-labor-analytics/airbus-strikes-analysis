"""
src/parsers
===========
Modular multi-source data extraction parsers for Airbus Strikes Analysis.
"""

from .config_loader import load_sources_config, get_source_by_id
from .telegram_parser import parse_telegram_archive, parse_live_telegram
from .news_parser import parse_rss_feed, parse_news_sources
from .metric_parser import parse_economic_metrics, parse_beluga_logistics

__all__ = [
    "load_sources_config",
    "get_source_by_id",
    "parse_telegram_archive",
    "parse_live_telegram",
    "parse_news_sources",
    "parse_rss_feed",
    "parse_economic_metrics",
    "parse_beluga_logistics",
]
