import collections,importlib.util,itertools,json,os,pathlib,random,subprocess
P=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('OUTPUT_DIR',P/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',P/'solution.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
checks=0
fixtures=[]
def check(ops,fixture=False):
 global checks
 s=m.FreqStack();a=[];out=[];states=[]
 for op in ops:
  if op[0]=='push':s.push(op[1]);a.append(op[1])
  else:
   c=collections.Counter(a);f=max(c.values());i=next(i for i in range(len(a)-1,-1,-1) if c[a[i]]==f);v=a.pop(i)
   assert s.pop()==v;out.append(v)
  c=collections.Counter(a);groups={};seen=collections.Counter()
  for v in a:seen[v]+=1;groups.setdefault(seen[v],[]).append(v)
  assert {k:v for k,v in s.freq.items() if v}==dict(c)
  assert dict(s.group)==groups
  assert s.maxfreq==max(c.values(),default=0)
  if fixture:states.append({'remaining':a[:],'outputs':out[:],'maxfreq':s.maxfreq,'group':{str(k):v[:] for k,v in groups.items()},'freq':dict(c)})
  checks+=1
 if fixture:fixtures.append({'ops':ops,'states':states})
def paths(ops,n,size):
 check(ops, len(ops)==7)
 if n:
  for v in (0,1):paths(ops+[('push',v)],n-1,size+1)
  if size:paths(ops+[('pop',)],n-1,size-1)
paths([],7,0)
r=random.Random(895)
for _ in range(80):
 ops=[];size=0
 for j in range(100):
  if not size or r.random()<.6:ops.append(('push',r.choice([0,2,9,10**9])));size+=1
  else:ops.append(('pop',));size-=1
 check(ops,True)
check([('push',v) for v in [5,7,5,7,4,5]]+[('pop',)]*4,True)
# Closed-form maximum call cases avoid quadratic oracle work at scale.
for values in ([7]*10000,list(range(10000))):
 s=m.FreqStack()
 for v in values:s.push(v);checks+=1
 expected=list(reversed(values))
 assert [s.pop() for _ in values]==expected
 assert s.maxfreq==0 and not s.group
 checks+=len(values)
s=m.FreqStack()
for _ in range(20000):s.push(10**9)
assert s.maxfreq==20000 and len(s.group)==20000
checks+=20000
# Exact offline mirror, no whitespace normalization.
mirror=(P/'python-code.js').read_text();assert json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').strip().removesuffix(';'))==(P/'solution.py').read_text()
(OUT/'fixtures.json').write_text(json.dumps(fixtures))
result={'status':'pass','operationsChecked':checks,'fixtureSequences':len(fixtures),'scope':'author self-check; separate reviewer pending'}
(OUT/'python-results.json').write_text(json.dumps(result,indent=2));print(result)
