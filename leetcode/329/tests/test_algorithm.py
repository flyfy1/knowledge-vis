"""Author checks. Run from any directory; OUTPUT_DIR redirects all artifacts."""
import copy, importlib.util, itertools, json, os, random, subprocess
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('submission', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
solve = module.Solution().longestIncreasingPath
# Independent uncached enumeration of every increasing route from every start.
def oracle(a):
    m,n=len(a),len(a[0])
    def visit(r,c):
        routes=[1]
        for x,y in ((r-1,c),(r+1,c),(r,c-1),(r,c+1)):
            if 0<=x<m and 0<=y<n and a[x][y]>a[r][c]:
                routes.append(1+visit(x,y))
        return max(routes)
    return [[visit(r,c) for c in range(n)] for r in range(m)]
cases=[[[9,9,4],[6,6,8],[2,1,1]],[[3,4,5],[3,2,6],[2,2,1]],[[1]],[[0,2147483647]],[[1,2,7],[6,3,4]]]
assert [solve(a) for a in cases[:3]] == [4,4,1]
for m,n in ((1,1),(1,3),(2,2),(2,3)):
    for values in itertools.product(range(3),repeat=m*n):
        cases.append([list(values[r*n:(r+1)*n]) for r in range(m)])
rng=random.Random(329)
for _ in range(250):
    m,n=rng.randint(1,4),rng.randint(1,4)
    cases.append([[rng.randrange(8) for _ in range(n)] for _ in range(m)])
js="const fs=require('fs'),core=require(process.argv[1]); const a=JSON.parse(fs.readFileSync(0,'utf8'));process.stdout.write(JSON.stringify(a.map(core.trace)));"
result=subprocess.run(['node','-e',js,str(ROOT/'core.js')],input=json.dumps(cases),text=True,capture_output=True,check=True)
traces=json.loads(result.stdout)
frames_checked=0
for a,frames in zip(cases,traces):
    expected=oracle(a); before=copy.deepcopy(a)
    assert solve(a)==max(map(max,expected))
    assert a==before
    assert len(frames)-1==max(map(max,expected))
    for k,f in enumerate(frames):
        frames_checked+=1
        assert f['round']==k and len(f['history'])==k
        ready=[]
        for r,row in enumerate(a):
            for c,v in enumerate(row):
                L=f['lengths'][r][c]
                assert L==(expected[r][c] if expected[r][c]<=k else 0)
                if not L:
                    remaining=sum(0<=x<len(a) and 0<=y<len(row) and a[x][y]>v and f['lengths'][x][y]==0 for x,y in ((r-1,c),(r+1,c),(r,c-1),(r,c+1)))
                    assert f['out'][r][c]==remaining
                    if remaining==0:ready.append([r,c])
        assert sorted(ready)==sorted(f['ready'])
        for h in f['history']:
            for d in h['changes']:
                r,c=d['from'];x,y=d['to']
                assert abs(r-x)+abs(c-y)==1 and a[r][c]>a[x][y]
                assert d['after']==d['before']-1 and d['after']>=0
# Max-size, exact closed forms. 40,000-cell path without recursion.
snake=[list(range(r*200,(r+1)*200))[::1 if r%2==0 else -1] for r in range(200)]
assert solve(snake)==40000
assert solve([[2147483647]*200 for _ in range(200)])==1
assert solve([list(range(200))])==200
assert solve([[200-r] for r in range(200)])==200
source=(ROOT/'solution.py').read_text()
mirror=(ROOT/'python-code.js').read_text()
assert json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').strip().removesuffix(';'))==source
report={'kind':'author self-check','small_cases':len(cases),'intermediate_frames':frames_checked,'max_size':'200x200 snake=40000; equal=1','source_parity':True,'seed':329}
(OUT/'algorithm.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
