"""Local frozen-proposal identity checks; never execute the operator."""
import ast
import gzip
import hashlib
import json
from pathlib import Path
import unittest

HERE = Path(__file__).resolve().parent
sha = lambda raw: hashlib.sha256(raw).hexdigest()
CAPTURE = json.loads((HERE / 'capture.json').read_bytes())
PINS = json.loads((HERE / 'pins.json').read_bytes())


class FinalReady(unittest.TestCase):
    def test_only_pins_constant_enabled(self):
        source = (HERE.parent / 'operate.py').read_text()
        self.assertEqual(sha(source.encode()), 'e75a434a0829b46b3233d34a03f78094453ec6c02b47cbab0df0b8bb2eca101a')
        replacement = 'PINS_SHA=' + repr(sha((HERE / 'pins.json').read_bytes()))
        actual = (HERE / 'operate.py').read_text()
        self.assertEqual(actual, source.replace('PINS_SHA=None', replacement))
        self.assertEqual(ast.dump(ast.parse(actual.replace(replacement, 'PINS_SHA=None'))), ast.dump(ast.parse(source)))
        self.assertEqual(sha((HERE.parent / 'pending-pins.json').read_bytes()), 'f8d059331391db8c734ca26fcecf3d6112754311e6092d99a26082e571d39567')

    def test_actual_capture_reports_histories_and_tree_identity(self):
        self.assertEqual(PINS, CAPTURE['pins'])
        self.assertEqual(PINS['status'], 'frozen-accepted-pair')
        for pid in ['992', '995']:
            frozen = PINS['lanes'][pid]
            archive = CAPTURE['archives'][pid]
            state = json.loads(gzip.decompress((HERE / (pid + '-completed-progress.json.gz')).read_bytes()))
            self.assertEqual(state, archive['progress'])
            self.assertEqual(state['problems'][pid], frozen['entry'])
            self.assertEqual(state['status'], 'completed')
            self.assertIsNone(state['current'])
            self.assertTrue(all(run['status'] == 'completed' for run in state['runs']))
            self.assertEqual(frozen['entry']['reviews'][-1]['required_open'], [])
            self.assertEqual(frozen['head'], frozen['entry']['registration_commit'])
            self.assertEqual(frozen['head'], archive['remoteRegistration'])
            self.assertEqual(len(set(archive['lessonTrees'].values())), 1)
            report = HERE / Path(archive['reportPath']).name
            self.assertEqual(sha(report.read_bytes()), frozen['report_sha256'])

    def test_actual_ordinary_native_and_publication_bound(self):
        observed = CAPTURE['observation']
        self.assertEqual(observed['head'], PINS['central']['head'])
        self.assertEqual(observed['current'], PINS['central']['current'])
        self.assertEqual(observed['current'], observed['native_proof']['current'])
        self.assertEqual(observed['current']['problem_id'], '864')
        self.assertEqual(observed['native_proof']['native_codex_pids'], [1805108])
        self.assertEqual(observed['central_runner_pid'], 1774575)
        self.assertTrue(observed['read_only'] and observed['lane_processes_absent'] and observed['lane_base_same_shared'])
        self.assertEqual(observed['allowed_dirty_scope']['prefix'], 'leetcode/864/')
        bound = observed['resume_plan']['publication_bound']
        self.assertEqual(bound['incoming'], ['992', '995'])
        self.assertEqual(len(bound['eligible']), 5)
        self.assertEqual(bound['upper_bound'], 7)
        self.assertLess(bound['upper_bound'], 20)
        self.assertEqual(observed['ledger_sha256'], PINS['release']['ledger_sha256'])

    def test_capture_hash_order_and_no_direct_mutation_calls(self):
        source = (HERE / 'capture-readonly.py').read_text()
        self.assertLess(source.index("for path,digest in pins['policy'].items()"), source.index('import import_leetcode_lane as imp'))
        self.assertLess(source.index('assert sha(helper_source.encode())'), source.index('exec(helper_source,helper.__dict__)'))
        for node in ast.walk(ast.parse(source)):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
                self.assertNotIn(node.func.attr, ['write_text', 'write_bytes', 'mkdir', 'unlink', 'save', 'import_lane', 'Popen', 'kill', 'terminate'])


if __name__ == '__main__':
    unittest.main(verbosity=2)
