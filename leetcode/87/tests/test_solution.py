"""Independent small-string generation oracle; run with python3 tests/test_solution.py.
Evidence location: OUTPUT_DIR (defaults to tests/evidence).
"""
import os,json,itertools,random,sys,importlib.util
from pathlib import Path
from functools import cache
sys.dont_write_bytecode = True
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR', ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution87',ROOT/'solution.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
@cache
def outcomes(s):
    if len(s)==1:return frozenset([s])
    result=set()
    for k in range(1,len(s)):
        for left in outcomes(s[:k]):
            for right in outcomes(s[k:]):
                result.update([left+right,right+left])
    return frozenset(result)
count=0
for n in range(1,7):
    words=[''.join(x) for x in itertools.product('ab',repeat=n)]
    for a in words:
        expected=outcomes(a)
        for b in words:
            assert m.Solution().isScramble(a,b)==(b in expected),(a,b)
            count+=1
rng=random.Random(87);intermediate=0
for trial in range(350):
    n=rng.randint(1,8);a=''.join(rng.choices('abc',k=n));b=''.join(rng.choices('abc',k=n))
    if trial%2==0:b=''.join(rng.sample(a,len(a)))
    captured={}
    def profile(frame,event,arg):
        if event=='return' and frame.f_code.co_name=='isScramble':captured.update(frame.f_locals)
    sys.setprofile(profile)
    try:result=m.Solution().isScramble(a,b)
    finally:sys.setprofile(None)
    assert result==(b in outcomes(a)),(a,b)
    dp=captured['dp']
    for length in range(1,n+1):
        for i in range(n-length+1):
            for j in range(n-length+1):
                assert dp[length][i][j]==(b[j:j+length] in outcomes(a[i:i+length]))
                intermediate+=1
for a,b,want in [('great','rgeat',True),('abcde','caebd',False),('a','a',True),('a','b',False),('aab','aba',True),('abcd','badc',True),('abcd','bdac',False),('a'*30,'a'*30,True),('a'*30,'a'*29+'b',False),('abcdefghijklmnopqrstuvwxyzabcd','dcbazyxwvutsrqponmlkjihgfedcba',True)]:
    assert m.Solution().isScramble(a,b)==want,(a,b,want)
# Source mirror is one exact assignment, without helper logic.
src=(ROOT/'solution.py').read_text();mirror=(ROOT/'python-code.js').read_text()
assert mirror=='window.PYTHON_SOURCE = '+json.dumps(src)+';\n'
entry=json.loads((ROOT/'lesson-entry.json').read_text())
assert entry['id']==87 and entry['language']=='Python' and entry['path']=='87/'
assert isinstance(entry['complexity'],str) and entry['complexity'].strip()
assert all(not entry['title'][lang].startswith('#') for lang in ['zh','en'])
for concept in entry['concepts']:
    assert isinstance(concept['step'],int)
    assert 'id="step'+str(concept['step'])+'"' in (ROOT/'index.html').read_text()
report={'type':'author self-check','exhaustive_binary_pairs_lengths_1_to_6':count,'seeded_cases':350,'seed':87,'intermediate_cells':intermediate,'official_examples':3,'maximum_n':30,'source_parity':True}
(OUT/'python-results.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
