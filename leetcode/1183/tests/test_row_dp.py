"""Independent exact check for #1183 (cross-review 2026-11-11), written without reading the builder's brute force.

Dynamic programming over rows: a row of `cols` cells is a bitmask, the state is the last s-1 rows, and a new row is
allowed only if every s x s window ending in it holds at most k ones. This is exact (not a bound) and reaches grids the
25-cell exhaustive search in test_solution.py cannot: s = 3 and s = 4 with dimensions not divisible by s.

Usage (repository root):  python3 -B leetcode/1183/tests/test_row_dp.py
"""
import importlib.util
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('solution', HERE.parent / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
solve = mod.Solution().maximumNumberOfOnes


def row_dp(cols, rows, s, k):
    if s == 1:
        return cols * rows if k >= 1 else 0
    full = 1 << cols
    nwin = cols - s + 1
    win = [[bin(m & (((1 << s) - 1) << c)).count('1') for c in range(nwin)] for m in range(full)]
    pop = [bin(m).count('1') for m in range(full)]
    # state: tuple of the last s-1 row masks; the first s-1 rows are unconstrained (no complete window yet)
    import itertools
    dp = {}
    for first in itertools.product(range(full), repeat=s - 1):
        dp[first] = sum(pop[m] for m in first)
    for _ in range(s - 1, rows):
        nd = {}
        for state, val in dp.items():
            base = [sum(win[m][c] for m in state) for c in range(nwin)]
            for m in range(full):
                wm = win[m]
                if all(base[c] + wm[c] <= k for c in range(nwin)):
                    ns = state[1:] + (m,)
                    v = val + pop[m]
                    if nd.get(ns, -1) < v:
                        nd[ns] = v
        dp = nd
    return max(dp.values())


cases = 0
nondiv = 0
for s, col_range, row_range in [(1, range(1, 5), range(1, 6)), (2, range(2, 6), range(2, 9)),
                                (3, range(3, 7), range(3, 11)), (4, range(4, 6), range(4, 9))]:
    for cols in col_range:
        for rows in row_range:
            for k in range(s * s + 1):
                got = row_dp(cols, rows, s, k)
                # width = columns, height = rows; the answer is symmetric, so check both argument orders
                assert solve(cols, rows, s, k) == got == solve(rows, cols, s, k), (cols, rows, s, k, got)
                cases += 1
                if s >= 3 and (cols % s or rows % s):
                    nondiv += 1
print(f'row-DP exact optimum == solution.py on {cases} cases ({nondiv} with s >= 3 and a dimension not divisible by s)')
