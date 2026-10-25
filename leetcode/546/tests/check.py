"""Author checks. Run: python3 -B leetcode/546/tests/check.py.
OUTPUT_DIR redirects all generated evidence; never writes source.
"""
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import time
from functools import cache

BASE = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', BASE / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('canonical', BASE / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

@cache
def oracle(a):
    # Independent state: actual remaining sequence, all legal subgroups.
    if not a:
        return 0
    values = []
    for start in range(len(a)):
        for stop in range(start + 1, len(a) + 1):
            if len(set(a[start:stop])) != 1:
                break
            values.append((stop - start) ** 2 + oracle(a[:start] + a[stop:]))
    return max(values)

start = time.monotonic()
cases = list(itertools.chain.from_iterable(itertools.product((1, 2, 3), repeat=n) for n in range(8)))
rng = random.Random(546)
cases += [tuple(rng.randint(1, 4) for _ in range(rng.randint(1, 10))) for _ in range(200)]
cases += [(1, 3, 2, 2, 2, 3, 4, 3, 1), (1, 1, 1), (1,), (1, 2, 2, 1, 2, 2, 1), (2, 1, 1, 2, 2)]
fixtures = []
for a in cases:
    mutable = list(a)
    expected = oracle(a)
    actual = mod.Solution().removeBoxes(mutable)
    assert actual == expected, (a, actual, expected)
    assert mutable == list(a)
    fixtures.append({'a': list(a), 'expected': expected})
assert [oracle(x) for x in [(1, 3, 2, 2, 2, 3, 4, 3, 1), (1, 1, 1), (1,)]] == [23, 9, 1]
# Model intermediate states, including hypothetical saved boxes. Different oracle representation.
states=[]
for _ in range(200):
    a=tuple(rng.randint(1,3) for _ in range(rng.randint(1,7)))
    l=rng.randrange(len(a));r=rng.randrange(l,len(a));k=rng.randrange(3)
    states.append({'a':list(a),'l':l,'r':r,'k':k,'expected':oracle(a[l:r+1]+(a[r],)*k)})
for a, expected in [([1]*100,10000),(list(range(1,101)),100),([1,2]*50,None),([1]*49+[2]+[1]*50,9802)]:
    value=mod.Solution().removeBoxes(a)
    if expected is not None:assert value==expected,(value,expected)
    assert 100<=value<=10000
# Observe the actual canonical nested dp without editing its source.
recorded = {}
def recording_cache(function):
    @cache
    def wrapped(l, r, k):
        value = function(l, r, k)
        recorded[(l, r, k)] = value
        return value
    return wrapped
mod.cache = recording_cache
canonical_states = 0
for a in [(1, 2, 1), (1, 2, 2, 1, 2, 2, 1), (1, 3, 2, 2, 2, 3, 4, 3, 1)]:
    recorded.clear()
    mod.Solution().removeBoxes(list(a))
    for (l, r, k), value in recorded.items():
        assert value == (0 if l > r else oracle(a[l:r+1] + (a[r],)*k))
        assert l > r or r - l + 1 + k <= len(a)
        canonical_states += 1
report={'scope':'author self-check, not independent review or judge acceptance','canonical_cases':len(cases),'exhaustive':'all ternary arrays of lengths 0..7 (empty is defensive only)','seeded':200,'seed':546,'max_length':100,'canonical_intermediate_states':canonical_states,'seconds':round(time.monotonic()-start,3),'passed':True}
(OUT/'fixtures.json').write_text(json.dumps({'cases':fixtures,'states':states}))
(OUT/'python-results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
