"""Independent cut-mask oracle; OUTPUT_DIR may point outside the frozen candidate."""
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('solution', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
solve = module.Solution().minCut


def oracle(s):
    best = len(s) - 1
    for mask in range(1 << (len(s) - 1)):
        begin, pieces, valid = 0, 0, True
        for end in range(1, len(s) + 1):
            if end == len(s) or mask & (1 << (end - 1)):
                part = s[begin:end]
                if part != part[::-1]:
                    valid = False
                    break
                pieces += 1
                begin = end
        if valid:
            best = min(best, pieces - 1)
    return best

count = 0
for n in range(1, 11):
    for chars in itertools.product('ab', repeat=n):
        s = ''.join(chars)
        assert solve(s) == oracle(s), s
        count += 1
rng = random.Random(132)
for _ in range(300):
    s = ''.join(rng.choices('abcd', k=rng.randint(1, 13)))
    assert solve(s) == oracle(s), s
    count += 1
for s, expected in [('aab', 1), ('a', 0), ('ab', 1), ('aaba', 1), ('abca', 3), ('aabab', 1),
                    ('a' * 2000, 0), ('ab' * 1000, 1), ('a' * 1999 + 'b', 1),
                    (('abcdefghijklmnopqrstuvwxyz' * 77)[:2000], 1999)]:
    original = s
    assert solve(s) == expected, (len(s), expected)
    assert s == original
    count += 1
source = (ROOT / 'solution.py').read_text()
mirror = (ROOT / 'python-code.js').read_text()
assert mirror == 'window.PYTHON_SOURCE = ' + json.dumps(source) + ';\n'
data = {'status': 'pass', 'canonical_python_cases': count, 'oracle': 'independent cut-mask enumeration',
        'seed': 132, 'maximum_length': 2000, 'source_mirror': 'exact'}
out = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
out.mkdir(parents=True, exist_ok=True)
(out / 'python-results.json').write_text(json.dumps(data, indent=2) + '\n')
print(json.dumps(data))
