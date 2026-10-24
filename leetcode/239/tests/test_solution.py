import random, importlib.util
spec=importlib.util.spec_from_file_location('s','leetcode/239/solution.py'); m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
def oracle(a,k): return [max(a[i:i+k]) for i in range(len(a)-k+1)]
for a,k in [([1,3,-1,-3,5,3,6,7],3),([1],1),([-3,-2,-5],2),([2,2,2],2),([9,1,2,3],2)]: assert m.Solution().maxSlidingWindow(a,k)==oracle(a,k)
r=random.Random(239)
for n in range(1,40):
 for _ in range(30):
  a=[r.randint(-10,10) for _ in range(n)]; k=r.randint(1,n); assert m.Solution().maxSlidingWindow(a,k)==oracle(a,k)
print('solution/oracle checks passed')
