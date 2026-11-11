"""Independent gcd graph oracle; OUTPUT_DIR redirects every emitted artifact."""
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import sys
import time

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from solution import Solution
from baseline import baseline

out = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
out.mkdir(parents=True, exist_ok=True)
solve = Solution().largestComponentSize
count = 0

def check(a, expected=None):
    global count
    original = a[:]
    want = baseline(a) if expected is None else expected
    got = solve(a)
    assert got == want, (a, got, want)
    assert a == original
    count += 1
    return want

cases = [([4,6,15,35],4),([20,50,9,63],2),([2,3,6,7,4,12,21,39],8),([1],1),([6,10,15],3),([1,2,3,5],1),([49,77,121],3),([99991],1),([1,99991],1),([14,25,35,11],3)]
for a, expected in cases:
    check(a, expected)
for length in range(1,15):
    for comb in itertools.combinations(range(1,15), length):
        check(list(comb))
rng = random.Random(952)
corpus = []
for _ in range(800):
    a = rng.sample(range(1,100001),rng.randint(1,35))
    corpus.append({'nums':a,'answer':check(a)})
start = time.perf_counter()
check(list(range(2,40002,2)),20000)
max_time = time.perf_counter()-start
check([1]+list(range(2,40000,2)),19999)
check([65536,59049,78125,99991,100000],3)
(out/'oracle-corpus.json').write_text(json.dumps(corpus)+'\n')
result = {'kind':'author self-check','cases':count,'exhaustive':'all 16383 nonempty subsets of 1..14','randomSeed':952,'randomCases':800,'maximumN':20000,'maximumValue':100000,'maximumEvenCaseSeconds':max_time,'inputMutation':False,'officialExamples':[4,2,8]}
(out/'python-results.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
