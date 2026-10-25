import itertools, random, json, os, sys, subprocess, importlib.util
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
sys.path.insert(0,str(ROOT));from solution import Solution
from baseline import baseline

def neighbors(word):
    result={word}
    for i in range(len(word)):
        for j in range(i+1,len(word)):
            if word[i]!=word[j]:
                chars=list(word);chars[i],chars[j]=chars[j],chars[i];result.add(''.join(chars))
    return result

def oracle(words, pairs=None):
    # Actual legal swaps, followed by reachability; no mismatch-count test or DSU.
    adj=[set() for _ in words]; generated={w:neighbors(w) for w in set(words)}
    if pairs is None:pairs=itertools.combinations(range(len(words)),2)
    for i,j in pairs:
        if words[j] in generated[words[i]]:adj[i].add(j);adj[j].add(i)
    seen=set();parts=[]
    for i in range(len(words)):
        if i in seen:continue
        todo=[i];seen.add(i);part=[]
        while todo:
            x=todo.pop();part.append(x)
            for y in adj[x]-seen:seen.add(y);todo.append(y)
        parts.append(sorted(part))
    return sorted(parts)

rng=random.Random(839);cases=[]
for letters,maxn in [('abc',4),('aab',4),('a',4)]:
    words=sorted(set(map(''.join,itertools.permutations(letters))))
    for n in range(1,maxn+1):cases.extend(map(list,itertools.product(words,repeat=n)))
for _ in range(500):
    letters=''.join(rng.choice('abcd') for _ in range(rng.randint(1,8)))
    words=[]
    for _ in range(rng.randint(1,12)):
        w=list(letters);rng.shuffle(w);words.append(''.join(w))
    cases.append(words)
cases += [['tars','rats','arts','star'],['omv','ovm'],['abc','bca'],['abc','bac','bca','bca']]
for words in cases:
    before=words[:];want=len(oracle(words));assert Solution().numSimilarGroups(words)==want,(words,want)
    assert baseline(words)==want;assert words==before
maximum=[('a'*i+'b'+'a'*(299-i)) for i in range(300)]
assert Solution().numSimilarGroups(maximum)==1
assert Solution().numSimilarGroups(['a'*300]*300)==1
# Transfer snapshots from the browser model; recompute every prefix independently.
trace_cases=cases[::7]+[['tars','rats','arts','star'],['abc','abc','abc']]
runner="const C=require('./core.js');let s='';process.stdin.on('data',x=>s+=x);process.stdin.on('end',()=>console.log(JSON.stringify(JSON.parse(s).map(C.trace))));"
traces=json.loads(subprocess.run(['node','-e',runner],input=json.dumps(trace_cases),text=True,capture_output=True,cwd=ROOT,check=True).stdout)
frames=0
for words,trace in zip(trace_cases,traces):
    pairs=list(itertools.combinations(range(len(words)),2));assert len(trace)==len(pairs)+1
    for k,f in enumerate(trace):
        parts=oracle(words,pairs[:k]);assert sorted(sorted(g['members']) for g in f['groups'])==parts
        assert f['count']==len(parts);assert len(f['history'])==k
        for g in f['groups']:
            assert f['parent'][g['root']]==g['root'];assert f['size'][g['root']]==len(g['members'])
            for i in g['members']:
                visited=set()
                while f['parent'][i]!=i:assert i not in visited;visited.add(i);i=f['parent'][i]
                assert i==g['root']
        if k:
            e=f['event'];i,j=pairs[k-1];assert (e['i'],e['j'])==(i,j)
            assert e['before']==trace[k-1]['count'];assert e['after']==f['count']
            assert e['before']-e['after']==(e['kind']=='merged')
        frames+=1
# Mirror exactness and duplicate localization key detection.
source=(ROOT/'solution.py').read_text();mirror=(ROOT/'python-code.js').read_text()
assert json.loads(mirror[len('window.PYTHON_SOURCE = '):-2])==source

def unique(pairs):
    out={}
    for k,v in pairs:assert k not in out,k;out[k]=v
    return out
copy=json.loads((ROOT/'copy.js').read_text()[len('window.LESSON_COPY = '):-2],object_pairs_hook=unique)
assert all(isinstance(p,list) and len(p)==2 and all(isinstance(x,str) and x for x in p) for p in copy.values())
result={'type':'author self-check','solutionCases':len(cases)+2,'traceInputs':len(trace_cases),'intermediateFrames':frames,'oracle':'Enumerate actual single-swap neighbors; traverse graph independently.','maximum':'300 words, each length 300; 300 duplicate words length 300','sourceMirrorExact':True,'copyKeysUnique':len(copy),'result':'pass'}
(OUT/'core.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
