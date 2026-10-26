"""Capture ordinary public official access; OUTPUT_DIR keeps frozen evidence intact."""
import datetime
import json
import os
from pathlib import Path
import requests

OUT = Path(os.environ.get('OUTPUT_DIR', Path(__file__).parent / 'evidence'))
OUT.mkdir(parents=True, exist_ok=True)
URL = 'https://leetcode.com/problems/string-transforms-into-another-string/'
QUERY = '''query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId questionFrontendId title titleSlug isPaidOnly difficulty
    content exampleTestcases sampleTestCase metaData
    codeSnippets { lang langSlug code }
  }
}'''
payload = {'query': QUERY, 'variables': {'titleSlug': 'string-transforms-into-another-string'}}
def save(name, value):
    (OUT / name).write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n')

summary = {'verifiedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
           'officialSource': URL, 'authorStatus': 'blocked',
           'independentReview': 'not performed',
           'access': 'Unauthenticated ordinary HTTPS; no credentials inspected or supplied.'}
save('graphql-request.json', payload)
for name, method, url, kwargs in [
    ('page', requests.get, URL, {}),
    ('graphql', requests.post, 'https://leetcode.com/graphql/', {'json': payload}),
]:
    try:
        response = method(url, timeout=40, **kwargs)
        summary[name] = {'url': response.url, 'httpStatus': response.status_code}
        (OUT / ('official-page.html' if name == 'page' else 'official-graphql.json')).write_text(response.text)
        if name == 'graphql' and response.ok:
            question = response.json().get('data', {}).get('question')
            summary[name]['observedQuestion'] = question
            summary['contractAccessible'] = bool(question and question.get('content') and question.get('codeSnippets'))
    except requests.RequestException as exc:
        summary[name] = {'url': url, 'error': str(exc)}
summary['nextNeededInput'] = ('Normally authorized official statement, constraints, examples with outputs and exceptions, '
                             'plus actual language selector and submission templates. No language selected yet.')
save('access-summary.json', summary)
print(json.dumps(summary, indent=2))
