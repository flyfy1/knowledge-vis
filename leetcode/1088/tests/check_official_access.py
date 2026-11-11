"""Repeat ordinary public GraphQL observation; never accesses credentials.
OUTPUT_DIR may point outside the frozen candidate for reviewer evidence.
"""
import datetime
import json
import os
from pathlib import Path
import urllib.request

out = Path(os.environ.get('OUTPUT_DIR', Path(__file__).parent / 'evidence-rerun'))
out.mkdir(parents=True, exist_ok=True)
payload = {
    'query': 'query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { questionId questionFrontendId title titleSlug isPaidOnly difficulty content exampleTestcases metaData codeSnippets { lang langSlug code } } }',
    'variables': {'titleSlug': 'confusing-number-ii'},
}
record = {'verifiedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'officialUrl': 'https://leetcode.com/problems/confusing-number-ii/',
          'endpoint': 'https://leetcode.com/graphql/', 'request': payload,
          'authentication': 'No credentials or cookies supplied; ordinary public request.'}
request = urllib.request.Request(record['endpoint'], data=json.dumps(payload).encode(),
                                 headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(request, timeout=30) as response:
        record.update(httpStatus=response.status, responseText=response.read().decode())
    question = json.loads(record['responseText']).get('data', {}).get('question') or {}
    record['contractAccessible'] = bool(question.get('content') and question.get('codeSnippets'))
except Exception as error:
    record['error'] = str(error)
    record['contractAccessible'] = False
(out / 'official-graphql-rerun.json').write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'contractAccessible': record['contractAccessible'], 'evidence': str(out / 'official-graphql-rerun.json')}))
