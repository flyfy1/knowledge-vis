import itertools,json,pathlib,sys,random
root=pathlib.Path.cwd();out=root/'specs/reviews/4-evidence/4-review-1-8399884b'
# exec actual canonical file without creating __pycache__ in candidate.
ns={};exec(compile((root/'leetcode/4/solution.py').read_text(),'leetcode/4/solution.py','exec'),ns);f=ns['Solution']().findMedianSortedArrays
rng=random.Random(8399884);count=0
fresh=[([1,8],[2,3,4],3.),([1,2],[10,11,12,13],10.5),([10,11],[1,2,3],3.),([],[1000000],1000000.),([-1000000],[], -1000000.),([-1000000],[1000000],0.),([0],[0],0.),(list(range(1000)),list(range(1000,2000)),999.5)]
arr=[list(x) for n in range(5) for x in itertools.combinations_with_replacement([-3,-1,0,2],n)]
def check(a,b,expected=None):
 global count
 aa=a[:];bb=b[:];merged=sorted(a+b);want=(merged[(len(merged)-1)//2]+merged[len(merged)//2])/2
 if expected is not None:assert want==expected
 got=f(a,b);assert got==want and isinstance(got,float),(a,b,got,want)
 assert a==aa and b==bb
 count+=1
for a,b,w in fresh:check(a,b,w)
for a in arr:
 for b in arr:
  if a or b:check(a,b)
for _ in range(600):
 m=rng.randrange(1001);n=rng.randrange(1001)
 if m+n:check(sorted(rng.choices(range(-1000000,1000001),k=m)),sorted(rng.choices(range(-1000000,1000001),k=n)))
result={'actualCanonicalPython':True,'checks':count,'freshResults':[{'input':[a,b],'expected':w,'actual':f(a,b)} for a,b,w in fresh[:7]],'inputMutation':'none in every case','oracle':'independently sorted combined ranks','unsupportedBothEmpty':'excluded as official precondition'}
(out/'code-results.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
