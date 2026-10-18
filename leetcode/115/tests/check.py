"""Run with python3 leetcode/115/tests/check.py; OUTPUT_DIR redirects evidence."""
import importlib.util,itertools,math,json,os,random,pathlib,functools,sys
sys.dont_write_bytecode=True
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',ROOT/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
solve=mod.Solution().numDistinct

def oracle(s,t):
    return sum(''.join(s[i] for i in ix)==t for ix in itertools.combinations(range(len(s)),len(t)))

def recursive(s,t):
    @functools.lru_cache(None)
    def visit(i,j):
        if j==len(t):return 1
        if i==len(s):return 0
        return visit(i+1,j)+(visit(i+1,j+1) if s[i]==t[j] else 0)
    return visit(0,0)
count=0
words=[''.join(x) for k in range(7) for x in itertools.product('ab',repeat=k)]
for s in words:
    for t in words:
        assert solve(s,t)==oracle(s,t),(s,t)
        count+=1
rng=random.Random(115)
for _ in range(500):
    s=''.join(rng.choices('abAB',k=rng.randrange(19)))
    t=''.join(rng.choices('abAB',k=rng.randrange(12)))
    assert solve(s,t)==recursive(s,t),(s,t)
for s,t,v in [('rabbbit','rabbit',3),('babgbag','bag',5),('ababa','aba',4),('a'*1000,'a'*1000,1),('a'*1000,'a',1000),('a'*1000,'b'*1000,0),('a'*1000,'a'*500+'b',0),('a'*33,'a'*16,math.comb(33,16)),('','',1),('','a',0),('abc','',1)]:
    assert solve(s,t)==v
mirror=(ROOT/'python-code.js').read_text();assert mirror=='window.PYTHON_SOURCE = '+json.dumps((ROOT/'solution.py').read_text())+';\n'
report={'exhaustivePairs':count,'seededCases':500,'officialAndBoundaryCases':11,'sourceMirror':'exact','status':'passed','scope':'Author computational self-check, not independent review'}
(OUT/'python-results.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
