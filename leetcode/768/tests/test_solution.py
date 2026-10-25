import ast,html,itertools,json,os,random,re,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root))
from solution import Solution
out=Path(os.environ.get('OUTPUT_DIR',root/'tests/evidence'));out.mkdir(parents=True,exist_ok=True)

def oracle(a):
    best=0
    for mask in range(1<<(len(a)-1)):
        result=[];start=0;count=0
        for i in range(len(a)):
            if i==len(a)-1 or mask>>i&1:
                result.extend(sorted(a[start:i+1]));start=i+1;count+=1
        if result==sorted(a):best=max(best,count)
    return best

def multiset_oracle(a):
    target=sorted(a)
    return sum(sorted(a[:i+1])==target[:i+1] for i in range(len(a)))

baseline_source=html.unescape(re.search(r'<pre><code>(def baseline.*?</code>)',(root/'index.html').read_text(),re.S)[1].removesuffix('</code>'))
ns={};exec(baseline_source,ns);baseline=ns['baseline']
count=0
for n in range(1,8):
    for a in itertools.product(range(3),repeat=n):
        a=list(a);expected=oracle(a);before=a[:]
        assert Solution().maxChunksToSorted(a)==expected,(a,expected)
        assert baseline(a)==expected
        assert a==before;count+=1
rng=random.Random(768)
for _ in range(500):
    a=[rng.randrange(9) for _ in range(rng.randint(1,10))]
    assert Solution().maxChunksToSorted(a)==oracle(a)==baseline(a);count+=1
cases=[([5,4,3,2,1],1),([2,1,3,4,4],4),([1,3,2,2,4],3),([2,3,1,4],2),([0],1),([10**8],1),([4]*2000,2000),(list(range(2000)),2000),(list(range(2000,0,-1)),1),([0,10**8]*1000,3)]
# Alternating extremes: first zero and last maximum each form their own chunk.
for a,expected in cases:assert Solution().maxChunksToSorted(a)==expected,(a[:10],expected)
large=[rng.randrange(10**8+1) for _ in range(2000)]
assert Solution().maxChunksToSorted(large)==multiset_oracle(large)

# Inspect canonical loop state at the actual comparison line, independently of JS.
compare_line=next(i for i,s in enumerate((root/'solution.py').read_text().splitlines(),1) if 'if left_max <=' in s)
intermediate=[]
def observer(frame,event,arg):
    if event=='line' and frame.f_code.co_name=='maxChunksToSorted' and frame.f_lineno==compare_line:
        v=frame.f_locals;a=v['arr'];i=v['i'];target=sorted(a)
        assert v['left_max']==max(a[:i+1])
        assert v['suffix_min']==[min(a[k:]) for k in range(len(a))]
        assert v['chunks']==1+sum(sorted(a[:j+1])==target[:j+1] for j in range(i))
        intermediate.append({'a':a[:],'i':i,'left_max':v['left_max'],'suffix_min':v['suffix_min'][:]})
    return observer
sys.settrace(observer)
for a in [[2,1,3],[2,1,3,4,4],[4,4,4],[2,3,1,4],[0]]:Solution().maxChunksToSorted(a)
sys.settrace(None)
source=(root/'solution.py').read_text()
assert (root/'python-code.js').read_text()=='window.PYTHON_SOURCE = '+json.dumps(source,ensure_ascii=False)+';\n'
# Detect duplicate object keys before JS would silently overwrite definitions.
keys=re.findall(r'(?:^|,)\s*(\w+):\[',(root/'copy.js').read_text(),re.M)
assert len(keys)==len(set(keys)) and len(keys)>80
json.dump({'exhaustiveAndSeeded':count,'maxN':2000,'largeExpected':multiset_oracle(large),'specialCases':len(cases),'canonicalIntermediateStates':intermediate,'baseline':'actual displayed Python executed','oracle':'enumerate every partition, sort chunks, compare whole sorted target','sourceMirrorExact':True,'copyKeysUnique':len(keys)},open(out/'solution-results.json','w'),ensure_ascii=False,indent=2)
print(f'Python passed: {count} exhaustive/seeded cases, {len(cases)} boundaries, max n=2000; {len(intermediate)} loop invariants')
