"""Run: python3 leetcode/124/tests/test_solution.py; OUTPUT_DIR overrides evidence destination."""
import json, os, random, subprocess, itertools, pathlib, datetime
P = pathlib.Path(__file__).resolve().parents[1]
OUT = pathlib.Path(os.environ.get('OUTPUT_DIR', P/'tests/evidence')); OUT.mkdir(parents=True, exist_ok=True)
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right
scope={'TreeNode':TreeNode};exec((P/'solution.py').read_text(),scope); solve=scope['Solution']().maxPathSum

def oracle(nodes):
    """Enumerate unique all-start routes in the undirected tree, independent of DP."""
    adj={n:[] for n in nodes};parent={nodes[0]:None};depth={nodes[0]:0}
    for n in nodes:
        for child in [n.left,n.right]:
            if child:
                adj[n].append(child);adj[child].append(n);parent[child]=n;depth[child]=depth[n]+1
    best=-float('inf');gain={n:-float('inf') for n in nodes};through={n:-float('inf') for n in nodes}
    for start in nodes:
        stack=[(start,None,0,[])]
        while stack:
            n,prev,total,path=stack.pop();total+=n.val;path=path+[n];best=max(best,total)
            highest=min(path,key=lambda x:depth[x]);through[highest]=max(through[highest],total)
            # A path starting at start is downward iff depth rises at each edge.
            if all(depth[path[i]]==depth[start]+i for i in range(len(path))):gain[start]=max(gain[start],total)
            for child in adj[n]:
                if child is not prev:stack.append((child,n,total,path))
    return best,gain,through

def shapes(n):
    if not n:return [None]
    return [(l,r) for k in range(n) for l in shapes(k) for r in shapes(n-1-k)]
def build(shape, vals):
    if shape is None:return None
    return TreeNode(next(vals),build(shape[0],vals),build(shape[1],vals))
def breadth(root):
    nodes=[root]
    for n in nodes:
        nodes.extend(c for c in (n.left,n.right) if c)
    return nodes

def check(root, fixtures):
    nodes=breadth(root);before=[(n.val,n.left,n.right) for n in nodes];expected,gain,through=oracle(nodes)
    assert solve(root)==expected
    assert before==[(n.val,n.left,n.right) for n in nodes]
    # Heap-index arrays are confined to small trace fixtures.
    indexed={root:0}
    for n in nodes:
        for c,j in [(n.left,2*indexed[n]+1),(n.right,2*indexed[n]+2)]:
            if c:indexed[c]=j
    arr=[None]*(max(indexed.values())+1)
    for n,i in indexed.items():arr[i]=n.val
    fixtures.append({'values':arr,'best':expected,'gain':{indexed[n]:gain[n] for n in nodes},'through':{indexed[n]:through[n] for n in nodes}})

fixtures=[];count=0
for n in range(1,6):
    for shape in shapes(n):
        for vals in itertools.product([-2,0,3],repeat=n):
            check(build(shape,iter(vals)),fixtures);count+=1
rng=random.Random(124)
for _ in range(350):
    n=rng.randint(1,12);nodes=[TreeNode(rng.randint(-1000,1000)) for _ in range(n)];available=[nodes[0]]
    for child in nodes[1:]:
        parent=rng.choice(available);side=rng.choice([s for s in ('left','right') if getattr(parent,s) is None]);setattr(parent,side,child)
        if parent.left and parent.right:available.remove(parent)
        available.append(child)
    check(nodes[0],fixtures)
for vals,expected in [([1,2,3],6),([-10,9,20,None,None,15,7],42)]:
    nodes=[None if v is None else TreeNode(v) for v in vals]
    for i,n in enumerate(nodes):
        if n:
            n.left=nodes[2*i+1] if 2*i+1<len(nodes) else None;n.right=nodes[2*i+2] if 2*i+2<len(nodes) else None
    assert solve(nodes[0])==expected;check(nodes[0],fixtures)
for val in (1000,-1000):
    root=TreeNode(val);last=root
    for _ in range(29999):last.left=TreeNode(val);last=last.left
    assert solve(root)==(30000000 if val==1000 else -1000)
root=TreeNode(0);assert solve(root)==0
nodes=[TreeNode(1000) for _ in range(30000)]
for i,n in enumerate(nodes):
    if 2*i+1<len(nodes):n.left=nodes[2*i+1]
    if 2*i+2<len(nodes):n.right=nodes[2*i+2]
assert solve(nodes[0])==29000
source=(P/'solution.py').read_text();mirror=(P/'python-code.js').read_text();assert mirror=='window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
r=subprocess.run(['node',str(P/'tests/test_core.cjs')],input=json.dumps(fixtures),text=True,capture_output=True,check=True)
result={'kind':'author self-check','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exhaustive_shape_value_cases':count,'seeded_cases':350,'official_examples':2,'max_constraint_cases':['positive chain 30000','negative chain 30000','balanced 30000'],'input_mutation':False,'source_mirror':'exact','core':json.loads(r.stdout)}
(OUT/'numerical.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
