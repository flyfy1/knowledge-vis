"""Run from repository root; OUTPUT_DIR redirects all generated evidence."""
import os,json,random,bisect,importlib.util
from pathlib import Path
root=Path(__file__).resolve().parents[1]
out=Path(os.environ.get('OUTPUT_DIR',root/'tests/evidence'));out.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('submission',root/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
solve=mod.Solution().nearestPalindromic

def outward(x):
    r=1
    while True:
        for y in (x-r,x+r):
            if y>=0 and str(y)==str(y)[::-1]: return y
        r+=1

def oracle(x):
    # Independently binary-search the entire ordered palindrome domain at each length.
    near={0}
    for length in range(1,20):
        h=(length+1)//2
        def value(rank):
            digits=list(str(rank));result=digits+list(reversed(digits[:length//2]))
            return int(''.join(result))
        first=10**(h-1) if length>1 else 0
        end=10**h
        lo,hi=first,end
        while lo<hi:
            mid=(lo+hi)//2
            if value(mid)<x: lo=mid+1
            else: hi=mid
        for rank in (lo-1,lo,lo+1):
            if first<=rank<end: near.add(value(rank))
    return min((v for v in near if v!=x),key=lambda v:(abs(v-x),v))

cases={x:outward(x) for x in range(1,20001)}
palindromes=[v for v in range(100001) if str(v)==str(v)[::-1]]
for x,y in cases.items():
    i=bisect.bisect_left(palindromes,x)
    neighbors=[v for v in palindromes[max(0,i-1):i+2] if v!=x]
    assert min(neighbors,key=lambda v:(abs(v-x),v))==y
    assert oracle(x)==y
rng=random.Random(564)
for _ in range(1500):
    x=rng.randrange(1,10**18);cases[x]=oracle(x)
for digits in range(1,19):
    for x in (10**(digits-1),10**digits-1,10**digits-2,10**(digits-1)+1):
        if 1<=x<10**18:cases[x]=oracle(x)
for x in [123,1,1000,121,129,1234,100000000500000000]:cases[x]=oracle(x)
assert cases[100000000500000000]==100000000000000001
for x,y in cases.items():assert solve(str(x))==str(y),(x,y,solve(str(x)))
(out/'oracle-cases.json').write_text(json.dumps({str(x):str(y) for x,y in cases.items()}))
(out/'numeric-results.json').write_text(json.dumps({'kind':'author self-check','result':'PASS','cases':len(cases),'smallOutward':20000,'seed':564,'largeOracle':'binary search of all palindrome lengths 1..19','officialExamples':{'123':'121','1':'0'}} ,indent=2))
print('PASS Python:',len(cases),'independent expected values')
