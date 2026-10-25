"""Capture public official access without cookies or authentication.
Rerun: OUTPUT_DIR=/tmp/759-access python3 -B leetcode/759/tests/check_official_access.py
This is an access check, not a solution test or independent review.
"""
import datetime
import json
import os
from pathlib import Path
import urllib.error
import urllib.request

out = Path(os.environ.get('OUTPUT_DIR', Path(__file__).parent / 'evidence'))
out.mkdir(parents=True, exist_ok=True)
url = 'https://leetcode.com/problems/employee-free-time/'
query = '''query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId questionFrontendId title titleSlug isPaidOnly content
    exampleTestcases sampleTestCase metaData
    codeSnippets { lang langSlug code }
  }
}'''
payload = {'query': query, 'variables': {'titleSlug': 'employee-free-time'}}
(out / 'graphql-request.json').write_text(json.dumps(payload, indent=2) + '\n')
report = {'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'officialUrl': url, 'authentication': 'none; public request; no credentials accessed'}
for name, request in [
    ('official-page', urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})),
    ('graphql', urllib.request.Request('https://leetcode.com/graphql/',
        data=json.dumps(payload).encode(), headers={'Content-Type': 'application/json',
        'Referer': url, 'User-Agent': 'Mozilla/5.0'}))]:
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = response.read()
            report[name] = {'httpStatus': response.status, 'url': response.url}
    except urllib.error.HTTPError as error:
        body = error.read()
        report[name] = {'httpStatus': error.code, 'url': error.url}
    except Exception as error:
        report[name] = {'error': str(error)}
        continue
    (out / (name + ('.json' if name == 'graphql' else '.html'))).write_bytes(body)
    if name == 'graphql':
        try:
            question = json.loads(body).get('data', {}).get('question')
            report['observedQuestion'] = question
            report['contractAccessible'] = bool(question and question.get('content') and question.get('codeSnippets'))
        except (ValueError, AttributeError) as error:
            report['parseError'] = str(error)
(out / 'access-result.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
