"""Parameter-only refresh tests; never execute a launcher or contact Pi."""
import ast,hashlib,json
from pathlib import Path
import unittest
P=Path(__file__).resolve().parent
L=(P/'launch.py').read_text();O=json.loads((P/'preflight.json').read_text())
class Refresh(unittest.TestCase):
 def test_exact_five_changes_reversible(self):
  text=L;changes=json.loads((P/'substitutions.json').read_text());self.assertEqual(len(changes),5)
  for a,b in reversed(changes):self.assertEqual(text.count(b),1);text=text.replace(b,a)
  self.assertEqual(text,(P.parent/'launch.py').read_text());ast.parse(L)
 def test_preflight_unchanged(self):
  self.assertEqual((P/'preflight.py').read_bytes(),(P.parent/'preflight.py').read_bytes())
  self.assertEqual(hashlib.sha256((P/'preflight.py').read_bytes()).hexdigest(),'d14d4e15b4fa53ff8a384b01e8a351d7e178af328bf5291cfdc7458c4c7e09be')
 def test_exact_live_identity(self):
  for key,value in [('central_head','cf1a31fc75c66ca79e54513e050b7e0ba31b6e70'),('central_session','01a17555-5f63-7560-97fa-cc0c74925f3f')]:self.assertEqual(O[key],value);self.assertIn(value,L)
  self.assertEqual(O['central_current']['run_id'],'878-author-004c6e7e9e78');self.assertEqual(O['central_current']['stage'],'author');self.assertEqual(O['central_current']['problem_id'],'878')
  self.assertEqual(O['central_runner_pid'],1865819);self.assertEqual(O['central_native']['pid'],1869815)
 def test_base_receipt_policy_unchanged(self):
  old=json.loads((P.parent/'preflight.json').read_text())
  for k in ['base','995_queued_handoff_receipt_sha256','approved_995_queued_handoff_pins_sha256','verified_policy_before_import','verified_static_dependency_sha256']:self.assertEqual(O[k],old[k])
  self.assertIn("BASE='6c68b23cc306067de5a912195a3c7edeebc2a0be'",L)
 def test_target_readiness(self):
  self.assertEqual(len(O['campaign_workers']),1);self.assertTrue(O['shared_tree_matches_base']);self.assertFalse(O['stop_exists']);self.assertGreater(O['mem_available_kib'],1048576)
  self.assertEqual([(t['id'],t['port']) for t in O['targets']],[('996',18799),('1000',18800)])
  for t in O['targets']:
   self.assertTrue(t['bind_available'] and t['in_queue']);self.assertFalse(any(t[k]for k in ['problem_record','runs','reservation_exists','repo_exists','state_exists','branch_exists','port_listeners']))
 def test_safe_launch_controls_retained(self):
  for s in ["validate(count)","['nice','-n','10'","'--max-rounds','6'","publication_enabled=False","assert '--publish-root' not in args and '--public-base' not in args"]:self.assertIn(s,L)
  self.assertTrue(O['no_mutation']);self.assertEqual(O['allowed_dirty_scope']['prefix'],'leetcode/878/')
if __name__=='__main__':unittest.main(verbosity=2)
