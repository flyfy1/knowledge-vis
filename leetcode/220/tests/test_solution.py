"""Author computational checks. Independent all-pairs oracle, not a review."""
import itertools
import json
import os
from pathlib import Path
import random
import sys
import time

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(ROOT))
from solution import Solution

OUT = Path(os.environ.get("TEST_OUTPUT_DIR", HERE / "evidence"))
OUT.mkdir(parents=True, exist_ok=True)
solve = Solution().containsNearbyAlmostDuplicate
count = 0
invariant_count = 0

def oracle(a, k, t):
    return any(j-i <= k and abs(a[i]-a[j]) <= t
               for i in range(len(a)) for j in range(i+1, len(a)))

def check(a, k, t, expected=None):
    global count
    before = a[:]
    got = solve(a, k, t)
    want = oracle(a, k, t) if expected is None else expected
    assert type(got) is bool and got == want, (a, k, t, got, want)
    assert a == before, "Input mutation"
    count += 1

for n in range(2, 6):
    for seq in itertools.product(range(-2, 3), repeat=n):
        for k in range(1, n+1):
            for t in range(4):
                check(list(seq), k, t)
rng = random.Random(220)
for _ in range(2500):
    n = rng.randrange(2, 35)
    a = [rng.randrange(-1000000000, 1000000001) if rng.random()<.3 else rng.randrange(-15,16) for _ in range(n)]
    check(a, rng.randrange(1,n+1), rng.choice([0,1,2,3,10,1000000000]))
for a,k,t,want in [
    ([1,2,3,1],3,0,True),([1,5,9,1,5,9],2,3,False),
    ([-5,8,-2],1,3,False),([-1,3],1,3,False),
    ([-1000000000,1000000000],1,1000000000,False),
    ([1,8,3],2,2,True),([1,8,3],1,2,False),
    ([0,0],1,0,True),([0,5],1,3,False)]:
    check(a,k,t,want)

# Trace the actual canonical method at the first probe line, after expiry.
probe_line = next(i for i,s in enumerate((ROOT/"solution.py").read_text().splitlines(),1)
                  if s.strip() == "bucket = x // width")
def inspect(frame,event,arg):
    global invariant_count
    if frame.f_code.co_filename == str(ROOT/"solution.py") and event == "line" and frame.f_lineno == probe_line:
        v=frame.f_locals
        live=v["nums"][max(0,v["i"]-v["indexDiff"]):v["i"]]
        assert len(live)==len(v["buckets"])
        assert sorted(live)==sorted(v["buckets"].values())
        assert all(b==x//v["width"] for b,x in v["buckets"].items())
        invariant_count += 1
    return inspect
sys.settrace(inspect)
for _ in range(300):
    n=rng.randrange(2,25)
    check([rng.randrange(-40,41) for _ in range(n)],rng.randrange(1,n+1),rng.randrange(5))
sys.settrace(None)
start=time.perf_counter()
check(list(range(100000)),100000,0,False)
check([7]*100000,100000,0,True)
check(list(range(99999))+[0],100000,0,True)
check(list(range(99999))+[0],1,0,False)
large_seconds=time.perf_counter()-start
report={"kind":"author self-check","oracle":"independent enumeration of all i<j",
        "canonical_cases":count,"actual_method_probe_invariants":invariant_count,
        "max_n":100000,"large_cases_seconds":round(large_seconds,4)}
(OUT/"python-results.json").write_text(json.dumps(report,indent=2)+"\n")
print(json.dumps(report))
