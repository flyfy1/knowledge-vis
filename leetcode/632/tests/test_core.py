"""Run from any directory: python3 -B leetcode/632/tests/test_core.py.
OUTPUT_DIR controls all emitted evidence; no frozen source is modified.
"""
import copy
import hashlib
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
spec = importlib.util.spec_from_file_location('solution632', ROOT / 'solution.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

def oracle(rows):
    # Cartesian enumeration: no heap/pointer advancement.
    return list(min(((min(c), max(c)) for c in itertools.product(*rows)),
                    key=lambda ab: (ab[1]-ab[0], ab[0])))

row_pool = [list(c) for n in range(1, 4)
            for c in itertools.combinations_with_replacement([-1, 0, 1], n)]
cases = [[list(r) for r in rows] for k in range(1, 4)
         for rows in itertools.product(row_pool, repeat=k)]
exhaustive = len(cases)
rng = random.Random(632)
for _ in range(1500):
    cases.append([sorted(rng.randint(-10, 10) for _ in range(rng.randint(1, 5)))
                  for _ in range(rng.randint(1, 5))])
cases += [[[1,5],[2,6],[4,7]], [[2,8],[4,9],[6,10]],
          [[4,10,15,24,26],[0,9,12,20],[5,18,22,30]],
          [[1,2,3]]*3, [[-100000],[100000]]]
for rows in cases:
    before = copy.deepcopy(rows)
    assert m.Solution().smallestRange(rows) == oracle(rows), rows
    assert rows == before
# Execute browser numerical model outside the browser, checking every intermediate frame.
js = "const C=require(process.argv[1]);let s='';process.stdin.on('data',x=>s+=x);process.stdin.on('end',()=>process.stdout.write(JSON.stringify(JSON.parse(s).map(C.trace))));"
p = subprocess.run(['node', '-e', js, str(ROOT/'core.js')], input=json.dumps(cases),
                   text=True, capture_output=True, check=True)
frame_count = 0
for rows, frames in zip(cases, json.loads(p.stdout)):
    seen = []
    prev = None
    for f in frames:
        frame_count += 1
        vals = [r[i] for r, i in zip(rows, f['p'])]
        assert vals == f['values']
        ab = [min(vals), max(vals)]
        assert ab == [f['lo'], f['hi']]
        seen.append(ab)
        assert f['best'] == min(seen, key=lambda q:(q[1]-q[0], q[0]))
        assert len(f['ledger']) == len(seen)
        assert f['row'] == vals.index(min(vals))
        assert f['done'] == (f['p'][f['row']]+1 == len(rows[f['row']]))
        if prev:
            expected = prev['p'][:]
            expected[prev['row']] += 1
            assert expected == f['p']
        # Check the discarded-family dominance on small choices independently:
        # every choice using an earlier row index is no better than best so far.
        for indices in itertools.product(*(range(len(r)) for r in rows)):
            if any(i < j for i,j in zip(indices,f['p'])):
                v=[rows[r][i] for r,i in enumerate(indices)]
                assert (max(v)-min(v), min(v)) >= (f['best'][1]-f['best'][0],f['best'][0])
        prev=f
    assert frames[-1]['done']
    assert frames[-1]['best'] == oracle(rows)
large = [list(range(-100000, -99950)) for _ in range(3500)]
assert m.Solution().smallestRange(large) == [-100000, -100000]
assert m.Solution().smallestRange([[0]*49+[100000] for _ in range(3499)]+[[100000]*50]) == [100000,100000]
source=(ROOT/'solution.py').read_text()
mirror=(ROOT/'python-code.js').read_text()
assert mirror == 'window.PYTHON_SOURCE = '+json.dumps(source,ensure_ascii=False)+';\n'
# Duplicate detection before JS object keys could be overwritten, for this pair-only file.
import re
copy_text=(ROOT/'copy.js').read_text()
keys=re.findall(r'(?:^|[,{])\s*(\w+)\s*:\s*\[',copy_text)
assert len(keys)==len(set(keys))
# Assert every translation is a complete pair through the real JS parser.
parsed=subprocess.run(['node','-e',"global.window={};require(process.argv[1]);process.stdout.write(JSON.stringify(window.LESSON_COPY));",str(ROOT/'copy.js')],text=True,capture_output=True,check=True)
assert len(json.loads(parsed.stdout))==len(keys)
assert all(isinstance(v,list) and len(v)==2 and all(isinstance(x,str) and x for x in v) for v in json.loads(parsed.stdout).values())
report={'exhaustive_inputs':exhaustive,'seed':632,'random_inputs':1500,'total_cases':len(cases),'intermediate_frames':frame_count,'maximum_shape':[3500,50],'source_sha256':hashlib.sha256(source.encode()).hexdigest(),'duplicate_copy_keys':0,'result':'passed'}
(OUT/'core.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
