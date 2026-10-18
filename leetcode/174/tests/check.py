"""Run from any directory; OUTPUT_DIR relocates generated evidence."""
import copy, html, importlib.util, itertools, json, os, random, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR', ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('submission',ROOT/'solution.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
solve=module.Solution().calculateMinimumHP
# This oracle tests survival directly, rather than transcribing backward needs.
def feasible(g,h,r=0,c=0):
    h+=g[r][c]
    if h<=0:return False
    if r==len(g)-1 and c==len(g[0])-1:return True
    return (r+1<len(g) and feasible(g,h,r+1,c)) or (c+1<len(g[0]) and feasible(g,h,r,c+1))
def oracle(g):
    lo,hi=1,1+sum(max(0,-v) for row in g for v in row)
    while lo<hi:
        mid=(lo+hi)//2
        if feasible(g,mid):hi=mid
        else:lo=mid+1
    return lo
# Execute the actual visible baseline as well.
code=html.unescape(re.search(r'<pre><code>(def baseline.*?)</code></pre>',(ROOT/'index.html').read_text(),re.S).group(1))
ns={};exec(code,ns)
cases=[]
for m,n in [(1,1),(1,3),(3,1),(2,2),(2,3),(3,2)]:
    for values in itertools.product([-2,0,3],repeat=m*n):cases.append([list(values[r*n:(r+1)*n]) for r in range(m)])
rng=random.Random(174)
for _ in range(500):
    m,n=rng.randint(1,4),rng.randint(1,4);cases.append([[rng.randint(-12,12) for _ in range(n)] for _ in range(m)])
cases.extend([[[-2,-3,3],[-5,-10,1],[10,30,-5]],[[0]],[[1,-4],[-2,-3]],[[0,-9,20],[-2,0,0]]])
fixtures=[];checks=0
for g in cases:
    before=copy.deepcopy(g);want=oracle(g);got=solve(g)
    assert got==want and type(got) is int,(g,got,want)
    assert g==before
    assert ns['baseline'](g)==want
    assert feasible(g,want) and (want==1 or not feasible(g,want-1))
    needs=[[oracle([row[c:] for row in g[r:]]) for c in range(len(g[0]))] for r in range(len(g))]
    fixtures.append({'grid':g,'need':want,'needs':needs});checks+=1
for g,want in [([[-1000]*200 for _ in range(200)],399001),([[1000]*200 for _ in range(200)],1),([[0]*200 for _ in range(200)],1),([[-1000]*200],200001),([[-1000] for _ in range(200)],200001)]:
    assert solve(g)==want;checks+=1
source=(ROOT/'solution.py').read_text();mirror=(ROOT/'python-code.js').read_text()
assert mirror=='window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
official=json.loads((ROOT/'tests/evidence/official.json').read_text())['response']['data']['question']
assert official['questionFrontendId']=='174' and not official['isPaidOnly']
assert any(s['langSlug']=='python3' and 'calculateMinimumHP' in s['code'] for s in official['codeSnippets'])
(OUT/'fixtures.json').write_text(json.dumps(fixtures))
summary={'canonicalAndBaselineCases':len(cases),'maxBoundaryCases':5,'total':checks,'oracle':'direct survival DFS + binary search; per-cell suffix oracle','seed':174,'mutation':'unchanged','sourceMirror':'exact','officialExamples':[7,1]}
(OUT/'numerical.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary))
