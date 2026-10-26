"""Reproducible unauthenticated access probe; never bypasses Premium."""
from pathlib import Path
import json, os, requests

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests' / 'evidence'))
OUT.mkdir(parents=True, exist_ok=True)
request = json.loads((ROOT / 'tests' / 'evidence' / 'graphql-request.json').read_text())
response = requests.post(request['endpoint'], json={'query': request['query'], 'variables': request['variables']}, timeout=20)
body = response.json()
q = body.get('data', {}).get('question') or {}
summary = {
    'status': response.status_code,
    'repositoryProblemId': 1183,
    'graphqlQuestionId': q.get('questionId'),
    'title': q.get('title'),
    'slug': q.get('titleSlug'),
    'isPaidOnly': q.get('isPaidOnly'),
    'difficulty': q.get('difficulty'),
    'contentAvailable': bool(q.get('content')),
    'translatedContentAvailable': bool(q.get('translatedContent')),
    'codeSnippetsAvailable': bool(q.get('codeSnippets')),
    'contractAvailable': bool(q.get('content') and q.get('codeSnippets')),
}
(OUT / 'graphql-response.json').write_text(json.dumps({'status': response.status_code, 'body': body}, ensure_ascii=False, indent=2) + '\n')
(OUT / 'access-summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(summary, ensure_ascii=False))
