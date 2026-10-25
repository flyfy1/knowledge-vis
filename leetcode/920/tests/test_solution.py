"""Author checks. Run python3 -B leetcode/920/tests/test_solution.py.
Set OUTPUT_DIR to redirect every generated artifact outside the candidate.
"""
import sys
sys.dont_write_bytecode = True
import itertools
import json
import math
import os
from pathlib import Path
import random
import re
import subprocess
import importlib.util

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('canonical', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
solve = module.Solution().numMusicPlaylists


def oracle_buckets(n, length, k):
    counts = [0] * (n + 1)
    for sequence in itertools.product(range(n), repeat=length):
        previous = {}
        legal = True
        for i, song in enumerate(sequence):
            if song in previous and i - previous[song] <= k:
                legal = False
                break
            previous[song] = i
        if legal:
            counts[len(previous)] += 1
    return counts


def inclusion_exclusion(n, goal, k):
    # First k positions are distinct. Exclude missing songs from the remaining
    # n-k identity slots; independent onto-map count, not the lesson recurrence.
    m = n - k
    onto = sum((-1)**r * math.comb(m, r) * (m-r)**(goal-k)
               for r in range(m + 1))
    return math.factorial(n) // math.factorial(m) * onto % 1_000_000_007


checked = 0
for n in range(1, 5):
    for goal in range(n, 8):
        for k in range(n):
            expected = oracle_buckets(n, goal, k)[n]
            assert solve(n, goal, k) == expected
            assert inclusion_exclusion(n, goal, k) == expected
            checked += 1
rng = random.Random(920)
for _ in range(180):
    n = rng.randint(1, 100)
    goal = rng.randint(n, 100)
    k = rng.randrange(n)
    assert solve(n, goal, k) == inclusion_exclusion(n, goal, k)
    checked += 1
for n in range(1, 101):
    expected = math.factorial(n) % 1_000_000_007
    assert solve(n, n, 0) == expected
    assert solve(n, 100, n-1) == expected
assert solve(1, 100, 0) == 1
for args, expected in [((3,3,1),6),((2,3,0),6),((2,3,1),2),((3,4,1),18)]:
    assert solve(*args) == expected

js = 'const c=require('+json.dumps(str(ROOT/'core.js'))+');process.stdout.write(JSON.stringify(c.presets.map(p=>c.trace(p))));'
models = json.loads(subprocess.check_output(['node','-e',js]))
frames_checked = 0
for model in models:
    n, k, goal = (model[x] for x in ('n','k','goal'))
    buckets = [oracle_buckets(n, i, k) for i in range(goal+1)]
    for index, frame in enumerate(model['frames']):
        for i, row in enumerate(frame['table']):
            for j, value in enumerate(row):
                computed = i == 0 or j == 0 or (i-1)*n+j <= index
                assert (value is not None) == computed
                if computed:
                    assert value == buckets[i][j], (model,index,i,j,value,buckets[i][j])
        if index:
            i,j=frame['i'],frame['j']
            assert frame['newCount'] == buckets[i-1][j-1]*(n-j+1)
            assert frame['replayCount'] == buckets[i-1][j]*max(j-k,0)
            assert frame['value'] == buckets[i][j]
        frames_checked += 1
    assert model['frames'][-1]['value'] == solve(n, goal, k)

source = (ROOT/'solution.py').read_text()
mirror = (ROOT/'python-code.js').read_text()
assert json.loads(re.fullmatch(r'window.PYTHON_SOURCE = (.*);\n', mirror)[1]) == source
# Detect duplicate localization keys before a JSON parser can overwrite them.
def unique(pairs):
    result = {}
    for key,value in pairs:
        assert key not in result, 'duplicate copy key: '+key
        result[key] = value
    return result
copy = json.loads((ROOT/'copy.js').read_text().removeprefix('window.COPY = ').removesuffix(';\n'), object_pairs_hook=unique)
assert all(isinstance(v,list) and len(v)==2 and all(isinstance(s,str) and s for s in v) for v in copy.values())
html = (ROOT/'index.html').read_text()
assert all(key in copy for key in re.findall(r'data-i18n="(.*?)"',html))
# Execute the displayed baseline as well, checking its k=0 window semantics.
baseline_text = re.search(r'<code>(from itertools.*?)</code>',html,re.S)[1].replace('&gt;','>').replace('&lt;','<')
ns = {};exec(baseline_text,ns)
for n in range(1,4):
    for goal in range(n,6):
        for k in range(n):
            assert ns['baseline'](n,goal,k) == oracle_buckets(n,goal,k)[n]
css_bytes = (ROOT/'style.css').stat().st_size + (ROOT.parent/'style.css').stat().st_size
assert css_bytes < 25000
report = {'type':'author self-check','canonicalCases':checked+205,'traceFrames':frames_checked,'allIntermediateKnownCells':'independent enumeration by last-occurrence distance','seed':920,'sourceParity':True,'copyKeys':len(copy),'shippedCssBytes':css_bytes,'result':'pass'}
(OUT/'numerical.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
