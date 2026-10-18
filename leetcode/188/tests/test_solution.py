"""Independent interval enumeration, not the submission recurrence."""
import importlib.util,itertools,json,os,random,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('canonical',ROOT/'solution.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
solve=module.Solution().maxProfit

def oracle(prices,k):
    def intervals(start,left):
        best=0
        if left:
            for buy in range(start,len(prices)):
                for sell in range(buy+1,len(prices)):
                    best=max(best,prices[sell]-prices[buy]+intervals(sell+1,left-1))
        return best
    return intervals(0,k)

baseline_code=re.search(r'<pre><code>(def baseline.*?)</code></pre>',(ROOT/'index.html').read_text(),re.S)[1]
namespace={};exec(baseline_code,namespace);baseline=namespace['baseline']
count=0
for n in range(7):
    for p in itertools.product(range(3),repeat=n):
        for k in range(4):
            a=list(p);assert solve(k,a)==oracle(a,k)==baseline(k,a),(a,k);assert a==list(p)
            count+=1
rng=random.Random(188)
for _ in range(250):
    a=[rng.randrange(1001) for _ in range(rng.randrange(1,9))];k=rng.randrange(1,5)
    assert solve(k,a)==oracle(a,k);count+=1
for k,a,want in [(2,[2,4,1],2),(2,[3,2,6,5,0,3],7),(100,[0,1000]*500,100000),(100,list(range(1000)),999),(100,list(range(999,-1,-1)),0),(100,[1000]*1000,0),(1,[0],0)]:
    assert solve(k,a)==want;count+=1
mirror=(ROOT/'python-code.js').read_text()
assert json.loads(re.fullmatch(r'window.PYTHON_SOURCE = (.*);\n',mirror)[1])==(ROOT/'solution.py').read_text()
out=Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));out.mkdir(parents=True,exist_ok=True)
(out/'python-results.json').write_text(json.dumps({'cases':count,'exhaustive':'n=0..6, prices=0..2, k=0..3','seed':188,'randomCases':250,'maximumConstraint':True,'sourceParity':True},indent=2))
print(f'Python checks passed: {count} cases')
