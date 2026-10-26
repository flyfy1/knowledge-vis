"""Independent tiny arithmetic checks; no lesson imports or runtime changes."""
from collections import deque
from itertools import permutations, product
import json


def cycles(p):
    seen, result = set(), []
    for start in range(len(p)):
        if start in seen:
            continue
        cycle, i = [], start
        while i not in seen:
            seen.add(i)
            cycle.append(i)
            i = p[i]
        assert i == start
        result.append(cycle)
    return result


def valid(letters, target, destinations):
    return sorted(destinations) == list(range(len(letters))) and all(
        letters[i] == target[j] for i, j in enumerate(destinations))


target = 'abca'
labels = ['a0', 'a1', 'b', 'c']
p = [3, 0, 1, 2]
rows = []


def record(action, physical_swaps):
    letters = ''.join(token[0] for token in labels)
    assert valid(letters, target, p)
    cs = cycles(p)
    rows.append(dict(action=action, tags=labels.copy(), letters=letters,
                     destinations=p.copy(), cycles=cs,
                     remaining_tagged_cost=len(p)-len(cs), physical_swaps=physical_swaps))


record('initial arbitrary target assignment', 0)
p[0], p[1] = p[1], p[0]
record('reassign identical-letter destinations; no token moves', 0)
for number, (i, j) in enumerate(((1, 2), (2, 3)), 1):
    labels[i], labels[j] = labels[j], labels[i]
    p[i], p[j] = p[j], p[i]
    record(f'physically swap positions {i},{j}', number)
assert [r['letters'] for r in rows] == ['aabc', 'aabc', 'abac', 'abca']
assert [r['remaining_tagged_cost'] for r in rows] == [3, 2, 1, 0]
assert rows[2]['destinations'] == [0, 1, 3, 2]
q, visited, distance = deque([('aabc', 0)]), {'aabc'}, None
while q:
    word, depth = q.popleft()
    if word == target:
        distance = depth
        break
    for i in range(len(word)):
        for j in range(i+1, len(word)):
            chars = list(word)
            chars[i], chars[j] = chars[j], chars[i]
            nxt = ''.join(chars)
            if nxt not in visited:
                visited.add(nxt)
                q.append((nxt, depth+1))
assert distance == 2

# Finite corroboration only; the proposal supplies the arbitrary-n argument.
cases = checks = 0
for n in range(1, 5):
    for source in product('ab', repeat=n):
        for assignment in permutations(range(n)):
            destination = [''] * n
            for i, j in enumerate(assignment):
                destination[j] = source[i]
            cases += 1
            for i in range(n):
                if source[i] != destination[i] or assignment[i] == i:
                    continue
                k = assignment.index(i)
                assert source[i] == source[k]
                updated = list(assignment)
                updated[i], updated[k] = updated[k], updated[i]
                assert valid(source, destination, updated)
                assert updated[i] == i
                assert len(cycles(updated)) == len(cycles(assignment)) + 1
                checks += 1
print(json.dumps(dict(rows=rows, independent_unlabeled_bfs_distance=distance,
                     finite_binary_mapping_cases=cases, singleton_checks=checks,
                     maximum_finite_n=4, general_proof='Prose, not inferred from enumeration'), indent=2))
