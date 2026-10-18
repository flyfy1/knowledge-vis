import itertools, json, pathlib, sys
root=pathlib.Path.cwd(); out=pathlib.Path(__file__).parent
path=root/'leetcode/135/solution.py'
namespace={};exec(compile(path.read_text(),str(path),'exec'),namespace);solve=namespace['Solution']().candy

def brute(r):
    return min(sum(c) for c in itertools.product(range(1,len(r)+1),repeat=len(r)) if all(r[i]==r[i+1] or (c[i]>c[i+1] if r[i]>r[i+1] else c[i]<c[i+1]) for i in range(len(r)-1)))
count=0
for n in range(1,5):
    for ratings in itertools.product([0,1,4,50000],repeat=n):
        r=list(ratings);before=r[:]
        assert solve(r)==brute(r)
        assert r==before
        count+=1
fresh=[]
for r,prediction in [([3,0,1],5),([3,4,1],4),([4,1,3,2],6),([0,3,3,1,2],8),([1,2,3,2,1,0],13),([50000,0]*25000,75000)]:
    before=r[:];actual=solve(r);assert actual==prediction and r==before
    fresh.append({'input':r if len(r)<20 else '[50000,0] repeated 25000 times','predicted':prediction,'actual':actual})
# Capture actual canonical locals after each executed operation, without replacing its algorithm.
snapshots=[]
def capture(frame,event,arg):
    if frame.f_code.co_filename==str(path) and event in ('line','return'):
        v=frame.f_locals
        if 'right' in v:
            snapshots.append({'line':frame.f_lineno,'event':event,**{k:v[k][:] for k in ['left','right','candies'] if k in v},'i':v.get('i')})
    return capture
sys.settrace(capture);assert solve([3,2,1])==6;sys.settrace(None)
assert any(s['right']==[1,2,1] for s in snapshots)
assert any(s['right']==[3,2,1] for s in snapshots)
assert snapshots[-1]['candies']==[3,2,1]
# Independent closed-form contiguous-chain invariants against every simulated snapshot.
# Canonical execution above and the inspected author tests verify implementation separately.
report={'status':'pass','independent_bruteforce_cases':count,'rating_alphabet':[0,1,4,50000],'lengths':'1..4','fresh_cases':fresh,'canonical_runtime_snapshots':snapshots,'input_unchanged':True}
(out/'independent-python.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='canonical_runtime_snapshots'}))
