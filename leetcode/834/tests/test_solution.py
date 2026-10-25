import os,sys,json,itertools,random,heapq,copy
from pathlib import Path
p=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(p));sys.path.insert(0,str(p/'tests'))
from solution import Solution
from baseline import baseline
out=Path(os.environ.get('OUTPUT_DIR',p/'tests/evidence'));out.mkdir(parents=True,exist_ok=True)
def tree(n,seq):
    if n==1:return []
    degree=[1]*n
    for x in seq:degree[x]+=1
    leaves=[i for i,d in enumerate(degree) if d==1];heapq.heapify(leaves);edges=[]
    for x in seq:
        u=heapq.heappop(leaves);edges.append([u,x]);degree[x]-=1
        if degree[x]==1:heapq.heappush(leaves,x)
    edges.append([heapq.heappop(leaves),heapq.heappop(leaves)]);return edges
cases=[]
for n in range(1,7):
    for seq in itertools.product(range(n),repeat=max(0,n-2)):
        e=tree(n,seq);cases.append({'n':n,'edges':e,'expected':baseline(n,e)})
rng=random.Random(834)
for _ in range(300):
    n=rng.randrange(2,90);e=[[rng.randrange(v),v] for v in range(1,n)];rng.shuffle(e)
    for edge in e:
        if rng.randrange(2):edge.reverse()
    cases.append({'n':n,'edges':e,'expected':baseline(n,e)})
for c in cases:
    before=copy.deepcopy(c['edges']);assert Solution().sumOfDistancesInTree(c['n'],c['edges'])==c['expected'];assert before==c['edges']
assert Solution().sumOfDistancesInTree(6,[[0,1],[0,2],[2,3],[2,4],[2,5]])==[8,12,6,10,10,10]
n=30000
path=Solution().sumOfDistancesInTree(n,[[i-1,i] for i in range(1,n)])
assert path==[i*(i+1)//2+(n-i-1)*(n-i)//2 for i in range(n)]
assert Solution().sumOfDistancesInTree(n,[[0,i] for i in range(1,n)])==[n-1]+[2*n-3]*(n-1)
(out/'cases.json').write_text(json.dumps(cases))
(out/'python-results.json').write_text(json.dumps({'status':'pass','exhaustiveLabeledTreesUpTo':6,'totalSmallCases':len(cases),'seed':834,'maximumPathAndStar':n,'inputUnchanged':True},indent=2)+'\n')
print('Python pass:',len(cases),'small cases, maximum path and star')
