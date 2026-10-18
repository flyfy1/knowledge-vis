"""Run: python3 leetcode/84/tests/test_solution.py (LESSON_OUTPUT_DIR optional)."""
import importlib.util,itertools,json,os,pathlib,random,datetime,sys
sys.dont_write_bytecode=True
BASE=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('solution84',BASE/'solution.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
solve=m.Solution().largestRectangleArea
# Independently enumerate intervals and recompute their minima from scratch.
def oracle(a):
    return max([0]+[(r-l+1)*min(a[l:r+1]) for l in range(len(a)) for r in range(l,len(a))])
count=0
for n in range(8):
    for values in itertools.product(range(4),repeat=n):
        a=list(values);before=a[:]
        assert solve(a)==oracle(a),(a,solve(a),oracle(a))
        assert a==before
        count+=1
rng=random.Random(840018)
for _ in range(1000):
    a=[rng.randrange(10001) for _ in range(rng.randrange(1,36))]
    assert solve(a)==oracle(a)
    count+=1
fixtures=[([2,1,5,6,2,3],10),([2,4],4),([1,4,5,3],9),([10000]*100000,10**9),([0]*100000,0),([1]*100000,100000),(list(range(1,10001)),25005000),(list(range(10000,0,-1)),25005000),([10000]*49999+[0]+[10000]*50000,500000000)]
for a,want in fixtures:
    before=a[:];assert solve(a)==want,(len(a),want,solve(a));assert a==before
entry=json.loads((BASE/'lesson-entry.json').read_text())
assert entry['id']==84 and entry['language']=='Python' and entry['difficulty']=='hard'
assert isinstance(entry['complexity'],str) and entry['complexity'].strip()
assert all(not entry['title'][lang].startswith('#') for lang in ('zh','en'))
assert all(('id="step'+str(c['step'])+'"') in (BASE/'index.html').read_text() for c in entry['concepts'])
source=(BASE/'solution.py').read_text()
assert (BASE/'python-code.js').read_text()=='window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
report={'kind':'author self-check','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exhaustiveAndSeededCases':count,'largeAndOfficialFixtures':len(fixtures),'sourceMirrorExact':True,'inputUnchanged':True,'result':'pass'}
out=pathlib.Path(os.environ.get('LESSON_OUTPUT_DIR',BASE/'evidence'));out.mkdir(parents=True,exist_ok=True)
(out/'python-results.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
