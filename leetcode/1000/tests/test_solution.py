import sys,os,json,itertools,random,importlib.util
from pathlib import Path
from functools import lru_cache
R=Path(__file__).resolve().parents[1];O=Path(os.environ.get('EVIDENCE_DIR',R/'tests/evidence'));O.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',R/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
@lru_cache(None)
def oracle(a,k,p=1):
    if len(a)==p:return 0
    if len(a)<p:return float('inf')
    best=float('inf')
    for i in range(len(a)-k+1):
        cost=sum(a[i:i+k]);best=min(best,cost+oracle(a[:i]+(cost,)+a[i+k:],k,p))
    return best
count=0;intermediate=0;fixtures=[]
def check(a,k,inspect=False):
    global count,intermediate
    original=list(a);captured={}
    def tracer(frame,event,arg):
        if frame.f_code.co_name=='mergeStones' and event=='return':captured.update(frame.f_locals)
        return tracer
    if inspect:sys.settrace(tracer)
    got=mod.Solution().mergeStones(original,k)
    if inspect:sys.settrace(None)
    expected=oracle(tuple(a),k);expected=-1 if expected==float('inf') else expected
    assert got==expected,(a,k,got,expected);assert original==list(a);count+=1
    if inspect and 'dp' in captured:
        dp=captured['dp']
        for i in range(len(a)):
            for j in range(i,len(a)):
                for p in range(1,k+1):
                    assert dp[i][j][p]==oracle(tuple(a[i:j+1]),k,p),(a,k,i,j,p,dp[i][j][p]);intermediate+=1
    if inspect:
        rows=[]
        for i in range(len(a)):
            for j in range(i,len(a)):
                for p in range(1,min(k,j-i+1)+1):
                    v=oracle(tuple(a[i:j+1]),k,p)
                    if v!=float('inf'):rows.append([i,j,p,v])
        fixtures.append({'a':list(a),'k':k,'result':expected,'rows':rows})
for n in range(1,7):
    for a in itertools.product(range(1,4),repeat=n):
        for k in range(2,6):check(a,k,n<=4)
rng=random.Random(1000)
for _ in range(500):check([rng.randint(1,100) for _ in range(rng.randint(1,8))],rng.randint(2,8),True)
for a,k,expected in [([3,2,4,1],2,20),([3,2,4,1],3,-1),([3,5,1,2,6],3,25),([6,4,4,6],2,40),([2,1,4,3,2],3,19),([100]*30,30,3000),([100]*30,29,-1),([100],30,0)]:
    assert mod.Solution().mergeStones(a,k)==expected
# Equal-weight binary merges are minimized by balanced leaf depths.
assert mod.Solution().mergeStones([100]*30,2)==14800
# Source mirrors and duplicate keys before JSON parsing.
source=(R/'solution.py').read_text();mirror=(R/'python-code.js').read_text();assert mirror=='window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
def unique(pairs):
    d={}
    for k,v in pairs:
        assert k not in d,k;d[k]=v
    return d
copy=json.loads((R/'copy.js').read_text().removeprefix('window.COPY = ').removesuffix(';\n'),object_pairs_hook=unique)
assert all(isinstance(v,list) and len(v)==2 and all(isinstance(s,str) and s for s in v) for v in copy.values())
(O/'oracle-fixtures.json').write_text(json.dumps(fixtures)+'\n')
report={'kind':'author computational self-check','exhaustiveAndSeededCalls':count,'intermediateCanonicalCells':intermediate,'fixtures':len(fixtures),'officialFreshAndMaxCases':9,'sourceParity':True,'copyKeysUnique':len(copy)}
(O/'numerical.json').write_text(json.dumps(report,indent=2)+'\n');print(report)
