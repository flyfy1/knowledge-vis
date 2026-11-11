"""Author self-check: exact official callable vs shortest-path oracle."""
import sys, os, json, random, itertools, re, ast
from collections import deque
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('EVIDENCE_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
sys.path.insert(0, str(ROOT))
from solution import Solution

def distances(n, k):
    # Independent graph: one vertex per whole bit array; one edge per legal flip.
    target = (1 << n) - 1
    dist = {target: 0}
    queue = deque([target])
    masks = [((1 << k) - 1) << s for s in range(n-k+1)]
    while queue:
        state = queue.popleft()
        for window in masks:
            nxt = state ^ window
            if nxt not in dist:
                dist[nxt] = dist[state] + 1
                queue.append(nxt)
    return dist

def direct(a, k):
    a = a[:]
    flips = 0
    for i in range(len(a)):
        if a[i] == 0:
            if i+k > len(a):
                return -1
            for j in range(i, i+k):
                a[j] = 1-a[j]
            flips += 1
    return flips

solve = Solution().minKBitFlips
count = 0
for n in range(1, 11):
    for k in range(1, n+1):
        oracle = distances(n, k)
        for state in range(1 << n):
            a = [(state >> j) & 1 for j in range(n)]
            before = a[:]
            expected = oracle.get(state, -1)
            assert solve(a, k) == expected == direct(a, k), (a, k, expected)
            assert a == before
            count += 1
seed = 995
rng = random.Random(seed)
for _ in range(1000):
    n = rng.randint(1, 11)
    k = rng.randint(1, n)
    a = [rng.randrange(2) for _ in range(n)]
    expected = distances(n,k).get(sum(x << i for i,x in enumerate(a)), -1)
    assert solve(a,k) == expected
for a,k,expected in [([0,1,0],1,2),([1,1,0],2,-1),([0,0,0,1,0,1,1,0],3,3),([0,1,1,0],2,3),([0]*100000,1,100000),([0]*100000,100000,1),([1]*100000,54321,0),([0]*100000,2,50000),([0]*99999+[1],100000,-1)]:
    assert solve(a,k) == expected
source = (ROOT/'solution.py').read_text()
mirror = (ROOT/'python-code.js').read_text()
assert json.loads(re.fullmatch(r'window.PYTHON_SOURCE = (.*);\n',mirror)[1]) == source
ast.parse(source)
# Guard source-copy definitions against silent key replacement (line based representation).
copy = (ROOT/'copy.js').read_text()
keys = re.findall(r'(?:^|,)\s*(\w+):\s*\[',copy,re.M)
assert len(keys) == len(set(keys)), 'Duplicate localization keys'
assert len(keys)>80
report = {'kind':'author self-check, not independent review','exhaustiveCases':count,'exhaustiveDomain':'all binary arrays n=1..10, all k=1..n','oracle':'BFS over whole-array states, distance from all-ones target','seed':seed,'seededCases':1000,'officialFreshAndMaxCases':9,'inputUnchanged':True,'exactMirror':True,'uniqueCopyKeys':len(keys)}
(OUT/'numerical.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
