import itertools
import json
import os
from pathlib import Path
import random
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from solution import Solution
from baseline import baseline


def oracle(routes, source, target):
    """Independent all-pairs route graph shortest paths, no stop queue/index."""
    if source == target:
        return 0
    n = len(routes)
    inf = n + 1
    sets = list(map(set, routes))
    d = [[0 if i == j else 1 if sets[i] & sets[j] else inf for j in range(n)] for i in range(n)]
    for k in range(n):
        for i in range(n):
            for j in range(n):
                d[i][j] = min(d[i][j], d[i][k] + d[k][j])
    best = min((1 + d[i][j] for i in range(n) for j in range(n) if source in sets[i] and target in sets[j]), default=inf)
    return best if best <= n else -1


def main():
    solution = Solution()
    count = 0
    def check(routes, s, t, expected=None):
        nonlocal count
        original = [r[:] for r in routes]
        want = oracle(routes, s, t) if expected is None else expected
        actual = solution.numBusesToDestination(routes, s, t)
        assert actual == want, (routes, s, t, want, actual)
        assert routes == original
        if expected is None:
            assert baseline(routes, s, t) == want
        count += 1
    check([[1,2,7],[3,6,7]],1,6,2)
    check([[7,12],[4,5,15],[6],[15,19],[9,12,13]],15,12,-1)
    subsets = [[x for x in range(3) if mask >> x & 1] for mask in range(1,8)]
    for n in range(1,4):
        for routes in itertools.product(subsets, repeat=n):
            for s,t in itertools.product(range(4),repeat=2):
                check([r[:] for r in routes],s,t)
    rng = random.Random(815)
    for _ in range(1200):
        routes = [rng.sample(range(12),rng.randint(1,8)) for _ in range(rng.randint(1,8))]
        check(routes,rng.randrange(14),rng.randrange(14))
    # Maximum valid total route length and route count, three different structures.
    check([list(range(100000))],99999,0,1)  # wraparound on a cyclic route
    disjoint = [list(range(i*200,(i+1)*200)) for i in range(500)]
    check(disjoint,0,99999,-1)
    hub = [[0]+list(range(1+i*199,1+(i+1)*199)) for i in range(500)]
    check(hub,1,99500,2)
    chain = [[i,i+1] for i in range(500)]
    check(chain,0,500,500)
    check([[0]],999999,999999,0)
    check([[0]],0,999999,-1)
    def unique_pairs(items):
        result = {}
        for key, value in items:
            assert key not in result, ('duplicate copy key', key)
            result[key] = value
        return result
    copy_text = (ROOT/'copy.js').read_text()
    copy = json.loads(copy_text.removeprefix('window.LESSON_COPY = ').removesuffix(';\n'), object_pairs_hook=unique_pairs)
    assert all(len(pair) == 2 and all(isinstance(x, str) and x for x in pair) for pair in copy.values())
    mirror = (ROOT/'python-code.js').read_text()
    assert mirror == 'window.PYTHON_SOURCE = '+json.dumps((ROOT/'solution.py').read_text())+';\n'
    out = Path(os.environ.get('EVIDENCE_DIR',ROOT/'tests/evidence'));out.mkdir(parents=True,exist_ok=True)
    report = {'kind':'author computational self-check','result':'pass','canonicalCalls':count,'oracle':'Floyd-Warshall on route-intersection graph','baseline':'pairwise graph BFS checked on all exhaustive and random small cases','seed':815,'maxima':'M=100000, R=500; cyclic wrap, disjoint, shared hub, 500-bus chain','mutation':'unchanged input verified','mirror':'exact bytes including final newline'}
    (out/'solution-results.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report))


if __name__ == '__main__':
    main()
