"""Execute canonical Python against an independent reachable-subset oracle."""
import ast
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import re
import heapq

P = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', str(P / 'tests/evidence')))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('solution', P / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def oracle(k, w, p, c):
    # A subset has fixed capital regardless of its construction order.
    reachable = {0}
    best = w
    for _ in range(min(k, len(p))):
        new = set()
        for mask in reachable:
            money = w + sum(p[i] for i in range(len(p)) if mask >> i & 1)
            best = max(best, money)
            for i in range(len(p)):
                if not mask >> i & 1 and c[i] <= money:
                    new.add(mask | (1 << i))
        reachable = new
    return max([best] + [w + sum(p[i] for i in range(len(p)) if m >> i & 1) for m in reachable])


def check(k, w, p, c):
    pp, cc = p[:], c[:]
    expected = oracle(k, w, p, c)
    got = mod.Solution().findMaximizedCapital(k, w, p, c)
    assert got == expected, (k, w, p, c, expected, got)
    assert p == pp and c == cc


# Execute the actually displayed baseline, separately from the submission.
from html import unescape
baseline_source = unescape(re.search(r'<pre><code>(def scan_baseline.*?)</code></pre>', (P/'index.html').read_text(), re.S).group(1))
baseline_ns = {}
exec(baseline_source, baseline_ns)
count = 0
for n in range(5):
    for pairs in itertools.product(list(itertools.product(range(3), repeat=2)), repeat=n):
        c = [x[0] for x in pairs]
        p = [x[1] for x in pairs]
        for w in range(3):
            for k in range(1, n + 2):
                check(k, w, p, c)
                count += 1
rng = random.Random(502)
random_cases = []
for _ in range(1500):
    n = rng.randrange(1, 9)
    case = [rng.randrange(0, n + 4), rng.randrange(8), [rng.randrange(9) for _ in range(n)], [rng.randrange(16) for _ in range(n)]]
    check(*case)
    assert baseline_ns["scan_baseline"](*case) == oracle(*case)
    random_cases.append(case)
for case, expected in [([2, 0, [1, 2, 3], [0, 1, 1]], 4), ([3, 0, [1, 2, 3], [0, 1, 2]], 6), ([2, 2, [2, 3, 8], [2, 2, 5]], 13), ([1, 10**9, [10000], [10**9]], 1000010000)]:
    assert mod.Solution().findMaximizedCapital(*case) == expected
# Inspect the actual canonical heap operations, without reimplementing its selection loop.
invariant_operations = 0
class AuditedHeap:
    def __init__(self, case):
        self.k, self.w, self.p, self.c = case
        self.chosen, self.admitted = set(), set()
    def heappush(self, h, item):
        global invariant_operations
        neg, i = item
        assert i not in self.admitted and i not in self.chosen
        assert -neg == self.p[i] and self.c[i] <= self.w
        self.admitted.add(i)
        heapq.heappush(h, item)
        invariant_operations += 1
    def heappop(self, h):
        global invariant_operations
        affordable = {i for i in range(len(self.p)) if i not in self.chosen and self.c[i] <= self.w}
        assert {i for _, i in h} == affordable
        item = heapq.heappop(h)
        neg, i = item
        assert -neg == max(self.p[j] for j in affordable)
        assert i not in self.chosen
        self.chosen.add(i)
        old = self.w
        self.w -= neg
        assert self.w >= old
        invariant_operations += 1
        return item
for case in random_cases[:400]:
    audit = AuditedHeap(case)
    mod.heapq = audit
    assert mod.Solution().findMaximizedCapital(*case) == oracle(*case)
mod.heapq = heapq
large = [(100000, 0, [10000]*100000, [0]*100000, 10**9), (100000, 0, [0]*100000, [1]*100000, 0), (100000, 0, [1]*100000, list(range(100000)), 100000)]
for k, w, p, c, expected in large:
    assert mod.Solution().findMaximizedCapital(k, w, p, c) == expected
source = (P/'solution.py').read_text()
mirror = (P/'python-code.js').read_text()
assert json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').removesuffix(';\n')) == source
# Supplemental key check; complete pre-evaluation AST audit is in core.cjs.
copy = (P/'copy.js').read_text()
keys = re.findall(r'^([A-Za-z]\w*):', copy, re.M)
assert len(keys) == len(set(keys))
assert copy.count("window.LESSON_COPY = {") == 1
ast.parse(source)
result = {'kind':'author self-check', 'result':'pass', 'exhaustive_cases':count, 'seed':502, 'random_cases':1500, 'canonical_heap_invariant_operations':invariant_operations, 'maximum_size_cases':3, 'official_examples':[4,6], 'transfer':13, 'source_parity':True, 'input_unchanged':True, 'displayed_baseline_cases':1500}
(OUT/'python.json').write_text(json.dumps(result, indent=2)+'\n')
print(json.dumps(result))
