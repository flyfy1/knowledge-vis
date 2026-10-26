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
