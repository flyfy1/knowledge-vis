"""Check the run DP that step 4 gives as the solution to submit (added by the 2026-11-11 cross-review).

1. The code block #dpCode in index.html is exactly dp_solution.py.
2. dp_solution.py equals an independent full-state BFS for targets 1..300 and solution.py (A*) on those
   targets plus a seeded sample up to 10000; tests/compare_dp_all.py covers every target 1..10000.
3. The worked numbers quoted in copy.js `dpIdea` (dp[6] = 5, dp[5] = 7) hold.
Writes nothing. Usage: python3 -B leetcode/818/tests/check_dp.py
"""
import html
import importlib.util
import random
import re
from collections import deque
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load(name):
    spec = importlib.util.spec_from_file_location(name[:-3], ROOT / name)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.Solution()


page = (ROOT / 'index.html').read_text(encoding='utf-8')
block = re.search(r'<code id="dpCode">(.*?)</code>', page, re.S)
assert block and html.unescape(block.group(1)) == (ROOT / 'dp_solution.py').read_text(encoding='utf-8')

dp, astar = load('dp_solution.py'), load('solution.py')


def bfs(target):
    seen, queue = {(0, 1): 0}, deque([(0, 1)])
    while queue:
        p, s = queue.popleft()
        if p == target:
            return seen[(p, s)]
        for state in ((p + s, s * 2), (p, -1 if s > 0 else 1)):
            if state not in seen:
                seen[state] = seen[(p, s)] + 1
                queue.append(state)


for t in range(1, 301):
    assert dp.racecar(t) == bfs(t) == astar.racecar(t), t
random.seed(818)
sample = random.sample(range(301, 10001), 120) + [10000]
for t in sample:
    assert dp.racecar(t) == astar.racecar(t), t
assert dp.racecar(6) == 5 and dp.racecar(5) == 7 and dp.racecar(3) == 2
print('DP checks passed: page code = dp_solution.py; BFS/A* agree on 1..300 and', len(sample), 'sampled targets')
