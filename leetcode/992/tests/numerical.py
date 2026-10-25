"""Run with OUTPUT_DIR to preserve a frozen candidate's evidence."""
import os, pathlib, json, itertools, random, subprocess, importlib.util, ast
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',ROOT/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
def oracle(a,k):
    # Independent interval materialization, not a sliding window.
    return sum(len(set(a[l:r+1]))==k for l in range(len(a)) for r in range(l,len(a)))
def expected_frame(a,k,r):
    valid=[[l for l in range(r+1) if len(set(a[l:r+1]))<=t] for t in [k,k-1]]
    left=[v[0] if v else r+1 for v in valid]
    return left,[len(v) for v in valid]
cases=[]
for n in range(1,7):
    for a in itertools.product(range(1,min(n,3)+1),repeat=n):
        for k in range(1,n+1):cases.append([list(a),k])
rng=random.Random(992)
for _ in range(500):
    n=rng.randint(1,18);cases.append([[rng.randint(1,n) for _ in range(n)],rng.randint(1,n)])
for a,k in cases:
    old=a[:];assert mod.Solution().subarraysWithKDistinct(a,k)==oracle(a,k),(a,k);assert a==old
script="const c=require('./core.js');let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>process.stdout.write(JSON.stringify(JSON.parse(s).map(([a,k])=>c.trace(a,k)))));"
frames=json.loads(subprocess.run(['node','-e',script],cwd=ROOT,input=json.dumps(cases),capture_output=True,text=True,check=True).stdout)
for (a,k),trace in zip(cases,frames):
    assert len(trace)==len(a)+1 and trace[0]['total']==0
    for r,f in enumerate(trace[1:]):
        left,counts=expected_frame(a,k,r)
        assert [w['left'] for w in f['windows']]==left
        assert [w['count'] for w in f['windows']]==counts
        assert f['delta']==counts[0]-counts[1]
        assert f['total']==oracle(a[:r+1],k)
        for w in f['windows']:
            want={str(v):a[w['left']:r+1].count(v) for v in set(a[w['left']:r+1])}
            assert w['freq']==want
            assert [x['index'] for x in w['removed']]==list(range(w['before'],w['left']))
for a,k,expected in [([1,2,1,2,3],2,7),([1,2,1,3,4],3,3),([1]*20000,1,200010000),([1]*20000,20000,0),(list(range(1,20001)),1,20000),(list(range(1,20001)),20000,1)]:
    assert mod.Solution().subarraysWithKDistinct(a,k)==expected
source=(ROOT/'solution.py').read_text();mirror=(ROOT/'python-code.js').read_text();assert json.loads(mirror[len('window.PYTHON_SOURCE = '):-2])==source
# Detect duplicate object keys at source level before JavaScript could overwrite them.
copy=(ROOT/'copy.js').read_text().split('window.LESSON_COPY = ',1)[1].rstrip().removesuffix(';')
def unique(pairs):
    d={}
    for key,value in pairs:
        assert key not in d, key
        d[key]=value
    return d
pairs=json.loads(copy,object_pairs_hook=unique);assert all(isinstance(p,list) and len(p)==2 and all(isinstance(s,str) and s for s in p) for p in pairs.values())
report={'kind':'author numerical self-check','result':'pass','small_cases':len(cases),'frames':sum(map(len,frames)),'max_n':20000,'official_examples':[7,3],'source_mirror':'exact including final newline','copy_keys':len(pairs),'oracle':'independent materialized intervals and sets','intermediate':['earliest legal start','both contributions','prefix total','exact positive frequencies','removal indices'],'review':'independent review pending'}
(OUT/'numerical.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
