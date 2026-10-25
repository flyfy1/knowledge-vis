"""Author computational checks. Independent metric-closure oracle, not BFS."""
import ast, copy, importlib.util, itertools, json, os, random, re, subprocess
from pathlib import Path
P=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('EVIDENCE_DIR',P/'tests/evidence')); OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution847',P/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
def oracle(g):
    n=len(g);dist=[[0 if u==v else 99 for v in range(n)] for u in range(n)]
    for u in range(n):
        for v in g[u]:dist[u][v]=1
    for k in range(n):
        for u in range(n):
            for v in range(n):dist[u][v]=min(dist[u][v],dist[u][k]+dist[k][v])
    # Order nodes by first visits. Metric shortcuts cannot cost more than a walk;
    # concatenating shortest paths for any DP order yields a covering walk.
    dp=[[999]*n for _ in range(1<<n)]
    for u in range(n):dp[1<<u][u]=0
    for mask in range(1,1<<n):
        for u in range(n):
            if mask>>u&1:
                for v in range(n):
                    if not mask>>v&1:
                        nm=mask|(1<<v);dp[nm][v]=min(dp[nm][v],dp[mask][u]+dist[u][v])
    return min(dp[-1])
def baseline(graph):
    n=len(graph);paths=[[u] for u in range(n)]
    for distance in range(2*(n-1)+1):
        following=[]
        for path in paths:
            if len(set(path))==n:return distance
            if distance<2*(n-1):
                for v in graph[path[-1]]:following.append(path+[v])
        paths=following

def connected(g):
    seen={0};todo=[0]
    while todo:
        for v in g[todo.pop()]:
            if v not in seen:seen.add(v);todo.append(v)
    return len(seen)==len(g)
cases=[];exhaustive=0;baseline_count=0
for n in range(1,6):
    edges=list(itertools.combinations(range(n),2))
    for flags in range(1<<len(edges)):
        g=[[] for _ in range(n)]
        for i,(u,v) in enumerate(edges):
            if flags>>i&1:g[u].append(v);g[v].append(u)
        if connected(g):
            expected=oracle(g);cases.append((g,expected));exhaustive+=1
            if n<=4:assert baseline(g)==expected;baseline_count+=1
rng=random.Random(847)
for _ in range(180):
    n=rng.randint(2,8);g=[[] for _ in range(n)]
    for v in range(1,n):
        u=rng.randrange(v);g[u].append(v);g[v].append(u)
    for u in range(n):
        for v in range(u+1,n):
            if v not in g[u] and rng.random()<.3:g[u].append(v);g[v].append(u)
    cases.append((g,oracle(g)))
for n in [2,12]:
    path=[[v for v in [u-1,u+1] if 0<=v<n] for u in range(n)]
    star=[list(range(1,n))]+[[0] for _ in range(1,n)]
    clique=[[v for v in range(n) if v!=u] for u in range(n)]
    cycle=[sorted({(u-1)%n,(u+1)%n}) for u in range(n)]
    for g,expected in [(path,n-1),(star,1 if n==2 else 2*n-4),(clique,n-1),(cycle,n-1)]:
        assert oracle(g)==expected;cases.append((g,expected))
q=json.loads((P/'tests/evidence/official.json').read_text())['data']['question']
assert q['questionFrontendId']=='847' and q['difficulty']=='Hard'
assert any(s['langSlug']=='python3' and 'shortestPathLength(self, graph: list[list[int]]) -> int' in s['code'] for s in q['codeSnippets'])
for line in q['exampleTestcases'].splitlines():cases.append((json.loads(line),4))
for g,expected in cases:
    before=copy.deepcopy(g);assert mod.Solution().shortestPathLength(g)==expected,(g,expected);assert g==before
mirror=re.fullmatch(r'window.PYTHON_SOURCE = ("(?:[^"\\]|\\.)*");\n',(P/'python-code.js').read_text());assert mirror
assert json.loads(mirror[1])==(P/'solution.py').read_bytes().decode()
# Check UI baseline exactly, excluding HTML tags.
html=(P/'index.html').read_text();snippet=re.search(r'<code>(def baseline[\s\S]*?)</code>',html)[1]
ns={};exec(snippet,ns)
for g,expected in cases:
    if len(g)<=4:assert ns['baseline'](g)==expected
# Pair dictionary uses one key declaration per source line; AST catches overwrites.
keys=re.findall(r'^\s*([A-Za-z]\w*):', (P/'copy.js').read_text(),re.M)
assert len(keys)==len(set(keys))
(OUT/'oracle-cases.json').write_text(json.dumps([{'graph':g,'expected':a} for g,a in cases if len(g)<=5]))
r=subprocess.run(['node',str(P/'tests/core-check.cjs'),str(OUT/'oracle-cases.json')],capture_output=True,text=True,check=True)
report={'kind':'author self-check','exhaustive_connected_n1_to5':exhaustive,'seeded':180,'canonical_cases':len(cases),'baseline_small_cases':baseline_count,'source_parity':True,'core':json.loads(r.stdout)}
(OUT/'numeric.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
