import json,itertools,random,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parents[1]))
from solution import Solution

def oracle(s): return max(s[i:j] for i in range(len(s)) for j in range(i+1,len(s)+1))
cases=[]
for n in range(1,8):
    for tup in itertools.product('abc', repeat=n): cases.append(''.join(tup))
random.seed(1163)
cases += [''.join(random.choice('abcd') for _ in range(random.randint(1,80))) for _ in range(300)]
cases += ['abab','leetcode','aaaa','azb','cababa']
for s in cases:
    got=Solution().lastSubstring(s); want=oracle(s)
    assert got==want,(s,got,want)
source=Path(__file__).parents[1]/'solution.py'
embedded=(Path(__file__).parents[1]/'python-code.js').read_text()
assert 'while j + k < n and i + k < n:' in source.read_text()
assert '\\n'.join(source.read_text().splitlines()) in embedded.replace('window.PYTHON_SOURCE = "','').rsplit('";',1)[0]
json.dump({'cases':len(cases),'officialExamples':{'abab':'bab','leetcode':'tcode'},'sourceParity':True},open(Path(__file__).parent/'evidence'/'oracle.json','w'),ensure_ascii=False,indent=2)
print('oracle and source parity passed',len(cases))
