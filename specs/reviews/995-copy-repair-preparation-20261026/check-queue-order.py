"""Read-only local reuse check; no SSH, state writes, agent or operator execution."""
from pathlib import Path
import gzip
import importlib.util
import json
import sys
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(ROOT/'scripts'))
def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);return module
reopen=load('reopen_guard',ROOT/'specs/reviews/workflow-copy-repair-transition-preparation-20261026/reopen.py')
helper=load('campaign_guard',ROOT/'specs/reviews/parallel-968972-import-818-search-preparation-20261026/operate.py')
state=json.loads(gzip.decompress((ROOT/'specs/reviews/parallel-982987-import-execution-20261026/progress.json.gz').read_bytes()))
lane=json.loads((ROOT/'specs/reviews/995-acceptance-20261026/progress.json').read_bytes())
# Simulate only the future imported entry. No runtime file is changed.
state['problems']['995']=lane['problems']['995'];reopen.IDS=('995',)
after=reopen.transition(state,'future-request-head',{'requests':{'995':{'path':'specs/reviews/995-teaching-copy-repair-request-20261026.md'}}},{'kind':'fixture'})
with patch.object(helper,'publication_bound',return_value={'scope':'not evaluated in this ordering fixture'}):
    plan=helper.resume_plan(after,{'pending':None,'released':{}})
assert after['queue']==state['queue'] and after['problems']['995']['phase']=='fix'
assert plan['next_problem_id']=='854' and plan['next_problem_id']!='995'
try:
    helper.require(plan['next_problem_id']=='995' and not plan['registration_ids'],'Next ordinary agent is not995 fix')
except RuntimeError as error:
    refusal=str(error)
else:
    raise AssertionError('Old immediate-fix assumption unexpectedly passed')
print(json.dumps({'baseline':'archived central after982987 import; historical active854, not current live state','queue_length':len(state['queue']),'index854':state['queue'].index('854'),'index862':state['queue'].index('862'),'index995':state['queue'].index('995'),'queue_preserved':True,'reopened995_phase':'fix','next_agent':plan['next_problem_id'],'old_wrapper_gate_would_refuse_after_adoption':refusal,'publication_eligibility_not_evaluated':True,'remote_mutation':False},indent=2))
