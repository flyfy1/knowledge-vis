"""Execute canonical Python and the actual displayed recursive baseline."""
import functools
import html
import itertools
import json
from pathlib import Path
import random
import re
import sys

folder = Path(__file__).resolve().parents[1]
source = (folder / 'solution.py').read_text()
namespace = {}
exec(compile(source, str(folder / 'solution.py'), 'exec'), namespace)
solve = namespace['Solution']().isMatch
baseline_source = html.unescape(re.search(r'<pre><code>(def baseline.*?)</code></pre>', (folder / 'index.html').read_text(), re.S)[1])
base_ns = {}
exec(compile(baseline_source, 'displayed-baseline', 'exec'), base_ns)
baseline = base_ns['baseline']

@functools.lru_cache(None)
def oracle(s, p):
    if not p:
        return not s
    if p[0] == '*':
        return any(oracle(s[k:], p[1:]) for k in range(len(s) + 1))
    return bool(s) and p[0] in (s[0], '?') and oracle(s[1:], p[1:])

def strings(alphabet, limit):
    return [''.join(chars) for n in range(limit + 1) for chars in itertools.product(alphabet, repeat=n)]

calls = []
def profile(frame, event, arg):
    if event == 'call' and frame.f_code is baseline.__code__:
        calls.append((frame.f_locals['s'], frame.f_locals['p']))
sys.setprofile(profile)
try:
    assert baseline('a', 'b**') is False
finally:
    sys.setprofile(None)
assert calls.count(('', 'b*')) == 2, calls
assert calls == [('a', 'b**'), ('a', 'b*'), ('a', 'b'), ('', 'b*'), ('', 'b'), ('', 'b**'), ('', 'b*'), ('', 'b')], calls
count = 0
for s in strings('ab', 5):
    for p in strings('ab?*', 4):
        expected = oracle(s, p)
        assert solve(s, p) == baseline(s, p) == expected, (s, p)
        count += 1
rng = random.Random(44)
for _ in range(1000):
    s = ''.join(rng.choices('abc', k=rng.randrange(13)))
    p = ''.join(rng.choices('abc?*', k=rng.randrange(13)))
    assert solve(s, p) == oracle(s, p), (s, p)
for s, p, expected in [('ba', '?*', True), ('ba', 'a*', False), ('ab', 'a*', True), ('', '', True), ('', '**', True), ('', '?', False), ('a', '', False), ('a'*2000, '?'*2000, True), ('a'*2000, '*'*1999+'b', False), ('', '*'*2000, True), ('a'*2000, '', False)]:
    assert solve(s, p) == expected
mirror = (folder / 'python-code.js').read_text()
assert json.loads(re.fullmatch(r'window.PYTHON_SOURCE = (.*);\s*', mirror, re.S)[1]) == source
result = {'exhaustive_pairs_canonical_and_displayed_baseline': count, 'random_pairs':1000,'boundaries_and_transfer':11,'repeated_call_count':2,'actual_displayed_baseline_calls':calls,'python_mirror_exact':True}
(folder / 'evidence/algorithm.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))
