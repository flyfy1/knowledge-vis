"""Author computational checks. OUTPUT_DIR keeps reviewer outputs separate."""
import ast
import hashlib
import importlib.util
import itertools
import html
import re
import json
import os
from pathlib import Path
import random
import time

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence')).resolve()
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('submission', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def next_states(g, s):
    m, c, t = s
    if t == 1:
        return [(v, c, 2) for v in g[m]]
    return [(m, v, 1) for v in g[c] if v]


def scan(g):
    """Synchronous whole-state fixed point, no queue or degree counter."""
    states = [(m, c, t) for m in range(len(g))
              for c in range(1, len(g)) for t in (1, 2)]
    win = {s: 1 if s[0] == 0 else 2 if s[0] == s[1] else 0
           for s in states}
    while True:
        new = dict(win)
        for s in states:
            if win[s]:
                continue
            options = [win[ch] for ch in next_states(g, s)]
            if s[2] in options:
                new[s] = s[2]
            elif set(options) == {3 - s[2]}:
                new[s] = 3 - s[2]
        if new == win:
            return {','.join(map(str, s)): v for s, v in win.items()}
        win = new


def history_search(g, state=(1, 2, 1), seen=frozenset()):
    """Literal rules oracle: repeated full state draws, no state merging."""
    m, c, t = state
    if m == 0:
        return 1
    if m == c:
        return 2
    if state in seen:
        return 0
    outcomes = [history_search(g, child, seen | {state})
                for child in next_states(g, state)]
    return t if t in outcomes else 0 if 0 in outcomes else 3 - t


def valid(g):
    return all(g) and all(any(v != 0 for v in g[c]) for c in range(1, len(g)))


def from_mask(n, mask):
    g = [[] for _ in range(n)]
    for bit, (a, b) in enumerate(itertools.combinations(range(n), 2)):
        if mask >> bit & 1:
            g[a].append(b)
            g[b].append(a)
    return g


baseline_code = html.unescape(re.search(r'<code>(def full_scan.*?)</code>', ROOT.joinpath('index.html').read_text(), re.S).group(1))
baseline_ns = {}
exec(baseline_code, baseline_ns)
start = time.monotonic()
cases = []
history_count = 0
for n in range(3, 6):
    for mask in range(1 << (n * (n - 1) // 2)):
        g = from_mask(n, mask)
        if valid(g):
            cases.append(g)
            if n <= 4:
                expected = history_search(g)
                assert module.Solution().catMouseGame(g) == expected
                # Independently check all starting triples, not just official start.
                for m in range(n):
                    for c in range(1, n):
                        for t in (1, 2):
                            assert scan(g)[f'{m},{c},{t}'] == history_search(g, (m,c,t))
                history_count += 1
rng = random.Random(913)
for _ in range(180):
    n = rng.randrange(6, 10)
    while True:
        g = from_mask(n, rng.getrandbits(n*(n-1)//2))
        if valid(g):
            break
    cases.append(g)
presets = [ [[1],[0,3],[3],[1,2]], [[2],[2],[0,1]],
 [[2,5],[3],[0,4,5],[1,4,5],[2,3],[0,2,3]], [[1,3],[0],[3],[0,2]] ]
cases += presets
cases += [[[v for v in range(50) if v != u] for u in range(50)]]
# Long path and disconnected mouse/cat cycles, with a separate 0 component.
path = [[1]] + [[i-1, i+1] for i in range(1,49)] + [[48]]
cases.append(path)
cases.append([[1],[0],[3,4],[2,4],[2,3]])
rows=[]
for g in cases:
    before=json.dumps(g)
    oracle=scan(g)
    assert module.Solution().catMouseGame(g) == oracle['1,2,1'], g
    assert baseline_ns['full_scan'](g) == oracle['1,2,1'], g
    assert json.dumps(g)==before
    rows.append({'graph':g,'winner':oracle})
assert [scan(g)['1,2,1'] for g in presets] == [1,2,0,1]
assert scan([[1],[0,2,3],[1,3],[1,2]])['1,2,1']==1
assert scan([[1],[0,3],[3,4],[1,2,4],[2,3]])['3,2,1']==1
source=ROOT.joinpath('solution.py').read_text()
mirror=ROOT.joinpath('python-code.js').read_text()
assert json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').removesuffix(';\n'))==source
# Parse literal object keys before JS object evaluation can overwrite duplicates.
import re
copy=ROOT.joinpath('copy.js').read_text()
keys=re.findall(r'^(\w+):',copy,re.M)
assert len(keys)==len(set(keys))
ast.parse(source)
OUT.joinpath('oracle-cases.json').write_text(json.dumps(rows))
OUT.joinpath('oracle-presets.json').write_text(json.dumps([{'graph':g,'winner':scan(g)} for g in presets]))
result={'status':'PASS','canonicalCases':len(cases),'exhaustive':'all valid simple undirected graphs n=3..5','historyOracleGraphs':history_count,'seed':913,'randomCases':180,'maxN':50,'allTinyStatesHistoryChecked':True,'officialResults':[0,1],'sourceParity':True,'duplicateKeys':False,'seconds':time.monotonic()-start}
OUT.joinpath('python-results.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result))
