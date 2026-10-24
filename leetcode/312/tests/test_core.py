import itertools, random, sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parents[1]))
from solution import Solution

def brute(a):
    if not a:return 0
    v=[1]+a+[1]
    return max(v[i] * v[i+1] * v[i+2] + brute(a[:i]+a[i+1:]) for i in range(len(a)))
for n in range(0,7):
    for a in itertools.product(range(4), repeat=n):
        assert Solution().maxCoins(list(a)) == brute(list(a))
for seed in range(20):
    random.seed(seed); a=[random.randrange(0,11) for _ in range(random.randrange(1,9))]
    assert Solution().maxCoins(a)==__import__('solution').Solution().maxCoins(a)
for a,e in [([3,1,5,8],167),([1,5],10),([],0),([0],0),([7],7)]: assert Solution().maxCoins(a)==e
print('python oracle/core checks passed')
