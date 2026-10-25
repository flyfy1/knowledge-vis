"""Run from any directory. OUTPUT_DIR redirects generated evidence."""
import importlib.util
import json
import os
from pathlib import Path
import random
import re
import sys
sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('submission', ROOT / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
solve = mod.Solution().findKthNumber
cases = 0
for m in range(1, 13):
    for n in range(1, 13):
        cells = sorted(i*j for i in range(1, m+1) for j in range(1, n+1))
        for k, expected in enumerate(cells, 1):
            assert solve(m, n, k) == expected, (m, n, k, expected)
            cases += 1
rng = random.Random(668)
for _ in range(400):
    m, n = rng.randint(1, 60), rng.randint(1, 60)
    k = rng.randint(1, m*n)
    expected = sorted(i*j for i in range(1, m+1) for j in range(1, n+1))[k-1]
    assert solve(m, n, k) == expected
    assert solve(n, m, k) == expected
    cases += 2
large = [(30000,30000,1,1), (30000,30000,900000000,900000000),
         (30000,30000,899999999,899970000), (1,30000,17432,17432),
         (30000,1,30000,30000), (1,1,1,1), (3,3,5,3), (2,3,6,6)]
for m,n,k,expected in large:
    assert solve(m,n,k) == expected
    cases += 1
source = (ROOT/'solution.py').read_text()
mirror = (ROOT/'python-code.js').read_text()
assert re.fullmatch(r'window\.PYTHON_SOURCE = ("(?:[^"\\]|\\.)*");\n', mirror)
assert json.loads(mirror.split(' = ',1)[1].strip().removesuffix(';')) == source
# Detect duplicate definitions before JSON parsing could silently overwrite them.
def unique(pairs):
    result = {}
    for key,value in pairs:
        assert key not in result, 'Duplicate copy key: '+key
        result[key] = value
    return result
copy = json.loads((ROOT/'copy.js').read_text().split(' = ',1)[1].strip().removesuffix(';'), object_pairs_hook=unique)
for key,pair in copy.items():
    assert isinstance(pair,list) and len(pair)==2 and all(isinstance(x,str) and x for x in pair), key
    assert set(re.findall(r'\{\w+\}',pair[0])) == set(re.findall(r'\{\w+\}',pair[1])), key
keys = re.findall(r'data-i18n="([^"]+)"',(ROOT/'index.html').read_text())
assert all(k in copy for k in keys)
report = {'kind':'author self-check','python_cases':cases,'exhaustive':'all k for m,n=1..12','seed':668,'seeded_cases':400,'large_closed_form_cases':large,'source_mirror_exact':True,'copy_unique_pairs':len(copy),'official_python3_interface':'Solution.findKthNumber(self,m:int,n:int,k:int)->int'}
(OUT/'solution-results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
