"""Capture public official access without credentials; OUTPUT_DIR redirects evidence."""
import datetime
import json
import os
from pathlib import Path
import urllib.request
import urllib.error

OUT = Path(os.environ.get('OUTPUT_DIR', Path(__file__).parent / 'evidence'))
OUT.mkdir(parents=True, exist_ok=True)
OFFICIAL = 'https://leetcode.com/problems/median-employee-salary/'
QUERY = '''query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId title titleSlug isPaidOnly content translatedContent
    exampleTestcases sampleTestCase
    codeSnippets { lang langSlug code }
    mysqlSchemas
  }
}'''
PAYLOAD = {'query': QUERY, 'variables': {'titleSlug': 'median-employee-salary'}}
(OUT / 'graphql-request.json').write_text(json.dumps(PAYLOAD, indent=2) + '\n')
summary = {'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
           'officialUrl': OFFICIAL, 'authentication': 'Public unauthenticated requests; no credentials read.'}
for name, url, data in [('official-page', OFFICIAL, None),
                         ('graphql', 'https://leetcode.com/graphql/', json.dumps(PAYLOAD).encode())]:
    req = urllib.request.Request(url, data=data, headers={
        'User-Agent': 'Mozilla/5.0', 'Content-Type': 'application/json', 'Referer': OFFICIAL})
    try:
        with urllib.request.urlopen(req, timeout=35) as response:
            body = response.read()
            status = response.status
        suffix = 'json' if name == 'graphql' else 'html'
        (OUT / f'{name}-response.{suffix}').write_bytes(body)
        summary[name] = {'url': url, 'httpStatus': status, 'bodyFile': f'{name}-response.{suffix}'}
        if name == 'graphql':
            q = json.loads(body).get('data', {}).get('question')
            if q:
                summary['observed'] = {k: q.get(k) for k in
                    ('questionId', 'title', 'isPaidOnly', 'content', 'translatedContent', 'codeSnippets')}
                summary['contractAvailable'] = bool(q.get('content') and q.get('codeSnippets'))
    except urllib.error.HTTPError as exc:
        (OUT / f'{name}-error-body.txt').write_bytes(exc.read())
        summary[name] = {'url': url, 'httpStatus': exc.code, 'error': str(exc)}
    except Exception as exc:
        summary[name] = {'url': url, 'error': f'{type(exc).__name__}: {exc}'}
(OUT / 'access-summary.json').write_text(json.dumps(summary, indent=2) + '\n')
print(json.dumps(summary, indent=2))
