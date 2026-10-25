import ast, importlib.util,itertools,json,os,pathlib,random,hashlib
P=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('OUTPUT_DIR',P/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',P/'solution.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def oracle(a):
    return sum(x>2*y for i,x in enumerate(a) for y in a[i+1:])
def check(a):
    before=a.copy();actual=m.Solution().reversePairs(a)
    assert actual==oracle(a),(a,actual,oracle(a))
    assert a==before
count=0
for n in range(7):
 for a in itertools.product([-2,-1,0,1,2],repeat=n):check(list(a));count+=1
rng=random.Random(493)
for _ in range(700):check([rng.choice([-2**31,2**31-1,rng.randrange(-100,101)]) for _ in range(rng.randrange(1,65))]);count+=1
for a,expected in [([1,3,2,3,1],2),([2,4,3,5,1],3),([-1]*50000,50000*49999//2),(list(range(50000)),0),([0]*50000,0)]:
 assert m.Solution().reversePairs(a)==expected;count+=1
source=(P/'solution.py').read_text();mirror=(P/'python-code.js').read_text();assert json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').removesuffix(';\n'))==source
# JSON parsing with duplicate-key rejection, and copy consumer shape.
def unique(pairs):
 d={}
 for k,v in pairs:assert k not in d,k;d[k]=v
 return d
copy=json.loads((P/'copy.js').read_text().removeprefix('window.LESSON_COPY = ').removesuffix(';\n'),object_pairs_hook=unique)
assert all(isinstance(v,list) and len(v)==2 and all(isinstance(x,str) and x for x in v) for v in copy.values())
result={'kind':'author self-check','python_oracle_cases':count,'large_cases':3,'source_sha256':hashlib.sha256(source.encode()).hexdigest(),'copy_keys':len(copy),'result':'pass'}
(OUT/'numerical.json').write_text(json.dumps(result,indent=2)+'\n');print(result)
