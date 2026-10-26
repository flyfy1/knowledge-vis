"""Focused author checks; no algorithm or prior evidence mutation."""
import hashlib, json, re, subprocess
from fractions import Fraction
from pathlib import Path
root=Path.cwd(); p=root/'leetcode/964'; out=p/'tests/evidence/normalization-r1'
def old(name):
    return subprocess.check_output(['git','show',f'HEAD:leetcode/964/{name}']).decode()
# The entire dictionary except the single proof pair must remain byte-identical.
before=old('copy.js'); after=(p/'copy.js').read_text()
pattern=r" proof:\[.*?\],\n"
a=re.search(pattern,before); b=re.search(pattern,after)
assert a and b and before[:a.start()]+before[a.end():]==after[:b.start()]+after[b.end():]
assert old('index.html').replace('src="copy.js"','src="copy.js?v=964-normalize-r1"')==(p/'index.html').read_text()
preserved=['app.js','core.js','solution.py','python-code.js','baseline.py','style.css','lesson-entry.json']
for name in preserved: assert old(name).encode()==(p/name).read_bytes(),name
# Rational left-associative division; no parentheses or unary minus in legal expressions.
assert Fraction(3)/3/3==Fraction(1,3)
assert sum([Fraction(3)/3/3]*3)==Fraction(3)/3==1
long='3/3/3 + 3/3/3 + 3/3/3'; short='3/3'
count=lambda s:sum(s.count(c) for c in '+-*/')
assert (count(long),count(short))==(8,1)
assert (count(long)+1,count(short)+1)==(9,2)
source=(p/'solution.py').read_bytes().decode()
mirror=(p/'python-code.js').read_text()
assert json.loads(re.fullmatch(r'window.PYTHON_SOURCE = (.*);\n',mirror)[1])==source
subprocess.run(['node',str(p/'tests/copy-check.cjs')],check=True)
ns={};exec(compile(source,'solution.py','exec'),ns)
assert [ns['Solution']().leastOpsExpressTarget(x,t) for x,t in [(3,19),(5,501),(100,100000000),(3,8),(4,15),(3,1)]]==[5,8,3,3,3,1]
official=json.loads((p/'provenance/official.json').read_text())
snippets=official['response']['data']['question']['codeSnippets']
assert any(s['langSlug']=='python3' and 'def leastOpsExpressTarget(self, x: int, target: int) -> int:' in s['code'] for s in snippets)
report={'kind':'author focused self-check','restrictedDiff':'proof pair and copy cache query only in runtime files','preserved':{name:hashlib.sha256((p/name).read_bytes()).hexdigest() for name in preserved},'value':'three thirds = 1','chargedCosts':[9,2],'standaloneOperatorCounts':[8,1],'exactMirror':True,'canonicalExecution':'six Python interface cases passed','language':'faithful official Python3 snippet preserved; nondefault language contract inapplicable','copyShapeAndUniqueKeys':'passed'}
(out/'checks.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
