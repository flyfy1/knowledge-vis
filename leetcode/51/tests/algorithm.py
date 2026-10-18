"""Run from any directory: python3 leetcode/51/tests/algorithm.py."""
from pathlib import Path
from itertools import permutations
import sys
sys.dont_write_bytecode = True
import importlib.util
import json
import subprocess
import re

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('solution51', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
solve = module.Solution().solveNQueens

def oracle(n):
    return {tuple('.' * c + 'Q' + '.' * (n - c - 1) for c in p)
            for p in permutations(range(n))
            if all(abs(a-b) != abs(p[a]-p[b])
                   for a in range(n) for b in range(a))}

expected = [1, 0, 0, 2, 10, 4, 40, 92, 352]
for n, count in enumerate(expected, 1):
    boards = solve(n)
    assert len(boards) == count
    assert len({tuple(b) for b in boards}) == count
    for b in boards:
        assert len(b) == n and all(len(row) == n and row.count('Q') == 1 and set(row) <= {'.','Q'} for row in b)
        p = [row.index('Q') for row in b]
        assert len(set(p)) == n
        assert all(abs(a-b) != abs(p[a]-p[b]) for a in range(n) for b in range(a))
    if n <= 8:
        assert {tuple(b) for b in boards} == oracle(n)
    print(f'n={n}: {count} unique valid boards; ' + ('independent permutation oracle matched' if n <= 8 else 'maximum constraint checked'))

runs = json.loads(subprocess.check_output(['node', '-e',
    'const q=require(process.argv[1]);console.log(JSON.stringify([1,2,3,4].map(n=>q.trace(n))))', str(ROOT / 'core.js')]))
for run in runs:
    n = run['n']
    assert {tuple(b) for b in run['solutions']} == oracle(n)
    frames = run['frames']
    for i, f in enumerate(frames):
        p = f['placement']
        assert len(p) == len(set(p))
        assert f['cols'] == sorted(p)
        assert f['down'] == sorted(r-c for r,c in enumerate(p))
        assert f['up'] == sorted(r+c for r,c in enumerate(p))
        assert len(f['down']) == len(set(f['down']))
        assert len(f['up']) == len(set(f['up']))
        if not i:
            continue
        prev = frames[i-1]
        if f['kind'] == 'place':
            assert p == prev['placement'] + [f['c']]
        elif f['kind'] == 'undo':
            assert prev['placement'] == p + [f['c']]
            assert f['solutions'] == prev['solutions']
        elif f['kind'] == 'reject':
            assert p == prev['placement']
            conflicts = [k for k, v in [('cols', f['c']), ('down', f['r']-f['c']), ('up', f['r']+f['c'])] if v in f[k]]
            assert conflicts == f['conflicts'] and conflicts
        elif f['kind'] == 'solution':
            assert len(p) == n and len(f['solutions']) == len(prev['solutions'])+1
        assert all(tuple(b) in oracle(n) for b in f['solutions'])
    assert frames[-1]['placement'] == []
    print(f'trace n={n}: {len(frames)} snapshots, every transition and constraint invariant checked')
source = (ROOT / 'solution.py').read_text()
mirror = json.loads((ROOT / 'python-code.js').read_text().removeprefix('window.PYTHON_SOURCE = ').strip().removesuffix(';'))
assert source == mirror
print('Exact Python mirror parity passed')
