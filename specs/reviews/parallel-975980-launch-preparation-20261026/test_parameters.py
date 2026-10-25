"""Local static checks only. Never import or execute either operator."""
import ast
import hashlib
import json
from pathlib import Path
import unittest

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
SOURCE_SHA = '012137ab9eabb43cb6b9038ab6065312d8287724540d67fb362038ac4a5caa05'
PENDING_SHA = '9cd775670a13266a93016e6bccbbd76ff110777c599115dd889c674f79b97379'
MAPPING = json.loads((HERE / 'parameter-map.json').read_text())
SOURCE = (REPO / MAPPING['source']).read_text()
PENDING = (HERE / 'launch.pending.py').read_text()


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
        self.assertEqual(MAPPING['pendingLauncherSha256'], PENDING_SHA)

    def test_six_future_pins_remain_pending(self):
        self.assertEqual(PENDING.count('__PENDING_STAGE_B_'), 6)
        self.assertFalse(MAPPING['authorContextInjection'])
        self.assertEqual(MAPPING['status'], 'prepared-only-pending-stage-b')

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

    def test_observation_is_bound_but_not_eligibility(self):
        data = (HERE / 'read-only-observation.json').read_bytes()
        self.assertEqual(hashlib.sha256(data).hexdigest(), MAPPING['observationSha256'])
        observation = json.loads(data)
        self.assertTrue(observation['notLaunchPreflight'])
        self.assertTrue(observation['STOPexists'])
        self.assertEqual(observation['queueCount'], 984)
        self.assertTrue(all(t['queued'] and t['problemRecord'] is None and
                            not t['runIds'] and not t['reservationFileExists'] and
                            not t['portListeners'] for t in observation['targets']))


if __name__ == '__main__':
    unittest.main()
