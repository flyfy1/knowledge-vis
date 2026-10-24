"""Independent position-subset oracle; run from any directory, no candidate writes.
OUTPUT_DIR overrides report location. No browser simulation is used as an oracle.
"""
import ast, importlib.util, itertools, json, os, random, sys, time
from pathlib import Path
P=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',P/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('canonical446',P/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
solve=mod.Solution().numberOfArithmeticSlices

def sequences(a):
    for length in range(2,len(a)+1):
        for ids in itertools.combinations(range(len(a)),length):
            gaps=[a[y]-a[x] for x,y in zip(ids,ids[1:])]
            if len(set(gaps))==1:yield ids,gaps[0]
def oracle(a):return sum(len(ids)>=3 for ids,d in sequences(a))
def expected_frames(a):
    valid=list(sequences(a));dp=[{} for _ in a];ans=0
    frames=[{'dp':[dict(x) for x in dp],'answer':0}]
    for i in range(len(a)):
        for j in range(i):
            # Independently group complete index subsets by their last two positions.
            group=[(ids,d) for ids,d in valid if ids[-2:]==(j,i)]
            for ids,d in group:
                dp[i][str(d)]=dp[i].get(str(d),0)+1
                ans+=len(ids)>=3
            frames.append({'dp':[dict(x) for x in dp],'answer':ans})
    return frames

def actual_frames(a):
    frames=[{'dp':[{} for _ in a],'answer':0}];previous=None
    def tracer(frame,event,arg):
        nonlocal previous
        if frame.f_code is solve.__func__.__code__:
            if event in ('line','return'):
                if previous==10:
                    loc=frame.f_locals;frames.append({'dp':[{str(k):v for k,v in x.items()} for x in loc['dp']],'answer':loc['answer']})
                previous=frame.f_lineno if event=='line' else None
            return tracer
        return None
    sys.settrace(tracer)
    try:solve(a)
    finally:sys.settrace(None)
    return frames

count=0;intermediate=0;fixtures=[]
for n in range(1,8):
    for values in itertools.product((-1,0,1),repeat=n):
        a=list(values);before=a[:];got=solve(a);want=oracle(a)
        assert got==want,(a,got,want)
        assert a==before
        count+=1
        if n<=5:
            expected=expected_frames(a)
            assert actual_frames(a)==expected,a
            fixtures.append({'nums':a,'frames':expected});intermediate+=len(expected)-1
rng=random.Random(446)
for _ in range(350):
    a=[rng.choice([-2**31,2**31-1,-9,-3,0,2,4,7,12]) for _ in range(rng.randint(1,11))]
    assert solve(a)==oracle(a);count+=1
for a,want in [([2,4,6,8,10],7),([7]*5,16),([7]*31,2**31-1-31-465),([2,9,4,6],1),([-2**31,0,2**31-1],0),([2**31-1,-1,-2**31],0),([3,1,-1,-3],3)]:
    assert solve(a)==want,(a,want);count+=1
# Strictly increasing powers of two have no three-term arithmetic subsequence;
# Derive independent expectation for range(1000): choose length L and gap d;
# number of starts = n-(L-1)*d. Each arithmetic index subset has unique (start,d,L).
n=1000
want=sum(n-(length-1)*d for length in range(3,n+1) for d in range(1,(n-1)//(length-1)+1))
start=time.perf_counter();assert solve(list(range(n)))==want;elapsed=time.perf_counter()-start
assert want<=2**31-1
count+=1
# Sparse powers of two: independently no x+z=2y, with max signed value respected.
assert solve([2**i for i in range(31)])==0;count+=1
raw=(P/'python-code.js').read_text();prefix='window.PYTHON_SOURCE = '
assert raw.startswith(prefix) and json.loads(raw[len(prefix):].strip().removesuffix(';'))==(P/'solution.py').read_text()
# Decode the JSON-form source with an object-pairs hook before duplicate keys disappear.
def unique_pairs(pairs):
    result={}
    for k,v in pairs:
        assert k not in result, 'Duplicate localization key: '+k
        result[k]=v
    return result
copy=json.loads((P/'copy.js').read_text().removeprefix('window.LESSON_COPY = ').strip().removesuffix(';'),object_pairs_hook=unique_pairs)
assert all(len(v)==2 and all(isinstance(x,str) and x for x in v) for v in copy.values())
# Emit independent fixture states for the Node/browser-core check.
(OUT/'oracle-fixtures.json').write_text(json.dumps(fixtures))
report={'kind':'author self-check, not independent review','canonicalCases':count,'canonicalIntermediateUpdates':intermediate,'exhaustive':'all arrays over {-1,0,1}, lengths 1..7','seed':446,'randomCases':350,'maxLength':1000,'maxExpected':want,'maxSeconds':elapsed,'sourceParity':True,'duplicateLocalizationKeys':False}
(OUT/'python-results.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
