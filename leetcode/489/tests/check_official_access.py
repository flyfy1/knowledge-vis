"""Recheck only public official access; OUTPUT_DIR keeps frozen evidence unchanged."""
import datetime
import json
import os
from pathlib import Path
import requests

output = Path(os.environ.get('OUTPUT_DIR', Path(__file__).resolve().parents[1] / 'provenance'))
output.mkdir(parents=True, exist_ok=True)
query = 'query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { questionId questionFrontendId title titleSlug isPaidOnly content exampleTestcases sampleTestCase metaData codeSnippets { lang langSlug code } } }'
payload = {'query': query, 'variables': {'titleSlug': 'robot-room-cleaner'}}
response = requests.post('https://leetcode.com/graphql/', json=payload, timeout=35)
response.raise_for_status()
raw = response.content
status = response.status_code
content_type = response.headers.get('Content-Type')
(output / 'official-graphql-response.json').write_bytes(raw)
question = json.loads(raw)['data']['question']
assert question['questionFrontendId'] == '489'
summary = {
    'verifiedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'officialSource': 'https://leetcode.com/problems/robot-room-cleaner/',
    'endpoint': 'https://leetcode.com/graphql/',
    'request': payload,
    'httpStatus': status,
    'contentType': content_type,
    'isPaidOnly': question['isPaidOnly'],
    'statementAvailable': question['content'] is not None,
    'codeSnippetsAvailable': question['codeSnippets'] is not None,
    'access': 'Public unauthenticated request; no credentials or alternative protected endpoints.',
}
(output / 'official-access-summary.json').write_text(json.dumps(summary, indent=2) + '\n')
print(json.dumps(summary, indent=2))
