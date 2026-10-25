"""Independent enumeration oracle; no production mapping algorithm in expected results."""
import collections
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('LESSON_OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('candidate710', ROOT / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
count = 0


def check(n, blacklist):
    global count
    original = blacklist[:]
    obj = mod.Solution(n, blacklist)
    assert blacklist == original
    excluded = set(blacklist)
    allowed = [x for x in range(n) if x not in excluded]
    with patch.object(mod.random, 'randrange', side_effect=range(len(allowed))) as draw:
        outputs = [obj.pick() for _ in allowed]
    assert collections.Counter(outputs) == collections.Counter(allowed), (n, blacklist, outputs)
    assert draw.call_count == len(allowed)
    assert all(call.args == (len(allowed),) for call in draw.call_args_list)
    assert set(obj.remap) == {b for b in blacklist if b < len(allowed)}
    assert len(set(obj.remap.values())) == len(obj.remap)
    assert all(v >= len(allowed) and v not in blacklist for v in obj.remap.values())
    count += 1


rng = random.Random(710)
for n in range(1, 10):
    for mask in range((1 << n) - 1):
        blacklist = [v for v in range(n) if mask >> v & 1]
        check(n, blacklist)
        check(n, list(reversed(blacklist)))
for _ in range(500):
    n = rng.randint(1, 120)
    check(n, rng.sample(range(n), rng.randrange(n)))
check(7, [2, 3, 5])
check(100001, list(range(100000)))
# Largest n and blacklist size: force low and repaired tickets, including high skips.
n = 10**9
blacklist = list(range(50000)) + list(range(n - 50000, n))
obj = mod.Solution(n, blacklist)
assert len(obj.remap) == 50000 and obj.m == n - 100000
assert set(obj.remap.values()) == set(range(obj.m, obj.m + 50000))
# Adversarial maximum-length run of blocked high candidates, then one target.
b = list(range(100000, 199999)) + [0]
o = mod.Solution(200000, b)
assert o.remap == {0: 199999}
with patch.object(mod.random, 'randrange', return_value=0) as draw:
    assert [o.pick() for _ in range(20000)] == [199999] * 20000
    assert draw.call_count == 20000
# Genuine seeded generator exercises the untouched callable as well.
random.seed(710)
o = mod.Solution(7, [2, 3, 5])
observed = collections.Counter(o.pick() for _ in range(20000))
assert set(observed) == {0, 1, 4, 6}
assert all(4500 < c < 5500 for c in observed.values())
report = {'status': 'pass', 'oracleCases': count, 'forcedMaxCalls': 20000,
          'seededOfficialCounts': dict(observed), 'maxN': n, 'maxBlacklistLength': 100000,
          'scope': 'author self-check; exact ticket coverage proves finite mapping, histogram is only a smoke check'}
(OUT / 'python-results.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
