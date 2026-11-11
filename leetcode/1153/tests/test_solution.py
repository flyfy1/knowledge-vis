"""Independent brute force for #1153 and comparison with solution.py and the browser model.

Usage (repository root):  OUTPUT_DIR=/tmp/1153-check python3 -B leetcode/1153/tests/test_solution.py

The brute force is a breadth-first search over actual strings: from str1, apply every legal
conversion (pick a letter present, rewrite all its copies to another letter of the alphabet)
and collect everything reachable. Over 26 letters that state space is far too large, so the
exhaustive comparison uses toy alphabets of 2..5 letters and runs solution.py's exact source
with the constant 26 replaced by the toy alphabet size (the only place the alphabet enters).
The real 26-letter code is then checked on its own boundary cases and on seeded random
inputs against the browser model, which performs the conversions and verifies the result.
"""
import itertools
import json
import os
import random
import subprocess
import zlib
from pathlib import Path

HERE = Path(__file__).resolve().parent
LESSON = HERE.parent
OUT = Path(os.environ.get('OUTPUT_DIR', HERE / 'evidence'))
OUT.mkdir(parents=True, exist_ok=True)
SOURCE = (LESSON / 'solution.py').read_text()
assert SOURCE.count('26') == 2  # one in a comment, one in the code: `< 26`
ns = {}
exec(SOURCE, ns)
solve = ns['Solution']().canConvert


def solver_for(size):
    code = SOURCE.replace('len(set(str2)) < 26', f'len(set(str2)) < {size}')
    assert code != SOURCE or size == 26
    local = {}
    exec(code, local)
    return local['Solution']().canConvert


def reachable(start, alphabet):
    seen, frontier = {start}, [start]
    while frontier:
        nxt = []
        for s in frontier:
            for c in set(s):
                for d in alphabet:
                    if d != c:
                        t = s.replace(c, d)
                        if t not in seen:
                            seen.add(t)
                            nxt.append(t)
        frontier = nxt
    return seen


stats = {'exhaustivePairs': 0, 'trueExhaustive': 0, 'randomFull': 0, 'boundary': 0}
fixtures = []
for alphabet, max_len in (('ab', 7), ('abc', 6), ('abcd', 5), ('abcde', 4)):
    toy = solver_for(len(alphabet))
    for n in range(1, max_len + 1):
        words = [''.join(w) for w in itertools.product(alphabet, repeat=n)]
        for s in words:
            reach = reachable(s, alphabet)
            for t in words:
                want = t in reach
                assert toy(s, t) == want, (alphabet, s, t, want)
                stats['exhaustivePairs'] += 1
                stats['trueExhaustive'] += want
                if n <= 4 or zlib.crc32((s + '|' + t).encode()) % 50 == 0:
                    fixtures.append([s, t, alphabet, want])

# 26-letter boundary cases (the limit itself, equal strings, conflicts).
FULL = 'abcdefghijklmnopqrstuvwxyz'
rot = FULL[1:] + FULL[0]
cases = [
    (FULL, FULL, True), (FULL, rot, False), (FULL[::-1], FULL, False),
    (FULL + 'a', rot + 'b', False), (FULL + 'a', rot + 'c', False),
    ('a' + FULL, 'a' + FULL, True), ('aa' + FULL[1:], 'bb' + FULL[1:], True),   # str1 uses all 26, str2 only 25: merge a into b
    (FULL[:25] + 'a', rot[:25] + 'b', True),        # 25 distinct targets: spare exists
    ('a', 'a', True), ('a', 'b', True), ('ab', 'ba', True), ('aab', 'xyz', False),
    ('abbc', 'bccd', True), ('abab', 'baba', True), ('abcab', 'xxyxx', True),
    ('ab' * 5000, 'ba' * 5000, True), ('ab' * 5000, 'bb' * 4999 + 'ba', False),
]
for s, t, want in cases:
    assert solve(s, t) == want, (s, t)
    fixtures.append([s, t, FULL, want])
    stats['boundary'] += 1

rng = random.Random(1153)
for trial in range(4000):
    n = rng.randint(1, 60)
    k = rng.randint(1, 26)
    letters = rng.sample(FULL, k)
    s = ''.join(rng.choice(letters) for _ in range(n))
    if rng.random() < 0.6:  # consistent map, sometimes a permutation-heavy one
        image = rng.sample(FULL, 26) if rng.random() < 0.5 else [rng.choice(FULL) for _ in range(26)]
        f = dict(zip(FULL, image))
        t = ''.join(f[c] for c in s)
    else:
        t = ''.join(rng.choice(FULL) for _ in range(n))
    fixtures.append([s, t, FULL, solve(s, t)])
    stats['randomFull'] += 1
# Make sure the random set exercises both verdicts and the 26-letter limit.
assert any(f[3] for f in fixtures) and not all(f[3] for f in fixtures)

(OUT / 'oracle-fixtures.json').write_text(json.dumps(fixtures) + '\n')
core = subprocess.run(['node', str(HERE / 'test_core.cjs')], input=json.dumps(fixtures), text=True, capture_output=True)
assert core.returncode == 0, core.stdout + core.stderr
mirror = (LESSON / 'python-code.js').read_text()
prefix = 'window.PYTHON_SOURCE = '
assert mirror.startswith(prefix) and json.loads(mirror[len(prefix):].rstrip().rstrip(';')) == SOURCE
stats['coreReport'] = json.loads(core.stdout)
stats['fixtures'] = len(fixtures)
(OUT / 'numerical.json').write_text(json.dumps(stats, indent=2) + '\n')
print(json.dumps(stats, indent=2))
