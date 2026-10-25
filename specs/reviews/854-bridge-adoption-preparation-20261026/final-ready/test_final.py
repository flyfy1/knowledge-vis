"""Exact final-proposal identity checks plus unchanged local preparation suite.
No SSH, live execution or remote mutation.
"""
import copy,hashlib,importlib.util,json,types,unittest
from pathlib import Path
HERE=Path(__file__).resolve().parent
PINS=json.loads((HERE/'pins.json').read_bytes())
CAPTURE=json.loads((HERE/'capture.json').read_bytes())
TEXT=(HERE/'operate.py').read_text()
MANIFEST=json.loads((HERE/'payload-manifest.json').read_bytes())
M=types.ModuleType('final_adapter_fixture');exec(compile(TEXT,str(HERE/'operate.py'),'exec'),M.__dict__)

class Final(unittest.TestCase):
    def test_exact_two_constant_reverse(self):
        source=(HERE.parent/'operate.py').read_text()
        self.assertEqual(hashlib.sha256(source.encode()).hexdigest(),'0c8f5fcded88f98920cb3e128509889c580082e9fa80c2375bbde3433769728f')
        restored=TEXT.replace("PINS_SHA='"+M.PINS_SHA+"'  # Frozen proposal: independent final review and separate root dispatch required.", 'PINS_SHA=None  # Disabled: source review, push, post-import/live pins and independent review pending.').replace("PREVIOUS_OWNER='"+M.PREVIOUS_OWNER+"'  # Actual completed import; raw receipt hash is pinned.",'PREVIOUS_OWNER=None  # Resolve only from the actual completed996/1000 import receipt.')
        self.assertEqual(restored,source)
        self.assertEqual(M.PINS_SHA,hashlib.sha256((HERE/'pins.json').read_bytes()).hexdigest())

    def test_real_pins_receipt_manifest_and_source_review(self):
        self.assertEqual(PINS,CAPTURE['pins'])
        self.assertEqual((HERE/'payload-manifest.json').read_bytes(),(HERE.parent/'payload-manifest.json').read_bytes())
        self.assertEqual(hashlib.sha256((HERE/'payload-manifest.json').read_bytes()).hexdigest(),PINS['payload_manifest_sha256'])
        M.ready(PINS,MANIFEST)
        receipt=M.previous_guard((HERE/'previous-import-receipt.json').read_bytes(),PINS)
        self.assertEqual(receipt,CAPTURE['previous_receipt'])
        review=PINS['source_review'];self.assertEqual(review['candidate'],'27b9930daf25f9fb1651038bff1605969cb27f01')
        self.assertEqual(review['revision'],PINS['source_push']['head'])
        self.assertEqual(hashlib.sha256(CAPTURE['source_review_report'].encode()).hexdigest(),review['report_sha256'])
        self.assertEqual(CAPTURE['source_review_receipt']['candidate'],review['candidate'])
        self.assertEqual(CAPTURE['source_review_receipt']['files'][review['report_path']],review['report_sha256'])

    def test_old_acceptance_and_observed_ordinary_identity(self):
        e=PINS['accepted']['854'];canonical=lambda v:hashlib.sha256(json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()).hexdigest()
        self.assertEqual(e['entry_sha256'],canonical(e['entry']))
        self.assertEqual(e['runs_sha256'],canonical(CAPTURE['accepted854_runs']))
        self.assertEqual(e['entry']['status'],'accepted_local');self.assertEqual(e['entry']['rounds'],1)
        self.assertEqual(e['entry']['candidate'],'1be3c657ef0c1ef3152f8abced78df2e278f09da')
        o=CAPTURE['observation'];self.assertEqual(PINS['central']['head'],o['head']);self.assertEqual(PINS['central']['current'],o['current'])
        self.assertEqual(PINS['central']['runner_pid'],o['runner_pid']);self.assertEqual(PINS['central']['native_pid'],o['native_pid'])
        self.assertEqual(o['plan_after854_reopen']['next_problem_id'],'854')
        self.assertEqual(o['plan_after854_reopen']['publication_bound']['upper_bound'],11)
        self.assertTrue(o['854_projected_ineligible'] and o['lane_processes_absent'])
        self.assertEqual(o['995_entry']['status'],'changes_required');self.assertEqual(o['995_entry']['phase'],'fix')

    def test_fresh_review_cannot_substitute_for_fix(self):
        before={'status':'stopped','current':None}
        state={'status':'running','current':{'problem_id':'854','stage':'review','run_id':'fresh'},'runs':[{'id':'fresh','problem_id':'854','role':'review','status':'running'}]}
        with self.assertRaises(RuntimeError):M.startup(state,before,set(),True,'854')
        state['current']['stage']='fix';state['runs'][0]['role']='fix'
        self.assertEqual(M.startup(state,before,set(),True,'854'),state['runs'][0])

    def test_object_fetch_evidence_does_not_claim_readonly(self):
        fetch=json.loads((HERE/'source-object-fetch.json').read_bytes())
        self.assertTrue(fetch['operator_exited'] and fetch['object_fetch_performed'] and fetch['source_object_verified'])
        self.assertFalse(fetch['read_only'] or fetch['checkout_or_campaign_mutation_command_performed'])
        self.assertEqual(fetch['fetch_exit'],0);self.assertEqual(fetch['head_before'],fetch['head_after'])
        self.assertEqual(fetch['previous_receipt_sha256'],PINS['previous_receipt_sha256'])
        self.assertTrue(CAPTURE['observation']['read_only']);self.assertFalse(CAPTURE['observation']['object_fetch_performed_here'])

if __name__=='__main__':
    spec=importlib.util.spec_from_file_location('disabled_preparation_checks',HERE.parent/'test_preparation.py')
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    suite=unittest.defaultTestLoader.loadTestsFromModule(module)
    suite.addTests(unittest.defaultTestLoader.loadTestsFromTestCase(Final))
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(not result.wasSuccessful())
