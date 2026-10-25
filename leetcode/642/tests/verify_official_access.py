"""Capture public official access without credentials. OUTPUT_DIR redirects all artifacts."""
import datetime
import json
import os
from pathlib import Path
import requests

OUT = Path(os.environ.get('OUTPUT_DIR', Path(__file__).parent / 'evidence'))
OUT.mkdir(parents=True, exist_ok=True)
URL = 'https://leetcode.com/problems/design-search-autocomplete-system/'
QUERY = '''query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId questionFrontendId title titleSlug isPaidOnly difficulty
    content exampleTestcases sampleTestCase
    codeSnippets { lang langSlug code }
  }
}'''
payload = {'query': QUERY, 'variables': {'titleSlug': 'design-search-autocomplete-system'}}
(OUT / 'graphql-request.json').write_text(json.dumps(payload, indent=2) + '\n')
report = {'verifiedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'officialUrl': URL, 'access': 'Public unauthenticated requests; no credentials used.'}
for name, method, url, kwargs in [
    ('official-page', requests.get, URL, {}),
    ('official-graphql', requests.post, 'https://leetcode.com/graphql/', {'json': payload}),
]:
    try:
        response = method(url, timeout=40, **kwargs)
        (OUT / (name + '.txt')).write_text(response.text)
        report[name] = {'status': response.status_code, 'url': response.url,
                        'contentType': response.headers.get('Content-Type')}
        if name == 'official-graphql' and response.status_code == 200:
            question = response.json().get('data', {}).get('question')
            report['observedQuestion'] = question
            report['contractAccessible'] = bool(question and question.get('content') and question.get('codeSnippets'))
    except (requests.RequestException, ValueError) as error:
        report[name] = {'error': str(error)}
(OUT / 'official-access.json').write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
print(json.dumps(report, indent=2, ensure_ascii=False))
