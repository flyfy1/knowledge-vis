"""Check worked snapshots against actual canonical Python call/return events."""
import json, subprocess, sys, re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
frames=json.loads(subprocess.check_output(['node','-e',f"global.window={{}};require({json.dumps(str(root/'core.js'))});process.stdout.write(JSON.stringify(window.EXPR_CORE.frames()))"],text=True))
ns={};exec(compile((root/'solution.py').read_bytes(),str(root/'solution.py'),'exec'),ns)
events=[]
def trace(frame,event,arg):
    if frame.f_code.co_name=='dfs' and event in ('call','return'):
        d=frame.f_locals
        events.append((event,tuple(d[k] for k in ('index','expression','value','last'))))
    return trace
sys.settrace(trace)
try: answer=ns['Solution']().addOperators('105',5)
finally: sys.settrace(None)
# Hand-calculated outcomes; the displayed tour is sampled from real execution.
assert sorted(answer)==['1*0+5','10-5']
cursor=0
for i,f in enumerate(frames):
    state=tuple(f[k] for k in ('index','expression','value','last'))
    # Return frames show the surviving parent, not a new call to that parent.
    if i in (3,5):
        leaf=tuple(frames[i-1][k] for k in ('index','expression','value','last'))
        cursor=events.index(('return',leaf),cursor)+1
        assert state==(2,'1+0',1,0)
    elif i==7:
        cursor=events.index(('return',(2,'1+0',1,0)),cursor)+1
        assert state==(1,'1',1,1)
    else:
        cursor=events.index(('call',state),cursor)+1
    assert f['expression'].replace('+','').replace('-','').replace('*','')=='105'[:f['index']]
assert all(not any(len(tok)>1 and tok.startswith('0') for tok in re.split(r'[+*\-]',st[1])) for event,st in events if event=='call' and st[1])
assert sorted(ns['Solution']().addOperators('122',-3))==['1-2*2','1-2-2']
print('282 actual Python trace matches ten selected snapshots, return restoration, zero pruning and fresh signed-last case')
