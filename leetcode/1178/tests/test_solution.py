import json, random, subprocess, sys
from pathlib import Path
ROOT=Path(__file__).parent.parent
sys.path.insert(0,str(ROOT)); from solution import Solution

def brute(words,puzzles):
 out=[]
 for p in puzzles:
  ps=set(p); out.append(sum(p[0] in set(w) and set(w)<=ps for w in words))
 return out
assert Solution().findNumOfValidWords(['aaaa','asas','able','ability','actt','actor','access'],['aboveyz','abrodyz','abslute','absoryz','actresz','gaswxyz'])==[1,1,3,2,4,0]
assert Solution().findNumOfValidWords(['apple','pleas','please'],['aelwxyz','aelpxyz','aelpsxy','saelpxy','xaelpsy'])==[0,1,3,2,0]
r=random.Random(1178)
letters='abcdefg'
for _ in range(300):
 words=[''.join(r.choice(letters) for _ in range(r.randint(4,8))) for _ in range(r.randint(1,12))]
 puzzles=[''.join(r.sample(letters,7)) for _ in range(r.randint(1,8))]
 assert Solution().findNumOfValidWords(words,puzzles)==brute(words,puzzles)
mirror=(ROOT/'python-code.js').read_text(); source=(ROOT/'solution.py').read_text()
assert json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').strip().removesuffix(';'))==source
entry=json.loads((ROOT/'lesson-entry.json').read_text()); assert isinstance(entry['complexity'],str) and entry['complexity']
print('1178 solution/oracle/source parity: PASS')
