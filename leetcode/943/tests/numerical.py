"""Author self-check; independent exhaustive-string and order baselines.
OUTPUT_DIR redirects generated artifacts; no modification outside that directory.
"""
import importlib.util, itertools, json, os, random, time
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT/'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('solution', ROOT/'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
solution = module.Solution().shortestSuperstring

def baseline(words):
    best = None
    for order in itertools.permutations(words):
        result = order[0]
        for word in order[1:]:
            k = min(len(result), len(word))
            while k and result[-k:] != word[:k]:
                k -= 1
            result += word[k:]
        if best is None or len(result) < len(best):
            best = result
    return best

def string_oracle(words):
    # No overlap recurrence: enumerate output strings by length.
    alphabet = sorted(set(''.join(words)))
    for length in range(max(map(len, words)), sum(map(len, words))+1):
        for chars in itertools.product(alphabet, repeat=length):
            candidate = ''.join(chars)
            if all(word in candidate for word in words):
                return candidate

def valid(words):
    return all(a not in b for i,a in enumerate(words) for j,b in enumerate(words) if i != j)

count = 0
start = time.monotonic()
def check(words, oracle=baseline, expected=None):
    global count
    before = words[:]
    actual = solution(words)
    want = len(oracle(words)) if expected is None else expected
    assert isinstance(actual,str) and all(w in actual for w in words), (words,actual)
    assert len(actual) == want, (words, actual, want)
    assert words == before
    count += 1
    return actual

for n in range(1,4):
    pool = [''.join(x) for k in range(1,3) for x in itertools.product('ab',repeat=k)]
    for words in itertools.combinations(pool,n):
        if valid(words): check(list(words),string_oracle)
# All equal-width binary triples: separate strings oracle, max result length 9.
for words in itertools.combinations([''.join(x) for x in itertools.product('ab',repeat=3)],3):
    check(list(words),string_oracle)
rng = random.Random(943)
for _ in range(250):
    n = rng.randint(1,7)
    pool = [''.join(x) for x in itertools.product('abc',repeat=3)]
    check(rng.sample(pool,n))
examples = [(['alex','loves','leetcode'],17),(['catg','ctaagt','gcta','ttca','atgcatc'],16),(['ab','bc','ca'],4),(['bcabb','acc','bbbca','ccabc'],12),(['ab','cd'],4),(['solo'],4),(['abc','bca','bcx'],6)]
for words,want in examples: check(words,expected=want)
# Maximum n, L; no overlaps because each word is a distinct repeated letter.
check([c*20 for c in 'abcdefghijkl'],expected=240)
# Maximum n with a long, provably optimal consecutive-window chain.
text='abcdefghijklmnopqrstuvwxyzzabcdefghijklmnopqrs'
words=[text[i:i+20] for i in range(12)]
check(words,expected=31)
# Greedy claim: lock the unique maximum pair and enumerate its legal orders.
w=['bcabb','acc','bbbca','ccabc']
orders=[p for p in itertools.permutations(w) if any(p[i:i+2]==('bbbca','bcabb') for i in range(3))]
assert min(len(baseline(list(p))) for p in [w])==12
# Build each locked order directly, without letting baseline reorder it.
def merge_order(p):
    s=p[0]
    for word in p[1:]:
        k=min(len(s),len(word))
        while k and s[-k:]!=word[:k]: k-=1
        s+=word[k:]
    return s
assert min(map(lambda p:len(merge_order(p)),orders))==13
# Verify the exact baseline displayed in HTML, rather than a similar transcription.
import re,html
code=html.unescape(re.search(r'<pre tabindex="0"><code>(from itertools.*?</code>)',(ROOT/'index.html').read_text(),re.S).group(1).removesuffix('</code>'))
namespace={};exec(code,namespace)
for words,want in examples: assert len(namespace['baseline'](words))==want
source=(ROOT/'solution.py').read_text()
mirror=(ROOT/'python-code.js').read_text()
assert mirror.startswith('window.PYTHON_SOURCE = ') and mirror.endswith(';\n')
assert json.loads(mirror[len('window.PYTHON_SOURCE = '):-2])==source
report={'kind':'author numerical self-check','cases':count,'seconds':time.monotonic()-start,'oracles':['output-string enumeration by increasing length','permutations with direct full-string merging'],'officialExamples':examples[:2],'maxConstraint':{'noOverlap':240,'chain':31},'sourceParity':True,'noInputMutation':True}
(OUT/'numerical.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
