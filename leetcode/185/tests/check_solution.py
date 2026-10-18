"""Run with Python + pandas; OUTPUT_DIR redirects all emitted evidence."""
import os, sys, json, random, itertools, importlib.util
from pathlib import Path
import pandas as pd
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution', ROOT/'solution.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
count=0

def check(rows,depts):
 global count
 e=pd.DataFrame(rows,columns=['id','name','salary','departmentId']);d=pd.DataFrame(depts,columns=['id','name'])
 before=e.copy(deep=True);db=d.copy(deep=True)
 expected=[]
 for _,x in e.iterrows():
  higher={y.salary for y in e.itertuples() if y.departmentId==x.departmentId and pd.notna(y.salary) and y.salary>x.salary}
  if pd.notna(x.salary) and pd.notna(x.departmentId) and len(higher)<3:
   expected.extend((z.name,x['name'],x.salary) for z in d.itertuples() if z.id==x.departmentId)
 actual=m.top_three_salaries(e,d)
 assert list(actual.columns)==['Department','Employee','Salary']
 assert sorted(actual.itertuples(index=False,name=None))==sorted(expected),(rows,actual,expected)
 pd.testing.assert_frame_equal(e,before);pd.testing.assert_frame_equal(d,db);count+=1

check([[1,'Joe',85000,1],[2,'Henry',80000,2],[3,'Sam',60000,2],[4,'Max',90000,1],[5,'Janet',69000,1],[6,'Randy',85000,1],[7,'Will',70000,1]],[[1,'IT'],[2,'Sales']])
# Exhaust every salary + department assignment up to four employees.
for n in range(5):
 for combo in itertools.product(itertools.product([-1,0,1],[1,2]),repeat=n):
  check([[i,f'E{i}',s,d] for i,(s,d) in enumerate(combo)],[[1,'Same'],[2,'Same'],[3,'Empty']])
rng=random.Random(185)
for _ in range(160):
 n=rng.randrange(0,45)
 check([[i,f'E{i}',rng.randint(-4,8),rng.randint(1,3)] for i in range(n)],[[1,'A'],[2,'A'],[3,'B']])
check([[1,'Same',8,1],[2,'Same',7,1],[3,'Other',None,1],[4,'Lost',9,None]],[[1,'A']])
check([[i,str(i),100 if i%2 else 50,1] for i in range(200)],[[1,'A']])
# Mirror is exactly canonical source.
source=(ROOT/'solution.py').read_text();mirror=(ROOT/'python-code.js').read_text()
assert json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').strip().removesuffix(';'))==source
report={'checks':count,'pandas':pd.__version__,'seed':185,'official_example':'pass','exhaustive':'n=0..4, salaries -1/0/1, department IDs 1/2','random_cases':160,'null_test':'extra robustness, not an official null contract','input_mutation':'none','source_parity':'exact','status':'pass'}
(OUT/'solution-results.json').write_text(json.dumps(report,indent=2));print(report)
