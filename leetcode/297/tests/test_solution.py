import importlib.util
from pathlib import Path
p=Path(__file__).parents[1]/'solution.py'; spec=importlib.util.spec_from_file_location('s',p); m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
def shape(n): return None if n is None else (n.val,shape(n.left),shape(n.right))
def make(vals):
 if not vals:return None
 nodes=[None if x is None else m.TreeNode(x) for x in vals]
 for i,n in enumerate(nodes):
  if n:
   if 2*i+1<len(nodes): n.left=nodes[2*i+1]
   if 2*i+2<len(nodes): n.right=nodes[2*i+2]
 return nodes[0]
c=m.Codec()
for vals in [[],[1],[1,2,3,None,None,4,5],[-1,0,None,None,2], [7,None,8,None,9]]:
 root=make(vals); encoded=c.serialize(root); assert shape(c.deserialize(encoded))==shape(root),encoded
print('round-trip oracle cases: ok')
