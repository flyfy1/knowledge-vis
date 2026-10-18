"""Independent permutation oracle and prefix checks; no third-party packages."""
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import sys
sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('solution', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

def valid(p):
    return all(p[a] != p[b] and abs(a-b) != abs(p[a]-p[b])
               for a in range(len(p)) for b in range(a))

def oracle(n):
    return [p for p in itertools.permutations(range(n)) if valid(p)]

def descend(n, prefix):
    if len(prefix) == n:
        return 1
    return sum(descend(n, prefix+(c,)) for c in range(n) if valid(prefix+(c,)))

expected = [1, 0, 0, 2, 10, 4, 40, 92, 352]
results = []
for n in range(1, 10):
    boards = oracle(n)
    actual = module.Solution().totalNQueens(n)
    assert actual == len(boards) == expected[n-1]
    results.append({'n': n, 'count': actual})
    # Exhaustive legal prefixes through n=6; compare descendants to complete oracle.
    if n <= 6:
        for r in range(n+1):
            for prefix in itertools.permutations(range(n), r):
                if valid(prefix):
                    assert descend(n, prefix) == sum(b[:r] == prefix for b in boards)
rng = random.Random(52)
for _ in range(100):
    n = rng.randrange(1, 9)
    prefix = tuple(rng.sample(range(n), rng.randrange(n+1)))
    if valid(prefix):
        assert descend(n, prefix) == sum(b[:len(prefix)] == prefix for b in oracle(n))
assert descend(5, (0,3)) == 1
assert descend(4, (0,2)) == 0
assert [descend(4, (c,)) for c in range(4)] == [0,1,1,0]
source = (ROOT / 'solution.py').read_text()
embedded = (ROOT / 'python-code.js').read_text()
assert json.loads(embedded.removeprefix('window.PYTHON_SOURCE = ').rstrip(';\n')) == source
report = {'type':'author self-check','counts':results,'seed':52,'seeded_cases':100,
          'exhaustive_legal_prefixes':'n=1..6', 'source_parity':True}
out = Path(os.environ.get('LESSON_TEST_OUTPUT_DIR', ROOT / 'tests/evidence'))
out.mkdir(parents=True, exist_ok=True)
(out / 'algorithm-results.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report))
