import os,json,random,functools,runpy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('LESSON_EVIDENCE_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
class TreeNode:
    def __init__(self,left=None,right=None):self.val=0;self.left=left;self.right=right
Solution=runpy.run_path(str(ROOT/'solution.py'),init_globals={'TreeNode':TreeNode})['Solution']
@functools.lru_cache(None)
def shapes(n):
    if n==0:return (None,)
    return tuple((l,r) for k in range(n) for l in shapes(k) for r in shapes(n-k-1))
def make(shape):return None if shape is None else TreeNode(make(shape[0]),make(shape[1]))
def nodes(root):
    result=[];q=[root] if root else []
    while q:
        v=q.pop();result.append(v)
        q.extend(c for c in (v.left,v.right) if c)
    return result
# Independent set-cover oracle, no subtree states.
def oracle(root):
    ns=nodes(root);ix={v:i for i,v in enumerate(ns)};covers=[]
    for v in ns:
        mask=1<<ix[v]
        for c in (v.left,v.right):
            if c:mask|=1<<ix[c]
        for p in ns:
            if p.left is v or p.right is v:mask|=1<<ix[p]
        covers.append(mask)
    best=len(ns)
    for mask in range(1<<len(ns)):
        if mask.bit_count()>=best:continue
        covered=0
        for i,c in enumerate(covers):
            if mask>>i&1:covered|=c
        if covered==(1<<len(ns))-1:best=mask.bit_count()
    return best
count=0
for n in range(9):
    for shape in shapes(n):
        root=make(shape);before=[(v,v.left,v.right,v.val) for v in nodes(root)]
        assert Solution().minCameraCover(root)==oracle(root),(n,shape)
        assert all((v.left,v.right,v.val)==(l,r,val) for v,l,r,val in before)
        count+=1
rng=random.Random(968)
for _ in range(160):
    root=TreeNode();available=[root]
    for __ in range(rng.randrange(1,13)):
        p=rng.choice(available);child=TreeNode();available.append(child)
        if p.left is None and p.right is None:setattr(p,rng.choice(['left','right']),child)
        elif p.left is None:p.left=child
        else:p.right=child
        if p.left and p.right:available.remove(p)
    assert Solution().minCameraCover(root)==oracle(root)
for side in ['left','right']:
    root=TreeNode();p=root
    for _ in range(999):c=TreeNode();setattr(p,side,c);p=c
    assert Solution().minCameraCover(root)==334
# Official fixtures using queue-based level-order, not array heap indices.
def level(vals):
    root=TreeNode();q=[root];i=1
    while q and i<len(vals):
        v=q.pop(0)
        for side in ['left','right']:
            if i>=len(vals):break
            if vals[i] is not None:c=TreeNode();setattr(v,side,c);q.append(c)
            i+=1
    return root
assert Solution().minCameraCover(level([0,0,None,0,0]))==1
assert Solution().minCameraCover(level([0,0,None,0,None,0,None,None,0]))==2
report={'kind':'author self-check','exhaustive_shapes_including_empty':count,'max_n':8,'seed':968,'random_cases':160,'boundaries':['1000-node left chain = 334','1000-node right chain = 334','single node = 1','defensive empty = 0'],'official_examples':'1, 2','mutation':'tree identities, values and links preserved','result':'pass'}
(OUT/'python-results.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
