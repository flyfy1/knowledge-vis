import importlib.util,itertools,json,os,random
from pathlib import Path
root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('solution',root/'solution.py');s=importlib.util.module_from_spec(spec);spec.loader.exec_module(s)
def oracle(events):
    # Independently count all events at each start; a peak always begins at a start.
    return max((sum(a<=x<b for a,b in events) for x,_ in events),default=0)
count=0
small=list(itertools.combinations(range(5),2))
cases=[list(es) for n in range(4) for es in itertools.product(small,repeat=n)]
rng=random.Random(732)
for _ in range(200):
    cases.append([sorted(rng.sample(range(1000000001),2)) for _ in range(rng.randrange(1,30))])
cases += [[[0,10**9]]*400,[[i,i+1] for i in range(400)],[[10,20],[50,60],[10,40],[5,15],[5,10],[25,55]]]
for events in cases:
    obj=s.MyCalendarThree();prefix=[];last=0
    for l,r in events:
        prefix.append((l,r));actual=obj.book(l,r);expected=oracle(prefix)
        assert actual==expected,(prefix,actual,expected)
        if r<=4 and all(b<=4 for a,b in prefix):
            cells=[sum(a<=x<b for a,b in prefix) for x in range(4)]
            assert actual==max(cells)
        assert actual>=last;last=actual
        for x in obj.delta:
            assert sum(d for t,d in obj.delta.items() if t<=x)==sum(a<=x<b for a,b in prefix)
        assert sum(obj.delta.values())==0
        count+=1
# Exact offline mirror, including trailing newline
mirror=(root/'python-code.js').read_text();assert json.loads(mirror[len('window.PYTHON_SOURCE = '):-2])==(root/'solution.py').read_text()
out=Path(os.environ.get('OUTPUT_DIR',root/'tests/evidence'));out.mkdir(parents=True,exist_ok=True)
(out/'python-results.json').write_text(json.dumps({'sequences':len(cases),'calls':count,'oracle':'independent direct event membership at starts','status':'passed'},indent=2))
print('PASS',len(cases),'sequences;',count,'calls')
