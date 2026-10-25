"""Local guard tests only: temporary Git repositories; no SSH, agents or dispatch."""
import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest import mock

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parents[2]
spec = importlib.util.spec_from_file_location('prepared_operator', HERE/'operate.py')
op = importlib.util.module_from_spec(spec)
spec.loader.exec_module(op)
sys.path.insert(0, str(PROJECT/'scripts'))
import import_leetcode_lane as importer


def source(path, revision=op.SOURCE):
    return subprocess.check_output(['git', '-C', str(PROJECT), 'show', revision+':'+path])


def git(repo, *args):
    return subprocess.check_output(['git', '-C', str(repo), *args], stderr=subprocess.STDOUT).decode().strip()


class Guards(unittest.TestCase):
    def test_payload_accepts_reviewed_exact_bytes_rejects_wrong_old_new_or_extra_path(self):
        old = {p: source(p, '8fe0681a^') for p in op.OLD_HASHES}
        payload = {p: source(p) for p in op.ALLOWLIST}
        op.policy_bytes_valid(old, payload)
        bad = dict(payload); bad[op.SPEC] += b'changed'
        for before, after in [({**old, op.SPEC:old[op.SPEC]+b'x'}, payload), ({**old, op.AUTHOR:old[op.AUTHOR]+b'x'}, payload), (old, bad), (old, {**payload, 'README.md': b'extra'})]:
            with self.assertRaises(RuntimeError): op.policy_bytes_valid(before, after)

    def test_tree_requires_only_four_paths_and_new_reports(self):
        before = {op.SPEC: '100644 blob old', op.AUTHOR:'100644 blob old-author', 'leetcode/801/index.html': '100644 blob same'}
        after = {**before, **{p:'100644 blob new-'+p for p in op.ALLOWLIST}}
        op.policy_tree_valid(before, after)
        cases = [{**after, 'leetcode/801/index.html': '100644 blob bad'}, {**after, 'specs/reviews/old.md': '100644 blob x'}, {**after, op.SPEC:'100755 blob new'}]
        for case in cases:
            with self.assertRaises(RuntimeError): op.policy_tree_valid(before, case)
        for report in op.NEW_REPORTS:
            with self.assertRaises(RuntimeError): op.policy_tree_valid({**before, report:'100644 blob previous'}, after)

    def test_expected_head_only_preserves_even_timestamp(self):
        before = {'expected_head':'old','updated_at':'frozen','problems':{'1':{'status':'accepted_local'}},'queue':['1','2'],'current':{'run_id':'old'}}
        after = copy.deepcopy(before); after['expected_head']='new'
        op.expected_head_only(before, after, 'new')
        for key, value in [('updated_at','changed'),('queue',[]),('problems',{}),('current',None)]:
            changed = copy.deepcopy(after); changed[key]=value
            with self.assertRaises(RuntimeError): op.expected_head_only(before, changed, 'new')

    def test_fresh_agent_requires_new_identity_events_and_native_descendant(self):
        with tempfile.TemporaryDirectory() as d:
            events = Path(d)/'events.jsonl'
            current = {'problem_id':'810','run_id':'new','stage':'review'}
            state = {'status':'running','current':current,'runs':[{'id':'new','status':'running','directory':d}]}
            procs = {10:{'ppid':1,'args':['python'],'cwd':str(op.REPO)},11:{'ppid':10,'args':['node'],'cwd':str(op.REPO)},12:{'ppid':11,'args':['/vendor/arch/bin/codex'],'cwd':str(op.REPO)}}
            events.write_text('{"type":"thread.started","thread_id":"fresh"}\n{"type":"turn.started"}\n{"partial":')
            result = op.new_run_evidence(state, {'old'}, {'past'}, '810', procs, 10)
            self.assertEqual(result['native_codex_pids'], [12])
            self.assertIsNone(op.new_run_evidence(state, {'new'}, {'past'}, '810', procs, 10))
            self.assertIsNone(op.new_run_evidence(state, {'old'}, {'fresh'}, '810', procs, 10))
            self.assertIsNone(op.new_run_evidence(state, {'old'}, {'past'}, '815', procs, 10))
            self.assertIsNone(op.new_run_evidence(state, {'old'}, {'past'}, '810', {10:procs[10]}, 10))
            events.write_text('{"type":"thread.started","thread_id":"fresh"}\n')
            self.assertIsNone(op.new_run_evidence(state, {'old'}, {'past'}, '810', procs, 10))

    def test_import_preserves_ordinary_metadata_and_prior_history(self):
        before = {'expected_head':'old','updated_at':'old-time','problems':{'801':{'status':'accepted_local'}},'runs':[],'queue':['801','940','956'],'current':{'run_id':'prior'},'lane_imports':[{'id':'prior'}]}
        after = copy.deepcopy(before); after['expected_head']='merged'; after['updated_at']='new-time'
        after['problems'].update({'940':{'status':'accepted_local'},'956':{'status':'accepted_local'}})
        after['runs'].append({'id':'fresh940','problem_id':'940'})
        after['lane_imports'].append({'id':'940'})
        op.import_metadata_preserved(before,after)
        for key,value in [('current',None),('queue',[]),('lane_imports',[]),('problems',{})]:
            bad=copy.deepcopy(after);bad[key]=value
            with self.assertRaises(RuntimeError):op.import_metadata_preserved(before,bad)

    def test_wrong_dispatch_rejected_before_runtime_or_remote_access(self):
        with mock.patch.object(op, 'hashes_unchanged', side_effect=AssertionError('must not access runtime')):
            with self.assertRaisesRegex(RuntimeError, 'dispatch'):
                op.main(['--dispatch','not-approved'])

    def test_atomic_save_preserves_metadata_and_exclusive_receipt(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d)/'state.json'; value={'updated_at':'fixed','nested':{'x':1}}
            op.save(path, value, exclusive=True)
            self.assertEqual(json.loads(path.read_text()), value)
            with self.assertRaises(FileExistsError): op.save(path, {'x':2}, exclusive=True)
            self.assertEqual(json.loads(path.read_text()), value)


