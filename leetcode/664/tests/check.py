"""Author computational checks. OUTPUT_DIR redirects all generated evidence."""
import os, json, itertools, random, sys, importlib.util
from collections import deque
from pathlib import Path
P=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',P/'tests/evidence')); OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('canonical',P/'solution.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
solve=mod.Solution().strangePrinter

def all_boards(n, alphabet):
    start='_'*n; dist={start:0};q=deque([start])
    while q:
        s=q.popleft()
        for i in range(n):
            for j in range(i,n):
                for c in alphabet:
                    x=s[:i]+c*(j-i+1)+s[j+1:]
                    if x not in dist:dist[x]=dist[s]+1;q.append(x)
    return dist

def split_oracle(s):
    # Independent endpoint-equality / all-splits recurrence.
    if not s:return 0
    n=len(s);d=[[0]*n for _ in s]
    for span in range(1,n+1):
        for i in range(n-span+1):
            j=i+span-1
            d[i][j]=1 if i==j else d[i][j-1] if s[i]==s[j] else min(d[i][k]+d[k+1][j] for k in range(i,j))
    return d[0][-1]

fixtures={};checked=0
for n in range(1,6):
    distances=all_boards(n,'abc')
    for chars in itertools.product('abc',repeat=n):
        s=''.join(chars);v=distances[s];assert solve(s)==v,(s,solve(s),v);assert split_oracle(s)==v
        fixtures[s]=v;checked+=1
assert all_boards(6,'abc')['bcacba']==4
assert solve('bcacba')==4
fixtures['bcacba']=4;checked+=1
rng=random.Random(664)
for _ in range(250):
    s=''.join(rng.choice('abcd') for _ in range(rng.randint(1,35)))
    assert solve(s)==split_oracle(s);checked+=1
for s,v in [('a'*100,1),('ab'*50,51),('abcdefghijklmnopqrstuvwxyz',26),('aaabbb',2),('aba',2),('abab',3),('abcba',3)]:
    assert solve(s)==v;fixtures[s]=v;checked+=1
(OUT/'oracle-fixtures.json').write_text(json.dumps(fixtures,indent=2)+'\n')
(OUT/'python-results.json').write_text(json.dumps({'kind':'author self-check','cases':checked,'exhaustive':'all abc strings lengths 1..5 against BFS over board states','seed':664,'random':250,'boundaries':'length 100 identical/alternating; 26 distinct; official examples; transfer'},indent=2)+'\n')
print('Python/oracle PASS',checked)
