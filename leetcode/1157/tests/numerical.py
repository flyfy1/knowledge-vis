"""Independent count oracle + constructive intermediate deletion witnesses."""
import collections
import hashlib
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import time

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('solution', ROOT / 'solution.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
queries = arrays = nodes = 0
start = time.monotonic()


def oracle(a, l, r, t):
    counts = collections.Counter(a[l:r + 1])
    answers = [v for v, c in counts.items() if c >= t]
    assert len(answers) <= 1
    return answers[0] if answers else -1


def check_tree(a, obj):
    """Rebuild actual surviving indices and deleted pairs, not numeric merge."""
    global nodes
    witnesses = {}
    for node in range(obj.size, 2 * obj.size):
        i = node - obj.size
        witnesses[node] = [i] if i < len(a) else []
    for node in range(obj.size - 1, 0, -1):
        left, right = list(witnesses[2 * node]), list(witnesses[2 * node + 1])
        if left and right and a[left[0]] != a[right[0]]:
            while left and right:
                x, y = left.pop(), right.pop()
                assert a[x] != a[y]
        witnesses[node] = left + right
    for node, survivors in witnesses.items():
        c, b = obj.tree[node]
        assert b == len(survivors)
        if survivors:
            assert all(a[i] == c for i in survivors)
        else:
            assert (c, b) == (0, 0)
        nodes += 1


def check(a, exhaustive=True):
    global arrays, queries
    arrays += 1
    before = list(a)
    obj = m.MajorityChecker(a)
    assert a == before
    check_tree(a, obj)
    frozen = (list(obj.tree), dict((v, list(xs)) for v, xs in obj.positions.items()))
    if exhaustive:
        qs = ((l, r, t) for l in range(len(a)) for r in range(l, len(a))
              for t in range((r - l + 1) // 2 + 1, r - l + 2))
    else:
        qs = []
        for _ in range(80):
            l = rng.randrange(len(a)); r = rng.randrange(l, len(a))
            t = rng.randint((r - l + 1) // 2 + 1, r - l + 1)
            qs.append((l, r, t))
    for l, r, t in qs:
        assert obj.query(l, r, t) == oracle(a, l, r, t), (a, l, r, t)
        queries += 1
    assert a == before
    assert frozen == (obj.tree, dict(obj.positions))


for n in range(1, 8):
    for a in itertools.product((1, 2, 3), repeat=n):
        check(list(a))
rng = random.Random(1157)
for _ in range(350):
    check([rng.randint(1, 12) for _ in range(rng.randint(1, 150))], False)
obj = m.MajorityChecker([1, 1, 2, 2, 1, 1])
assert [obj.query(*q) for q in [(0, 5, 4), (0, 3, 3), (2, 3, 2)]] == [1, -1, 2]
check([20000])
# Max n and max calls on one unchanged object; expected values derived in closed form.
obj = m.MajorityChecker([20000] * 20000)
for i in range(10000):
    l, r = i, 19999
    assert obj.query(l, r, r-l+1) == 20000
    queries += 1
unique = m.MajorityChecker(list(range(1, 20001)))
assert unique.query(0, 19999, 10001) == -1
alternating = m.MajorityChecker([1, 2] * 10000)
assert alternating.query(0, 19999, 10001) == -1
assert alternating.query(0, 19998, 10000) == 1
assert alternating.query(0, 19998, 10001) == -1
assert m.MajorityChecker([1, 1, 1, 2, 2]).query(0, 4, 4) == -1
result = dict(kind='author self-check', status='pass', arrays=arrays, queries=queries,
              witnessed_tree_nodes=nodes, exhaustive='all ternary arrays length 1..7; all legal queries and thresholds',
              seeded='350 arrays, seed 1157, 80 queries each', max_n=20000, max_calls=10000,
              seconds=round(time.monotonic()-start, 3), source_sha256=hashlib.sha256((ROOT/'solution.py').read_bytes()).hexdigest())
(OUT/'numerical-results.json').write_text(json.dumps(result, indent=2)+'\n')
print(json.dumps(result))
