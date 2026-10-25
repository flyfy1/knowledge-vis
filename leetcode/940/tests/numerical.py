"""Author checks. Run python3 -B leetcode/940/tests/numerical.py; OUTPUT_DIR redirects evidence."""
import itertools, random, json, os, pathlib, importlib.util, html, re
root = pathlib.Path(__file__).resolve().parents[1]
out = pathlib.Path(os.environ.get('OUTPUT_DIR', root/'tests/evidence')); out.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('canonical', root/'solution.py'); m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
solve=m.Solution().distinctSubseqII
MOD=10**9+7

def oracle(s):
    # Position combinations independently construct strings, then deduplicate.
    return {''.join(s[i] for i in indices) for k in range(1,len(s)+1)
            for indices in itertools.combinations(range(len(s)),k)}

def last_occurrence(s):
    # Counts include empty, independently subtract the pre-previous-occurrence prefix.
    dp=[1]; last={}
    for i,c in enumerate(s):
        dp.append((2*dp[-1]-(dp[last[c]] if c in last else 0))%MOD)
        last[c]=i
    return (dp[-1]-1)%MOD

baseline_source=html.unescape(re.search(r'<pre tabindex="0"><code>(.*?)</code></pre>',(root/'index.html').read_text(),re.S).group(1))
namespace={};exec(baseline_source,namespace)
for n in range(1,6):
    for chars in itertools.product('abc',repeat=n):
        s=''.join(chars);assert namespace['baseline'](s)==len(oracle(s))
checks=0
for n in range(1,9):
    for chars in itertools.product('abc',repeat=n):
        s=''.join(chars); expected=len(oracle(s)); assert solve(s)==expected,(s,expected,solve(s)); checks+=1
rng=random.Random(940)
for _ in range(200):
    s=''.join(rng.choice('abcde') for _ in range(rng.randrange(1,13)))
    assert solve(s)==len(oracle(s));checks+=1
for s,v in [('abc',7),('aba',6),('aaa',3),('a',1),('aa',2),('abba',10),('abab',11),('abca',14),('a'*2000,2000),('abcdefghijklmnopqrstuvwxyz',2**26-1)]:
    assert solve(s)==v; checks+=1
for s in ['ab'*1000,'abcdefghijklmnopqrstuvwxyz'*76+'abcdefghijklmnopqrstuvwx','a'*1999+'b']+[''.join(rng.choice('abcdefghijklmnopqrstuvwxyz') for _ in range(2000)) for _ in range(30)]:
    assert len(s)==2000;assert solve(s)==last_occurrence(s);checks+=1
source=(root/'solution.py').read_text();mirror=(root/'python-code.js').read_text()
assert mirror=='window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
report={'type':'author self-check','canonical':'Solution.distinctSubseqII(s: str) -> int','checks':checks,'oracles':'position combinations and last-occurrence prefix recurrence','seed':940,'maxLength':2000,'result':'pass'}
(out/'numerical.json').write_text(json.dumps(report,indent=2)+'\n');print(report)
