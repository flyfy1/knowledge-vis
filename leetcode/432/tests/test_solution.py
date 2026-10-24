import sys,random,json,os,itertools
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from solution import AllOne
OUT=Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
checks=0

def verify(obj,oracle):
    global checks
    checks+=1
    assert obj.head.prev is None and obj.tail.next is None
    prev=obj.head;node=prev.next;seen={};buckets=0
    while node is not obj.tail:
        buckets+=1;assert buckets<=len(oracle)
        assert node.prev is prev and prev.next is node and node.count>prev.count
        assert node.first is not None
        ep=None;e=node.first
        while e:
            assert e.prev is ep and e.bucket is node and e.key not in seen
            assert obj.entries[e.key] is e
            seen[e.key]=node.count;ep=e;e=e.next
        prev=node;node=node.next
    assert obj.tail.prev is prev and prev.next is obj.tail
    assert seen==oracle and set(obj.entries)==set(oracle)
    for method,extreme in [(obj.getMinKey,min),(obj.getMaxKey,max)]:
        key=method()
        if not oracle:assert key==''
        else:assert key in oracle and oracle[key]==extreme(oracle.values())

def apply(obj,d,op,key):
    assert getattr(obj,op)(key) is None
    d[key]=d.get(key,0)+(1 if op=='inc' else -1)
    if not d[key]:del d[key]
    verify(obj,d)

# All legal operation sequences over two keys through depth 7.
def walk(seq,d,depth):
    o=AllOne();ref={}
    for op,k in seq:apply(o,ref,op,k)
    verify(o,d)
    if depth:
        for k in ['a','b']:
            for op in ['inc','dec']:
                if op=='dec' and k not in d:continue
                nxt=dict(d);nxt[k]=nxt.get(k,0)+(1 if op=='inc' else -1)
                if nxt[k]==0:del nxt[k]
                walk(seq+[(op,k)],nxt,depth-1)
walk([],{},7)
rng=random.Random(432)
for run in range(40):
    o=AllOne();d={}
    for _ in range(300):
        k=rng.choice(['a','b','cat','abcdefghij','z'])
        apply(o,d,'dec' if k in d and rng.random()<.48 else 'inc',k)
# Official example, exact results where unique.
o=AllOne();o.inc('hello');o.inc('hello');assert o.getMaxKey()==o.getMinKey()=='hello';o.inc('leet');assert o.getMaxKey()=='hello' and o.getMinKey()=='leet'
# Maximum call budget: grow then delete a single key, checking boundaries.
o=AllOne()
for _ in range(25000):o.inc('abcdefghij')
verify(o,{'abcdefghij':25000})
for _ in range(25000):o.dec('abcdefghij')
verify(o,{})
mirror=ROOT.joinpath('python-code.js').read_text();assert json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').strip().removesuffix(';'))==ROOT.joinpath('solution.py').read_text()
(OUT/'python-results.json').write_text(json.dumps({'status':'pass','checked_intermediate_states':checks,'exhaustive_depth':7,'random_seed':432,'maximum_calls':50000},indent=2))
print('PASS',checks,'intermediate-state and oracle checks')
