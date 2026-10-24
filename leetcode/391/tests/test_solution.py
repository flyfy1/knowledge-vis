import collections, copy, importlib.util, itertools, json, os, random
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',ROOT/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
solve=mod.Solution().isRectangleCover
def unique_keys(items):
    result={}
    for key,value in items:
        assert key not in result, 'Duplicate localization key: '+key
        result[key]=value
    return result
localization=json.loads((ROOT/'copy.js').read_text().removeprefix('window.COPY = ').strip().removesuffix(';'),object_pairs_hook=unique_keys)
assert all(len(v)==2 and all(isinstance(s,str) and s for s in v) for v in localization.values())
# Independent geometric oracle: partition into open cells between every edge,
# then demand exactly one containing rectangle for every midpoint.
def oracle(rs):
    xs=sorted({r[i] for r in rs for i in (0,2)});ys=sorted({r[i] for r in rs for i in (1,3)})
    return all(sum(2*a<=x0+x1<2*c and 2*b<=y0+y1<2*d for a,b,c,d in rs)==1
               for x0,x1 in zip(xs,xs[1:]) for y0,y1 in zip(ys,ys[1:]))
rects=[list(r) for r in itertools.product(range(3),repeat=4) if r[0]<r[2] and r[1]<r[3]]
cases=[]
for n in range(1,6):
    cases.extend([list(map(list,rs)) for rs in itertools.combinations_with_replacement(rects,n)])
rng=random.Random(391)
for _ in range(1500):
    rs=[]
    for __ in range(rng.randint(1,8)):
        x,a=sorted(rng.sample(range(-3,4),2));y,b=sorted(rng.sample(range(-3,4),2));rs.append([x,y,a,b])
    cases.append(rs)
official=json.loads((ROOT/'tests/evidence/official.json').read_text())['response']['data']['question']
# GraphQL exampleTestcases has one JSON input per line for this problem.
examples=[json.loads(s) for s in official['exampleTestcases'].strip().splitlines()]
assert len(examples)==3
for rs,expected in zip(examples,[True,False,False]):assert solve(rs)==oracle(rs)==expected
cases+=examples
cases += [[[-100000,-100000,100000,100000]],[[0,0,1,1],[1,1,2,2]],[[0,0,2,1],[0,1,1,2],[1,1,2,2]],[[0,0,3,1],[0,1,1,2],[2,1,3,2],[0,1,1,2]]]
checks=[]
for rs in cases:
    old=copy.deepcopy(rs);expected=oracle(rs);actual=solve(rs)
    assert actual is expected,(rs,actual,expected)
    assert rs==old
    checks.append({'rectangles':rs,'expected':expected})
large=[[i,0,i+1,1] for i in range(20000)]
assert solve(large) is True
large[-1]=large[-2][:];assert solve(large) is False
assert solve([[-100000,-100000,100000,100000]]) is True
(OUT/'oracle-cases.json').write_text(json.dumps(checks))
result={'cases':len(cases),'exhaustive':'all multisets of 1..5 rectangles on coordinates 0..2','seed':391,'random_cases':1500,'official_examples':3,'maximum_n':20000,'input_unchanged':True,'result':'pass'}
(OUT/'python-results.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
