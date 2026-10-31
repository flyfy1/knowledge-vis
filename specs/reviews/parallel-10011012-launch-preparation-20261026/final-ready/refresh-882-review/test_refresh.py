"""Focused local observation-refresh checks; no runtime execution."""
from pathlib import Path
import ast,gzip,hashlib,json,unittest
P=Path(__file__).resolve().parent;M=json.loads((P/'substitutions.json').read_text());O=json.loads((P/'preflight-summary.json').read_text());L=(P/'launch.py').read_text();SOURCE=P.parent/'refresh-854-review'
class Refresh(unittest.TestCase):
 def test_four_substitutions_only(self):
  self.assertEqual(len(M['substitutions']),4);s=L
  for c in reversed(M['substitutions']):self.assertEqual(s.count(c['to']),1);s=s.replace(c['to'],c['from'])
  original=(SOURCE/'launch.py').read_text();self.assertEqual(s,original);self.assertEqual(ast.dump(ast.parse(s)),ast.dump(ast.parse(original)));self.assertEqual(hashlib.sha256(original.encode()).hexdigest(),M['sourceLaunchSha256']);self.assertEqual(hashlib.sha256(L.encode()).hexdigest(),M['launchSha256'])
 def test_preflight_unchanged_and_raw_evidence(self):
  self.assertEqual((P/'preflight.py').read_bytes(),(SOURCE/'preflight.py').read_bytes());self.assertEqual(hashlib.sha256((P/'preflight.py').read_bytes()).hexdigest(),M['preflightSha256']);raw=gzip.decompress((P/'preflight.json.gz').read_bytes());self.assertEqual(hashlib.sha256(raw).hexdigest(),M['rawPreflightSha256']);self.assertEqual(O,{k:v for k,v in json.loads(raw).items()if k!='854_bridge_handoff_receipt'})
 def test_exact_live_identity_and_remote(self):
  self.assertEqual(O['central_current']['run_id'],'882-review-c3e4588f50e6');self.assertEqual(O['central_current']['stage'],'review');self.assertEqual(O['central_current']['problem_id'],'882');self.assertEqual(O['central_session'],'01a17591-2f93-7da0-818f-04685e755d7c');self.assertEqual(O['central_runner_pid'],1984564);self.assertEqual(O['central_native']['pid'],1992290);self.assertEqual(M['remoteHead'],O['central_head']);self.assertEqual(O['central_head'],'faff333c35e1e553e787762361d5febd048a19c1')
 def test_base_receipt_policy_preserved(self):
  old=json.loads((SOURCE/'preflight-summary.json').read_text())
  for k in ['base','policy_sha256','854_bridge_handoff_receipt_sha256','approved_854_bridge_handoff_pins_sha256']:self.assertEqual(O[k],old[k])
  self.assertEqual(O['base'],'048d217b1313ec068fbf41fe3703f5f3e83dcc90');self.assertIn("BASE='"+O['base']+"'",L);self.assertIn("s['current']['stage']=='review'",L)
 def test_exact_review_owned_scope(self):
  s=O['allowed_dirty_scope'];self.assertFalse(s['trackedChangesAllowed']);self.assertEqual(s['report'],'specs/reviews/882-review-1-380812dd.md');self.assertEqual(s['evidence'],'specs/reviews/882-evidence/882-review-1-380812dd')
  for line in O['current_phase_worktree_paths']:self.assertTrue(line.startswith('?? ')and(line[3:]==s['report']or line[3:].startswith(s['evidence']+'/')))
 def test_targets_resources_and_no_execution(self):
  self.assertEqual(len(O['campaign_workers']),1);self.assertEqual(len(O['reservations']),43);self.assertTrue(all(r['status']=='imported'for r in O['reservations']));self.assertFalse(O['stop_exists']);self.assertTrue(O['shared_tree_matches_base']);self.assertGreater(O['mem_available_kib'],1048576);self.assertEqual(O['queue_length'],984);self.assertEqual([(t['id'],t['port'])for t in O['targets']],[('1001',18801),('1012',18802)])
  for t in O['targets']:self.assertTrue(t['bind_available']);self.assertFalse(any(t[k]for k in ['problem_record','runs','reservation_exists','repo_exists','state_exists','branch_exists','port_listeners']))
  self.assertFalse(M['launchExecuted']or M['piMutation'])
if __name__=='__main__':unittest.main(verbosity=2)
