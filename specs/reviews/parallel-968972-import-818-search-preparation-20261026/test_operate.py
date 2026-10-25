"""Focused one-off safety checks. No SSH, agents, publication, or production writes."""
import copy
import importlib.util
import json
from pathlib import Path
import sys
from types import SimpleNamespace
import unittest
from unittest.mock import patch

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
sys.path.insert(0,str(ROOT/'scripts'))
import leetcode_campaign as campaign
import leetcode_publish as publisher
import leetcode_registry as registry
import import_leetcode_lane as importer
import test_leetcode_campaign as fixtures
spec=importlib.util.spec_from_file_location('operator_under_test',HERE/'operate.py')
op=importlib.util.module_from_spec(spec);spec.loader.exec_module(op)
op.pins=json.loads((HERE/'pins.json').read_text())


class PureGuards(unittest.TestCase):
    def state(self):
        accepted=copy.deepcopy(op.pins['accepted818']['entry'])
        return {'status':'stopped','current':{'problem_id':'801','run_id':'old'},'expected_head':'before','queue':['801','818','968','972'],'problems':{'801':{'status':'review_pending','phase':'review'},'818':accepted,'968':copy.deepcopy(op.pins['lanes']['968']['entry']),'972':copy.deepcopy(op.pins['lanes']['972']['entry'])},'runs':[{'id':'historical'}],'maintenance':[{'old':'record'}],'ordinary':{'preserve':True}}

    def test_transition_retains_history_budget_and_unrelated_entries(self):
        before=self.state();frozen=copy.deepcopy(before);record={'prior_acceptance':'archived'}
        after=op.transition(before,'newhead',record)
        self.assertEqual(before,frozen)
        self.assertEqual(after['runs'],before['runs']);self.assertEqual(after['queue'],before['queue'])
        self.assertEqual(after['ordinary'],before['ordinary']);self.assertEqual(after['maintenance'],[{'old':'record'},record])
        targets=getattr(op,'REOPEN_IDS',('818',))
        for pid,e in before['problems'].items():
            if pid not in targets:self.assertEqual(after['problems'][pid],e);continue
            expected=copy.deepcopy(e)
            expected.pop('detail')
            request=op.REQUESTS[pid] if hasattr(op,'REQUESTS') else op.REQUEST
            expected.update(status='changes_required',phase='fix',prior_report=request)
            self.assertEqual(after['problems'][pid],expected)
        self.assertIsNone(after['current']);self.assertEqual(after['expected_head'],'newhead')

    def test_reopen_rejects_exhausted_budget_or_nonaccepted(self):
        for key,value in [('rounds',6),('status','accepted_local')]:
            s=self.state();s['problems']['818'][key]=value
            with self.assertRaises(RuntimeError):op.transition(s,'new',{})

    def test_exact_document_allowlist_and_no_overwrite(self):
        before={'old':'100644 blob 1'};after=dict(before,**{p:'100644 blob 2' for p in op.ALLOWLIST})
        op.document_tree_valid(before,after)
        for invalid in [dict(after,unrelated='100644 blob 3'),dict(after,old='100644 blob changed')]:
            with self.assertRaises(RuntimeError):op.document_tree_valid(before,invalid)
        with self.assertRaises(RuntimeError):op.document_tree_valid(after,after)

    def test_fixed_source_hash_rejects_changed_document(self):
        payload={p:__import__('subprocess').check_output(['git','show',op.pins['document_sources'][p]+':'+p],cwd=ROOT) for p in op.ALLOWLIST}
        op.payload_valid(payload);payload[op.ALLOWLIST[0]]+=b'changed'
        with self.assertRaisesRegex(RuntimeError,'bytes differ'):op.payload_valid(payload)

    def bound(self,state,accepted,ledger=None,incoming=()):
        if ledger is None:ledger={'pending':None,'released':{}}
        with patch.object(registry,'read_registry',return_value=[]),patch.object(publisher,'_reviewed',return_value=accepted),patch.object(op,'imp',SimpleNamespace(head=lambda repo:'HEAD')):
            return op.publication_bound(state,ledger,incoming)

    def test_digest_eligibility_includes_revised_released_ids(self):
        s={'queue':['780'],'problems':{'780':{'status':'accepted_local','candidate':'new'}}}
        ledger={'pending':None,'released':{'780':{'candidate':'old','digest':'old'}}}
        result=self.bound(s,{'780':{'digest':'new'}},ledger)
        self.assertIn('780',result['eligible']);self.assertIn('780',result['upper_bound_ids'])
        self.assertEqual(ledger['released']['780']['candidate'],'old')

    def test_same_digest_pointer_refresh_and_pending_release_refuse(self):
        s={'queue':['780'],'problems':{'780':{'status':'accepted_local','candidate':'new'}}}
        with self.assertRaisesRegex(RuntimeError,'same-digest'):
            self.bound(s,{'780':{'digest':'same'}},{'pending':None,'released':{'780':{'candidate':'old','digest':'same'}}})
        with self.assertRaisesRegex(RuntimeError,'Pending release'):
            self.bound(s,{}, {'pending':{'release':'pending'},'released':{}})

    def test_incoming_and_register_are_deduplicated_threshold_guard(self):
        ids=[str(i) for i in range(1000,1018)]
        s={'queue':ids+['4','10'],'problems':{pid:{'status':'accepted_local','candidate':'c'} for pid in ids}}
        accepted={pid:{'digest':'d'} for pid in ids}
        with self.assertRaisesRegex(RuntimeError,'reaches 20'):self.bound(s,accepted,incoming=('960','964'))
        s['problems']['4']={'status':'review_passed','phase':'register'}
        with self.assertRaisesRegex(RuntimeError,'reaches 20'):self.bound(s,accepted,incoming=('960',))
        small={'queue':['960','10'],'problems':{'960':{'status':'review_passed','phase':'register'}}}
        result=self.bound(small,{},incoming=('960','960'))
        self.assertEqual(result['upper_bound_ids'].count('960'),1)

    def test_pending_released_registration_same_digest_refuses_without_mutation(self):
        state={'queue':['780','10'],'problems':{'780':{'status':'review_passed','phase':'register','candidate':'new'}}}
        ledger={'pending':None,'released':{'780':{'candidate':'old','digest':'same'}}}
        before,oldledger=copy.deepcopy(state),copy.deepcopy(ledger)
        def reviewed(repo,projected,rows,head,selected):
            if selected:
                self.assertEqual(projected['problems']['780']['status'],'accepted_local')
                return {'780':{'digest':'same'}}
            return {}
        with patch.object(registry,'read_registry',return_value=[]),patch.object(publisher,'_reviewed',side_effect=reviewed),patch.object(op,'imp',SimpleNamespace(head=lambda repo:'HEAD')):
            with self.assertRaisesRegex(RuntimeError,'Pending registration would refresh'):op.publication_bound(state,ledger)
        self.assertEqual(state,before);self.assertEqual(ledger,oldledger)

    def test_pending_registration_incompatible_existing_registry_refuses(self):
        state={'queue':['780','10'],'problems':{'780':{'status':'review_passed','phase':'register','candidate':'new'}}}
        ledger={'pending':None,'released':{'780':{'candidate':'old','digest':'old'}}}
        before=copy.deepcopy(state)
        def reviewed(repo,projected,rows,head,selected):
            if selected:raise publisher.PublicationError('Existing registry differs from candidate')
            return {}
        with patch.object(registry,'read_registry',return_value=[]),patch.object(publisher,'_reviewed',side_effect=reviewed),patch.object(op,'imp',SimpleNamespace(head=lambda repo:'HEAD')):
            with self.assertRaisesRegex(publisher.PublicationError,'registry differs'):op.publication_bound(state,ledger)
        self.assertEqual(state,before)

    def test_stale_run_or_session_without_native_is_not_resume(self):
        state={'status':'running','current':{'problem_id':'818','stage':'fix','run_id':'r'},'runs':[{'id':'r','status':'running'}]}
        self.assertIsNone(op.new_run_evidence(state,{'r'},set(),'818',{},999))
        with patch.object(op,'fresh_events',return_value=[{'type':'thread.started','thread_id':'old'},{'type':'turn.started'}]),patch.object(op,'native_children',return_value=[123]):
            self.assertIsNone(op.new_run_evidence(state,set(),{'old'},'818',{},999))
        with patch.object(op,'fresh_events',return_value=[{'type':'thread.started','thread_id':'fresh'},{'type':'turn.started'}]),patch.object(op,'native_children',return_value=[]):
            self.assertIsNone(op.new_run_evidence(state,set(),set(),'818',{},999))


