"""Run: python3 -B leetcode/630/tests/test_solution.py. OUTPUT_DIR controls evidence."""
import copy
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('candidate', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
solve = module.Solution().scheduleCourse

def oracle(courses):
    # Enumerate subsets, not greedy choices. Feasibility checked in deadline order.
    ordered = sorted(courses, key=lambda c: c[1])
    best = 0
    for mask in range(1 << len(courses)):
        total = count = 0
        for i, (duration, deadline) in enumerate(ordered):
            if mask & (1 << i):
                total += duration
                if total > deadline:
                    break
                count += 1
        else:
            best = max(best, count)
    return best

def order_oracle(courses, total=0, mask=0):
    # Does not assume deadline ordering: try every next legal course.
    return max([0] + [1 + order_oracle(courses, total + d, mask | (1 << i))
                      for i, (d, last) in enumerate(courses)
                      if not mask & (1 << i) and total + d <= last])

choices = [[1,1],[1,2],[2,1],[2,2],[2,3],[3,4]]
cases = [[]] + [list(c) for n in range(1,5) for c in itertools.product(choices, repeat=n)]
rng = random.Random(630)
cases += [[[rng.randint(1,10),rng.randint(1,20)] for _ in range(rng.randint(1,9))] for _ in range(500)]
examples = [([[100,200],[200,1300],[1000,1250],[2000,3200]],3), ([[1,2]],1), ([[3,2],[4,3]],0), ([[5,5],[4,6],[2,7],[1,7]],3), ([[2,2],[1,3]],2)]
for case, expected in examples:
    assert solve(case) == oracle(case) == expected
for index, case in enumerate(cases):
    old = copy.deepcopy(case)
    assert solve(case) == oracle(case), case
    assert case == old
    if index % 19 == 0:
        assert oracle(case) == order_oracle(case), case
boundaries = [([[1,10000]]*10000,10000), ([[10000,10000]]*10000,1), ([[10000,1]]*10000,0)]
for case, expected in boundaries:
    assert solve(case) == expected
# Retrieve browser simulation snapshots; independent expected results remain in Python.
js = "const C=require(process.argv[1]);let s='';process.stdin.on('data',x=>s+=x);process.stdin.on('end',()=>process.stdout.write(JSON.stringify(JSON.parse(s).map(C.trace))));"
framesets = json.loads(subprocess.check_output(['node','-e',js,str(ROOT/'core.js')], input=json.dumps(cases).encode()))
for case, frames in zip(cases, framesets):
    assert len(frames) == len(case)+1
    for k, frame in enumerate(frames):
        ids = frame['kept']
        assert len(ids) == len(set(ids))
        assert frame['total'] == sum(case[i][0] for i in ids)
        total = 0
        for c in frame['order']:
            if c['id'] in ids:
                total += c['d']
                assert total <= c['last']
        prefix = [[c['d'],c['last']] for c in frame['order'][:k]]
        assert len(ids) == oracle(prefix), (case, frame)
        assert frame['k'] == k and len(frame['ledger']) == k
        if k:
            r = frame['ledger'][-1]
            assert r['before'] + r['d'] == r['trial']
            assert r['total'] == r['trial'] - (case[r['removed']][0] if r['removed'] is not None else 0)
source = (ROOT/'solution.py').read_text()
mirror = (ROOT/'python-code.js').read_text()
assert mirror == 'window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
report = {'kind':'author self-check, not independent review','cases':len(cases),'official_examples':3,'large_boundaries':3,'trace_frames':sum(map(len,framesets)),'checks':'subset oracle, sampled all-order oracle, every prefix feasible and optimal, immutable input, snapshot accounting, exact source mirror','result':'pass'}
(OUT/'algorithm-results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
