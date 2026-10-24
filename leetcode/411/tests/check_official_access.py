"""Recheck normal anonymous official access; OUTPUT_DIR keeps frozen evidence intact."""
import datetime
import json
import os
from pathlib import Path
import requests

out = Path(os.environ.get('OUTPUT_DIR', '/tmp/leetcode-411-access-check'))
out.mkdir(parents=True, exist_ok=True)
url = 'https://leetcode.com/problems/minimum-unique-word-abbreviation/'
query = '''query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId title titleSlug isPaidOnly content exampleTestcases
    codeSnippets { lang langSlug code }
  }
}'''
payload = {'query': query, 'variables': {'titleSlug': 'minimum-unique-word-abbreviation'}}
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
r = requests.post('https://leetcode.com/graphql/', json=payload, timeout=45)
(out / 'official-graphql-response.json').write_text(r.text, encoding='utf-8')
(out / 'official-graphql-request.json').write_text(json.dumps(payload, indent=2) + '\n', encoding='utf-8')
record = {'accessedAt': started, 'officialUrl': url, 'endpoint': 'https://leetcode.com/graphql/',
          'method': 'POST', 'httpStatus': r.status_code, 'authentication': 'anonymous; no supplied credentials'}
r.raise_for_status()
data = r.json()
q = data.get('data', {}).get('question') or {}
record['observed'] = {k: q.get(k) for k in ['questionId', 'title', 'titleSlug', 'isPaidOnly']}
record['statementAvailable'] = isinstance(q.get('content'), str) and bool(q['content'].strip())
record['interfacesAvailable'] = isinstance(q.get('codeSnippets'), list) and bool(q['codeSnippets'])
record['status'] = 'contract-available-for-review' if record['statementAvailable'] and record['interfacesAvailable'] else 'blocked'
(out / 'access-result.json').write_text(json.dumps(record, indent=2) + '\n', encoding='utf-8')
print(json.dumps(record, indent=2))
