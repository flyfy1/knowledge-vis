"""Independent graph oracle; run with python3 -B. OUTPUT_DIR redirects evidence."""
from pathlib import Path
import os, json, itertools, random, importlib.util, re
P=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',P/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',P/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)

def oracle(items):
    # Build a strict containment DAG in original input order, without sorting or LIS.
    from functools import lru_cache
    @lru_cache(None)
    def longest(i):
        return 1+max((longest(j) for j in range(len(items)) if items[j][0]<items[i][0] and items[j][1]<items[i][1]),default=0)
    return max((longest(i) for i in range(len(items))),default=0)
count=0

def check(items,expected=None):
    global count
    original=[list(e) for e in items];arg=[e[:] for e in original]
    got=mod.Solution().maxEnvelopes(arg)
    assert got==(oracle(original) if expected is None else expected),(original,got,expected)
    assert arg==original,'input mutated'
    count+=1

for n in range(6):
    for items in itertools.product(list(itertools.product(range(1,4),repeat=2)),repeat=n):check(items)
rng=random.Random(354)
for _ in range(1500):check([[rng.randint(1,100000),rng.randint(1,100000)] for _ in range(rng.randint(1,25))])
for a,b in [([[5,4],[6,4],[6,7],[2,3]],3),([[1,1]]*3,1),([[2,6],[3,5]],1),([[100000,100000]],1)]:check(a,b)
for items,expected in [([[i,i] for i in range(1,100001)],100000),([[i,100001-i] for i in range(1,100001)],1),([[1,1]]*100000,1),([[1,i] for i in range(1,100001)],1),([[i,1] for i in range(1,100001)],1)]:check(items,expected)
mirror=(P/'python-code.js').read_text();assert json.loads(re.fullmatch(r'window.PYTHON_SOURCE = (.*);\n',mirror)[1])==(P/'solution.py').read_text()
def unique(pairs):
    keys=[k for k,v in pairs];assert len(keys)==len(set(keys)),'duplicate copy key';return dict(pairs)
copy=json.loads((P/'copy.js').read_text().removeprefix('window.COPY = ').removesuffix(';\n'),object_pairs_hook=unique)
assert all(isinstance(v,list) and len(v)==2 and all(v) for v in copy.values())
result={'kind':'author self-check','oracle':'strict containment DAG in original order, no sorting or LIS','cases':count,'exhaustive':'all ordered inputs of length 0..5 over [1..3]²','random':'1500 seeded cases, seed 354','maxConstraint':'five n=100000 closed-form cases','sourceMirror':'exact','copyKeys':len(copy)}
(OUT/'python-results.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
