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
        self.assertEqual(TEMPLATE.count('__PENDING_IMPORT982987_'), 6)
        self.assertIn("base='__PENDING_IMPORT982987_BASE__'", PREFLIGHT)
        self.assertEqual(MAP['status'], 'pending-982987-import-completion-not-launch-ready')
        self.assertFalse(MAP['authorContextInjection'])

    def test_targets_and_policy(self):
        self.assertEqual([(t['id'], t['port']) for t in MAP['targets']], [('992',18797),('995',18798)])
        self.assertIn("plan=[('992',18797),('995',18798)]", TEMPLATE)
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

    def test_preflight_hash_order_and_phase_ownership(self):
        ast.parse(PREFLIGHT)
        self.assertEqual(hashlib.sha256(PREFLIGHT.encode()).hexdigest(), MAP['pendingPreflightSha256'])
        self.assertIn(MAP['approvedImportPinsPath'].split('/leetcode-hard-campaign-state-20261018/')[1], PREFLIGHT)
        self.assertIn("receipt['ordinary_resume_proof']['agent_candidate']==base", PREFLIGHT)
        self.assertIn("'--untracked-files=all'", PREFLIGHT)
        self.assertIn("line.startswith('?? ')", PREFLIGHT)
        pins = PREFLIGHT.index("assert pins_sha=='0d9dec18554ed18154ac5b4137371b08382bd217c290149fd048a46987387a01'")
        runtime = PREFLIGHT.index("for name,digest in approved_pins['policy'].items():")
        imports = PREFLIGHT.index('spec.loader.exec_module(m)')
        self.assertLess(pins, runtime)
        self.assertLess(runtime, imports)
        static_commit = PREFLIGHT.index("'cat-file','-e',approved_pins['lane_base']+'^{commit}'")
        static_blob = PREFLIGHT.index("'show',approved_pins['lane_base']+':'+static_path")
        self.assertLess(runtime, static_commit)
        self.assertLess(static_commit, static_blob)
        self.assertLess(static_blob, imports)
        self.assertNotIn(MAP['approvedImportOperatorSource'], PREFLIGHT)
        correction = json.loads((HERE/'static-source-correction.json').read_text())
        self.assertEqual(correction['knownFailure']['exit'], 128)
        self.assertEqual(correction['commitExistsExit'], 0)
        self.assertEqual(correction['blobReadExit'], 0)
        self.assertEqual(correction['blobSha256'], correction['expectedSha256'])
        self.assertEqual(correction['staticSourceRevision'], MAP['staticDependencySourceRevision'])
        self.assertIn("allowed_fix='leetcode/'+current['problem_id']+'/'", PREFLIGHT)
        self.assertIn("current['stage'] in ('author','fix','review')", PREFLIGHT)
        self.assertIn("run['status']=='running'", PREFLIGHT)
        self.assertIn("assert receipt['pushed_head']==base", PREFLIGHT)
        self.assertIn("'completed-resumed'", PREFLIGHT)
        self.assertIn('Own only\nleetcode/<id>/ and tests/evidence inside it.', (REPO/'scripts/campaign-prompts/fix.md').read_text())

    def test_bounded_observation_not_eligibility(self):
        raw = (HERE/'read-only-observation.json').read_bytes()
        self.assertEqual(hashlib.sha256(raw).hexdigest(), MAP['observationSha256'])
        observed = json.loads(raw)
        self.assertTrue(observed['notLaunchEligibility'])
        self.assertTrue(observed['STOPexists'])
        self.assertEqual(len(observed['reservations']), 39)
        self.assertFalse(observed['allPriorReservationsImported'])
        self.assertEqual({r['id'] for r in observed['reservations'] if r['status'] != 'imported'}, {'982','987'})
        self.assertEqual(observed['importReceiptStatus'], 'waiting-for-natural-boundary')
        self.assertEqual(observed['queueLength'], 984)
        for t in observed['targets']:
            self.assertIsNotNone(t['queueIndex'])
            self.assertIsNone(t['problemRecord'])
            self.assertTrue(t['bindAvailable'])
            self.assertFalse(any(t[k] for k in ['runIds','runDirectories','matchingReservations','lessonExists','repoExists','stateExists','branchExists','portListeners']))


if __name__ == '__main__':
    unittest.main()
