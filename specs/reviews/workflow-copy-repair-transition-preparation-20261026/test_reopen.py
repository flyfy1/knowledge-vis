"""Local state/guard tests only; no Pi, real model, publication or dispatch."""
import copy
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
sys.path.insert(0,str(ROOT/'scripts'))
import leetcode_campaign as campaign
import test_leetcode_campaign as fixtures
spec=importlib.util.spec_from_file_location('reopen_operator',HERE/'reopen.py');op=importlib.util.module_from_spec(spec);spec.loader.exec_module(op)
PINS=json.loads((HERE/'pins.json').read_text())


def fixture():
 return {'status':'stopped','expected_head':'before','updated_at':'old-time','queue':[*op.IDS,'818'],'runs':[{'id':'old','status':'completed'}],'current':{'problem_id':'818','stage':'author','run_id':'old'},'problems':{**{pid:copy.deepcopy(PINS['accepted'][pid]['entry']) for pid in op.IDS},'818':{'status':'review_pending','phase':'review','candidate':'paused','rounds':0,'reviews':[],'author_runs':['author818'],'prior_report':''}},'maintenance':[{'kind':'previous'}],'custom_field':{'keep':True}}


class StateGuards(unittest.TestCase):
 def test_exact_nine_reopening_preserves_history_and_paused_entry(self):
  before=fixture();unchanged=copy.deepcopy(before);record={'prior_acceptance':{pid:{k:before['problems'][pid][k] for k in ['accepted_at','registration_commit','prior_report'] if k in before['problems'][pid]} for pid in op.IDS},'previous_current':copy.deepcopy(before['current'])}
  after=op.transition(before,'requests',PINS,record);op.verify_transition(before,after,'requests',PINS,record)
  self.assertEqual(before,unchanged);self.assertEqual(after['runs'],before['runs']);self.assertEqual(after['queue'],before['queue']);self.assertEqual(after['problems']['818'],before['problems']['818']);self.assertIsNone(after['current'])
  for pid in op.IDS:
   expected=copy.deepcopy(before['problems'][pid]);expected.pop('accepted_at',None);expected.pop('registration_commit',None);expected.update(status='changes_required',phase='fix',prior_report=PINS['requests'][pid]['path']);self.assertEqual(after['problems'][pid],expected)
   self.assertEqual(after['problems'][pid]['rounds'],1)
   self.assertEqual(record['prior_acceptance'][pid]['prior_report'],before['problems'][pid]['prior_report'])

 def test_unrelated_state_mutations_are_rejected(self):
  before=fixture();record={'id':'receipt'};after=op.transition(before,'new',PINS,record)
  for key,value in [('queue',[]),('runs',[]),('current',before['current']),('custom_field',{}),('expected_head','wrong')]:
   bad=copy.deepcopy(after);bad[key]=value
   with self.assertRaises(RuntimeError):op.verify_transition(before,bad,'new',PINS,record)
  bad=copy.deepcopy(after);bad['problems']['818']['candidate']='changed'
  with self.assertRaises(RuntimeError):op.verify_transition(before,bad,'new',PINS,record)
  bad=copy.deepcopy(after);bad['problems']['780']['reviews']=[]
  with self.assertRaises(RuntimeError):op.verify_transition(before,bad,'new',PINS,record)

 def test_no_active_target_or_budget_reset(self):
  before=fixture();before['problems']['815'].update(status='review_passed',phase='register')
  with self.assertRaisesRegex(RuntimeError,'accepted'):op.transition(before,'new',PINS,{})
  before=fixture();before['problems']['780']['rounds']=6
  with self.assertRaisesRegex(RuntimeError,'budget'):op.transition(before,'new',PINS,{})

 def test_document_adoption_cannot_overwrite_or_change_runtime(self):
  before={'leetcode/780/index.html':'100644 blob original','specs/reviews/old.md':'100644 blob old'}
  after={**before,**{p:'100644 blob new' for p in PINS['documents']}}
  op.document_tree_guard(before,after,PINS['documents'])
  bad={**after,'leetcode/780/index.html':'100644 blob bad'}
  with self.assertRaises(RuntimeError):op.document_tree_guard(before,bad,PINS['documents'])
  existing={**before,next(iter(PINS['documents'])):'100644 blob older'}
  with self.assertRaises(RuntimeError):op.document_tree_guard(existing,after,PINS['documents'])

 def test_pins_hash_and_fixed_request_source(self):
  self.assertEqual(op.sha((HERE/'pins.json').read_bytes()),op.PINS_SHA)
  self.assertEqual(PINS['source'],op.SOURCE);self.assertEqual(PINS['ids'],list(op.IDS));self.assertEqual(len(PINS['documents']),10)
  import subprocess
  for path,digest in PINS['documents'].items():
   data=subprocess.check_output(['git','-C',str(ROOT),'show',op.SOURCE+':'+path]);self.assertEqual(op.sha(data),digest)

 def test_bad_dispatch_cannot_read_runtime_or_start_operation(self):
  with patch.object(op,'policy_guard',side_effect=AssertionError('must not run')):
   with self.assertRaisesRegex(RuntimeError,'dispatch'):op.main(['--dispatch','not-approved'])

 def test_fresh_fix_requires_new_run_thread_turn_and_native_child(self):
  with tempfile.TemporaryDirectory() as d:
   events=Path(d)/'events.jsonl';events.write_text('{"type":"thread.started","thread_id":"new-thread"}\n{"type":"turn.started"}\n')
   state={'status':'running','current':{'problem_id':'780','stage':'fix','run_id':'new-run'},'runs':[{'id':'new-run','status':'running','directory':d,'candidate':'requests'}]}
   procs={10:{'ppid':1,'cwd':str(op.REPO),'args':['python','/repo/scripts/leetcode_campaign.py','--publish-every','20','--max-rounds','6','--state-dir',str(op.STATE)]},11:{'ppid':10,'cwd':str(op.REPO),'args':['/vendor/arm/bin/codex']}}
   with patch.object(op,'process_table',return_value=procs):
    self.assertEqual(op.resume_evidence(state,{'old'},{'old-thread'},'780',10)['native_codex_pids'],[11])
    self.assertIsNone(op.resume_evidence(state,{'new-run'},set(),'780',10))
    self.assertIsNone(op.resume_evidence(state,set(),{'new-thread'},'780',10))
    events.write_text('{"type":"thread.started","thread_id":"new-thread"}\n')
    self.assertIsNone(op.resume_evidence(state,set(),set(),'780',10))
   events.write_text('{"type":"thread.started","thread_id":"new-thread"}\n{"type":"turn.started"}\n')
   with patch.object(op,'process_table',return_value={10:procs[10]}):self.assertIsNone(op.resume_evidence(state,set(),set(),'780',10))

 def test_boundary_allows_operator_itself_but_rejects_remaining_native_or_campaign(self):
  procs={op.os.getpid():{'args':['python','reopen.py'],'cwd':str(op.REPO),'ppid':1}}
  op.boundary_guard(procs)
  with self.assertRaises(RuntimeError):op.boundary_guard({**procs,999999:{'args':['/vendor/arm/bin/codex'],'cwd':str(op.REPO),'ppid':1}})
  with self.assertRaises(RuntimeError):op.boundary_guard({999999:{'args':['python','/repo/scripts/leetcode_campaign.py'],'cwd':'/tmp','ppid':1}})

 def test_publication_projection_counts_changed_runtime_not_unique_released_ids(self):
  state={'queue':['780'],'problems':{'780':{'status':'accepted_local','candidate':'new-candidate'}}}
  ledger={'pending':None,'released':{'780':{'candidate':'old-candidate','digest':'old-digest'}}}
  seen=[]
  def reviewed(repo,passed,registry,head,prospective):
   seen.append(prospective);return {'780':{'candidate':'new-candidate','digest':'new-digest'}}
  with patch('leetcode_registry.read_registry',return_value=[]),patch('leetcode_publish._reviewed',side_effect=reviewed):
   self.assertEqual(op.publication_guard(state,ledger,'head'),['780'])
  self.assertEqual(seen,[{'780'}]);self.assertEqual(ledger['released']['780']['candidate'],'old-candidate')
  with patch('leetcode_registry.read_registry',return_value=[]),patch('leetcode_publish._reviewed',return_value={'780':{'candidate':'new-candidate','digest':'old-digest'}}):
   with self.assertRaisesRegex(RuntimeError,'refresh'):op.publication_guard(state,ledger,'head')

 def test_real_runner_dispatches_fix_with_new_request_without_registration(self):
  case=fixtures.CampaignTests('runTest');case.setUp();self.addCleanup(case.doCleanups);case.state.mkdir()
  state=op.transition(fixture(),case.git('rev-parse','HEAD'),PINS,{'kind':'maintenance'})
  args=SimpleNamespace(repo=case.repo,state_dir=case.state,stop_file=case.state/'STOP')
  class Captured(Exception):pass
  def observe(args,role,problem,candidate,report,prior_report,*rest):
   self.assertEqual(role,'fix');self.assertEqual(problem['id'],780);self.assertEqual(prior_report,PINS['requests']['780']['path']);self.assertEqual(candidate,case.git('rev-parse','HEAD'));raise Captured
  with patch.object(campaign,'run_agent',side_effect=observe):
   with self.assertRaises(Captured):campaign.process_problem(args,{'id':780},state,case.state/'progress.json','http://fixture.invalid')
  self.assertEqual(state['problems']['780']['status'],'changes_required');self.assertEqual(state['problems']['818']['candidate'],'paused')


if __name__=='__main__':unittest.main(verbosity=2)
