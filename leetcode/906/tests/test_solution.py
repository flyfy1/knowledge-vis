import importlib.util,itertools,json,os,random,math
from pathlib import Path
P=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',P/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',P/'solution.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
f=m.Solution().superpalindromesInRange
# Oracle uses arithmetic reversal, independent of string mirror generation.
def rev(n):
    v=0
    while n:v,n=v*10+n%10,n//10
    return v
def oracle(a,b):
    return sum(a<=r*r<=b and rev(r)==r and rev(r*r)==r*r for r in range(1,math.isqrt(b)+1))
n=0
for a in range(1,121):
 for b in range(a,121):assert f(str(a),str(b))==oracle(a,b),(a,b);n+=1
rng=random.Random(906)
for _ in range(200):
 a=rng.randint(1,10**8);b=rng.randint(a,10**8);assert f(str(a),str(b))==oracle(a,b);n+=1
for a,b,want in [(4,1000,4),(1,2,1),(676,676,0),(121,121,1),(10000,15000,3),(100,120,0),(40000,50000,2),(10**18-1,10**18-1,0)]:assert f(str(a),str(b))==want;n+=1
# Full-domain independent construction: fill paired digit slots, not seed reversal.
roots=[]
for length in range(1,10):
 for digits in itertools.product(range(10),repeat=(length+1)//2):
  if digits[0]==0:continue
  slots=[0]*length
  for i,d in enumerate(digits):slots[i]=slots[length-i-1]=d
  root=0
  for d in slots:root=root*10+d
  roots.append(root)
assert len(roots)==109998 and len(set(roots))==109998
valid=sorted(r*r for r in roots if rev(r*r)==r*r)
assert len(valid)==70
assert f('1',str(10**18-1))==len(valid)
for value in valid:
 for delta in [-1,0,1]:
  a=max(1,value+delta);assert f(str(a),str(a))==int(a in valid);n+=1
src=(P/'solution.py').read_text();mirror=(P/'python-code.js').read_text();assert json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').removesuffix(';\n'))==src
# Catch duplicate localization keys before JSON overwrites them.
def unique(pairs):
 d={}
 for k,v in pairs:assert k not in d,k;d[k]=v
 return d
copy=json.loads((P/'copy.js').read_text().removeprefix('window.LESSON_COPY = ').removesuffix(';\n'),object_pairs_hook=unique)
assert all(isinstance(v,list) and len(v)==2 and all(isinstance(x,str) and x for x in v) for v in copy.values())
report={'checks':n,'fullDomainRootCandidates':len(roots),'fullDomainAnswer':len(valid),'seed':906,'sourceParity':True,'copyKeys':len(copy),'status':'pass'}
(OUT/'solution-results.json').write_text(json.dumps(report,indent=2));print(report)
