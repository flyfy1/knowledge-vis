"""Run from any directory. OUTPUT_DIR redirects every generated artifact."""
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import re
import subprocess
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
sys.path.insert(0, str(ROOT))
from solution import Solution
from baseline import baseline

rng = random.Random(770)
cases = [
 ('e + 8 - a + 5', ['e'], [1], ['-1*a', '14']),
 ('e - 8 + temperature - pressure', ['e','temperature'], [1,12], ['-1*pressure','5']),
 ('(e + 8) * (e - 8)', [], [], ['1*e*e','-64']),
 ('0', [], [], []), ('a - a', [], [], []),
 ('b * a + a * b - a * a * b', [], [], ['-1*a*a*b','2*a*b']),
 ('1 + 2 * 3', [], [], ['7']), ('8 - 3 - 2', [], [], ['3']),
 ('a - b * c', [], [], ['-1*b*c','1*a']),
 ('a * a + b * b + a * b', ['a'], [-100], ['1*b*b','-100*b','10000']),
 ('(a - a) * (b + c)', [], [], []),
 ('(x + y) * (x - y) + y * x', [], [], ['1*x*x','1*x*y','-1*y*y']),
 (' + '.join(['a']*63), [], [], ['63*a']),
 ('('*124+'ab'+')'*124, [], [], ['1*ab']),
 ('a'*250, [], [], ['1*'+'a'*250]),
 ('a + b', ['a','b'], [100,-100], []),
]
# Exhaustive ordered small grammar: two binary operators, both tree shapes.
for a,b,c in itertools.product(['0','1','a','b'], repeat=3):
 for op,oq in itertools.product(['+','-','*'], repeat=2):
  for s in [f'({a} {op} {b}) {oq} {c}',f'{a} {op} ({b} {oq} {c})']:
   cases.append((s, [], [], None))
def expression(depth):
 if depth == 0 or rng.random()<.25: return rng.choice(['0','1','2','3','a','b','temperature'])
 return '('+expression(depth-1)+' '+rng.choice(['+','-','*'])+' '+expression(depth-1)+')'
for i in range(400):
 s=expression(3)
 names=rng.sample(['a','b','temperature'],rng.randrange(4))
 cases.append((s,names,[rng.choice([-2,-1,0,1,2]) for _ in names],None))
# A complete 100-entry substitution list, with irrelevant names allowed.
names=['v'+chr(97+i//26)+chr(97+i%26) for i in range(100)]
cases.append(('vaa + vdv',names,list(range(-50,50)),None))
solution = Solution()
fixtures=[]
for s,names,values,known in cases:
 original_names,original_values=names[:],values[:]
 expected=baseline(s,names,values)
 if known is not None: assert expected==known,(s,expected,known)
 actual=solution.basicCalculatorIV(s,names,values)
 assert actual==expected,(s,actual,expected)
 assert names==original_names and values==original_values
 # Independent numeric semantics: eval uses arithmetic directly, not polynomial rules.
 for trial in range(2):
  env={k:rng.randrange(-2,3) for k in re.findall('[a-z]+',s)}
  env.update(zip(names,values))
  assert eval(s,{'__builtins__':{}},env)==sum(eval(term,{'__builtins__':{}},env) for term in actual)
 fixtures.append({'expression':s,'values':dict(zip(names,values)),'expected':expected})
# Execute the exact browser core in Node, retaining intermediate snapshots.
script="const C=require(process.argv[1]);let s='';process.stdin.on('data',x=>s+=x);process.stdin.on('end',()=>process.stdout.write(JSON.stringify(JSON.parse(s).map(x=>C.trace(x)))));"
r=subprocess.run(['node','-e',script,str(ROOT/'core.js')],input=json.dumps(fixtures),capture_output=True,text=True,check=True)
traces=json.loads(r.stdout)
frames_checked=0
for fixture,tr in zip(fixtures,traces):
 assert tr['output']==fixture['expected']
 for frame in tr['frames'][1:]:
  s=' '.join(tr['tokens'][frame['start']:frame['end']])
  expected=baseline(s,list(fixture['values']),list(fixture['values'].values()))
  rows=frame['result']
  assert all(k==sorted(k) and c!=0 for k,c in rows)
  assert len({tuple(k) for k,c in rows})==len(rows)
  actual=['*'.join([str(c)]+k) for k,c in sorted(rows,key=lambda x:(-len(x[0]),x[0]))]
  assert actual==expected,(s,actual,expected)
  if frame['operator']=='*':
   assert len(frame['pairs'])==len(frame['left'])*len(frame['right'])
   assert all(p['c']==p['ca']*p['cb'] and p['key']==sorted(p['a']+p['b']) for p in frame['pairs'])
  frames_checked+=1
for src,mirror,var in [('solution.py','python-code.js','PYTHON_SOURCE'),('baseline.py','baseline-code.js','BASELINE_SOURCE')]:
 text=(ROOT/mirror).read_text(); m=re.fullmatch(r'window\.'+var+r' = ("(?:[^"\\]|\\.)*");\n',text)
 assert m and json.loads(m[1])==(ROOT/src).read_bytes().decode()
(OUT/'oracle-fixtures.json').write_text(json.dumps(fixtures,ensure_ascii=False,indent=2))
report={'kind':'author self-check','pythonCases':len(cases),'numericAssignments':len(cases)*2,'javascriptTraceCases':len(traces),'intermediateInvariantFrames':frames_checked,'seed':770,'oracle':'independent Python AST raw list expansion, plus direct numeric eval','officialExamples':3,'sourceMirrorParity':'exact','maximumExpressionLength':max(len(x[0]) for x in cases),'result':'pass'}
(OUT/'algorithm-results.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report))
