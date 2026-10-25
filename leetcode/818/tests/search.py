"""Candidate-specific actual-Python checks; numerical DP is corroboration only."""
import importlib.util
import inspect
import itertools
import json
import subprocess
import time
from collections import deque
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'tests/evidence/search-r1'
spec = importlib.util.spec_from_file_location('race', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
original_pop, original_push = module.heappop, module.heappush
records = []


def run(target, details=False):
    events, enqueues = [], []
    counts = dict(pops=0, expansions=0, improvements=0, stale=0, generated=1, peak_heap=1)

    def pop(heap):
        x = original_pop(heap)
        best = inspect.currentframe().f_back.f_locals['best']
        f, neg_g, p, s = x
        stale = -neg_g != best[(p, s)]
        counts['pops'] += 1
        counts['stale'] += stale
        counts['expansions'] += not stale and p != target
        if details:
            events.append(dict(p=p, s=s, g=-neg_g, h=f+neg_g, f=f))
        return x

    def push(heap, x):
        caller = inspect.currentframe().f_back.f_locals
        # At this point best has been updated; track historical arrivals separately.
        state, next_g = caller['state'], caller['next_g']
        if state in arrivals:
            assert next_g < arrivals[state]
            counts['improvements'] += 1
        arrivals[state] = next_g
        if details:
            enqueues.append(list(x))
        counts['generated'] += 1
        original_push(heap, x)
        counts['peak_heap'] = max(counts['peak_heap'], len(heap))

    arrivals = {(0, 1): 0}
    module.heappop, module.heappush = pop, push
    start = time.perf_counter()
    try:
        value = module.Solution().racecar(target)
    finally:
        module.heappop, module.heappush = original_pop, original_push
    counts.update(target=target, answer=value, seconds=time.perf_counter()-start, stored_states=len(arrivals))
    return counts, events, enqueues


# Raw word enumeration without state deduplication verifies target 5's sole optimum.
words = []
for n in range(8):
    for word in itertools.product('AR', repeat=n):
        p, s = 0, 1
        for c in word:
            p, s = (p+s, 2*s) if c == 'A' else (p, -1 if s > 0 else 1)
        if p == 5:
            assert n == 7
            words.append(''.join(word))
assert words == ['AARARAA']

# Actual Python heap pop and enqueue streams versus JS's small complete traces.
js = json.loads(subprocess.check_output(['node', '-e',
    "const c=require('./leetcode/818/core.js');console.log(JSON.stringify([3,5,6].map(t=>c.searchTrace(t))))"], text=True))
for t, frames in zip([3, 5, 6], js):
    counts, pops, pushes = run(t, True)
    assert pops == [f['current'] for f in frames[1:]]
    wanted = [[x['f'], -x['g'], x['p'], x['s']] for f in frames for x in f['children'] if x['status'] != 'notBetter']
    assert pushes == wanted
    assert counts['generated'] == frames[-1]['generated']
    assert counts['expansions'] == frames[-1]['expanded']
    assert counts['stored_states'] == frames[-1]['discovered']
    records.append(counts)

# Inspect the actual local bound through the executing function, then test against
# legal raw continuations. A proven route length is an independent upper bound on
# the optimum; h must not exceed even that route's length.
bounds = []
def capture(frame, event, arg):
    if frame.f_code.co_name == 'lower_bound' and event == 'return':
        bounds.append((frame.f_locals['position'], frame.f_locals['speed'], arg))
    return capture
import sys
sys.settrace(capture)
module.Solution().racecar(5)
sys.settrace(None)
checked = 0
for p, s, h in set(bounds):
    for depth in range(8):
        for word in itertools.product('AR', repeat=depth):
            pp, ss = p, s
            for c in word:
                pp, ss = (pp+ss, ss*2) if c == 'A' else (pp, -1 if ss > 0 else 1)
            if pp == 5:
                assert h <= depth, (p, s, h, word)
                checked += 1

# Bounded Linux difficult inputs; the full-range/Mac survey belongs to dispatcher.
for target, expected in [(9809, 56), (9879, 55), (10000, 45)]:
    counts, _, _ = run(target)
    # Fixed reference values are numerical corroboration, not a DP proof.
    assert counts['answer'] == expected
    records.append(counts)

# Small BFS on identical graph: count before first goal pop, no clipping.
def bfs(target, position_only=False):
    queue = deque([(0, 1, 0)])
    seen = {(0, 1)} if not position_only else {0}
    expanded = 0
    while queue:
        p, s, g = queue.popleft()
        if p == target:
            return dict(answer=g, expanded=expanded, stored_states=len(seen))
        expanded += 1
        for pp, ss in [(p+s, 2*s), (p, -1 if s > 0 else 1)]:
            key = pp if position_only else (pp, ss)
            if key not in seen:
                seen.add(key)
                queue.append((pp, ss, g+1))
        # Test-tool-only bound: a bad position-only traversal never reaches 5.
        if position_only and expanded == 20:
            return dict(answer=None, capped=True, expanded=expanded)

comparisons = []
for target in [5, 6, 100]:
    a, _, _ = run(target)
    b = bfs(target)
    assert a['answer'] == b['answer']
    assert a['expansions'] < b['expanded']
    comparisons.append(dict(target=target, astar=a, bfs=b))
assert bfs(5, True)['answer'] is None
(OUT / 'search-python.json').write_text(json.dumps(dict(records=records, comparisons=comparisons,
    sole_shortest_target5=words, bound_route_checks=checked, actual_python_js_stream_parity=True,
    hypotheses={'ordering':'less exploration confirmed on identical graph', 'position_only':'cannot reach 5; rejected',
    'distance_only':'sole shortest word increases gap; rejected'}, limits='No full-range or Mac resource claim'), indent=2))
print(json.dumps(dict(records=records, comparisons=comparisons, bound_route_checks=checked), indent=2))
