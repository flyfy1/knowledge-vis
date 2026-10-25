"""Independent coverage oracles. Run from any cwd; output goes to OUTPUT_DIR."""
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import re
import subprocess

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
OUT = Path(os.environ.get('OUTPUT_DIR', HERE / 'evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('submission', ROOT / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
checks = 0


def verify(obj, cells, endpoints=range(1, 7)):
    global checks
    p = obj.points
    assert len(p) % 2 == 0 and p == sorted(set(p)), p
    expected = []
    prior = False
    for x in endpoints:
        covered = x in cells
        if covered != prior:
            expected.append(x)
        prior = covered
    assert p == expected, (p, expected, cells)
    for left, right in itertools.combinations(endpoints, 2):
        want = all(x in cells for x in range(left, right))
        assert obj.queryRange(left, right) is want, (p, left, right)
        checks += 1


# All 32 coverage states on [1,6), all valid add/remove ranges, all queries.
for mask in range(32):
    cells = {x for x in range(1, 6) if mask >> (x-1) & 1}
    for left, right in itertools.combinations(range(1, 7), 2):
        for method in ['addRange', 'removeRange']:
            obj = mod.RangeModule()
            for x in cells:
                obj.addRange(x, x+1)
            verify(obj, cells)
            new = cells.copy()
            if method == 'addRange':
                new.update(range(left, right))
            else:
                new.difference_update(range(left, right))
            assert getattr(obj, method)(left, right) is None
            verify(obj, new)

# Seeded sequential calls, including half-integer membership cross-checks.
rng = random.Random(715)
obj, cells = mod.RangeModule(), set()
for _ in range(10000):
    left, right = sorted(rng.sample(range(1, 51), 2))
    method = rng.choice(['addRange', 'removeRange', 'queryRange'])
    if method == 'addRange':
        obj.addRange(left, right); cells.update(range(left, right))
    elif method == 'removeRange':
        obj.removeRange(left, right); cells.difference_update(range(left, right))
    else:
        assert obj.queryRange(left, right) == all(x in cells for x in range(left, right))
    # Reconstruct coverage without using binary search/parity.
    assert all(any(a <= x + .5 < b for a,b in zip(obj.points[::2],obj.points[1::2])) == (x in cells) for x in range(1,51))
    assert len(obj.points)%2 == 0 and obj.points == sorted(set(obj.points))
    checks += 1

# Arbitrary huge endpoints: compress all future endpoints into elementary segments.
coords = [1, 2, 99, 123456789, 500000000, 999999995, 999999997, 999999999, 1000000000]
obj, flags = mod.RangeModule(), [False] * (len(coords)-1)
for _ in range(3000):
    i,j = sorted(rng.sample(range(len(coords)),2))
    kind=rng.choice(['addRange','removeRange','queryRange'])
    if kind == 'queryRange':
        assert obj.queryRange(coords[i],coords[j]) == all(flags[i:j])
    else:
        getattr(obj,kind)(coords[i],coords[j])
        flags[i:j]=[kind=='addRange']*(j-i)
    want=[]
    prior=False
    for k,x in enumerate(coords):
        current=flags[k] if k<len(flags) else False
        if current!=prior: want.append(x)
        prior=current
    assert obj.points==want
    checks+=1

# Canonical official example and fresh exercise.
obj=mod.RangeModule(); obj.addRange(10,20); obj.removeRange(14,16)
assert [obj.queryRange(*r) for r in [(10,14),(13,15),(16,17)]] == [True,False,True]
obj=mod.RangeModule();obj.addRange(3,11);obj.removeRange(5,9);obj.addRange(6,9)
assert obj.points == [3,5,6,11] and obj.queryRange(6,11) is True

# Source mirror is only a JSON-encoded exact source assignment.
mirror=(ROOT/'python-code.js').read_text()
assert re.fullmatch(r'window\.PYTHON_SOURCE = ("(?:[^"\\]|\\.)*");\n',mirror)
assert json.loads(mirror[len('window.PYTHON_SOURCE = '):-2]) == (ROOT/'solution.py').read_text()

# Detect duplicate dictionary keys BEFORE a JSON parser can silently overwrite.
def unique(pairs):
    out={}
    for k,v in pairs:
        assert k not in out, 'duplicate localization key: '+k
        out[k]=v
    return out
copy=(ROOT/'copy.js').read_text()
pairs=json.loads(copy[len('window.LESSON_COPY = '):-2],object_pairs_hook=unique)
assert all(isinstance(v,list) and len(v)==2 and all(isinstance(s,str) and s for s in v) for v in pairs.values())

# Canonical run at maximum call count; no claim about judge time limits.
obj=mod.RangeModule()
for x in range(1,10000,2): obj.addRange(x,x+1)
for x in range(1,10000,2): assert obj.queryRange(x,x+1)
assert len(obj.points)==10000

report={'status':'pass','oracleChecks':checks,'exhaustiveCoverageStates':32,'seed':715,'sequentialCalls':10000,'compressedHugeEndpointCalls':3000,'maxCallCountScenario':10000,'copyKeys':len(pairs),'sourceParity':'exact including final newline','scope':'author self-check, no LeetCode submission or independent review'}
(OUT/'solution-results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
