"""Local synthetic evidence/state tests only; no candidate measurement or remote call."""
import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import sys
from types import SimpleNamespace
import unittest
from unittest.mock import patch

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('stage_b', HERE/'operate.py')
op = importlib.util.module_from_spec(spec); spec.loader.exec_module(op)


def encoded(value):
    return (json.dumps(value, indent=2) + '\n').encode()


def evidence_fixture():
    # These synthetic rows test artifact validation, not real numeric correctness.
    prefix = 'specs/reviews/818-evidence/818-search-mac-20261026-0123456789ab/'
    source = b'class Solution: pass\n'; digest = op.sha(source)
    pins = {'candidate': 'a'*40, 'lesson_tree': 'b'*40, 'source_sha256': digest, 'evidence_prefix': prefix}
    report = f'Candidate {pins["candidate"]}\nSource {digest}\nEvidence {prefix}\nHarness {op.HARNESS_SHA}\n'.encode()
    rows = [{'target': t, 'status': 'ok', 'answer': t, 'source_sha256_after': digest,
             'reference_dp_answer': t, 'matches_reference_dp': True,
             'raw_bfs_answer': t if t <= 32 else None, 'matches_raw_bfs': True if t <= 32 else None,
             'peak_rss_bytes': 200 if t == 9997 else 100, 'peak_rss_raw': 200 if t == 9997 else 100,
             'peak_rss_raw_unit': 'bytes', 'call_seconds': t/10000, 'process_wall_seconds': 1.1}
            for t in range(1, 10001)]
    isolated = [copy.deepcopy(rows[t-1]) for t in (9809, 9879, 9997, 10000)]
    files = {'canonical.py': source,
             'environment.json': encoded({'sys_platform': 'darwin', 'target_range': [1, 10000],
                 'test_only_limited_coverage': False, 'workers': 2, 'source_sha256': digest, 'harness_sha256': op.HARNESS_SHA}),
             'survey.jsonl': b''.join(json.dumps(row).encode()+b'\n' for row in rows),
             'isolated.jsonl': b''.join(json.dumps(row).encode()+b'\n' for row in isolated),
             'progress.json': encoded({'status': 'passed_full_range', 'completed': 10000, 'counts': {'ok': 10000}}),
             'summary.json': encoded({'status': 'passed_full_range', 'full_official_range_passed': True,
                 'coverage_count': 10000, 'expected_count': 10000, 'all_targets_recorded': True,
                 'source_immutable': True, 'original_sha256_after': digest, 'frozen_sha256_after': digest,
                 'error': None, 'failed_targets': [], 'isolated_targets': [r['target'] for r in isolated]})}
    payload = {op.REPORT: report, **{prefix+name: data for name, data in files.items()}}
    repin(payload, pins)
    return payload, pins


def repin(payload, pins):
    prefix = pins['evidence_prefix']
    summary = json.loads(payload[prefix+'summary.json'])
    summary['artifact_sha256'] = {name: op.sha(payload[prefix+name]) for name in op.ARTIFACTS - {'summary.json', 'binding.json'}}
    payload[prefix+'summary.json'] = encoded(summary)
    payload[prefix+'binding.json'] = encoded({'candidate': pins['candidate'], 'lesson_tree': pins['lesson_tree'],
        'source_sha256': pins['source_sha256'], 'harness_sha256': op.HARNESS_SHA,
        'summary_sha256': op.sha(payload[prefix+'summary.json']), 'report_path': op.REPORT,
        'report_sha256': op.sha(payload[op.REPORT]), 'evidence_prefix': prefix})
    pins['files'] = {path: op.sha(data) for path, data in payload.items()}


