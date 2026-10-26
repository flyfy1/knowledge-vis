"""Narrow refresh checks only; no Pi access or operator execution."""
import hashlib,json,types,unittest
from pathlib import Path
HERE=Path(__file__).resolve().parent
OLD=HERE.parent/'final-ready'
P=json.loads((HERE/'pins.json').read_bytes());O=json.loads((OLD/'pins.json').read_bytes())
C=json.loads((HERE/'capture-synced.json').read_bytes());T=(HERE/'operate.py').read_text()
M=types.ModuleType('refresh_fixture');exec(compile(T,str(HERE/'operate.py'),'exec'),M.__dict__)

class Refresh(unittest.TestCase):
 def test_only_pin_literal_changes(self):
  original=(OLD/'operate.py').read_text()
  self.assertEqual(hashlib.sha256(original.encode()).hexdigest(),'fd96d5d9398f967863166d56f3c904bf78c81e6046cf367a7e832a1b7c7025b0')
  self.assertEqual(M.PINS_SHA,hashlib.sha256((HERE/'pins.json').read_bytes()).hexdigest())
  self.assertEqual(T.replace(M.PINS_SHA,'94098e2f6d632acbd189d59fb3b522968ce80a914285c213ce478a59bc2a05ff'),original)
 def test_only_central_observation_pin_changes(self):
  self.assertEqual({k for k in P.keys()|O.keys()if P.get(k)!=O.get(k)},{'central'})
  self.assertEqual(P,C['pins']);self.assertEqual(P['central']['head'],'7d87ea225d4409c386bf72f105e01819811a607f')
  self.assertEqual(P['central']['current']['run_id'],'882-author-ca9a8c1069d9')
  self.assertEqual(P['central']['current']['stage'],'author')
  self.assertEqual(P['central']['runner_pid'],1965599);self.assertEqual(P['central']['native_pid'],1972260)
  self.assertEqual(P['central']['session_id'],'01a1757e-8740-7cc1-905a-795be6b769f3')
 def test_payload_and_readiness_unchanged(self):
  self.assertEqual((HERE/'payload-manifest.json').read_bytes(),(OLD/'payload-manifest.json').read_bytes())
  M.ready(P,json.loads((HERE/'payload-manifest.json').read_bytes()))
  M.previous_guard((OLD/'previous-import-receipt.json').read_bytes(),P)
 def test_fresh_projection_and995_preservation(self):
  before=json.loads((OLD/'capture.json').read_bytes())['observation'];o=C['observation']
  for key in ('995_entry','995_runs_sha256','ledger_sha256','queue_sha256','protected_files','payload_paths','reservation_sha256'):self.assertEqual(o[key],before[key])
  self.assertEqual(o['plan_after854_reopen']['next_problem_id'],'854')
  self.assertEqual(o['plan_before']['publication_bound']['upper_bound'],12)
  self.assertEqual(o['plan_after854_reopen']['publication_bound']['upper_bound'],12)
  self.assertTrue(o['854_projected_ineligible'] and o['read_only'] and o['lane_processes_absent'])
  self.assertFalse(o['object_fetch_performed_here'])
 def test_original_artifacts_and_refusal_retained(self):
  for name,digest in json.loads((OLD/'validation.json').read_bytes())['files'].items():self.assertEqual(hashlib.sha256((OLD/name).read_bytes()).hexdigest(),digest)
  root=HERE.parents[3];refusal=json.loads((root/'specs/reviews/854-bridge-adoption-execution-20261026/refusal.json').read_bytes())
  self.assertFalse(refusal['transfer_executed'] or refusal['operator_executed'] or refusal['pi_mutation'])
  self.assertEqual((HERE/'capture.json').read_bytes(),b'');self.assertIn('AssertionError',(HERE/'capture.stderr').read_text())
 def test_exact_fix_start_guard_still_rejects_review(self):
  state={'status':'running','current':{'problem_id':'854','stage':'review','run_id':'new'},'runs':[{'id':'new','problem_id':'854','role':'review','status':'running'}]}
  with self.assertRaises(RuntimeError):M.startup(state,{},set(),True,'854')
  state['current']['stage']='fix';state['runs'][0]['role']='fix'
  self.assertEqual(M.startup(state,{},set(),True,'854'),state['runs'][0])

if __name__=='__main__':unittest.main(verbosity=2)
