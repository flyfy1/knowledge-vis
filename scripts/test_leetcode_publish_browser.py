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
from leetcode_static_versions import codex_runtime


class BrowserGateTests(unittest.TestCase):
    def check_page(self, headings, bodies, titles, should_pass, route=None, omit_redirect_end=False, stall_resource=False, missing_resource=False, resource_on_redirect=False, slow_request=None, request_other_origin=False, request_status=200):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            lesson = root / 'leetcode' / '502'
            lesson.mkdir(parents=True)
            official = 'https://leetcode.com/problems/ipo/'
            (root / 'leetcode' / 'index.html').write_text(
                f'<article data-problem-id="502">#502 <a href="{route or "502/"}">Lesson</a><a href="{official}">Official</a></article>')
            (lesson / 'index.html').write_text(
                '<h1></h1><button data-lang="zh">中</button><button data-lang="en">EN</button>'
                f'<a href="{official}">Official</a><main></main><script>'
                f'const heads={json.dumps(headings)}, bodies={json.dumps(bodies)};'
                'function show(i){document.querySelector("h1").textContent=heads[i];'
                'document.querySelector("main").textContent=bodies[i];}'
                'document.querySelector("[data-lang=zh]").onclick=()=>show(0);'
                'document.querySelector("[data-lang=en]").onclick=()=>show(1);show(1);</script>')
            if stall_resource or missing_resource:
                index = lesson / 'index.html'
                resource = ('<script>if(location.search.includes("route-check=")){const image=document.createElement("img");image.src="pending.png";image.alt="";document.body.append(image);}</script>'
                            if resource_on_redirect else '<img src="pending.png" alt="">')
                index.write_text(index.read_text() + resource)
            if slow_request:
                index = lesson / 'index.html'
                method, path = slow_request
                target = ('location.origin.replace("127.0.0.1","localhost")+' if request_other_origin else '') + json.dumps(path)
                script = '<script>const telemetry=new XMLHttpRequest();telemetry.open(' + json.dumps(method) + ',' + target + ');telemetry.send("fixture");</script>'
                index.write_text(index.read_text() + script)
            if route == '502-codex/':
                runtime = {'leetcode/502/index.html': (lesson / 'index.html').read_bytes(),
                           'leetcode/502/app.js': b'// Inline fixture initializes the lesson.\n'}
                for path, content in codex_runtime(502, runtime).items():
                    target = root / path
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(content)
            release_stall = threading.Event()
            class Quiet(http.server.SimpleHTTPRequestHandler):
                def serve_slow_request(self):
                    if slow_request and self.command == slow_request[0] and self.path == slow_request[1]:
                        self.send_response(request_status)
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.send_header('Content-Type', 'application/json')
                        self.send_header('Content-Length', '0' if request_status >= 400 else '100')
                        self.end_headers()
                        if request_status >= 400:
                            return True
                        self.wfile.write(b'{')
                        self.wfile.flush()
                        release_stall.wait(25)
                        return True
                    return False
                def do_POST(self):
                    if not self.serve_slow_request():
                        self.send_error(404)
                def do_GET(self):
                    if self.serve_slow_request():
                        return
                    if stall_resource and self.path.split('?')[0].endswith('/pending.png'):
                        self.send_response(200)
                        self.send_header('Content-Type', 'image/png')
                        self.send_header('Content-Length', '100')
                        self.end_headers()
                        self.wfile.write(b'\x89PNG\r\n\x1a\n')
                        self.wfile.flush()
                        release_stall.wait(25)
                        return
                    super().do_GET()
                def log_message(self, *args):
                    pass
            server = http.server.ThreadingHTTPServer(('127.0.0.1', 0),
                functools.partial(Quiet, directory=str(root)))
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                script = BROWSER_CHECK
                if omit_redirect_end:
                    # Model Chromium's observed missing terminal events for a
                    # replaced redirect document; retain real asset events/UI.
                    script = r'''const driver=require('playwright');
const launch=driver.chromium.launch.bind(driver.chromium);
driver.chromium.launch=async(...args)=>{
 const browser=await launch(...args),newPage=browser.newPage.bind(browser);
 browser.newPage=async(...args)=>{
  const page=await newPage(...args),on=page.on.bind(page);
  page.on=(name,listener)=>on(name,['requestfinished','requestfailed'].includes(name)?r=>{
   if(!(r.resourceType()==='document' && /^\/leetcode\/502\/(?:index\.html)?$/.test(new URL(r.url()).pathname))) listener(r);
  }:listener);
  return page;
 };
 return browser;
};
''' + script
                result = subprocess.run(['node', '-e', script, json.dumps({
                    'base': f'http://127.0.0.1:{server.server_port}',
                    'entries': [{'id': 502, 'title': titles, 'leetcodeUrl': official, **({'path': route} if route else {})}]
                })], capture_output=True, text=True, env=os.environ.copy(), timeout=30)
            finally:
                release_stall.set()
                server.shutdown()
                server.server_close()
                thread.join()
            self.assertEqual(result.returncode == 0, should_pass, result.stdout + result.stderr)
            return result

    def test_identical_title_with_translated_body(self):
        self.check_page(['#502 · IPO'] * 2, ['逐步解释投资选择。' * 30, 'Explain project selection. ' * 30],
                        {'zh': 'IPO', 'en': 'IPO'}, True)

    def test_different_localized_titles(self):
        self.check_page(['#502 · 项目选择', '#502 · Project selection'],
                        ['逐步解释投资选择。' * 30, 'Explain project selection. ' * 30],
                        {'zh': '项目选择', 'en': 'Project selection'}, True)

    def test_codex_destination_and_legacy_query_fragment_redirects(self):
        self.check_page(['#502 · 项目选择', '#502 · Project selection'],
                        ['逐步解释投资选择。' * 30, 'Explain project selection. ' * 30],
                        {'zh': '项目选择', 'en': 'Project selection'}, True, route='502-codex/')

    def test_completed_redirect_does_not_require_abandoned_document_end_event(self):
        result = self.check_page(['#502 · 项目选择', '#502 · Project selection'],
                        ['逐步解释投资选择。' * 30, 'Explain project selection. ' * 30],
                        {'zh': '项目选择', 'en': 'Project selection'}, True,
                        route='502-codex/', omit_redirect_end=True)

        self.assertEqual(json.loads(result.stdout)['retiredRedirectDocuments'], 2)

    def test_current_resource_stall_still_fails_with_url_diagnostics(self):
        result = self.check_page(['#502 · 项目选择', '#502 · Project selection'],
                        ['逐步解释投资选择。' * 30, 'Explain project selection. ' * 30],
                        {'zh': '项目选择', 'en': 'Project selection'}, False,
                        route='502-codex/', stall_resource=True, resource_on_redirect=True, omit_redirect_end=True)
        self.assertIn('First-party resources did not finish', result.stderr)
        self.assertIn('/leetcode/502-codex/pending.png', result.stderr)
        self.assertIn('"type":"image"', result.stderr)

    def test_missing_current_resource_remains_a_required_failure(self):
        result = self.check_page(['#502 · 项目选择', '#502 · Project selection'],
                        ['逐步解释投资选择。' * 30, 'Explain project selection. ' * 30],
                        {'zh': '项目选择', 'en': 'Project selection'}, False,
                        route='502-codex/', missing_resource=True, resource_on_redirect=True, omit_redirect_end=True)
        self.assertIn('HTTP 404:', result.stderr)
        self.assertIn('/pending.png', result.stderr)

    def test_slow_same_origin_rum_post_is_counted_separately(self):
        result = self.check_page(['#502 · 项目选择', '#502 · Project selection'],
                        ['逐步解释投资选择。' * 30, 'Explain project selection. ' * 30],
                        {'zh': '项目选择', 'en': 'Project selection'}, True,
                        route='502-codex/', slow_request=('POST', '/cdn-cgi/rum?fixture=1'))
        self.assertGreater(json.loads(result.stdout)['ignoredCloudflareRumRequests'], 0)

    def test_slow_ordinary_post_is_not_telemetry(self):
        result = self.check_page(['#502 · 项目选择', '#502 · Project selection'],
                        ['逐步解释投资选择。' * 30, 'Explain project selection. ' * 30],
                        {'zh': '项目选择', 'en': 'Project selection'}, False,
                        route='502-codex/', slow_request=('POST', '/api/lesson-check'))
        self.assertIn('First-party resources did not finish', result.stderr)
        self.assertIn('/api/lesson-check', result.stderr)
        self.assertIn('"method":"POST"', result.stderr)

    def test_get_to_rum_path_is_not_telemetry(self):
        result = self.check_page(['#502 · 项目选择', '#502 · Project selection'],
                        ['逐步解释投资选择。' * 30, 'Explain project selection. ' * 30],
                        {'zh': '项目选择', 'en': 'Project selection'}, False,
                        route='502-codex/', slow_request=('GET', '/cdn-cgi/rum?fixture=1'))
        self.assertIn('First-party resources did not finish', result.stderr)
        self.assertIn('/cdn-cgi/rum', result.stderr)
        self.assertIn('"method":"GET"', result.stderr)

    def test_same_origin_rum_http_failure_is_counted_separately(self):
        result = self.check_page(['#502 · 项目选择', '#502 · Project selection'],
                        ['逐步解释投资选择。' * 30, 'Explain project selection. ' * 30],
                        {'zh': '项目选择', 'en': 'Project selection'}, True,
                        route='502-codex/', slow_request=('POST', '/cdn-cgi/rum?fixture=1'), request_status=503)
        self.assertGreater(json.loads(result.stdout)['ignoredCloudflareRumRequests'], 0)

    def test_other_origin_rum_path_is_not_exempt(self):
        result = self.check_page(['#502 · 项目选择', '#502 · Project selection'],
                        ['逐步解释投资选择。' * 30, 'Explain project selection. ' * 30],
                        {'zh': '项目选择', 'en': 'Project selection'}, False,
                        route='502-codex/', slow_request=('POST', '/cdn-cgi/rum?fixture=1'),
                        request_other_origin=True, request_status=503)
        self.assertIn('HTTP 503: http://localhost:', result.stderr)
        self.assertIn('/cdn-cgi/rum', result.stderr)

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
