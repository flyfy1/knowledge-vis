"""Capture public official evidence without authentication or paywall workarounds.

Run: OUTPUT_DIR=/tmp/lc358-evidence python3 -B leetcode/358/tests/capture_official.py
"""
import datetime
import json
import os
from pathlib import Path
import urllib.error
import urllib.request

output = Path(os.environ.get('OUTPUT_DIR', Path(__file__).parent / 'evidence'))
output.mkdir(parents=True, exist_ok=True)
official = 'https://leetcode.com/problems/rearrange-string-k-distance-apart/'
query = '''query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId questionFrontendId title titleSlug isPaidOnly
    content exampleTestcases metaData
    codeSnippets { lang langSlug code }
  }
}'''
payload = {'query': query, 'variables': {'titleSlug': 'rearrange-string-k-distance-apart'}}
request_record = {
    'capturedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'officialSource': official,
    'endpoint': 'https://leetcode.com/graphql/',
    'authentication': 'None; no credentials or cookies used',
    'payload': payload,
}
(output / 'official-request.json').write_text(json.dumps(request_record, indent=2) + '\n')
request = urllib.request.Request(
    request_record['endpoint'], data=json.dumps(payload).encode(),
    headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0', 'Referer': official},
)
try:
    with urllib.request.urlopen(request, timeout=30) as response:
        body = response.read().decode()
        status = response.status
except urllib.error.HTTPError as error:
    body = error.read().decode(errors='replace')
    status = error.code
except urllib.error.URLError as error:
    body = str(error)
    status = None
(output / 'official-response.txt').write_text(body + '\n')
result = {'httpStatus': status, 'capturedAt': request_record['capturedAt']}
try:
    question = json.loads(body)['data']['question']
    result.update({
        'problemId': question['questionFrontendId'],
        'paidOnly': question['isPaidOnly'],
        'statementAvailable': bool(question.get('content')),
        'languageSnippetsAvailable': bool(question.get('codeSnippets')),
        'completeContractAvailable': bool(question.get('content')) and bool(question.get('codeSnippets')),
    })
except (ValueError, KeyError, TypeError):
    result['completeContractAvailable'] = False
(output / 'access-result.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result, indent=2))
