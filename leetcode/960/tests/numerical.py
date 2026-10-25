import importlib.util,itertools,random,json,os,pathlib,ast
root=pathlib.Path(__file__).resolve().parents[1]
out=pathlib.Path(os.environ.get('OUTPUT_DIR',root/'tests/evidence'));out.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',root/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
solve=mod.Solution().minDeletionSize
# Independent enumeration: build resulting strings and compare them with sorted copies.
def oracle(rows):
 m=len(rows[0]);best=0;ending=[0]*m
 for flags in itertools.product((False,True),repeat=m):
  kept=[i for i,b in enumerate(flags) if b]
  words=[''.join(row[i] for i in kept) for row in rows]
  if all(w==''.join(sorted(w)) for w in words):
   best=max(best,len(kept))
   if kept:ending[kept[-1]]=max(ending[kept[-1]],len(kept))
 return m-best,ending
baseline_source=(root/'index.html').read_text().split('<pre tabindex="0"><code>',1)[1].split('</code></pre>',1)[0]
baseline_namespace={}
exec(baseline_source,baseline_namespace)
count=0
for n,m in [(1,m) for m in range(1,9)]+[(2,m) for m in range(1,6)]+[(3,m) for m in range(1,5)]:
 for chars in itertools.product('ab',repeat=n*m):
  rows=[''.join(chars[r*m:(r+1)*m]) for r in range(n)];saved=rows[:]
  assert solve(rows)==oracle(rows)[0],rows
  assert rows==saved;count+=1
rng=random.Random(960)
for _ in range(500):
 n=rng.randrange(1,6);m=rng.randrange(1,10);rows=[''.join(rng.choices('abcd',k=m)) for _ in range(n)]
 assert solve(rows)==oracle(rows)[0];assert baseline_namespace['baseline'](rows)==oracle(rows)[0];count+=1
for rows,expected in [(['babca','bbazb'],3),(['edcba'],4),(['ghi','def','abc'],0),(['azbc','abcd'],1),(['abc','cba'],2),(['z']*100,0),(['a'*100]*100,0),(['zyxwvutsrqponmlkjihgfedcba'],25),(['abcdefghijklmnopqrstuvwxyz'*3]*100,50)]:
 assert solve(rows)==expected,(rows,expected,solve(rows));count+=1
# A length-100 nonincreasing row: only its largest equal-character run can remain.
row=''.join(c*4 for c in 'zyxwvutsrqponmlkjihgfedcba')[:100]
assert solve([row]*100)==96;count+=1
# Reject duplicate dictionary keys before Python/JS parsers can overwrite them.
copy=(root/'copy.js').read_text().split('window.COPY = ',1)[1].rstrip().removesuffix(';')
def unique(pairs):
 d={}
 for k,v in pairs:
  assert k not in d,k;d[k]=v
 return d
pairs=json.loads(copy,object_pairs_hook=unique);assert all(isinstance(v,list) and len(v)==2 and all(isinstance(x,str) and x for x in v) for v in pairs.values())
mirror=(root/'python-code.js').read_text();assert json.loads(mirror.split(' = ',1)[1].rstrip().removesuffix(';'))==(root/'solution.py').read_text()
report={'kind':'author numerical self-check','cases':count,'exhaustive':'binary matrices n=1,m<=8; n=2,m<=5; n=3,m<=4','seed':960,'randomCases':500,'baselineCode':'executed on 500 seeded cases','officialExamples':'pass','maxBounds':'pass','mutation':'unchanged','copyKeys':len(pairs),'mirror':'exact'}
(out/'numerical.json').write_text(json.dumps(report,indent=2)+'\n');print(report)
