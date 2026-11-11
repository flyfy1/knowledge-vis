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
# Correct baseline taught in the page: depth-limited retries over loop-free routes.
def baseline(start):
    G=(1,2,3,4,5,0);calls=0
    def search(state,limit,on_route,reached):
        nonlocal calls;calls+=1
        reached.add(state)
        if state==G:return True
        if limit==0:return False
        for nxt in sorted(adjacent(state),key=lambda t:t.index(0)):  # increasing blank position, as on the page
            if nxt not in on_route:
                on_route.add(nxt)
                if search(nxt,limit-1,on_route,reached):return True
                on_route.remove(nxt)
        return False
    previous=0
    for limit in range(720):
        reached=set()
        if search(start,limit,{start},reached):return limit,calls
        if len(reached)==previous:return -1,calls
        previous=len(reached)
results={}
for s in states:
    b=[list(s[:3]),list(s[3:])];before=copy.deepcopy(b)
    got=mod.Solution().slidingPuzzle(b);want=distance.get(s,-1)
    assert got==want,(s,got,want)
    assert b==before
    results[''.join(map(str,s))]=want
baselineCalls={}
for s in states:
    got,calls=baseline(s);assert got==distance.get(s,-1),(s,got);baselineCalls[''.join(map(str,s))]=calls
# Page text (baselineCost) quotes these recursive-call counts.
assert baselineCalls['412503']==60 and baselineCalls['450123']==10428 and baselineCalls['123540']==17907
assert len(distance)==360 and max(distance.values())==21
assert results['013425']==3
report={'kind':'author numerical self-check','timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat(),'result':'pass','canonicalCases':720,'reachable':len(distance),'unreachable':360,'maxDistance':21,'independentOracle':'reverse coordinate-based Dijkstra','baselineChecks':720,'mutation':'all 720 unchanged','officialExamples':{k:results[k] for k in ('123405','123540','412503')},'expected':results}
(OUT/'solution-results.json').write_text(json.dumps(report,indent=2)+'\n')
print('PASS: 720 canonical cases, 720 depth-limited baseline checks, input mutation and boundaries')
# Page text (wrong) quotes the first route found by depth-first search with a seen set, neighbors in increasing position order.
import sys
sys.setrecursionlimit(5000)
def first_dfs(start):
    G=(1,2,3,4,5,0);seen={start};route=[start]
    def go(s):
        if s==G:return True
        for n in sorted(adjacent(s),key=lambda t:t.index(0)):
            if n not in seen:
                seen.add(n);route.append(n)
                if go(n):return True
                route.pop()
        return False
    go(start);return route
route=first_dfs((1,2,3,4,0,5))
assert len(route)-1==59 and [''.join(map(str,r)) for r in route[:4]]==['123405','103425','013425','413025']
print('PASS: page DFS detour (59 moves) and baseline call counts')
