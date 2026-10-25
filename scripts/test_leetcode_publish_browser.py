#!/usr/bin/env python3
"""Exercise the publisher's actual Chromium gate against disposable served pages."""
import functools
import http.server
import json
import os
from pathlib import Path
import subprocess
import tempfile
import threading
import unittest

from leetcode_publish import BROWSER_CHECK


class BrowserGateTests(unittest.TestCase):
    def check_page(self, headings, bodies, titles, should_pass):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            lesson = root / 'leetcode' / '502'
            lesson.mkdir(parents=True)
            official = 'https://leetcode.com/problems/ipo/'
            (root / 'leetcode' / 'index.html').write_text(
                f'<article data-problem-id="502">#502 <a href="{official}">Official</a></article>')
            (lesson / 'index.html').write_text(
                '<h1></h1><button data-lang="zh">中</button><button data-lang="en">EN</button>'
                f'<a href="{official}">Official</a><main></main><script>'
                f'const heads={json.dumps(headings)}, bodies={json.dumps(bodies)};'
                'function show(i){document.querySelector("h1").textContent=heads[i];'
                'document.querySelector("main").textContent=bodies[i];}'
                'document.querySelector("[data-lang=zh]").onclick=()=>show(0);'
                'document.querySelector("[data-lang=en]").onclick=()=>show(1);show(1);</script>')
            class Quiet(http.server.SimpleHTTPRequestHandler):
                def log_message(self, *args):
                    pass
            server = http.server.ThreadingHTTPServer(('127.0.0.1', 0),
                functools.partial(Quiet, directory=str(root)))
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                result = subprocess.run(['node', '-e', BROWSER_CHECK, json.dumps({
                    'base': f'http://127.0.0.1:{server.server_port}',
                    'entries': [{'id': 502, 'title': titles, 'leetcodeUrl': official}]
                })], capture_output=True, text=True, env=os.environ.copy(), timeout=30)
            finally:
                server.shutdown()
                server.server_close()
                thread.join()
            self.assertEqual(result.returncode == 0, should_pass, result.stdout + result.stderr)

    def test_identical_title_with_translated_body(self):
        self.check_page(['#502 · IPO'] * 2, ['逐步解释投资选择。' * 30, 'Explain project selection. ' * 30],
                        {'zh': 'IPO', 'en': 'IPO'}, True)

    def test_different_localized_titles(self):
        self.check_page(['#502 · 项目选择', '#502 · Project selection'],
                        ['逐步解释投资选择。' * 30, 'Explain project selection. ' * 30],
                        {'zh': '项目选择', 'en': 'Project selection'}, True)

    def test_untranslated_title_is_rejected(self):
        self.check_page(['#502 · Project selection'] * 2,
                        ['逐步解释投资选择。' * 30, 'Explain project selection. ' * 30],
                        {'zh': '项目选择', 'en': 'Project selection'}, False)

    def test_identical_title_and_untranslated_body_is_rejected(self):
        self.check_page(['#502 · IPO'] * 2, ['Explain project selection. ' * 30] * 2,
                        {'zh': 'IPO', 'en': 'IPO'}, False)

    def test_missing_problem_id_is_rejected(self):
        self.check_page(['项目选择', 'Project selection'],
                        ['逐步解释投资选择。' * 30, 'Explain project selection. ' * 30],
                        {'zh': '项目选择', 'en': 'Project selection'}, False)

    def test_empty_content_is_rejected(self):
        self.check_page(['#502 · 项目选择', '#502 · Project selection'], ['', ''],
                        {'zh': '项目选择', 'en': 'Project selection'}, False)


if __name__ == '__main__':
    unittest.main()
