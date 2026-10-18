import importlib.util,itertools,random,json,os,re,html
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('solution',ROOT/'solution.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
# Independent all-pairs graph, followed by repeated distance relaxation.
def oracle(begin,end,words):
    if end not in words:return 0
    nodes=list(dict.fromkeys([begin]+words));edges=[]
    for i,a in enumerate(nodes):
        for j,b in enumerate(nodes[:i]):
            if sum(x!=y for x,y in zip(a,b))==1:edges.append((i,j))
    dist=[float('inf')]*len(nodes);dist[0]=1
    for _ in nodes:
        old=dist[:]
        for i,j in edges:
            dist[i]=min(dist[i],old[j]+1);dist[j]=min(dist[j],old[i]+1)
        if old==dist:break
    d=dist[nodes.index(end)];return 0 if d==float('inf') else d
baseline_scope={}
exec(html.unescape(re.search(r'<code>(from collections.*?)</code>',(ROOT/'index.html').read_text(),re.S)[1]),baseline_scope)
count=0
sol=m.Solution()
def check(a,b,w,expected=None):
    global count
    old=w[:];
    if len(w)<30:assert baseline_scope['baseline'](a,b,w)==oracle(a,b,w)
    actual=sol.ladderLength(a,b,w);assert actual==(oracle(a,b,w) if expected is None else expected),(a,b,w,actual);assert old==w;count+=1
words=[''.join(x) for x in itertools.product('ab',repeat=3)]
for mask in range(1,1<<len(words)):
    w=[x for i,x in enumerate(words) if mask>>i&1]
    for a in words:
        for b in words:
            if a!=b:check(a,b,w)
rng=random.Random(127)
universe=[''.join(x) for x in itertools.product('abc',repeat=3)]
for _ in range(500):
    a,b=rng.sample(universe,2);check(a,b,rng.sample(universe,rng.randint(1,27)))
check('hit','cog',['hot','dot','dog','lot','log','cog'],5)
check('hit','cog',['hot','dot','dog','lot','log'],0)
check('a','c',['a','b','c'],2)
check('aaa','bbb',['aab','bbb'],0)
check('red','tax',['ted','tex','red','tax','tad','den','rex','pee'],4)
# Maximum dictionary size and width; terminal component is disconnected.
w=[''.join(x)+'a'*6 for x in itertools.islice(itertools.product('abcdefghij',repeat=4),4999)]+['z'*10]
check('a'*10,'z'*10,w,0)
source=(ROOT/'solution.py').read_text();mirror=(ROOT/'python-code.js').read_text();assert json.loads(mirror.split('=',1)[1].strip().rstrip(';'))==source
out=Path(os.getenv('OUT_DIR',ROOT/'tests/evidence'));out.mkdir(parents=True,exist_ok=True);(out/'python.json').write_text(json.dumps({'status':'pass','cases':count,'oracle':'all-pairs edges and repeated distance relaxation','seed':127,'maximum':'5000 words, width 10','inputMutation':False},indent=2));print(count,'Python cases passed')
