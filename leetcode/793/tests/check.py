import ast, collections, datetime, importlib.util, json, math, os, pathlib, random, subprocess, sys
P=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('OUTPUT_DIR',P/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution793',P/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
solve=mod.Solution().preimageSizeFZF
# Oracle 1: literal factorial and trailing decimal zeroes, without Legendre's formula.
freq=collections.Counter()
for x in range(801):
    text=str(math.factorial(x));freq[len(text)-len(text.rstrip('0'))]+=1
for k in range(150):assert solve(k)==freq[k],(k,solve(k),freq[k])
# Oracle 2: accumulate the contribution of each individual new integer factor.
freq=collections.Counter();z=0
for x in range(25006):
    y=x
    if y:
        while y%5==0:z+=1;y//=5
    freq[z]+=1
for k in range(5001):assert solve(k)==freq[k],k
# Oracle 3: greedy base-five block weights: q+f(q) has weights 1,6,31,...
# for digits of q. Each next weight is five times the previous plus one;
# a greedy digit 5 means the requested output falls inside a skipped gap.
def greedy(k):
    weights=[1]
    while weights[-1]<=k:weights.append(5*weights[-1]+1)
    for w in reversed(weights):
        digit,k=divmod(k,w)
        if digit>=5:return 0
    return 5
rng=random.Random(793)
ks=[0,3,5,6,24,29,30,31,10**9,10**9-1]+[rng.randrange(10**9+1) for _ in range(3000)]
for k in range(5001):assert greedy(k)==freq[k]
for k in ks:assert solve(k)==greedy(k),k
source=(P/'solution.py').read_text()
mirror=(P/'python-code.js').read_text();assert mirror=='window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
def unique(pairs):
    d={}
    for k,v in pairs:
        assert k not in d,('duplicate key',k)
        d[k]=v
    return d
copy=json.loads((P/'copy.js').read_text().removeprefix('window.LESSON_COPY = ').removesuffix(';\n'),object_pairs_hook=unique)
assert all(isinstance(v,list) and len(v)==2 and all(isinstance(s,str) and s for s in v) for v in copy.values())
# Check the actual displayed baseline, independently from canonical helper calls.
import re,html
base=html.unescape(re.search(r'<code>(def baseline.*?)</code>',(P/'index.html').read_text(),re.S).group(1));ns={};exec(base,ns)
for k in range(151):assert ns['baseline'](k)==freq[k]
fixture={'cases':[[k,greedy(k)] for k in ks], 'small':[[k,freq[k]] for k in range(5001)]}
(OUT/'oracle-fixtures.json').write_text(json.dumps(fixture))
r=subprocess.run(['node',str(P/'tests/core.cjs'),str(OUT/'oracle-fixtures.json')],capture_output=True,text=True,check=True)
report={'kind':'author self-check','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'python':{'factorialOracle':150,'accumulatedFactorOracle':5001,'largeSeededAndBoundaryOracle':len(ks),'displayedBaseline':151,'maxConstraintResult':solve(10**9)},'core':json.loads(r.stdout),'sourceMirror':'exact including newline','copy':'unique keys; every value two nonempty strings','notes':'No LeetCode submission or independent reviewer. Unit-cost integer cells complexity; no timing claim.'}
(OUT/'numerical.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
