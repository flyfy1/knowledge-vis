import itertools, random, sys
sys.path.insert(0,'leetcode/1187')
from solution import Solution

def brute(a,b):
    best=10**9
    def go(i,prev,c):
        nonlocal best
        if c>=best:return
        if i==len(a):best=c;return
        if a[i]>prev:go(i+1,a[i],c)
        for x in b:
            if x>prev:go(i+1,x,c+1)
    go(0,-10**18,0)
    return -1 if best==10**9 else best

s=Solution()
for n in range(1,7):
  for a in itertools.product(range(4), repeat=n):
    for b in itertools.product(range(4), repeat=3):
      got=s.makeArrayIncreasing(list(a),list(b)); exp=brute(list(a),list(b))
      assert got==exp,(a,b,got,exp)
r=random.Random(1187)
for _ in range(500):
  a=[r.randrange(20) for _ in range(r.randrange(1,9))]
  b=[r.randrange(20) for _ in range(r.randrange(1,7))]
  assert s.makeArrayIncreasing(a,b)==brute(a,b),(a,b)
assert s.makeArrayIncreasing([1,3,5],[2,4])==0
assert s.makeArrayIncreasing([1,5,3,6,7],[1,3,2,4])==1
assert s.makeArrayIncreasing([1,5,3,6,7],[4,3,1])==2
assert s.makeArrayIncreasing([1,5,3,6,7],[1,6,3,3])==-1
print('1187 solution exhaustive + seeded checks passed')
