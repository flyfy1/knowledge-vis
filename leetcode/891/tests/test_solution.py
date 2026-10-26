import importlib.util,itertools,json,os,pathlib,random,re,datetime
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('candidate',ROOT/'solution.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
MOD=1000000007

def oracle(a):
    return sum(max(s)-min(s) for size in range(1,len(a)+1) for s in itertools.combinations(a,size))%MOD

count=0
for n in range(1,8):
    for vals in itertools.product(range(1,4),repeat=n):
        a=list(vals);before=a[:]
        assert m.Solution().sumSubseqWidths(a)==oracle(a),a
        assert a==before
        count+=1
rng=random.Random(891)
for _ in range(350):
    a=[rng.randint(1,100000) for _ in range(rng.randint(1,11))]
    assert m.Solution().sumSubseqWidths(a)==oracle(a),a
    count+=1
# Independent range-gap count: each gap crossed iff a selection hits both sides.
def gaps_expected(a):
    a=sorted(a);n=len(a)
    return sum((a[j]-a[j-1])*(pow(2,j,MOD)-1)*(pow(2,n-j,MOD)-1) for j in range(1,n))%MOD
large=[]
for a in [[100000]*100000,list(range(1,100001)),[1]*50000+[100000]*50000,list(range(100000,0,-1))]:
    expected=gaps_expected(a);actual=m.Solution().sumSubseqWidths(a);assert actual==expected
    large.append({'length':len(a),'first':a[0],'last':a[-1],'expected':expected,'actual':actual});count+=1
for a,e in [([2,1,3],6),([2],0),([1,1,3],6),([4,4,4],0),([1,2,4,5],32)]:
    assert m.Solution().sumSubseqWidths(a)==e,(a,e,oracle(a));count+=1
source=(ROOT/'solution.py').read_text();mirror=(ROOT/'python-code.js').read_text()
assert mirror.startswith('window.PYTHON_SOURCE = ') and mirror.endswith(';\n')
assert json.loads(mirror[len('window.PYTHON_SOURCE = '):-2])==source
# Parse JSON copy before JS evaluation, rejecting duplicate keys.
def unique(pairs):
    result={}
    for k,v in pairs:
        assert k not in result,('duplicate copy key',k)
        result[k]=v
    return result
copy=(ROOT/'copy.js').read_text();copy=json.loads(copy.removeprefix('window.COPY = ').strip().removesuffix(';'),object_pairs_hook=unique)
assert all(isinstance(v,list) and len(v)==2 and all(isinstance(s,str) and s for s in v) for v in copy.values())
html=(ROOT/'index.html').read_text()
for key in re.findall('data-i18n="([^"]+)"',html):assert key in copy,key
assert '[1,2,3]' in copy['invariant'][1] and '−3, −3, 6' in copy['invariant'][1]
# The embedded baseline is actually executable and independent of canonical code.
from html import unescape
baseline=unescape(re.search(r'<code>(def baseline.*?</code>)',html,re.S).group(1).removesuffix('</code>'))
ns={};exec(baseline,ns)
for a in [[2,1,3],[1,1,3],[4,4,4],[1,2,2,4]]:assert ns['baseline'](a)==oracle(a)
metadata=json.loads((ROOT/'lesson-entry.json').read_text());assert isinstance(metadata['complexity'],str) and metadata['complexity']
report={'result':'pass','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'canonicalCases':count,'exhaustive':'n=1..7 over values 1..3','random':'350 cases, seed 891, n<=11','largeGapOracle':large,'sourceParity':True,'copyUniqueKeys':len(copy),'officialExamples':[[[2,1,3],6],[[2],0]],'oracle':'enumerated position combinations; large cases count subsets crossing each adjacent sorted gap','baselineExecuted':True}
(OUT/'solution-result.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
