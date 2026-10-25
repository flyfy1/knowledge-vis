import importlib.util,itertools,random,json,os,pathlib,collections
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',ROOT/'solution.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def oracle(s):
    return sum(sum(v==1 for v in collections.Counter(s[l:r+1]).values()) for l in range(len(s)) for r in range(l,len(s)))
cases=0
for n in range(1,9):
    for chars in itertools.product('ABC',repeat=n):
        s=''.join(chars);assert m.Solution().uniqueLetterString(s)==oracle(s),s;cases+=1
rng=random.Random(828)
for _ in range(500):
    s=''.join(rng.choice('ABCDE') for _ in range(rng.randint(1,35)));assert m.Solution().uniqueLetterString(s)==oracle(s);cases+=1
for s,expected in [('ABC',10),('ABA',8),('LEETCODE',92),('A',1),('A'*100000,100000),('AB'*50000,399996)]:
    assert m.Solution().uniqueLetterString(s)==expected,(len(s),expected)
# Detect duplicate keys before JSON parser could hide them; verify all localized pairs.
def pairs(items):
    d={}
    for k,v in items:
        assert k not in d,('duplicate copy key',k)
        d[k]=v
    return d
copy=json.loads((ROOT/'copy.js').read_text().split('=',1)[1].strip().removesuffix(';'),object_pairs_hook=pairs)
assert all(isinstance(v,list) and len(v)==2 and all(isinstance(x,str) and x for x in v) for v in copy.values())
source=(ROOT/'solution.py').read_text();mirror=json.loads((ROOT/'python-code.js').read_text().split('=',1)[1].strip().removesuffix(';'));assert source==mirror
result={'kind':'author computational self-check','result':'pass','exhaustive_and_seeded_cases':cases,'official_examples':3,'max_length_cases':2,'copy_keys':len(copy),'duplicate_keys':False,'source_mirror_exact':True,'oracle':'Independent Counter on every substring; no neighbor formula','max_alternating_expected':'end occurrences 2 each; other n-2 occurrences 4 each = 4n-4'}
(OUT/'python-results.json').write_text(json.dumps(result,indent=2)+'\n');print(result)
