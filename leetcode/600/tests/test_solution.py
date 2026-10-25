"""Author checks: OUTPUT_DIR redirects every generated artifact."""
import importlib.util
import json
import os
import random
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('submission', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
solve = module.Solution().findIntegers

def oracle(n):
    """Independent digit recursion: branch each bit, track tightness and prior bit."""
    digits = tuple(map(int, bin(n)[2:]))
    @lru_cache(None)
    def count(pos, last, tight):
        if pos == len(digits):
            return 1
        bound = digits[pos] if tight else 1
        return sum(count(pos + 1, bit, tight and bit == bound)
                   for bit in range(bound + 1) if not (last and bit))
    return count(0, 0, True)

# Independent string baseline accumulates all integers rather than using f.
expected = 0
for n in range(20001):
    expected += '11' not in bin(n)
    assert solve(n) == expected == oracle(n), (n, expected, solve(n))
rng = random.Random(600)
cases = set([1, 2, 3, 4, 5, 6, 8, 10, 12, 13, 10**9])
for k in range(1, 30):
    cases.update([2**k - 1, 2**k, min(10**9, 2**k+1)])
cases.update(rng.randint(1, 10**9) for _ in range(600))
answers = {n: oracle(n) for n in sorted(cases)}
for n, value in answers.items():
    assert solve(n) == value, (n, solve(n), value)
# All-bit widths: enumerate shorter strings independently for closed boundaries.
for k in range(1, 16):
    assert solve(2**k - 1) == sum('11' not in format(x, f'0{k}b') for x in range(2**k))
assert [solve(n) for n in [5,1,2]] == [5,2,3]
assert solve(0) == 1  # documented extension only
source = (ROOT/'solution.py').read_text()
mirror = (ROOT/'python-code.js').read_text()
assert mirror.startswith('window.PYTHON_SOURCE = ')
assert json.loads(mirror[len('window.PYTHON_SOURCE = '):].strip().removesuffix(';')) == source
(OUT/'oracle-cases.json').write_text(json.dumps(answers, indent=2)+'\n')
report = {'kind':'author numerical self-check', 'status':'PASS', 'exhaustive':'0..20000 vs incremental string baseline and independent digit recursion', 'largeCases':len(cases), 'seed':600,'officialExamples':True,'maxInput':{'n':10**9,'expected':answers[10**9]},'sourceMirrorExact':True}
(OUT/'python-results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
