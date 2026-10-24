"""Capture anonymous official access. OUTPUT_DIR redirects all emitted evidence.
No cookies, credentials, alternate hosts or restricted-access workarounds are used.
Run from the repository root: python3 -B leetcode/428/tests/check_official_access.py
"""
import datetime
import json
import os
from pathlib import Path
import urllib.error
import urllib.request

OUTPUT = Path(os.environ.get('OUTPUT_DIR', Path(__file__).parent / 'evidence'))
OUTPUT.mkdir(parents=True, exist_ok=True)
URL = 'https://leetcode.com/problems/serialize-and-deserialize-n-ary-tree/'
QUERY = '''query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId questionFrontendId title titleSlug isPaidOnly difficulty
    content codeSnippets { lang langSlug code }
  }
}'''
payload = {'query': QUERY, 'variables': {'titleSlug': 'serialize-and-deserialize-n-ary-tree'}}
(OUTPUT / 'graphql-request.json').write_text(json.dumps(payload, indent=2) + '\n')
records = []
for name, url, body in [('official-page', URL, None),
                         ('official-graphql', 'https://leetcode.com/graphql/', json.dumps(payload).encode())]:
    record = {'url': url, 'accessedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
              'method': 'POST' if body else 'GET', 'authentication': 'none'}
    headers = {'User-Agent': 'Mozilla/5.0'}
    if body:
        headers['Content-Type'] = 'application/json'
    request = urllib.request.Request(url, data=body, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            raw = response.read()
            record.update(status=response.status, contentType=response.headers.get('Content-Type'))
    except urllib.error.HTTPError as exc:
        raw = exc.read()
        record.update(status=exc.code, contentType=exc.headers.get('Content-Type'))
    except Exception as exc:
        raw = b''
        record['error'] = str(exc)
    extension = '.json' if body else '.html'
    (OUTPUT / (name + extension)).write_bytes(raw)
    record['capture'] = name + extension
    if body and raw:
        try:
            question = json.loads(raw).get('data', {}).get('question')
            if question:
                record['observed'] = {k: question.get(k) for k in
                                      ('questionFrontendId', 'isPaidOnly', 'content', 'codeSnippets')}
        except (ValueError, AttributeError):
            pass
    records.append(record)
(OUTPUT / 'access-results.json').write_text(json.dumps(records, indent=2) + '\n')
print(json.dumps(records, indent=2))
