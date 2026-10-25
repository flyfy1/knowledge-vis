"""Static reversal and local disabled-gate checks; no runtime modules or Pi access."""
import ast
import hashlib
import json
from pathlib import Path
import unittest

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
MAP = json.loads((HERE / 'parameter-map.json').read_text())
LAUNCH = (HERE / 'launch.pending.py').read_text()
PREFLIGHT = (HERE / 'preflight.pending.py').read_text()
GUARD = MAP['disableLine']


def strip_disabled(text):
    assert text.count(GUARD) == 1
    tree = ast.parse(text)
    assert isinstance(tree.body[0], ast.Expr) and isinstance(tree.body[0].value, ast.Constant)
    assert isinstance(tree.body[1], ast.Raise)
    return text.replace(GUARD, '', 1)


def reverse_launch(text):
    body = strip_disabled(text)
    for item in reversed(MAP['operationalBodyParameterSubstitutions']):
        assert body.count(item['to']) == 1
        body = body.replace(item['to'], item['from'])
    source = (ROOT / MAP['source']).read_text()
    assert hashlib.sha256(source.encode()).hexdigest() == MAP['sourceSha256']
    assert body == source and ast.dump(ast.parse(body)) == ast.dump(ast.parse(source))


class Templates(unittest.TestCase):
    def test_launcher_parameter_body_reversal_and_hash(self):
        reverse_launch(LAUNCH)
        self.assertEqual(len(MAP['operationalBodyParameterSubstitutions']), 9)
        self.assertEqual(hashlib.sha256(LAUNCH.encode()).hexdigest(), MAP['pendingLauncherSha256'])

    def test_preflight_exact_declared_adaptation(self):
        body = strip_disabled(PREFLIGHT)
        for item in reversed(MAP['preflightSubstitutions']):
            self.assertIn(item['to'], body)
            body = body.replace(item['to'], item['from'])
        source = (ROOT / MAP['preflightSource']).read_text()
        self.assertEqual(hashlib.sha256(source.encode()).hexdigest(), MAP['preflightSourceSha256'])
        self.assertEqual(body, source)
        self.assertEqual(hashlib.sha256(PREFLIGHT.encode()).hexdigest(), MAP['pendingPreflightSha256'])

    def test_disabled_gate_precedes_imports_and_file_access(self):
        def prohibited(*args, **kwargs):
            raise AssertionError('Disabled template reached an import or file operation')
        for source in [LAUNCH, PREFLIGHT]:
            strip_disabled(source)
            with self.assertRaisesRegex(RuntimeError, 'Disabled preparation'):
                exec(compile(source, '<disabled-template-test>', 'exec'),
                     {'__builtins__': {'RuntimeError': RuntimeError,
                                      '__import__': prohibited, 'open': prohibited}})

    def test_future_identities_unresolved(self):
        self.assertEqual(LAUNCH.count('__PENDING_IMPORT992995_'), 6)
        self.assertTrue(all(value is None for value in MAP['finalRuntimePins'].values()))
        for key in ['futureImportOperatorSha256', 'futureExternalPinsPath',
                    'futureExternalPinsSha256', 'futureReceiptSha256']:
            self.assertIsNone(MAP[key])
        self.assertIn("base='__PENDING_IMPORT992995_BASE__'", PREFLIGHT)
        self.assertIn("pins_path=pathlib.Path('__PENDING_IMPORT992995_PINS_PATH__')", PREFLIGHT)
        self.assertIn(MAP['futureImportOwner'] + '.json', PREFLIGHT)
        self.assertIn("receipt['status']=='completed-resumed'", PREFLIGHT)
        self.assertIn("receipt['pushed_head']==base", PREFLIGHT)
        self.assertFalse(MAP['authorContextInjection'])

    def test_runtime_hashes_before_import_and_original_scope_guards(self):
        pins = PREFLIGHT.index("assert pins_sha=='__PENDING_IMPORT992995_PINS_SHA256__'")
        policy = PREFLIGHT.index("for name,digest in approved_pins['policy'].items():")
        static = PREFLIGHT.index("'show',approved_pins['lane_base']+':'+static_path")
        module = PREFLIGHT.index('spec.loader.exec_module(m)')
        self.assertLess(pins, policy)
        self.assertLess(policy, static)
        self.assertLess(static, module)
        for fragment in ["'--untracked-files=all'", "line.startswith('?? ')",
                         "allowed_author='leetcode/'+current['problem_id']+'/'",
                         "allowed_fix='leetcode/'+current['problem_id']+'/'",
                         "m.same_shared(repo,base,head)", "run['status']=='running'"]:
            self.assertIn(fragment, PREFLIGHT)
        self.assertIn('/cwd', PREFLIGHT)
        self.assertIn("pathlib.Path(run['directory'])", PREFLIGHT)

    def test_guard_weakening_refused_by_reversal(self):
        for before, after in [
            (GUARD, ''),
            (" and not (STATE/'STOP').exists()", ''),
            ("assert read(p).get('status')=='imported',p", 'pass'),
            ("'--max-rounds','6'", "'--max-rounds','6','--publish-root','/tmp/public'"),
        ]:
            with self.subTest(before=before), self.assertRaises(AssertionError):
                reverse_launch(LAUNCH.replace(before, after))

    def test_targets_policy_and_execution_body_unchanged(self):
        self.assertEqual([(x['id'], x['port']) for x in MAP['targets']], [('996', 18799), ('1000', 18800)])
        self.assertIn("plan=[('996',18799),('1000',18800)]", LAUNCH)
        for source in [LAUNCH, PREFLIGHT]:
            self.assertIn(MAP['policySha256'], source)
        self.assertIn("validate(count)", LAUNCH)
        self.assertIn("['nice','-n','10'", LAUNCH)

    def test_bounded_readonly_observation(self):
        raw = (HERE / 'read-only-observation.json').read_bytes()
        self.assertEqual(hashlib.sha256(raw).hexdigest(), MAP['observationSha256'])
        obs = json.loads(raw)
        self.assertTrue(obs['readOnly'] and obs['notLaunchEligibility'])
        self.assertFalse(obs['futureReceiptExists'])
        self.assertEqual(obs['queueLength'], 984)
        self.assertEqual([x['queueIndex'] for x in obs['targets']], [207, 208])
        for target in obs['targets']:
            self.assertIsNone(target['record'])
            self.assertTrue(target['bindAvailable'])
            self.assertFalse(any(target[k] for k in ['runIds', 'runDirectories',
                'matchingReservations', 'lessonExists', 'repoExists', 'stateExists', 'branchExists', 'listeners']))


if __name__ == '__main__':
    unittest.main(verbosity=2)
