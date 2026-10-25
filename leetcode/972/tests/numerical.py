"""Run from any directory; OUTPUT_DIR keeps reviewer results separate."""
import importlib.util, pathlib, os, re, random, json, itertools
from fractions import Fraction
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = pathlib.Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('canonical', ROOT / 'solution.py')
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
solution = mod.Solution()

def oracle(s):
    # Independent whole-prefix subtraction, rather than adding separate tails.
    hit = re.fullmatch(r'(\d+)(?:\.(\d*)(?:\((\d+)\))?)?', s)
    i, a, b = hit.groups(); a = a or ''
    if b is None:
        return Fraction(int(i+a), 10**len(a))
    return Fraction(int(i+a+b)-int(i+a), 10**(len(a)+len(b))-10**len(a))

small = []
for i in range(3):
    small += [str(i), str(i)+'.']
    for a in ['', '0', '1', '2', '00', '01', '12']:
        small += [f'{i}.{a}']
        for b in ['0', '1', '2', '9', '00', '01', '12', '99']:
            small += [f'{i}.{a}({b})']
small = sorted(set(small)); count=0
for a,b in itertools.product(small,repeat=2):
    assert solution.isRationalEqual(a,b) == (oracle(a)==oracle(b)), (a,b)
    count+=1
rng=random.Random(972)
def rand():
    i=str(rng.randrange(10000));a=''.join(str(rng.randrange(10)) for _ in range(rng.randrange(5)))
    b=''.join(str(rng.randrange(10)) for _ in range(rng.randrange(1,5)))
    return rng.choice([i,i+'.'+a,i+'.'+a+'('+b+')'])
fixtures=[]
for _ in range(2000):
    a,b=rand(),rand()
    assert solution.isRationalEqual(a,b)==(oracle(a)==oracle(b))
    fixtures.extend([{'s':s,'exact':str(oracle(s).numerator)+'/'+str(oracle(s).denominator)} for s in [a,b]])
checks=[('0.(52)','0.5(25)',True),('0.1666(6)','0.166(66)',True),('0.9(9)','1.',True),('1','1.',True),('0.(06)','0.(6)',False),('0.25(0)','0.25',True),('0.0000(1)','0',False),('9999.9999(9999)','10000',True),('9999.9999(9999)','9999.9999',False),('0.12(9)','0.13',True)]
# 10000 is an expected-value comparison outside the official integer-length bound.
for a,b,e in checks:
    assert solution.isRationalEqual(a,b)==e
for row in fixtures:
    s=row['s'];i,a,b=re.fullmatch(r'(\d+)(?:\.(\d*)(?:\((\d+)\))?)?',s).groups();a=a or '';b=b or '0';x=oracle(s)
    for n in range(5):
        prefix=Fraction(int(i+a+b*n),10**(len(a)+len(b)*n))
        tail=Fraction(int(b),10**(len(a)+len(b)*n)*(10**len(b)-1))
        assert prefix<=x and prefix+tail==x
(OUT/'fixtures.json').write_text(json.dumps(fixtures))
report={'kind':'author self-check','exhaustiveStrings':len(small),'exhaustivePairs':count,'seed':972,'randomPairs':2000,'intermediatePrefixChecks':len(fixtures)*5,'boundaries':checks,'result':'pass'}
(OUT/'numerical.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
