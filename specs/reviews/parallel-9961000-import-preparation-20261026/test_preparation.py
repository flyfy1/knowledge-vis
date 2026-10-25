"""Local preparation checks; never execute an operator or access Pi."""
import ast
import hashlib
import json
from pathlib import Path
import types
import unittest
from unittest.mock import patch

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
MAP = json.loads((HERE / 'parameter-map.json').read_text())
SOURCE = (ROOT / MAP['source']).read_text()
TEXT = (HERE / 'operate.py').read_text()
RAW_PINS = (HERE / 'pending-pins.json').read_bytes()
PINS = json.loads(RAW_PINS)


def reverse(text):
    for item in reversed(MAP['substitutions']):
        assert text.count(item['to']) == 1
        text = text.replace(item['to'], item['from'])
    assert text == SOURCE
    assert ast.dump(ast.parse(text)) == ast.dump(ast.parse(SOURCE))


def module():
    result = types.ModuleType('disabled_preparation_fixture')
    exec(compile(TEXT, str(HERE / 'operate.py'), 'exec'), result.__dict__)
    return result


class Preparation(unittest.TestCase):
    def test_exact_four_substitution_reversal(self):
        self.assertEqual(len(MAP['substitutions']), 4)
        self.assertEqual(hashlib.sha256(SOURCE.encode()).hexdigest(), MAP['sourceSha256'])
        self.assertEqual(hashlib.sha256(TEXT.encode()).hexdigest(), MAP['operatorSha256'])
        reverse(TEXT)

    def test_helper_and_policy_unchanged(self):
        self.assertEqual(hashlib.sha256((ROOT / MAP['helperSource']).read_bytes()).hexdigest(), MAP['helperSha256'])
        old = json.loads((ROOT / MAP['source']).with_name('pending-pins.json').read_text())
        for key in ('policy', 'queue_sha256', 'launcher_sha256'):
            self.assertEqual(PINS[key], old[key])
        self.assertIn('op.REOPEN_IDS=()', TEXT)

    def test_all_acceptance_and_head_pins_pending(self):
        self.assertEqual(PINS['ids'], ['996', '1000'])
        self.assertEqual(PINS['lanes'], {'996': None, '1000': None})
        for key in ('lane_base', 'central', 'release'):
            self.assertIsNone(PINS[key])
        self.assertEqual(PINS['status'], 'pending-acceptance-capture')

    def test_disabled_main_refuses_before_any_input_read(self):
        m = module()
        self.assertIsNone(m.PINS_SHA)
        with patch.object(Path, 'read_bytes', side_effect=AssertionError('input read reached')) as read, patch.object(m, 'execute', side_effect=AssertionError('mutation reached')) as execute:
            with self.assertRaisesRegex(RuntimeError, 'Preparation only'):
                m.main(['--dispatch', m.DISPATCH, '--pins', '/unused-pins', '--helper', '/unused-helper'])
            read.assert_not_called()
            execute.assert_not_called()

    def test_pending_schema_refuses_before_helper_import(self):
        m = module()
        m.PINS_SHA = hashlib.sha256(RAW_PINS).hexdigest()  # In-memory fixture only.
        with patch.object(Path, 'read_bytes', return_value=RAW_PINS) as read, patch.object(m.importlib.util, 'spec_from_file_location', side_effect=AssertionError('helper import reached')) as loader, patch.object(m, 'execute', side_effect=AssertionError('mutation reached')) as execute:
            with self.assertRaisesRegex(RuntimeError, 'Acceptance pins are not frozen'):
                m.main(['--dispatch', m.DISPATCH, '--pins', '/unused-pins', '--helper', '/unused-helper'])
            self.assertEqual(read.call_count, 1)
            loader.assert_not_called()
            execute.assert_not_called()

    def test_control_flow_changes_fail_reversal(self):
        for old, new in [
            ('restore_if_absent(stop_raw)', 'pass'),
            ('initial_guard(op,pre_stop,central)', 'pass'),
            ('op.hashes_unchanged()  # Includes importer: check before executing runtime Python.', 'pass'),
            ('op.REOPEN_IDS=()', "op.REOPEN_IDS=('995',)"),
            ('preserve_reservations(res_before,reservations(STATE),imported)', 'pass'),
        ]:
            with self.subTest(old=old), self.assertRaises(AssertionError):
                reverse(TEXT.replace(old, new))


if __name__ == '__main__':
    unittest.main(verbosity=2)
