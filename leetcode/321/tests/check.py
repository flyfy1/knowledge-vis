"""Reproducible author checks; OUTPUT_DIR redirects all generated evidence."""
import importlib.util, itertools as it, json, os, random, time
from pathlib import Path
from functools import lru_cache
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('submission',ROOT/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
solve=mod.Solution().maxNumber

def oracle(a,b,k):
    # Every legal next position is a branch. No greedy deletion or suffix comparison.
    @lru_cache(None)
    def visit(i,j,left):
        if left==0:return ()
        if len(a)-i+len(b)-j<left:return None
        candidates=[]
        for source,start in ((0,i),(1,j)):
            nums=a if source==0 else b
            for p in range(start,len(nums)):
                tail=visit(p+1,j,left-1) if source==0 else visit(i,p+1,left-1)
                if tail is not None:candidates.append((nums[p],)+tail)
        return max(candidates) if candidates else None
    return list(visit(0,0,k))

def best_subsequence(a,k):
    return list(max((tuple(a[i] for i in inds) for inds in it.combinations(range(len(a)),k)),default=()))

def all_merge(a,b):
    if not a:return [tuple(b)]
    if not b:return [tuple(a)]
    return [(a[0],)+x for x in all_merge(a[1:],b)]+[(b[0],)+x for x in all_merge(a,b[1:])]

# Execute the exact baseline shown in the page, separately from the submission.
import re, html
shown=html.unescape(re.search(r'<code id="baselineCode">(.*?)</code>',(ROOT/'index.html').read_text(),re.S)[1])
baseline_namespace={};exec(shown,baseline_namespace)
assert baseline_namespace['exhaustive']([3,5,4],[6,2],3)==[6,5,4]
assert baseline_namespace['exhaustive']([6,7],[6,0,4],5)==[6,7,6,0,4]
start=time.time();count=0;fixtures=[]
def check(a,b,k):
    global count
    aa=a[:];bb=b[:];expected=oracle(tuple(a),tuple(b),k);actual=solve(a,b,k)
    assert actual==expected,(a,b,k,expected,actual)
    assert a==aa and b==bb
    assert len(actual)==k and actual is not a and actual is not b
    count+=1
    return expected

examples=[([3,4,6,5],[9,1,2,5,8,3],5,[9,8,6,5,3]),([6,7],[6,0,4],5,[6,7,6,0,4]),([3,9],[8,9],3,[9,8,9])]
for a,b,k,e in examples:assert check(a,b,k)==e
arrays=[list(x) for n in range(1,4) for x in it.product(range(3),repeat=n) if x[0]!=0]
for a in arrays:
    for b in arrays:
        for k in range(1,len(a)+len(b)+1):
            expected=check(a,b,k)
            fixtures.append({'a':a,'b':b,'k':k,'expected':expected})
rng=random.Random(321)
for _ in range(600):
    a=[rng.randint(1,9)]+[rng.randrange(10) for _ in range(rng.randrange(5))]
    b=[rng.randint(1,9)]+[rng.randrange(10) for _ in range(rng.randrange(5))]
    k=rng.randint(1,len(a)+len(b));expected=check(a,b,k);fixtures.append({'a':a,'b':b,'k':k,'expected':expected})
# Required independent fresh transfer check, including counterfactual first B.
a=[8,8,9];b=[8,8,1];assert check(a,b,6)==[8,8,9,8,8,1]
assert max(all_merge(a,b[1:]))==(8,8,9,8,1)
# Maximum official sizes, adversarial equal-prefix comparisons and all k boundaries.
maximum=[]
for a,b,k,expected in [([9]*500,[9]*500,1000,[9]*1000),([9]*500,[9]*500,500,[9]*500),([1]*500,[2]*500,1,[2]),([9]+[0]*499,[8]+[0]*499,1000,[9,8]+[0]*998)]:
    tick=time.time();assert solve(a,b,k)==expected;maximum.append({'m':len(a),'n':len(b),'k':k,'seconds':round(time.time()-tick,3)})
# Independent subsequence and interleaving fixtures also test internal empties.
picks=[]
for n in range(0,7):
    for a in it.product(range(3),repeat=n):
        for k in range(n+1):picks.append({'nums':list(a),'take':k,'expected':best_subsequence(a,k)})
merges=[]
small=[list(a) for n in range(4) for a in it.product(range(3),repeat=n)]
for a in small:
    for b in small:merges.append({'a':a,'b':b,'expected':list(max(all_merge(a,b)))})
(OUT/'fixtures.json').write_text(json.dumps({'solutions':fixtures,'picks':picks,'merges':merges}))
mirror=(ROOT/'python-code.js').read_text();assert json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').strip().removesuffix(';'))==(ROOT/'solution.py').read_text()
report={'kind':'author self-check','officialExamples':3,'oracleCases':count,'seed':321,'pickFixtures':len(picks),'mergeFixtures':len(merges),'maximumConstraints':maximum,'seconds':round(time.time()-start,3),'sourceMirror':'exact'}
(OUT/'python-check.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
