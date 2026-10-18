import pathlib, itertools, json, sys, hashlib
sys.dont_write_bytecode = True
root=pathlib.Path('leetcode/115')
source=(root/'solution.py').read_text()
ns={};exec(compile(source,str(root/'solution.py'),'exec'),ns)
solve=ns['Solution']().numDistinct

def count(s,t):
    return sum(''.join(s[i] for i in ix)==t for ix in itertools.combinations(range(len(s)),len(t)))

words=[''.join(p) for n in range(5) for p in itertools.product('aAb',repeat=n)]
for s in words:
    for t in words:
        before=(s,t); assert solve(s,t)==count(s,t),(s,t); assert (s,t)==before
fresh=[('aaba','aa',3),('ba','ab',0),('AaAa','Aa',3),('abc','abcd',0),('abc','abc',1),('abc','x',0),('','',1)]
for s,t,v in fresh: assert solve(s,t)==v
calls=[]
def trace(frame,event,arg):
    if frame.f_code.co_filename==str(root/'solution.py') and event=='line' and frame.f_lineno==9:
        calls.append({'j':frame.f_locals['j'],'before':frame.f_locals['dp'][:]})
    return trace
sys.settrace(trace);assert solve('aaa','aa')==3;sys.settrace(None)
assert calls==[{'j':j,'before':d} for j,d in [(2,[1,0,0]),(1,[1,0,0]),(2,[1,1,0]),(1,[1,1,1]),(2,[1,2,1]),(1,[1,2,3])]]
# Independent maximum-domain cases with analytically known answers.
for s,t,v in [('ab'*500,'ab'*500,1),('a'*1000,'A',0),('b'+'a'*999,'b',1),('a'*1000,'a'*499+'b',0)]:assert solve(s,t)==v
out={'status':'passed','independentTernaryPairs':len(words)**2,'fresh':fresh,'canonicalBeforeAddition':calls,'maximumDomainCases':4,'inputMutation':'none','sha256':hashlib.sha256(source.encode()).hexdigest()}
pathlib.Path('specs/reviews/115-evidence/115-review-1-c954c506/independent-results.json').write_text(json.dumps(out,indent=2))
print(json.dumps(out))
