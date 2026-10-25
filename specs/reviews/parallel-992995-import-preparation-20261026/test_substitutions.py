"""Static import-template substitution checks; never execute an operator."""
import ast
import hashlib
import json
from pathlib import Path
import unittest

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
MAP = json.loads((HERE / 'parameter-map.json').read_text())
SOURCE = (ROOT / MAP['source']).read_text()
TEMPLATE = (HERE / 'operate.py').read_text()


def reverse(candidate):
    assert hashlib.sha256(SOURCE.encode()).hexdigest() == MAP['sourceSha256']
    assert len(MAP['substitutions']) == MAP['actualParameterSubstitutionCount']
    for item in reversed(MAP['substitutions']):
        assert candidate.count(item['to']) == 1
        candidate = candidate.replace(item['to'], item['from'])
    assert candidate == SOURCE
    assert ast.dump(ast.parse(candidate)) == ast.dump(ast.parse(SOURCE))


class Substitutions(unittest.TestCase):
    def test_exact_reverse_and_unchanged_helper(self):
        reverse(TEMPLATE)
        self.assertEqual(hashlib.sha256(TEMPLATE.encode()).hexdigest(), MAP['operatorSha256'])
        self.assertEqual(hashlib.sha256((ROOT / MAP['helperSource']).read_bytes()).hexdigest(), MAP['helperSha256'])

    def test_pending_identities_are_not_acceptance_pins(self):
        pins = json.loads((HERE / 'pending-pins.json').read_text())
        self.assertEqual(pins['status'], 'pending-acceptance-capture')
        self.assertEqual(pins['ids'], ['992', '995'])
        self.assertEqual(pins['lanes'], {'992': None, '995': None})
        self.assertIsNone(pins['central'])
        self.assertIsNone(pins['release'])
        self.assertIn('PINS_SHA=None', TEMPLATE)
        self.assertEqual(pins['lane_base'], MAP['laneBase'])

    def test_stop_partial_import_and_resume_edits_refuse(self):
        for before, after in [
            ('restore_if_absent(stop_raw)', 'pass'),
            ('preserve_reservations(res_before,reservations(STATE),imported)', 'pass'),
            ('op.owned_stop(stop_raw);op.boundary_guard();op.hashes_unchanged()', 'op.boundary_guard()'),
            ("require(evidence is not None,'Fresh run/thread/turn/native proof absent')", 'pass'),
            ('op.verify_registered_resume(after,resumed,head,plan,fresh)', '{}'),
            ('initial_guard(op,pre_stop,central)', 'pass'),
        ]:
            self.assertIn(before, TEMPLATE)
            with self.subTest(before=before), self.assertRaises(AssertionError):
                reverse(TEMPLATE.replace(before, after))

    def test_publication_bound_and_hash_guard_edits_refuse(self):
        for before, after in [
            ('op.resume_plan(latest,op.read(STATE/\'releases.json\'),incoming=IDS)', '{}'),
            ('pins_ready(pins)', 'None'),
            ('op.hashes_unchanged()  # Includes importer: check before executing runtime Python.', 'pass'),
            ("op.REOPEN_IDS=()", "op.REOPEN_IDS=('843',)"),
        ]:
            self.assertIn(before, TEMPLATE)
            with self.subTest(before=before), self.assertRaises(AssertionError):
                reverse(TEMPLATE.replace(before, after))

    def test_observed_reservation_base_matches_both_targets(self):
        observed = json.loads((HERE / 'reservation-observation.json').read_text())
        self.assertTrue(observed['readOnly'] and observed['notAcceptancePins'])
        self.assertEqual(observed['queueLength'], 984)
        for pid in MAP['targetIds']:
            record = observed['reservations'][pid]['reservation']
            self.assertEqual(record['base'], MAP['laneBase'])
            self.assertFalse(record['publication_enabled'])
            self.assertEqual(record['id'], pid)


if __name__ == '__main__':
    unittest.main(verbosity=2)
