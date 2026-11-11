"""Author self-check for #774 (Minimize Max Distance to Gas Station).

Run from any directory: python3 -B leetcode/774/tests/test_solution.py
EVIDENCE_DIR redirects generated JSON (default: tests/evidence).

"Correct" here means what the problem accepts: a returned float within 1e-6
(absolute) of the true optimum D*. Every comparison below computes D* exactly
with Fractions by an algorithm that shares no code with solution.py, then checks
|answer - D*| <= 1e-6 exactly (Fraction arithmetic, no float rounding in the check).
"""
import heapq
import importlib.util
import itertools
import json
import os
import random
import subprocess
import sys
import time
from fractions import Fraction
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
OUT = Path(os.environ.get('EVIDENCE_DIR', HERE / 'evidence'))
OUT.mkdir(parents=True, exist_ok=True)
TOL = Fraction(1, 10**6)  # the statement's acceptance tolerance

spec = importlib.util.spec_from_file_location('solution774', ROOT / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
solve = mod.Solution().minmaxGasDist


def gaps_of(stations):
    return [b - a for a, b in zip(stations, stations[1:])]


def exhaustive(stations, k):
    """Try every way to hand out exactly k stations (extra ones never hurt)."""
    gaps = gaps_of(stations)
    best = None
    for cuts in itertools.combinations(range(k + len(gaps) - 1), len(gaps) - 1):
        bounds = (-1,) + cuts + (k + len(gaps) - 1,)
        counts = [bounds[i + 1] - bounds[i] - 1 for i in range(len(gaps))]
        worst = max(Fraction(g, c + 1) for g, c in zip(gaps, counts))
        best = worst if best is None else min(best, worst)
    return best


def greedy_exact(stations, k):
    """Give each station to the gap whose evenly spaced piece is currently longest."""
    heap = [(-Fraction(g), g, 0) for g in gaps_of(stations)]
    heapq.heapify(heap)
    for _ in range(k):
        _, g, c = heapq.heappop(heap)
        heapq.heappush(heap, (-Fraction(g, c + 2), g, c + 1))
    return -heap[0][0]


def need_at(gaps, x):
    """Exact stations needed for limit x (a positive Fraction)."""
    return sum(-((-g * x.denominator) // x.numerator) - 1 for g in gaps)


def need_just_below(gaps, x):
    """Stations needed for any limit slightly smaller than x: sum floor(g / x)."""
    return sum((g * x.denominator) // x.numerator for g in gaps)


def certified(stations, k, x):
    """x is the optimum iff it works and every smaller limit does not."""
    gaps = gaps_of(stations)
    return need_at(gaps, x) <= k < need_just_below(gaps, x)


def certified_optimum_near(stations, k, approx):
    """Locate D* among candidate values g/(c+1) near approx, then certify it exactly.

    The float answer only narrows the search; the certificate alone proves optimality.
    """
    gaps = gaps_of(stations)
    window = []
    for g in set(gaps):
        center = int(g / approx)
        for pieces in range(max(1, center - 2), center + 4):
            x = Fraction(g, pieces)
            if abs(x - Fraction(approx)) <= 4 * TOL:
                window.append(x)
    hits = [x for x in sorted(set(window)) if certified(stations, k, x)]
    assert len(hits) == 1, (stations[:5], k, approx, hits)
    return hits[0]


stats = {'exhaustive': 0, 'greedyRandom': 0, 'certifiedLarge': 0, 'officialAndBoundary': 0}
max_error = Fraction(0)


def check(stations, k, expected, label):
    global max_error
    original = list(stations)
    got = solve(stations, k)
    assert stations == original, 'input mutated'
    assert isinstance(got, float)
    error = abs(Fraction(got) - expected)
    assert error <= TOL, (label, stations[:12], k, got, expected, float(error))
    max_error = max(max_error, error)
    stats[label] += 1


# 1. Exhaustive: every strictly increasing station set in 0..10 with 2..4 stations, k = 1..6.
fixtures = []
for size in range(2, 5):
    for stations in itertools.combinations(range(11), size):
        stations = list(stations)
        for k in range(1, 7):
            truth = exhaustive(stations, k)
            assert greedy_exact(stations, k) == truth  # validates the faster oracle
            assert certified(stations, k, truth)
            check(stations, k, truth, 'exhaustive')
            if size == 3 and k <= 4 and len(fixtures) < 300 and stations[0] == 0:
                fixtures.append({'stations': stations, 'k': k, 'num': truth.numerator, 'den': truth.denominator})

# 2. Seeded random, exact greedy oracle (official-size station counts, moderate k).
rng = random.Random(774)
for _ in range(2500):
    n = rng.randint(2, 40) if rng.random() < .7 else rng.randint(10, 200)
    top = rng.choice([30, 1000, 10**5, 10**8])
    stations = sorted(rng.sample(range(top + 1), min(n, top + 1)))
    if len(stations) < 2:
        continue
    k = rng.randint(1, 60) if rng.random() < .8 else rng.randint(61, 3000)
    truth = greedy_exact(stations, k)
    assert certified(stations, k, truth)
    check(stations, k, truth, 'greedyRandom')
    if len(fixtures) < 700 and n <= 12 and k <= 30 and top <= 1000:
        fixtures.append({'stations': stations, 'k': k, 'num': truth.numerator, 'den': truth.denominator})

# 3. Official, boundary and maximum-size cases.
known = [
    ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 9, Fraction(1, 2)),        # public sample input 1
    ([23, 24, 36, 39, 46, 56, 57, 65, 84, 98], 1, Fraction(14)),  # public sample input 2
    ([0, 4, 10], 3, Fraction(2)),        # lesson hand example
    ([0, 6], 2, Fraction(2)),            # halving trap: halving gives 3
    ([0, 7, 10], 2, Fraction(3)),        # lesson prediction
    ([0, 10**8], 10**6, Fraction(10**8, 10**6 + 1)),
    ([0, 1], 10**6, Fraction(1, 10**6 + 1)),
]
for stations, k, truth in known:
    assert certified(stations, k, truth)
    check(stations, k, truth, 'officialAndBoundary')
# Equal gaps: 1999 unit gaps share 10**6 stations as evenly as possible.
unit = list(range(2000))
truth = greedy_exact(unit, 5000)
check(unit, 5000, truth, 'officialAndBoundary')
q, r = divmod(10**6, 1999)  # r gaps get q+1 stations, the rest q -> worst piece 1/(q+1)
check(unit, 10**6, Fraction(1, q + 1), 'officialAndBoundary')
assert certified(unit, 10**6, Fraction(1, q + 1))

timings = []
for trial in range(25):
    stations = sorted(rng.sample(range(10**8 + 1), 2000))
    k = rng.choice([1, 999_999, 10**6, rng.randint(1, 10**6)])
    start = time.perf_counter()
    got = solve(stations, k)
    timings.append(time.perf_counter() - start)
    truth = certified_optimum_near(stations, k, got)
    check(stations, k, truth, 'certifiedLarge')
    if trial < 3:  # cross-check the certificate route against the independent greedy
        assert greedy_exact(stations, min(k, 4000)) == certified_optimum_near(
            stations, min(k, 4000), solve(stations, min(k, 4000)))

# The baseline displayed in step 1 is real code: run it against the exhaustive oracle.
import html as html_lib
import re
page = (ROOT / 'index.html').read_text()
baseline_src = html_lib.unescape(re.search(r'<code id="baselineCode">(.*?)</code>', page, re.S).group(1))
namespace = {}
exec(baseline_src, namespace)
baseline_checks = 0
for stations in itertools.combinations(range(9), 3):
    for k in range(1, 5):
        assert abs(Fraction(namespace['baseline'](list(stations), k)) - exhaustive(list(stations), k)) <= Fraction(1, 10**9)
        baseline_checks += 1
stats['displayedBaseline'] = baseline_checks

# 4. Offline mirror and copy dictionary.
source = (ROOT / 'solution.py').read_text()
mirror = (ROOT / 'python-code.js').read_text()
assert mirror == 'window.PYTHON_SOURCE = ' + json.dumps(source) + ';\n'


def unique(pairs):
    seen = {}
    for key, value in pairs:
        assert key not in seen, 'duplicate copy key ' + key
        seen[key] = value
    return seen


copy_text = (ROOT / 'copy.js').read_text()
assert copy_text.startswith('window.COPY = ') and copy_text.endswith(';\n')
copy = json.loads(copy_text.removeprefix('window.COPY = ').removesuffix(';\n'), object_pairs_hook=unique)
assert all(isinstance(v, list) and len(v) == 2 and all(isinstance(s, str) and s for s in v) for v in copy.values())

(OUT / 'oracle-fixtures.json').write_text(json.dumps(fixtures) + '\n')
core = subprocess.run(['node', str(HERE / 'test_core.cjs')], capture_output=True, text=True,
                      env={**os.environ, 'EVIDENCE_DIR': str(OUT)})
assert core.returncode == 0, core.stderr + core.stdout
report = {
    'kind': 'author computational self-check (not independent review)',
    'tolerance': '|answer - exact optimum| <= 1e-6, checked in exact Fraction arithmetic',
    'comparisons': stats,
    'totalComparisons': sum(stats.values()),
    'maxAbsoluteError': float(max_error),
    'maxSizeSeconds': round(max(timings), 3),
    'seed': 774,
    'sourceParity': True,
    'copyKeys': len(copy),
    'core': json.loads(core.stdout),
}
(OUT / 'numerical.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
