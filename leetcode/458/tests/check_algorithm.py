"""Execute the official Python callable against an independently counted oracle.
Run: python3 -B leetcode/458/tests/check_algorithm.py
OUTPUT_DIR selects a reviewer-owned evidence directory.
"""
from pathlib import Path
from itertools import product
from math import comb
import json, os, runpy
root = Path(__file__).resolve().parents[1]
out = Path(os.environ.get('OUTPUT_DIR', root/'tests/evidence'))
out.mkdir(parents=True, exist_ok=True)
Solution = runpy.run_path(str(root/'solution.py'))['Solution']
solve = Solution().poorPigs

def capacity_by_deaths(pigs, rounds):
    # Choose which pigs die, then independently assign their death rounds.
    # Survival is the unchosen group. This does not use the submission loop.
    return sum(comb(pigs, dead) * rounds**dead for dead in range(pigs + 1))

answers = {}
for r in range(1, 101):
    caps = [capacity_by_deaths(p,r) for p in range(11)]
    answers[r] = [0] + [next(p for p,c in enumerate(caps) if c >= b) for b in range(1,1001)]

cases = 0
for die in range(1,101):
    for test in range(die,101):
        for b in range(1,1001):
            got = solve(b,die,test)
            assert type(got) is int and got == answers[test//die][b], (b,die,test,got)
            cases += 1
assert solve(4,15,15)==2 and solve(4,15,30)==2
assert solve(1000,15,60)==5 and solve(1000,100,100)==10
assert solve(1,1,100)==0 and solve(8,15,44)==2

# Enumerate full outcomes independently, verify lower bound and attainability.
vectors = 0
for r in range(1,5):
    for p in range(5):
        outcomes = list(product(range(r+1),repeat=p))
        assert len(outcomes)==capacity_by_deaths(p,r)
        assert len(set(outcomes))==len(outcomes)
        for code in outcomes:
            alive=[True]*p; recorded=[0]*p
            for step in range(1,r+1):
                for pig in range(p):
                    # Only the poison's scheduled feeding matters.
                    if alive[pig] and code[pig]==step:
                        alive[pig]=False;recorded[pig]=step
            assert tuple(recorded)==code
        vectors += len(outcomes)

# Exact loop invariant at every intermediate state and minimality at thresholds.
invariants = 0
for r in range(1,101):
    for b in range(1,1001):
        p=0;c=1
        while c<b:
            assert c==capacity_by_deaths(p,r)
            c*=r+1;p+=1;invariants+=1
        assert c==capacity_by_deaths(p,r)
        assert p==answers[r][b]
        assert p==0 or capacity_by_deaths(p-1,r)<b

source=(root/'solution.py').read_text()
mirror=(root/'python-code.js').read_text()
assert mirror.startswith('window.PYTHON_SOURCE = ')
assert json.loads(mirror[len('window.PYTHON_SOURCE = '):].strip().removesuffix(';')) == source

# Detect duplicate localization definitions before a dictionary could overwrite them.
def no_duplicates(pairs):
    keys=[k for k,v in pairs]
    assert len(keys)==len(set(keys)), 'duplicate localization key'
    return dict(pairs)
copy=(root/'copy.js').read_text()
strings=json.loads(copy.removeprefix('window.LESSON_COPY = ').strip().removesuffix(';'),object_pairs_hook=no_duplicates)
assert all(len(v)==2 and all(isinstance(s,str) and s for s in v) for v in strings.values())
result={'status':'pass','official_callable_cases':cases,'independently_enumerated_vectors':vectors,'intermediate_invariants':invariants,'oracle':'choose dead pigs and assign their death rounds; enumerate full vectors and simulate scheduled feeding','coverage':'all buckets 1..1000 for every valid (minutesToDie, minutesToTest) pair 1..100; both official examples, powers, leftover time, one bucket, maxima','source_mirror':'exact','localization_keys':len(strings),'independent_review':False}
(out/'algorithm.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
