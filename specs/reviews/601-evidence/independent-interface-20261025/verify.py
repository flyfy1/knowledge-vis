import ast
import datetime
import json
import pathlib
import subprocess
import urllib.request

out = pathlib.Path(__file__).resolve().parent
query = 'query InterfaceAudit($titleSlug: String!) { question(titleSlug: $titleSlug) { questionId questionFrontendId title difficulty isPaidOnly codeSnippets { lang langSlug code } } }'
payload = {'query': query, 'variables': {'titleSlug': 'human-traffic-of-stadium'}}
endpoint = 'https://leetcode.com/graphql/'
official_url = 'https://leetcode.com/problems/human-traffic-of-stadium/'
request = urllib.request.Request(endpoint, data=json.dumps(payload).encode(), headers={'Content-Type': 'application/json', 'Referer': official_url, 'User-Agent': 'Mozilla/5.0'}, method='POST')
with urllib.request.urlopen(request, timeout=30) as response:
    data = json.load(response)
    status = response.status
record = {'accessedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'officialUrl': official_url, 'endpoint': endpoint, 'method': 'POST', 'request': payload, 'httpStatus': status, 'response': data}
(out / 'official-response.json').write_text(json.dumps(record, indent=2) + '\n')
q = data['data']['question']
assert q['questionId'] == '601' and q['questionFrontendId'] == '601' and q['isPaidOnly'] is False
pandas = [s for s in q['codeSnippets'] if s['lang'] == 'Pandas' and s['langSlug'] == 'pythondata']
assert len(pandas) == 1
candidate = '19aa80163e63c52809206f13fd78dd38ffb806ba'
source = subprocess.check_output(['git', 'show', candidate + ':leetcode/601/solution.py'], text=True)
(out / 'candidate-solution.py').write_text(source)

def signature(source):
    tree = ast.parse(source)
    function = next(n for n in tree.body if isinstance(n, ast.FunctionDef))
    return {'name': function.name, 'args': ast.dump(function.args, include_attributes=False), 'returns': ast.dump(function.returns, include_attributes=False)}

official = signature(pandas[0]['code'] + '    pass\n')
actual = signature(source)
assert official == actual
result = {'candidate': candidate, 'canonicalPath': 'leetcode/601/solution.py', 'officialLanguage': pandas[0]['lang'], 'officialSlug': pandas[0]['langSlug'], 'officialSignature': official, 'candidateSignature': actual, 'signatureMatches': True, 'languages': [s['lang'] for s in q['codeSnippets']]}
(out / 'comparison.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({'httpStatus': status, 'question': q['title'], 'pandas': pandas[0], 'signatureMatches': True}))
