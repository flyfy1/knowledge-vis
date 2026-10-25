import importlib.util, itertools, json, os, random, time
from pathlib import Path
P=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',P/'tests/evidence')); OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',P/'solution.py'); mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
solve=mod.Solution().maxSumOfThreeSubarrays
# Independent reference: enumerate triples and sum the original elements.
def oracle(nums,k):
    best=None;score=-1
    for a,b,c in itertools.combinations(range(len(nums)-k+1),3):
        if a+k>b or b+k>c:continue
        s=sum(nums[a:a+k]+nums[b:b+k]+nums[c:c+k])
        if s>score:score=s;best=[a,b,c]
    return best
count=0
for n in range(3,10):
 for a in itertools.product((1,2,3),repeat=n):
  for k in range(1,n//3+1):
   nums=list(a);before=nums[:]
   assert solve(nums,k)==oracle(nums,k),(nums,k)
   assert nums==before
   count+=1
r=random.Random(689)
for _ in range(700):
 n=r.randint(3,24);nums=[r.randint(1,65535) for _ in range(n)];k=r.randint(1,n//3)
 assert solve(nums,k)==oracle(nums,k);count+=1
for nums,k,want in [([1,2,1,2,6,7,5,1],2,[0,3,5]),([1,2,1,2,1,2,1,2,1],2,[0,2,4]),([65535]*20000,6666,[0,6666,13332]),([65535]*20000,1,[0,1,2])]:
 assert solve(nums,k)==want;count+=1
source=(P/'solution.py').read_text();mirror=(P/'python-code.js').read_text()
assert json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').removesuffix(';\n'))==source
# Detect duplicate translation keys before JSON parsing can overwrite them.
def unique(pairs):
 d={}
 for k,v in pairs:
  assert k not in d,k
  assert isinstance(v,list) and len(v)==2 and all(isinstance(x,str) and x for x in v)
  d[k]=v
 return d
copy=json.loads((P/'copy.js').read_text().removeprefix('window.LESSON_COPY = ').removesuffix(';\n'),object_pairs_hook=unique)
report={'kind':'author self-check','python_cases':count,'source_parity':True,'copy_pairs':len(copy),'official_examples':True,'max_constraint':True}
(OUT/'python-results.json').write_text(json.dumps(report,indent=2)+'\n');print(report)
