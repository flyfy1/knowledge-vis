"""Author self-check: Solution vs forward BFS oracle on all small inputs."""
import importlib.util, pathlib, random
spec = importlib.util.spec_from_file_location("sol", pathlib.Path(__file__).parent.parent / "solution.py")
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
S = mod.Solution()

def bfs(sx, sy, tx, ty):
    seen, stack = set(), [(sx, sy)]
    while stack:
        x, y = stack.pop()
        if (x, y) == (tx, ty): return True
        if x > tx or y > ty or (x, y) in seen: continue
        seen.add((x, y)); stack += [(x + y, y), (x, x + y)]
    return False

N = 0
for sx in range(1, 13):
    for sy in range(1, 13):
        for tx in range(1, 31):
            for ty in range(1, 31):
                assert S.reachingPoints(sx, sy, tx, ty) == bfs(sx, sy, tx, ty), (sx, sy, tx, ty); N += 1
assert S.reachingPoints(1, 1, 3, 5) and not S.reachingPoints(1, 1, 2, 2) and S.reachingPoints(1, 1, 1, 1)
assert S.reachingPoints(1, 1, 1, 10**9) and S.reachingPoints(1, 1, 10**9, 999999999)
assert not S.reachingPoints(10**9, 10**9, 1, 1) and S.reachingPoints(10**9, 10**9, 10**9, 10**9)
rnd = random.Random(780)
for _ in range(3000):
    sx, sy = rnd.randint(1, 9), rnd.randint(1, 9); x, y = sx, sy
    for _ in range(rnd.randint(0, 25)):
        if rnd.random() < .5: x += y
        else: y += x
    assert S.reachingPoints(sx, sy, x, y); N += 1
print("PASS", N, "cases")
