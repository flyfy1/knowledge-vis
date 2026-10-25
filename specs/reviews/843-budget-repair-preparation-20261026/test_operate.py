"""Disposable handoff checks; no Pi calls, real agents or runtime mutation."""
import copy
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[2]
sys.path.insert(0,str(ROOT/'scripts'))
import import_leetcode_lane as imp
import test_leetcode_campaign as fixtures

def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);return module
op=load('repair843',HERE/'operate.py')
CAMPAIGN=ROOT/'specs/reviews/parallel-968972-import-818-search-preparation-20261026/operate.py'
REOPEN=ROOT/'specs/reviews/workflow-copy-repair-transition-preparation-20261026/reopen.py'


def state_fixture():
    entry={'status':'accepted_local','phase':'done','rounds':1,'reviews':[{'candidate':'old','report_path':'old-review.md'}],
           'candidate':'old','author_runs':['old-author'],'prior_report':'old-review.md','accepted_at':'old-time','registration_commit':'old-reg'}
    return {'status':'stopped','current':{'run_id':'847-old'},'expected_head':'before','queue':['843','847'],
            'runs':[{'id':'old-author'},{'id':'old-review'}],'problems':{'843':entry,'847':{'status':'review_pending'}},'maintenance':[{'old':'keep'}]}

class Guards(unittest.TestCase):
    def setUp(self):self.reopen=load('narrow_reopen',REOPEN);self.reopen.IDS=('843',)
    def test_disabled_before_input_or_runtime_access(self):
        with patch.object(op,'PINS_SHA',None),self.assertRaisesRegex(RuntimeError,'Preparation only'):
            op.main(['--dispatch',op.DISPATCH,'--pins','/absent','--campaign-helper','/absent','--reopen-helper','/absent'])
    def test_only843_reopens_and_all_prior_history_and_budget_remain(self):
        before=state_fixture();original=copy.deepcopy(before);record={'prior_accepted_entry':copy.deepcopy(before['problems']['843'])}
        after=self.reopen.transition(before,'adoption',{'requests':{'843':{'path':op.REQUEST}}},record)
        self.assertEqual(before,original);self.assertEqual(after['runs'],before['runs']);self.assertEqual(after['queue'],before['queue'])
        self.assertEqual(after['problems']['847'],before['problems']['847'])
        entry=after['problems']['843'];self.assertEqual((entry['status'],entry['phase']),('changes_required','fix'))
        for key in ('reviews','rounds','candidate','author_runs'):self.assertEqual(entry[key],before['problems']['843'][key])
        self.assertEqual(after['maintenance'],before['maintenance']+[record]);self.assertEqual(after['maintenance'][-1]['prior_accepted_entry'],before['problems']['843'])
        helper=load('plan_helper',CAMPAIGN)
        with patch.object(helper,'publication_bound',return_value={}):
            plan=helper.resume_plan(after,{'pending':None,'released':{}})
        self.assertEqual(plan['next_problem_id'],'843');self.assertEqual(plan['registration_ids'],[])
    def test_not_accepted_or_exhausted_budget_cannot_reopen(self):
        for key,value in [('status','review_pending'),('rounds',6)]:
            state=state_fixture();state['problems']['843'][key]=value
            with self.assertRaises(RuntimeError):self.reopen.transition(state,'new',{'requests':{'843':{'path':op.REQUEST}}},{})
    def test_wrong_previous_operation_or_policy_refuses(self):
        previous={'owner':op.PREVIOUS_OWNER,'status':'completed-resumed','policy_after':op.NEW_POLICY,'ledger_preserved':True}
        raw=json.dumps(previous).encode();pins={'previous_receipt_sha256':op.sha(raw)}
        self.assertEqual(op.previous_guard(raw,pins),previous)
        for key,value in [('status','pushed-still-stopped'),('policy_after','old'),('ledger_preserved',False)]:
            wrong={**previous,key:value};data=json.dumps(wrong).encode()
            with self.assertRaises(RuntimeError):op.previous_guard(data,{'previous_receipt_sha256':op.sha(data)})
    def test_narrow_payload_rejects_escape_wrong_hash_and_unrelated_policy(self):
        payload={op.REQUEST:b'request',op.EVIDENCE+'evidence.json':b'{}'};pins={'documents':{p:op.sha(b) for p,b in payload.items()}}
        op.payload_guard(payload,pins)
        for bad in ('specs/leetcode-rendered-state-contract.md',op.EVIDENCE+'../outside.md'):
            changed={op.REQUEST:b'request',bad:b'bad'}
            with self.assertRaises(RuntimeError):op.payload_guard(changed,{'documents':{p:op.sha(b) for p,b in changed.items()}})
        payload[op.REQUEST]=b'changed'
        with self.assertRaises(RuntimeError):op.payload_guard(payload,pins)
    def test_startup_waits_only_live_exact_snapshot_then843fix(self):
        before=state_fixture();self.assertIsNone(op.startup(before,before,{'old'},True))
        for state,alive in [({**before,'expected_head':'drift'},True),(before,False),({**before,'status':'failed'},True)]:
            with self.assertRaises(RuntimeError):op.startup(state,before,{'old'},alive)
        live={'status':'running','current':{'problem_id':'843','stage':'fix','run_id':'fresh'},'runs':[{'id':'fresh','status':'running','role':'fix'}]}
        self.assertEqual(op.startup(live,before,{'old'},True)['id'],'fresh')
        live['current']['stage']='review'
        with self.assertRaises(RuntimeError):op.startup(live,before,{'old'},True)
    def test_pending_release_or20_rejects_even_before_reopen(self):
        import leetcode_publish as publisher
        import leetcode_registry as registry
        helper=load('bound_helper',CAMPAIGN);helper.REOPEN_IDS=('843',);helper.imp=SimpleNamespace(head=lambda repo:'head')
        state={'queue':[str(i) for i in range(1,20)]+['843'],'problems':{str(i):{'status':'accepted_local','candidate':'c'} for i in range(1,20)}}
        with patch.object(registry,'read_registry',return_value=[]),patch.object(publisher,'_reviewed',return_value={str(i):{'digest':str(i)} for i in range(1,20)}):
            with self.assertRaisesRegex(RuntimeError,'reaches 20'):helper.publication_bound(state,{'pending':None,'released':{}})
            with self.assertRaisesRegex(RuntimeError,'Pending release'):helper.publication_bound(state,{'pending':{'exists':True},'released':{}})