class EvidenceGuards(unittest.TestCase):
    @classmethod
    def setUpClass(cls): cls.original, cls.pins = evidence_fixture()

    def fixture(self): return dict(self.original), copy.deepcopy(self.pins)

    def test_valid_full_coverage_and_observed_worst(self):
        payload, pins = self.fixture()
        result = op.validate_measurements(payload, pins)
        self.assertEqual(result['targets'], 10000)
        self.assertEqual(result['isolated_targets'], [9809, 9879, 9997, 10000])

    def test_hash_tampering_and_path_escape_refused(self):
        payload, pins = self.fixture(); payload[op.REPORT] += b'changed'
        with self.assertRaisesRegex(RuntimeError, 'Pinned payload'): op.validate_measurements(payload, pins)
        payload, pins = self.fixture(); pins['evidence_prefix'] = '../../'
        with self.assertRaisesRegex(RuntimeError, 'exclusive named'): op.validate_measurements(payload, pins)

    def test_limited_summary_or_wrong_harness_refused_even_with_new_hashes(self):
        for name, key, value in [('summary.json', 'full_official_range_passed', False),
                                 ('environment.json', 'harness_sha256', '0'*64),
                                 ('environment.json', 'sys_platform', 'linux')]:
            payload, pins = self.fixture(); path = pins['evidence_prefix']+name
            data = json.loads(payload[path]); data[key] = value; payload[path] = encoded(data); repin(payload, pins)
            with self.assertRaises(RuntimeError): op.validate_measurements(payload, pins)

    def test_duplicate_target_or_unobserved_result_refused(self):
        for change in ('duplicate', 'failed'):
            payload, pins = self.fixture(); path = pins['evidence_prefix']+'survey.jsonl'
            rows = [json.loads(line) for line in payload[path].splitlines()]
            if change == 'duplicate': rows[-1]['target'] = 9999
            else: rows[50]['status'] = 'unobserved_after_abort'
            payload[path] = b''.join(json.dumps(row).encode()+b'\n' for row in rows); repin(payload, pins)
            with self.assertRaises(RuntimeError): op.validate_measurements(payload, pins)

    def test_missing_observed_rss_worst_is_refused(self):
        payload, pins = self.fixture(); prefix = pins['evidence_prefix']
        rows = [json.loads(line) for line in payload[prefix+'isolated.jsonl'].splitlines()]
        rows = [row for row in rows if row['target'] != 9997]
        payload[prefix+'isolated.jsonl'] = b''.join(json.dumps(row).encode()+b'\n' for row in rows)
        summary = json.loads(payload[prefix+'summary.json']); summary['isolated_targets'] = [r['target'] for r in rows]
        payload[prefix+'summary.json'] = encoded(summary); repin(payload, pins)
        with self.assertRaisesRegex(RuntimeError, 'Isolated coverage'): op.validate_measurements(payload, pins)

    def test_source_or_candidate_binding_mismatch_refused(self):
        payload, pins = self.fixture(); payload[pins['evidence_prefix']+'canonical.py'] += b'#different\n'; repin(payload, pins)
        with self.assertRaisesRegex(RuntimeError, 'canonical source'): op.validate_measurements(payload, pins)
        payload, pins = self.fixture(); path = pins['evidence_prefix']+'binding.json'
        binding = json.loads(payload[path]); binding['candidate'] = 'c'*40; payload[path] = encoded(binding)
        pins['files'][path] = op.sha(payload[path])
        with self.assertRaisesRegex(RuntimeError, 'binding differs'): op.validate_measurements(payload, pins)

    def test_failed_isolated_and_wrong_rss_unit_refused(self):
        for key, value in [('status', 'timeout'), ('peak_rss_raw_unit', 'kilobytes'), ('call_seconds', float('nan'))]:
            payload, pins = self.fixture(); path = pins['evidence_prefix']+'isolated.jsonl'
            rows = [json.loads(line) for line in payload[path].splitlines()]; rows[0][key] = value
            payload[path] = b''.join(json.dumps(row).encode()+b'\n' for row in rows); repin(payload, pins)
            with self.assertRaises(RuntimeError): op.validate_measurements(payload, pins)


