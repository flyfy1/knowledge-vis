"""Lesson-local self-check: execute the displayed baseline and canonical Python."""
import itertools
import html
import json
from pathlib import Path
import re
import runpy

ROOT = Path(__file__).resolve().parents[1]
copy = (ROOT / 'copy.js').read_text()
lesson = json.loads(copy.split('window.LESSON = ', 1)[1].rstrip().removesuffix(';'))
# Required causal content must stay bilingual and available before the recurrence.
assert 'suffixBridge' in copy, '10-DER-01: missing suffix-to-prefix bridge'
rendered_baseline = re.search(r'<pre><code>(.*?)</code></pre>', (ROOT / 'index.html').read_text(), re.S)[1]
assert html.unescape(rendered_baseline) == lesson['baseline']
namespace = {}
exec(lesson['baseline'], namespace)
original = namespace['baseline']
stack, paths = [], []
def logged(s, p):
    stack.append((s, p))
    if (s, p) == ('a', 'a*b'):
        paths.append(stack.copy())
    try:
        return original(s, p)
    finally:
        stack.pop()
namespace['baseline'] = logged
assert logged('aa', 'a*a*b') is False
assert [('aa', 'a*a*b'), ('aa', 'a*b'), ('a', 'a*b')] in paths
assert [('aa', 'a*a*b'), ('a', 'a*a*b'), ('a', 'a*b')] in paths
assert len(paths) == 2
namespace['baseline'] = original
solution = runpy.run_path(str(ROOT / 'solution.py'))['Solution']().isMatch
count = 0
atoms = ('a', 'b', '.', 'a*', 'b*', '.*')
for length in range(5):
    for chars in itertools.product('ab', repeat=length):
        s = ''.join(chars)
        for groups in range(4):
            for terms in itertools.product(atoms, repeat=groups):
                p = ''.join(terms)
                expected = re.fullmatch(p, s) is not None
                assert solution(s, p) == expected == original(s, p), (s, p)
                count += 1
for s, p, expected in [('aa', 'a*a*b', False), ('ba', 'b*a', True), ('ba', 'b*', False), ('a'*20, 'a*'*10, True), ('a'*19+'b', 'a*'*10, False), ('a'*20, '.'*20, True)]:
    assert solution(s, p) == expected
source = (ROOT / 'solution.py').read_text()
mirror = (ROOT / 'python-code.js').read_text()
assert json.loads(re.fullmatch(r'window.PYTHON_SOURCE\s*=\s*("(?:[^"\\]|\\.)*");\s*', mirror)[1]) == source
print(json.dumps({'oracle_cases': count, 'overlap_paths': paths, 'boundary_and_max_cases': 6, 'exact_python_mirror': True}, indent=2))
