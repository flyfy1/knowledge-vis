"""Capture normal unauthenticated official GraphQL access; no credentials used.
Rerun: OUTPUT_DIR=/tmp/317-access python3 -B leetcode/317/tests/check_official_access.py
"""
import datetime
import json
import os
from pathlib import Path
import requests

output = Path(os.environ.get('OUTPUT_DIR', Path(__file__).parent / 'evidence'))
output.mkdir(parents=True, exist_ok=True)
query = '''query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId questionFrontendId title titleSlug isPaidOnly content
    exampleTestcases sampleTestCase metaData
    codeSnippets { lang langSlug code }
  }
}'''
payload = {'query': query, 'variables': {'titleSlug': 'shortest-distance-from-all-buildings'}}
response = requests.post('https://leetcode.com/graphql/', json=payload, timeout=40)
response.raise_for_status()
capture = {'accessedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
           'url': response.url, 'httpStatus': response.status_code,
           'authentication': 'None; normal public request', 'request': payload,
           'response': response.json()}
(output / 'official-graphql.json').write_text(json.dumps(capture, indent=2) + '\n')
question = capture['response']['data']['question']
print(json.dumps({'httpStatus': capture['httpStatus'], 'isPaidOnly': question['isPaidOnly'],
                  'statementAvailable': question['content'] is not None,
                  'interfacesAvailable': question['codeSnippets'] is not None}))
