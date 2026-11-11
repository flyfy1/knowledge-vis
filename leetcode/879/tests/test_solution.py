import importlib.util, itertools, json, os, random
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR', ROOT/'tests/evidence')); OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',ROOT/'solution.py'); module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
def oracle(n,P,g,h):
    return sum(sum(g[i] for i in range(len(g)) if mask>>i&1)<=n and sum(h[i] for i in range(len(g)) if mask>>i&1)>=P for mask in range(1<<len(g)))%1_000_000_007
count=0
def check(n,P,g,h,expected=None):
    global count
    before=(g[:],h[:]); got=module.Solution().profitableSchemes(n,P,g,h)
    assert got==(oracle(n,P,g,h) if expected is None else expected),(n,P,g,h,got,expected)
    assert (g,h)==before;count+=1
for m in range(1,4):
 for crimes in itertools.product(list(itertools.product([1,2,3],[0,1,2])),repeat=m):
  g,h=map(list,zip(*crimes))
  for n in [1,2,3]:
   for P in [0,1,2,3]:check(n,P,g,h)
rng=random.Random(879)
for _ in range(400):
 m=rng.randint(1,10);check(rng.randint(1,15),rng.randint(0,15),[rng.randint(1,10) for _ in range(m)],[rng.randint(0,10) for _ in range(m)])
check(3,2,[1,1,2],[2,2,0],5)
check(5,3,[2,2],[2,3],2);check(10,5,[2,3,5],[6,7,8],7)
check(100,0,[1]*100,[0]*100,pow(2,100,1_000_000_007))
check(100,100,[1]*100,[1]*100,1)
check(100,100,[100]*100,[100]*100,100)
check(100,100,[1]*100,[0]*100,0)
def unique(pairs):
 d={}
 for k,v in pairs:
  assert k not in d,'duplicate key '+k
  d[k]=v
 return d
copy=json.loads((ROOT/'copy.js').read_text().removeprefix('window.LESSON_COPY = ').removesuffix(';\n'),object_pairs_hook=unique)
assert all(isinstance(v,list) and len(v)==2 and all(isinstance(s,str) and s for s in v) for v in copy.values())
mirror=json.loads((ROOT/'python-code.js').read_text().removeprefix('window.PYTHON_SOURCE = ').removesuffix(';\n'))
assert mirror==(ROOT/'solution.py').read_text()
# Execute the displayed recursive baseline independently of the DP.
def baseline(n,P,g,h):
 def visit(i,u,p):
  if i==len(g): return int(u<=n and p>=P)
  return visit(i+1,u,p)+visit(i+1,u+g[i],p+h[i])
 return visit(0,0,0)%1_000_000_007
for a in [(5,3,[2,2],[2,3]),(3,2,[1,1,2],[2,2,0]),(2,0,[1,1],[0,0]),(2,3,[1],[2])]:
 assert baseline(*a)==oracle(*a)
OUT.joinpath('python-results.json').write_text(json.dumps({'result':'pass','cases':count,'exhaustive':'m=1..3, g=1..3,h=0..2,n=1..3,P=0..3','seed':879,'maxima':'2^100 subsets; threshold 100; oversized choices; unreachable profit','copyKeys':len(copy)},indent=2))
print('Python independent oracle:',count,'cases passed')
