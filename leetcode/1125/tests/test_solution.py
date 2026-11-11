"""Independent set-union oracle; run with python3 -B. OUTPUT_DIR is optional."""
import ast
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
spec = importlib.util.spec_from_file_location('solution', ROOT / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
solve = mod.Solution().smallestSufficientTeam


def oracle(req, people):
    for k in range(len(people) + 1):
        for team in itertools.combinations(range(len(people)), k):
            if set().union(*(set(people[i]) for i in team)) == set(req):
                return list(team)
    return None


count = 0
fixtures = []

def check(req, people):
    global count
    expected = oracle(req, people)
    if expected is None:
        return
    original = copy.deepcopy((req, people))
    got = solve(req, people)
    assert len(got) == len(expected), (req, people, got, expected)
    assert len(got) == len(set(got))
    assert all(0 <= i < len(people) for i in got)
    assert set().union(*(set(people[i]) for i in got)) == set(req)
    assert (req, people) == original
    fixtures.append({'skills': req, 'people': people, 'size': len(expected)})
    count += 1

# All length-1..4 person lists on all three-skill subsets.
for m in range(1, 4):
    req = list('abc'[:m])
    subsets = [[s for j, s in enumerate(req) if mask & (1 << j)] for mask in range(1 << m)]
    for n in range(1, 5):
        for people in itertools.product(subsets, repeat=n):
            check(req, list(people))
rng = random.Random(1125)
for _ in range(350):
    req = list('abcdef'[:rng.randint(1, 6)])
    people = [[s for s in req if rng.random() < .4] for _ in range(rng.randint(1, 10))]
    check(req, people)
raw = json.loads((ROOT/'provenance/official.json').read_text())['response']['data']['question']
examples = raw['exampleTestcases'].splitlines()
for i in (0, 2):
    check(json.loads(examples[i]), json.loads(examples[i+1]))
# Maximum m and n: exact optimum 16; no exponential person-subset oracle here.
req = [chr(97+j) for j in range(16)]
people = [[s] for s in req] + [[] for _ in range(44)]
assert solve(req, people) == list(range(16))
# Full coverage appears only at last person; all others empty.
assert solve(req, [[]]*59+[req]) == [59]
# Official string-length boundary.
check(['a'*16], [[], ['a'*16], ['a'*16]])
# Execute the actual baseline displayed in HTML too.
import re, html
baseline_source = html.unescape(re.search(r'<code>(from itertools.*?</code>)', (ROOT/'index.html').read_text(), re.S).group(1).removesuffix('</code>'))
ns = {}; exec(baseline_source, ns)
for case in fixtures[::71]:
    assert len(ns['baseline'](case['skills'], case['people'])) == case['size']
(OUT/'oracle-fixtures.json').write_text(json.dumps(fixtures))
(OUT/'python-results.json').write_text(json.dumps({'status':'pass','oracleCases':count,'maximumCases':2,'baselineExecuted':True,'seed':1125},indent=2))
print('PASS', count, 'oracle cases, 2 maximum cases, displayed baseline')
