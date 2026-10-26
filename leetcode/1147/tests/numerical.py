"""Author checks: independent cut-mask oracle, actual official callable, trace fixtures."""
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import re

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('canonical', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
solve = module.Solution().longestDecomposition

def oracle(text):
    if not text:
        return 0
    best = 1
    for mask in range(1 << (len(text) - 1)):
        parts, start = [], 0
        for i in range(len(text) - 1):
            if mask & (1 << i):
                parts.append(text[start:i + 1])
                start = i + 1
        parts.append(text[start:])
        if parts == parts[::-1]:
            best = max(best, len(parts))
    return best

cases = [''.join(p) for n in range(1, 11) for p in itertools.product('ab', repeat=n)]
rng = random.Random(1147)
cases += [''.join(rng.choice('abc') for _ in range(rng.randint(1, 12))) for _ in range(180)]
cases += ['volvo', 'aaaa', 'merchant', 'abcab', 'abxyab']
expected = {}
for s in cases:
    want = oracle(s)
    assert solve(s) == want, (s, want, solve(s))
    expected[s] = want
# Long examples checked against their explicit legal decompositions and known counts.
fixtures = [('ghiabcdefhelloadamhelloabcdefghi', ['ghi','abcdef','hello','adam','hello','abcdef','ghi']),
 ('antaprezatepzapreanta', ['a','nt','a','pre','za','tep','za','pre','a','nt','a'])]
for s, parts in fixtures:
    assert ''.join(parts) == s and parts == parts[::-1]
    assert solve(s) == len(parts)
    expected[s] = len(parts)
for s, want in [('a'*1000,1000),('a'*999,999),('a'*500+'b'*500,1),('a'*499+'b'+'a'*500,999),('z',1),('az',1),('aa',2)]:
    assert solve(s) == want, (len(s),want,solve(s))
source = (ROOT/'solution.py').read_text()
assert (ROOT/'python-code.js').read_text() == 'window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
# Exact baseline displayed by the page is executable and independently checked.
html = (ROOT/'index.html').read_text()
base = re.search(r'<code>(def baseline\(text\):.*?)</code>', html, re.S).group(1)
ns = {}
exec(base, ns)
for s in ['volvo','aaaa','merchant','abxyab','abcab']:
    assert ns['baseline'](s) == oracle(s)
(OUT/'oracle-fixtures.json').write_text(json.dumps(expected, ensure_ascii=False, indent=2)+'\n')
(OUT/'numerical.json').write_text(json.dumps({'kind':'author self-check','cutMaskOracleCases':len(cases),'distinctCases':len(expected),'officialExamples':3,'maxLength':1000,'canonicalCallable':'Solution.longestDecomposition','sourceMirrorExact':True,'displayedBaselineExecuted':True},indent=2)+'\n')
print('PASS:',len(cases),'oracle comparisons, max boundaries, original Python and exact mirror')