class StateAndDispatch(unittest.TestCase):
    def test_actual_runner_freezes_evidence_adoption_head_for_review(self):
        sys.path.insert(0, str(HERE.parents[2]/'scripts'))
        import leetcode_campaign as campaign
        import test_leetcode_campaign as fixtures
        case = fixtures.CampaignTests('runTest'); case.setUp(); self.addCleanup(case.doCleanups)
        old = case.git('rev-parse', 'HEAD')
        case.git('commit', '--allow-empty', '-m', 'Evidence adoption fixture')
        head = case.git('rev-parse', 'HEAD')
        state = {'expected_head': old, 'problems': {'4': {'status': 'review_pending', 'phase': 'review',
                 'candidate': old, 'new': False, 'rounds': 1, 'reviews': ['historical'], 'prior_report': 'old.md'}}}
        state = op.checkpoint(state, head)
        args = SimpleNamespace(repo=case.repo, stop_file=case.state/'STOP')
        class Captured(Exception): pass
        def observe(*values, **kwargs):
            self.assertEqual(values[1], 'review'); self.assertEqual(values[3], head)
            self.assertEqual(state['problems']['4']['candidate'], head)
            self.assertEqual(state['problems']['4']['reviews'], ['historical'])
            raise Captured
        with patch.object(campaign, 'run_agent', side_effect=observe):
            with self.assertRaises(Captured):
                campaign.process_problem(args, {'id': 4}, state, case.state/'progress.json', 'http://fixture.invalid')

    def test_preparation_refuses_before_reading_missing_pins_or_runtime(self):
        with patch.object(op, 'REVIEWED_PINS_SHA256', None), patch.object(op, 'policy_guard', side_effect=AssertionError('No runtime access')):
            with self.assertRaisesRegex(RuntimeError, 'Preparation only'):
                op.main(['--dispatch', op.DISPATCH, '--pins', '/no/such/pins'])
            with self.assertRaisesRegex(RuntimeError, 'dispatch'):
                op.main(['--dispatch', 'wrong', '--pins', '/no/such/pins'])

    def test_checkpoint_changes_expected_head_only(self):
        before = {'expected_head': 'old', 'updated_at': 'keep', 'runs': [{'id': 'past'}],
                  'problems': {'818': {'candidate': 'old', 'reviews': [1], 'rounds': 1}}, 'queue': ['818']}
        after = op.checkpoint(before, 'new')
        self.assertEqual(after, {**before, 'expected_head': 'new'})
        self.assertEqual(before['expected_head'], 'old')

    def reviewer_fixture(self, root):
        directory = root/'runs'/'818-review-fresh'; directory.mkdir(parents=True)
        (directory/'events.jsonl').write_text('{"type":"thread.started","thread_id":"fresh"}\n{"type":"turn.started"}\n')
        before = {'status': 'stopped', 'expected_head': 'adoption', 'updated_at': 'old',
                  'current': {'stage': 'fix'}, 'runs': [{'id': 'old', 'session_ids': ['past']}],
                  'problems': {'818': {'status': 'review_pending', 'phase': 'review', 'candidate': 'author', 'rounds': 1, 'reviews': [1]}},
                  'queue': ['818'], 'maintenance': [{'keep': True}]}
        live = copy.deepcopy(before); live.update(status='running', updated_at='new',
            current={'problem_id': '818', 'stage': 'review', 'run_id': directory.name})
        live['problems']['818']['candidate'] = 'adoption'
        live['runs'].append({'id': directory.name, 'problem_id': '818', 'role': 'review', 'status': 'running',
                             'candidate': 'adoption', 'directory': str(directory)})
        procs = {10: {'ppid': 1, 'cwd': str(op.REPO), 'args': ['python', '/repo/scripts/leetcode_campaign.py',
                     '--publish-every', '20', '--max-rounds', '6', '--state-dir', str(root)]},
                 11: {'ppid': 10, 'cwd': str(op.REPO), 'args': ['/vendor/arm/codex']}}
        return before, live, procs, directory

    def test_fresh_reviewer_exact_adoption_candidate(self):
        with tempfile.TemporaryDirectory() as temporary, patch.object(op, 'STATE', Path(temporary)):
            before, live, procs, directory = self.reviewer_fixture(Path(temporary))
            self.assertEqual(op.review_proof(before, live, 10, procs)['candidate'], 'adoption')
            self.assertIsNone(op.review_proof(before, live, 10, {10: procs[10]}))
            live['runs'][-1]['candidate'] = 'author'
            with self.assertRaisesRegex(RuntimeError, 'reviewer identity'): op.review_proof(before, live, 10, procs)

    def test_reused_thread_or_rewritten_prior_review_refused(self):
        with tempfile.TemporaryDirectory() as temporary, patch.object(op, 'STATE', Path(temporary)):
            before, live, procs, directory = self.reviewer_fixture(Path(temporary))
            (directory/'events.jsonl').write_text('{"type":"thread.started","thread_id":"past"}\n{"type":"turn.started"}\n')
            with self.assertRaisesRegex(RuntimeError, 'reviewer session'): op.review_proof(before, live, 10, procs)
            live['problems']['818']['reviews'] = []
            with self.assertRaisesRegex(RuntimeError, 'ordinary history'): op.review_proof(before, live, 10, procs)


