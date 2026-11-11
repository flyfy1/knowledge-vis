"""Independent checks for #1183 Maximum Number of Ones.

Usage (repository root):  OUTPUT_DIR=/tmp/1183-check python3 -B leetcode/1183/tests/test_solution.py

1. Exhaustive brute force: a branch-and-bound search over every 0/1 grid (each cell 1 or 0, pruned only
   when a window would exceed maxOnes or the remaining cells cannot beat the best), for every
   width, height <= 6 with at most 25 cells, every sideLength and every maxOnes.
2. For larger inputs (seeded random up to 100 x 100, plus the extreme constraints), two separate
   certificates that do not reuse solution.py's counting:
   - lower bound: build the grid that fills the chosen classes cell by cell and check every
     window with a 2-D prefix sum; its number of ones must equal the answer;
   - upper bound: the lesson's proof — a window start distribution under which every cell is
     covered with probability 1 / (its class size). It is checked exactly (fractions) for every
     length n <= 100 and side s <= n; then any valid grid has at most the top-maxOnes class sum.
"""
import json
import os
import random
import subprocess
from fractions import Fraction
from pathlib import Path

HERE = Path(__file__).resolve().parent
LESSON = HERE.parent
OUT = Path(os.environ.get('OUTPUT_DIR', HERE / 'evidence'))
OUT.mkdir(parents=True, exist_ok=True)
SOURCE = (LESSON / 'solution.py').read_text()
ns = {}
exec(SOURCE, ns)
solve = ns['Solution']().maximumNumberOfOnes


def brute(W, H, s, k):
    n = W * H
    wins = [[(r + i) * W + (c + j) for i in range(s) for j in range(s)]
            for r in range(H - s + 1) for c in range(W - s + 1)]
    cell_wins = [[w for w, win in enumerate(wins) if p in win] for p in range(n)]
    cnt = [0] * len(wins)
    best = 0

    def dfs(p, ones):
        nonlocal best
        if ones + (n - p) <= best:
            return
        if p == n:
            best = ones
            return
        if all(cnt[w] < k for w in cell_wins[p]):
            for w in cell_wins[p]:
                cnt[w] += 1
            dfs(p + 1, ones + 1)
            for w in cell_wins[p]:
                cnt[w] -= 1
        dfs(p + 1, ones)

    dfs(0, 0)
    return best


def class_count(n, s, a):
    return sum(1 for x in range(n) if x % s == a)  # deliberately naive


def construction_ok(W, H, s, k, answer):
    sizes = sorted(((class_count(H, s, a) * class_count(W, s, b), a, b) for a in range(s) for b in range(s)),
                   key=lambda t: -t[0])
    chosen = {(a, b) for _, a, b in sizes[:k]}
    grid = [[1 if (r % s, c % s) in chosen else 0 for c in range(W)] for r in range(H)]
    P = [[0] * (W + 1) for _ in range(H + 1)]
    for r in range(H):
        for c in range(W):
            P[r + 1][c + 1] = P[r][c + 1] + P[r + 1][c] - P[r][c] + grid[r][c]
    worst = max(P[r + s][c + s] - P[r][c + s] - P[r + s][c] + P[r][c]
                for r in range(H - s + 1) for c in range(W - s + 1))
    return worst <= k and P[H][W] == answer


def start_weights(n, s):
    G = lambda x: Fraction(0) if x < 0 else Fraction(x // s + 1, class_count(n, s, x % s))
    return [G(x) - G(x - 1) for x in range(n - s + 1)]


# Proof certificate, every n <= 100, s <= n: nonnegative, sums to 1, exact coverage 1/count.
certificates = 0
for n in range(1, 101):
    for s in range(1, n + 1):
        p = start_weights(n, s)
        assert all(x >= 0 for x in p) and sum(p) == 1, (n, s)
        for x in range(n):
            cover = sum(p[st] for st in range(max(0, x - s + 1), min(x, n - s) + 1))
            assert cover == Fraction(1, class_count(n, s, x % s)), (n, s, x)
        certificates += 1

stats = {'bruteCases': 0, 'randomCases': 0, 'extremes': 0, 'proofCertificates1D': certificates}
fixtures = []
for W in range(1, 7):
    for H in range(1, 7):
        if W * H > 25:
            continue
        for s in range(1, min(W, H) + 1):
            for k in range(s * s + 1):
                b = brute(W, H, s, k)
                assert solve(W, H, s, k) == b, (W, H, s, k, b)
                fixtures.append([W, H, s, k, b])
                stats['bruteCases'] += 1

rng = random.Random(1183)
for trial in range(1500):
    W, H = rng.randint(1, 100), rng.randint(1, 100)
    s = rng.randint(1, min(W, H))
    k = rng.randint(0, s * s)
    ans = solve(W, H, s, k)
    assert construction_ok(W, H, s, k, ans), (W, H, s, k)
    fixtures.append([W, H, s, k, ans])
    stats['randomCases'] += 1

extremes = [(100, 100, 100, 10000, 10000), (100, 100, 1, 1, 10000), (100, 100, 1, 0, 0), (1, 1, 1, 1, 1),
            (1, 1, 1, 0, 0), (100, 1, 1, 1, 100), (100, 100, 99, 1, 4), (100, 100, 2, 1, 2500), (3, 3, 2, 1, 4),
            (3, 3, 2, 2, 6), (5, 4, 2, 2, 12), (7, 3, 3, 2, 6), (7, 4, 3, 2, 10), (7, 5, 3, 2, 12)]
for W, H, s, k, want in extremes:
    assert solve(W, H, s, k) == want, (W, H, s, k)
    assert construction_ok(W, H, s, k, want)
    fixtures.append([W, H, s, k, want])
    stats['extremes'] += 1
# The lesson's greedy counterexample and the prediction case, by brute force.
assert brute(5, 4, 2, 2) == 12 and brute(7, 4, 3, 2) == 10 and brute(3, 2, 2, 2) == 4

(OUT / 'oracle-fixtures.json').write_text(json.dumps(fixtures) + '\n')
core = subprocess.run(['node', str(HERE / 'test_core.cjs')], input=json.dumps(fixtures), text=True, capture_output=True)
assert core.returncode == 0, core.stdout + core.stderr
mirror = (LESSON / 'python-code.js').read_text()
prefix = 'window.PYTHON_SOURCE = '
assert mirror.startswith(prefix) and json.loads(mirror[len(prefix):].rstrip().rstrip(';')) == SOURCE
stats['coreReport'] = json.loads(core.stdout)
(OUT / 'numerical.json').write_text(json.dumps(stats, indent=2) + '\n')
print(json.dumps(stats, indent=2))
