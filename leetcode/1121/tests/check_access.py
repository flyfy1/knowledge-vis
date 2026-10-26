"""Repeat ordinary unauthenticated official access; no credentials or bypass.

Run: OUTPUT_DIR=/tmp/1121-access python3 -B leetcode/1121/tests/check_access.py
Writes only into OUTPUT_DIR, which is required to preserve the frozen evidence.
This checks access, not algorithm correctness or lesson readiness.
"""
import datetime
import json
import os
from pathlib import Path

import requests

output = Path(os.environ['OUTPUT_DIR'])
output.mkdir(parents=True, exist_ok=True)
slug = 'divide-array-into-increasing-sequences'
query = '''query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { questionId questionFrontendId title titleSlug isPaidOnly content exampleTestcases codeSnippets { lang langSlug code } } }'''
body = {'query': query, 'variables': {'titleSlug': slug}}
records = []
for name, method, url, kwargs in [
    ('official-page', 'GET', f'https://leetcode.com/problems/{slug}/', {}),
    ('official-graphql', 'POST', 'https://leetcode.com/graphql/', {'json': body}),
]:
    record = {'accessedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
              'url': url, 'method': method, 'authenticated': False}
    if method == 'POST':
        record['request'] = body
    try:
        response = requests.request(method, url, timeout=35, **kwargs)
        filename = name + '.response.txt'
        (output / filename).write_text(response.text)
        record.update(status=response.status_code, finalUrl=response.url,
                      responseFile=filename,
                      contentType=response.headers.get('Content-Type'))
    except requests.RequestException as error:
        record['error'] = str(error)
    records.append(record)
(output / 'official-access.json').write_text(json.dumps(records, indent=2) + '\n')
print(json.dumps(records, indent=2))
