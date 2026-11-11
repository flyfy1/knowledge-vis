import importlib.util,itertools,random,json,os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',ROOT/'solution.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
solve=m.Solution().threeEqualParts

def value(a):
    v=0
    for x in a:v=2*v+x
    return v

def oracle(a):
    # Enumerate legal cuts and compare integer values, independent of one groups.
    return [(i,j) for i in range(len(a)-2) for j in range(i+2,len(a)) if value(a[:i+1])==value(a[i+1:j])==value(a[j:])]

def check(a):
    original=a[:];got=solve(a);answers=oracle(a)
    assert a==original
    assert got==[-1,-1] if not answers else tuple(got) in answers,(a,got,answers)

count=0
for n in range(3,13):
    for bits in itertools.product((0,1),repeat=n):check(list(bits));count+=1
rng=random.Random(927)
for _ in range(800):check([rng.randrange(2) for _ in range(rng.randrange(3,31))])
for a in [[1,0,1,0,1],[1,1,0,1,1],[1,1,0,0,1],[0,1,0,0,1,0,0,1,0]]:check(a)
large=[]
for a,expected in [([0]*30000,[0,2]),([1]*30000,[9999,20000]),(([1]+[0]*9999)*3,[9999,20000]),([1]+[0]*29999,[-1,-1])]:
    assert solve(a)==expected;large.append({'n':len(a),'answer':expected})
# Mirror parity includes final newline.
mirror=(ROOT/'python-code.js').read_text();assert mirror=='window.PYTHON_SOURCE = '+json.dumps((ROOT/'solution.py').read_text())+';\n'
# Check baseline displayed in HTML really runs independently as printed.
import re,html
baseline=html.unescape(re.search(r'<code>(def baseline.*?</code>)',(ROOT/'index.html').read_text(),re.S).group(1).removesuffix('</code>'))
ns={};exec(baseline,ns)
for _ in range(100):
    a=[rng.randrange(2) for _ in range(rng.randrange(3,13))];ans=ns['baseline'](a);valid=oracle(a);assert (ans==[-1,-1]) if not valid else tuple(ans) in valid
# Detect duplicate keys before JSON can silently overwrite one.
def unique(pairs):
    assert len(pairs)==len(dict(pairs));return dict(pairs)
copy=json.loads((ROOT/'copy.js').read_text().removeprefix('const COPY = ').removesuffix(';\n'),object_pairs_hook=unique)
assert all(isinstance(v,list) and len(v)==2 and all(isinstance(x,str) and x for x in v) for v in copy.values())
result={'kind':'author self-check','exhaustiveArrays':count,'lengths':'3..12','seed':927,'seededArrays':800,'officialAndFresh':4,'maxBoundaries':large,'displayedBaselineCases':100,'sourceParity':True,'copyKeys':len(copy)}
(OUT/'numeric.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
