import importlib.util,itertools,heapq,json,os,pathlib,copy,datetime
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('EVIDENCE_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',ROOT/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
states=list(itertools.permutations(range(6)))
def adjacent(s):
    i=s.index(0);r,c=divmod(i,3)
    for dr,dc in ((0,1),(1,0),(0,-1),(-1,0)):
        rr,cc=r+dr,c+dc
        if 0<=rr<2 and 0<=cc<3:
            a=list(s);j=rr*3+cc;a[i],a[j]=a[j],a[i];yield tuple(a)
# Independent oracle: reverse Dijkstra using coordinates, no hardcoded swap table.
goal=(1,2,3,4,5,0);distance={goal:0};heap=[(0,goal)]
while heap:
    d,s=heapq.heappop(heap)
    if d!=distance[s]:continue
    for nxt in adjacent(s):
        if d+1<distance.get(nxt,999):distance[nxt]=d+1;heapq.heappush(heap,(d+1,nxt))
# Correct baseline taught in the page: full-graph repeated relaxation.
edges={s:list(adjacent(s)) for s in states}
def baseline(start):
    dist=dict.fromkeys(states,float('inf'));dist[start]=0
    for _ in range(len(states)-1):
        changed=False
        for u in states:
            for v in edges[u]:
                if dist[u]+1<dist[v]:dist[v]=dist[u]+1;changed=True
        if not changed:break
    return -1 if dist[goal]==float('inf') else dist[goal]
results={}
for s in states:
    b=[list(s[:3]),list(s[3:])];before=copy.deepcopy(b)
    got=mod.Solution().slidingPuzzle(b);want=distance.get(s,-1)
    assert got==want,(s,got,want)
    assert b==before
    results[''.join(map(str,s))]=want
for s in [tuple(map(int,v)) for v in ('123405','123540','412503','123450','012453','013425','543210')]:assert baseline(s)==distance.get(s,-1)
assert len(distance)==360 and max(distance.values())==21
assert results['013425']==3
report={'kind':'author numerical self-check','timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat(),'result':'pass','canonicalCases':720,'reachable':len(distance),'unreachable':360,'maxDistance':21,'independentOracle':'reverse coordinate-based Dijkstra','baselineChecks':7,'mutation':'all 720 unchanged','officialExamples':{k:results[k] for k in ('123405','123540','412503')},'expected':results}
(OUT/'solution-results.json').write_text(json.dumps(report,indent=2)+'\n')
print('PASS: 720 canonical cases, 7 relaxation baseline checks, input mutation and boundaries')
