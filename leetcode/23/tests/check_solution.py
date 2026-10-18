"""Lesson-local author regression: actual Python, independent value/identity oracle."""
import itertools, json, random, sys
from pathlib import Path
root = Path(__file__).resolve().parents[1]
source = (root/'solution.py').read_text()
assert json.loads((root/'python-code.js').read_text().removeprefix('window.PYTHON_SOURCE = ').strip().removesuffix(';')) == source
class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next
ns = {'ListNode': ListNode}
exec(compile(source, str(root/'solution.py'), 'exec'), ns)
cases = 0

def run(arrays, trace=False):
    global cases
    groups = [[ListNode(v) for v in a] for a in arrays]
    for group in groups:
        for a,b in zip(group,group[1:]): a.next = b
    heads = [g[0] if g else None for g in groups]
    original_heads = heads[:]
    nodes = [n for g in groups for n in g]
    ids = {n:f'{s}:{i}' for s,g in enumerate(groups) for i,n in enumerate(g)}
    snapshots = []
    marker = source.splitlines().index('            if node.next:')+1
    def capture(frame,event,arg):
        if event == 'line' and frame.f_code.co_name == 'mergeKLists' and frame.f_lineno == marker:
            loc = frame.f_locals
            name = lambda n: ids.get(n, 'D' if n is loc['dummy'] else None)
            snapshots.append({'dummy.next': name(loc['dummy'].next), 'tail':name(loc['tail']),
                              'links':{ids[n]:name(n.next) for n in nodes}})
        return capture
    if trace: sys.settrace(capture)
    try: result = ns['Solution']().mergeKLists(heads)
    finally:
        if trace: sys.settrace(None)
    seen, out = set(), []
    while result:
        assert result not in seen, 'cycle'
        seen.add(result); out.append(result); result = result.next
    assert seen == set(nodes), 'must reuse every original node exactly once'
    assert [n.val for n in out] == sorted(v for a in arrays for v in a)
    assert heads == original_heads
    assert all(n.val == arrays[s][i] for s,g in enumerate(groups) for i,n in enumerate(g))
    expected = [ids[n] for n in sorted(nodes,key=lambda n:(n.val,int(ids[n].split(':')[0])))]
    assert [ids[n] for n in out] == expected
    cases += 1
    return snapshots
atoms = [list(a) for n in range(4) for a in itertools.combinations_with_replacement([-1,0,1],n)]
for arrays in itertools.product(atoms, repeat=3): run(arrays)
rng = random.Random(23)
for _ in range(400): run([sorted(rng.choices(range(-5,6),k=rng.randrange(10))) for _ in range(rng.randrange(9))])
for arrays in [[],[[]],[[],[]],[[1]],[[1,100],[2,3]],[[-2,4],[],[-2,0,5]],[[1,1],[1]], [[-10000],[10000]], [[] for _ in range(10000)], [[i] for i in range(10000)], [list(range(500)) for _ in range(20)]]: run(arrays)
snapshots = run([[1,4,5],[1,3,4],[2,6]], True)
a,b = snapshots[:2]
assert a['dummy.next'] == '0:0' and a['tail'] == '0:0' and a['links']['0:0'] == '0:1'
assert b['dummy.next'] == '0:0' and b['tail'] == '1:0' and b['links']['0:0'] == '1:0' and b['links']['1:0'] == '1:1'
result = {'kind':'author self-check','cases':cases,'sourceMirrorParity':True,'checks':'values, all original identities, deterministic ties, unchanged head-array and node values, no cycles, maximum k/N', 'defaultPopPointerSnapshots':snapshots}
(root/'evidence/solution-check.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'cases':cases,'pointerTableMatchesActualPython':True}))
