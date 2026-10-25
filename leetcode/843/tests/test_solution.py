import importlib.util,itertools,json,os,random,sys
from pathlib import Path
sys.dont_write_bytecode=True
root=Path(__file__).resolve().parents[1]
out=Path(os.environ.get('OUTPUT_DIR',root/'tests/evidence'));out.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',root/'solution.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def oracle(a,b):
    return len([i for i in range(6) if a[i]==b[i]])
class Judge:
    def __init__(self,words,secret):
        self.words=words;self.secret=secret;self.history=[];self.candidates=words[:]
    def guess(self,word):
        assert word in self.words
        assert word not in [h['guess'] for h in self.history]
        assert len(self.history)<10
        # Independent partition enumeration, independent of solution's cached matrix.
        ranked=[]
        for i,probe in enumerate(self.words):
            if probe in [h['guess'] for h in self.history]:continue
            groups={r:[w for w in self.candidates if oracle(w,probe)==r] for r in range(6)}
            ranked.append((max(map(len,groups.values())),probe not in self.candidates,i,probe))
        assert word==min(ranked)[3]
        reply=oracle(word,self.secret)
        before=self.candidates[:]
        self.history.append({'guess':word,'reply':reply})
        self.candidates=[w for w in self.words if all(oracle(w,h['guess'])==h['reply'] for h in self.history)]
        assert self.candidates==[w for w in before if oracle(w,word)==reply]
        assert self.secret in self.candidates
        return reply
count=0;maxcalls=0

def check(words,secret,success=True):
    global count,maxcalls
    j=Judge(words,secret);original=words[:]
    assert m.Solution().findSecretWord(words,j) is None
    assert words==original
    if success: assert j.history[-1]['reply']==6,(words,secret,j.history)
    maxcalls=max(maxcalls,len(j.history));count+=1
    return j
pool=[''.join(x)+'aaa' for x in itertools.product('ab',repeat=3)]
for mask in range(1,1<<len(pool)):
    words=[pool[i] for i in range(len(pool)) if mask>>i&1]
    for secret in words:check(words,secret)
rng=random.Random(843)
for size in [1,2,3,10,30,100]:
    for _ in range(10):
        words=[]
        while len(words)<size:
            w=''.join(rng.choices('abcdef',k=6))
            if w not in words:words.append(w)
        for secret in rng.sample(words,min(4,size)):check(words,secret)
for words in [['acckzz','ccbazz','eiowzz','abcczz'],['hamada','khaled']]:
    for secret in words:check(words,secret)
stress=check([c*6 for c in 'abcdefghijklmnopqrstuvwxyz'],'zzzzzz',False)
assert len(stress.history)==10 and stress.history[-1]['reply']!=6
# Correct brute-force baseline always succeeds in <=n calls, but violates budget here.
assert next(i+1 for i,w in enumerate(stress.words) if oracle(w,'zzzzzz')==6)==26
result={'kind':'author computational self-check','result':'pass','cases':count,'exhaustive':'all 255 nonempty subsets of eight 6-letter words; every secret','seed':843,'maxCallsObserved':maxcalls,'boundary':'n=1, zero replies, n=100, unique words, actual terminal guess, unchanged input','budgetStress':'26 disjoint words: ten-call heuristic intentionally cannot find final word; documented limitation','officialExamples':'all secrets in both official lists','invariants':'every probe minimax by independent partitions, exact history-consistent candidates, true secret retained, legal/nonrepeated calls'}
(out/'solution-results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
