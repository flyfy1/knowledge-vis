"""Independent row buckets oracle; run from any directory, EVIDENCE_DIR optional."""
import collections, functools, importlib.util, itertools, json, os, pathlib, random
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = pathlib.Path(os.environ.get('EVIDENCE_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right
spec = importlib.util.spec_from_file_location('submission', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
module.TreeNode = TreeNode
spec.loader.exec_module(module)

def oracle(root):
    # Independent BFS, row-by-row buckets. Never sorts global coordinate triples.
    if root is None: return []
    columns = collections.defaultdict(list)
    level = [(root, 0)]
    while level:
        row = collections.defaultdict(list)
        next_level = []
        for node, col in level:
            row[col].append(node.val)
            if node.left: next_level.append((node.left, col - 1))
            if node.right: next_level.append((node.right, col + 1))
        for col, values in row.items(): columns[col].extend(sorted(values))
        level = next_level
    return [columns[col] for col in sorted(columns)]

def fingerprint(root):
    result=[]; pending=[root]
    while pending:
        node=pending.pop()
        if node:
            result.append((id(node),node.val,id(node.left),id(node.right)))
            pending.extend([node.left,node.right])
    return result

count=0
def check(root, expected=None):
    global count
    before=fingerprint(root)
    actual=module.Solution().verticalTraversal(root)
    assert actual == oracle(root), (actual, oracle(root))
    if expected is not None: assert actual == expected
    assert fingerprint(root)==before
    count+=1

def from_level(a):
    if not a: return None
    root=TreeNode(a[0]); q=collections.deque([root]); i=1
    while q and i<len(a):
        p=q.popleft()
        for side in ['left','right']:
            if i<len(a) and a[i] is not None:
                node=TreeNode(a[i]);setattr(p,side,node);q.append(node)
            i+=1
    return root

for a,expected in [([3,9,20,None,None,15,7],[[9],[3,15],[20],[7]]),([1,2,3,4,5,6,7],[[4],[2],[1,5,6],[3],[7]]),([1,2,3,4,6,5,7],[[4],[2],[1,5,6],[3],[7]]),([8,4,6,None,9,2],[[4],[8,2,9],[6]]),([5,5,5,None,5,5],[[5],[5,5,5],[5]]),([0],[[0]])]: check(from_level(a),expected)
check(None,[])
@functools.lru_cache(None)
def shapes(n):
    if n==0:return (None,)
    return tuple((l,r) for k in range(n) for l in shapes(k) for r in shapes(n-1-k))
def build(shape,values):
    if shape is None:return None
    return TreeNode(next(values),build(shape[0],values),build(shape[1],values))
for n in range(1,7):
    for shape in shapes(n):
        for values in itertools.product([0,1],repeat=n): check(build(shape,iter(values)))
rng=random.Random(987)
for _ in range(600):
    root=TreeNode(rng.randrange(1001));slots=[(root,'left'),(root,'right')]
    for _ in range(rng.randrange(100)):
        p,side=slots.pop(rng.randrange(len(slots)));node=TreeNode(rng.randrange(1001));setattr(p,side,node);slots.extend([(node,'left'),(node,'right')])
    check(root)
for mode in ['left','right','zigzag']:
    root=TreeNode(1000);p=root
    for i in range(999):
        node=TreeNode(i%1001);setattr(p,mode if mode!='zigzag' else ('left' if i%2 else 'right'),node);p=node
    check(root)
report={'kind':'author self-check','pythonOracleCases':count,'exhaustive':'all ordered binary shapes, 1..6 nodes, all 0/1 assignments','seed':987,'seededCases':600,'boundaries':'1000-node left/right/zigzag chains, 0/1000 values, duplicates, defensive empty root','mutation':'identity/value/child links unchanged in every case','officialExamples':3}
(OUT/'numerical.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
