import sys, itertools, random, json, os
from pathlib import Path
sys.dont_write_bytecode=True
P=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(P));sys.path.insert(0,str(P/'tests'))
from solution import Solution
from baseline import baseline
solve=Solution().kSimilarity
count=0
# All ordered pairs within every binary multiset of lengths 1..7.
for n in range(1,8):
 for k in range(n+1):
  strings=sorted({''.join(x) for x in itertools.permutations('a'*k+'b'*(n-k))})
  for a in strings:
   for b in strings:
    assert solve(a,b)==baseline(a,b),(a,b)
    count+=1
rng=random.Random(854)
for _ in range(220):
 a=''.join(rng.choice('abcd') for _ in range(rng.randint(1,8)))
 b=''.join(rng.sample(a,len(a)))
 assert solve(a,b)==baseline(a,b),(a,b);count+=1
fixtures=[('ab','ba',1),('abc','bca',2),('aabbcc','abcabc',2),('abcb','bbca',1),('a'*20,'a'*20,0),('a'*10+'b'*10,'b'*10+'a'*10,10),('abcde'*4,'abcde'*4,0),('a'*19+'b','b'+'a'*19,1)]
for a,b,k in fixtures:assert solve(a,b)==k
out=Path(os.environ.get('EVIDENCE_DIR',P/'tests/evidence'));out.mkdir(parents=True,exist_ok=True)
(out/'solution-results.json').write_text(json.dumps({'kind':'author self-check','oracle':'unrestricted all-pair-swap BFS','exhaustiveAndSeededCases':count,'fixtures':fixtures,'result':'pass'},indent=2)+'\n')
print('Python oracle comparisons:',count,'plus',len(fixtures),'boundary fixtures: PASS')
