"""Check the saved access evidence, offline; optionally emit to OUTPUT_DIR."""
import json
import os
from pathlib import Path

root = Path(__file__).resolve().parents[1]
request = json.loads((root / 'provenance/graphql-request.json').read_text())
assert request['variables']['titleSlug'] == 'find-cumulative-salary-of-an-employee'
question = json.loads((root / 'provenance/official-graphql-response.txt').read_text())['data']['question']
assert question['questionFrontendId'] == '579'
assert question['isPaidOnly'] is True
assert question['content'] is None
assert question['translatedContent'] is None
assert question['codeSnippets'] is None
assert json.loads(question['metaData'])['database'] is True
assert 'pythondata' in json.loads(question['metaData'])
access = json.loads((root / 'provenance/access-results.json').read_text())
assert next(x for x in access if x['method'] == 'POST')['status'] == 200
assert all(x['authenticated'] is False for x in access)
report = {'status': 'access blocker confirmed in saved evidence',
          'canonicalExecution': 'not run: official contract unavailable',
          'browserLessonChecks': 'not run: no lesson candidate',
          'independentReview': 'not performed'}
if os.environ.get('OUTPUT_DIR'):
    out = Path(os.environ['OUTPUT_DIR'])
    out.mkdir(parents=True, exist_ok=True)
    (out / 'access-evidence-check.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
