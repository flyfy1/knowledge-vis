"""Run from any cwd; OUTPUT_DIR redirects generated evidence."""
import importlib.util, itertools, json, os, pathlib, random, time
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('OUTPUT_DIR', ROOT/'tests/evidence')); OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('canonical',ROOT/'solution.py'); mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
solve=mod.Solution().findAllConcatenatedWordsInADict

def oracle(words):
    # Independent exhaustive subsets of internal gaps, never the DP recurrence.
    d=set(words);ans=[]
    for w in words:
        for mask in range(1,1 << (len(w)-1)):
            cuts=[0]+[i for i in range(1,len(w)) if mask & (1 << (i-1))]+[len(w)]
            if all(w[a:b] in d for a,b in zip(cuts,cuts[1:])):
                ans.append(w);break
    return ans
count=0

def check(words,expected=None):
    global count
    before=words[:];actual=solve(words)
    assert words==before,'input mutation'
    assert actual==(oracle(words) if expected is None else expected),(words,actual,expected)
    count+=1

check(['cat','cats','catsdogcats','dog','dogcatsdog','hippopotamuses','rat','ratcatdogcat'],['catsdogcats','dogcatsdog','ratcatdogcat'])
check(['cat','dog','catdog'],['catdog'])
for words in [['a'],['cat'],['ab','abc','cd','abcd'],['cat','dog','catsdog'],['a','aa','ab','aab']]:check(words)
universe=[''.join(x) for n in range(1,4) for x in itertools.product('ab',repeat=n)]
for mask in range(1,1<<len(universe)):check([w for i,w in enumerate(universe) if mask>>i&1])
rng=random.Random(472)
pool=[''.join(x) for n in range(1,8) for x in itertools.product('ab',repeat=n)]
for _ in range(500):check(rng.sample(pool,rng.randint(1,18)))
check(['a'*i for i in range(30,0,-1)],['a'*i for i in range(30,1,-1)])
def encode(n):
    out=[]
    for _ in range(10):out.append(chr(97+n%26));n//=26
    return ''.join(out)
maximum=[encode(i) for i in range(10000)]
start=time.perf_counter();check(maximum,[]);elapsed=time.perf_counter()-start
source=(ROOT/'solution.py').read_text();mirror=(ROOT/'python-code.js').read_text()
assert mirror=='window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
report={'kind':'author self-check','cases':count,'exhaustive':'all nonempty subsets of all binary words of lengths 1..3','seed':472,'randomCases':500,'maxInput':{'words':10000,'totalCharacters':100000,'seconds':elapsed},'length30':True,'officialExamples':2,'sourceMirrorExact':True}
(OUT/'python-results.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
