"""Static template checks only: never import/execute a launcher or preflight."""
import ast
import hashlib
import json
from pathlib import Path
import unittest

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
MAP = json.loads((HERE/'parameter-map.json').read_text())
SOURCE = (REPO/MAP['source']).read_text()
TEMPLATE = (HERE/'launch.pending.py').read_text()
PREFLIGHT = (HERE/'preflight.pending.py').read_text()


def reverse_validate(candidate):
    assert hashlib.sha256(SOURCE.encode()).hexdigest() == MAP['sourceSha256']
    assert len(MAP['substitutions']) == MAP['actualParameterSubstitutionCount']
    restored = candidate
    for change in reversed(MAP['substitutions']):
        assert change['from'] != change['to'] and restored.count(change['to']) == 1
        restored = restored.replace(change['to'], change['from'])
    assert restored == SOURCE
    assert ast.dump(ast.parse(restored)) == ast.dump(ast.parse(SOURCE))
    ast.parse(candidate)


class TemplateChecks(unittest.TestCase):
    def test_exact_parameter_reversal(self):
        reverse_validate(TEMPLATE)
        self.assertEqual(hashlib.sha256(TEMPLATE.encode()).hexdigest(), MAP['pendingLauncherSha256'])

    def test_pending_not_future_pins(self):
        self.assertEqual(TEMPLATE.count('__PENDING_843_'), 6)
        self.assertIn("base='__PENDING_843_ADOPTION_BASE__'", PREFLIGHT)
        self.assertEqual(MAP['status'], 'pending-843-handoff-completion-not-launch-ready')
        self.assertFalse(MAP['authorContextInjection'])

    def test_targets_and_policy(self):
        self.assertEqual([(t['id'], t['port']) for t in MAP['targets']], [('982',18795),('987',18796)])
        self.assertIn("plan=[('982',18795),('987',18796)]", TEMPLATE)
        self.assertIn(MAP['policySha256'], TEMPLATE)
        self.assertIn(MAP['policySha256'], PREFLIGHT)

    def test_stop_waiver_refused(self):
        with self.assertRaises(AssertionError):
            reverse_validate(TEMPLATE.replace(" and not (STATE/'STOP').exists()", ''))

    def test_prior_import_gate_waiver_refused(self):
        with self.assertRaises(AssertionError):
            reverse_validate(TEMPLATE.replace("assert read(p).get('status')=='imported',p", 'pass'))

    def test_publication_addition_refused(self):
        with self.assertRaises(AssertionError):
            reverse_validate(TEMPLATE.replace("'--max-rounds','6'", "'--max-rounds','6','--publish-root','/tmp/public'"))

    def test_preflight_hash_order_and_fix_ownership(self):
        ast.parse(PREFLIGHT)
        pins = PREFLIGHT.index("assert pins_sha=='1ddd6bf0460798971b109465d8fe8ee95644479fe003fcd5ccd50d7fc18670e4'")
        runtime = PREFLIGHT.index("for name,digest in approved_pins['policy'].items():")
        imports = PREFLIGHT.index('spec.loader.exec_module(m)')
        self.assertLess(pins, runtime)
        self.assertLess(runtime, imports)
        self.assertIn("allowed_fix='leetcode/'+current['problem_id']+'/'", PREFLIGHT)
        self.assertIn("current['problem_id']=='843' and current['stage']=='fix'", PREFLIGHT)
        self.assertIn("assert receipt['head']==base", PREFLIGHT)
        self.assertIn("'completed-fresh843fix-running'", PREFLIGHT)
        self.assertIn('Own only\nleetcode/<id>/ and tests/evidence inside it.', (REPO/'scripts/campaign-prompts/fix.md').read_text())

    def test_bounded_observation_not_eligibility(self):
        raw = (HERE/'read-only-observation.json').read_bytes()
        self.assertEqual(hashlib.sha256(raw).hexdigest(), MAP['observationSha256'])
        observed = json.loads(raw)
        self.assertTrue(observed['notLaunchEligibility'])
        self.assertTrue(observed['STOPexists'])
        self.assertEqual(len(observed['reservations']), 37)
        self.assertTrue(observed['allPriorReservationsImported'])
        self.assertEqual(observed['queueLength'], 984)
        for t in observed['targets']:
            self.assertIsNotNone(t['queueIndex'])
            self.assertIsNone(t['problemRecord'])
            self.assertTrue(t['bindAvailable'])
            self.assertFalse(any(t[k] for k in ['runIds','runDirectories','matchingReservations','lessonExists','repoExists','stateExists','branchExists','portListeners']))


if __name__ == '__main__':
    unittest.main()
