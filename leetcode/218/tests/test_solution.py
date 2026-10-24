import importlib.util, itertools, json, os, random, sys
from pathlib import Path
P=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('skyline_solution',P/'solution.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
OUT=Path(os.environ.get('OUTPUT_DIR',P/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
def oracle(bs):
    # Independent interval scan, no retained state or heap.
    result=[]
    for x in sorted(set(v for b in bs for v in b[:2])):
        h=max([b[2] for b in bs if b[0]<=x<b[1]] or [0])
        if not result or result[-1][1]!=h:result.append([x,h])
    return result

def cells(bs):
    # Independent unit-cell painting for small integer coordinates.
    if not bs:return []
    heights=[0]*(max(b[1] for b in bs)+1)
    for l,r,h in bs:
        for x in range(l,r):heights[x]=max(heights[x],h)
    return [[x,h] for x,h in enumerate(heights) if h!=(heights[x-1] if x else 0)]
count=0;invariants=0
read_line=next(i for i,s in enumerate((P/'solution.py').read_text().splitlines(),1) if s.strip().startswith('height = -heap'))
def tracer(frame,event,arg):
    global invariants
    if frame.f_code.co_filename==str(P/'solution.py') and event=='line' and frame.f_lineno==read_line:
        v=frame.f_locals;x=v['x'];heap=v['heap'];bs=v['buildings'];i=v['i']
        assert all(b[0]<=x for b in bs[:i]) and all(b[0]>x for b in bs[i:])
        assert all((-b[2],b[1]) in heap for b in bs if b[0]<=x<b[1])
        assert all(heap[(k-1)//2]<=heap[k] for k in range(1,len(heap)))
        assert not heap or heap[0][1]>x
        assert (-heap[0][0] if heap else 0)==max([b[2] for b in bs if b[0]<=x<b[1]] or [0])
        invariants+=1
    return tracer

def check(bs,paint=False,instrument=False,expected=None):
    global count
    bs=sorted(bs);original=[b[:] for b in bs]
    if instrument:sys.settrace(tracer)
    try:actual=m.Solution().getSkyline(bs)
    finally:sys.settrace(None)
    assert bs==original
    want=oracle(bs) if expected is None else expected
    assert actual==want,(bs,actual,want)
    if paint:assert actual==cells(bs)
    count+=1
options=[[l,r,h] for l in range(4) for r in range(l+1,5) for h in range(1,4)]
for n in range(4):
    for bs in itertools.combinations_with_replacement(options,n):check(list(bs),True,n<3)
rng=random.Random(218)
for k in range(1500):
    bs=[]
    for _ in range(rng.randint(1,35)):
        l=rng.randrange(25);bs.append([l,rng.randrange(l+1,30),rng.randrange(1,40)])
    check(bs,True,k<200)
check([[2,9,10],[3,7,15],[5,12,12],[15,20,10],[19,24,8]],expected=[[2,10],[3,15],[7,12],[12,0],[15,10],[20,8],[24,0]],instrument=True)
check([[0,2,3],[2,5,3]],expected=[[0,3],[5,0]],instrument=True)
M=2**31-1
check([[0,M,M]],expected=[[0,M],[M,0]])
check([[0,M,M]]*10000,expected=[[0,M],[M,0]])
# Maximum length and 20,000 distinct coordinates, known disconnected result.
bs=[[3*i,3*i+1,1] for i in range(10000)]
check(bs,expected=[p for l,r,h in bs for p in ([l,h],[r,0])])
check([[i,20000-i,i+1] for i in range(10000)],expected=[[i,i+1] for i in range(10000)]+[[20000-i,i] for i in range(9999,-1,-1)])
# Frozen cross-runtime corpus for JS invariant tests (not its implementation).
corpus=[]
for _ in range(300):
    bs=sorted([list(rng.choice(options)) for _ in range(rng.randrange(1,12))]);corpus.append({'buildings':bs,'expected':cells(bs)})
(OUT/'oracle-cases.json').write_text(json.dumps(corpus))
result={'status':'passed','cases':count,'intermediate_invariant_checks':invariants,'oracles':['endpoint rescan','unit-cell painting'],'max_buildings':10000,'seed':218}
(OUT/'python-results.json').write_text(json.dumps(result,indent=2));print(result)
