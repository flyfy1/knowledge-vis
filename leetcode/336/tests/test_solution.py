"""Run: python3 -B leetcode/336/tests/test_solution.py
Optional LESSON_OUTPUT_DIR controls all generated evidence.
"""
import importlib.util,itertools,json,os,random,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('LESSON_OUTPUT_DIR', ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution336',ROOT/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
def oracle(words):
    # Two-pointer comparison of the virtual concatenation, no trie or radius reuse.
    answer=set()
    for i,a in enumerate(words):
        for j,b in enumerate(words):
            if i==j:continue
            size=len(a)+len(b)
            def at(k):return a[k] if k<len(a) else b[k-len(a)]
            if all(at(k)==at(size-1-k) for k in range(size//2)):answer.add((i,j))
    return answer
observed_nodes=[]
class ObservedNode(mod.Node):
    def __init__(self):
        super().__init__()
        observed_nodes.append(self)
mod.Node=ObservedNode
cases=0
trie_checks=0
start=time.monotonic()
def check(words,expected=None):
    global cases, trie_checks
    observed_nodes.clear()
    before=list(words);got=mod.Solution().palindromePairs(words)
    assert words==before
    assert len(got)==len(set(map(tuple,got))),words
    assert set(map(tuple,got))==(oracle(words) if expected is None else expected), (words,got)
    if sum(map(len,words))<=40:
        pending=[(observed_nodes[0], '')]
        while pending:
            node, path=pending.pop()
            end=[j for j,w in enumerate(words) if w[::-1]==path]
            candidates=[]
            for j,w in enumerate(words):
                if w[::-1].startswith(path):
                    remaining=w[:len(w)-len(path)]
                    if remaining==remaining[::-1]:candidates.append(j)
            assert node.end==(end[0] if end else -1)
            assert node.pal==candidates
            pending.extend((child,path+c) for c,child in node.child.items())
            trie_checks+=1
    cases+=1
universe=[''.join(t) for n in range(4) for t in itertools.product('ab',repeat=n)]
for n in range(1,5):
    for words in itertools.combinations(universe,n):check(list(words))
rng=random.Random(336)
for _ in range(700):
    words=set()
    for __ in range(rng.randrange(1,25)):words.add(''.join(rng.choices('abcd',k=rng.randrange(13))))
    check(sorted(words))
flag_words=0
for n in range(10):
    for letters in itertools.product('ab',repeat=n):
        s=''.join(letters);pre,suf=mod.palindrome_flags(s)
        assert pre==[s[:k]==s[:k][::-1] for k in range(n+1)],s
        assert suf==[s[k:]==s[k:][::-1] for k in range(n+1)],s
        flag_words+=1
for w in ['a'*300,'ab'*150,'a'*149+'bb'+'a'*149]:
    pre,suf=mod.palindrome_flags(w)
    assert all(pre[k]==(w[:k]==w[:k][::-1]) and suf[k]==(w[k:]==w[k:][::-1]) for k in range(301))
for words in [['abcd','dcba','lls','s','sssll'],['bat','tab','cat'],['a',''],[''],['abc'],['a'*i for i in range(301)]]:check(words)
def encode(i):
    s=''
    for _ in range(6):s+=chr(97+i%26);i//=26
    return s
large=['a'+encode(i)+'a'*292+'b' for i in range(5000)]
assert all(len(w)==300 for w in large)
check(large,set())
mirror=(ROOT/'python-code.js').read_text();assert json.loads(mirror.split('=',1)[1].strip().removesuffix(';'))==(ROOT/'solution.py').read_text()
result={'status':'pass','pair_cases':cases,'exhaustive_flag_words':flag_words,'canonical_trie_nodes_checked':trie_checks,'max_input':{'n':5000,'length':300,'expectedPairs':0},'seconds':round(time.monotonic()-start,3),'sourceMirror':'exact'}
(OUT/'python-results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
