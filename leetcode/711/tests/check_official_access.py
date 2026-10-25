"""Capture normal unauthenticated official access; never reads credentials.
Rerun: OUTPUT_DIR=/tmp/leetcode-711-access python3 -B leetcode/711/tests/check_official_access.py
"""
import datetime
import json
import os
from pathlib import Path
import urllib.error
import urllib.request

OUT = Path(os.environ.get('OUTPUT_DIR', Path(__file__).parent / 'evidence'))
OUT.mkdir(parents=True, exist_ok=True)
URL = 'https://leetcode.com/problems/number-of-distinct-islands-ii/'
QUERY = '''query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId title titleSlug isPaidOnly content exampleTestcases sampleTestCase
    metaData codeSnippets { lang langSlug code }
  }
}'''
payload = {'query': QUERY, 'variables': {'titleSlug': 'number-of-distinct-islands-ii'}}
(OUT / 'graphql-request.json').write_text(json.dumps(payload, indent=2) + '\n')
summary = {'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
           'officialUrl': URL, 'access': 'Public unauthenticated requests; no credentials used.'}
for name, url, data in [('official-page', URL, None),
                        ('official-graphql', 'https://leetcode.com/graphql/', json.dumps(payload).encode())]:
    request = urllib.request.Request(url, data=data, headers={
        'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = response.read()
            status = response.status
    except urllib.error.HTTPError as error:
        body, status = error.read(), error.code
    except Exception as error:
        summary[name] = {'error': str(error)}
        continue
    filename = name + ('.json' if name.endswith('graphql') else '.html')
    (OUT / filename).write_bytes(body)
    summary[name] = {'httpStatus': status, 'capture': filename}
    if name.endswith('graphql') and status == 200:
        question = json.loads(body).get('data', {}).get('question')
        if question:
            summary['observed'] = {key: question.get(key) for key in
                                   ['questionId', 'isPaidOnly', 'content', 'codeSnippets']}
            summary['contractAvailable'] = bool(question.get('content') and question.get('codeSnippets'))
(OUT / 'access-result.json').write_text(json.dumps(summary, indent=2) + '\n')
print(json.dumps(summary, indent=2))
