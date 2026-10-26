import importlib.util,itertools,json,os,random,subprocess
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',ROOT/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
solve=mod.Solution().atMostNGivenDigitSet

def baseline(ds,n):
    a=set(ds)
    return sum(set(str(x))<=a for x in range(1,n+1))

# Independent recursive decimal DP, allowing leading unstarted zero positions.
# It enumerates state transitions rather than using first-difference block powers.
def oracle(ds,n):
    s=str(n);allowed=set(ds)
    @lru_cache(None)
    def visit(i,tight,started):
        if i==len(s):return int(started)
        limit=int(s[i]) if tight else 9
        total=0
        for v in range(limit+1):
            nt=tight and v==limit
            if v==0 and not started:total+=visit(i+1,nt,False)
            elif str(v) in allowed:total+=visit(i+1,nt,True)
        return total
    return visit(0,True,False)

cases=[]
for size in range(1,6):
    for ds in itertools.combinations('12357',size):
        for n in range(1,151):cases.append((list(ds),n))
rng=random.Random(902)
cases += [(sorted(rng.sample(list('123456789'),rng.randint(1,9))),rng.randint(1,4000)) for _ in range(350)]
for ds,n in cases:
    before=ds[:];a=solve(ds,n);b=baseline(ds,n)
    assert a==b==oracle(ds,n),(ds,n,a,b)
    assert ds==before
large=[(['1','3','5','7'],100,20),(['1','4','9'],10**9,29523),(['7'],8,1),(['1','3'],31,5),(['1','3'],30,4),(['9'],1,0),(['2','5','8'],526,23),(list('123456789'),10**9,435848049)]
for ds,n,want in large:assert solve(ds,n)==oracle(ds,n)==want
for _ in range(700):
    ds=sorted(rng.sample(list('123456789'),rng.randint(1,9)));n=rng.randint(1,10**9)
    assert solve(ds,n)==oracle(ds,n)
    cases.append((ds,n))
# Inspect every intermediate JS contribution against independently classified integers.
small=cases[:4650:13]+[(a,b) for a,b,_ in large if b<1000]
js="const core=require(process.argv[1]);let b='';process.stdin.on('data',x=>b+=x);process.stdin.on('end',()=>process.stdout.write(JSON.stringify(JSON.parse(b).map(([digits,n])=>core.trace({digits,n})))));"
traces=json.loads(subprocess.check_output(['node','-e',js,str(ROOT/'core.js')],input=json.dumps(small).encode()))
count_frames=0
for (ds,n),frames in zip(small,traces):
    valid=[v for v in range(1,n+1) if set(str(v))<=set(ds)]
    expected_counted=set();prev=0
    for f in frames:
        count_frames+=1
        if f['kind']=='short':block={v for v in valid if len(str(v))==f['size']}
        elif f['kind']=='position':
            i=f['i'];block={v for v in valid if len(str(v))==len(str(n)) and str(v)[:i]==str(n)[:i] and str(v)[i]<str(n)[i]}
            assert sum(r['ways'] for r in f['rows'])==len(block)
            for row in f['rows']:
                b={v for v in block if str(v)[i]==row['digit']}
                assert len(b)==row['ways']
        elif f['kind']=='exact':block={n}
        else:block=set()
        assert not expected_counted.intersection(block)
        expected_counted|=block
        assert f['before']==prev and f['delta']==len(block) and f['total']==len(expected_counted)
        prev=f['total']
    assert expected_counted==set(valid)
# Browser core also compared to independent DP on all large seeded inputs.
js2="const c=require(process.argv[1]);let b='';process.stdin.on('data',x=>b+=x);process.stdin.on('end',()=>process.stdout.write(JSON.stringify(JSON.parse(b).map(([digits,n])=>c.trace({digits,n}).at(-1).total))));"
actual=json.loads(subprocess.check_output(['node','-e',js2,str(ROOT/'core.js')],input=json.dumps(cases).encode()))
assert actual==[solve(ds,n) for ds,n in cases]
source=(ROOT/'solution.py').read_text();mirror=(ROOT/'python-code.js').read_text()
assert mirror=='window.PYTHON_SOURCE = '+json.dumps(source,ensure_ascii=False)+';\n'
# Parse copy with pair hook, detecting duplicate keys before overwriting.
def unique(items):
    keys=[k for k,v in items];assert len(keys)==len(set(keys));return dict(items)
copy=(ROOT/'copy.js').read_text();pairs=json.loads(copy[len('window.LESSON_COPY = '):-2],object_pairs_hook=unique)
assert all(isinstance(v,list) and len(v)==2 and all(isinstance(t,str) and t for t in v) for v in pairs.values())
result={'kind':'author self-check','pythonDirectEnumerationCases':5000,'pythonTotalCases':len(cases)+len(large),'seed':902,'intermediateFrames':count_frames,'javascriptTraceCases':len(cases),'officialExamples':True,'maximumBoundary':435848049,'duplicateCopyKeys':0,'mirrorExact':True}
(OUT/'core-results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
