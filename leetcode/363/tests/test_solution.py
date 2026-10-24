import importlib.util,itertools,json,os,random,time
from pathlib import Path
P=Path(__file__).resolve().parents[1]
out=Path(os.environ.get('OUTPUT_DIR',P/'tests/evidence'));out.mkdir(parents=True,exist_ok=True)
s=importlib.util.spec_from_file_location('solution',P/'solution.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
def oracle(grid,k):
    rows,cols=len(grid),len(grid[0]);best=None
    for t in range(rows):
        for b in range(t,rows):
            for l in range(cols):
                for r in range(l,cols):
                    v=sum(grid[i][j] for i in range(t,b+1) for j in range(l,r+1))
                    if v<=k:best=v if best is None else max(best,v)
    return best
cases=0;fixtures=[]
def check(grid,k):
    global cases
    expected=oracle(grid,k)
    if expected is None:return
    old=[row[:] for row in grid]
    actual=m.Solution().maxSumSubmatrix(grid,k)
    assert actual==expected,(grid,k,actual,expected)
    assert grid==old
    cases+=1
    fixtures.append({'matrix':grid,'k':k,'answer':expected})
for rows,cols in [(1,1),(1,3),(3,1),(2,2)]:
    for values in itertools.product([-2,0,2],repeat=rows*cols):
        grid=[list(values[r*cols:(r+1)*cols]) for r in range(rows)]
        for k in range(-5,6):check(grid,k)
rng=random.Random(363)
for _ in range(500):
    rows,cols=rng.randint(1,5),rng.randint(1,5)
    check([[rng.randint(-8,8) for _ in range(cols)] for _ in range(rows)],rng.randint(-15,15))
check([[1,0,1],[0,-2,3]],2);check([[2,2,-1]],3)
large=[]
for grid,k,expected in [([[100]*100 for _ in range(100)],99999,99900),([[-1]*100 for _ in range(100)],-10000,-10000),([[0]*100 for _ in range(100)],0,0),([[100] for _ in range(100)],9999,9900),([[-100]*100 for _ in range(100)],-100000,-100000)]:
    start=time.monotonic();assert m.Solution().maxSumSubmatrix(grid,k)==expected
    large.append({'shape':[len(grid),len(grid[0])],'k':k,'expected':expected,'seconds':time.monotonic()-start})
source=(P/'solution.py').read_text();mirror=(P/'python-code.js').read_text();assert json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').strip().removesuffix(';'))==source
(out/'fixtures.json').write_text(json.dumps(fixtures))
(out/'solution-results.json').write_text(json.dumps({'small_oracle_cases':cases,'large':large,'source_parity':True},indent=2))
print(cases,'oracle cases; maximum-boundary tests passed')
