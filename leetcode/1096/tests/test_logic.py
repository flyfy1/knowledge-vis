import importlib.util, json, os, random, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT/'tests/evidence')); OUT.mkdir(parents=True, exist_ok=True)
sys.dont_write_bytecode = True
sys.path.insert(0,str(ROOT)); sys.path.insert(0,str(ROOT/'tests'))
from solution import Solution
from oracle import baseline

def unique_pairs(pairs):
    d={}
    for k,v in pairs:
        assert k not in d, k
        d[k]=v
    return d
copy=json.loads((ROOT/'copy.js').read_text().removeprefix('window.LESSON_COPY = ').rstrip().removesuffix(';'),object_pairs_hook=unique_pairs)
assert all(isinstance(v,list) and len(v)==2 and all(isinstance(s,str) and s for s in v) for v in copy.values())
source=(ROOT/'solution.py').read_text();mirror=json.loads((ROOT/'python-code.js').read_text().removeprefix('window.PYTHON_SOURCE = ').rstrip().removesuffix(';'))
assert source==mirror
# Exhaust every syntactically generated string <=8 characters over a,b.
bylen={1:{'a','b'}}
for size in range(2,9):
    items=set()
    for a in range(1,size):
        b=size-a
        for x in bylen.get(a,[]):
            for y in bylen.get(b,[]):items.add(x+y)
    for a in range(1,size-3):
        b=size-3-a
        for x in bylen.get(a,[]):
            for y in bylen.get(b,[]):items.add('{'+x+','+y+'}')
    bylen[size]=items
small=sorted(set().union(*bylen.values()))
rng=random.Random(1096)
def gen(depth=0):
    if depth>=4 or rng.random()<.4:return rng.choice('abc')
    if rng.random()<.5:return gen(depth+1)+gen(depth+1)
    return '{'+gen(depth+1)+','+gen(depth+1)+'}'
randoms=[]
while len(randoms)<700:
    s=gen()
    if len(s)<=60:randoms.append(s)
explicit={
    '{a,b}{c,{d,e}}':['ac','ad','ae','bc','bd','be'],
    '{{a,z},a{b,c},{ab,z}}':['a','ab','ac','z'],
    'a{b,c}':['ab','ac'], '{a,a}{b,c}':['ab','ac'],
    'z':['z'],'abc':['abc'],'{{a,b},c}d':['ad','bd','cd'],
    'x{a,{a,b}}y':['xay','xby'],'{a,b}c':['ac','bc'],
    'a'*60:['a'*60],
}
s='a'
for _ in range(14):s='{'+s+',a}'
explicit['zzz'+s]=['zzza'];assert len('zzz'+s)==60
s='{a,b}'*12
expected=['']
for _ in range(12):expected=[x+y for x in expected for y in 'ab']
explicit[s]=expected;assert len(s)==60
cases=[]
for s in small+randoms+list(explicit):
    expected=baseline(s)
    if s in explicit:assert expected==explicit[s],s
    got=Solution().braceExpansionII(s)
    assert got==expected,(s,got,expected)
    cases.append({'expression':s,'expected':expected})
(OUT/'cases.json').write_text(json.dumps(cases)+'\n')
report={'scope':'author self-check only; independent review pending','passed':True,'exhaustive':len(small),'seeded':len(randoms),'explicit':len(explicit),'total':len(cases),'sourceMirrorExact':True,'copyUniqueKeysAndPairs':True,'maxLength':60,'largestExplicitOutput':4096}
(OUT/'logic-results.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
