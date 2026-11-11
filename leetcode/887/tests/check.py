"""Run from any directory; EVIDENCE_DIR redirects all emitted artifacts."""
import importlib.util, json, math, os, random, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('EVIDENCE_DIR',ROOT/'tests/evidence')); OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',ROOT/'solution.py'); mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
# Independent minimax: enumerate the first drop in each remaining interval.
limit=60
D=[[0]*(limit+1) for _ in range(8)]
for h in range(1,limit+1): D[1][h]=h
for e in range(2,8):
    for h in range(1,limit+1):
        D[e][h]=1+min(max(D[e-1][x-1],D[e][h-x]) for x in range(1,h+1))
checks=0
for e in range(1,8):
    for h in range(1,limit+1):
        assert mod.Solution().superEggDrop(e,h)==D[e][h],(e,h)
        checks+=1
rng=random.Random(887)
def combinatorial(e,h):
    m=0
    while sum(math.comb(m,j) for j in range(1,min(e,m)+1))<h:m+=1
    return m
cases=[(1,2,2),(2,6,3),(3,14,4),(2,10,4),(2,11,5),(1,10000,10000),(100,10000,14),(2,10000,141),(100,1,1)]
for e,h,want in cases:assert mod.Solution().superEggDrop(e,h)==want
for _ in range(100):
    e,h=rng.randint(1,100),rng.randint(1,10000)
    assert mod.Solution().superEggDrop(e,h)==combinatorial(e,h)
source=(ROOT/'solution.py').read_text()
mirror=(ROOT/'python-code.js').read_text()
assert json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').removesuffix(';\n'))==source
# Detect duplicate JS dictionary keys before evaluating it, then verify shape in browser.
copy=(ROOT/'copy.js').read_text()
keys=re.findall(r'(?:\{|,)\s*([A-Za-z]\w*)\s*:\s*\[',copy)
assert len(keys)==len(set(keys)), 'duplicate localization key'
assert len(keys)==79
result={'kind':'author self-check','minimaxExhaustive':checks,'seed':887,'randomBinomialCases':100,'boundaries':cases,'exactMirror':True,'uniqueCopyKeys':len(keys)}
(OUT/'python-results.json').write_text(json.dumps(result,indent=2))
# Fixtures also independently check the browser core at every intermediate m/e.
fixtures=[]
for e,h in [(2,6),(1,2),(3,14),(2,10),(1,6),(3,1)]+[(rng.randint(1,7),rng.randint(1,60)) for _ in range(80)]:
    m=D[e][h]
    rows=[[sum(math.comb(i,j) for j in range(1,min(i,a)+1)) for a in range(e+1)] for i in range(m+1)]
    fixtures.append({'k':e,'n':h,'rows':rows})
(OUT/'oracle-fixtures.json').write_text(json.dumps(fixtures))
print(json.dumps(result))
