import importlib.util,itertools,random,json,os, pathlib,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
def load(path):
 s=importlib.util.spec_from_file_location('m',path);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
solve=load(ROOT/'solution.py').Solution().shortestSubarray
baseline=load(ROOT/'tests/baseline.py').baseline
def oracle(a,k):
 lengths=[r-l for l in range(len(a)) for r in range(l+1,len(a)+1) if sum(a[l:r])>=k]
 return min(lengths,default=-1)
cases=[([1],1),([1,2],4),([2,-1,2],3),([1,-1,3],3),([3,-2,5],5),([84,-37,32,40,95],167)]
for n in range(1,7):
 for a in itertools.product([-2,0,2],repeat=n):
  for k in [1,2,3,5]:cases.append((list(a),k))
rng=random.Random(862)
for _ in range(1200):cases.append(([rng.randint(-30,30) for _ in range(rng.randint(1,28))],rng.randint(1,100)))
for a,k in cases:
 before=a[:];expected=oracle(a,k);assert solve(a,k)==expected,(a,k);assert baseline(a,k)==expected;assert a==before
for a,k,answer in [([100000]*100000,10**9,10000),([-100000]*100000,1,-1),([0]*99999+[1],1,1),([1]*100000,100000,100000)]:assert solve(a,k)==answer
# Cross-language intermediate snapshots checked against independent enumeration.
small=cases[:500]+cases[-1200:]
p=subprocess.run(['node',str(ROOT/'tests/trace.cjs')],input=json.dumps(small),text=True,capture_output=True,check=True);trace=json.loads(p.stdout)
for (a,k),m in zip(small,trace):
 p=[sum(a[:j]) for j in range(len(a)+1)];assert p==m['p'];previous=None
 for f in m['frames']:
  q=f['q'];assert q==sorted(set(q));assert all(p[q[i]]<p[q[i+1]] for i in range(len(q)-1))
  if f['pair']:
   l,r=f['pair'];assert r-l==f['best'] and sum(a[l:r])>=k
  if f['kind']=='front':assert p[f['j']]-p[f['i']]>=k
  if f['kind']=='back':assert f['j']>f['i'] and p[f['j']]<=p[f['i']]
  if f['kind']=='append':
   j=f['j'];assert q[-1]==j;assert all(p[j]-p[i]<k for i in q)
   expected=oracle(a[:j],k);assert (f['best'] if f['best'] is not None else -1)==expected
  previous=f
 assert (m['frames'][-1]['best'] or -1)==oracle(a,k)
source=(ROOT/'solution.py').read_text();mirror=(ROOT/'python-code.js').read_text();assert json.loads(mirror.split(' = ',1)[1][:-2])==source
(OUT/'algorithm-results.json').write_text(json.dumps({'result':'pass','kind':'author self-check','smallCases':len(cases),'traceCases':len(small),'largeBoundaryCases':4,'oracle':'enumerate slices and sum independently','seed':862},indent=2))
print('PASS',len(cases),'small cases,',len(small),'intermediate traces, 4 size-100000 boundaries')
