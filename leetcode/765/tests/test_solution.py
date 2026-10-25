"""Independent all-swap BFS oracle; run from any directory. OUTPUT_DIR redirects artifacts."""
import collections
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import sys
sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('solution', ROOT / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
solve = mod.Solution().minSwapsCouples

def oracle(n):
    # All valid seat arrangements are simultaneous BFS goals. No greedy repair.
    dist = {}
    for order in itertools.permutations(range(n)):
        for flips in itertools.product(range(2), repeat=n):
            goal = tuple(x for k, f in zip(order, flips) for x in (2*k+f, 2*k+1-f))
            dist[goal] = 0
    queue = collections.deque(dist)
    pairs = list(itertools.combinations(range(2*n), 2))
    while queue:
        state = queue.popleft()
        for a,b in pairs:
            new = list(state)
            new[a],new[b] = new[b],new[a]
            new = tuple(new)
            if new not in dist:
                dist[new] = dist[state] + 1
                queue.append(new)
    return dist

def baseline(row):
    a = row.copy()
    swaps = 0
    for i in range(0, len(a), 2):
        p = a[i] ^ 1
        if a[i+1] != p:
            j = a.index(p)
            a[i+1],a[j] = a[j],a[i+1]
            swaps += 1
    return swaps

def dsu_expected(row):
    parent = list(range(len(row)//2))
    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x
    count = len(parent)
    for a,b in zip(row[::2], row[1::2]):
        u,v = find(a//2),find(b//2)
        if u != v:
            parent[u] = v
            count -= 1
    return len(parent)-count

count = 0
fixtures = []
rng = random.Random(765)
for n in (2,3,4):
    distances = oracle(n)
    assert len(distances) == __import__('math').factorial(2*n)
    for row, expected in distances.items():
        actual_row = list(row)
        actual = solve(actual_row)
        assert actual == expected == baseline(list(row)), (row, expected, actual)
        assert sorted(actual_row) == list(range(2*n))
        assert all((actual_row[i]^1) == actual_row[i+1] for i in range(0,2*n,2))
        count += 1
    for row in rng.sample(list(distances), min(100, len(distances))):
        fixtures.append({'row':list(row), 'expected':distances[row]})
for _ in range(1000):
    n = rng.randint(2,30)
    row = list(range(2*n));rng.shuffle(row)
    expected = dsu_expected(row)
    assert solve(row.copy()) == expected == baseline(row)
for n in (2,3,4,30):
    long_cycle = [0]+list(range(2,2*n))+[1]
    assert solve(long_cycle) == n-1
    assert solve(list(range(2*n))) == 0
assert solve([0,2,1,3]) == 1
assert solve([3,2,0,1]) == 0
assert solve([4,1,2,7,0,5,6,3]) == 2
(OUT/'oracle-fixtures.json').write_text(json.dumps(fixtures)+'\n')
summary = {'exhaustive_bfs_permutations':count, 'seeded_full_domain':1000, 'maximum_couples':30, 'official_examples':'pass', 'mutation_and_postcondition':'pass','oracle':'multi-source BFS, all person swaps; DSU for larger inputs'}
(OUT/'python-results.json').write_text(json.dumps(summary, indent=2)+'\n')
print(json.dumps(summary))
