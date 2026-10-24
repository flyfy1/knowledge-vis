import importlib.util,itertools,json,os,random,subprocess
from pathlib import Path
P=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',P/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',P/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
solve=mod.Solution().getMaxRepetitions
# Independent DP: keep every achievable length of a prefix of infinite s2.
# Each source character either is deleted or extends a reachable prefix.
def oracle(s1,n1,s2,n2):
    reachable={0}
    for ch in s1*n1:
        reachable |= {k+1 for k in reachable if ch==s2[k%len(s2)]}
    return max(reachable)//len(s2)//n2
words=[''.join(x) for n in range(1,4) for x in itertools.product('ab',repeat=n)]
cases=[(s1,n1,s2,n2) for s1 in words for s2 in words for n1 in range(1,7) for n2 in range(1,4)]
rng=random.Random(466)
cases += [(''.join(rng.choices('abc',k=rng.randint(1,8))),rng.randint(1,15),''.join(rng.choices('abcd',k=rng.randint(1,7))),rng.randint(1,6)) for _ in range(1000)]
for case in cases:assert solve(*case)==oracle(*case),(case,solve(*case),oracle(*case))
large=[(('a'*100,10**6,'a',1),100_000_000),(('ab',10**6,'aba',2),250_000),(('abc',10**6,'d',1),0),(('a',10**6,'a'*100,10**6),0),(('acb',4,'ab',2),2),(('acb',1,'acb',1),1)]
for case,want in large:assert solve(*case)==want,(case,want)
source=(P/'solution.py').read_text();mirror=(P/'python-code.js').read_text();assert json.loads(mirror[len('window.PYTHON_SOURCE = '):].strip().removesuffix(';'))==source
# Run browser numerical core in Node; export all snapshots for independent checks.
js="const c=require(process.argv[1]);let s='';process.stdin.on('data',x=>s+=x);process.stdin.on('end',()=>console.log(JSON.stringify(JSON.parse(s).map(x=>c.trace(...x)))));"
small=cases[:3528]+cases[-1000:]
traces=json.loads(subprocess.check_output(['node','-e',js,str(P/'core.js')],input=json.dumps(small).encode()))
large_traces=json.loads(subprocess.check_output(['node','-e',js,str(P/'core.js')],input=json.dumps([case for case,_ in large]).encode()))
for (case,want),frames in zip(large,large_traces):
    assert frames[-1]['answer']==want
    for f in frames:
        if f['kind']=='jump':
            assert f['q']==(case[1]-f['from'])//f['L']
            assert f['count']==f['fromCount']+f['q']*f['G']
frames_checked=0
for case,frames in zip(small,traces):
    s1,n1,s2,n2=case
    assert frames[-1]['answer']==oracle(*case)==solve(*case)
    for f in frames:
        # Exact consumed source prefix; char frame has partially consumed current block.
        consumed=f['block']*len(s1)+(f['pos']+1 if f['kind']=='char' else 0)
        reachable={0}
        for ch in (s1*n1)[:consumed]:reachable|={k+1 for k in reachable if ch==s2[k%len(s2)]}
        assert max(reachable)==f['count']*len(s2)+f['j'],(case,f)
        if f['kind']=='jump':
            assert f['block']==f['from']+f['q']*f['L']
            assert f['count']==f['fromCount']+f['q']*f['G']
            assert n1-f['block']<f['L']
        frames_checked+=1
result={'python_oracle_cases':len(cases),'large_closed_form_cases_python_and_js':len(large),'js_python_oracle_cases':len(small),'intermediate_DP_invariant_frames':frames_checked,'source_mirror':'exact','seed':466}
(OUT/'numerical.json').write_text(json.dumps(result,indent=2)+'\n');print(result)
