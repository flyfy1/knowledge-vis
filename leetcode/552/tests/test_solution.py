"""Run: python3 -B leetcode/552/tests/test_solution.py (OUTPUT_DIR optional)."""
import importlib.util,itertools,json,os,random,sys
from pathlib import Path
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('submission',ROOT/'solution.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
solve=m.Solution().checkRecord
MOD=10**9+7

def enumerate_buckets(n):
    buckets=[0]*6
    for chars in itertools.product('ALP',repeat=n):
        s=''.join(chars)
        if s.count('A')>1 or 'LLL' in s:continue
        a=s.count('A');l=len(s)-len(s.rstrip('L'))
        buckets[3*a+l]+=1
    return buckets

def split_oracle(n):
    # No A: every P/L record ends with P, PL, or PLL, except bases.
    # One A: unique A splits two independent no-A records.
    f=[1,2,4]
    for k in range(3,n+1):f.append(sum(f[k-3:k])%MOD)
    return (f[n]+sum(f[i]*f[n-1-i] for i in range(n)))%MOD

small={str(n):enumerate_buckets(n) for n in range(11)}
for n,b in small.items():assert solve(int(n))==sum(b)%MOD==split_oracle(int(n)),(n,b)
assert solve(1)==3 and solve(2)==8 and solve(10101)==183236316
rng=random.Random(552);cases=[rng.randint(1,6000) for _ in range(60)]+[99999,100000,10101]
for n in cases:assert solve(n)==split_oracle(n),n
# Fresh transfer question is verified by direct suffix enumeration.
suffixes=[''.join(x) for x in itertools.product('PAL',repeat=2) if ('PLL'+''.join(x)).count('A')<2 and 'LLL' not in 'PLL'+''.join(x)]
assert sorted(suffixes)==sorted(['PP','PL','PA','AP','AL'])
(OUT/'oracle-buckets.json').write_text(json.dumps(small,indent=2)+'\n')
result={'kind':'author numerical self-check','exhaustiveLengths':list(range(11)),'seed':552,'seededCases':60,'largeCases':{str(n):solve(n) for n in [10101,99999,100000]},'transferSuffixes':suffixes,'result':'PASS'}
(OUT/'numerical-results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
