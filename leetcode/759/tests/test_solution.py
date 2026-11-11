"""Author self-check for #759. OUTPUT_DIR (default tests/evidence) receives numerical.json and oracle-fixtures.json."""
import importlib.util
import itertools
import json
import os
import random
import subprocess
import sys
import time
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
OUT = Path(os.environ.get('OUTPUT_DIR', HERE / 'evidence'))
OUT.mkdir(parents=True, exist_ok=True)


class Interval:  # LeetCode's provided class
    def __init__(self, start=None, end=None):
        self.start = start
        self.end = end


def load(name, path, inject=None):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    if inject:
        mod.__dict__.update(inject)
    spec.loader.exec_module(mod)
    return mod


sol = load('solution759', ROOT / 'solution.py', {'Interval': Interval}).Solution()
orc = load('oracle759', HERE / 'oracle.py')


def run(schedule):
    objs = [[Interval(s, e) for s, e in person] for person in schedule]
    snapshot = [[(iv.start, iv.end) for iv in p] for p in objs]
    out = sol.employeeFreeTime(objs)
    assert [[(iv.start, iv.end) for iv in p] for p in objs] == snapshot, 'input mutated'
    assert all(isinstance(iv, Interval) for iv in out)
    return [[iv.start, iv.end] for iv in out]


compared = 0


def check(schedule, oracle=orc.oracle):
    global compared
    got, want = run(schedule), oracle(schedule)
    assert got == want, (schedule, got, want)
    assert all(a < b for a, b in got)
    compared += 1
    return want


# 1. Exhaustive: every employee list of 1-2 sorted, non-overlapping (touching allowed) intervals in [0,5];
#    all schedules of 1, 2 and 3 employees.
ivs = [(s, e) for s in range(6) for e in range(s + 1, 6)]
lists = [[iv] for iv in ivs] + [[a, b] for a in ivs for b in ivs if a[1] <= b[0]]
for k in (1, 2, 3):
    for combo in itertools.product(lists, repeat=k):
        check([list(p) for p in combo])
exhaustive = compared

# 2. Seeded random schedules within LeetCode-like shapes.
rng = random.Random(759)


def random_person(n, hi):
    cuts = sorted(rng.sample(range(hi + 1), 2 * n))
    out = [[cuts[2 * i], cuts[2 * i + 1]] for i in range(n)]
    if rng.random() < 0.3:  # make some intervals touch inside one employee
        for i in range(1, n):
            if rng.random() < 0.5 and out[i - 1][1] < out[i][1] - 1:
                out[i][0] = out[i - 1][1]
    return out


for _ in range(5000):
    hi = rng.choice([10, 20, 40])
    sched = [random_person(rng.randint(1, 4), hi) for _ in range(rng.randint(1, 6))]
    check(sched)
randomized = compared - exhaustive

# 3. Maximum shape: 50 employees x 50 intervals with times up to 10^8 (piece oracle, coordinate-compressed).
timings = {}
for name in ('max_random', 'max_sparse'):
    hi = 10 ** 8 if name == 'max_random' else 10 ** 4
    sched = [random_person(50, hi) for _ in range(50)]
    start = time.perf_counter(); got = run(sched); timings[name] = round(time.perf_counter() - start, 4)
    assert got == orc.piece_oracle(sched), name
    assert timings[name] < 1
# The two oracles agree with each other on small inputs too.
for _ in range(500):
    sched = [random_person(rng.randint(1, 3), 15) for _ in range(rng.randint(1, 4))]
    assert orc.oracle(sched) == orc.piece_oracle(sched)

# 4. Named lesson cases.
named = [
    ([[[1, 3], [9, 10]], [[3, 5], [12, 14]], [[2, 4], [6, 7]]], [[5, 6], [7, 9], [10, 12]]),
    ([[[1, 10]], [[2, 3], [5, 6]]], []),
    ([[[1, 2], [5, 6]], [[2, 4]], [[4, 5]]], []),
    ([[[0, 4]], [[0, 2], [6, 8]], [[3, 4], [6, 7]]], [[4, 6]]),
    ([[[2, 9]]], []),
    ([[[0, 9]], [[1, 2], [4, 5]], [[7, 8], [11, 12]]], [[9, 11]]),
    ([[[0, 1]], [[10 ** 8 - 1, 10 ** 8]]], [[1, 10 ** 8 - 1]]),
]
for sched, want in named:
    assert check(sched, orc.piece_oracle) == want, sched
# The tempting previous-end rule really is wrong on the lesson's counterexamples.
def previous_end(schedule):
    busy = sorted(tuple(iv) for p in schedule for iv in p)
    return [[a[1], b[0]] for a, b in zip(busy, busy[1:]) if b[0] > a[1]]
assert previous_end(named[1][0]) == [[3, 5]]
assert previous_end(named[5][0]) == [[2, 4], [5, 7], [8, 11]]

# 5. Mirror, copy shape, duplicate keys.
source = (ROOT / 'solution.py').read_text()
assert (ROOT / 'python-code.js').read_text() == 'window.PYTHON_SOURCE = ' + json.dumps(source) + ';\n'


def unique(pairs):
    out = {}
    for k, v in pairs:
        assert k not in out, 'duplicate copy key ' + k
        out[k] = v
    return out


text = (ROOT / 'copy.js').read_text()
copy = json.loads(text[len('window.COPY = '):-2], object_pairs_hook=unique)
assert copy['sep'] == ['', ' ']  # sentence separator: none in Chinese, one space in English
assert all(isinstance(v, list) and len(v) == 2 and all(isinstance(x, str) and x.strip() for x in v) for k, v in copy.items() if k != 'sep')

# 6. Fixtures for core.js.
fixtures = [{'schedule': s, 'answer': orc.oracle(s)} for s, _ in named[:6]]
frng = random.Random(7590)
for _ in range(600):
    hi = frng.choice([8, 15, 30])
    sched = []
    for _ in range(frng.randint(1, 5)):
        n = frng.randint(1, 4)
        cuts = sorted(frng.sample(range(hi + 1), 2 * n))
        sched.append([[cuts[2 * i], cuts[2 * i + 1]] for i in range(n)])
    fixtures.append({'schedule': sched, 'answer': orc.oracle(sched)})
(OUT / 'oracle-fixtures.json').write_text(json.dumps(fixtures) + '\n')
proc = subprocess.run(['node', str(HERE / 'test_core.cjs'), str(OUT / 'oracle-fixtures.json')], capture_output=True, text=True)
if proc.returncode:
    print(proc.stdout, proc.stderr)
    raise SystemExit('core test failed')
report = {'kind': 'author self-check against an independent unit-cell oracle',
          'exhaustiveComparisons': exhaustive, 'seededRandomComparisons': randomized,
          'totalComparisons': compared, 'seed': 759, 'maxShapeSeconds': timings,
          'copyPairs': len(copy), 'sourceMirrorExact': True, 'core': json.loads(proc.stdout)}
(OUT / 'numerical.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