class RealRegistration(unittest.TestCase):
    def setUp(self):
        self.case=fixtures.CampaignTests('runTest');self.case.setUp();self.addCleanup(self.case.doCleanups)
        c=self.case;c.state.mkdir();c.write('leetcode/4/lesson-entry.json','{}');c.git('add','.');c.git('commit','-m','Register boundary fixture')
        self.head=c.git('rev-parse','HEAD')
        self.state={'status':'running','expected_head':self.head,'queue':['4','10'],'runs':[],'problems':{'4':{'status':'review_passed','phase':'register','candidate':self.head,'prior_report':'specs/reviews/4-review.md','reviews':[{'original':'independent'}]}}}
        self.args=SimpleNamespace(repo=c.repo,state_dir=c.state,stop_file=c.state/'STOP');self.args.stop_file.write_text('fixture STOP')
        with patch.object(campaign,'run_agent',side_effect=AssertionError('No real agents')):
            campaign.process_problem(self.args,c.problems[0],self.state,c.state/'progress.json','http://fixture.invalid')
        self.before=copy.deepcopy(self.state)

    def plan(self):
        with patch.object(op,'publication_bound',return_value={'upper_bound':1}):
            return op.resume_plan(self.before,{'pending':None,'released':{}})

    def resume(self):
        self.args.stop_file.unlink();self.state['status']='running'
        with patch.object(campaign,'run_agent',side_effect=AssertionError('No real agents')):
            campaign.process_problem(self.args,self.case.problems[0],self.state,self.case.state/'progress.json','http://fixture.invalid')
        head=self.case.git('rev-parse','HEAD')
        self.state['current']={'problem_id':'10','stage':'author','run_id':'10-new'}
        self.state['problems']['10']={'status':'pending','rounds':0,'new':True,'phase':'author','reviews':[],'author_runs':[],'prior_report':''}
        run={'id':'10-new','problem_id':'10','role':'author','status':'running','candidate':head};self.state['runs'].append(run)
        return run

    def prove(self,plan,run):
        with patch.object(op,'REPO',self.case.repo),patch.object(op,'STATE',self.case.state),patch.object(op,'imp',importer):
            return op.verify_registered_resume(self.before,self.state,self.head,plan,run)

    def test_actual_registration_advances_head_and_predicts_next_agent(self):
        plan=self.plan();self.assertEqual(plan['registration_ids'],['4']);self.assertEqual(plan['next_problem_id'],'10')
        run=self.resume();proof=self.prove(plan,run)
        self.assertNotEqual(proof['agent_candidate'],self.head)
        self.state['problems']['4']['reviews']=[]
        with self.assertRaisesRegex(RuntimeError,'metadata'):self.prove(plan,run)

    def test_unrelated_post_registration_commit_rejected(self):
        plan=self.plan();run=self.resume();self.case.write('unrelated.txt','bad');self.case.git('add','.');self.case.git('commit','-m','Unexpected')
        with self.assertRaisesRegex(RuntimeError,'proven policy/registration head'):self.prove(plan,run)

