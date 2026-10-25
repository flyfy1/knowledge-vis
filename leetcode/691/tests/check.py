"""Author self-check. OUTPUT_DIR redirects all emitted evidence."""
import collections, hashlib, importlib.util, itertools, json, os, pathlib, random, subprocess
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = pathlib.Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('canonical', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
solution = module.Solution()

def oracle(stickers, target):
    # Positions, not count tuples; BFS layers minimize the number of stickers.
    goal = (1 << len(target)) - 1
    queue = collections.deque([(0, 0)]); seen = {0}
    while queue:
        mask, depth = queue.popleft()
        if mask == goal: return depth
        for word in stickers:
            nxt = mask
            for letter in word:
                for i, needed in enumerate(target):
                    if letter == needed and not (nxt >> i & 1):
                        nxt |= 1 << i
                        break
            if nxt not in seen:
                seen.add(nxt); queue.append((nxt, depth + 1))
    return -1

count = 0
words = ['a', 'b', 'aa', 'ab', 'ba', 'bb']
for n in range(1, 4):
    for stickers in itertools.combinations(words, n):
        for m in range(1, 6):
            for chars in itertools.product('ab', repeat=m):
                target = ''.join(chars); original = list(stickers)
                want = oracle(stickers, target)
                assert solution.minStickers(original, target) == want, (stickers, target, want)
                assert original == list(stickers)
                count += 1
rng = random.Random(691)
cases = []
for _ in range(350):
    stickers = [''.join(rng.choices('abc', k=rng.randint(1, 5))) for _ in range(rng.randint(1, 5))]
    target = ''.join(rng.choices('abc', k=rng.randint(1, 8)))
    assert solution.minStickers(stickers, target) == oracle(stickers, target)
    cases.append(dict(stickers=stickers, target=target))
boundaries = [(['with','example','science'],'thehat',3), (['notice','possible'],'basicbasic',-1),
 (['a'],'a'*15,15), (['abcdefghij','klmno'],'abcdefghijklmno',2),
 (['a']*50,'b'*15,-1), (['abcdefghij']*50,'abcdefghijabcde',2),
 (['ab','ac','bc'],'aabbcc',3), (['abcd','abe','cdf'],'abcdef',2)]
for s,t,w in boundaries:
    assert solution.minStickers(s,t)==oracle(s,t)==w
# Inspect simulation frames independently, including completed internal states.
runner="const C=require('./core.js');let s='';process.stdin.on('data',x=>s+=x);process.stdin.on('end',()=>console.log(JSON.stringify([...C.presets,...JSON.parse(s)].map(p=>({input:p,...C.trace(p)})))));"
r = subprocess.run(['node','-e',runner], cwd=ROOT, input=json.dumps(cases[:45]), text=True, capture_output=True, check=True)
traces=json.loads(r.stdout); events=0; memo_checks=0
for trace in traces:
    p=trace['input']; letters=trace['letters']; frames=trace['frames']
    expected=oracle(p['stickers'],p['target'])
    assert (-1 if trace['result'] is None else trace['result'])==expected
    previous={}; call_candidates={}
    for f in frames:
        events+=1
        assert previous.keys() <= f['memo'].keys()
        for k,v in f['memo'].items():
            if k not in previous:
                remaining=''.join(c*n for c,n in zip(letters,v['r']))
                assert (-1 if v['value'] is None else v['value'])==oracle(p['stickers'],remaining)
                memo_checks+=1
        previous=f['memo']
        if f['kind']=='child':
            counts=collections.Counter(p['stickers'][f['i']])
            assert f['child']==[max(0,n-counts[c]) for c,n in zip(letters,f['r'])]
            assert sum(f['child']) < sum(f['r'])
            assert f['stack'][-1]['r']==f['r'] # parent's argument stays immutable
        if f['kind']=='enter':
            call_candidates[len(f['stack'])]=[]
        if f['kind']=='return':
            candidates=call_candidates[len(f['stack'])]
            if f['candidate'] is not None: candidates.append(f['candidate'])
            assert f['best']==(min(candidates) if candidates else None)
            assert f['candidate']==(None if f['value'] is None else 1+f['value'])
        if f['kind']=='skip':
            assert letters[f['pivot']] not in p['stickers'][f['i']]
# Execute the actual baseline shown in the lesson on small independent cases.
app=(ROOT/'app.js').read_text()
baseline_source=app.split("$('baselineCode').firstElementChild.textContent=`",1)[1].split('`;',1)[0]
namespace={};exec(baseline_source,namespace)
for p in cases[:80]:
    assert namespace['baseline'](p['stickers'],p['target']) == oracle(p['stickers'],p['target'])
source=(ROOT/'solution.py').read_text()
mirror=(ROOT/'python-code.js').read_text()
assert mirror == 'window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
# Detect duplicate definitions before JavaScript parses them away.
keys=[]
for line in (ROOT/'copy.js').read_text().splitlines():
    import re
    keys.extend(re.findall(r'(?:^|,)\s*(\w+):\[',line))
assert len(keys)==len(set(keys)), 'duplicate localization key'
assert all(len(v)==2 and all(isinstance(s,str) and s for s in v) for v in json.loads(subprocess.check_output(['node','-e',"const fs=require('fs'),vm=require('vm');console.log(vm.runInNewContext(fs.readFileSync('copy.js','utf8')+';JSON.stringify(COPY)'))"],cwd=ROOT)).values())
result={'kind':'author self-check','exhaustive':count,'seeded':350,'boundary':len(boundaries),'traceCases':len(traces),'events':events,'memoChecks':memo_checks,'sourceSha256':hashlib.sha256(source.encode()).hexdigest(),'sourceParity':True,'duplicateCopyKeys':False}
(OUT/'core-results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
