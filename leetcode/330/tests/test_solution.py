"""Independent set-state BFS oracle; output may go outside the frozen lesson."""
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
from html.parser import HTMLParser
from collections import deque

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('LESSON_TEST_OUTPUT_DIR', ROOT/'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('solution330', ROOT/'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
solve = mod.Solution().minPatches

# State is the entire reachable set, not a coverage frontier or greedy rule.
def reachable(nums, n):
    state = 1
    mask = (1 << (n+1)) - 1
    for value in nums:
        state = (state | (state << value)) & mask
    return state

def oracle(nums, n):
    mask = (1 << (n+1)) - 1
    initial = reachable(nums, n)
    todo = deque([(initial, 0)])
    seen = {initial}
    while todo:
        state, cost = todo.popleft()
        if state == mask:
            return cost
        for value in range(1, n+1):
            nxt = (state | (state << value)) & mask
            if nxt not in seen:
                seen.add(nxt)
                todo.append((nxt, cost+1))

baseline_spec = importlib.util.spec_from_file_location('baseline330', ROOT/'baseline.py')
baseline_mod = importlib.util.module_from_spec(baseline_spec)
baseline_spec.loader.exec_module(baseline_mod)
baseline_cases = 0
for length in range(1,4):
    for nums in itertools.combinations_with_replacement(range(1,5), length):
        for n in range(1,7):
            assert baseline_mod.exhaustive(list(nums), n) == oracle(nums,n)
            baseline_cases += 1
class BaselineDisplay(HTMLParser):
    def __init__(self):
        super().__init__(); self.active = False; self.source = ''
    def handle_starttag(self, tag, attrs):
        if tag == 'code' and dict(attrs).get('id') == 'baselineCode': self.active = True
    def handle_data(self, data):
        if self.active: self.source += data
    def handle_endtag(self, tag):
        if tag == 'code': self.active = False
parser = BaselineDisplay(); parser.feed((ROOT/'index.html').read_text())
assert parser.source == (ROOT/'baseline.py').read_text()

fixtures = []
for length in range(1,5):
    for nums in itertools.combinations_with_replacement(range(1,7), length):
        for n in range(1,11):
            fixtures.append((list(nums), n, oracle(nums,n)))
rng = random.Random(330)
for _ in range(300):
    nums = sorted(rng.randint(1,15) for _ in range(rng.randint(1,7)))
    n = rng.randint(1,12)
    fixtures.append((nums,n,oracle(nums,n)))
for nums,n,expected in fixtures:
    original = nums.copy()
    assert solve(nums,n) == expected, (nums,n,expected)
    assert nums == original

large = [([1,3],6,1),([1,5,10],20,2),([1,2,2],5,0),([2],1,1),
         ([1],2147483647,30),([10000],2147483647,31),
         ([10000]*1000,2147483647,22),([1]*1000,1000,0)]
# For 1000 copies of 10000: 14 patches cover 0..16383; originals
# extend to 10016383. Eight further doublings pass 2^31-1, totaling 22.
for nums,n,expected in large:
    assert solve(nums,n) == expected, (len(nums),nums[0],n,expected,solve(nums,n))

# Exact mirror equality and duplicate-key detection before JSON can overwrite.
source = (ROOT/'solution.py').read_text()
mirror = (ROOT/'python-code.js').read_text()
assert mirror == 'window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
def unique(pairs):
    obj = {}
    for key,value in pairs:
        assert key not in obj, key
        obj[key] = value
    return obj
copy = json.loads((ROOT/'copy.js').read_text().removeprefix('window.LESSON_COPY = ').strip().removesuffix(';'), object_pairs_hook=unique)
assert all(len(v)==2 and all(isinstance(s,str) and s for s in v) for v in copy.values())
(OUT/'oracle-fixtures.json').write_text(json.dumps(fixtures))
(OUT/'python-results.json').write_text(json.dumps({'kind':'author self-check','smallCases':len(fixtures),'largeCases':len(large),'baselineCases':baseline_cases,'oracle':'BFS over full capped reachable-sum sets, all patch values 1..n','seed':330,'sourceMirror':'exact','copyKeys':len(copy)},indent=2))
print(f'PASS: {len(fixtures)} small cases, {len(large)} official/boundary cases; {baseline_cases} exhaustive-baseline cases; source parity and unique copy keys')
