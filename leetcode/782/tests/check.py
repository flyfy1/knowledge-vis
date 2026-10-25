"""Author checks. OUTPUT_DIR redirects all generated results."""
import importlib.util
import json
import os
from collections import deque
from itertools import combinations, product
from pathlib import Path
import random
from baseline import baseline

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('canonical', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
solve = module.Solution().movesToChessboard


def board(bits, n):
    return [list(bits[i*n:(i+1)*n]) for i in range(n)]


def bfs_distances(n):
    # Independently traverse the actual legal-swap graph from both goals.
    goals = [tuple((i+j+s) % 2 for i in range(n) for j in range(n)) for s in (0, 1)]
    distance = dict.fromkeys(goals, 0)
    q = deque(goals)
    while q:
        old = q.popleft()
        for a, b in combinations(range(n), 2):
            for axis in (0, 1):
                new = list(old)
                for k in range(n):
                    x, y = (a*n+k, b*n+k) if axis == 0 else (k*n+a, k*n+b)
                    new[x], new[y] = new[y], new[x]
                new = tuple(new)
                if new not in distance:
                    distance[new] = distance[old] + 1
                    q.append(new)
    return distance


fixtures = []

def check(b, expected, label):
    before = [r[:] for r in b]
    actual = solve(b)
    assert actual == expected, (label, b, actual, expected)
    assert b == before, 'canonical mutated input'
    fixtures.append({'board': b, 'expected': expected, 'label': label})


for n in (2, 3):
    distance = bfs_distances(n)
    for bits in product((0, 1), repeat=n*n):
        b = board(bits, n)
        expected = distance.get(bits, -1)
        assert baseline(b) == expected
        check(b, expected, 'exhaustive-'+str(n))

rng = random.Random(782)
for n, count in [(4, 140), (5, 16)]:
    for k in range(count):
        if k % 2:
            rows, cols = list(range(n)), list(range(n))
            rng.shuffle(rows)
            rng.shuffle(cols)
            b = [[(i+j) % 2 for j in cols] for i in rows]
        else:
            b = [[rng.randrange(2) for _ in range(n)] for _ in range(n)]
        check(b, baseline(b), f'seed-782-n{n}')
for n in (2, 3, 29, 30):
    for bit in (0, 1):
        check([[bit]*n for _ in range(n)], -1, 'constant')
        check([[(i+j+bit) % 2 for j in range(n)] for i in range(n)], 0, 'alternating')
# n=30: grouped row/column types have 14 mismatches per axis, 7+7 swaps.
b = [[(i//15) ^ (j//15) for j in range(30)] for i in range(30)]
check(b, 14, 'max-size-grouped')
check([[0,1,1,0],[0,1,1,0],[1,0,0,1],[1,0,0,1]], 2, 'official-1')
check([[1,1,0],[0,0,1],[1,1,0]], 1, 'fresh-transfer')
check([[0,0,1,1],[0,1,0,1],[1,0,1,0],[1,1,0,0]], -1, 'balanced-wrong-rule')
(OUT / 'fixtures.json').write_text(json.dumps(fixtures)+'\n')
summary = {'status':'passed', 'cases':len(fixtures), 'exhaustive':'every binary 2×2 and 3×3 board vs legal-swap BFS and permutation baseline', 'seed':782,'canonical':'solution.py executed using official Solution.movesToChessboard interface','mutation':'unchanged','largest':'n=30 grouped = 14; constant = -1; alternating = 0'}
(OUT / 'python.json').write_text(json.dumps(summary, indent=2)+'\n')
print(json.dumps(summary))
