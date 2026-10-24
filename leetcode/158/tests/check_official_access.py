"""Capture public official access without cookies or credentials.
Rerun: OUTPUT_DIR=/tmp/158-access python3 -B leetcode/158/tests/check_official_access.py
"""
import datetime
import json
import os
from pathlib import Path
import urllib.request

output = Path(os.environ.get('OUTPUT_DIR', Path(__file__).parent / 'evidence'))
output.mkdir(parents=True, exist_ok=True)
query = '''query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId title titleSlug isPaidOnly content exampleTestcases
    codeSnippets { lang langSlug code }
  }
}'''
payload = {'query': query, 'variables': {'titleSlug': 'read-n-characters-given-read4-ii-call-multiple-times'}}
request = urllib.request.Request('https://leetcode.com/graphql/',
    data=json.dumps(payload).encode(),
    headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'})
capture = {'accessedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
           'endpoint': request.full_url, 'request': payload,
           'authentication': 'None; public request with no cookies or credentials'}
try:
    with urllib.request.urlopen(request, timeout=30) as response:
        raw = response.read().decode()
        capture.update(status=response.status, response=json.loads(raw))
        (output / 'official-graphql-response.json').write_text(raw + '\n')
except Exception as error:
    capture['error'] = str(error)
(output / 'official-access.json').write_text(json.dumps(capture, indent=2) + '\n')
question = capture.get('response', {}).get('data', {}).get('question', {})
print(json.dumps({'status': capture.get('status'),
                  'contentAvailable': question.get('content') is not None,
                  'interfacesAvailable': question.get('codeSnippets') is not None,
                  'error': capture.get('error')}, indent=2))
