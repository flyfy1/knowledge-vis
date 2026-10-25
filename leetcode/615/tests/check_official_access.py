"""Capture public official evidence without credentials. OUTPUT_DIR controls artifacts."""
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
payload = {'query': query, 'variables': {'titleSlug': 'average-salary-departments-vs-company'}}
response = requests.post('https://leetcode.com/graphql/', json=payload, timeout=40)
capture = {'accessedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
           'url': response.url, 'method': 'POST', 'authentication': 'none',
           'request': payload, 'httpStatus': response.status_code}
try:
    capture['response'] = response.json()
except ValueError:
    capture['responseText'] = response.text
(output / 'official-graphql.json').write_text(json.dumps(capture, ensure_ascii=False, indent=2) + '\n')
response.raise_for_status()
question = capture['response']['data']['question']
assert question['questionFrontendId'] == '615'
print(json.dumps({'httpStatus': capture['httpStatus'], 'isPaidOnly': question['isPaidOnly'],
                  'contentAvailable': question['content'] is not None,
                  'codeSnippetsAvailable': question['codeSnippets'] is not None}))
print('Capture saved:', output / 'official-graphql.json')
