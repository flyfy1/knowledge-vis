import itertools,random,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parents[1]))
from solution import Solution
def oracle(s): return max(s[i:] for i in range(len(s)))
for n in range(1,8):
    for tup in itertools.product('abc',repeat=n):
        s=''.join(tup); assert Solution().lastSubstring(s)==oracle(s)
for _ in range(200):
    s=''.join(random.choice('abcd') for _ in range(random.randint(1,30))); assert Solution().lastSubstring(s)==oracle(s)
for s in ['a','abab','leetcode','aaaa','azb','cababa']: assert Solution().lastSubstring(s)==oracle(s)
print('oracle cases passed')
