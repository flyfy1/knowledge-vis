"""Final constant-only adaptation checks; local disposable fixtures only."""
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import unittest
HERE=Path(__file__).resolve().parent

def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);return module
base=load('reviewed995tests',HERE.parent/'test_operate.py')
final=load('final995',HERE/'operate.py')
base.op=final
Guards=base.Guards
Adoption=base.Adoption

class FinalBinding(unittest.TestCase):
    def test_only_two_constants_changed(self):
        original=(HERE.parent/'operate.py').read_text()
        text=(HERE/'operate.py').read_text()
        restored=text.replace('PINS_SHA='+repr(final.PINS_SHA),'PINS_SHA=None').replace('PREVIOUS_OWNER='+repr(final.PREVIOUS_OWNER),"PREVIOUS_OWNER='PENDING_COMPLETED_992995_IMPORT_OWNER'")
        self.assertEqual(restored,original)
        self.assertEqual(hashlib.sha256((HERE/'pins.json').read_bytes()).hexdigest(),final.PINS_SHA)
    def test_actual_completed_receipt_schema_and_request_source(self):
        pins=json.loads((HERE/'pins.json').read_text())
        receipt=final.previous_guard((HERE/'previous-import-receipt.json').read_bytes(),pins)
        self.assertEqual(receipt['pushed_head'],pins['capture']['head'])
        self.assertTrue(all(item['status']=='completed' for item in receipt['imports']))
        raw=subprocess.check_output(['git','show',pins['source_revision']+':'+final.REQUEST],cwd=base.ROOT)
        final.payload_guard({final.REQUEST:raw},pins)
    def test_actual_projection_preserves_order_and_ineligibility(self):
        evidence=json.loads((HERE/'runtime-readonly-observation.json').read_text())
        self.assertTrue(evidence['995_projected_ineligible'])
        self.assertTrue(evidence['queue_preserved_by_projection'])
        self.assertTrue(evidence['995_unpublished'])
        self.assertEqual(evidence['resume_plan_after_queued_reopen']['next_problem_id'],'864')
        self.assertEqual(evidence['resume_plan_after_queued_reopen']['publication_bound']['upper_bound'],7)
        self.assertNotIn('995',evidence['resume_plan_after_queued_reopen']['publication_bound']['eligible'])
        pins=json.loads((HERE/'pins.json').read_text())
        self.assertEqual(base.load('history_guard',base.CAMPAIGN).canonical(evidence['imported995_runs']),pins['accepted']['995']['runs_sha256'])

if __name__=='__main__':unittest.main(verbosity=2)
