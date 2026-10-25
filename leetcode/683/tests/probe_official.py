"""Recheck public official access without credentials or paywall workarounds.

Run from repository root. OUTPUT_DIR overrides the evidence destination.
"""
import datetime
import json
import os
from pathlib import Path
import urllib.error
import urllib.request

DEST = Path(os.environ.get('OUTPUT_DIR', Path(__file__).parent / 'evidence'))
DEST.mkdir(parents=True, exist_ok=True)
URL = 'https://leetcode.com/problems/k-empty-slots/'
QUERY = '''query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId questionFrontendId title titleSlug isPaidOnly
    content exampleTestcases sampleTestCase metaData
    codeSnippets { lang langSlug code }
  }
}'''
PAYLOAD = {'query': QUERY, 'variables': {'titleSlug': 'k-empty-slots'}}
(DEST / 'graphql-request.json').write_text(json.dumps(PAYLOAD, indent=2) + '\n')
report = {'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'officialUrl': URL, 'authentication': 'None; public requests only', 'requests': []}
for name, url, data in [('official-page', URL, None),
                        ('official-graphql', 'https://leetcode.com/graphql/', json.dumps(PAYLOAD).encode())]:
    request = urllib.request.Request(url, data=data, headers={
        'User-Agent': 'Mozilla/5.0', 'Content-Type': 'application/json', 'Referer': URL})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = response.read()
            status = response.status
    except urllib.error.HTTPError as error:
        body, status = error.read(), error.code
    except Exception as error:
        report['requests'].append({'name': name, 'error': str(error)})
        continue
    filename = name + ('.json' if name.endswith('graphql') else '.html')
    (DEST / filename).write_bytes(body)
    record = {'name': name, 'url': url, 'status': status, 'capture': filename}
    if name.endswith('graphql'):
        try:
            question = json.loads(body).get('data', {}).get('question')
            record['observedQuestion'] = question
            record['contractAccessible'] = bool(question and question.get('content') and question.get('codeSnippets'))
        except (ValueError, AttributeError) as error:
            record['parseError'] = str(error)
    else:
        text = body.decode('utf-8', errors='replace')
        record['subscriptionMessagePresent'] = 'Subscribe to unlock' in text
    report['requests'].append(record)
(DEST / 'access-report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
print(json.dumps(report, indent=2, ensure_ascii=False))
