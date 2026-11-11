"""Solution vs an independent exhaustive oracle (every subset of wells and pipes).

The authoring run's version of this file promised an "exhaustive subsets" oracle but only
asserted results were >= 0. The independent review (Claude Code, 2026-11-11) implemented the
oracle the comment describes. Run from the repository root: python3 leetcode/1168/tests/test_trace.py
"""
import itertools, random, time, importlib.util
from pathlib import Path
R = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('solution1168', R / 'solution.py'); mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
Solution = mod.Solution

def brute(n, wells, pipes):
    """Cheapest plan over all 2^(n+m) choices; a house has water iff its pipe-component has a well."""
    best = None
    for wm in range(1 << n):
        wc = sum(wells[i] for i in range(n) if wm >> i & 1)
        for pm in range(1 << len(pipes)):
            c = wc + sum(pipes[j][2] for j in range(len(pipes)) if pm >> j & 1)
            if best is not None and c >= best: continue
            comp = list(range(n + 1))
            def f(x):
                while comp[x] != x: x = comp[x]
                return x
            for j in range(len(pipes)):
                if pm >> j & 1: comp[f(pipes[j][0])] = f(pipes[j][1])
            wet = {f(i + 1) for i in range(n) if wm >> i & 1}
            if all(f(h) in wet for h in range(1, n + 1)): best = c
    return best

def run(n, wells, pipes):
    w, p = list(wells), [list(x) for x in pipes]
    got = Solution().minCostToSupplyWater(n, w, p)
    assert w == list(wells) and p == [list(x) for x in pipes], 'input mutated'
    return got

exhaustive = 0
for n in range(1, 4):
    pairs = [(a, b) for a in range(1, n + 1) for b in range(a + 1, n + 1)]
    for wells in itertools.product(range(3), repeat=n):
        for k in range(0, 3 if n > 1 else 1):
            for chosen in itertools.product(pairs, repeat=k):        # repeated pairs = parallel pipes
                for costs in itertools.product(range(3), repeat=k):
                    pipes = [[a, b, c] for (a, b), c in zip(chosen, costs)]
                    assert run(n, wells, pipes) == brute(n, list(wells), pipes), (n, wells, pipes)
                    exhaustive += 1
rnd = random.Random(1168); randomized = 0
for _ in range(3000):
    n = rnd.randint(1, 6); wells = [rnd.randint(0, 10) for _ in range(n)]
    pipes = [] if n == 1 else [[*rnd.sample(range(1, n + 1), 2), rnd.randint(0, 10)] for _ in range(rnd.randint(0, 8))]
    assert run(n, wells, pipes) == brute(n, wells, pipes); randomized += 1
# The lesson's own examples.
assert run(3, [4, 2, 5], [[1, 2, 1], [2, 3, 1], [1, 3, 3]]) == 4
assert run(4, [6, 1, 7, 5], [[1, 2, 2], [2, 3, 2], [3, 4, 8], [1, 4, 3]]) == 8
assert run(2, [5, 5], [[1, 2, 4], [1, 2, 1]]) == 6
assert run(4, [1, 8, 8, 1], [[1, 2, 3], [2, 3, 6], [3, 4, 3]]) == 8
# Maximum constraint size runs quickly.
n = 10_000; wells = [rnd.randint(0, 10**5) for _ in range(n)]
pipes = [[i, i % n + 1, rnd.randint(0, 10**5)] for i in range(1, n + 1)]
t = time.time(); run(n, wells, pipes); elapsed = time.time() - t
assert elapsed < 2
print(f'solution vs exhaustive-subset oracle: {exhaustive} exhaustive cases (n<=3, <=2 pipes incl. parallel), {randomized} random cases (n<=6, <=8 pipes), 4 lesson examples, n=1e4 max-size in {elapsed:.3f}s: pass')
