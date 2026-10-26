import sys,pathlib,itertools,random,json,os
from collections import deque
ROOT=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from solution import Solution
from baseline import baseline
OUT=pathlib.Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
def reachable(stamp,n):
    # Independent forward-state search: uses no reverse matching or blockers.
    start='?'*n;seen={start};queue=deque([start])
    while queue:
        s=queue.popleft()
        for i in range(n-len(stamp)+1):
            nxt=s[:i]+stamp+s[i+len(stamp):]
            if nxt not in seen:
                seen.add(nxt);queue.append(nxt)
    return seen

def check(stamp,target,exists):
    moves=Solution().movesToStamp(stamp,target)
    assert bool(moves)==exists,(stamp,target,moves,exists)
    assert len(moves)<=len(target)<=10*len(target)
    s='?'*len(target)
    for i in moves:
        assert 0<=i<=len(target)-len(stamp)
        s=s[:i]+stamp+s[i+len(stamp):]
    if moves: assert s==target,(stamp,target,moves,s)
    return moves
count=0
fixtures=[]
for n in range(1,8):
    for m in range(1,min(n,4)+1):
        for letters in itertools.product('ab',repeat=m):
            stamp=''.join(letters);seen=reachable(stamp,n)
            for chars in itertools.product('ab',repeat=n):
                target=''.join(chars);exists=target in seen
                check(stamp,target,exists)
                assert bool(baseline(stamp,target))==exists
                fixtures.append([stamp,target,exists]);count+=1
rng=random.Random(936)
for _ in range(300):
    n=rng.randrange(1,8);m=rng.randrange(1,n+1)
    stamp=''.join(rng.choices('abc',k=m));target=''.join(rng.choices('abc',k=n))
    exists=target in reachable(stamp,n);check(stamp,target,exists);fixtures.append([stamp,target,exists])
for stamp,target in [('abc','ababc'),('abca','aabcaca'),('aba','ababa')]:
    check(stamp,target,True)
large=[]
for stamp,target,exists in [('a','a'*1000,True),('a','a'*999+'b',False),('a'*500,'a'*1000,True),('a'*1000,'a'*1000,True),('a'*999+'b','a'*1000,False),('ab','a'*999+'b',True)]:
    moves=check(stamp,target,exists);large.append({'m':len(stamp),'n':len(target),'exists':exists,'moves':len(moves)})
# Seeded reachable constructions with alphabet abc and longer inputs.
for _ in range(500):
    n=rng.randrange(5,80);m=rng.randrange(1,n+1);stamp=''.join(rng.choices('abc',k=m))
    s='?'*n
    for i in list(range(0,n-m+1,m))+[n-m]+[rng.randrange(n-m+1) for _ in range(10)]:
        s=s[:i]+stamp+s[i+m:]
    assert '?' not in s
    check(stamp,s,True)
OUT.joinpath('oracle-fixtures.json').write_text(json.dumps(fixtures))
result={'kind':'author self-check','oracle':'independent forward reachable-state BFS','exhaustiveBinaryCases':count,'seededTernaryCases':300,'seededReachableCases':500,'largeBoundaries':large,'officialExamples':2,'freshTransfer':1}
OUT.joinpath('solution.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
