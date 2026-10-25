"""Independent BFS uses only unit rotations and legal presses, not DP arcs."""
import collections,itertools,json,os,pathlib,random,subprocess,sys
P=pathlib.Path(__file__).resolve().parents[1];sys.path.insert(0,str(P))
from solution import Solution

def oracle(ring,key):
    queue=collections.deque([(0,0)]);dist={(0,0):0}
    while queue:
        p,k=queue.popleft()
        neighbors=[((p+1)%len(ring),k),((p-1)%len(ring),k)]
        if k<len(key) and ring[p]==key[k]:neighbors.append((p,k+1))
        for state in neighbors:
            if state not in dist:dist[state]=dist[p,k]+1;queue.append(state)
    return dist

def cases():
    for n in range(1,6):
        for r in map(''.join,itertools.product('ab',repeat=n)):
            for m in range(1,5):
                for k in map(''.join,itertools.product(sorted(set(r)),repeat=m)):yield r,k
    rng=random.Random(514)
    for _ in range(600):
        r=''.join(rng.choice('abc') for _ in range(rng.randint(1,10)))
        yield r,''.join(rng.choice(r) for _ in range(rng.randint(1,10)))
    yield 'godding','gd';yield 'godding','godding';yield 'abxxcbx','bc';yield 'abxxxcbxx','bc'
    yield 'a'*100,'a'*100;yield 'a'+'b'*99,'b'*100;yield 'a'*50+'b'*50,'ab'*50

allcases=list(cases());expected=[]
for ring,key in allcases:
    d=oracle(ring,key);want=min(v for (p,k),v in d.items() if k==len(key))
    assert Solution().findRotateSteps(ring,key)==want,(ring,key,want)
    # DP endpoint costs equal shortest unit-operation distance at matching endpoints
    # (other positions in BFS can be reached by rotating after the latest press).
    layers=[{0:0}]+[{p:d[p,k] for p in range(len(ring)) if ring[p]==key[k-1]} for k in range(1,len(key)+1)]
    expected.append({'ring':ring,'key':key,'answer':want,'layers':layers})
js="""const fs=require('fs'),assert=require('assert'),core=require(process.argv[1]);
const data=JSON.parse(fs.readFileSync(0,'utf8'));for(const c of data){const t=core.trace(c.ring,c.key);assert.equal(t.answer,c.answer);for(let i=0;i<t.frames.length;i++)assert.deepStrictEqual(t.frames[i].costs,c.layers[i]);for(const f of t.frames)for(const x of f.candidates){assert.equal(x.total,x.cost+x.distance+1);assert(x.total>=f.costs[x.target]);}}console.log(data.length);"""
r=subprocess.run(['node','-e',js,str(P/'core.js')],input=json.dumps(expected),text=True,capture_output=True,check=True)
source=(P/'solution.py').read_text();mirror=(P/'python-code.js').read_text();assert mirror=='window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
# Detect duplicate keys in the raw JSON dictionary before parser overwrite.
def no_duplicates(pairs):
    out={}
    for k,v in pairs:assert k not in out,k;out[k]=v
    return out
copy=json.loads((P/'copy.js').read_text().removeprefix('window.LESSON_COPY = ').removesuffix(';\n'),object_pairs_hook=no_duplicates)
assert all(isinstance(v,list) and len(v)==2 and all(isinstance(s,str) and s for s in v) for v in copy.values())
result={'cases':len(allcases),'oracle':'BFS over unit rotations and presses','python':'passed','browserCore':'all intermediate endpoint costs passed','sourceMirror':'exact','localization':'unique keys and bilingual pair shape'}
out=pathlib.Path(os.environ.get('OUTPUT_DIR',P/'tests/evidence'));out.mkdir(parents=True,exist_ok=True);(out/'numerical.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
