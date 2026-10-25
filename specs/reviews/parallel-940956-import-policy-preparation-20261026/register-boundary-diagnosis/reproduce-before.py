import copy, importlib.util, json, pathlib, sys
from types import SimpleNamespace
from unittest.mock import patch
root=pathlib.Path('/Users/songyy/Documents/knowledge-vis')
sys.path.insert(0,str(root/'scripts'))
import leetcode_campaign as campaign
from test_leetcode_campaign import CampaignTests
spec=importlib.util.spec_from_file_location('op',pathlib.Path(__file__).resolve().parent/'operator-before.py');op=importlib.util.module_from_spec(spec);spec.loader.exec_module(op)
case=CampaignTests('runTest');case.setUp()
try:
 case.state.mkdir();case.write('leetcode/4/lesson-entry.json','{}');case.git('add','.');case.git('commit','-m','Registration boundary fixture')
 adopted=case.git('rev-parse','HEAD')
 prior={str(i):{'status':'accepted_local','phase':'done'} for i in range(1000,1019)}
 state={'status':'running','expected_head':adopted,'queue':list(prior)+['4','10'],'runs':[],
        'problems':{**prior,'4':{'status':'review_passed','phase':'register','candidate':adopted,'prior_report':'specs/reviews/4-review.md'}}}
 args=SimpleNamespace(repo=case.repo,state_dir=case.state,stop_file=case.state/'STOP')
 args.stop_file.write_text('owned fixture STOP')
 with patch.object(campaign,'run_agent',side_effect=AssertionError('No agent should be started')):
  campaign.process_problem(args,case.problems[0],state,case.state/'progress.json','http://fixture.invalid')
  assert state['status']=='stopped' and state['problems']['4']['phase']=='register'
  accepted_before=sum(p['status']=='accepted_local' for p in state['problems'].values())
  expected=next(pid for pid in state['queue'] if state['problems'].get(pid,{}).get('status') not in campaign.TERMINAL)
  args.stop_file.unlink();state['status']='running'
  campaign.process_problem(args,case.problems[0],state,case.state/'progress.json','http://fixture.invalid')
 registered=case.git('rev-parse','HEAD');assert registered!=adopted
 accepted_after=sum(p['status']=='accepted_local' for p in state['problems'].values())
 actual_next=next(pid for pid in state['queue'] if state['problems'].get(pid,{}).get('status') not in campaign.TERMINAL)
 events=case.state/'fresh';events.mkdir();(events/'events.jsonl').write_text('{"type":"thread.started","thread_id":"fresh"}\n{"type":"turn.started"}\n')
 state.update(current={'problem_id':actual_next,'run_id':'10-author-new','stage':'author'})
 state['runs']=[{'id':'10-author-new','status':'running','directory':str(events),'candidate':registered}]
 procs={10:{'ppid':1,'args':['python'],'cwd':str(op.REPO)},12:{'ppid':10,'args':['/vendor/test/codex'],'cwd':str(op.REPO)}}
 assert op.new_run_evidence(state,set(),set(),expected,procs,10) is None
 assert op.new_run_evidence(state,set(),set(),actual_next,procs,10) is not None
 result={'operator_expected_agent_problem':expected,'actual_next_agent_problem':actual_next,
         'registration_changed_head':registered!=adopted,'operator_candidate_check_would_pass':registered==adopted,
         'accepted_unreleased_before':accepted_before,'operator_threshold_guard_allows':accepted_before<20,
         'accepted_unreleased_after_registration':accepted_after,'publication_threshold_reached':accepted_after>=20,
         'real_codex_started':False,'remote_access':False}
 print(json.dumps(result,indent=2))
finally:case.doCleanups()
