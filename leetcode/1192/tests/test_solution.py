"""Python solution against independent cut-every-edge oracles.

Original seeded tests by the authoring run are kept; the exhaustive and larger random
comparisons were added by the independent review (Claude Code, 2026-11-11).
Run with `python3 leetcode/1192/tests/test_solution.py` (pytest also collects it).
"""
import sys, random, itertools
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from leetcode_1192_import import Solution

def oracle(n, edges):
    ans=[]
    for i,(a,b) in enumerate(edges):
        seen={0}; stack=[0]
        while stack:
            u=stack.pop()
            for j,(x,y) in enumerate(edges):
                if j==i: continue
                if x==u and y not in seen: seen.add(y); stack.append(y)
                if y==u and x not in seen: seen.add(x); stack.append(x)
        if len(seen)<n: ans.append(tuple(sorted((a,b))))
    return sorted(ans)

def norm(out):
    return sorted(tuple(sorted(x)) for x in out)

def test_cases():
    for n,e in [(4,[[0,1],[1,2],[2,0],[1,3]]),(2,[[0,1]]),(5,[[0,1],[1,2],[2,0],[1,3],[3,4]])]:
        got=sorted(tuple(sorted(x)) for x in Solution().criticalConnections(n,e)); assert got==oracle(n,e)

def test_seeded():
    r=random.Random(1192)
    for n in range(2,8):
      for _ in range(80):
        edges=[[a,a+1] for a in range(n-1)]
        edges += [[a,b] for a in range(n) for b in range(a+2,n) if r.random()<.2]
        if len(edges)<n-1: continue
        got=sorted(tuple(sorted(x)) for x in Solution().criticalConnections(n,edges)); assert got==oracle(n,edges)

def connected(n, edges):
    seen={0}; stack=[0]
    while stack:
        u=stack.pop()
        for a,b in edges:
            for x,y in ((a,b),(b,a)):
                if x==u and y not in seen: seen.add(y); stack.append(y)
    return len(seen)==n

def test_exhaustive_small():
    count=0
    for n in range(2,6):
        pairs=[(a,b) for a in range(n) for b in range(a+1,n)]
        for mask in range(1,1<<len(pairs)):
            edges=[list(pairs[i]) for i in range(len(pairs)) if mask>>i&1]
            if len(edges)<n-1 or not connected(n,edges): continue
            for variant in (edges,[e[::-1] for e in reversed(edges)]):
                assert norm(Solution().criticalConnections(n,[e[:] for e in variant]))==oracle(n,variant)
                count+=1
    return count

def test_random_connected():
    r=random.Random(20261111); count=0
    for _ in range(2000):
        n=r.randint(2,14); order=list(range(n)); r.shuffle(order); es=set()
        for i in range(1,n):
            a,b=order[i],order[r.randrange(i)]; es.add((min(a,b),max(a,b)))
        for _ in range(r.randint(0,n)):
            a,b=r.sample(range(n),2); es.add((min(a,b),max(a,b)))
        edges=[list(e) if r.random()<.5 else [e[1],e[0]] for e in es]; r.shuffle(edges)
        assert norm(Solution().criticalConnections(n,edges))==oracle(n,edges); count+=1
    return count

def test_official_depth_boundary_without_recursion_error():
    n = 100_000
    edges = [[i, i + 1] for i in range(n - 1)]
    got = Solution().criticalConnections(n, edges)
    assert len(got) == n - 1
    assert {tuple(sorted(edge)) for edge in got} == {tuple(edge) for edge in edges}

def test_max_size_cycle_has_no_bridges():
    n = 100_000
    edges = [[i, (i + 1) % n] for i in range(n)]
    assert Solution().criticalConnections(n, edges) == []

if __name__ == '__main__':
    test_cases(); test_seeded()
    e=test_exhaustive_small(); r=test_random_connected()
    test_official_depth_boundary_without_recursion_error(); test_max_size_cycle_has_no_bridges()
    print(f'solution vs oracle: {e} exhaustive connected graphs (n<=5, two edge orders), {r} random connected graphs, seeded/official-shape cases, 1e5 path and 1e5 cycle: pass')
