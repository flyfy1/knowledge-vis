"""Independent unit-cell and inclusion/exclusion oracles; no production helpers."""
import importlib.util,itertools,json,os,pathlib,random,time,ast
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('LESSON_OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',ROOT/'solution.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def raster(rs):
    return len({(x,y) for a,b,c,d in rs for x in range(a,c) for y in range(b,d)})
def inclusion(rs):
    total=0
    for mask in range(1,1<<len(rs)):
        selected=[r for i,r in enumerate(rs) if mask>>i&1]
        width=max(0,min(r[2] for r in selected)-max(r[0] for r in selected))
        height=max(0,min(r[3] for r in selected)-max(r[1] for r in selected))
        total+=(1 if len(selected)%2 else -1)*width*height
    return total%1_000_000_007
checks=0
def check(rs,expected):
    global checks
    before=json.dumps(rs);assert m.Solution().rectangleArea(rs)==expected,rs
    assert json.dumps(rs)==before;checks+=1
rects=[[a,b,c,d] for a in range(2) for c in range(a+1,3) for b in range(2) for d in range(b+1,3)]
for n in range(1,5):
    for rs in itertools.combinations_with_replacement(rects,n):check(list(rs),raster(rs))
rng=random.Random(850)
for _ in range(1200):
    rs=[]
    for _ in range(rng.randint(1,8)):
        a,c=sorted(rng.sample(range(8),2));b,d=sorted(rng.sample(range(8),2));rs.append([a,b,c,d])
    check(rs,raster(rs));assert inclusion(rs)==raster(rs)
for _ in range(250):
    rs=[]
    for _ in range(rng.randint(1,7)):
        a,c=sorted(rng.sample(range(10**9+1),2));b,d=sorted(rng.sample(range(10**9+1),2));rs.append([a,b,c,d])
    check(rs,inclusion(rs))
check([[0,0,2,2],[1,0,2,3],[1,0,3,1]],6)
check([[0,0,10**9,10**9]],49)
check([[0,0,10**9,10**9]]*200,49)
# Maximum n, maximum unique x boundaries, disjoint strips; closed form.
rs=[[2*i,0,2*i+1,10**9] for i in range(200)]
start=time.perf_counter();check(rs,(200*10**9)%1_000_000_007);elapsed=time.perf_counter()-start
# Fresh transfer: union 4, span 6, raw sum 5; strip width 2.
check([[0,0,2,2],[0,1,2,3],[0,5,2,6]],8)
# Mirror exactness, including final newline.
mirror=(ROOT/'python-code.js').read_text();assert mirror.startswith('window.PYTHON_SOURCE = ')
assert json.loads(mirror[len('window.PYTHON_SOURCE = '):].strip().removesuffix(';'))==(ROOT/'solution.py').read_text()
# duplicate copy keys before JS parsing: lexical keys at line starts or after comma
import re
copy=(ROOT/'copy.js').read_text();keys=re.findall(r'(?:^|[,\n])\s*(\w+)\s*:\s*\[',copy)
assert len(keys)==len(set(keys));assert keys
result={'status':'pass','checks':checks,'maxUniqueBoundariesSeconds':elapsed,'oracles':['unit-cell set','inclusion-exclusion'],'sourceMirrorExact':True,'uniqueCopyKeys':len(keys)}
(OUT/'python-results.json').write_text(json.dumps(result,indent=2));print(result)
