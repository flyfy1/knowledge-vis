"""Independent simple-path oracle; OUT_DIR redirects generated review evidence."""
import importlib.util,itertools,json,os,random,subprocess,re,html,sys
sys.dont_write_bytecode=True
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('submission',ROOT/'solution.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def adjacent(a,b):return sum(x!=y for x,y in zip(a,b))==1
def oracle(begin,end,words):
    # Enumerate simple paths on an all-pairs graph, not generated substitutions/BFS.
    vertices=set(words)|{begin};answers=[];best=len(vertices)+1
    if end not in words:return []
    def walk(path):
        nonlocal best,answers
        if path[-1]==end:
            if len(path)<best:best=len(path);answers=[]
            if len(path)==best:answers.append(path)
            return
        if len(path)>=best:return
        for w in sorted(vertices-set(path)):
            if adjacent(path[-1],w):walk(path+[w])
    walk([begin]);return sorted(answers)
def distances(begin,words):
    # Repeated relaxation over independent all-pairs adjacency.
    ds={begin:0};vs=set(words)|{begin}
    for _ in vs:
        for u in vs:
            for v in vs:
                if u in ds and adjacent(u,v):ds[v]=min(ds.get(v,9999),ds[u]+1)
    return ds
cases=[]
vs=[''.join(x) for x in itertools.product('ab',repeat=3)]
for mask in range(256):
    ws=[w for i,w in enumerate(vs) if mask>>i&1]
    if ws:cases.append(('aaa','bbb',ws))
rng=random.Random(126)
small=[''.join(x) for x in itertools.product('abc',repeat=2)]
for _ in range(240):
    b,e=rng.sample(small,2);cases.append((b,e,rng.sample(small,rng.randint(1,9))))
cases += [('hit','cog',['hot','dot','dog','lot','log','cog']),('hit','cog',['hot','dot','dog','lot','log']),('red','tax',['ted','tex','red','tax','tad','den','rex','pee']),('a','z',list('abcdefghijklmnopqrstuvwxyz'))]
script="const c=require('./core.js');let s='';process.stdin.on('data',x=>s+=x);process.stdin.on('end',()=>console.log(JSON.stringify(JSON.parse(s).map(([begin,end,words])=>c.trace({begin,end,words})))));"
traces=json.loads(subprocess.check_output(['node','-e',script],input=json.dumps(cases).encode(),cwd=ROOT))
for (b,e,ws),frames in zip(cases,traces):
    original=ws[:];expected=oracle(b,e,ws);actual=m.Solution().findLadders(b,e,ws)
    assert sorted(actual)==expected,(b,e,ws,actual,expected)
    assert ws==original
    last=frames[-1];assert sorted(last.get('answer',[]))==expected
    ds=distances(b,ws);previous={}
    for frame in frames:
        for w,d in frame['dist'].items():assert ds[w]==d
        for w,ps in frame['parents'].items():
            assert len(ps)==len(set(ps))
            for parent in ps:assert adjacent(w,parent) and frame['dist'][parent]+1==frame['dist'][w]
        for w,ps in previous.items():assert set(ps)<=set(frame['parents'][w])
        previous=frame['parents']
    if e in last['dist'] and e in ws:
        for w,d in last['dist'].items():
            if w==b:continue
            # Every parent below the stop depth is complete at termination.
            expected_ps={u for u,ud in ds.items() if ud+1==d and adjacent(u,w)}
            assert set(last['parents'][w])==expected_ps
# Maximum dictionary size/word width: one direct edge plus unrelated words.
ws=['aaaab']+['zz'+''.join(x) for x in itertools.islice(itertools.product('abcdefghijklmnop',repeat=3),499)]
assert m.Solution().findLadders('aaaaa','aaaab',ws)==[['aaaaa','aaaab']]
# A five-dimensional cube has exactly 5! shortest routes; every coordinate order.
ws=[''.join(x) for x in itertools.product('ab',repeat=5)]
a=m.Solution().findLadders('aaaaa','bbbbb',ws)
assert len(a)==120 and len({tuple(p) for p in a})==120 and all(len(p)==6 for p in a)
baseline_source=html.unescape(re.search(r'<code>(from collections import deque.*?)</code>',(ROOT/'index.html').read_text(),re.S).group(1));namespace={};exec(baseline_source,namespace)
for b,e,ws in cases[:40]+cases[-4:]:assert sorted(namespace['baseline'](b,e,ws))==oracle(b,e,ws)
source=(ROOT/'solution.py').read_text();mirror=(ROOT/'python-code.js').read_text();assert mirror=='window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
report={'status':'pass','oracle_cases':len(cases),'trace_invariants':'shortest distances, legal increasing edges, no duplicate parents, monotonic retention, complete terminal parent sets','boundaries':['official examples','listed start','absent end','unreachable end','one-letter words','500 dictionary words / width 5','5-cube 120 paths'],'source_mirror':'exact','seed':126}
(OUT/'numerical.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
