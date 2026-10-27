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

def test_cases():
    for n,e in [(4,[[0,1],[1,2],[2,0],[1,3]]),(2,[[0,1]]),(5,[[0,1],[1,2],[2,0],[1,3],[3,4]])]:
        got=sorted(tuple(sorted(x)) for x in Solution().criticalConnections(n,e)); assert got==oracle(n,e)

def test_seeded():
    import random
    r=random.Random(1192)
    for n in range(2,8):
      for _ in range(80):
        edges=[[a,a+1] for a in range(n-1)]
        edges += [[a,b] for a in range(n) for b in range(a+2,n) if r.random()<.2]
        if len(edges)<n-1: continue
        got=sorted(tuple(sorted(x)) for x in Solution().criticalConnections(n,edges)); assert got==oracle(n,edges)
