"""Capture ordinary, unauthenticated official access; no credentials or bypass.
Run: OUTPUT_DIR=/tmp/1067-access python3 -B leetcode/1067/tests/check_official_access.py
"""
import datetime
import json
import os
from pathlib import Path
import urllib.request
import urllib.error

OUT = Path(os.environ.get('OUTPUT_DIR', Path(__file__).parent / 'evidence'))
OUT.mkdir(parents=True, exist_ok=True)
URL = 'https://leetcode.com/problems/digit-count-in-range/'
QUERY = '''query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId questionFrontendId title titleSlug isPaidOnly difficulty
    content exampleTestcases metaData codeSnippets { lang langSlug code }
  }
}'''
payload = {'query': QUERY, 'variables': {'titleSlug': 'digit-count-in-range'}}
(OUT / 'graphql-request.json').write_text(json.dumps(payload, indent=2) + '\n')
summary = {'observedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
           'officialUrl': URL, 'access': 'Ordinary unauthenticated HTTPS, no credentials',
           'authorStatus': 'blocked', 'independentReview': 'not performed'}
for name, request in [
    ('official-page', urllib.request.Request(URL, headers={'User-Agent': 'Mozilla/5.0'})),
    ('official-graphql', urllib.request.Request('https://leetcode.com/graphql/',
        data=json.dumps(payload).encode(),
        headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}))
]:
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = response.read().decode()
            summary[name] = {'status': response.status, 'url': response.url}
    except urllib.error.HTTPError as exc:
        body = exc.read().decode()
        summary[name] = {'status': exc.code, 'url': exc.url}
    except Exception as exc:
        summary[name] = {'error': str(exc)}
        continue
    suffix = '.json' if name.endswith('graphql') else '.html'
    (OUT / (name + suffix)).write_text(body)
    if name.endswith('graphql'):
        question = json.loads(body).get('data', {}).get('question')
        if question:
            summary['observations'] = {
                'questionFrontendId': question.get('questionFrontendId'),
                'isPaidOnly': question.get('isPaidOnly'),
                'contentAvailable': question.get('content') is not None,
                'codeSnippetsAvailable': question.get('codeSnippets') is not None,
                'metadata': json.loads(question['metaData']) if question.get('metaData') else None,
                'sampleInputsOnly': question.get('exampleTestcases'),
            }
(OUT / 'access-summary.json').write_text(json.dumps(summary, indent=2) + '\n')
print(json.dumps(summary, indent=2))
