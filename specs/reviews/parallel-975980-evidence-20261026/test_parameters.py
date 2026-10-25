"""Local static checks only. Never import or execute either operator."""
import ast
import hashlib
import json
from pathlib import Path
import unittest

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
SOURCE_SHA = '012137ab9eabb43cb6b9038ab6065312d8287724540d67fb362038ac4a5caa05'
PENDING_SHA = '977739897dfb2a58d1c9eba9b20b43346226d35eea515181263edf18f7d0b348'
MAPPING = json.loads((HERE / 'parameter-map.json').read_text())
SOURCE = (REPO / MAPPING['source']).read_text()
PENDING = (HERE / 'launch.py').read_text()


def validate(candidate):
    assert hashlib.sha256(SOURCE.encode()).hexdigest() == SOURCE_SHA
    assert len(MAPPING['substitutions']) == 9
    restored = candidate
    for change in reversed(MAPPING['substitutions']):
        assert restored.count(change['to']) == 1
        restored = restored.replace(change['to'], change['from'])
    assert restored == SOURCE
    assert ast.dump(ast.parse(restored)) == ast.dump(ast.parse(SOURCE))
    ast.parse(candidate)


class ParameterChecks(unittest.TestCase):
    def test_exact_source_and_template(self):
        validate(PENDING)
        self.assertEqual(hashlib.sha256(PENDING.encode()).hexdigest(), PENDING_SHA)
        self.assertEqual(MAPPING['launcherSha256'], PENDING_SHA)

    def test_all_six_pins_bound_to_preflight(self):
        self.assertNotIn('__PENDING_', PENDING)
        self.assertEqual(len(MAPPING['stageBPins']), 6)
        for value in MAPPING['stageBPins'].values():
            self.assertIn(value, PENDING)
        self.assertFalse(MAPPING['authorContextInjection'])
        self.assertEqual(MAPPING['status'], 'prepared-awaiting-root-independent-review-and-dispatch')

    def test_target_parameters(self):
        self.assertEqual([(t['id'], t['port']) for t in MAPPING['targets']],
                         [('975', 18793), ('980', 18794)])
        self.assertIn("plan=[('975',18793),('980',18794)]", PENDING)
        self.assertIn("for pid in ['975','980']:", PENDING)

    def test_stop_waiver_is_rejected(self):
        with self.assertRaises(AssertionError):
            validate(PENDING.replace(" and not (STATE/'STOP').exists()", ''))

    def test_reservation_gate_waiver_is_rejected(self):
        with self.assertRaises(AssertionError):
            validate(PENDING.replace("assert read(p).get('status')=='imported',p", 'pass'))

    def test_publication_argument_is_rejected(self):
        with self.assertRaises(AssertionError):
            validate(PENDING.replace("'--max-rounds','6'", "'--max-rounds','6','--publish-root','/tmp/public'"))

    def test_preflight_is_bound(self):
        raw = (HERE / 'preflight.json').read_bytes()
        self.assertEqual(hashlib.sha256(raw).hexdigest(), MAPPING['preflightSha256'])
        p = json.loads(raw)
        self.assertEqual(p['stage_b_receipt']['status'], 'completed-review-running')
        self.assertEqual(p['stage_b_receipt']['evidence_head'], p['base'])
        self.assertFalse(p['stop_exists'])
        self.assertEqual(p['queue_length'], 984)
        self.assertEqual(len(p['campaign_workers']), 1)
        self.assertTrue(all(r['status'] == 'imported' for r in p['reservations']))
        self.assertTrue(p['shared_tree_matches_base'])
        self.assertGreater(p['mem_available_kib'], 1048576)
        self.assertTrue(all(t['in_queue'] and t['problem_record'] is None and
                            not t['runs'] and not t['reservation_exists'] and
                            not t['port_listeners'] and t['bind_available'] for t in p['targets']))
        self.assertEqual(p['central_native']['pid'], MAPPING['centralNativePid'])
        self.assertEqual(p['central_runner_pid'], MAPPING['centralRunnerPid'])
        expected = [p['base'], p['central_head'], p['central_current']['run_id'],
                    p['central_current']['problem_id'], p['central_current']['stage'],
                    p['central_session']]
        self.assertEqual(list(MAPPING['stageBPins'].values()), expected)


if __name__ == '__main__':
    unittest.main()
