"""Static template checks only: never import/execute a launcher or preflight."""
import ast
import hashlib
import json
from pathlib import Path
import unittest

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]
MAP = json.loads((HERE/'parameter-map.json').read_text())
SOURCE = (REPO/MAP['source']).read_text()
TEMPLATE = (HERE/'launch.py').read_text()
PREFLIGHT = (HERE/'preflight.py').read_text()


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
        self.assertEqual(hashlib.sha256(TEMPLATE.encode()).hexdigest(), MAP['launcherSha256'])

    def test_completed_receipt_and_resolved_pins(self):
        self.assertNotIn('__PENDING_', TEMPLATE)
        self.assertNotIn('__PENDING_', PREFLIGHT)
        self.assertEqual(len(MAP['resolvedPins']), 6)
        self.assertFalse(MAP['authorContextInjection'])
        self.assertEqual(hashlib.sha256(PREFLIGHT.encode()).hexdigest(), MAP['preflightScriptSha256'])
        p = json.loads((HERE/'preflight.json').read_text())
        self.assertEqual(p['982987_import_receipt']['status'], 'completed-resumed')
        self.assertEqual(p['982987_import_receipt']['pushed_head'], p['base'])
        self.assertEqual(p['base'], MAP['immutableBase'])
        self.assertEqual(p['982987_import_receipt']['ordinary_resume_proof']['agent_candidate'], p['base'])
        self.assertNotEqual(p['central_current']['run_id'], p['982987_import_receipt']['fresh_agent']['current']['run_id'])
        self.assertEqual(p['central_current']['stage'], 'author')
        self.assertEqual(p['central_current']['problem_id'], '857')
        self.assertEqual(list(MAP['resolvedPins'].values()), [p['base'],p['central_head'],p['central_current']['run_id'],p['central_current']['problem_id'],p['central_current']['stage'],p['central_session']])

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
        self.assertIn("allowed_fix='leetcode/'+current['problem_id']+'/'", PREFLIGHT)
        self.assertIn("current['stage'] in ('author','fix','review')", PREFLIGHT)
        self.assertIn("assert receipt['pushed_head']==base", PREFLIGHT)
        self.assertIn("'completed-resumed'", PREFLIGHT)
        self.assertIn('Own only\nleetcode/<id>/ and tests/evidence inside it.', (REPO/'scripts/campaign-prompts/fix.md').read_text())

    def test_final_preflight_binding(self):
        raw = (HERE/'preflight.json').read_bytes()
        self.assertEqual(hashlib.sha256(raw).hexdigest(), MAP['preflightSha256'])
        p = json.loads(raw)
        self.assertFalse(p['stop_exists'])
        self.assertEqual(len(p['reservations']), 39)
        self.assertTrue(all(r['status']=='imported' for r in p['reservations']))
        self.assertEqual(p['queue_length'], 984)
        self.assertEqual(len(p['campaign_workers']), 1)
        self.assertGreater(p['mem_available_kib'], 1048576)
        self.assertTrue(p['shared_tree_matches_base'])
        self.assertEqual(p['central_native']['pid'], MAP['centralNativePid'])
        self.assertEqual(p['central_runner_pid'], MAP['centralRunnerPid'])
        self.assertEqual(p['allowed_dirty_scope']['stage'], 'author')
        self.assertTrue(p['allowed_dirty_scope']['trackedChangesAllowedWithinPrefix'])
        self.assertEqual(p['allowed_dirty_scope']['prefix'], 'leetcode/857/')
        self.assertTrue(all(line[3:].startswith('leetcode/857/') and ' -> ' not in line for line in p['current_phase_worktree_paths']))
        for target in p['targets']:
            self.assertTrue(target['in_queue'] and target['bind_available'])
            self.assertIsNone(target['problem_record'])
            self.assertFalse(any(target[k] for k in ['runs','reservation_exists','repo_exists','state_exists','branch_exists','port_listeners']))


if __name__ == '__main__':
    unittest.main()
