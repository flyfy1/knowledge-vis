"""Run: LESSON_TEST_OUTPUT_DIR=/tmp/68-check python3 leetcode/68/tests/test_solution.py"""
import sys, json, os, random, itertools, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.dont_write_bytecode=True
sys.path.insert(0,str(ROOT))
from solution import Solution
OUT=Path(os.environ.get('LESSON_TEST_OUTPUT_DIR',str(ROOT/'tests'/'evidence')));OUT.mkdir(parents=True,exist_ok=True)

def compositions(total, count):
    if count==1:
        if total>=1:yield (total,)
    else:
        for x in range(1,total-count+2):
            for tail in compositions(total-x,count-1):yield (x,)+tail

def oracle(words,width):
    # Independently enumerate every possible consecutive group endpoint and
    # every positive gap composition. Minimize spread, then prefer larger left gaps.
    out=[];start=0
    while start<len(words):
        ends=[end for end in range(start+1,len(words)+1) if len(' '.join(words[start:end]))<=width]
        end=max(ends);group=words[start:end]
        if end==len(words) or len(group)==1:
            line=' '.join(group).ljust(width)
        else:
            options=compositions(width-sum(map(len,group)),len(group)-1)
            gaps=min(options,key=lambda g:(max(g)-min(g),tuple(-x for x in g)))
            line=group[0]+''.join(' '*g+w for g,w in zip(gaps,group[1:]))
        out.append(line);start=end
    return out

def baseline(words,width):
    out=[];start=0
    while start<len(words):
        end=start+1
        while end<len(words) and len(' '.join(words[start:end+1]))<=width:end+=1
        group=words[start:end]
        if end==len(words) or len(group)==1:line=' '.join(group).ljust(width)
        else:
            gaps=[0]*(len(group)-1)
            for s in range(width-sum(map(len,group))):gaps[s%len(gaps)]+=1
            line=group[0]+''.join(' '*g+w for g,w in zip(gaps,group[1:]))
        out.append(line);start=end
    return out

cases=0
fixtures=[]
def check(words,width,expected=None,brute=True):
    global cases
    before=words[:];actual=Solution().fullJustify(words,width)
    want=oracle(words,width) if brute else baseline(words,width)
    assert actual==want,(words,width,actual,want)
    if expected is not None:assert actual==expected,(actual,expected)
    assert words==before and all(len(line)==width for line in actual)
    assert [w for line in actual for w in line.split()]==words
    cases+=1
    fixtures.append({'words':words,'width':width,'expected':actual})

check(['This','is','an','example','of','text','justification.'],16,['This    is    an','example  of text','justification.  '])
check(['What','must','be','acknowledgment','shall','be'],16,['What   must   be','acknowledgment  ','shall be        '])
check('Science is what we understand well enough to explain to a computer. Art is everything else we do'.split(),20,['Science  is  what we','understand      well','enough to explain to','a  computer.  Art is','everything  else  we','do                  '])
for n in range(1,6):
    for lengths in itertools.product(range(1,4),repeat=n):
        for width in range(max(lengths),9):check(['x'*x for x in lengths],width)
rng=random.Random(68)
for _ in range(500):
    width=rng.randint(1,100);words=['x'*rng.randint(1,min(width,20)) for _ in range(rng.randint(1,300))]
    check(words,width,brute=False)
for words,width in [(['x'*20]*300,100),(['!']*300,1),(['x'*20],100),(['a','b'],100),(['red','a','bb','cc'],9)]:check(words,width,brute=False)
mirror=(ROOT/'python-code.js').read_text()
assert mirror=='window.PYTHON_SOURCE = '+json.dumps((ROOT/'solution.py').read_text())+';\n'
official=json.loads((ROOT/'tests'/'official-graphql.json').read_text())['data']['question']
assert any(c['langSlug']=='python3' and 'fullJustify' in c['code'] for c in official['codeSnippets'])
(OUT/'solution-results.json').write_text(json.dumps({'cases':cases,'officialExamples':3,'seed':68,'status':'passed','interface':'Solution.fullJustify(words, maxWidth)','unchangedInput':True},indent=2))
(OUT/'fixtures.json').write_text(json.dumps(fixtures))
print(f'{cases} canonical Python checks passed')
