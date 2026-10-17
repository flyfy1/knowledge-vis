"""Independent oracles, identity checks, source parity, and maximum cases."""
import importlib.util
import itertools
import json
import random
import re
from collections import Counter
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RNG = random.Random(20261017)
checks = 0

class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

def solution(number):
    spec = importlib.util.spec_from_file_location(f'solution{number}', ROOT / str(number) / 'solution.py')
    module = importlib.util.module_from_spec(spec)
    module.ListNode = ListNode
    spec.loader.exec_module(module)
    source = (ROOT / str(number) / 'solution.py').read_text()
    bundle = (ROOT / str(number) / 'python-code.js').read_text()
    assert json.loads(bundle.removeprefix('window.PYTHON_SOURCE = ').strip().removesuffix(';')) == source
    return module.Solution()

def equal(actual, expected, context=None):
    global checks
    assert actual == expected, (context, actual, expected)
    checks += 1

def linked(values):
    nodes = [ListNode(v) for v in values]
    for a,b in zip(nodes,nodes[1:]): a.next=b
    return (nodes[0] if nodes else None), nodes

def walk(head):
    nodes, seen = [], set()
    while head:
        assert id(head) not in seen, 'cycle'
        seen.add(id(head)); nodes.append(head); head=head.next
    return nodes

S={n:solution(n) for n in [4,10,23,25,30,32,37,41,42,44]}
arrays=[list(x) for size in range(4) for x in itertools.combinations_with_replacement([-2,0,2],size)]
for a in arrays:
    for b in arrays:
        if not a and not b: continue
        merged=sorted(a+b);n=len(merged)
        equal(S[4].findMedianSortedArrays(a,b),(merged[(n-1)//2]+merged[n//2])/2,(a,b))
texts=[''.join(x) for n in range(5) for x in itertools.product('ab',repeat=n)]
patterns=[''.join(x) for n in range(4) for x in itertools.product(['a','b','.','a*','b*','.*'],repeat=n)]
for s in texts:
    for p in patterns: equal(S[10].isMatch(s,p),re.fullmatch(p,s) is not None,(s,p))

@lru_cache(None)
def wildcard(s,p):
    if not p:return not s
    if p[0]=='*':return any(wildcard(s[i:],p[1:]) for i in range(len(s)+1))
    return bool(s) and (p[0]=='?' or p[0]==s[0]) and wildcard(s[1:],p[1:])
for s in texts:
    for n in range(4):
        for chars in itertools.product('ab?*',repeat=n):
            p=''.join(chars);equal(S[44].isMatch(s,p),wildcard(s,p),(s,p))
for _ in range(600):
    lists=[sorted(RNG.choices(range(-3,4),k=RNG.randrange(10))) for _ in range(RNG.randrange(8))]
    heads,nodes=[],[]
    for values in lists:
        h,ns=linked(values);heads.append(h);nodes.extend(ns)
    out=walk(S[23].mergeKLists(heads))
    equal([n.val for n in out],sorted(x for a in lists for x in a),lists)
    equal(set(map(id,out)),set(map(id,nodes)))
for n in range(1,35):
    for k in range(1,n+1):
        head,nodes=linked(RNG.choices(range(3),k=n));original=[x.val for x in nodes]
        expected=[]
        for i in range(0,n,k):expected.extend(nodes[i:i+k][::-1] if i+k<=n else nodes[i:i+k])
        equal(walk(S[25].reverseKGroup(head,k)),expected,(n,k))
        equal([x.val for x in nodes],original)
for _ in range(1500):
    w=RNG.randrange(1,4);words=[''.join(RNG.choices('ab',k=w)) for _ in range(RNG.randrange(1,5))];s=''.join(RNG.choices('abx',k=RNG.randrange(1,22)))
    need=Counter(words);length=w*len(words)
    expected=[i for i in range(len(s)-length+1) if Counter(s[j:j+w] for j in range(i,i+length,w))==need]
    equal(sorted(S[30].findSubstring(s,words)),expected,(s,words))
for n in range(11):
    for chars in itertools.product('()',repeat=n):
        s=''.join(chars);best=0
        for left in range(n):
            balance=0
            for right in range(left,n):
                balance+=1 if s[right]=='(' else -1
                if balance<0:break
                if balance==0:best=max(best,right-left+1)
        equal(S[32].longestValidParentheses(s),best,s)
for n in range(1,7):
    for a in itertools.product([-1,0,1,2,4],repeat=n):
        expected=next(x for x in range(1,n+2) if x not in a)
        equal(S[41].firstMissingPositive(list(a)),expected,a)
for n in range(1,8):
    for a in itertools.product(range(3),repeat=n):
        expected=sum(min(max(a[:i+1]),max(a[i:]))-h for i,h in enumerate(a))
        equal(S[42].trap(list(a)),expected,a)

def validate_sudoku(board,givens):
    digits=set('123456789')
    for r in range(9):
        equal(set(board[r]),digits)
        equal({board[c][r] for c in range(9)},digits)
        for c in range(9):
            if givens[r][c]!='.':equal(board[r][c],givens[r][c])
    for r in [0,3,6]:
        for c in [0,3,6]:equal({board[i][j] for i in range(r,r+3) for j in range(c,c+3)},digits)
fixtures=json.loads((ROOT/'hard-first-ten/fixtures.json').read_text())
for puzzle in fixtures['37']:
    board=[list(r) for r in puzzle];original=id(board);S[37].solveSudoku(board);equal(id(board),original);validate_sudoku(board,puzzle)
solved=['534678912','672195348','198342567','859761423','426853791','713924856','961537284','287419635','345286179']
for _ in range(12):
    puzzle=[[v if RNG.random()>.4 else '.' for v in row] for row in solved]
    board=[r[:] for r in puzzle];S[37].solveSudoku(board);validate_sudoku(board,puzzle)
# Maximum official sizes and closed-form answers.
equal(S[4].findMedianSortedArrays(list(range(1000)),list(range(1000,2000))),999.5)
equal(S[10].isMatch('a'*20,'a*'*10),True)
heads=[]
for i in range(10000):heads.append(ListNode(i))
equal(len(walk(S[23].mergeKLists(heads))),10000)
head,nodes=linked(list(range(5000)));equal(walk(S[25].reverseKGroup(head,5000)),nodes[::-1])
equal(len(S[30].findSubstring('a'*10000,['a']*5000)),5001)
equal(S[30].findSubstring('a'*10000,['a'*30]*5000),[])
equal(S[32].longestValidParentheses('('*15000+')'*15000),30000)
equal(S[41].firstMissingPositive(list(range(100000,0,-1))),100001)
equal(S[42].trap([100000]+[0]*19998+[100000]),1999800000)
equal(S[44].isMatch('a'*2000,'?'*2000),True)
equal(S[44].isMatch('a'*2000,'*'*1999+'b'),False)
print(f'Python: {checks} oracle, identity, invariant, and maximum-size checks passed; 10 source bundles match.')
