"""Run: python3 leetcode/76/tests/test_solution.py; optional OUTPUT_DIR."""
import importlib.util,itertools,json,os,random,time,sys,re,html
sys.dont_write_bytecode=True
from collections import Counter
from pathlib import Path
P=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('candidate',P/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
solve=mod.Solution().minWindow

def oracle(s,t):
    # Independent: enumerate slices and build their counts from scratch.
    need=Counter(t)
    candidates=[s[i:j] for i in range(len(s)) for j in range(i+1,len(s)+1) if not (need-Counter(s[i:j]))]
    return min(candidates,key=len,default='')

def words(alphabet,maxlen):
    return [''.join(x) for n in range(1,maxlen+1) for x in itertools.product(alphabet,repeat=n)]
baseline_source=html.unescape(re.search(r'<pre[^>]*><code>(.*?)</code></pre>',(P/'index.html').read_text(),re.S)[1]);namespace={};exec(baseline_source,namespace);baseline=namespace['baseline']
start=time.monotonic();exhaustive=0
for s in words('ABC',5):
 for t in words('ABC',3):
    got=solve(s,t);expected=oracle(s,t)
    assert got==expected,(s,t,got,expected)
    assert baseline(s,t)==expected
    exhaustive+=1
rng=random.Random(760018);random_count=1200
for _ in range(random_count):
 s=''.join(rng.choices('ABabC',k=rng.randint(1,14)));t=''.join(rng.choices('ABabC',k=rng.randint(1,8)))
 assert solve(s,t)==oracle(s,t),(s,t)
fixtures=[('ADOBECODEBANC','ABC','BANC'),('a','a','a'),('a','aa',''),('ABAAC','AAC','AAC'),('AAAC','AAC','AAC'),('AABBC','ABC','ABBC'),('aA','AA',''),('','A',''),('A','','')]
for s,t,result in fixtures:assert solve(s,t)==result
large=[('A'*100000,'A'*100000,'A'*100000),('A'*99999+'B','AB','AB'),('a'*100000,'A',''),('AB'*50000,'AB','AB')]
for s,t,result in large:assert solve(s,t)==result
source=(P/'solution.py').read_text();mirror=(P/'python-code.js').read_text();assert mirror=='window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
evidence=json.loads((P/'official-evidence.json').read_text())['response']['data']['question'];assert any(x['langSlug']=='python3' and 'def minWindow(self, s: str, t: str) -> str:' in x['code'] for x in evidence['codeSnippets'])
entry=json.loads((P/'lesson-entry.json').read_text());assert entry['id']==76 and entry['path']=='76/' and entry['language']=='Python' and isinstance(entry['complexity'],str) and entry['complexity'].strip()
for c in entry['concepts']:assert f'id="step{c["step"]}"' in (P/'index.html').read_text()
out=Path(os.environ.get('OUTPUT_DIR',P/'tests/evidence'));out.mkdir(parents=True,exist_ok=True)
result={'exhaustive':exhaustive,'seeded':random_count,'seed':760018,'fixtures':len(fixtures),'maximum_cases':len(large),'displayedBaseline':'executed against same independent slice oracle','sourceMirror':'exact','officialPythonInterface':'verified','seconds':round(time.monotonic()-start,3)}
(out/'python-results.json').write_text(json.dumps(result,indent=2));print(result)
