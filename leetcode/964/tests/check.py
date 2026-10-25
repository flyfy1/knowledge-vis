"""Author checks. EVIDENCE_DIR redirects generated reports without changing candidate."""
import os,json,sys,random,subprocess,ast
from pathlib import Path
from fractions import Fraction
from itertools import product
from functools import lru_cache
P=Path(__file__).resolve().parents[1];sys.path.insert(0,str(P))
from solution import Solution
from baseline import evaluate,baseline
OUT=Path(os.environ.get('EVIDENCE_DIR',P/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
solve=Solution().leastOpsExpressTarget

def oracle(x,t):
    # Independently split at the greatest power <= t and the next greater power.
    @lru_cache(None)
    def f(t):
        if t==0:return 0
        if t<x:return min(2*t-1,2*(x-t))
        power=x;k=1
        while power*x<=t:power*=x;k+=1
        if power==t:return k-1
        best=k+f(t-power)
        gap=power*x-t
        if gap<t:best=min(best,k+1+f(gap))
        return best
    return f(t)

checks=0
for x in range(2,13):
    for t in range(1,1001):
        assert solve(x,t)==oracle(x,t),(x,t);checks+=1
rng=random.Random(964)
cases=[(3,19),(5,501),(100,100000000),(2,200000000),(100,200000000)]
cases += [(rng.randint(2,100),rng.randint(1,200000000)) for _ in range(1000)]
for x,t in cases:
    assert solve(x,t)==oracle(x,t);checks+=1
for x in range(2,101):
    assert solve(x,1)==1 and solve(x,x)==0
    power=x;k=1
    while power<=200000000:
        assert solve(x,power)==k-1
        power*=x;k+=1
# Exact legal-expression enumeration: first occurrence establishes optimum.
brute=0
for x in range(2,6):
    first={}
    for count in range(6):
        for ops in product('+-*/',repeat=count):
            value=evaluate(x,ops)
            if value.denominator==1 and 1<=value<=200000000:first.setdefault(int(value),count)
    for t,cost in first.items():assert solve(x,t)==cost,(x,t,cost);brute+=1
assert baseline(3,8)==3 and baseline(3,19)==5
# Every intermediate pair checked by independently enumerating signed coefficients.
# Signed coefficient bounds [-x,x] contain both normalized paths; retain all powers.
trace_cases=[(x,t) for x in range(2,7) for t in range(1,101)]+cases
raw=subprocess.check_output(['node','-e',"const c=require(process.argv[1]); console.log(JSON.stringify(JSON.parse(process.argv[2]).map(a=>c.trace(...a))))",str(P/'core.js'),json.dumps(trace_cases)],text=True)
traces=json.loads(raw)
state_checks=0
for tr in traces:
    x=tr['x'];t=tr['target'];assert tr['answer']==solve(x,t)
    for row in tr['rows']:
        k=row['k'];S=t%(x**(k+1));assert row['S']==S
        assert row['p']>=0 and row['n']>=0
        if x<=6 and t<=100:
            costs={0:0}
            for j in range(k+1):
                nxt={};unit=x**j;w=2 if j==0 else j
                for value,cost in costs.items():
                    for coeff in range(-x,x+1):
                        v=value+coeff*unit;c=cost+abs(coeff)*w
                        if c<nxt.get(v,float('inf')):nxt[v]=c
                costs=nxt
            assert row['p']==costs[S],(x,t,row,costs[S])
            assert row['n']==costs[x**(k+1)-S]
            state_checks+=2
# Python mirror exact, copy pairs shape, duplicate object keys via acorn parser.
source=(P/'solution.py').read_text()
mirror=(P/'python-code.js').read_text();assert mirror=='window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
subprocess.run(['node',str(P/'tests/copy-check.cjs')],check=True)
report={'kind':'author self-check, not independent review','canonicalCases':checks,'exactExpressionOptima':brute,'intermediateStateChecks':state_checks,'sourceParity':True,'seed':964,'officialExamples':[solve(3,19),solve(5,501),solve(100,100000000)]}
(OUT/'numerical.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
