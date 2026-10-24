"""Author computational checks. Run from any cwd; writes only to OUTPUT_DIR if set."""
import collections
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('canonical381', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
checks = 0


def invariant(obj, oracle):
    global checks
    assert collections.Counter(obj.nums) == collections.Counter(oracle)
    expected = {}
    for i, v in enumerate(obj.nums):
        expected.setdefault(v, set()).add(i)
    assert obj.pos == expected
    checks += 1


def run(ops, sample=True):
    obj = module.RandomizedCollection()
    oracle = []  # independent linear baseline: no swap, no reverse indices
    invariant(obj, oracle)
    for op, val in ops:
        if op == 'insert':
            expected = val not in oracle
            oracle.append(val)
        else:
            expected = val in oracle
            if expected:
                oracle.remove(val)
        assert getattr(obj, op)(val) is expected
        invariant(obj, oracle)
        if oracle and sample:
            # Enumerate ALL equally likely random-index outcomes, not a flaky
            # statistical acceptance test and not a swap-based oracle.
            results = []
            before = (obj.nums.copy(), {v: s.copy() for v, s in obj.pos.items()})
            for i in range(len(obj.nums)):
                with patch.object(module.random, 'randrange', return_value=i) as rng:
                    results.append(obj.getRandom())
                    rng.assert_called_once_with(len(oracle))
            assert collections.Counter(results) == collections.Counter(oracle)
            assert before == (obj.nums, obj.pos)
    return obj


alphabet = list(itertools.product(('insert', 'remove'), (-1, 0, 1)))
for size in range(6):
    for ops in itertools.product(alphabet, repeat=size):
        run(ops)
rng = random.Random(381)
for _ in range(150):
    run([(rng.choice(('insert', 'remove')), rng.choice((-2**31, 2**31-1, -2, -1, 0, 1, 2))) for _ in range(120)], sample=False)
# Official example: random outputs are possible, not fixed.
o = run([('insert', 1), ('insert', 1), ('insert', 2), ('remove', 1)])
assert collections.Counter(o.nums) == {1: 1, 2: 1}
# Force every legal arbitrary set.pop choice, including tail and equal tail.
class PickSet(set):
    target = 0
    def pop(self):
        self.remove(self.target)
        return self.target
for values in ([4, 9, 4], [8, 3, 8, 8], [5], [1, 2, 3]):
    for i, v in enumerate(values):
        obj = module.RandomizedCollection()
        for x in values:
            obj.insert(x)
        obj.pos[v] = PickSet(obj.pos[v])
        obj.pos[v].target = i
        assert obj.remove(v)
        oracle = list(values)
        oracle.remove(v)
        invariant(obj, oracle)
        # Last copy gone / reinsertion membership must remain correct.
        while v in oracle:
            obj.pos[v] = set(obj.pos[v])
            assert obj.remove(v)
            oracle.remove(v)
        assert obj.insert(v) is True
        oracle.append(v)
        invariant(obj, oracle)
# Exactly 200,000 updates; many distinct positions and a heavily duplicated key.
obj = module.RandomizedCollection()
for i in range(100000):
    assert obj.insert(i % 1000) is (i < 1000)
invariant(obj, [i % 1000 for i in range(100000)])
for i in range(100000):
    assert obj.remove(i % 1000)
invariant(obj, [])
# Offline mirror is exactly one assignment of the canonical source.
mirror = (ROOT / 'python-code.js').read_text()
prefix = 'window.PYTHON_SOURCE = '
assert mirror.startswith(prefix) and mirror.endswith(';\n')
assert json.loads(mirror[len(prefix):-2]) == (ROOT / 'solution.py').read_text()
report = {'status': 'pass', 'invariantChecks': checks, 'exhaustiveLengths': '0..5 over 6 updates', 'seed': 381, 'seededStreams': 150, 'maxCalls': 200000, 'sampling': 'all possible positions enumerated on exhaustive states; random.randrange contract checked', 'scope': 'author self-check; no LeetCode submission'}
print(json.dumps(report))
if os.environ.get('OUTPUT_DIR'):
    dest = Path(os.environ['OUTPUT_DIR'])
    dest.mkdir(parents=True, exist_ok=True)
    (dest / 'python-results.json').write_text(json.dumps(report, indent=2))
