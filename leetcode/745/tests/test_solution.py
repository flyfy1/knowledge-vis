"""Independent oracle and full canonical callable-contract checks. No network."""
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('LESSON_TEST_OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('canonical', ROOT / 'solution.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


def oracle(words, pref, suff):
    # Forward scan collects actual original positions; no pair precomputation.
    matches = [i for i, w in enumerate(words)
               if w.startswith(pref) and w.endswith(suff)]
    return max(matches, default=-1)


count = 0

def check(words, queries):
    global count
    before = words[:]
    obj = m.WordFilter(words)
    assert words == before
    for p, s in queries:
        assert obj.f(p, s) == oracle(words, p, s), (words, p, s)
        count += 1
    # Every stored pair is sound and attains the maximum, independently of construction.
    for (p, s), i in obj.best.items():
        assert i == oracle(words, p, s)
    return obj


check(['apple'], [('a', 'e'), ('apple', 'apple'), ('a', 'z')])
check(['ababa', 'aba', 'ababa', 'axa'], [('aba', 'aba')])
small = ['a', 'b', 'aa', 'ab', 'ba', 'bb']
queries = list(itertools.product(small + ['aaa', 'z'], repeat=2))
for n in range(1, 4):
    for words in itertools.product(small, repeat=n):
        check(list(words), queries)
rng = random.Random(745)
for _ in range(500):
    words = [''.join(rng.choices('abc', k=rng.randint(1, 7)))
             for _ in range(rng.randint(1, 20))]
    qs = [(''.join(rng.choices('abcz', k=rng.randint(1, 7))),
           ''.join(rng.choices('abcz', k=rng.randint(1, 7)))) for _ in range(25)]
    qs += [(w[:rng.randint(1, len(w))], w[-rng.randint(1, len(w)):]) for w in words]
    check(words, qs)
# Full official word/call bounds; every call on the same object.
obj = check(['aaaaaaa'] * 10000, [('a', 'a'), ('aaaaaaa', 'aaaaaaa'), ('b', 'a')])
for i in range(10000):
    assert obj.f('a', 'a') == 9999
assert len(obj.best) == 49
assert check(['a'], [('a', 'a')]).f('aa', 'a') == -1
source = (ROOT / 'solution.py').read_bytes().decode()
mirror = (ROOT / 'python-code.js').read_text()
assert json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').strip().removesuffix(';')) == source
result = {'status': 'pass', 'oracle_queries': count, 'stress_calls': 10000,
          'exhaustive_dictionaries': 258, 'seed': 745, 'seeded_dictionaries': 500,
          'source_mirror_exact': True}
(OUT / 'python-results.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))
