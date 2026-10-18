"""Execute the canonical Python, comparing against membership and placement invariants."""
import collections
import importlib.util
import itertools
import json
import random
from pathlib import Path
root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('submission', root / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
checks = 0

def check(values):
    global checks
    before = list(values)
    data = before.copy()
    present = set(before)
    expected = next(i for i in range(1, len(data) + 2) if i not in present)
    actual = module.Solution().firstMissingPositive(data)
    assert actual == expected, (before, actual, expected)
    assert collections.Counter(data) == collections.Counter(before)
    assert all(data[x - 1] == x for x in present if 1 <= x <= len(data))
    checks += 1

for n in range(1, 7):
    for values in itertools.product((-2, 0, 1, 2, 3, 7), repeat=n):
        check(values)
rng = random.Random(41)
for _ in range(1000):
    check([rng.randrange(-50, 150) for _ in range(rng.randrange(1, 101))])
for values in ([2,3,1,5], [1,1], [2,2,1], [-2147483648,2147483647],
               list(range(100000,0,-1)), [1]*100000, [0]*100000, [2147483647]*100000):
    check(values)
mirror = (root / 'python-code.js').read_text().removeprefix('window.PYTHON_SOURCE = ').strip().removesuffix(';')
assert json.loads(mirror) == (root / 'solution.py').read_bytes().decode()
print(f'{checks} canonical Python cases passed; exact offline mirror parity passed')
