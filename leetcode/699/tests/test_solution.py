"""Independent skyline oracle; outputs can be redirected without editing candidate."""
import os, json, itertools, random, importlib.util, hashlib
from pathlib import Path
HERE=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('LESSON_OUTPUT_DIR',HERE/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('canonical699',HERE/'solution.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
def oracle(positions,details=False):
    endpoints=sorted({x for l,s in positions for x in (l,l+s)})
    height=[0]*(len(endpoints)-1);result=[];tops=[];bases=[]
    for l,s in positions:
        a=endpoints.index(l);b=endpoints.index(l+s)
        base=max(height[a:b],default=0);top=base+s
        height[a:b]=[top]*(b-a)
        result.append(max(height,default=0));tops.append(top);bases.append(base)
    return (result,bases,tops) if details else result

def run():
    count=0;checks=[]
    def check(p,expected=None):
        nonlocal count
        original=[x[:] for x in p];want=oracle(p)
        if expected is not None:assert want==expected,(p,want,expected)
        got=module.Solution().fallingSquares(p)
        assert got==want,(p,got,want);assert p==original
        assert all(a<=b for a,b in zip(got,got[1:]))
        assert got[-1]<=sum(s for _,s in p)
        count+=1
    check([[1,2],[2,3],[6,1]],[2,5,5]);check([[100,100],[200,100]],[100,100])
    check([[1,3],[6,2],[3,4],[7,1]],[3,3,7,7])
    choices=[[l,s] for l in range(1,5) for s in range(1,4)]
    for n in range(1,5):
        for p in itertools.product(choices,repeat=n):check(list(p))
    rng=random.Random(699)
    for _ in range(600):
        p=[[rng.randint(1,40),rng.randint(1,12)] for _ in range(rng.randint(1,50))];check(p)
        result,bases,tops=oracle(p,True);checks.append({'positions':p,'answer':result,'bases':bases,'tops':tops})
    check([[10**8,10**6] for _ in range(1000)],[(i+1)*10**6 for i in range(1000)])
    check([[i*10**5+1,1] for i in range(1000)],[1]*1000)
    check([[rng.randint(1,10**8),rng.randint(1,10**6)] for _ in range(1000)])
    (OUT/'oracle-cases.json').write_text(json.dumps(checks))
    result={'cases':count,'exhaustive':'all lengths 1..4 over left=1..4, side=1..3','seed':699,'random':600,'maximum_n_cases':3,'official_examples':2,'no_mutation':True,'canonical_sha256':hashlib.sha256((HERE/'solution.py').read_bytes()).hexdigest()}
    (OUT/'python-results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
if __name__=='__main__':run()
