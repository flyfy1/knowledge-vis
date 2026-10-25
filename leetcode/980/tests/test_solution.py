"""Author computational check; OUTPUT_DIR redirects all emitted evidence."""
import os, json, itertools, random, importlib.util
from pathlib import Path
from functools import lru_cache
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',ROOT/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)

def permutation_oracle(grid):
    n=len(grid[0]);cells=[r*n+c for r,row in enumerate(grid) for c,x in enumerate(row) if x!=-1]
    s=next(v for v in cells if grid[v//n][v%n]==1);e=next(v for v in cells if grid[v//n][v%n]==2)
    middle=[v for v in cells if v not in (s,e)]
    def adjacent(a,b):return abs(a//n-b//n)+abs(a%n-b%n)==1
    return sum(all(adjacent(a,b) for a,b in zip(route,route[1:])) for order in itertools.permutations(middle) for route in [(s,*order,e)])

def subset_oracle(grid):
    n=len(grid[0]);cells=[r*n+c for r,row in enumerate(grid) for c,x in enumerate(row) if x!=-1]
    start=next(i for i,v in enumerate(cells) if grid[v//n][v%n]==1);end=next(i for i,v in enumerate(cells) if grid[v//n][v%n]==2)
    adj=[[j for j,b in enumerate(cells) if abs(a//n-b//n)+abs(a%n-b%n)==1] for a in cells]
    @lru_cache(None)
    def dp(last,mask):
        if last==end:return int(mask==(1<<len(cells))-1)
        return sum(dp(j,mask|1<<j) for j in adj[last] if not mask>>j&1)
    return dp(start,1<<start)

def check(g,oracle):
    original=[r[:] for r in g];expected=oracle(g);actual=mod.Solution().uniquePathsIII(g)
    assert actual==expected,(g,expected,actual)
    assert g==original,'input not restored'
    return expected

count=0
for m,n in [(1,2),(1,3),(1,4),(2,2),(2,3),(3,2)]:
    for s,e in itertools.permutations(range(m*n),2):
        other=[v for v in range(m*n) if v not in (s,e)]
        for walls in range(1<<len(other)):
            a=[0]*(m*n);a[s]=1;a[e]=2
            for k,v in enumerate(other):
                if walls>>k&1:a[v]=-1
            check([a[i*n:(i+1)*n] for i in range(m)],permutation_oracle);count+=1
rng=random.Random(980)
for _ in range(250):
    m,n=rng.choice([(3,3),(3,4),(4,4),(2,10)])
    a=[-1 if rng.random()<.3 else 0 for _ in range(m*n)];s,e=rng.sample(range(m*n),2);a[s]=1;a[e]=2
    check([a[i*n:(i+1)*n] for i in range(m)],subset_oracle)
# Official, tiny, blocked, 20-cell corridor and maximal 4x5 board.
fixtures=[[[1,2],[0,0]],[[1,0,0,0],[0,0,0,0],[0,0,2,-1]],[[1,0,0,0],[0,0,0,0],[0,0,0,2]],[[0,1],[2,0]],[[1,2]],[[1,-1,2]],[[1,0,2],[0,-1,0]],[[1]+[0]*18+[2]],[[1,0,0,0,0],[0]*5,[0]*5,[0,0,0,0,2]]]
results=[{'grid':g,'expected':check(g,subset_oracle)} for g in fixtures]
assert [x['expected'] for x in results[:7]]==[1,2,4,0,1,0,0]
(OUT/'oracle-fixtures.json').write_text(json.dumps(results))
(OUT/'numerical.json').write_text(json.dumps({'kind':'author self-check','exhaustive':count,'seeded':250,'boundaries':results,'inputRestoration':True},indent=2))
print(f'PASS: {count} exhaustive, 250 seeded, {len(fixtures)} boundaries; canonical Python and input restoration')
