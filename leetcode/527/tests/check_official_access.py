"""Capture public official access; never reads cookies or credentials.
Rerun: OUTPUT_DIR=/tmp/527-access python3 -B leetcode/527/tests/check_official_access.py
Requires the installed requests package. Writes only to OUTPUT_DIR.
"""
import datetime
import json
import os
from pathlib import Path
import requests

out = Path(os.environ.get('OUTPUT_DIR', Path(__file__).parent / 'evidence'))
out.mkdir(parents=True, exist_ok=True)
query = '''query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId questionFrontendId title titleSlug isPaidOnly difficulty
    content exampleTestcases sampleTestCase metaData
    codeSnippets { lang langSlug code }
  }
}'''
payload = {'query': query, 'variables': {'titleSlug': 'word-abbreviation'}}
(out / 'graphql-request.json').write_text(json.dumps(payload, indent=2) + '\n')
report = {'verifiedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'officialSource': 'https://leetcode.com/problems/word-abbreviation/',
          'authentication': 'Public unauthenticated requests; no credentials or cookies supplied.',
          'requests': []}
for name, method, url, kwargs in [
    ('official-page', 'GET', report['officialSource'], {}),
    ('official-graphql', 'POST', 'https://leetcode.com/graphql/', {'json': payload}),
]:
    try:
        response = requests.request(method, url, timeout=40, **kwargs)
        (out / (name + '.txt')).write_text(response.text)
        entry = {'method': method, 'url': url, 'status': response.status_code,
                 'capture': name + '.txt'}
        if name == 'official-graphql' and response.status_code == 200:
            question = response.json().get('data', {}).get('question')
            entry['observed'] = question
            if question:
                entry['statementAvailable'] = bool(question.get('content'))
                entry['languageSnippetsAvailable'] = bool(question.get('codeSnippets'))
                report['blocked'] = not (entry['statementAvailable'] and entry['languageSnippetsAvailable'])
        report['requests'].append(entry)
    except requests.RequestException as exc:
        report['requests'].append({'method': method, 'url': url, 'error': str(exc)})
report.setdefault('blocked', True)
(out / 'access-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'blocked': report['blocked'], 'report': str(out / 'access-report.json'),
                  'requests': [{k: v for k, v in x.items() if k != 'observed'} for x in report['requests']]}, indent=2))
