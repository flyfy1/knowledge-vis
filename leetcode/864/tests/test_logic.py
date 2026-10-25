import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import subprocess
import sys

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))
from oracle import graph_distances
spec = importlib.util.spec_from_file_location('solution864', ROOT / 'solution.py')
solution = importlib.util.module_from_spec(spec)
spec.loader.exec_module(solution)
output = Path(os.environ.get('LESSON_EVIDENCE_DIR', HERE / 'evidence'))
output.mkdir(parents=True, exist_ok=True)

cases = [(['@.a..', '###.#', 'b.A.B'], 8),
         (['@..aA', '..B#.', '....b'], 6), (['@Aa'], -1),
         (['@.aA'], 2), (['b.A.@.aB'], 8), (['bA@.aB'], 6),
         (['@abcdefABCDEF'], 6), (['@', '.', 'a', 'A'], 2)]
# All 2x3 placements of start, one key and its lock, with every remaining
# square independently wall/floor; then all placements with two key pairs.
for k in [1, 2]:
    symbols = '@' + 'aAbB'[:2*k]
    for positions in itertools.permutations(range(6), len(symbols)):
        empty = [i for i in range(6) if i not in positions]
        for walls in itertools.product('.#', repeat=len(empty)):
            row = ['.'] * 6
            for pos, ch in zip(positions, symbols): row[pos] = ch
            for pos, ch in zip(empty, walls): row[pos] = ch
            cases.append(([''.join(row[:3]), ''.join(row[3:])], None))
rng = random.Random(864)
for _ in range(240):
    m, n = rng.choice([(3, 3), (3, 4), (4, 4)])
    k = rng.randint(1, 3)
    chars = ['#' if rng.random() < .22 else '.' for _ in range(m*n)]
    for pos, ch in zip(rng.sample(range(m*n), 1+2*k), '@'+'aAbBcC'[:2*k]): chars[pos] = ch
    cases.append(([''.join(chars[r*n:(r+1)*n]) for r in range(m)], None))
traces = json.loads(subprocess.check_output(['node', str(HERE/'trace_cases.cjs')], input=json.dumps([g for g,_ in cases]).encode()))
for i, ((grid, expected), frames) in enumerate(zip(cases, traces)):
    answer, distances = graph_distances(grid)
    if expected is not None: assert answer == expected, (grid, answer, expected)
    before = list(grid)
    assert solution.Solution().shortestPathAllKeys(grid) == answer, grid
    assert grid == before
    assert frames[-1]['result'] == answer, grid
    previous = set()
    for f in frames:
        actual = {}
        for item in f['seen']:
            r,c,mask = item['s']
            bag = frozenset(chr(97+b) for b in range(6) if mask & (1<<b))
            state = (r,c,bag)
            assert distances[state] == item['d'], (grid, state)
            actual[state] = item['d']
        assert len(actual) == len(f['seen'])
        assert previous <= set(actual)
        # All states through this distance must have been discovered.
        assert actual == {s:d for s,d in distances.items() if d <= f['depth']}
        if f['result'] != -1:
            front = {(r,c,frozenset(chr(97+b) for b in range(6) if mask&(1<<b))) for r,c,mask in f['front']}
            assert front == {s for s,d in distances.items() if d == f['depth']}
        for event in f['events']:
            assert sum(abs(event['from'][j]-event['to'][j]) for j in [0,1]) == 1
        previous = set(actual)
# Closed form maximum grid: straight top-row route to six keys at cols24..29.
large = ['@' + '.'*23 + 'abcdef'] + ['.'*30]*28 + ['ABCDEF'+'.'*24]
assert len(large) == len(large[0]) == 30
assert solution.Solution().shortestPathAllKeys(large) == 29
# The displayed baseline remains the executable independent reference.
import html
assert html.escape((HERE/'oracle.py').read_text()) in (ROOT/'index.html').read_text()
# Exact source mirror (including final newline).
mirror = (ROOT/'python-code.js').read_text()
assert json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').removesuffix(';\n')) == (ROOT/'solution.py').read_text()
# Detect duplicate dictionary keys before JSON can overwrite them.
def unique(pairs):
    result={}
    for key,value in pairs:
        assert key not in result, key
        result[key]=value
    return result
copy=json.loads((ROOT/'copy.js').read_text().removeprefix('window.LESSON_COPY = ').removesuffix(';\n'), object_pairs_hook=unique)
assert all(isinstance(v,list) and len(v)==2 and all(isinstance(x,str) and x for x in v) for v in copy.values())
report={'status':'pass','authorSelfCheck':True,'cases':len(cases),'exhaustive2x3':2400,'seed':864,'randomCases':240,'maxGridAnswer':29,'checks':['canonical Python vs explicit-set relaxation oracle','every trace layer and discovered shortest distance','immutable input','official examples','one row/column','six keys','source mirror exact','copy duplicate-key and pair shape']}
(output/'logic.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
