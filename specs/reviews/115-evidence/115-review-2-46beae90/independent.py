import sys,pathlib,itertools,functools,json
sys.dont_write_bytecode=True
root=pathlib.Path.cwd();out=root/'specs/reviews/115-evidence/115-review-2-46beae90'
source=(root/'leetcode/115/solution.py').read_text();scope={};exec(compile(source,'solution.py','exec'),scope);solve=scope['Solution']().numDistinct
@functools.lru_cache(None)
def oracle(s,t):
    if not t:return 1
    if not s:return 0
    return oracle(s[1:],t)+(oracle(s[1:],t[1:]) if s[0]==t[0] else 0)
words=[''.join(p) for n in range(5) for p in itertools.product('aAb',repeat=n)]
for s in words:
    for t in words:assert solve(s,t)==oracle(s,t),(s,t)
cases=[('aaba','aba',2),('aa','aa',1),('ba','ab',0),('AaAa','Aa',3),('a'*1000,'a'*499+'b',0),('ab'*500,'ab'*500,1),('b'+'a'*999,'ba',999),('a'*1000,'A',0)]
for s,t,v in cases:
    before=(s,t);assert solve(s,t)==v;assert (s,t)==before
states=[]
def tracer(frame,event,arg):
    if frame.f_code.co_filename=='solution.py' and event=='line' and frame.f_lineno==9:
        states.append({'char':frame.f_locals['char'],'j':frame.f_locals['j'],'before':frame.f_locals['dp'][:]})
    return tracer
sys.settrace(tracer);assert solve('aaa','aa')==3;sys.settrace(None)
assert states[2]=={'char':'a','j':2,'before':[1,1,0]}
(out/'independent-python.json').write_text(json.dumps({'status':'passed','exhaustivePairs':len(words)**2,'freshAndBoundaryCases':cases,'preAdditionStates':states},indent=2))
print('Independent canonical execution passed:',len(words)**2,'pairs,',len(cases),'fresh/boundary cases; actual pre-addition states checked')
