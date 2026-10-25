import importlib.util,itertools,json,os,random,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
out=Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));out.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',ROOT/'solution.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
solve=module.Solution().countPalindromicSubsequences
MOD=10**9+7

def oracle(s):
    words={''.join(s[i] for i in range(len(s)) if m>>i&1) for m in range(1,1<<len(s))}
    return {w for w in words if w==w[::-1]}

def different_recurrence(s):
    # Endpoint inclusion-exclusion, independent of outer-letter partitioning.
    n=len(s);d=[[0]*n for _ in range(n)]
    for i in range(n):d[i][i]=1
    for size in range(2,n+1):
        for i in range(n-size+1):
            j=i+size-1;mid=d[i+1][j-1] if size>2 else 0
            if s[i]!=s[j]:v=d[i+1][j]+d[i][j-1]-mid
            else:
                l=i+1;r=j-1
                while l<=r and s[l]!=s[i]:l+=1
                while l<=r and s[r]!=s[i]:r-=1
                if l>r:v=2*mid+2
                elif l==r:v=2*mid+1
                else:v=2*mid-(d[l+1][r-1] if l+1<=r-1 else 0)
            d[i][j]=v%MOD
    return d[0][-1]

start=time.time();count=0
for n in range(1,9):
    for chars in itertools.product('ab',repeat=n):
        s=''.join(chars);assert solve(s)==len(oracle(s)),s;count+=1
for n in range(1,6):
    for chars in itertools.product('abcd',repeat=n):
        s=''.join(chars);assert solve(s)==len(oracle(s)),s;count+=1
rng=random.Random(730)
for _ in range(180):
    s=''.join(rng.choice('abcd') for _ in range(rng.randint(1,13)))
    assert solve(s)==len(oracle(s)),s;count+=1
question=json.loads((ROOT/'provenance/official.json').read_text())['response']['data']['question']
assert any(c['langSlug']=='python3' and 'def countPalindromicSubsequences(self, s: str) -> int:' in c['code'] for c in question['codeSnippets'])
examples=[json.loads(x) for x in question['exampleTestcases'].splitlines()]
assert [solve(x) for x in examples]==[6,104860361]
large=[]
for s in ['a'*1000,'abcd'*250,''.join(rng.choice('abcd') for _ in range(1000))]:
    actual=solve(s);expected=different_recurrence(s);assert actual==expected
    if len(set(s))==1:assert actual==1000
    large.append({'length':len(s),'prefix':s[:16],'actual':actual,'independent':expected})
source=(ROOT/'solution.py').read_text();mirror=(ROOT/'python-code.js').read_text();assert mirror=='window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
report={'kind':'author self-check','oracle_cases':count,'official_examples':[6,104860361],'max_cases':large,'source_parity':True,'elapsed_seconds':round(time.time()-start,3)}
(out/'python-results.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
