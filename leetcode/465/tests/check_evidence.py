"""Check saved access evidence only; not algorithm or lesson acceptance."""
import json
import os
from pathlib import Path

root = Path(__file__).resolve().parents[1]
provenance = root / 'provenance'
access = json.loads((provenance / 'access.json').read_text())
request = json.loads((provenance / 'graphql-request.json').read_text())
question = json.loads((provenance / 'graphql-response.txt').read_text())['data']['question']
assert access['status'] == 200
assert access['officialSource'] == 'https://leetcode.com/problems/optimal-account-balancing/'
assert request['variables']['titleSlug'] == 'optimal-account-balancing'
assert question['questionFrontendId'] == '465'
assert question['titleSlug'] == 'optimal-account-balancing'
assert question['isPaidOnly'] is True
assert question['content'] is None
assert question['codeSnippets'] is None
assert 'subscribe to premium' in (provenance / 'official-page.md').read_text()
report = 'PASS: saved official access evidence confirms statement/interface unavailable. Author evidence check only.\n'
print(report, end='')
if os.environ.get('OUTPUT_DIR'):
    destination = Path(os.environ['OUTPUT_DIR'])
    destination.mkdir(parents=True, exist_ok=True)
    (destination / 'access-evidence-check.txt').write_text(report)
