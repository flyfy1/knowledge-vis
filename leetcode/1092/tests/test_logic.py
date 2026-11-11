"""Run: python3 -B leetcode/1092/tests/test_logic.py; OUTPUT_DIR redirects evidence."""
import importlib.util, itertools, json, os, random, re, hashlib
from pathlib import Path
from datetime import datetime, timezone
ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('solution', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
solve = module.Solution().shortestCommonSupersequence

def sub(a, b):
    it = iter(b)
    return all(any(y == x for y in it) for x in a)

def bfs_oracle(a, b):
    # Enumerate output strings by increasing length; independent of suffix DP.
    alphabet = sorted(set(a+b))
    for length in range(max(len(a), len(b)), len(a)+len(b)+1):
        for chars in itertools.product(alphabet, repeat=length):
            s = ''.join(chars)
            if sub(a, s) and sub(b, s):
                return length

def lcs_oracle(a, b):
    # Prefix LCS counts reusable matches, not a supersequence recurrence.
    row = [0]*(len(b)+1)
    for x in a:
        old = row[:]
        for j, y in enumerate(b, 1):
            row[j] = old[j-1]+1 if x == y else max(old[j], row[j-1])
    return len(a)+len(b)-row[-1]

strings = [''.join(x) for n in range(1, 5) for x in itertools.product('ab', repeat=n)]
count = 0
for a in strings:
    for b in strings:
        s = solve(a, b)
        assert sub(a,s) and sub(b,s) and len(s) == bfs_oracle(a,b), (a,b,s)
        count += 1
rng = random.Random(1092)
cases = [('abac','cab',5),('aaaaaaaa','aaaaaaaa',8),('aab','baa',4),('aba','bab',4),('a'*1000,'a'*1000,1000),('a'*1000,'b'*1000,2000),('','abc',3),('','',0)]
for _ in range(160):
    a = ''.join(rng.choices('abcd',k=rng.randint(1,60)))
    b = ''.join(rng.choices('abcd',k=rng.randint(1,60)))
    cases.append((a,b,lcs_oracle(a,b)))
for a,b,n in cases:
    result = solve(a,b)
    assert len(result)==n and sub(a,result) and sub(b,result)
# Execute the exact displayed baseline, not a substitute.
html=(ROOT/'index.html').read_text()
base = re.search(r'<code>(def minimum_length.*?)</code>',html,re.S).group(1)
ns={}; exec(base, ns)
for a,b,_ in cases[:4]: assert ns['minimum_length'](a,b)==bfs_oracle(a,b)
source=(ROOT/'solution.py').read_text()
mirror=(ROOT/'python-code.js').read_text()
assert mirror == 'window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
copy=(ROOT/'copy.js').read_text()
keys=re.findall(r'\b([A-Za-z][A-Za-z0-9]*)\s*:\s*\[',copy,re.M)
assert len(keys)==len(set(keys)), 'duplicate localization keys'
report={'scope':'author self-check; independent review pending','exhaustive_binary_pairs':count,'official_seeded_boundary_cases':len(cases),'baseline_executed':True,'source_mirror_exact':True,'duplicate_keys':False,'timestamp':datetime.now(timezone.utc).isoformat()}
(OUT/'logic.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
