"""Author self-check: actual official Python callable vs independent linear oracle."""
import importlib.util,itertools,json,os,random,sys
from pathlib import Path
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('canonical',ROOT/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
class MountainArray:
    def __init__(self,a): self.__a=tuple(a);self.calls=[];self.length_calls=0
    def length(self): self.length_calls+=1;return len(self.__a)
    def get(self,i):
        assert type(i) is int and 0<=i<len(self.__a)
        self.calls.append(i);assert len(self.calls)<=100
        return self.__a[i]
def oracle(a,t): return next((i for i,x in enumerate(a) if x==t),-1)
count=0;worst=0

def check(a,t):
    global count,worst
    before=a[:];m=MountainArray(a);got=mod.Solution().findInMountainArray(t,m)
    assert got==oracle(a,t),(a,t,got)
    assert a==before and m.length_calls==1
    assert len(m.calls)<=56
    worst=max(worst,len(m.calls));count+=1
# Enumerate every strict mountain with peak <=6 and both sides chosen from smaller values.
exhaustive=0
for peak in range(1,7):
    subsets=[list(c) for n in range(1,peak+1) for c in itertools.combinations(range(peak),n)]
    for left in subsets:
        for right in subsets:
            a=left+[peak]+right[::-1]
            for target in range(8):check(a,target);exhaustive+=1
for a,t in [([1,2,3,4,5,3,1],3),([0,1,2,4,2,1],3),([0,10**9,0],0),([0,10**9,0],10**9),([0,10**9,0],1)]:check(a,t)
rng=random.Random(1095)
for _ in range(600):
    n=rng.randint(3,300);p=rng.randint(1,n-2)
    a=sorted(rng.sample(range(10**6),p))+[10**9]+sorted(rng.sample(range(10**6),n-p-1),reverse=True)
    check(a,rng.choice(a+[10**9-1,10**9]))
max_cases=[]
for p in [1,2,4999,5000,9997,9998]:
    n=10000;a=list(range(p))+[10**9]+list(range(n-p-1))[::-1]
    for t in [0,a[-1],a[0],10**9,10**9-1,500,9999]:
        check(a,t);max_cases.append({'n':n,'peak':p,'target':t,'expected':oracle(a,t)})
result={'passed':True,'scope':'author self-check, not independent acceptance','cases':count,'exhaustive':exhaustive,'seeded':600,'maximumCases':max_cases,'maxObservedGetCalls':worst,'provenBound':56}
(OUT/'python-results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='maximumCases'}))
