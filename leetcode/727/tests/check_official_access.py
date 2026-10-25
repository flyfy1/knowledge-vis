"""Capture ordinary public access; no authentication or paywall workarounds.
Run: OUTPUT_DIR=/tmp/727-access python3 -B leetcode/727/tests/check_official_access.py
"""
import datetime
import json
import os
from pathlib import Path
import urllib.request

OFFICIAL = 'https://leetcode.com/problems/minimum-window-subsequence/'
QUERY = '''query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId questionFrontendId title titleSlug isPaidOnly
    content exampleTestcases codeSnippets { lang langSlug code }
  }
}'''
out = Path(os.environ.get('OUTPUT_DIR', Path(__file__).parent / 'evidence'))
out.mkdir(parents=True, exist_ok=True)
payload = {'query': QUERY, 'variables': {'titleSlug': 'minimum-window-subsequence'}}
(out / 'graphql-request.json').write_text(json.dumps(payload, indent=2) + '\n')
req = urllib.request.Request(
    'https://leetcode.com/graphql/', data=json.dumps(payload).encode(),
    headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0',
             'Referer': OFFICIAL})
with urllib.request.urlopen(req, timeout=30) as response:
    body = response.read()
    status = response.status
(out / 'graphql-response.json').write_bytes(body)
data = json.loads(body)
q = data.get('data', {}).get('question') or {}
summary = {
    'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'officialUrl': OFFICIAL, 'endpoint': 'https://leetcode.com/graphql/',
    'httpStatus': status, 'access': 'ordinary public request; no credentials',
    'problemId': q.get('questionFrontendId'), 'isPaidOnly': q.get('isPaidOnly'),
    'statementAvailable': bool(q.get('content')),
    'submissionInterfacesAvailable': bool(q.get('codeSnippets')),
    'conclusion': 'blocked' if not q.get('content') or not q.get('codeSnippets') else 'available; inspect contract before authoring',
}
(out / 'access-summary.json').write_text(json.dumps(summary, indent=2) + '\n')
print(json.dumps(summary, indent=2))
