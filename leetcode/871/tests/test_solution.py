"""Independent stop-count DP + exhaustive subset oracle; no third party modules."""
import importlib.util,itertools,random,json,os,pathlib,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('submission',ROOT/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
solve=mod.Solution().minRefuelStops

def dp(target,start,stations):
    far=[start]+[-1]*len(stations)
    for i,(p,f) in enumerate(stations):
        for k in range(i,-1,-1):
            if far[k]>=p:far[k+1]=max(far[k+1],far[k]+f)
    return next((k for k,r in enumerate(far) if r>=target),-1)

def subsets(target,start,stations):
    best=len(stations)+1
    for bits in itertools.product([0,1],repeat=len(stations)):
        tank=start;last=0;valid=True
        for chosen,(p,f) in zip(bits,stations):
            if chosen:
                tank-=p-last;last=p
                if tank<0:valid=False;break
                tank+=f
        if valid and tank>=target-last:best=min(best,sum(bits))
    return best if best<=len(stations) else -1

# Execute the actual baseline displayed by index.html, not a retyped stand-in.
from html.parser import HTMLParser
class CodeParser(HTMLParser):
    def __init__(self):super().__init__();self.on=False;self.codes=[]
    def handle_starttag(self,tag,attrs):
        if tag=='code':self.on=True;self.codes.append('')
    def handle_endtag(self,tag):
        if tag=='code':self.on=False
    def handle_data(self,data):
        if self.on:self.codes[-1]+=data
parser=CodeParser();parser.feed((ROOT/'index.html').read_text());namespace={};exec(parser.codes[0],namespace)
displayed_baseline=namespace['baseline']
cases=[]
for target in range(1,8):
 for start in range(1,9):
  for n in range(min(3,target-1)+1):
   for ps in itertools.combinations(range(1,target),n):
    for fs in itertools.product([1,2,5],repeat=n):cases.append([target,start,list(map(list,zip(ps,fs)))])
rng=random.Random(871)
for _ in range(1500):
 target=rng.randint(2,150);n=rng.randint(0,min(9,target-1));ps=sorted(rng.sample(range(1,target),n));cases.append([target,rng.randint(1,80),[[p,rng.randint(1,70)] for p in ps]])
fixed=[(1,1,[],0),(100,1,[[10,100]],-1),(100,10,[[10,60],[20,30],[30,30],[60,40]],2),(75,25,[[10,10],[25,30],[50,20]],2),(10**9,10**9,[],0),(10**9,1,[[i,1] for i in range(1,501)],-1),(501,1,[[i,1] for i in range(1,501)],500),(10**9,1,[[1,999999999]],1)]
for t,s,st in cases:
 original=[x[:] for x in st];a=solve(t,s,st);b=dp(t,s,st);c=subsets(t,s,st)
 assert a==b==c==displayed_baseline(t,s,st),(t,s,st,a,b,c)
 assert st==original
for t,s,st,expected in fixed:assert solve(t,s,st)==dp(t,s,st)==expected
# Cross-language simulation consumes independent expected results, including every intermediate state.
fixtures=[{'target':t,'startFuel':s,'stations':st,'expected':dp(t,s,st)} for t,s,st in cases]
(OUT/'oracle-fixtures.json').write_text(json.dumps(fixtures))
print(json.dumps({'exhaustive_and_seeded':len(cases),'fixed_and_maximum':len(fixed),'result':'pass'}))
(OUT/'python-result.json').write_text(json.dumps({'cases':len(cases),'fixed':len(fixed),'result':'pass'},indent=2))
