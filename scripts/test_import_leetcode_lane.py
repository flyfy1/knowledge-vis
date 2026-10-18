#!/usr/bin/env python3
"""Real disposable Git worktrees exercise the importer interface and publisher gate."""
import fcntl
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

import import_leetcode_lane as importer
from leetcode_registry import read_registry
from leetcode_campaign import fingerprint
from leetcode_publish import _reviewed
from register_leetcode_lesson import register


class LaneImportTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        base=Path(self.temp.name).resolve()
        self.repo=base/'central'; self.repo.mkdir()
        self.lane=base/'lane'
        self.state_dir=base/'state'; self.state_dir.mkdir()
        self.lane_state=base/'lane-state'; self.lane_state.mkdir()
        self.git(self.repo,'init','-b','codex/central')
        self.git(self.repo,'config','user.email','fixture@example.invalid')
        self.git(self.repo,'config','user.name','Fixture')
        self.write(self.repo,'leetcode/catalog/hard-problems.json',json.dumps({'problems':[
            {'id':i,'officialUrl':f'https://leetcode.com/problems/problem-{i}/','categories':['algorithms']} for i in (51,68)]}))
        self.write(self.repo,'leetcode/index.html','<script src="problems.config.js?v=initial"></script>')
        self.write(self.repo,'leetcode/problems.config.js','window.LEETCODE_PROBLEMS = [];')
        self.write(self.repo,'CONCEPT-MAP.md','# Concepts\n')
        self.write(self.repo,'specs/leetcode-review-gates.md','Frozen independent rubric')
        self.write(self.repo,'leetcode/common.js','window.shared=true;')
        self.commit(self.repo,'Base shared contract')
        self.git(self.repo,'worktree','add','-b','codex/lane',str(self.lane))
        self.make_lesson(self.repo,51)
        register(self.repo,51)
        central_head=self.commit(self.repo,'Unrelated central accepted lesson')
        self.central={'version':1,'repo':str(self.repo),'queue':['51','68'],
            'expected_head':central_head,'status':'stopped','current':None,
            'problems':{'51':{'status':'accepted_local','retained':'exactly'}},'runs':[]}
        self.write_state(self.state_dir,self.central)
        (self.state_dir/'STOP').touch()
        (self.state_dir/'releases.json').write_text('{"retained":"release ledger"}')
        self.make_lesson(self.lane,68)
        candidate=self.commit(self.lane,'Independent author candidate')
        report='specs/reviews/68-review-1-fixture.md'
        frozen=fingerprint(self.lane,68,report,'specs/reviews/68-evidence/68-review-1-fixture')
        self.write(self.lane,report,'Independent review at '+candidate)
        evidence='specs/reviews/68-evidence/68-review-1-fixture/observed.txt'
        self.write(self.lane,evidence,'Browser and oracle evidence')
        review_commit=self.commit(self.lane,'Independent reviewer report')
        register(self.lane,68)
        lane_head=self.commit(self.lane,'Register lane')
        output={'outcome':'accepted','scores':[4]*6,'required_open':[],
                'report_path':report,'evidence':[evidence],'detail':'Independent browser and complete oracle passed'}
        self.lane_data={'version':1,'repo':str(self.lane),'queue':['68'],'expected_head':lane_head,
            'status':'completed','current':None,'runs':[],
            'problems':{'68':{'status':'accepted_local','phase':'done','new':True,'rounds':1,
                'candidate':candidate,'author_runs':['68-author-fixture'],'prior_report':report,
                'registration_commit':lane_head,
                'reviews':[{**output,'run_id':'68-review-fixture','candidate':candidate,
                    'commit':review_commit,'weighted_score':100,'round':1,'candidate_sha256':frozen}]}}}
        for role,result in [('author',{'outcome':'ready','detail':'Self checks completed'}),('review',output)]:
            rid=f'68-{role}-fixture'
            folder=self.lane_state/'runs'/rid; folder.mkdir(parents=True)
            (folder/'final.json').write_text(json.dumps(result))
            sid=f'actual-{role}-session'
            (folder/'events.jsonl').write_text(json.dumps({'type':'thread.started','thread_id':sid})+'\n')
            (folder/'prompt.md').write_text('Original agent prompt')
            self.lane_data['runs'].append({'id':rid,'problem_id':'68','role':role,'status':'completed',
                'candidate':candidate,'directory':str(folder),'session_ids':[sid],'result':result})
        self.write_state(self.lane_state,self.lane_data)

    def git(self,repo,*args):
        return subprocess.check_output(['git',*args],cwd=repo,stderr=subprocess.DEVNULL).decode().strip()

    def write(self,repo,path,text):
        target=repo/path; target.parent.mkdir(parents=True,exist_ok=True); target.write_text(text)

    def commit(self,repo,message):
        self.git(repo,'add','.'); self.git(repo,'commit','-m',message)
        return self.git(repo,'rev-parse','HEAD')

    def write_state(self,directory,state):
        (directory/'progress.json').write_text(json.dumps(state))

    def make_lesson(self,repo,pid):
        prefix=f'leetcode/{pid}/'
        for name,text in {'index.html':f'<h1>#{pid}</h1><section id="step0"></section><script src="app.js"></script>',
            'app.js':'window.ready=true;', 'copy.js':'window.copy=true;', 'BRIEF.md':'Concrete lesson design',
            'solution.py':'def solve(): return 1\n','python-code.js':'window.PYTHON_SOURCE="def solve(): return 1\\n";'}.items():
            self.write(repo,prefix+name,text)
        self.write(repo,prefix+'lesson-entry.json',json.dumps({'id':pid,'path':f'{pid}/','difficulty':'hard',
            'leetcodeUrl':f'https://leetcode.com/problems/problem-{pid}/','language':'Python',
            'title':{'zh':f'题目 {pid}','en':f'Problem {pid}'},'desc':{'zh':'逐步讲解','en':'Progressive lesson'},
            'topics':[{'zh':'算法','en':'Algorithm'}],'complexity':'O(n)',
            'concepts':[{'name':'Concrete example','step':0,'description':'Step by step'}]}))

    def run_import(self):
        return importer.import_lane(self.repo,self.state_dir,self.lane,self.lane_state,'68')

    def reject(self,pattern):
        before=self.git(self.repo,'rev-parse','HEAD')
        state=(self.state_dir/'progress.json').read_bytes()
        with self.assertRaisesRegex((importer.ImportError,importer.PublicationError,importer.CampaignError),pattern):
            self.run_import()
        self.assertEqual(self.git(self.repo,'rev-parse','HEAD'),before)
        self.assertEqual((self.state_dir/'progress.json').read_bytes(),state)
        self.assertFalse((self.state_dir/'lane-imports').exists())

    def test_success_preserves_registry_state_release_and_ancestry(self):
        old_registry=read_registry(self.repo/'leetcode/problems.config.js')
        old_bytes=(self.repo/'leetcode/51/app.js').read_bytes()
        lane_state_before=(self.lane_state/'progress.json').read_bytes()
        receipt=self.run_import()
        updated=json.loads((self.state_dir/'progress.json').read_text())
        self.assertEqual(receipt['status'],'completed')
        self.assertEqual(updated['problems']['51'],self.central['problems']['51'])
        self.assertEqual(updated['queue'],self.central['queue'])
        self.assertEqual(updated['status'],'stopped')
        self.assertEqual((self.state_dir/'releases.json').read_text(),'{"retained":"release ledger"}')
        self.assertEqual((self.repo/'leetcode/51/app.js').read_bytes(),old_bytes)
        self.assertEqual((self.lane_state/'progress.json').read_bytes(),lane_state_before)
        registry={str(r['id']):r for r in read_registry(self.repo/'leetcode/problems.config.js')}
        self.assertEqual(registry['51'],old_registry[0])
        self.assertEqual(set(registry),{'51','68'})
        self.assertEqual(updated['problems']['68'],self.lane_data['problems']['68'])
        for run in updated['runs']:
            self.assertEqual((Path(run['directory'])/'events.jsonl').read_bytes(),
                (Path(run['source_directory'])/'events.jsonl').read_bytes())
        self.assertEqual(set(_reviewed(self.repo,updated,registry,updated['expected_head'],{'68'})),{'68'})
        self.git(self.repo,'merge-base','--is-ancestor',self.lane_data['expected_head'],updated['expected_head'])
        self.assertEqual(self.git(self.repo,'status','--porcelain'),'')

    def test_dirty_central_rejected(self):
        self.write(self.repo,'unrelated.txt','Keep me')
        self.reject('Dirty checkout')

    def test_dirty_lane_rejected(self):
        self.write(self.lane,'leetcode/68/app.js','mutated')
        self.reject('Dirty checkout')

    def test_live_checkout_owner_rejected(self):
        path=Path(self.git(self.lane,'rev-parse','--git-path','leetcode-campaign.lock'))
        with path.open('a') as lock:
            fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
            self.reject('Live runner')

    def test_live_state_owner_rejected(self):
        with (self.state_dir/'runner.lock').open('a') as lock:
            fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
            self.reject('Live runner')

    def test_missing_stop_rejected(self):
        (self.state_dir/'STOP').unlink()
        self.reject('observe STOP')

    def test_missing_review_rejected(self):
        self.lane_data['problems']['68']['reviews']=[]
        self.write_state(self.lane_state,self.lane_data)
        self.reject('not independently accepted')

    def test_mutated_accepted_candidate_rejected(self):
        self.write(self.lane,'leetcode/68/app.js','Changed after review')
        self.lane_data['expected_head']=self.commit(self.lane,'Unreviewed mutation')
        self.write_state(self.lane_state,self.lane_data)
        self.reject('Candidate lesson/test bytes changed')

    def test_shared_runtime_change_rejected(self):
        self.write(self.repo,'leetcode/common.js','New unreviewed runtime')
        self.central['expected_head']=self.commit(self.repo,'Changed central shared runtime')
        self.write_state(self.state_dir,self.central)
        self.reject('Shared runtime or policy')

    def test_rubric_change_rejected(self):
        self.write(self.repo,'specs/leetcode-review-gates.md','Different rubric')
        self.central['expected_head']=self.commit(self.repo,'Changed central rubric')
        self.write_state(self.state_dir,self.central)
        self.reject('Shared runtime or policy')

    def test_reused_agent_session_rejected(self):
        self.central['runs']=[{'id':'51-author-other','problem_id':'51','status':'completed',
                              'session_ids':['actual-review-session']}]
        self.write_state(self.state_dir,self.central)
        self.reject('reused agent sessions')

    def test_session_evidence_mismatch_rejected(self):
        self.lane_data['runs'][-1]['session_ids']=['invented-session']
        self.write_state(self.lane_state,self.lane_data)
        self.reject('actual events')

    def test_already_started_id_rejected(self):
        self.central['problems']['68']={'status':'review_pending'}
        self.write_state(self.state_dir,self.central)
        self.reject('already started')

    def test_review_cannot_edit_candidate_then_restore_it(self):
        entry=self.lane_data['problems']['68']
        report=entry['reviews'][0]['report_path']
        evidence=entry['reviews'][0]['evidence'][0]
        self.git(self.lane,'reset','--hard',entry['candidate'])
        original=(self.lane/'leetcode/68/app.js').read_bytes()
        self.write(self.lane,report,'Independent report')
        self.write(self.lane,evidence,'Recorded evidence')
        self.write(self.lane,'leetcode/68/app.js','Reviewer changed the implementation')
        entry['reviews'][0]['commit']=self.commit(self.lane,'Review touched implementation')
        (self.lane/'leetcode/68/app.js').write_bytes(original)
        register(self.lane,68)
        self.lane_data['expected_head']=self.commit(self.lane,'Restore original runtime and register')
        self.write_state(self.lane_state,self.lane_data)
        self.reject('Review commit mutated frozen candidate')

    def test_review_cannot_hide_source_deletion_as_rename(self):
        entry=self.lane_data['problems']['68']
        report=entry['reviews'][0]['report_path']
        self.git(self.lane,'config','diff.renames','true')
        self.git(self.lane,'reset','--hard',entry['candidate'])
        brief=self.lane/'leetcode/68/BRIEF.md'
        original=brief.read_bytes()
        (self.lane/report).parent.mkdir(parents=True,exist_ok=True)
        brief.rename(self.lane/report)
        entry['reviews'][0]['commit']=self.commit(self.lane,'Reviewer moved frozen source into report')
        brief.write_bytes(original)
        register(self.lane,68)
        self.lane_data['expected_head']=self.commit(self.lane,'Restored source and registered')
        self.write_state(self.lane_state,self.lane_data)
        self.reject('Review commit mutated frozen candidate')

    def record_group_writable_fingerprint(self, mode_overrides=None):
        """The Pi runner creates 0664 files; Git records these as 100644."""
        entry=self.lane_data['problems']['68']
        report=entry['reviews'][0]['report_path']
        evidence=entry['reviews'][0]['evidence'][0]
        self.git(self.lane,'reset','--hard',entry['candidate'])
        for name in self.git(self.lane,'ls-files').splitlines():
            (self.lane/name).chmod(0o775 if (self.lane/name).stat().st_mode & 0o111 else 0o664)
        for name, mode in (mode_overrides or {}).items():
            (self.lane/name).chmod(mode)
        recorded=fingerprint(self.lane,68,report,'specs/reviews/68-evidence/68-review-1-fixture')
        self.write(self.lane,report,'Independent review recorded group writable candidate')
        self.write(self.lane,evidence,'Original evidence')
        entry['reviews'][0]['commit']=self.commit(self.lane,'Review group writable candidate')
        entry['reviews'][0]['candidate_sha256']=recorded
        register(self.lane,68)
        self.lane_data['expected_head']=self.commit(self.lane,'Register group writable candidate')
        self.write_state(self.lane_state,self.lane_data)
        return recorded

    def test_group_writable_runner_fingerprint_imports_unchanged(self):
        recorded=self.record_group_writable_fingerprint()
        self.run_import()
        updated=json.loads((self.state_dir/'progress.json').read_text())
        self.assertEqual(updated['problems']['68']['reviews'][0]['candidate_sha256'],recorded)

    def test_mixed_permissions_and_group_writable_executable_import(self):
        entry=self.lane_data['problems']['68']
        self.git(self.lane,'reset','--hard',entry['candidate'])
        self.write(self.lane,'leetcode/68/run.sh','#!/bin/sh\nexit 0\n')
        (self.lane/'leetcode/68/run.sh').chmod(0o775)
        candidate=self.commit(self.lane,'Candidate with executable test helper')
        entry['candidate']=candidate
        entry['reviews'][0]['candidate']=candidate
        for run in self.lane_data['runs']:
            run['candidate']=candidate
        recorded=self.record_group_writable_fingerprint({'leetcode/common.js':0o644})
        self.run_import()
        updated=json.loads((self.state_dir/'progress.json').read_text())
        self.assertEqual(updated['problems']['68']['reviews'][0]['candidate_sha256'],recorded)

    def test_executable_mismatch_rejected_even_when_recorded_hash_matches_disk(self):
        self.git(self.lane,'config','core.filemode','false')
        self.record_group_writable_fingerprint({'leetcode/68/app.js':0o775})
        self.reject('Candidate executable mode differs from Git')

    def test_permissions_drift_after_review_rejected(self):
        self.record_group_writable_fingerprint()
        (self.lane/'leetcode/68/app.js').chmod(0o644)
        self.reject('Frozen candidate fingerprint mismatch')

    def test_false_fingerprint_rejected(self):
        self.lane_data['problems']['68']['reviews'][0]['candidate_sha256']='0'*64
        self.write_state(self.lane_state,self.lane_data)
        self.reject('Frozen candidate fingerprint mismatch')

    def test_missing_completed_author_run_rejected(self):
        self.lane_data['runs']=self.lane_data['runs'][1:]
        self.write_state(self.lane_state,self.lane_data)
        self.reject('Missing or duplicate lane runs')

    def test_out_of_scope_lane_change_rejected(self):
        self.write(self.lane,'unrelated-new.txt','Outside the lane')
        self.lane_data['expected_head']=self.commit(self.lane,'Out of scope lane change')
        self.write_state(self.lane_state,self.lane_data)
        self.reject('outside its permitted scope')

    def test_failing_required_dimension_rejected(self):
        self.lane_data['problems']['68']['reviews'][0]['scores']=[4,4,4,4,4,2]
        self.write_state(self.lane_state,self.lane_data)
        self.reject('Review gate failed')

    def test_failure_preserves_inspectable_merge_and_prepared_receipt(self):
        old=(self.state_dir/'progress.json').read_bytes()
        with patch.object(importer,'register',side_effect=ValueError('injected registration failure')):
            with self.assertRaisesRegex(ValueError,'injected'):
                self.run_import()
        self.assertEqual((self.state_dir/'progress.json').read_bytes(),old)
        self.assertTrue((self.repo/'leetcode/68/app.js').exists())
        receipts=list((self.state_dir/'lane-imports').glob('*.json'))
        self.assertEqual(len(receipts),1)
        self.assertEqual(json.loads(receipts[0].read_text())['status'],'prepared')
        self.assertTrue(self.git(self.repo,'rev-parse','MERGE_HEAD'))


if __name__=='__main__':
    unittest.main()
