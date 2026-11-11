"""Independent cross-review check for #1153 (2026-11-11), written without reading the builder's brute force.

test_solution.py proves the rule on small alphabets with the constant 26 substituted. This file runs the
unmodified solution.py against a BFS over the REAL 26-letter alphabet (every legal conversion: pick a letter that
occurs, rewrite all of it to any other of the 26 letters) for every str1 shape of length <= 3 and seeded str2
choices, plus small-alphabet BFS with the rule restated independently.

Usage (repository root):  python3 -B leetcode/1153/tests/test_xreview_bfs.py
"""
import importlib.util
import itertools
import random
import string
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('solution', HERE.parent / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
can = mod.Solution().canConvert


def reachable(start, alphabet):
    seen = {start}
    stack = [start]
    while stack:
        cur = stack.pop()
        for a in set(cur):
            for b in alphabet:
                if b != a:
                    nxt = cur.replace(a, b)
                    if nxt not in seen:
                        seen.add(nxt)
                        stack.append(nxt)
    return seen


def rule(s1, s2, size):
    if s1 == s2:
        return True
    dest = {}
    for a, b in zip(s1, s2):
        if dest.setdefault(a, b) != b:
            return False
    return len(set(s2)) < size


L = string.ascii_lowercase
rng = random.Random(20261111)
real = 0
for n in (1, 2, 3):
    for shape in itertools.product(range(n), repeat=n):
        s1 = ''.join(L[i] for i in shape)
        R = reachable(s1, L)
        targets = {''.join(t) for t in itertools.product('abcz', repeat=n)}
        targets |= {''.join(rng.choice(L) for _ in range(n)) for _ in range(400)}
        for s2 in targets:
            assert can(s1, s2) == (s2 in R), (s1, s2)
            real += 1
small = 0
for size, length in ((2, 6), (3, 5), (4, 4)):
    alpha = L[:size]
    for n in range(1, length + 1):
        words = [''.join(w) for w in itertools.product(alpha, repeat=n)]
        for s1 in words:
            R = reachable(s1, alpha)
            for s2 in words:
                assert rule(s1, s2, size) == (s2 in R), (size, s1, s2)
                small += 1
print(f'26-letter BFS == solution.py on {real} pairs; restated rule == BFS on {small} small-alphabet pairs')
