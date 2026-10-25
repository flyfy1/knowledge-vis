import sys, itertools, random, json, os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT));sys.path.insert(0,str(ROOT/'tests'))
from solution import Solution
from baseline import exhaustive
solve=Solution().intersectionSizeTwo
cases=[]
ivs=list(itertools.combinations(range(5),2))
for n in range(1,5):
 for a in itertools.combinations_with_replacement(ivs,n):cases.append([list(x) for x in a])
rng=random.Random(757)
for _ in range(700):cases.append([sorted(rng.sample(range(9),2)) for _ in range(rng.randint(1,8))])
for a in cases:
 old=[x[:] for x in a];actual=solve(a);assert actual==exhaustive(a),(a,actual);assert a==old
for a,e in [([[1,3],[3,7],[8,9]],5),([[1,3],[1,4],[2,5],[3,5]],3),([[1,2],[2,3],[2,4],[4,5]],5),([[0,10**8]]*3000,2),([[3*i,3*i+1] for i in range(3000)],6000)]:assert solve(a)==e
out=Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));out.mkdir(parents=True,exist_ok=True)
(out/'oracle-cases.json').write_text(json.dumps([{'input':a,'expected':exhaustive(a)} for a in cases]))
(out/'python-result.json').write_text(json.dumps({'tiny_cases':len(cases),'official_examples':3,'max_constraint_cases':2,'status':'passed'}))
print('Python oracle, mutation and boundary checks passed:',len(cases))
