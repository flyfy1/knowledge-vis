"""Read public official endpoints only. OUTPUT_DIR relocates all emitted evidence."""
import datetime
import json
import os
from pathlib import Path
import urllib.error
import urllib.request

OUT = Path(os.environ.get('OUTPUT_DIR', Path(__file__).parent / 'evidence'))
OUT.mkdir(parents=True, exist_ok=True)
URL = 'https://leetcode.com/problems/maximum-average-subarray-ii/'
QUERY = '''query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId questionFrontendId title titleSlug isPaidOnly
    content translatedContent exampleTestcases sampleTestCase metaData
    codeSnippets { lang langSlug code }
  }
}'''
payload = {'query': QUERY, 'variables': {'titleSlug': 'maximum-average-subarray-ii'}}
(OUT / 'graphql-request.json').write_text(json.dumps(payload, indent=2) + '\n')
report = {'verifiedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'officialUrl': URL, 'access': 'Unauthenticated public HTTPS; no credentials, cookies or paywall bypass.'}
for name, url, data in [('official-page', URL, None),
                        ('graphql', 'https://leetcode.com/graphql/', json.dumps(payload).encode())]:
    req = urllib.request.Request(url, data=data, headers={
        'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            body = response.read()
            report[name] = {'url': url, 'status': response.status}
    except urllib.error.HTTPError as error:
        body = error.read()
        report[name] = {'url': url, 'status': error.code}
    except Exception as error:
        report[name] = {'url': url, 'error': str(error)}
        continue
    (OUT / (name + ('.json' if name == 'graphql' else '.html'))).write_bytes(body)
    if name == 'graphql' and report[name]['status'] == 200:
        question = json.loads(body).get('data', {}).get('question')
        if question:
            report['observed'] = {key: question.get(key) for key in
                                  ['questionFrontendId', 'isPaidOnly', 'content', 'translatedContent', 'codeSnippets']}
            report['statementAndSelectorAvailable'] = bool(question.get('content') and question.get('codeSnippets'))
(OUT / 'access-result.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
