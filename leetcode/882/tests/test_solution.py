import copy
import hashlib
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import subprocess
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('solution882', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
from oracle import baseline
solve = module.Solution().reachableNodes
cases = []
for n in range(1, 5):
    pairs = list(itertools.combinations(range(n), 2))
    for values in itertools.product(range(4), repeat=len(pairs)):
        edges = [[u, v, c-1] for (u, v), c in zip(pairs, values) if c]
        for budget in range(7):
            cases.append([edges, budget, n])
rng = random.Random(882)
for _ in range(600):
    n = rng.randint(1, 8)
    edges = [[u, v, rng.randrange(8)] for u, v in itertools.combinations(range(n), 2) if rng.random() < .4]
    cases.append([edges, rng.randrange(20), n])
for edges, budget, n in cases:
    before = copy.deepcopy(edges)
    actual = solve(edges, budget, n)
    assert actual == baseline(edges, budget, n), (edges, budget, n, actual)
    assert type(actual) is int and edges == before
examples = [([[0,1,10],[0,2,1],[1,2,2]],6,3,13), ([[0,1,4],[1,2,6],[0,2,8],[1,3,1]],10,4,23), ([[1,2,4],[1,4,5],[1,3,1],[2,3,4],[3,4,5]],17,5,1)]
for e,m,n,answer in examples:
    assert solve(e,m,n)==answer
assert solve([[0,1,2]],4,2)==4
assert solve([[0,1,0],[0,2,0],[1,2,4]],4,3)==7
# Maximum n,m,cnt; connected graph, budget exceeds every simple shortest path.
edges = [[i,i+1,10000] for i in range(2999)]
existing = {(u,v) for u,v,_ in edges}
for u,v in itertools.combinations(range(3000),2):
    if len(edges)==10000: break
    if (u,v) not in existing: edges.append([u,v,10000])
assert solve(edges,10**9,3000)==100003000
assert solve(edges,0,3000)==1
# Validate browser snapshots against Floyd-Warshall, independently of Dijkstra.
js = "const a=require(process.argv[1]);process.stdout.write(JSON.stringify(JSON.parse(require('fs').readFileSync(0,'utf8')).map(([edges,M,n])=>a.trace({edges,M,n}))));"
selected=cases[::29] + [[e,m,n] for e,m,n,_ in examples]
traces=json.loads(subprocess.check_output(['node','-e',js,str(ROOT/'core.js')],input=json.dumps(selected).encode()))
for (edges,M,n),frames in zip(selected,traces):
    d=[[float('inf')]*n for _ in range(n)]
    for i in range(n): d[i][i]=0
    for u,v,c in edges: d[u][v]=d[v][u]=c+1
    for k in range(n):
        for i in range(n):
            for j in range(n): d[i][j]=min(d[i][j],d[i][k]+d[k][j])
    old_done=[False]*n
    for f in frames:
        for u,done in enumerate(f['done']):
            if done: assert f['d'][u]==d[0][u]
            if old_done[u]: assert done
        old_done=f['done']
        if f['kind'] in ('original','edge','end'):
            original=sum(x<=M for x in d[0])
            assert f['total']==original+sum(x['add'] for x in f['ledger'])
        for row in f['ledger']:
            u,v,c=row['u'],row['v'],row['c']
            direct=sum(d[0][u]+i<=M or d[0][v]+c+1-i<=M for i in range(1,c+1))
            assert direct==row['add']
    assert frames[-1]['total']==baseline(edges,M,n)
report={'kind':'author self-check','canonicalCases':len(cases)+len(examples)+4,'traceCases':len(selected),'officialExamples':[13,23,1],'maximumClosedForm':100003000,'seed':882,'status':'pass'}
(OUT/'numerical.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
