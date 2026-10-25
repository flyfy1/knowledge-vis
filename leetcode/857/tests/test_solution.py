import importlib.util, itertools, json, math, os, random, sys
from fractions import Fraction
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
sys.dont_write_bytecode=True
spec=importlib.util.spec_from_file_location('solution857',ROOT/'solution.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
spec=importlib.util.spec_from_file_location('baseline857',ROOT/'tests/baseline.py');b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
def oracle(q,w,k):
    return min(max(Fraction(w[i],q[i]) for i in s)*sum(q[i] for i in s) for s in itertools.combinations(range(len(q)),k))
count=0
fixtures=[]
def check(q,w,k):
    global count
    before=(q[:],w[:]);e=float(oracle(q,w,k));a=m.Solution().mincostToHireWorkers(q,w,k)
    assert math.isclose(a,e,rel_tol=1e-12,abs_tol=1e-7),(q,w,k,a,e)
    assert math.isclose(b.baseline(q,w,k),e,rel_tol=1e-12,abs_tol=1e-7)
    assert before==(q,w)
    count+=1
for n in range(1,5):
    for pairs in itertools.product(list(itertools.product(range(1,4),repeat=2)),repeat=n):
        q=[p[0] for p in pairs];w=[p[1] for p in pairs]
        for k in range(1,n+1):check(q,w,k)
rng=random.Random(857)
for _ in range(600):
    n=rng.randint(1,8);q=[rng.randint(1,10000) for _ in range(n)];w=[rng.randint(1,10000) for _ in range(n)];k=rng.randint(1,n);check(q,w,k)
    if len(fixtures)<100:fixtures.append({'q':q,'w':w,'k':k,'expected':float(oracle(q,w,k))})
for q,w,k,expected in [([10,20,5],[70,50,30],2,105),([3,1,10,10,1],[4,8,2,2,7],3,92/3),([1,2,10],[1,4,30],2,6)]:
    check(q,w,k);assert abs(m.Solution().mincostToHireWorkers(q,w,k)-expected)<1e-7
for k in [1,5000,10000]:assert m.Solution().mincostToHireWorkers([10000]*10000,[10000]*10000,k)==10000*k
q=list(range(1,10001));w=[10000]*10000
assert math.isclose(m.Solution().mincostToHireWorkers(q,w,1),10000,abs_tol=1e-7)
assert math.isclose(m.Solution().mincostToHireWorkers(q,w,10000),500050000000,rel_tol=1e-12)
(OUT/'oracle-fixtures.json').write_text(json.dumps(fixtures))
(OUT/'python-results.json').write_text(json.dumps({'authorSelfCheck':True,'exactFractionOracleCases':count,'maxN':10000,'largeChecks':5,'inputMutation':False},indent=2))
print('PASS',count,'exact Fraction cases and 5 maximum-n checks')
