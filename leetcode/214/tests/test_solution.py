"""Run: python3 -B leetcode/214/tests/test_solution.py (OUTPUT_DIR optional)."""
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('submission', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
solve = module.Solution().shortestPalindrome


def prepend_oracle(s):
    # Independently enumerate added strings; do not find palindromic prefixes.
    alphabet = sorted(set(s))
    for count in range(len(s) + 1):
        for chars in itertools.product(alphabet, repeat=count):
            candidate = ''.join(chars) + s
            if candidate == candidate[::-1]:
                return candidate


def baseline(s):
    for k in range(len(s), -1, -1):
        if s[:k] == s[:k][::-1]:
            return s[k:][::-1] + s


count = 0
for n in range(9):
    for chars in itertools.product('ab', repeat=n):
        s = ''.join(chars)
        assert solve(s) == prepend_oracle(s), s
        count += 1
rng = random.Random(214)
for _ in range(80):
    s = ''.join(rng.choice('abc') for _ in range(rng.randrange(9)))
    assert solve(s) == prepend_oracle(s), s
for _ in range(500):
    s = ''.join(rng.choice('abcd') for _ in range(rng.randrange(100)))
    assert solve(s) == baseline(s), s

# Inspect pi computed by the real canonical callable, not a test implementation.
inspected = 0
for s in ['', 'a', 'abab', 'abac', 'aabaaa', 'aacecaaa', 'abb']:
    captured = {}
    def capture(frame, event, arg):
        if frame.f_code.co_filename == str(ROOT / 'solution.py') and event == 'return':
            captured.update(frame.f_locals)
        return capture
    sys.settrace(capture)
    try:
        solve(s)
    finally:
        sys.settrace(None)
    t, pi = captured['t'], captured['pi']
    for i, value in enumerate(pi):
        part = t[:i + 1]
        valid = [k for k in range(len(part)) if part[:k] == part[len(part)-k:]]
        assert value == max(valid), (s, i, value, valid)
        inspected += 1
    assert pi[-1] <= len(s)

fixtures = {'aacecaaa':'aaacecaaa', 'abcd':'dcbabcd', 'abac':'cabac',
            'abb':'bbabb', 'aabaaa':'aaabaaa', '':'', 'a':'a'}
for s, expected in fixtures.items():
    assert solve(s) == expected
large = [('a'*50000, 'a'*50000), ('a'*49999+'b', 'b'+'a'*49999+'b'),
         ('ab'*25000, 'b'+'ab'*25000)]
for s, expected in large:
    result = solve(s)
    assert result == expected and result.endswith(s) and result == result[::-1]
source = (ROOT/'solution.py').read_text()
mirror = (ROOT/'python-code.js').read_text()
assert mirror.startswith('window.PYTHON_SOURCE = ')
assert json.loads(mirror[len('window.PYTHON_SOURCE = '):].strip().rstrip(';')) == source
result = {'status':'passed', 'canonical':'Solution.shortestPalindrome(s: str) -> str',
          'exhaustive_binary':count,'seeded_prepend_oracle':80,'seeded_prefix_baseline':500,
          'canonical_pi_cells_checked':inspected,'official_and_boundary_fixtures':len(fixtures),
          'maximum_length_fixtures':len(large),'source_mirror_exact':True}
(OUT/'python-results.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
