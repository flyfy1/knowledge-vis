"""Author self-check: run with python3 -B; OUTPUT_DIR redirects all artifacts."""
import html
import re
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('canonical149', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
solution = module.Solution()


def oracle(points):
    # Independent geometry: test line equations directly; no gcd or direction keys.
    answer = 1
    for a, b in itertools.combinations(points, 2):
        on_line = 0
        for p in points:
            if ((b[0] - a[0]) * (p[1] - a[1]) ==
                    (b[1] - a[1]) * (p[0] - a[0])):
                on_line += 1
        answer = max(answer, on_line)
    return answer


cases = [
    [[1, 1], [2, 2], [3, 3]],
    [[1, 1], [3, 2], [5, 3], [4, 1], [2, 3], [1, 4]],
    [[-10000, -10000], [0, 0], [10000, 10000], [10000, -10000]],
    [[0, 0], [1, 1], [0, 1], [1, 2]],
    [[0, 0], [1, 2], [2, 4], [-1, -2]],
    [[2, 2], [0, 0], [4, 4], [3, 2]],
    [[7, -3]], [[1, 1], [-1, -3]],
    [[0, y] for y in range(-3, 4)],
    [[x, 0] for x in range(-3, 4)],
]
grid = list(itertools.product(range(-1, 2), repeat=2))
for n in range(1, len(grid) + 1):
    cases.extend([[list(p) for p in subset]
                  for subset in itertools.combinations(grid, n)])
rng = random.Random(149)
for _ in range(700):
    points = rng.sample(list(itertools.product(range(-6, 7), repeat=2)), rng.randint(1, 11))
    rng.shuffle(points)
    cases.append([list(p) for p in points])
for perm in itertools.permutations([[0, 0], [2, 1], [-2, -1], [0, 2]]):
    cases.append([list(p) for p in perm])
baseline_source = html.unescape(re.search(r'<pre><code>(def baseline.*?)</code></pre>', (ROOT / 'index.html').read_text(), re.S)[1])
namespace = {}
exec(baseline_source, namespace)
fixtures = []
for points in cases:
    before = [p[:] for p in points]
    expected = oracle(points)
    assert namespace['baseline'](points) == expected
    actual = solution.maxPoints(points)
    assert type(actual) is int and actual == expected, (points, expected, actual)
    assert points == before, 'Input mutated'
    assert solution.maxPoints(points) == expected, 'Repeated-call state leaked'
    fixtures.append({'points': points, 'expected': expected})

large = [
    ([[x, 2 * x] for x in range(300)], 300, 'n=300 one line'),
    ([[x, -10000] for x in range(150)] + [[x, 10000] for x in range(150)], 150, 'n=300 parallel rows'),
    ([[x, x * x] for x in range(-100, 101)], 2, 'parabola: line meets at most twice'),
]
for points, expected, label in large:
    assert solution.maxPoints(points) == expected, label
# Expected maxima follow geometry, independent of normalized-direction computation.
assert fixtures[0]['expected'] == 3 and fixtures[1]['expected'] == 4
assert fixtures[5]['expected'] == 3
source = (ROOT / 'solution.py').read_text()
mirror = (ROOT / 'python-code.js').read_text()
assert mirror == 'window.PYTHON_SOURCE = ' + json.dumps(source, ensure_ascii=False) + ';\n'
(OUT / 'oracle-fixtures.json').write_text(json.dumps(fixtures))
report = {'kind': 'author self-check', 'smallOracleCases': len(fixtures),
          'exhaustive': 'all 511 nonempty subsets of the 3×3 integer grid',
          'seed': 149, 'randomCases': 700, 'orderPermutations': 24,
          'largeClosedFormCases': [label for _, _, label in large],
          'sourceMirrorParity': True, 'inputUnchanged': True, 'officialExamples': [3, 4]}
(OUT / 'algorithm-results.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