class RecoveryLineage(unittest.TestCase):
    def fixture(self):
        failed=(HERE.parent/'parallel-968972-import-818-search-execution-20261026/receipt-failed.json').read_bytes()
        receipt={'owner': '818-search-author-startup-recovery-20261026-32c8d741',
                 'recovery_of': 'import968972-search818-stage-a-20261026-4b7e902d',
                 'failed_stage_a_receipt_preserved': True, 'status':'waiting-for-Mac',
                 'stage_a_complete':True, 'owned_stop_present':True,
                 'frozen_author':{'zero_new_818_reviews':True}}
        return receipt,failed

    def test_only_successful_recovery_receipt_is_handoff(self):
        receipt,failed=self.fixture()
        self.assertEqual(op.recovered_handoff(receipt,failed),receipt['frozen_author'])
        self.assertEqual(json.loads(failed)['status'],'failed-inspect-no-retry')
        self.assertEqual(op.HANDOFF_OWNER,'818-search-author-startup-recovery-20261026-32c8d741-author-to-mac')
        with patch.object(op, 'REVIEWED_PINS_SHA256', None):
            self.assertIsNone(op.REVIEWED_PINS_SHA256)

    def test_old_failed_receipt_cannot_be_relabelled_success(self):
        receipt,failed=self.fixture();receipt['owner']='import968972-search818-stage-a-20261026-4b7e902d'
        with self.assertRaisesRegex(RuntimeError,'lineage'):op.recovered_handoff(receipt,failed)
        receipt,failed=self.fixture();rewritten=json.loads(failed);rewritten['status']='waiting-for-Mac'
        with self.assertRaisesRegex(RuntimeError,'failed Stage A receipt changed'):op.recovered_handoff(receipt,encoded(rewritten))

    def test_incomplete_or_wrong_lineage_recovery_refused(self):
        for key,value in [('recovery_of','foreign'),('failed_stage_a_receipt_preserved',False),('status','author-running-stop-armed'),('stage_a_complete',False),('owned_stop_present',False)]:
            with self.subTest(key=key):
                receipt,failed=self.fixture();receipt[key]=value
                with self.assertRaises(RuntimeError):op.recovered_handoff(receipt,failed)
        receipt,failed=self.fixture();receipt['frozen_author']['zero_new_818_reviews']=False
        with self.assertRaises(RuntimeError):op.recovered_handoff(receipt,failed)


if __name__ == '__main__':
    unittest.main(verbosity=2)
