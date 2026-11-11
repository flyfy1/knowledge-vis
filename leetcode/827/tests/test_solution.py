import importlib.util, itertools, random, json, os
from pathlib import Path
from baseline import baseline
root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('solution',root/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
sol=mod.Solution();cases=[]
for n in range(1,4):
    for bits in itertools.product((0,1), repeat=n*n):
        cases.append([list(bits[i*n:(i+1)*n]) for i in range(n)])
rng=random.Random(827)
for _ in range(350):
    n=rng.randrange(1,8);cases.append([[rng.randrange(2) for _ in range(n)] for _ in range(n)])
records=[]
for g in cases:
    before=[r[:] for r in g];expected=baseline(g);actual=sol.largestIsland(g)
    assert actual==expected,(g,actual,expected)
    assert g==before
    records.append({'grid':g,'expected':expected})
for g,want in [([[0]*500 for _ in range(500)],1),([[1]*500 for _ in range(500)],250000),([[int((r+c)%2==0) for c in range(500)] for r in range(500)],5)]:
    assert sol.largestIsland(g)==want
# A long connected serpentine island exceeds Python recursion depth.
g=[[int(r%2==0 or (c==499 if (r//2)%2==0 else c==0)) for c in range(500)] for r in range(500)]
assert sol.largestIsland(g)==sum(map(sum,g))+1
out=Path(os.environ.get('OUTPUT_DIR',root/'tests/evidence'));out.mkdir(parents=True,exist_ok=True)
(out/'oracle-cases.json').write_text(json.dumps(records))
(out/'python-results.json').write_text(json.dumps({'kind':'author computational self-check','result':'pass','smallCases':len(cases),'exhaustive':'all binary grids n=1..3','randomSeed':827,'maxN':500,'boundaries':['all water','all land','checkerboard','long snake'],'inputPreserved':True},indent=2))
print('PASS',len(cases),'small oracle cases and 4 maximum cases')
