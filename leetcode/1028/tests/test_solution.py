"""Independent shape oracle + recursive split baseline; OUTPUT_DIR redirects evidence."""
from pathlib import Path
from functools import lru_cache
import json, os, random, re, subprocess, sys
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
class TreeNode:
    def __init__(self,val=0,left=None,right=None):self.val,self.left,self.right=val,left,right
ns={'TreeNode':TreeNode};exec(compile((ROOT/'solution.py').read_text(),str(ROOT/'solution.py'),'exec'),ns)
Solution=ns['Solution']
def tokens(s):return [(len(m[1]),int(m[2])) for m in re.finditer(r'(-*)(\d+)',s)]
def split_tree(ts):
    if not ts:return None
    depth,value=ts[0];cut=len(ts)
    for j in range(2,len(ts)):
        if ts[j][0]==depth+1:cut=j;break
    left=split_tree(ts[1:cut]);right=split_tree(ts[cut:])
    return (value,left,right)
def nested(r):
    if r is None:return None
    return (r.val,nested(r.left),nested(r.right))
def encode(r,d=0):
    if r is None:return ''
    return '-'*d+str(r[0])+encode(r[1],d+1)+encode(r[2],d+1)
@lru_cache(None)
def shapes(n):
    if n==0:return (None,)
    if n==1:return ((None,None),)
    result=[]
    for leftn in range(1,n):
        for left in shapes(leftn):
            for right in shapes(n-1-leftn):result.append((left,right))
    return tuple(result)
rng=random.Random(1028)
def label(shape,duplicate=False):
    if shape is None:return None
    return (2 if duplicate else rng.randint(1,10**9),label(shape[0],duplicate),label(shape[1],duplicate))
checks=invariants=0;fixtures=[]
def tracer(frame,event,arg):
    global invariants
    if frame.f_code.co_filename==str(ROOT/'solution.py') and event=='line' and frame.f_lineno==11:
        d=frame.f_locals
        if d['path']:
            path=d['path'];assert len(path)==d['depth']+1
            assert path[-1] is d['node']
            assert all(a.left is b or a.right is b for a,b in zip(path,path[1:]))
            assert nested(path[0])==split_tree(tokens(d['traversal'][:d['i']]))
            invariants+=1
    return tracer
def run(s,expected=None,instrument=True):
    global checks
    expected=split_tree(tokens(s)) if expected is None else expected
    if instrument:sys.settrace(tracer)
    try:r=Solution().recoverFromPreorder(s)
    finally:sys.settrace(None)
    assert nested(r)==expected,(s,nested(r),expected)
    seen=set();todo=[r]
    while todo:
        node=todo.pop();assert id(node) not in seen;seen.add(id(node));todo.extend(x for x in (node.left,node.right) if x is not None)
    assert len(seen)==len(tokens(s));checks+=1
    assert split_tree(tokens(s))==expected
    return expected
for n in range(1,10):
    for shape in shapes(n):
        for duplicate in (False,True):
            expected=label(shape,duplicate);s=encode(expected);run(s,expected)
            fixtures.append({'input':s,'expected':expected})
for _ in range(500):
    expected=label(rng.choice(shapes(rng.randint(1,9))));s=encode(expected);run(s,expected);fixtures.append({'input':s,'expected':expected})
# Official expected trees, independently specified as level-order arrays.
def from_level(a):
    from collections import deque
    root=TreeNode(a[0]);q=deque([root]);i=1
    while q and i<len(a):
        node=q.popleft()
        for side in ('left','right'):
            if i<len(a) and a[i] is not None:setattr(node,side,TreeNode(a[i]));q.append(getattr(node,side))
            i+=1
    return nested(root)
for s,a in [('1-2--3--4-5--6--7',[1,2,5,3,4,6,7]),('1-2--3---4-5--6---7',[1,2,5,3,None,6,None,4,None,7]),('1-401--349---90--88',[1,401,None,349,88,90])]:run(s,from_level(a))
run('1000000000',(10**9,None,None));run('7-4--2---1--9')
# Largest legal depth; no recursion in submission, no recursive oracle on this boundary.
s=''.join('-'*d+str(10**9) for d in range(1000));r=Solution().recoverFromPreorder(s)
for _ in range(1000):assert r is not None and r.val==10**9 and r.right is None;r=r.left
assert r is None;checks+=1
# Embedded mirror and JSON duplicate key rejection.
mirror=(ROOT/'python-code.js').read_text();assert json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').removesuffix(';\n'))==(ROOT/'solution.py').read_text()
def unique(pairs):
    d={}
    for k,v in pairs:assert k not in d;d[k]=v
    return d
copy=json.loads((ROOT/'copy.js').read_text().removeprefix('window.COPY = ').removesuffix(';\n'),object_pairs_hook=unique)
assert all(isinstance(v,list) and len(v)==2 and all(isinstance(x,str) and x for x in v) for v in copy.values())
node=subprocess.run(['node',str(ROOT/'tests/test_core.cjs')],input=json.dumps(fixtures),text=True,capture_output=True,check=True)
result={'kind':'author self-check; independent review pending','canonicalCases':checks,'canonicalIntermediateInvariants':invariants,'seed':1028,'core':json.loads(node.stdout),'sourceMirror':True,'uniqueBilingualKeys':len(copy),'maxDepthNodes':1000,'maxInputCharacters':len(s)}
(OUT/'numeric-results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
