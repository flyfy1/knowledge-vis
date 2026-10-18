"""Author computational self-check; cut masks are independent of suffix DP."""
import importlib.util,itertools,json,os,random
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',ROOT/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
def oracle(s,words):
    if not s:return ['']
    out=[]
    for mask in range(2**(len(s)-1)):
        cuts=[0]+[i+1 for i in range(len(s)-1) if mask>>i&1]+[len(s)]
        parts=[s[a:b] for a,b in zip(cuts,cuts[1:])]
        if all(p in words for p in parts):out.append(' '.join(parts))
    return sorted(out)
count=0
fixtures=[]
def check(s,words):
    global count
    before=words.copy();actual=mod.Solution().wordBreak(s,words)
    assert len(set(actual))==len(actual)
    assert sorted(actual)==oracle(s,words),(s,words,actual)
    assert words==before
    count+=1
    fixtures.append({'s':s,'words':words,'expected':sorted(actual),'suffixes':[oracle(s[i:],words) for i in range(len(s)+1)]})
for n in range(1,7):
    for chars in itertools.product('ab',repeat=n):
        s=''.join(chars)
        for bits in range(64):check(s,[w for i,w in enumerate(['a','b','aa','ab','ba','bb']) if bits>>i&1] or ['c'])
rng=random.Random(140)
for _ in range(350):
    s=''.join(rng.choices('abc',k=rng.randint(1,11)))
    words=sorted(set(''.join(rng.choices('abc',k=rng.randint(1,5))) for _ in range(15)))
    check(s,words)
for s,words,expected in [
 ('catsanddog',['cat','cats','and','sand','dog'],['cat sand dog','cats and dog']),
 ('pineapplepenapple',['apple','pen','applepen','pine','pineapple'],['pine apple pen apple','pine applepen apple','pineapple pen apple']),
 ('catsandog',['cats','dog','sand','and','cat'],[]),
 ('abab',['ab','a','b','ba'],['a b a b','a b ab','a ba b','ab a b','ab ab']),
 ('a',['a'],['a']),('b',['a'],[]),('a'*20,['a'*10],['a'*10+' '+'a'*10]),
 ('b'+'a'*19,['a'],[])]:
    got=mod.Solution().wordBreak(s,words);assert sorted(got)==sorted(expected);count+=1
words=['a'*i for i in range(1,11)]
assert len(mod.Solution().wordBreak('a'*10,words))==512;count+=1
words=['a']+['z'+''.join(chr(97+(i//26**k)%26) for k in range(3)) for i in range(999)]
assert len(set(words))==1000
assert mod.Solution().wordBreak('a'*20,words)==[' '.join('a'*20)];count+=1
mirror=(ROOT/'python-code.js').read_text();assert json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').strip().removesuffix(';'))==(ROOT/'solution.py').read_text()
(OUT/'oracle-fixtures.json').write_text(json.dumps(fixtures))
(OUT/'python-results.json').write_text(json.dumps({'checks':count,'seed':140,'exhaustive':'binary strings length 1..6 × all 64 dictionaries of a,b,aa,ab,ba,bb (empty selection replaced with c)','maximum':'n=20; m=1000; word width=10; 512-output length-10 case','result':'pass'},indent=2))
print('Python oracle checks passed:',count)
