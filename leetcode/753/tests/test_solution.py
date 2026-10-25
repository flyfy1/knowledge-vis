"""Independent coverage enumeration and shortest-path oracle; no Euler traversal."""
import collections
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
spec = importlib.util.spec_from_file_location('candidate', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
solve = module.Solution().crackSafe

def passwords(n, k):
    return {''.join(p) for p in itertools.product(map(str, range(k)), repeat=n)}

def validate(n, k, s):
    words = passwords(n, k)
    assert isinstance(s, str)
    assert set(s) <= set(map(str, range(k)))
    assert len(s) == len(words) + n - 1, (n, k, len(s))
    assert {s[i:i+n] for i in range(len(s)-n+1)} == words

def shortest_bfs(n, k):
    # Search all possible typed strings, merging equivalent suffix + coverage states.
    words = sorted(passwords(n, k))
    bit = {w: 1 << i for i, w in enumerate(words)}
    target = (1 << len(words)) - 1
    queue = collections.deque([('', 0, '')])
    seen = {('', 0)}
    while queue:
        suffix, mask, s = queue.popleft()
        if mask == target:
            return s
        for d in map(str, range(k)):
            window = suffix + d
            new_mask = mask | bit.get(window, 0)
            tail = window[-(n-1):] if n > 1 else ''
            key = (tail, new_mask)
            if key not in seen:
                seen.add(key)
                queue.append((tail, new_mask, s + d))
    raise AssertionError('No construction')

baseline_code = re.search(r'<pre><code>(# Coverage baseline.*?)</code></pre>', (ROOT/'index.html').read_text(), re.S)[1]
baseline_scope = {}
exec(baseline_code, baseline_scope)
baseline = baseline_scope['concatenate_all']

pairs = [(n,k) for n in range(1,5) for k in range(1,11) if k**n <= 4096]
for n,k in pairs:
    validate(n,k,solve(n,k))
    b = baseline(n,k)
    assert len(b) == n*k**n
    assert passwords(n,k) <= {b[i:i+n] for i in range(len(b)-n+1)}
small = [(1,k) for k in range(1,6)] + [(n,k) for n in range(2,5) for k in range(1,3)] + [(2,3)]
oracles=[]
for n,k in small:
    oracle=shortest_bfs(n,k)
    assert len(solve(n,k)) == len(oracle)
    oracles.append({'n':n,'k':k,'bfs':oracle,'length':len(oracle)})
rng=random.Random(753)
for _ in range(150):
    n,k=rng.choice(pairs)
    validate(n,k,solve(n,k))
assert solve(4,1)=='0000'
assert len(solve(4,8))==4099
# Strict JSON pairs prevent silent duplicate localization keys.
def unique_pairs(pairs):
    d={}
    for k,v in pairs:
        assert k not in d, 'Duplicate copy key: '+k
        d[k]=v
    return d
copy=json.loads((ROOT/'copy.js').read_text().removeprefix('window.LESSON_COPY = ').rstrip().removesuffix(';'),object_pairs_hook=unique_pairs)
assert all(isinstance(v,list) and len(v)==2 and all(isinstance(x,str) and x for x in v) for v in copy.values())
mirror=(ROOT/'python-code.js').read_text().removeprefix('window.PYTHON_SOURCE = ').rstrip().removesuffix(';')
assert json.loads(mirror)==(ROOT/'solution.py').read_bytes().decode()
result={'official_domain_pairs':len(pairs),'seeded_repeats':150,'seed':753,'bfs_oracles':oracles,'localization_keys':len(copy),'source_parity':True,'rendered_baseline_executed_pairs':len(pairs)}
(OUT/'solution-results.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
