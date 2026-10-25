"""Author self-check; independent explicit-wall/union-find oracle, no external packages."""
import sys, os, json, random, itertools, pathlib, importlib.util, hashlib, re, html
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = pathlib.Path(os.environ.get('LESSON_OUTPUT_DIR', ROOT/'tests/evidence/self-check'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('submission', ROOT/'solution.py')
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)

def oracle(grid):
    m, n = len(grid), len(grid[0]); N = m*n
    original = sum(grid, [])
    infected = {i for i, v in enumerate(original) if v}
    inactive, walls, history = set(), set(), []
    def neighbors(u):
        r, c = divmod(u, n)
        return [a*n+b for a,b in ((r-1,c),(r+1,c),(r,c-1),(r,c+1)) if 0<=a<m and 0<=b<n]
    def edge(u,v): return tuple(sorted((u,v)))
    def board(): return [[-1 if r*n+c in inactive else int(r*n+c in infected) for c in range(n)] for r in range(m)]
    unique = True; day = 1
    while True:
        active = infected-inactive; parent = {u:u for u in active}
        def find(u):
            while parent[u] != u: u=parent[u]
            return u
        for u in active:
            for v in neighbors(u):
                if v in active and edge(u,v) not in walls:
                    parent[find(u)] = find(v)
        groups = {}
        for u in active: groups.setdefault(find(u),set()).add(u)
        groups = sorted(groups.values(),key=min)
        regions=[]
        for cells in groups:
            targets=set(); boundary=set()
            # Deliberately scan all healthy cells for each region, unlike submission.
            for v in range(N):
                if v in infected: continue
                for u in neighbors(v):
                    if u in cells and edge(u,v) not in walls:
                        targets.add(v); boundary.add(edge(u,v))
            regions.append({'cells':sorted(cells),'frontier':sorted(targets),'edges':sorted(boundary)})
        chosen = max(range(len(regions)), key=lambda i:len(regions[i]['frontier']),default=-1)
        before=board()
        def save(phase):
            history.append({'phase':phase,'day':day,'before':before,'grid':board(),'regions':regions,'chosen':chosen if phase!='done' else -1,'walls':sorted(walls),'total':len(walls)})
        if chosen<0 or not regions[chosen]['frontier']:
            save('done');break
        best=len(regions[chosen]['frontier'])
        unique &= sum(len(r['frontier'])==best for r in regions)==1
        save('inspect')
        walls.update(tuple(e) for e in regions[chosen]['edges']);inactive.update(regions[chosen]['cells']);save('quarantine')
        # Real edges block a single simultaneous pass over the old infection set.
        new={v for v in range(N) if v not in infected and any(u in infected-inactive and edge(u,v) not in walls for u in neighbors(v))}
        expected=set().union(*(set(r['frontier']) for i,r in enumerate(regions) if i!=chosen))
        assert new==expected
        infected.update(new);save('spread');day+=1
        assert day<=N+1
    return len(walls),history,unique

cases=[]
for m,n in ((1,1),(1,2),(1,3),(1,4),(2,2),(2,3),(3,2),(3,3)):
    for bits in itertools.product((0,1),repeat=m*n): cases.append([list(bits[r*n:(r+1)*n]) for r in range(m)])
rng=random.Random(749)
for _ in range(400):
    m,n=rng.randint(1,8),rng.randint(1,8)
    cases.append([[rng.randrange(2) for _ in range(n)] for _ in range(m)])
official=[([[0,1,0,0,0,0,0,1],[0,1,0,0,0,0,0,1],[0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0]],10),([[1,1,1],[1,0,1],[1,1,1]],4),([[1,1,1,0,0,0,0,0,0],[1,0,1,0,1,1,1,1,1],[1,1,1,0,0,0,0,0,0]],13)]
cases += [g for g,_ in official]
cases += [[[1,0,0,1,1,0]],[[1,0,0,0,1,1,0]],[[1,1,0,0,0,0],[1,1,0,0,1,0],[1,1,0,0,0,0]]]
fixtures=[];valid=0
for grid in cases:
    expected,trace,unique=oracle(grid)
    before=json.dumps(grid)
    assert mod.Solution().containVirus(grid)==expected,(grid,expected)
    assert json.dumps(grid)==before,'Input mutation'
    valid+=unique
    fixtures.append({'input':grid,'trace':trace,'unique':unique})
for g,v in official: assert oracle(g)[0]==v
for value in (0,1): assert mod.Solution().containVirus([[value]*50 for _ in range(50)])==0
ring=[[1]*50 for _ in range(50)];ring[25][25]=0
assert mod.Solution().containVirus(ring)==4
# Execute the actual rendered baseline snippet against an independent edge oracle.
page=(ROOT/'index.html').read_text();snippet=html.unescape(re.search(r'<code>(def summarize_slow.*?)</code>',page,re.S).group(1));ns={};exec(snippet,ns)
for fixture in fixtures:
    first=fixture['trace'][0];g=fixture['input'];n=len(g[0])
    for region in first['regions']:
        cells={divmod(u,n) for u in region['cells']};targets,edges=ns['summarize_slow'](g,cells)
        assert sorted(r*n+c for r,c in targets)==region['frontier']
        assert edges==len(region['edges'])
source=(ROOT/'solution.py').read_text();mirror=(ROOT/'python-code.js').read_text()
assert mirror=='window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
(OUT/'oracle-fixtures.json').write_text(json.dumps(fixtures))
result={'cases':len(cases),'official_contract_unique_cases':valid,'tie_extension_cases':len(cases)-valid,'seed':749,'official_outputs':[v for _,v in official],'max_dimensions':'50x50 all 0, all 1, one healthy hole','canonical_sha256':hashlib.sha256(source.encode()).hexdigest(),'status':'passed'}
(OUT/'python-results.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
