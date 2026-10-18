import sys, json, itertools, random, subprocess, os
from pathlib import Path
sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from solution import Solution
from oracle import baseline
OUT = Path(os.environ.get('EVIDENCE_DIR', ROOT/'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
rng = random.Random(212)
cases = []
all_words = [''.join(x) for n in range(1,6) for x in itertools.product('ab', repeat=n)]
for rows, cols in [(1,1),(1,2),(2,1),(2,2),(2,3)]:
    for letters in itertools.product('ab', repeat=rows*cols):
        cases.append({'board':[''.join(letters[r*cols:(r+1)*cols]) for r in range(rows)],'words':all_words})
for _ in range(200):
    rows,cols=rng.randint(1,3),rng.randint(1,3)
    cases.append({'board':[''.join(rng.choices('abc',k=cols)) for _ in range(rows)],'words':sorted(set(''.join(rng.choices('abc',k=rng.randint(1,7))) for _ in range(20)))})
fixtures=[({'board':['oaan','etae','ihkr','iflv'],'words':['oath','pea','eat','rain']},['eat','oath']),({'board':['ab','cd'],'words':['abcb']},[]),({'board':['at','xo'],'words':['at','ato','ata','ao']},['at','ato'])]
for case,expected in fixtures:
    assert baseline(case['board'],case['words'])==expected
    cases.append(case)
for case in cases:
    board=list(map(list,case['board']));before=[r[:] for r in board];words=case['words'][:]
    answer=Solution().findWords(board,words)
    assert sorted(answer)==baseline(before,words),case
    assert len(answer)==len(set(answer)) and board==before and words==case['words']
# Official maximum dimensions/word length, successful long path.
board=[list('abcdefghijkl') for _ in range(12)]
assert sorted(Solution().findWords(board,['abcdefghij','lkjihgfedc','zzzzzzzzzz']))==['abcdefghij','lkjihgfedc']
# Dense maximum board: all short terminal prefixes remain traversable.
assert sorted(Solution().findWords([list('a'*12) for _ in range(12)],['a'*i for i in range(1,11)]))==['a'*i for i in range(1,11)]
# Maximum count and total dictionary characters: 30000 unique length-10 words.
words=['b'+''.join(chars)+'b' for chars in itertools.islice(itertools.product('bcdef',repeat=8),30000)]
assert len(set(words))==30000 and Solution().findWords([list('a'*12) for _ in range(12)],words)==[]
# Source mirror is one assignment of exactly the canonical bytes.
source=ROOT.joinpath('solution.py').read_text()
mirror=ROOT.joinpath('python-code.js').read_text()
assert mirror=='window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
# Independently audit the simulator against the baseline, plus each frame's invariant.
trace_cases=cases[::7]+[c for c,_ in fixtures]
js="const a=require('./core.js');let s='';process.stdin.on('data',x=>s+=x);process.stdin.on('end',()=>process.stdout.write(JSON.stringify(JSON.parse(s).map(c=>a.trace(c)))));"
traces=json.loads(subprocess.run(['node','-e',js],cwd=ROOT,input=json.dumps(trace_cases),text=True,capture_output=True,check=True).stdout)
events=0
for case,frames in zip(trace_cases,traces):
    expected=baseline(case['board'],case['words']);previous=[]
    for i,f in enumerate(frames):
        events+=1
        path=[tuple(x) for x in f['path']]
        assert len(path)==len(set(path))
        assert all(abs(a-c)+abs(b-d)==1 for (a,b),(c,d) in zip(path,path[1:]))
        prefix=''.join(case['board'][r][c] for r,c in path)
        assert prefix==f['prefix'] and any(w.startswith(prefix) for w in case['words'])
        assert set(f['found'])<=set(expected) and len(f['found'])==len(set(f['found']))
        for n in f['nodes']:
            assert n['pending']==bool(n['word'] and n['word'] not in f['found'])
        if f['kind']=='enter': assert len(path)==len(previous)+1
        if f['kind']=='exit': assert len(path)==len(previous)-1
        if f['kind'] in ('reject','reuse','emit'): assert path==previous
        if f['kind']=='reuse': assert tuple(f['target']) in path
        if f['kind']=='reject':
            r,c=f['target'];assert not any(w.startswith(prefix+case['board'][r][c]) for w in case['words'])
        previous=path
    assert sorted(frames[-1]['found'])==expected and not frames[-1]['path']
    if len(frames)>2:
        saved=json.dumps(frames[1],sort_keys=True);frames[2]['path'].append([-1,-1]);assert saved==json.dumps(frames[1],sort_keys=True)
result={'canonicalCases':len(cases),'boundaryCases':3,'traceCases':len(traces),'framesAudited':events,'sourceParity':True,'seed':212,'status':'passed author self-check'}
OUT.joinpath('algorithm-results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
