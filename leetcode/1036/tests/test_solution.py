import itertools, random, json, os, sys, importlib.util
from pathlib import Path
from collections import deque
P=Path(__file__).resolve().parents[1]; OUT=Path(os.getenv('OUTPUT_DIR',P/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',P/'solution.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

def oracle(blocked,s,t):
    # Exact compression: retain every obstacle coordinate and its neighbors.
    axes=[]
    for d in range(2):
        vals={0,999999,s[d],t[d]}
        for p in blocked:
            vals.update(v for v in [p[d]-1,p[d],p[d]+1] if 0<=v<1000000)
        axes.append(sorted(vals))
    xs,ys=axes; walls={tuple(p) for p in blocked}; start=(xs.index(s[0]),ys.index(s[1]));goal=(xs.index(t[0]),ys.index(t[1]));q=deque([start]);seen={start}
    while q:
        i,j=q.popleft()
        if (i,j)==goal:return True
        for a,b in [(i+1,j),(i-1,j),(i,j+1),(i,j-1)]:
            if 0<=a<len(xs) and 0<=b<len(ys) and (xs[a],ys[b]) not in walls and (a,b) not in seen:
                seen.add((a,b));q.append((a,b))
    return False
count=0

def check(b,s,t,expected=None):
    global count
    before=json.dumps([b,s,t]);actual=m.Solution().isEscapePossible(b,s,t);want=oracle(b,s,t) if expected is None else expected
    assert actual==want,(b,s,t,actual,want)
    assert json.dumps([b,s,t])==before
    count+=1

check([[0,1],[1,0]],[0,0],[0,2],False);check([],[0,0],[999999,999999],True)
cells=list(itertools.product(range(3),repeat=2))
for n in range(4):
    for b in itertools.combinations(cells,n):
        free=[p for p in cells if p not in b]
        for s,t in itertools.combinations(free,2):check([list(p) for p in b],list(s),list(t))
rng=random.Random(1036)
for i in range(450):
    offset=rng.choice([0,999990,500000]);pool=[(offset+x,offset+y) for x in range(7) for y in range(7)]
    sample=rng.sample(pool,rng.randrange(2,15));check([list(p) for p in sample[2:]],list(sample[0]),list(sample[1]))
# Max blocker budget, both free and enclosed corners; far coordinates and b=1.
check([[100+i,100] for i in range(200)],[0,0],[999999,999999],True)
check([[0,1],[1,0]]+[[100+i,100] for i in range(198)],[0,0],[999999,999999],False)
check([[5,5]],[0,0],[999999,999999],True)
check([[5,5]]*200,[0,0],[999999,999999],True)
check([[0,3],[1,2],[2,1],[3,0]],[0,0],[1,1],True)
# Independently validate the clear-line theorem on every <=3-blocker 5x5 grid.
theorem=0;side=5;pool=list(itertools.product(range(side),repeat=2))
for n in range(4):
 for walls in itertools.combinations(pool,n):
    unseen=set(pool)-set(walls);large=0
    while unseen:
        start=unseen.pop();q=[start];comp={start}
        for x,y in q:
            for p in [(x+1,y),(x-1,y),(x,y+1),(x,y-1)]:
                if p in unseen:unseen.remove(p);comp.add(p);q.append(p)
        clean=any(all((x,y) not in walls for x in range(side)) for _,y in comp) or any(all((x,y) not in walls for y in range(side)) for x,_ in comp)
        if not clean:assert len(comp)<=n*n
        if len(comp)>n*n:large+=1
    assert large<=1;theorem+=1
report={'kind':'author self-check','canonical_cases':count,'finite_theorem_grids':theorem,'oracle':'independent coordinate-compressed complete reachability','seed':1036,'status':'passed'}
(OUT/'numerical.json').write_text(json.dumps(report,indent=2)+'\n');print(report)