class PolicyIntegration(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); root=Path(self.tmp.name).resolve()
        self.repo=root/'repo';self.repo.mkdir();self.state=root/'state';self.state.mkdir()
        git(self.repo,'init','-b','codex/test');git(self.repo,'config','user.name','Guard Test');git(self.repo,'config','user.email','guard@example.invalid')
        (self.repo/op.SPEC).parent.mkdir(parents=True)
        (self.repo/op.REPORT).parent.mkdir(parents=True)
        for path in op.OLD_HASHES:
            (self.repo/path).parent.mkdir(parents=True,exist_ok=True)
            (self.repo/path).write_bytes(source(path,'8fe0681a^'))
        (self.repo/'existing-lesson.txt').write_text('preserved\n')
        git(self.repo,'add','.');git(self.repo,'commit','-m','Fixture')
        head=git(self.repo,'rev-parse','HEAD')
        self.baseline={'version':1,'repo':str(self.repo),'status':'stopped','expected_head':head,'updated_at':'frozen-time','queue':['940','956','810'],'problems':{'940':{'status':'accepted_local','candidate':'original940'},'956':{'status':'accepted_local','candidate':'original956'}},'runs':[{'id':'original','status':'completed','session_ids':['retained']}],'current':{'problem_id':'810','stage':'author','run_id':'old'},'lane_imports':[{'id':'retained'}]}
        op.save(self.state/'progress.json',self.baseline)
        (self.state/'releases.json').write_text('{"pending":null,"released":[]}\n')
        op.save(self.state/'STOP',{'owner':op.OWNER})
        self.stop=(self.state/'STOP').read_bytes()
        self.payload={p:source(p) for p in op.ALLOWLIST}
        self.patches=[mock.patch.object(op,'REPO',self.repo),mock.patch.object(op,'STATE',self.state),mock.patch.object(op,'RECEIPT',self.state/'receipt.json'),mock.patch.object(op,'imp',importer),mock.patch.object(op,'hashes_unchanged',lambda:None)]
        for p in self.patches:p.start()

    def tearDown(self):
        for p in reversed(self.patches):p.stop()
        self.tmp.cleanup()

    def test_real_git_policy_adoption_changes_exact_allowlist_and_head_only(self):
        ledger=(self.state/'releases.json').read_bytes()
        record={}
        after=op.adopt_policy(self.payload,record,self.stop)
        op.expected_head_only(self.baseline,after,git(self.repo,'rev-parse','HEAD'))
        self.assertEqual(set(git(self.repo,'diff','--name-only',self.baseline['expected_head'],'HEAD').splitlines()),set(op.ALLOWLIST))
        self.assertEqual((self.state/'releases.json').read_bytes(),ledger)
        self.assertEqual((self.state/'STOP').read_bytes(),self.stop)
        self.assertFalse(git(self.repo,'status','--porcelain'))
        self.assertTrue(record['policy_after']['only_expected_head_changed'])

    def test_dirty_checkout_fails_before_policy_copy(self):
        (self.repo/'unrelated.txt').write_text('preserve')
        with self.assertRaisesRegex(RuntimeError,'Dirty checkout'):
            op.adopt_policy(self.payload,{},self.stop)
        self.assertEqual(op.read(self.state/'progress.json'),self.baseline)
        self.assertFalse((self.repo/op.REPORT).exists())

    def test_hook_unexpected_tracked_change_fails_before_checkpoint(self):
        hook=self.repo/'.git/hooks/pre-commit'
        hook.write_text('#!/bin/sh\nprintf "hook changed\\n" > existing-lesson.txt\ngit add existing-lesson.txt\n');hook.chmod(0o755)
        with self.assertRaisesRegex(RuntimeError,'unexpected paths'):
            op.adopt_policy(self.payload,{},self.stop)
        self.assertEqual(op.read(self.state/'progress.json'),self.baseline)
        self.assertEqual((self.state/'STOP').read_bytes(),self.stop)
        self.assertNotEqual(git(self.repo,'rev-parse','HEAD'),self.baseline['expected_head'])

    def test_changed_stop_fails_before_policy_write(self):
        op.save(self.state/'STOP',{'owner':'someone-else'})
        with self.assertRaisesRegex(RuntimeError,'STOP ownership'):
            op.adopt_policy(self.payload,{},self.stop)
        self.assertFalse((self.repo/op.REPORT).exists())
        self.assertEqual(op.read(self.state/'progress.json'),self.baseline)


if __name__ == '__main__':
    unittest.main(verbosity=2)
