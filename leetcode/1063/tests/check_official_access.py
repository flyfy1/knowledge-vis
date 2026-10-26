"""Capture only anonymous official access; no cookies or credentials.
Rerun: OUTPUT_DIR=/tmp/1063-access python3 -B leetcode/1063/tests/check_official_access.py
"""
import datetime
import json
import os
from pathlib import Path
import urllib.error
import urllib.request

OUT = Path(os.environ.get('OUTPUT_DIR', Path(__file__).parent / 'evidence'))
OUT.mkdir(parents=True, exist_ok=True)
URL = 'https://leetcode.com/problems/number-of-valid-subarrays/'
QUERY = '''query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId questionFrontendId title titleSlug difficulty isPaidOnly
    content exampleTestcases metaData codeSnippets { lang langSlug code }
  }
}'''
request_body = {'query': QUERY, 'variables': {'titleSlug': 'number-of-valid-subarrays'}}
(OUT / 'graphql-request.json').write_text(json.dumps(request_body, indent=2) + '\n')
receipts = {'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
            'officialSource': URL, 'access': 'Anonymous; no cookies, authorization headers, or credentials.'}
for name, url, body in [('official-page', URL, None),
                        ('graphql', 'https://leetcode.com/graphql/', json.dumps(request_body).encode())]:
    headers = {'User-Agent': 'Mozilla/5.0', 'Referer': URL}
    if body is not None:
        headers['Content-Type'] = 'application/json'
    request = urllib.request.Request(url, data=body, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            raw = response.read()
            receipts[name] = {'status': response.status, 'finalUrl': response.url}
    except urllib.error.HTTPError as error:
        raw = error.read()
        receipts[name] = {'status': error.code, 'finalUrl': error.url}
    except Exception as error:
        receipts[name] = {'error': str(error)}
        continue
    (OUT / (name + ('.json' if name == 'graphql' else '.html'))).write_bytes(raw)
    if name == 'graphql' and receipts[name]['status'] == 200:
        question = json.loads(raw).get('data', {}).get('question')
        receipts['observedFields'] = question
        receipts['contractVerified'] = bool(question and question.get('content') and question.get('codeSnippets'))
(OUT / 'access-result.json').write_text(json.dumps(receipts, indent=2, ensure_ascii=False) + '\n')
print(json.dumps(receipts, indent=2, ensure_ascii=False))
