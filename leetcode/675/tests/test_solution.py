"""Independent global-state oracle, Floyd baseline, and canonical execution.
Run: python3 -B leetcode/675/tests/test_solution.py
OUT_DIR redirects all emitted evidence (including oracle fixtures).
"""
from pathlib import Path
import importlib.util, itertools, random, json, os, collections, time, ast, re, html
ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUT_DIR', ROOT/'tests/evidence')); OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('solution', ROOT/'solution.py')
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)

def global_oracle(g):
    # Independent search over location AND cut-progress. Cutting is zero-cost:
    # normalize by cutting only the next required height at the current cell.
    trees = sorted(x for row in g for x in row if x > 1)
    if g[0][0] == 0: return -1
    def normalize(r,c,k):
        return k + int(k < len(trees) and g[r][c] == trees[k])
    initial = (0,0,normalize(0,0,0))
    queue = collections.deque([(initial,0)]); seen={initial}
    while queue:
        (r,c,k),d=queue.popleft()
        if k == len(trees): return d
        for nr,nc in ((r-1,c),(r+1,c),(r,c-1),(r,c+1)):
            if 0<=nr<len(g) and 0<=nc<len(g[0]) and g[nr][nc]>0:
                state=(nr,nc,normalize(nr,nc,k))
                if state not in seen:
                    seen.add(state);queue.append((state,d+1))
    return -1

def floyd(g):
    m,n=len(g),len(g[0]);v=m*n;inf=10**9
    d=[[inf]*v for _ in range(v)]
    for r in range(m):
        for c in range(n):
            if not g[r][c]: continue
            a=r*n+c;d[a][a]=0
            for s,t in ((r-1,c),(r+1,c),(r,c-1),(r,c+1)):
                if 0<=s<m and 0<=t<n and g[s][t]>0: d[a][s*n+t]=1
    for k in range(v):
        for a in range(v):
            for b in range(v): d[a][b]=min(d[a][b],d[a][k]+d[k][b])
    return [[None if x==inf else x for x in row] for row in d]

baseline_code=html.unescape(re.search(r'<code>(.*?)</code>', (ROOT/'index.html').read_text(), re.S).group(1))
baseline_namespace={};exec(baseline_code, baseline_namespace)

cases=[]
# Exhaust all 2x2 forests over 0..4 with >=1 tree and unique heights.
for cells in itertools.product(range(5), repeat=4):
    ts=[x for x in cells if x>1]
    if ts and len(ts)==len(set(ts)): cases.append([list(cells[:2]),list(cells[2:])])
rng=random.Random(675)
for _ in range(350):
    m,n=rng.randint(1,4),rng.randint(1,4)
    g=[[rng.choice([0,1,1]) for _ in range(n)] for _ in range(m)]
    for height,pos in enumerate(rng.sample(range(m*n), rng.randint(1,m*n)),2):
        g[pos//n][pos%n]=height
    cases.append(g)
extras=[([[1,2,3],[0,0,4],[7,6,5]],6),([[1,2,3],[0,0,0],[7,6,5]],-1),([[2,3,4],[0,0,5],[8,7,6]],6),([[1,3,2]],3),([[1,0,2],[1,0,1],[3,1,1]],10),([[2]],0),([[1,4,2],[1,0,1],[3,1,1]],9),([[0,2]],-1),([[1,5,2],[0,0,3]],5),([[10**9]],0),([[1],[3],[2]],3)]
start=time.monotonic()
for g,expected in extras:
    assert global_oracle(g)==expected
    assert mod.Solution().cutOffTree(g)==expected
fixtures=[]
for g in cases+[x[0] for x in extras]:
    before=json.dumps(g);expected=global_oracle(g)
    assert mod.Solution().cutOffTree(g)==expected,(g,expected)
    assert baseline_namespace["baseline"](g)==expected
    assert json.dumps(g)==before, 'input mutated'
    fixtures.append({'grid':g,'expected':expected,'distances':floyd(g)})
# Constraint maximum, deliberately no oracle with V^3 storage/work.
maximum=[[r*50+c+2 for c in range(50)] for r in range(50)]
# Row-major required cuts: 50*49 horizontal steps + 49*50 row transitions.
assert mod.Solution().cutOffTree(maximum)==4900
# Maximum open grid with shuffled required endpoints: Manhattan distances are
# exact independently of BFS because there are no walls.
positions=list(itertools.product(range(50),repeat=2));rng.shuffle(positions)
shuffled=[[1]*50 for _ in range(50)]
for height,(r,c) in enumerate(positions,2): shuffled[r][c]=height
walk=[(0,0)]+positions
maximum_shuffled_expected=sum(abs(a[0]-b[0])+abs(a[1]-b[1]) for a,b in zip(walk,walk[1:]))
assert mod.Solution().cutOffTree(shuffled)==maximum_shuffled_expected
# Validate copy representation before any JSON parser could hide duplicate keys.
def unique(pairs):
    result={}
    for key,value in pairs:
        assert key not in result,('duplicate key',key)
        result[key]=value
    return result
copy=json.loads((ROOT/'copy.js').read_text().removeprefix('window.LESSON_COPY = ').removesuffix(';\n'),object_pairs_hook=unique)
assert all(len(v)==2 and all(isinstance(s,str) and s for s in v) for v in copy.values())
# Authoring helper's literal dictionary must also have no duplicate keys.
tree=ast.parse((ROOT/'tests/build_copy.py').read_text())
for node in ast.walk(tree):
    if isinstance(node,ast.Dict):
        keys=[ast.literal_eval(k) for k in node.keys if isinstance(k,ast.Constant)]
        assert len(keys)==len(set(keys))
mirror=json.loads((ROOT/'python-code.js').read_text().removeprefix('window.PYTHON_SOURCE = ').removesuffix(';\n'))
assert mirror==(ROOT/'solution.py').read_text()
(OUT/'oracle-fixtures.json').write_text(json.dumps(fixtures))
result={'kind':'author self-check','canonical':'Python3 Solution.cutOffTree','global_state_oracle_cases':len(fixtures),'official_examples':[6,-1,6],'maximum_50x50':4900,'maximum_shuffled_50x50':maximum_shuffled_expected,'fresh_transfer':5,'rendered_baseline_executed':True,'input_preserved':True,'copy_pairs':len(copy),'elapsed_seconds':round(time.monotonic()-start,3)}
(OUT/'python-results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