class Adoption(unittest.TestCase):
    def setUp(self):
        self.case=fixtures.CampaignTests('runTest');self.case.setUp();self.addCleanup(self.case.doCleanups)
        self.case.write('leetcode/843/solution.py','original canonical');self.case.git('add','.');self.case.git('commit','-m','Accepted843 fixture')
        self.case.state.mkdir();self.helper=load('campaign_adopt',CAMPAIGN);self.helper.imp=imp;self.helper.REPO=self.case.repo;self.helper.STATE=self.case.state
        self.reopen=load('accepted_reopen',REOPEN);self.reopen.imp=imp;self.reopen.IDS=('843',);self.reopen.REPO=self.case.repo
        self.before=state_fixture();self.before['expected_head']=self.case.git('rev-parse','HEAD')
        self.helper.save(self.case.state/'progress.json',self.before);self.ledger=b'{"pending":null,"released":{}}';(self.case.state/'releases.json').write_bytes(self.ledger)
        self.stop=json.dumps({'owner':self.helper.OWNER}).encode();(self.case.state/'STOP').write_bytes(self.stop)
        self.payload={op.REQUEST:b'843-BUDGET-R1 fixture',op.EVIDENCE+'reproduction.json':b'{"diagnostic":true}'}
        self.pins={'documents':{p:op.sha(b) for p,b in self.payload.items()},'source_revision':'a'*40,'requests':{'843':{'path':op.REQUEST}}}
    def adopt(self):
        with patch.object(op,'REPO',self.case.repo),patch.object(op,'STATE',self.case.state),patch.object(self.reopen,'accepted_guard'),patch.object(self.helper,'hashes_unchanged'):
            return op.adopt_reopen(self.helper,self.reopen,self.payload,self.pins,self.before,self.ledger,self.stop)
    def test_actual_git_adoption_preserves_lesson_tree_and_reopens_only843(self):
        tree=self.case.git('rev-parse','HEAD:leetcode/843');after,record=self.adopt()
        self.assertEqual(self.case.git('rev-parse','HEAD:leetcode/843'),tree)
        self.assertEqual(after,self.reopen.transition(self.before,self.case.git('rev-parse','HEAD'),self.pins,record))
        self.assertEqual((self.case.state/'releases.json').read_bytes(),self.ledger)
        self.assertEqual(set(self.case.git('diff','--name-only',self.before['expected_head'],'HEAD').splitlines()),set(self.payload))
    def test_hook_runtime_mutation_does_not_checkpoint_or_reopen(self):
        hook=self.case.repo/'.git/hooks/pre-commit';hook.write_text('#!/bin/sh\nprintf changed > leetcode/843/solution.py\ngit add leetcode/843/solution.py\n');hook.chmod(0o755)
        with self.assertRaisesRegex(RuntimeError,'unexpected paths'):self.adopt()
        self.assertEqual(self.helper.read(self.case.state/'progress.json'),self.before)
        self.assertEqual((self.case.state/'STOP').read_bytes(),self.stop)
        self.assertEqual((self.case.state/'releases.json').read_bytes(),self.ledger)

if __name__=='__main__':unittest.main(verbosity=2)
