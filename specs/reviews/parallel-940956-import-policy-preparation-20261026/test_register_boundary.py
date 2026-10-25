"""Real runner registration + operator continuation guards, no agents/network."""
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
import test_leetcode_campaign as fixtures
import import_leetcode_lane as importer
spec=importlib.util.spec_from_file_location('op_register',HERE/'operate.py');op=importlib.util.module_from_spec(spec);spec.loader.exec_module(op)


class RegisterBoundary(unittest.TestCase):
    def setUp(self):
        self.case=fixtures.CampaignTests('runTest');self.case.setUp();self.addCleanup(self.case.doCleanups)
        c=self.case;c.state.mkdir();c.write('leetcode/4/lesson-entry.json','{}');c.git('add','.');c.git('commit','-m','Register boundary fixture')
        self.policy_head=c.git('rev-parse','HEAD')
        self.state={'status':'running','expected_head':self.policy_head,'queue':['4','10'],'runs':[],
                    'problems':{'4':{'status':'review_passed','phase':'register','candidate':self.policy_head,'prior_report':'specs/reviews/4-review.md','reviews':[{'unchanged':'independent evidence'}]}}}
        self.args=SimpleNamespace(repo=c.repo,state_dir=c.state,stop_file=c.state/'STOP')
        self.args.stop_file.write_text('owned fixture STOP')
        with patch.object(campaign,'run_agent',side_effect=AssertionError('No agent may run')):
            campaign.process_problem(self.args,c.problems[0],self.state,c.state/'progress.json','http://fixture.invalid')
        self.assertEqual(self.state['status'],'stopped')
        self.before=copy.deepcopy(self.state)

    def register_normally(self):
        self.args.stop_file.unlink();self.state['status']='running'
        with patch.object(campaign,'run_agent',side_effect=AssertionError('No agent may run')):
            campaign.process_problem(self.args,self.case.problems[0],self.state,self.case.state/'progress.json','http://fixture.invalid')
        self.assertEqual(self.state['problems']['4']['status'],'accepted_local')
        return self.case.git('rev-parse','HEAD')

    def begin_next_agent(self, pid='10', role='author'):
        candidate=self.case.git('rev-parse','HEAD')
        self.state['current']={'problem_id':pid,'stage':role,'run_id':pid+'-new'}
        if pid not in self.state['problems']:
            self.state['problems'][pid]={'status':'pending','rounds':0,'new':True,'phase':role,'reviews':[],'author_runs':[],'prior_report':''}
        if role=='review': self.state['problems'][pid]['candidate']=candidate
        run={'id':pid+'-new','problem_id':pid,'role':role,'status':'running','candidate':candidate}
        self.state['runs'].append(run)
        return run

    def prove(self, before, plan, run):
        with patch.object(op,'REPO',self.case.repo),patch.object(op,'STATE',self.case.state),patch.object(op,'imp',importer):
            return op.verify_registered_resume(before,self.state,self.policy_head,plan,run)

    def test_real_registration_head_and_unchanged_review_proof(self):
        plan=op.resume_plan(self.before,{'released':[],'pending':None})
        registered=self.register_normally();run=self.begin_next_agent()
        proof=self.prove(self.before,plan,run)
        self.assertEqual(proof['agent_candidate'],registered)
        self.assertEqual(proof['registration_commits'],[{'problem_id':'4','head':registered}])
        for key,value in [('candidate','wrong'),('prior_report','changed'),('reviews',[])]:
            original=self.state['problems']['4'][key];self.state['problems']['4'][key]=value
            with self.assertRaisesRegex(RuntimeError,'metadata'):self.prove(self.before,plan,run)
            self.state['problems']['4'][key]=original

    def test_unrelated_post_registration_head_is_rejected(self):
        plan=op.resume_plan(self.before,{'released':[],'pending':None})
        self.register_normally()
        self.case.write('unrelated.txt','Unexpected change');self.case.git('add','.');self.case.git('commit','-m','Unexpected')
        run=self.begin_next_agent()
        with self.assertRaisesRegex(RuntimeError,'proven policy/registration head'):self.prove(self.before,plan,run)

    def test_review_boundary_refreshes_candidate_without_rewriting_prior_reviews(self):
        # No registration: STOP after author means the ordinary runner freezes a new review candidate.
        self.state['problems']['4'].update(status='review_pending',phase='review',candidate='older-candidate')
        before=copy.deepcopy(self.state);plan=op.resume_plan(before,{'released':[],'pending':None})
        self.state['status']='running';run=self.begin_next_agent('4','review')
        proof=self.prove(before,plan,run)
        self.assertEqual(proof['registration_commits'],[])
        self.assertEqual(proof['agent_candidate'],self.policy_head)
        self.state['problems']['4']['reviews']=[]
        with self.assertRaisesRegex(RuntimeError,'existing problem'):self.prove(before,plan,run)

    def test_incoming_lanes_count_toward_19_to_20_projection(self):
        self.state['problems'].update({str(i):{'status':'accepted_local','phase':'done'} for i in range(1000,1017)})
        with self.assertRaisesRegex(RuntimeError,'publication threshold'):
            op.resume_plan(self.state,{'released':[],'pending':None},incoming=('940','956'))
        self.state['problems'].pop('1016')
        self.assertEqual(op.resume_plan(self.state,{'released':[],'pending':None},incoming=('940','956'))['projected_pending'],19)

    def test_predicts_real_next_agent_after_registration(self):
        plan=op.resume_plan(self.state,{'released':[],'pending':None})
        registered=self.register_normally()
        self.assertNotEqual(registered,self.policy_head)
        actual=next(pid for pid in self.state['queue'] if self.state['problems'].get(pid,{}).get('status') not in campaign.TERMINAL)
        self.assertEqual(plan['next_problem_id'],actual)
        self.assertEqual(plan['registration_ids'],['4'])
        self.assertEqual(plan['projected_pending'],1)

    def test_registration_19_to_20_is_rejected_before_resume(self):
        self.state['problems'].update({str(i):{'status':'accepted_local','phase':'done'} for i in range(1000,1019)})
        with self.assertRaisesRegex(RuntimeError,'publication threshold'):
            op.resume_plan(self.state,{'released':[],'pending':None})
        self.register_normally()
        self.assertEqual(sum(v['status']=='accepted_local' for v in self.state['problems'].values()),20)


if __name__=='__main__':unittest.main(verbosity=2)
