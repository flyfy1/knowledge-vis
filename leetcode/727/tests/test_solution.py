"""Author self-check for #727. Run from any directory.
OUTPUT_DIR (default: tests/evidence) receives numerical.json and oracle-fixtures.json."""
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


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


solve = load('solution727', ROOT / 'solution.py').Solution().minWindow
orc = load('oracle727', HERE / 'oracle.py')
oracle, latest_by_definition = orc.oracle, orc.latest_by_definition

compared = 0


def check(s1, s2):
    global compared
    got, want = solve(s1, s2), oracle(s1, s2)
    assert got == want, (s1, s2, got, want)
    compared += 1
    return want


# 1. Exhaustive small inputs: every s1 over {a,b,c} up to length 7, every s2 over {a,b,c} up to length 3.
for n in range(1, 8):
    for s1 in map(''.join, itertools.product('abc', repeat=n)):
        for m in range(1, 4):
            for s2 in map(''.join, itertools.product('abc', repeat=m)):
                check(s1, s2)
exhaustive = compared

# 2. Seeded random cases with skewed alphabets (many ties and repeats).
rng = random.Random(727)
for _ in range(6000):
    alpha = 'abcdefghijklmnopqrstuvwxyz'[:rng.choice([2, 3, 4, 6, 26])]
    s1 = ''.join(rng.choice(alpha) for _ in range(rng.randint(1, 40)))
    s2 = ''.join(rng.choice(alpha) for _ in range(rng.randint(1, 6)))
    check(s1, s2)
randomized = compared - exhaustive

# 2b. Larger seeded cases against the forward/backward scan (also cross-checked with the oracle above).
large = 0
for _ in range(300):
    alpha = 'abcdefghijklmnopqrstuvwxyz'[:rng.choice([2, 3, 5])]
    s1 = ''.join(rng.choice(alpha) for _ in range(rng.randint(100, 3000)))
    s2 = ''.join(rng.choice(alpha) for _ in range(rng.randint(1, 100)))
    assert solve(s1, s2) == orc.forward_backward(s1, s2), (len(s1), s2)
    large += 1
for s1, s2 in itertools.islice(((a, b) for a in map(''.join, itertools.product('ab', repeat=8)) for b in ('a', 'ab', 'ba', 'aab')), 2000):
    assert orc.forward_backward(s1, s2) == oracle(s1, s2)

# 3. Named cases used in the lesson text, plus boundary cases.
named = {
    ('xcaxctat', 'cat'): 'ctat', ('axbcayb', 'ab'): 'axb', ('abaab', 'aa'): 'aa',
    ('abcabdbe', 'abe'): 'abdbe', ('ta', 'at'): '', ('aaa', 'aaaa'): '', ('babcb', 'bb'): 'bab',
    ('a', 'aa'): '', ('a', 'a'): 'a', ('b', 'a'): '', ('abab', 'b'): 'b', ('zzz', 'z'): 'z',
}
for (s1, s2), expected in named.items():
    assert check(s1, s2) == expected, (s1, s2, expected)

# Brute-force counts quoted in step 2 (letters read from each start of xcaxctat / cat).
def brute_reads(s1, s2):
    reads = []
    for i in range(len(s1)):
        k = read = 0
        for j in range(i, len(s1)):
            read += 1
            if s1[j] == s2[k]:
                k += 1
                if k == len(s2):
                    break
        reads.append(read)
    return reads
assert brute_reads('xcaxctat', 'cat') == [6, 5, 6, 5, 4, 3, 2, 1] and sum(brute_reads('xcaxctat', 'cat')) == 32
assert sum(1 for i in range(8) if 5 in range(i, i + brute_reads('xcaxctat', 'cat')[i])) == 6

# 4. Maximum sizes and the complexity claim (n = 2*10^4, m = 100).
timings = {}
cases = {
    'all_a_no_b': ('a' * 20000, 'a' * 99 + 'b'),
    'random_ab': (''.join(rng.choice('ab') for _ in range(20000)), ''.join(rng.choice('ab') for _ in range(100))),
    'answer_at_end': ('b' * 19900 + 'a' * 100, 'a' * 100),
    'random_26': (''.join(rng.choice('abcdefghijklmnopqrstuvwxyz') for _ in range(20000)), 'abc' * 33 + 'a'),
}
for name, (s1, s2) in cases.items():
    start = time.perf_counter()
    got = solve(s1, s2)
    timings[name] = round(time.perf_counter() - start, 3)
    assert timings[name] < 5, (name, timings[name])
    # The enumerate-all oracle is too slow here; use the structurally different forward/backward scan.
    assert got == orc.forward_backward(s1, s2), name
    if got:
        assert orc.is_subsequence(s2, got) and got in s1
assert solve(*cases['all_a_no_b']) == ''
assert solve(*cases['answer_at_end']) == 'a' * 100

# 5. Mirror, copy shape and duplicate keys.
source = (ROOT / 'solution.py').read_text()
assert (ROOT / 'python-code.js').read_text() == 'window.PYTHON_SOURCE = ' + json.dumps(source) + ';\n'


def unique(pairs):
    out = {}
    for k, v in pairs:
        assert k not in out, 'duplicate copy key ' + k
        out[k] = v
    return out


text = (ROOT / 'copy.js').read_text()
assert text.startswith('window.COPY = ') and text.endswith(';\n')
copy = json.loads(text[len('window.COPY = '):-2], object_pairs_hook=unique)
assert copy['sep'] == ['', ' ']  # sentence separator: none in Chinese, one space in English
assert all(isinstance(v, list) and len(v) == 2 and all(isinstance(x, str) and x.strip() for x in v) for k, v in copy.items() if k != 'sep')

# 6. Fixtures for the browser core: answers plus slot values checked against the definition.
fixtures = []
frng = random.Random(7270)
fixture_inputs = [k for k in named if len(k[0]) <= 20 and len(k[1]) <= 6]
for _ in range(400):
    alpha = 'abc'[:frng.choice([2, 3])]
    fixture_inputs.append((''.join(frng.choice(alpha) for _ in range(frng.randint(1, 12))), ''.join(frng.choice(alpha) for _ in range(frng.randint(1, 4)))))
for s1, s2 in fixture_inputs:
    slots = [[latest_by_definition(s1, s2, j, k) for k in range(1, len(s2) + 1)] for j in range(len(s1))]
    fixtures.append({'s1': s1, 's2': s2, 'answer': oracle(s1, s2), 'slots': slots, 'reads': brute_reads(s1, s2)})
(OUT / 'oracle-fixtures.json').write_text(json.dumps(fixtures) + '\n')
proc = subprocess.run(['node', str(HERE / 'test_core.cjs'), str(OUT / 'oracle-fixtures.json')], capture_output=True, text=True)
if proc.returncode:
    print(proc.stdout, proc.stderr)
    raise SystemExit('core test failed')

report = {'kind': 'author self-check against an independent enumerate-all-windows oracle',
          'exhaustiveComparisons': exhaustive, 'seededRandomComparisons': randomized,
          'totalComparisons': compared, 'largeForwardBackwardComparisons': large, 'seed': 727, 'maxSizeSeconds': timings,
          'copyPairs': len(copy), 'sourceMirrorExact': True, 'core': json.loads(proc.stdout)}
(OUT / 'numerical.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
