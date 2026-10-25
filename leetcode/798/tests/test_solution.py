import importlib.util,itertools,random,json,os,pathlib,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('solution',ROOT/'solution.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def oracle(a):
    scores=[]
    for k in range(len(a)):
        b=a[k:]+a[:k]
        scores.append(sum(v<=j for j,v in enumerate(b)))
    return scores.index(max(scores)),scores
cases=[]
for n in range(1,7):cases.extend(map(list,itertools.product(range(n),repeat=n)))
r=random.Random(798)
for _ in range(1500):
    n=r.randrange(1,80);cases.append([r.randrange(n) for _ in range(n)])
for a in cases:
    before=a[:];want,_=oracle(a);assert m.Solution().bestRotation(a)==want,(a,want);assert a==before
for n in [1,100000]:
    for a in [[0]*n,[n-1]*n,list(range(n))]:assert m.Solution().bestRotation(a)==0
# Same independently computed scores drive browser-core intermediate checks.
script="""const fs=require('fs'),C=require(process.argv[1]);const cases=JSON.parse(fs.readFileSync(0,'utf8'));for(const [a,scores] of cases){const m=C.model(a);m.rows.forEach((r,k)=>{if(r.score!==scores[k]||r.bad!==a.length-scores[k])throw Error('prefix invariant');const prefix=scores.slice(0,k+1),max=Math.max(...prefix);if(r.best!==max||r.answer!==prefix.indexOf(max))throw Error('identity');});for(let i=0;i<a.length;i++){const covered=new Set(C.intervals(a.length,i,a[i]).flatMap(([l,r])=>Array.from({length:r-l+1},(_,x)=>l+x)));for(let k=0;k<a.length;k++)if(covered.has(k)!==(a[i]>(i-k+a.length)%a.length))throw Error('interval');}}console.log('all intermediate invariants pass');"""
subset=cases[:5000]+cases[-1500:]
res=subprocess.run(['node','-e',script,str(ROOT/'core.js')],input=json.dumps([(a,oracle(a)[1]) for a in subset]),text=True,capture_output=True,check=True)
out=pathlib.Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));out.mkdir(parents=True,exist_ok=True)
(out/'numerical.json').write_text(json.dumps({'authorSelfCheck':True,'python_cases':len(cases),'max_length':100000,'core_cases':len(subset),'result':res.stdout},indent=2))
print(len(cases),'Python cases passed;',res.stdout)
