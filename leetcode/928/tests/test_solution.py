"""Author self-check. OUTPUT_DIR redirects all generated evidence."""
import copy, hashlib, html, importlib.util, itertools, json, os, pathlib, random, re
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = pathlib.Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence')); OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('solution', ROOT/'solution.py'); module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
solve = module.Solution().minMalwareSpread
source = (ROOT/'solution.py').read_text()
mirror = re.fullmatch(r'window.PYTHON_SOURCE = ("(?:[^"\\]|\\.)*");\n', (ROOT/'python-code.js').read_text())
assert mirror and json.loads(mirror[1]) == source
base_text = html.unescape(re.search(r'<code>(def baseline[\s\S]*?)</code>', (ROOT/'index.html').read_text())[1]); ns = {}; exec(base_text, ns)
def oracle(graph, initial):
    # Transitive closure, independent of the submission's component traversal.
    n = len(graph); counts = {}
    for removed in initial:
        reach = copy.deepcopy(graph)
        for v in range(n):
            reach[removed][v] = reach[v][removed] = 0
        for via in range(n):
            for a in range(n):
                for b in range(n):
                    reach[a][b] = int(reach[a][b] or (reach[a][via] and reach[via][b]))
        counts[removed] = sum(v != removed and any(reach[src][v] for src in initial if src != removed) for v in range(n))
    return min(initial, key=lambda r: (counts[r], r)), counts
count = 0
fixtures = []
def check(g, initial, keep=False):
    global count
    before = copy.deepcopy((g, initial)); answer, totals = oracle(g, initial)
    assert solve(g, initial) == answer, (g, initial, answer)
    assert ns['baseline'](g, initial) == answer
    assert (g, initial) == before
    count += 1
    if keep: fixtures.append({'graph':g, 'initial':initial, 'answer':answer, 'totals':totals})
for n in range(2, 6):
    edges = list(itertools.combinations(range(n), 2))
    for bits in range(1 << len(edges)):
        g = [[int(a == b) for b in range(n)] for a in range(n)]
        for j,(a,b) in enumerate(edges): g[a][b] = g[b][a] = (bits >> j)&1
        for seeds in range(1, (1 << n)-1):
            initial = [v for v in range(n) if seeds >> v & 1][::-1]
            check(g, initial, n <= 4)
rng = random.Random(928)
for _ in range(180):
    n = rng.randint(6,25); g = [[int(a == b) for b in range(n)] for a in range(n)]
    for a in range(n):
        for b in range(a): g[a][b] = g[b][a] = int(rng.random() < .12)
    initial = rng.sample(range(n), rng.randint(1,n-1)); check(g,initial,True)
# Max n boundaries: connected / isolated, single / all sources, reverse order.
for g in [[[1]*300 for _ in range(300)], [[int(a==b) for b in range(300)] for a in range(300)]]:
    for initial in [[299],list(range(298,-1,-1))]:
        expected = initial[0] if len(initial)==1 else 0
        before=copy.deepcopy((g,initial));assert solve(g,initial)==expected;assert (g,initial)==before
examples=[([[1,1,0],[1,1,0],[0,0,1]],[0,1],0),([[1,1,0],[1,1,1],[0,1,1]],[0,1],1),([[1,1,0,0],[1,1,1,0],[0,1,1,1],[0,0,1,1]],[0,1],1)]
for g,initial,a in examples: assert solve(g,initial)==a
quiz=[[int(a==b) for b in range(8)] for a in range(8)]
for a,b in [(0,1),(1,2),(2,3),(5,4),(4,6)]: quiz[a][b]=quiz[b][a]=1
assert oracle(quiz,[5,0,3]) == (5,{5:4,0:6,3:6})
check(quiz,[5,0,3],True)
(OUT/'oracle-cases.json').write_text(json.dumps(fixtures))
(OUT/'python-results.json').write_text(json.dumps({'status':'PASS','exhaustiveAndSeededCases':count,'exhaustive':'all undirected graphs n=2..5 and every nonempty proper seed subset, reversed order','randomSeed':928,'seededCases':180,'maxNBoundaries':4,'officialExamples':3,'inputMutation':False,'baselineExecutedFromDisplayedCode':True,'mirrorExact':True,'sourceSha256':hashlib.sha256(source.encode()).hexdigest()},indent=2)+'\n')
print('PASS Python, baseline and independent closure oracle:',count,'cases + max-size boundaries')
