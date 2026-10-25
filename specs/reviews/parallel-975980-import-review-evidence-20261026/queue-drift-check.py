"""Read guard behavior in disposable fixture; never call operator execute/main."""
from pathlib import Path
import copy,hashlib,importlib.util,json,sys
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(ROOT/'scripts'))
import import_leetcode_lane as imp
import test_leetcode_campaign as fixtures
import leetcode_publish,leetcode_registry
p=ROOT/'specs/reviews/parallel-968972-import-818-search-preparation-20261026/operate.py'
spec=importlib.util.spec_from_file_location('review_helpers',p);h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
case=fixtures.CampaignTests('runTest');case.setUp();case.repo=case.repo.resolve();case.state=case.state.resolve()
try:
 case.state.mkdir();queue=[str(i) for i in range(1,985)]
 before={'version':1,'repo':str(case.repo),'expected_head':imp.head(case.repo),'status':'stopped','current':None,'queue':queue,'problems':{},'runs':[]}
 drift=copy.deepcopy(before);drift['queue'][0],drift['queue'][1]=drift['queue'][1],drift['queue'][0]
 (case.state/'progress.json').write_text(json.dumps(drift))
 validated=imp.validate_checkout(case.repo,case.state)
 assert validated['queue']!=before['queue'] and len(validated['queue'])==984
 h.REPO=case.repo;h.STATE=case.state;h.IDS=('975','980');h.REOPEN_IDS=();h.imp=imp
 with patch.object(leetcode_publish,'_reviewed',return_value={}),patch.object(leetcode_registry,'read_registry',return_value=[]):
  plan=h.resume_plan(validated,{'pending':None,'released':{}},incoming=h.IDS)
 assert plan['next_problem_id']=='2'
 after=copy.deepcopy(validated)
 for pid in h.IDS:after['problems'][pid]={'status':'accepted_local'}
 h.import_metadata_preserved(validated,after)
 print(json.dumps({'fixture':'984 unique IDs with first two reordered after initial pin check','pinned_queue_sha256':h.canonical(queue),'boundary_queue_sha256':h.canonical(validated['queue']),'validate_checkout_accepts_drift':True,'resume_plan_accepts_drift':True,'next_id_after_drift':plan['next_problem_id'],'preservation_against_new_boundary_accepts':True,'operator_executed':False,'Pi_access':False},indent=2))
finally:case.doCleanups()
