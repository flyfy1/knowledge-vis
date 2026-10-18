"""Run from any directory; OUTPUT_DIR redirects generated evidence."""
import importlib.util,itertools,json,os,pathlib,random,subprocess
root=pathlib.Path(__file__).resolve().parents[1]
out=pathlib.Path(os.environ.get('OUTPUT_DIR',root/'tests/evidence'));out.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('submission',root/'solution.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
def oracle(a):
    best=a[0]
    for x in a[1:]:
        if x<best:best=x
    return best
cases=[]
for n in range(1,9):
    for ordered in itertools.combinations_with_replacement([-2,-1,0,1,2],n):
        for k in range(n):cases.append(list(ordered[k:]+ordered[:k]))
rng=random.Random(154)
for _ in range(1500):
    a=sorted(rng.randint(-5000,5000) for _ in range(rng.randint(1,100)));k=rng.randrange(len(a));cases.append(a[k:]+a[:k])
cases += [[7]*5000,[-5000]+[5000]*4999,[5000]*4999+[-5000],list(range(-2500,2500)),[1,3,5],[2,2,2,0,1]]
for a in cases:
    old=a[:];actual=module.Solution().findMin(a)
    assert actual==oracle(a),(a,actual)
    assert a==old
p=subprocess.run(['node',str(root/'tests/trace.cjs')],input=json.dumps(cases),text=True,capture_output=True,check=True)
result={'pythonCases':len(cases),'oracle':'independent linear scan','mutation':'unchanged on all cases','trace':json.loads(p.stdout),'seed':154}
(out/'algorithm.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
