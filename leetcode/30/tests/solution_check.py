"""Lesson-local self-check; execute canonical Python against a multiset oracle."""
import importlib.util
import json
import random
from collections import Counter
from pathlib import Path

folder = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('lesson30', folder / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
solve = module.Solution().findSubstring


def oracle(s, words):
    width, count = len(words[0]), len(words)
    return [i for i in range(len(s) - width * count + 1)
            if Counter(s[j:j+width] for j in range(i, i+width*count, width)) == Counter(words)]


cases = [
    ('barfoothefoobarman', ['foo', 'bar'], [0, 9]),
    ('wordgoodgoodgoodbestword', ['word', 'good', 'best', 'word'], []),
    ('barfoofoobarthefoobarman', ['bar', 'foo', 'the'], [6, 9, 12]),
    ('abacabab', ['ab', 'ac', 'ab'], [0, 2]),
    ('abacacad', ['ab', 'ac', 'ad'], []),  # first removal still leaves ac twice
    ('aaaaaa', ['aa', 'aa'], [0, 1, 2]),
    ('xbarfoo', ['bar', 'foo'], [1]),
    ('a', ['aa'], []), ('a', ['a'], [0]), ('b', ['a'], []),
    ('a'*10000, ['a']*5000, list(range(5001))),
    ('a'*10000, ['a'*30]*5000, []),
    ('a'*10000, ['a'*30]*333, list(range(11))),
]
rng = random.Random(30)
for _ in range(3000):
    w = rng.randint(1, 3)
    s = ''.join(rng.choices('abc', k=rng.randint(1, 30)))
    words = [''.join(rng.choices('abc', k=w)) for _ in range(rng.randint(1, 5))]
    cases.append((s, words, oracle(s, words)))
for s, words, expected in cases:
    original = words[:]
    assert sorted(solve(s, words)) == expected, (s, words, expected)
    assert words == original
mirror = (folder / 'python-code.js').read_text()
assert json.loads(mirror.split('=', 1)[1].strip().removesuffix(';')) == (folder / 'solution.py').read_text()
print(f'Canonical Python: {len(cases)} cases passed; input preserved; exact offline mirror parity')
