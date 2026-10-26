"""Canonical execution, independent repeated-digit DP and scanning oracles."""
import importlib.util,json,os,random,subprocess,sys
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('canonical1012',ROOT/'solution.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def repeated_dp(n):
    ds=tuple(map(int,str(n)))
    @lru_cache(None)
    def walk(pos,mask,repeated,tight,started):
        if pos==len(ds):return int(started and repeated)
        total=0
        for d in range((ds[pos] if tight else 9)+1):
            nt=tight and d==ds[pos]
            if not started and d==0:total+=walk(pos+1,0,False,nt,False)
            else:total+=walk(pos+1,mask|(1<<d),repeated or bool(mask&(1<<d)),nt,True)
        return total
    return walk(0,0,False,True,False)
def repeat(x):return len(set(str(x)))<len(str(x))
checks=0
running=0
fixtures=[]
for n in range(1,5001):
    running+=repeat(n)
    assert m.Solution().numDupDigitsAtMostN(n)==running,(n,running)
    if n%37==0:fixtures.append({'n':n,'expected':running})
    checks+=1
rng=random.Random(1012)
for n in [20,100,1000,1,9,10,11,99,101,110,121,133,321,999,987654321,10**9]+[rng.randint(1,10**9) for _ in range(200)]:
    expected=repeated_dp(n)
    assert m.Solution().numDupDigitsAtMostN(n)==expected,(n,expected)
    fixtures.append({'n':n,'expected':expected});checks+=1
assert repeated_dp(20)==1 and repeated_dp(100)==10 and repeated_dp(1000)==262
# Instrument the canonical loop after smaller candidates and before the equal check.
invariants=0
def trace(frame,event,arg):
    global invariants
    if frame.f_code.co_name=='numDupDigitsAtMostN' and event=='line' and frame.f_lineno==21:
        d=frame.f_locals;n=d['n'];i=d['i'];s=str(n)
        expected=sum(not repeat(x) and (len(str(x))<len(s) or str(x)[:i+1]<s[:i+1]) for x in range(1,n+1))
        assert d['unique']==expected,(n,i,d['unique'],expected)
        assert d['used']==set(map(int,s[:i]))
        invariants+=1
    return trace
sys.settrace(trace)
for n in [1,10,20,100,121,133,321,543]:m.Solution().numDupDigitsAtMostN(n)
sys.settrace(None)
core=subprocess.run(['node',str(ROOT/'tests/test_core.cjs')],input=json.dumps(fixtures),text=True,capture_output=True)
if core.returncode:
    print(core.stderr)
    raise SystemExit(core.returncode)
result={'kind':'author computational self-check','canonicalCases':checks,'canonicalIntermediateInvariants':invariants,'seed':1012,'core':json.loads(core.stdout)}
(OUT/'numeric-results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
