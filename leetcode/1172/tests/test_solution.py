import random,sys
sys.path.insert(0,'leetcode/1172')
from solution import DinnerPlates

def oracle(cap, ops):
 s=[]; out=[]
 for op,args in ops:
  if op=='push':
   i=next((i for i,x in enumerate(s) if len(x)<cap),len(s))
   if i==len(s):s.append([])
   s[i].append(args[0])
  elif op=='popAtStack':
   i=args[0];out.append(s[i].pop() if 0<=i<len(s) and s[i] else -1)
  else:
   while s and not s[-1]:s.pop()
   out.append(s[-1].pop() if s else -1)
 return out
for seed in range(30):
 r=random.Random(seed);cap=r.randint(1,5);ops=[]
 for _ in range(200):
  k=r.randrange(3)
  ops.append(('push',(r.randint(1,20),)) if k==0 else (('pop',()) if k==1 else ('popAtStack',(r.randint(0,12),))))
 d=DinnerPlates(cap);got=[]
 for op,args in ops:
  if op=='push':d.push(*args)
  elif op=='pop':got.append(d.pop())
  else:got.append(d.popAtStack(*args))
 assert got==oracle(cap,ops),(seed,got,oracle(cap,ops))
print('30 seeded traces passed')
# Fresh scene from step 3 and the heap walk quoted in step 4.
d=DinnerPlates(2)
for v in (7,8,9): d.push(v)
assert d.popAtStack(0)==8 and sorted(d.free)==[0,1]
d.push(10)
assert d.stacks==[[7,10],[9]] and d.free==[1]
assert d.popAtStack(1)==9
# Step 1 hole example: holes open at 1 then 0, pushes fill 0, 1, then the tail stack 3.
d=DinnerPlates(2)
for v in range(1,8): d.push(v)
d.popAtStack(1);d.popAtStack(0)
for v in (8,9,10): d.push(v)
assert d.stacks==[[1,8],[3,9],[5,6],[7,10]]
print('lesson examples passed')
