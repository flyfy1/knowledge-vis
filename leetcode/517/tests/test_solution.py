"""Independent simultaneous-move BFS oracle, exhaustive small states and seeded cases.
Run from repository root: python3 -B leetcode/517/tests/test_solution.py
Artifacts honor LESSON_OUTPUT_DIR.
"""
from pathlib import Path
from itertools import product
from collections import deque
import importlib.util,json,random,os
P=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('submission',P/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
solve=mod.Solution().findMinMoves

def neighbors(state):
    options=[]
    for i,v in enumerate(state):
        options.append([0]+([-1] if v and i else [])+([1] if v and i+1<len(state) else []))
    for actions in product(*options):
        out=list(state)
        for i,d in enumerate(actions):
            if d:out[i]-=1;out[i+d]+=1
        nxt=tuple(out)
        assert min(nxt)>=0 and sum(nxt)==sum(state)
        if nxt!=state:yield nxt

def oracle(state):
    n=len(state);s=sum(state)
    if s%n:return -1
    goal=(s//n,)*n
    queue=deque([(tuple(state),0)]);seen={tuple(state)}
    while queue:
        current,depth=queue.popleft()
        if current==goal:return depth
        for nxt in neighbors(current):
            if nxt not in seen:seen.add(nxt);queue.append((nxt,depth+1))
    raise AssertionError('No route found')

def check(a):
    old=list(a);result=solve(old);expected=oracle(a)
    assert result==expected,(a,result,expected)
    assert old==list(a),'Submission mutated input'
    return {'input':list(a),'expected':expected}

cases=[]
for n in range(1,5):
    for a in product(range(4),repeat=n):cases.append(check(a))
rng=random.Random(517)
for _ in range(75):
    n=rng.randint(1,5);a=[0]*n
    for __ in range(rng.randint(0,8)):a[rng.randrange(n)]+=1
    cases.append(check(a))
for a,e in [([1,0,5],3),([0,3,0],2),([0,2,0],-1),([0,0,6],4),([4,0,0,4],2),([3,0,3],1),([0]*10000,0),([100000]*10000,0),([100000]+[0]*9999,99990),([0]*9999+[100000],99990),([100000]+[0]*9998+[100000],99980)]:
    assert solve(a)==e,(len(a),e)
# Execute the visible baseline as well, rather than only describing it.
from html.parser import HTMLParser
class BaselineParser(HTMLParser):
    def __init__(self):super().__init__();self.active=False;self.code=''
    def handle_starttag(self,tag,attrs):
        if tag=='code' and dict(attrs).get('id')=='baselineCode':self.active=True
    def handle_endtag(self,tag):
        if tag=='code':self.active=False
    def handle_data(self,data):
        if self.active:self.code+=data
parser=BaselineParser();parser.feed((P/'index.html').read_text());namespace={};exec(parser.code,namespace)
for case in cases:assert namespace['slow_min_moves'](case['input'])==case['expected']
# Check every hand-built transfer against old stock and one-send capacity.
schedule=[(1,0,5),(1,1,4),(2,1,3),(2,2,2)]
actions=[[(2,1)],[(1,0),(2,1)],[(2,1)]]
for old,new,sends in zip(schedule,schedule[1:],actions):
    assert len({i for i,j in sends})==len(sends)
    after=list(old)
    for i,j in sends:
        assert old[i]>0 and abs(i-j)==1
        after[i]-=1;after[j]+=1
    assert tuple(after)==new
# Export independently computed expected results, not the optimized formula.
out=Path(os.environ.get('LESSON_OUTPUT_DIR',P/'tests/evidence'));out.mkdir(parents=True,exist_ok=True)
(out/'oracle-cases.json').write_text(json.dumps(cases))
(out/'python-results.json').write_text(json.dumps({'oracleChecks':len(cases),'largeAndOfficialChecks':11,'seed':517,'visibleBaselineChecks':len(cases),'handScheduleTransitions':3,'method':'BFS over actual simultaneous legal moves; input immutability checked'},indent=2))
print(f'PASS: {len(cases)} independent BFS checks and 11 official/large cases')
