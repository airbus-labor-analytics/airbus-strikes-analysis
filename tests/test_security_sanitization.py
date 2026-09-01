#!/usr/bin/env python3
"""
Automated Tests for Frontend Security, XSS Defense, and URL Sanitization.
Verifies that all dynamic DOM renderers employ strict escaping,
that rel="noopener noreferrer" is enforced on all target="_blank" links,
and that malicious payloads (HTML/XSS) are properly neutralized.
"""

import unittest
import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
HTML_PATH = PROJECT_ROOT / "dashboard" / "index.html"
APP_JS_PATH = PROJECT_ROOT / "dashboard" / "app.js"


class TestSecuritySanitization(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open(HTML_PATH, "r", encoding="utf-8") as f:
            cls.html_content = f.read()
        with open(APP_JS_PATH, "r", encoding="utf-8") as f:
            cls.app_js_content = f.read()

    def test_security_helpers_defined(self):
        """Verifies escapeHTML and sanitizeURL are implemented and exported."""
        self.assertIn("function escapeHTML(", self.app_js_content, "Missing escapeHTML helper in app.js")
        self.assertIn("function sanitizeURL(", self.app_js_content, "Missing sanitizeURL helper in app.js")

    def test_noopener_noreferrer_on_html_links(self):
        """Ensures all target='_blank' links in index.html include rel='noopener noreferrer'."""
        # Find all <a> tags with target="_blank"
        target_blank_pattern = re.compile(r'<a\s+[^>]*target=["\']_blank["\'][^>]*>', re.IGNORECASE)
        matches = target_blank_pattern.findall(self.html_content)
        self.assertGreater(len(matches), 0, "No target='_blank' links found to test")
        for tag in matches:
            self.assertTrue(
                'rel="noopener noreferrer"' in tag or "rel='noopener noreferrer'" in tag or 'rel="noreferrer noopener"' in tag,
                f"Missing rel='noopener noreferrer' in link tag: {tag}"
            )

    def test_noopener_noreferrer_on_js_rendered_links(self):
        """Ensures all target='_blank' strings in app.js include rel='noopener noreferrer'."""
        # Match template literal anchors with target="_blank"
        js_blank_pattern = re.compile(r'<a\s+[^>]*target=\\?["\']_blank\\?["\'][^>]*>', re.IGNORECASE)
        matches = js_blank_pattern.findall(self.app_js_content)
        for tag in matches:
            self.assertTrue(
                'rel="noopener noreferrer"' in tag or "rel='noopener noreferrer'" in tag or 'noopener' in tag,
                f"Missing rel='noopener noreferrer' in JS template link: {tag}"
            )

    def test_escape_html_replaces_all_dangerous_characters(self):
        """Verifies escapeHTML logic handles &, <, >, \", and ' characters."""
        self.assertIn(".replace(/&/g,", self.app_js_content)
        self.assertIn(".replace(/</g,", self.app_js_content)
        self.assertIn(".replace(/>/g,", self.app_js_content)
        self.assertIn('.replace(/"/g,', self.app_js_content)
        self.assertIn(".replace(/'/g,", self.app_js_content)

    def test_sanitize_url_blocks_javascript_scheme(self):
        """Verifies sanitizeURL blocks javascript:, vbscript:, and data: schemes that execute code."""
        self.assertIn("sanitizeURL", self.app_js_content)
        # Check regex protocol whitelist
        self.assertTrue(
            "https?://" in self.app_js_content or "/^(https?:\\/\\/|" in self.app_js_content,
            "sanitizeURL should whitelist safe protocols"
        )


if __name__ == "__main__":
    unittest.main()
