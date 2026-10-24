"""Run from any cwd. EVIDENCE_DIR redirects every generated artifact."""
import importlib.util, itertools, json, os, random, pathlib, sys
sys.dont_write_bytecode = True
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = pathlib.Path(os.environ.get('EVIDENCE_DIR', ROOT/'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('solution', ROOT/'solution.py')
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
solve = mod.Solution().splitArray

def enumerate_cuts(a, k):
    best = sum(a)
    for cuts in itertools.combinations(range(1,len(a)),k-1):
        ends=(0,)+cuts+(len(a),)
        best=min(best,max(sum(a[l:r]) for l,r in zip(ends,ends[1:])))
    return best

def dp_oracle(a,k):
    # Independently minimize the worst prefix group over every last-cut position.
    n=len(a); prefix=[0]
    for x in a: prefix.append(prefix[-1]+x)
    dp=[0]+[float('inf')]*n
    for count in range(1,k+1):
        row=[float('inf')]*(n+1)
        for end in range(count,n+1):
            row[end]=min(max(dp[cut],prefix[end]-prefix[cut]) for cut in range(count-1,end))
        dp=row
    return dp[n]

cases=[]
for n in range(1,7):
    for a in itertools.product(range(3),repeat=n):
        for k in range(1,n+1):cases.append((list(a),k,enumerate_cuts(a,k)))
rng=random.Random(410)
for _ in range(350):
    a=[rng.randrange(50) for _ in range(rng.randrange(1,24))];k=rng.randrange(1,min(10,len(a))+1)
    expected=dp_oracle(a,k)
    if len(a)<=9:assert expected==enumerate_cuts(a,k)
    cases.append((a,k,expected))
cases += [([7,2,5,10,8],2,18),([1,2,3,4,5],2,9),([0]*1000,50,0),([10**6]*1000,50,20_000_000),([10**6]*1000,1,10**9),([1]*1000,50,20),([0,10**6,0],3,10**6)]
for a,k,expected in cases:
    original=a.copy();assert solve(a,k)==expected,(a,k,expected);assert a==original
# Share independently computed expected values, not canonical results, with JS checks.
(OUT/'oracle-cases.json').write_text(json.dumps(cases))
source=(ROOT/'solution.py').read_text();mirror=(ROOT/'python-code.js').read_text()
assert json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').strip().removesuffix(';'))==source
# Duplicate localization keys are checked before JS object evaluation can overwrite them.
import re
copy=(ROOT/'copy.js').read_text();keys=re.findall(r'^\s*(\w+)\s*:',copy,re.M)
# Include keys on a shared line as well.
keys=re.findall(r'(?:^|[,\n])\s*(\w+)\s*:\s*\[',copy,re.M)
assert len(keys)==len(set(keys))
result={'canonical_cases':len(cases),'oracles':'exhaustive cut enumeration and last-cut dynamic programming','seed':410,'source_mirror_exact':True,'copy_unique_keys':len(keys)}
(OUT/'python-results.json').write_text(json.dumps(result,indent=2));print(result)
