import itertools, random, sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parents[1]))
from solution import Solution

def oracle(num,target):
    out=[]
    def rec(i,expr):
        if i==len(num):
            # independent precedence evaluator
            vals=[]; cur=''; op='+'
            for c in expr+'+':
                if c.isdigit(): cur+=c
                else:
                    x=int(cur)
                    if op=='+': vals.append(x)
                    elif op=='-': vals.append(-x)
                    else: vals[-1]*=x
                    cur=''; op=c
            if sum(vals)==target: out.append(expr)
            return
        for e in range(i,len(num)):
            if e>i and num[i]=='0': break
            token=num[i:e+1]
            if i==0: rec(e+1,token)
            else:
                for op in '+-*': rec(e+1,expr+op+token)
    rec(0,''); return sorted(out)

cases=[('123',6),('232',8),('3456237490',9191),('105',5),('00',0),('00',1),('1',1),('1',0)]
for n,t in cases: assert sorted(Solution().addOperators(n,t))==oracle(n,t),(n,t)
r=random.Random(282)
for length in range(1,6):
  for _ in range(80):
    n=''.join(str(r.randrange(4)) for _ in range(length)); t=r.randrange(-20,21)
    assert sorted(Solution().addOperators(n,t))==oracle(n,t),(n,t)
print('282 canonical/oracle checks passed:', len(cases), 'fixed + random cases')
