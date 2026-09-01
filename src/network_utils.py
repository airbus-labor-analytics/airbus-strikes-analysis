#!/usr/bin/env python3
"""
src/network_utils.py
====================
Provides resilient HTTP fetch utilities with exponential backoff, jitter,
custom User-Agent headers, timeout handling, and structured logging.
Standard library only (urllib.request, ssl, time, logging).
"""

import json
import logging
import random
import ssl
import time
import urllib.error
import urllib.request
from typing import Any, Dict, Optional, Union

# Configure basic logger
logger = logging.getLogger("airbus_network")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("[%(levelname)s] [%(name)s] %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

DEFAULT_USER_AGENT = "AirbusStrikeAnalytics/2.0 (Resilient Ingestion Engine)"


def fetch_with_retry(
    url: str,
    headers: Optional[Dict[str, str]] = None,
    timeout: float = 6.0,
    max_retries: int = 3,
    backoff_factor: float = 0.5,
    context: Optional[ssl.SSLContext] = None,
    decode_json: bool = False
) -> Optional[Union[bytes, Dict[str, Any], list]]:
    """
    Fetch URL content with exponential backoff and jitter.
    
    Returns:
        bytes if decode_json is False,
        parsed dict/list if decode_json is True,
        or None if all attempts fail.
    """
    req_headers = {"User-Agent": DEFAULT_USER_AGENT}
    if headers:
        req_headers.update(headers)

    req = urllib.request.Request(url, headers=req_headers)
    last_error = None

    for attempt in range(1, max_retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=timeout, context=context) as resp:
                data = resp.read()
                if decode_json:
                    return json.loads(data.decode("utf-8"))
                return data
        except urllib.error.HTTPError as e:
            last_error = e
            # Do not retry on 404 or 401 client errors
            if e.code in (401, 403, 404):
                logger.warning(f"HTTP {e.code} client error for {url}. No retry.")
                break
            logger.warning(f"Attempt {attempt}/{max_retries} failed for {url}: HTTP {e.code}")
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            last_error = e
            logger.warning(f"Attempt {attempt}/{max_retries} failed for {url}: {e}")
        except Exception as e:
            last_error = e
            logger.warning(f"Attempt {attempt}/{max_retries} unexpected error for {url}: {e}")

        if attempt < max_retries:
            sleep_time = backoff_factor * (2 ** (attempt - 1)) + random.uniform(0.05, 0.2)
            time.sleep(sleep_time)

    logger.error(f"All {max_retries} attempts failed for {url}. Last error: {last_error}")
    return None
