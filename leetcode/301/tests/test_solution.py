import itertools, random, sys
sys.path.insert(0,'leetcode/301')
from solution import Solution

def valid(s):
 b=0
 for c in s:
  if c=='(': b+=1
  elif c==')':
   b-=1
   if b<0:return False
 return b==0

def oracle(s):
 idx=[i for i,c in enumerate(s) if c in '()']
 best=[]; ml=-1
 for mask in range(1<<len(idx)):
  rem={idx[k] for k in range(len(idx)) if mask>>k&1}
  x=''.join(c for i,c in enumerate(s) if i not in rem)
  if valid(x):
   if len(x)>ml:ml=len(x);best=[]
   if len(x)==ml:best.append(x)
 return sorted(set(best))
for s in ['()())()', '(a)())()', ')(', '((a)())', 'a', '(((', ')))', '()']:
 assert sorted(Solution().removeInvalidParentheses(s))==oracle(s),(s, Solution().removeInvalidParentheses(s),oracle(s))
for _ in range(100):
 s=''.join(random.choice('()ab') for _ in range(random.randint(1,8)))
 assert sorted(Solution().removeInvalidParentheses(s))==oracle(s),s
print('ok')
