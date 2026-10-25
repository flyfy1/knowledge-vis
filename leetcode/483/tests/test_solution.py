"""Independent repeated-division oracle. OUT_DIR controls generated evidence."""
import importlib.util,json,os,random,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('candidate',ROOT/'solution.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
solve=module.Solution().smallestGoodBase

def oracle(n):
    for k in range(2,n):
        x=n
        while x and x%k==1:
            x//=k
        if x==0:return str(k)

def run():
    count=0
    for n in range(3,2001):
        assert solve(str(n))==oracle(n),(n,solve(str(n)),oracle(n))
        count+=1
    rng=random.Random(483)
    for _ in range(180):
        n=rng.randint(2001,20000)
        assert solve(str(n))==oracle(n),n
        count+=1
    official={'13':'3','4681':'8','1000000000000000000':'999999999999999999','3':'2','16':'15','31':'2','40':'3'}
    for n,ans in official.items():assert solve(n)==ans,(n,ans)
    for L in range(2,60):assert solve(str((1<<L)-1))=='2'
    # Construct representations, independently validate the returned base's digits
    # and compare against every smaller base (bounded by construction).
    generated=[]
    for k in [2,3,7,10,97,1000]:
        for digits in range(3,15):
            n=sum(k**i for i in range(digits))
            if n>10**18:break
            got=int(solve(str(n)));assert got<=k
            valid=[]
            for b in range(2,k+1):
                x=n
                while x and x%b==1:x//=b
                if x==0:valid.append(b)
            assert got==min(valid)
            generated.append({'n':str(n),'answer':str(got)})
    source=(ROOT/'solution.py').read_text()
    embedded=json.loads(re.fullmatch(r'window.PYTHON_SOURCE = (.*);\n', (ROOT/'python-code.js').read_text())[1])
    assert embedded==source
    report={'kind':'author self-check','exhaustive':count-180,'seeded':180,'officialAndBoundary':official,'mersenneCases':58,'generated':len(generated),'sourceParity':True}
    out=Path(os.environ.get('OUT_DIR',ROOT/'tests/evidence'));out.mkdir(parents=True,exist_ok=True)
    (out/'python-results.json').write_text(json.dumps(report,indent=2))
    (out/'oracle-fixtures.json').write_text(json.dumps(generated+[{'n':str(n),'answer':oracle(n)} for n in range(3,301)],indent=2))
    print(json.dumps(report))
if __name__=='__main__':run()
