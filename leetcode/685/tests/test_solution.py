"""Independent delete-and-reachability oracle; run from any cwd, no bytecode."""
import copy
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence')).resolve()
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('canonical', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
solution = module.Solution()


def is_tree(edges, removed):
    n = len(edges)
    count = [0] * (n + 1)
    children = [[] for _ in range(n + 1)]
    for i, (u, v) in enumerate(edges):
        if i != removed:
            count[v] += 1
            children[u].append(v)
    roots = [v for v in range(1, n + 1) if count[v] == 0]
    if len(roots) != 1 or any(c > 1 for c in count):
        return False
    seen, pending = set(), [roots[0]]
    while pending:
        u = pending.pop()
        if u not in seen:
            seen.add(u)
            pending.extend(children[u])
    return len(seen) == n


def oracle(edges):
    return next((edges[i][:] for i in range(len(edges) - 1, -1, -1)
                 if is_tree(edges, i)), None)


cases = []
counts = {}
def check(edges, expected=None, save=True):
    before = copy.deepcopy(edges)
    wanted = oracle(edges) if expected is None else expected
    assert wanted is not None
    got = solution.findRedundantDirectedConnection(edges)
    assert got == wanted, (edges, wanted, got)
    assert before == edges
    if save:
        cases.append({'edges': edges, 'expected': wanted})


for n in (3, 4):
    count = 0
    directed = [(u, v) for u in range(1, n + 1) for v in range(1, n + 1) if u != v]
    for selected in itertools.combinations(directed, n):
        if oracle(selected) is None:
            continue
        for perm in itertools.permutations(selected):
            edges = [list(e) for e in perm]
            check(edges)
            count += 1
    counts[f'exhaustive_n{n}'] = count

rng = random.Random(685)
for _ in range(1000):
    n = rng.randint(3, 45)
    # Generate a random undirected labelled tree with a Prüfer sequence, then
    # orient away from an independently chosen root.
    sequence = [rng.randint(1, n) for _ in range(n - 2)]
    degree = [0] + [1] * n
    for v in sequence:
        degree[v] += 1
    adj = [[] for _ in range(n + 1)]
    for v in sequence:
        leaf = next(x for x in range(1, n + 1) if degree[x] == 1)
        adj[leaf].append(v); adj[v].append(leaf)
        degree[leaf] -= 1; degree[v] -= 1
    a, b = [v for v in range(1, n + 1) if degree[v] == 1]
    adj[a].append(b); adj[b].append(a)
    edges, seen, queue = [], set(), [rng.randint(1, n)]
    while queue:
        u = queue.pop(0)
        seen.add(u)
        for v in adj[u]:
            if v not in seen:
                edges.append([u, v]); queue.append(v)
    while True:
        u, v = rng.sample(range(1, n + 1), 2)
        if [u, v] not in edges:
            break
    edges.append([u, v]); rng.shuffle(edges)
    check(edges)
counts['seeded_prufer'] = 1000

# Maximum n: directed cycle only; two parents plus cycle; two parents no cycle.
chain = [[i, i + 1] for i in range(1, 1000)]
check(chain + [[1000, 1]], [1000, 1])
check([[1000, 2], [1, 2]] + [[i, i + 1] for i in range(2, 1000)], [1000, 2])
check(chain + [[1, 1000]], [1, 1000])
counts['maximum_n1000'] = 3
for edges, expected in [([[1,2],[1,3],[2,3]],[2,3]),
                        ([[1,2],[2,3],[3,4],[4,1],[1,5]],[4,1]),
                        ([[2,1],[3,1],[4,2],[1,4]],[2,1]),
                        ([[1,2],[2,3],[3,1],[3,4]],[3,1]),
                        ([[1,2],[2,1],[1,3]],[2,1]),
                        ([[3,2],[4,2],[2,3],[1,4]],[3,2])]:
    assert oracle(edges) == expected
    check(edges, expected)
counts['named_cases'] = 6

# Detect duplicate copy keys BEFORE JSON parsing can discard a duplicate.
def unique(pairs):
    d = {}
    for key, value in pairs:
        assert key not in d, ('duplicate copy key', key)
        d[key] = value
    return d
copy_text = (ROOT / 'copy.js').read_text()
copy_data = json.loads(copy_text[len('window.COPY = '):].rstrip().removesuffix(';'), object_pairs_hook=unique)
assert all(isinstance(v, list) and len(v) == 2 and all(isinstance(x, str) and x for x in v) for v in copy_data.values())
mirror = (ROOT / 'python-code.js').read_text()
assert json.loads(mirror[len('window.PYTHON_SOURCE = '):].rstrip().removesuffix(';')) == (ROOT / 'solution.py').read_bytes().decode()
assert isinstance(json.loads((ROOT / 'lesson-entry.json').read_text())['complexity'], str)
(OUT / 'fixtures.json').write_text(json.dumps(cases) + '\n')
report = {'kind': 'author self-check; not independent review', 'seed': 685, 'counts': counts,
          'total': len(cases), 'mutation': 'unchanged', 'copyKeys': len(copy_data),
          'sourceMirror': 'exact including final newline', 'result': 'pass'}
(OUT / 'python-results.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
