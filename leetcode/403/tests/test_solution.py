"""Author checks. OUTPUT_DIR redirects all generated evidence."""
import importlib.util,itertools,json,os,random,subprocess
from pathlib import Path
P=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',str(P/'tests/evidence')));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('frog_solution',P/'solution.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
solve=m.Solution().canCross

def oracle(a):
    # Enumerate next STONE indices, rather than generating candidate lengths.
    def visit(i,last):
        if i==len(a)-1:return True
        for j in range(i+1,len(a)):
            d=a[j]-a[i]
            if (i==0 and d==1) or (i>0 and abs(d-last)<=1):
                if visit(j,d):return True
        return False
    return visit(0,0)

cases=[]
for mask in range(1,1<<11):cases.append([0]+[j+1 for j in range(11) if mask>>j&1])
rng=random.Random(403)
for _ in range(700): cases.append([0] + sorted(rng.sample(range(1,55), rng.randint(1,11))))
cases += [[0,1,3,5,6,8,12,17],[0,1,2,3,4,8,9,11],[0,1,2,3,6],[0,1,2,4,7,11],[0,2],[0,1],[0,1,2**31-1]]
for a in cases:
    before=a[:];assert solve(a)==oracle(a),(a,solve(a),oracle(a));assert a==before
large=[list(range(2000)),[i*(i+1)//2 for i in range(2000)],[0]+list(range(2,2001)),[0,2**31-1]]
for a,want in zip(large,[True,True,False,False]):assert solve(a)==want
source=P.joinpath('solution.py').read_text();mirror=P.joinpath('python-code.js').read_text();assert json.loads(mirror.split('=',1)[1].strip().removesuffix(';'))==source
# Verify the displayed unoptimized baseline really executes.
import re,html
block=html.unescape(re.search(r'<code>(def baseline.*?)</code>',P.joinpath('index.html').read_text(),re.S)[1]);namespace={};exec(block,namespace)
for a in cases:assert namespace['baseline'](a)==oracle(a)
report={'kind':'author self-check','oracle':'independent un-memoized enumeration of next stone indices','exhaustive':2047,'seeded':700,'explicit':7,'max_n':2000,'large_cases':4,'mutation':'unchanged','mirror':'exact','visible_baseline':'executed against all small cases'}
OUT.joinpath('solution-results.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