class RealAuthorStop(unittest.TestCase):
    def test_armed_stop_keeps_real_runner_after_author_before_review(self):
        case=fixtures.CampaignTests('runTest');case.setUp();self.addCleanup(case.doCleanups)
        original=fixtures.campaign.run_agent
        def arm_during_selected_author(*args,**kwargs):
            self.assertEqual(args[1],'author')
            (case.state/'STOP').write_text('owned author-to-Mac fixture')
            return original(*args,**kwargs)
        # Existing fixture executable is a deterministic fake CLI, never a real agent.
        with patch.object(fixtures.campaign,'run_agent',side_effect=arm_during_selected_author) as calls:
            self.assertEqual(case.invoke('', '--ids','4'),0)
        state=case.progress()
        self.assertEqual(calls.call_count,1)
        self.assertEqual(state['status'],'stopped')
        self.assertEqual(state['problems']['4']['status'],'review_pending')
        self.assertEqual(state['problems']['4']['phase'],'review')
        self.assertEqual([r['role'] for r in state['runs']],['author'])
        self.assertEqual(state['runs'][0]['result']['outcome'],'ready')
        self.assertEqual(state['expected_head'],case.git('rev-parse','HEAD'))
        self.assertEqual(case.git('status','--porcelain'),'')



class AuthorHandoff(unittest.TestCase):
    def fixture(self):
        entry=copy.deepcopy(op.pins['accepted818']['entry'])
        entry.pop('detail');entry.update(status='changes_required',phase='fix',prior_report=op.REQUESTS['818'])
        run={'id':'818-fix-new','problem_id':'818','role':'fix','status':'running','candidate':'start','directory':'/external/runs/818-fix-new','started_at':'time','session_ids':[]}
        before={'status':'running','current':{'problem_id':'818','stage':'fix','run_id':run['id'],'started_at':'time'},'expected_head':'start','updated_at':'before','runs':[{'id':'old-review','role':'review'},run],'problems':{'818':entry,'968':{'status':'accepted_local'}},'queue':['818','968'],'maintenance':[{'historical':'preserved'}]}
        after=copy.deepcopy(before);after.update(status='stopped',expected_head='candidate',updated_at='after')
        after['runs'][-1].update(status='completed',finished_at='done',session_ids=['fresh-session'],result={'outcome':'ready','detail':'author checks complete; Mac pending'})
        after['problems']['818']['author_runs'].append(run['id'])
        after['problems']['818'].update(status='review_pending',phase='review',candidate='candidate')
        return before,after

    def test_author_ready_boundary_preserves_full_history_and_no_review(self):
        before,after=self.fixture()
        result=op.author_boundary_state(before,after,'818-fix-new','candidate')
        self.assertEqual(result['result']['outcome'],'ready')
        self.assertEqual(after['problems']['818']['rounds'],1)
        self.assertEqual(after['problems']['818']['reviews'],before['problems']['818']['reviews'])

    def test_missed_author_boundary_or_extra_review_is_rejected(self):
        before,after=self.fixture()
        after['runs'].append({'id':'818-review-premature','role':'review'})
        with self.assertRaisesRegex(RuntimeError,'New review'):op.author_boundary_state(before,after,'818-fix-new','candidate')
        before,after=self.fixture();after['current']['stage']='review'
        with self.assertRaisesRegex(RuntimeError,'stage changed'):op.author_boundary_state(before,after,'818-fix-new','candidate')

    def test_blocked_author_and_rewritten_history_are_not_handoffs(self):
        before,after=self.fixture();after['runs'][-1]['result']['outcome']='blocked'
        with self.assertRaisesRegex(RuntimeError,'blocked/failed'):op.author_boundary_state(before,after,'818-fix-new','candidate')
        before,after=self.fixture();after['problems']['818']['reviews']=[]
        with self.assertRaisesRegex(RuntimeError,'metadata/history'):op.author_boundary_state(before,after,'818-fix-new','candidate')

    def test_arm_only_new_recorded_running_818_fix(self):
        before,after=self.fixture()
        self.assertEqual(op.fresh_fix_record(before,{'old-review'})['id'],'818-fix-new')
        self.assertIsNone(op.fresh_fix_record(before,{'old-review','818-fix-new'}))
        before['current']['stage']='review'
        with self.assertRaisesRegex(RuntimeError,'Missed'):op.fresh_fix_record(before,{'old-review'})
        before,after=self.fixture();before['runs'][-1]['status']='completed'
        with self.assertRaisesRegex(RuntimeError,'already finished'):op.fresh_fix_record(before,{'old-review'})

    def test_owned_handoff_stop_is_distinct_and_cannot_replace_foreign(self):
        import tempfile
        with tempfile.TemporaryDirectory() as temporary,patch.object(op,'STATE',Path(temporary)):
            raw=json.dumps({'owner':op.HANDOFF_OWNER,'run_id':'818-fix-new'}).encode()
            op.save(op.STATE/'STOP',json.loads(raw),exclusive=True)
            stored=(op.STATE/'STOP').read_bytes();op.owned_stop(stored)
            with self.assertRaises(FileExistsError):op.save(op.STATE/'STOP',{'owner':'foreign'},exclusive=True)
            (op.STATE/'STOP').write_text(json.dumps({'owner':'foreign'}))
            with self.assertRaisesRegex(RuntimeError,'ownership'):op.owned_stop(stored)



if __name__=='__main__':unittest.main(verbosity=2)
