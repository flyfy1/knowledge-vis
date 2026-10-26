"""Run from any directory. OUTPUT_DIR controls generated evidence."""
import ast
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import sys
import time

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('solution1044', ROOT / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

def oracle(s):
    # Enumerate all contiguous windows by length; keep all tied answers.
    best = {''}
    for width in range(1, len(s)):
        seen, dup = set(), set()
        for start in range(len(s) - width + 1):
            word = s[start:start + width]
            if word in seen:
                dup.add(word)
            seen.add(word)
        if dup:
            best = dup
    return best

def direct_lcp(s, i, j):
    h = 0
    while i+h < len(s) and j+h < len(s) and s[i+h] == s[j+h]:
        h += 1
    return h

checks = {'rank_rounds': 0, 'exact_lcps': 0}
lines = (ROOT / 'solution.py').read_text().splitlines()
rank_line = next(i+1 for i,l in enumerate(lines) if l.strip() == 'rank = new_rank')
lcp_line = next(i+1 for i,l in enumerate(lines) if l.strip() == 'if h > best_len:')
def tracer(frame, event, arg):
    if frame.f_code.co_filename != str(ROOT / 'solution.py'):
        return None
    if event == 'line':
        v = frame.f_locals
        if frame.f_lineno == rank_line:
            s, k, rank, sa = v['s'], v['k'], v['new_rank'], v['sa']
            prefixes = [s[i:i+2*k] for i in sa]
            assert prefixes == sorted(prefixes)
            assert [rank[i] for i in sa] == [sorted(set(prefixes)).index(x) for x in prefixes]
            checks['rank_rounds'] += 1
        if frame.f_lineno == lcp_line:
            assert v['h'] == direct_lcp(v['s'], v['i'], v['j'])
            checks['exact_lcps'] += 1
    return tracer

cases = [''.join(x) for n in range(2,9) for x in itertools.product('ab', repeat=n)]
cases += [''.join(x) for n in range(2,7) for x in itertools.product('abc', repeat=n)]
rng = random.Random(1044)
cases += [''.join(rng.choice('abcde') for _ in range(rng.randint(2,45))) for _ in range(600)]
cases += ['banana','abcd','aaaa','cababa','ababab','mississippi','abcdefabcdef','zzxyzzab']
# Also execute the exact displayed baseline, independently of canonical ranks.
html = (ROOT / 'index.html').read_text()
baseline = html.split('<code>def baseline(s):',1)[1].split('</code>',1)[0]
ns = {}; exec('def baseline(s):'+baseline, ns)
started = time.perf_counter()
sys.settrace(tracer)
try:
    for s in cases:
        before = s
        result = mod.Solution().longestDupSubstring(s)
        assert s == before and result in oracle(s), (s, result, oracle(s))
        assert ns['baseline'](s) in oracle(s)
finally:
    sys.settrace(None)
large = []
for s, expected in [('a'*30000, 'a'*29999),('ab'*15000,'ab'*14999),('a'*15000+'b'*15000,'a'*14999)]:
    start = time.perf_counter();result=mod.Solution().longestDupSubstring(s)
    # Last case permits the equally long b block too.
    assert len(result)==len(expected)
    assert s.find(result, s.find(result)+1) != -1
    large.append({'n':len(s),'answerLength':len(result),'seconds':time.perf_counter()-start})
mirror = (ROOT/'python-code.js').read_text()
assert mirror.startswith('window.PYTHON_SOURCE = ')
assert json.loads(mirror[len('window.PYTHON_SOURCE = '):-2]) == (ROOT/'solution.py').read_text()
report = {'kind':'author self-check','cases':len(cases),'intermediate':checks,'large':large,'seconds':time.perf_counter()-started,'baseline':'all start pairs, direct characters','oracle':'enumerated windows grouped by length','sourceMirrorExact':True}
(OUT/'numerical.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
