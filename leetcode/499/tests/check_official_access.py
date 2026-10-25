"""Capture normal public official access; never supplies credentials.
Rerun: OUTPUT_DIR=/tmp/maze499-access python3 -B leetcode/499/tests/check_official_access.py
"""
import datetime
import json
import os
from pathlib import Path
import urllib.request

out = Path(os.environ.get('OUTPUT_DIR', Path(__file__).resolve().parents[1] / 'provenance'))
out.mkdir(parents=True, exist_ok=True)
url = 'https://leetcode.com/graphql/'
payload = {
    'query': 'query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { questionId questionFrontendId title titleSlug isPaidOnly content exampleTestcases sampleTestCase codeSnippets { lang langSlug code } } }',
    'variables': {'titleSlug': 'the-maze-iii'},
}
request = urllib.request.Request(url, data=json.dumps(payload).encode(), headers={
    'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0',
    'Referer': 'https://leetcode.com/problems/the-maze-iii/',
})
record = {
    'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'officialUrl': 'https://leetcode.com/problems/the-maze-iii/',
    'endpoint': url, 'request': payload, 'authentication': 'None; public request only',
}
try:
    with urllib.request.urlopen(request, timeout=30) as response:
        body = response.read().decode()
        record.update(status=response.status, response=json.loads(body))
    question = record['response']['data']['question']
    record['statementAvailable'] = bool(question.get('content'))
    record['interfacesAvailable'] = bool(question.get('codeSnippets'))
    record['result'] = 'available' if record['statementAvailable'] and record['interfacesAvailable'] else 'blocked'
except Exception as error:
    record.update(result='blocked', error=f'{type(error).__name__}: {error}')
(out / 'official-access.json').write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({key: record.get(key) for key in ('checkedAt', 'status', 'statementAvailable', 'interfacesAvailable', 'result')}))
