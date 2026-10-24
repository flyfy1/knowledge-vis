import random, statistics, sys
sys.path.insert(0, 'leetcode/295')
from solution import MedianFinder
for seed in range(20):
    rng=random.Random(seed); a=[]; mf=MedianFinder()
    for _ in range(80):
        x=rng.randint(-20,20); a.append(x); mf.addNum(x)
        got=mf.findMedian(); want=statistics.median(a)
        assert abs(got-want)<1e-9,(a,got,want)
print('solution oracle: 1600 updates passed')
