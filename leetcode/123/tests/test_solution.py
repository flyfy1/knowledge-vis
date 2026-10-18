"""Run: OUTPUT_DIR=/tmp/123-check python3 leetcode/123/tests/test_solution.py"""
import itertools,json,random,subprocess,os,sys
from pathlib import Path
sys.dont_write_bytecode=True
P=Path(__file__).resolve().parents[1];sys.path.insert(0,str(P))
from solution import Solution
OUT=Path(os.environ.get('OUTPUT_DIR',P/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
def oracle(prices):
    # Enumerate histories as (holding, buys, cash), never use DP recurrences.
    histories={(False,0,0)};expected=[['-inf',0,'-inf',0]]
    for price in prices:
        next_set=set(histories)
        for hold,buys,cash in histories:
            if hold:next_set.add((False,buys,cash+price))
            elif buys<2:next_set.add((True,buys+1,cash-price))
        histories=next_set
        row=[]
        for hold,budget in [(True,1),(False,1),(True,2),(False,2)]:
            values=[c for h,b,c in histories if h==hold and b<=budget]
            row.append(max(values) if values else '-inf')
        expected.append(row)
    return expected
def baseline(prices):
    n=len(prices);best=0
    for a in range(n):
        for b in range(a+1,n):
            best=max(best,prices[b]-prices[a])
            for c in range(b+1,n):
                for d in range(c+1,n):
                    best=max(best,prices[b]-prices[a]+prices[d]-prices[c])
    return best
rng=random.Random(123)
cases=[list(p) for n in range(1,8) for p in itertools.product(range(3),repeat=n)]
cases += [[rng.randrange(101) for _ in range(rng.randrange(1,13))] for _ in range(300)]
cases += [[3,3,5,0,0,3,1,4],[1,2,3,4,5],[7,6,4,3,1],[4,9,2,8],[1,3,2,4,3,5],[]]
fixtures=[]
for prices in cases:
    expected=oracle(prices);before=prices[:]
    assert baseline(prices)==expected[-1][-1]
    assert Solution().maxProfit(prices)==expected[-1][-1],prices
    assert before==prices
    fixtures.append({'prices':prices,'states':expected})
js="""const fs=require('fs'),assert=require('assert'),core=require(process.argv[1]);const cases=JSON.parse(fs.readFileSync(0,'utf8'));let frames=0;for(const c of cases){const trace=core.trace(c.prices);assert.deepStrictEqual(trace.map(f=>f.values.map(v=>v===-Infinity?'-inf':v===0?0:v)),c.states);trace.forEach((f,i)=>{if(i){assert.deepStrictEqual(f.old,trace[i-1].values);assert(f.values[3]>=f.values[1]);assert(f.values[2]>=f.values[0]);}frames++;});}console.log(frames);"""
r=subprocess.run(['node','-e',js,str(P/'core.js')],input=json.dumps(fixtures),text=True,capture_output=True,check=True)
for prices,expected in [([0,100000]*50000,200000),(list(range(100000)),99999),([100000]*100000,0)]:
    assert Solution().maxProfit(prices)==expected
mirror=(P/'python-code.js').read_text();assert mirror=='window.PYTHON_SOURCE = '+json.dumps((P/'solution.py').read_text())+';\n'
result={'cases':len(cases),'intermediateFrames':int(r.stdout),'largeCases':3,'oracle':'enumeration of legal daily action histories','canonicalPythonExecuted':True,'displayedBaselineExecuted':True,'mutation':False,'mirrorExact':True}
(OUT/'algorithm-results.json').write_text(json.dumps(result,indent=2)+'\n');print(result)
