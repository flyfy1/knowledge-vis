import importlib.util,itertools,json,os,random,subprocess,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',ROOT/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);solve=mod.Solution().strongPasswordChecker
subprocess.run(['g++','-O2','-std=c++17',str(ROOT/'tests/oracle.cpp'),'-o',str(OUT/'oracle')],check=True)
rng=random.Random(420)
cases=['zzzzQQQQQQQQ'+'bC7'*4,'a','aA1','1337C0d3','aaaB1','a'*21,'!'*50,'a'*20,'a'*6,'aaaaaaaBBB'+'aB0aB0aB0aB','zzzQQQQ'+'bC7'*5]
cases+=[''.join(t) for n in range(1,7) for t in itertools.product('aA0',repeat=n)]
cases+=[''.join(rng.choice('aA0.!') for _ in range(rng.randint(1,50))) for _ in range(80)]
cases+=[('a'*a+'B'*b+'0'*c)[:50] for a,b,c in [tuple(rng.randint(1,23) for _ in range(3)) for _ in range(80)]]
result=subprocess.run([str(OUT/'oracle')],input='\n'.join(cases)+'\n',text=True,capture_output=True,check=True)
(OUT/'oracle').unlink()
expected=list(map(int,result.stdout.split()));assert len(expected)==len(cases)
for s,want in zip(cases,expected):assert solve(s)==want,(s,solve(s),want)
(OUT/'oracle-cases.json').write_text(json.dumps(list(zip(cases,expected))))
assert [solve(s) for s in ['a','aA1','1337C0d3','aaaB1','a'*21,'!'*50]]==[5,3,0,1,7,36]
source=(ROOT/'solution.py').read_text();mirror=(ROOT/'python-code.js').read_text();assert mirror=='window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
# Exhaust all run deletion allocations and compare the greedy intermediate bound.
def opt(lengths,budget):
 dp=[0]+[999]*budget
 for L in lengths:
  nxt=[999]*(budget+1)
  for spent in range(budget+1):
   for d in range(min(L,budget-spent)+1):nxt[spent+d]=min(nxt[spent+d],dp[spent]+(L-d)//3)
  dp=nxt
 return dp[budget]
allocations=0
for lengths in itertools.product(range(1,9),repeat=3):
 for budget in range(min(sum(lengths),8)+1):
  ls=list(lengths);left=budget
  while left:
   candidates=[(L%3+1,i) for i,L in enumerate(ls) if L>=3]
   if not candidates:break
   cost,i=min(candidates)
   if cost>left:break
   ls[i]-=cost;left-=cost
  assert sum(L//3 for L in ls)==opt(lengths,budget),(lengths,budget)
  allocations+=1
report={'kind':'author self-check; independent algorithm oracle, not independent review','canonicalCases':len(cases),'exhaustiveDomain':'all strings over aA0 of length 1..6','seed':420,'allocationChecks':allocations,'oracle':'edit-distance DP over input position, output length, last character, run count, class mask; enumerates insert/delete/replace/keep','alphabet':'input symbols plus abAB01.!; two interchangeable representatives per class suffice for new adjacent outputs','sourceParity':True,'sha256':hashlib.sha256(source.encode()).hexdigest()}
(OUT/'solution-results.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
# Execute the displayed Python baseline too; C++ oracle supplies broad coverage.
bspec=importlib.util.spec_from_file_location('baseline',ROOT/'tests/baseline.py');bmod=importlib.util.module_from_spec(bspec);bspec.loader.exec_module(bmod)
for s in ['a','aaaB1','aA1','aaaaaaaBBB'+'aB0aB0aB0aB','!'*50]:assert bmod.baseline(s)==solve(s)
from html.parser import HTMLParser
class Code(HTMLParser):
 def __init__(self):super().__init__();self.active=False;self.items=[];self.current=''
 def handle_starttag(self,tag,attrs):
  if tag=='code':self.active=True;self.current=''
 def handle_data(self,data):
  if self.active:self.current+=data
 def handle_endtag(self,tag):
  if tag=='code':self.items.append(self.current);self.active=False
parser=Code();parser.feed((ROOT/'index.html').read_text());assert (ROOT/'tests/baseline.py').read_text() in parser.items
# Reject duplicate localization keys before JSON decoding can overwrite one.
def unique(pairs):
 d={}
 for k,v in pairs:
  assert k not in d,('duplicate localization key',k)
  assert isinstance(v,list) and len(v)==2 and all(isinstance(x,str) and x for x in v)
  d[k]=v
 return d
raw=(ROOT/'copy.js').read_text();copy=json.loads(raw[raw.index('{'):raw.rindex('}')+1],object_pairs_hook=unique)
report.update(displayedPythonBaselineCases=5,baselineSourceParity=True,uniqueBilingualKeys=len(copy))
(OUT/'solution-results.json').write_text(json.dumps(report,indent=2)+'\n')
