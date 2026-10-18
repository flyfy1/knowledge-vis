"""Lesson-local author regression; run from repository root with python3 -B."""
import itertools
import json
import re
from pathlib import Path
root = Path(__file__).resolve().parents[1]
source = (root / 'solution.py').read_text()
namespace = {}
exec(compile(source, str(root / 'solution.py'), 'exec'), namespace)
solution = namespace['Solution']()
mirror = json.loads(re.fullmatch(r'window.PYTHON_SOURCE = (.*);\s*', (root / 'python-code.js').read_text())[1])
assert source == mirror

def oracle(s):
    best = 0
    for a in range(len(s)):
        for b in range(a + 1, len(s) + 1):
            fragment = s[a:b]
            while '()' in fragment:
                fragment = fragment.replace('()', '')
            if not fragment:
                best = max(best, b - a)
    return best

cases = 0
for n in range(12):
    for chars in itertools.product('()', repeat=n):
        s = ''.join(chars)
        assert solution.longestValidParentheses(s) == oracle(s), s
        cases += 1
for s, answer in [('()(()', 2), ('())(', 2), (')(', 0), ('())(())', 4), ('(' * 30000, 0), (')' * 30000, 0), ('(' * 15000 + ')' * 15000, 30000), ('()' * 15000, 30000)]:
    assert solution.longestValidParentheses(s) == answer
result = {'canonicalLanguage': 'Python', 'exactMirrorParity': True, 'exhaustiveInputsThroughLength11': cases, 'freshAndMaximumCases': 8, 'sameInstanceRepeatedCalls': True}
(root / 'evidence/fix-r1-r2/python.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))
