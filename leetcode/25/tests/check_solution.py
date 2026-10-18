"""Lesson-local executable-source and node-identity regression checks."""
import importlib.util
import itertools
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

spec = importlib.util.spec_from_file_location('submission25', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
module.ListNode = ListNode
spec.loader.exec_module(module)
source = (ROOT / 'solution.py').read_bytes().decode('utf-8')
assert json.loads((ROOT / 'python-code.js').read_text().removeprefix('window.PYTHON_SOURCE = ').strip().removesuffix(';')) == source
count = 0

def check(values, k):
    global count
    nodes = [ListNode(value) for value in values]
    for a, b in zip(nodes, nodes[1:]):
        a.next = b
    expected = []
    for i in range(0, len(nodes), k):
        chunk = nodes[i:i+k]
        expected.extend(reversed(chunk) if len(chunk) == k else chunk)
    curr = module.Solution().reverseKGroup(nodes[0] if nodes else None, k)
    actual, seen = [], set()
    while curr is not None:
        assert id(curr) not in seen, 'cycle'
        seen.add(id(curr)); actual.append(curr); curr = curr.next
    assert actual == expected, (values, k)
    assert [node.val for node in nodes] == list(values), 'mutated values'
    count += 1
    return [node.val for node in actual]

for n in range(1, 9):
    for values in itertools.product((0, 1000), repeat=n):
        for k in range(1, n+1):
            check(values, k)
assert check([1, 2, 3], 2) == [2, 1, 3]
assert check([1, 2, 3, 4, 5], 3) == [3, 2, 1, 4, 5]
assert check([6, 2, 7, 1, 9], 3) == [7, 2, 6, 1, 9]
for k in (1, 2, 3, 2499, 2500, 4999, 5000):
    check([i % 1001 for i in range(5000)], k)
check([], 1)  # robustness beyond official constraints
print(json.dumps({'pythonCases': count, 'sourceMirrorParity': True, 'identityValuesCycles': 'passed', 'handExample': [2, 1, 3], 'freshCase': [7, 2, 6, 1, 9]}, indent=2))
