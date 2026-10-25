"""Exercise the actual queue/release seam, without touching production."""
import copy
from types import SimpleNamespace
import unittest
from unittest.mock import patch
import test_leetcode_campaign as fixtures
campaign = fixtures.campaign


class PublicationIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.fixture = fixtures.CampaignTests('test_score_gating_and_strict_schema')
        self.fixture.setUp()
        self.addCleanup(self.fixture.doCleanups)
        self.calls = []

    def publish(self, repo, state, state_dir, publish_root, public_base, **options):
        self.assertEqual(self.fixture.git('status', '--porcelain'), '')
        self.assertEqual(self.fixture.git('rev-parse', 'HEAD'), state['expected_head'])
        self.calls.append((copy.deepcopy(state), options))

    def run_queue(self, scenario='', *extra, publisher=None):
        module = SimpleNamespace(maybe_publish=publisher or self.publish)
        with patch.dict('sys.modules', {'leetcode_publish': module}):
            return self.fixture.invoke(scenario, '--publish-root', str(self.fixture.root/'production'),
                                       '--public-base', 'https://example.invalid', *extra)

    def test_calls_at_clean_accepted_boundary_and_flushes_only_full_catalog(self):
        self.run_queue()
        self.assertEqual([len(s['problems']) for s,_ in self.calls], [0,1,2,2])
        self.assertEqual([o['flush'] for _,o in self.calls], [False,False,False,True])
        self.assertTrue(all(o['batch_size']==20 for _,o in self.calls))
        self.assertEqual(self.fixture.progress()['status'], 'completed')

    def test_resuming_with_twenty_default_preserves_prior_acceptance(self):
        self.run_queue('', '--publish-every', '100', '--run-count', '1')
        self.assertTrue(all(o['batch_size']==100 for _,o in self.calls))
        before = self.fixture.progress()
        accepted = copy.deepcopy(before['problems']['4'])
        prior_runs = [run for run in before['runs'] if run['problem_id']=='4']
        self.calls.clear()

        self.run_queue()

        after = self.fixture.progress()
        self.assertTrue(all(o['batch_size']==20 for _,o in self.calls))
        self.assertEqual(self.calls[0][0]['problems']['4'], accepted)
        self.assertEqual(after['problems']['4'], accepted)
        self.assertEqual([run for run in after['runs'] if run['problem_id']=='4'], prior_runs)
        self.assertEqual(after['status'], 'completed')

    def test_partial_queue_never_flushes_remainder(self):
        self.run_queue('', '--ids', '4')
        self.assertFalse(any(o['flush'] for _,o in self.calls))

    def test_blocked_queue_never_flushes_or_claims_complete(self):
        self.run_queue('blocked')
        self.assertFalse(any(o['flush'] for _,o in self.calls))
        self.assertEqual(self.fixture.progress()['status'], 'queue_exhausted_incomplete')

    def test_publication_failure_stops_before_next_author(self):
        def fail_after_acceptance(*args, **options):
            self.publish(*args, **options)
            if args[1]['problems']:
                raise ValueError('Public verification failed')
        with self.assertRaisesRegex(ValueError, 'Public verification failed'):
            self.run_queue(publisher=fail_after_acceptance)
        state=self.fixture.progress()
        self.assertEqual(state['status'], 'failed')
        self.assertEqual(state['problems']['4']['status'], 'accepted_local')
        self.assertNotIn('10', state['problems'])

    def test_stop_file_prevents_release_and_agent_start(self):
        self.fixture.state.mkdir()
        (self.fixture.state/'STOP').write_text('stop')
        self.run_queue()
        self.assertEqual(self.calls, [])
        self.assertEqual(self.fixture.progress()['runs'], [])

    def test_target_must_be_explicit_and_separate(self):
        with self.assertRaisesRegex(campaign.CampaignError, 'both'):
            self.fixture.invoke('', '--publish-root', str(self.fixture.root/'production'))
        with self.assertRaisesRegex(campaign.CampaignError, 'separate'):
            self.fixture.invoke('', '--publish-root', str(self.fixture.repo), '--public-base', 'https://example.invalid')

if __name__ == '__main__':
    unittest.main()
