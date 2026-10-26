"""Six focused local refresh checks; no remote calls or execution."""
import ast,gzip,hashlib,json,unittest
from pathlib import Path
P=Path(__file__).resolve().parent;M=json.loads((P/'substitutions.json').read_text());O=json.loads((P/'preflight-summary.json').read_text());F=json.loads((P/'post-push-verification.json').read_text());L=(P/'launch.py').read_text()
class Refresh(unittest.TestCase):
 def test_four_substitutions_only(self):
  self.assertEqual(len(M['substitutions']),4);s=L
  for c in reversed(M['substitutions']):self.assertEqual(s.count(c['to']),1);s=s.replace(c['to'],c['from'])
  original=(P.parent/'launch.py').read_text();self.assertEqual(s,original);self.assertEqual(ast.dump(ast.parse(s)),ast.dump(ast.parse(original)));self.assertEqual(hashlib.sha256(L.encode()).hexdigest(),M['launchSha256'])
 def test_preflight_unchanged(self):
  self.assertEqual((P/'preflight.py').read_bytes(),(P.parent/'preflight.py').read_bytes());self.assertEqual(hashlib.sha256((P/'preflight.py').read_bytes()).hexdigest(),M['preflightSha256'])
 def test_exact_identity_and_postpush(self):
  self.assertEqual(O['central_current']['run_id'],'854-review-dcc68f3629c0');self.assertEqual(O['central_session'],'01a1758c-7fc0-7b21-9f8d-9c75db7c79b1');self.assertEqual(O['central_runner_pid'],1984564);self.assertEqual(O['central_native']['pid'],1988405)
  self.assertEqual(F['remoteHead'],O['central_head']);self.assertTrue(F['allFrozenIdentityFieldsMatch'])
  for k in F['comparedFields']:self.assertEqual(F['summary'][k],O[k])
  self.assertEqual(hashlib.sha256(gzip.decompress((P/'post-push-preflight.json.gz').read_bytes())).hexdigest(),F['rawPreflightSha256'])
 def test_preserved_base_and_receipt(self):
  old=json.loads((P.parent/'preflight-summary.json').read_text())
  for k in ['base','policy_sha256','854_bridge_handoff_receipt_sha256','approved_854_bridge_handoff_pins_sha256']:self.assertEqual(O[k],old[k])
  self.assertEqual(O['base'],'048d217b1313ec068fbf41fe3703f5f3e83dcc90');self.assertIn("BASE='"+O['base']+"'",L)
 def test_exact_review_scope(self):
  scope=F['summary']['allowed_dirty_scope'];self.assertFalse(scope['trackedChangesAllowed']);self.assertEqual(scope['report'],'specs/reviews/854-review-2-771efac1.md');self.assertEqual(scope['evidence'],'specs/reviews/854-evidence/854-review-2-771efac1')
  for line in F['summary']['current_phase_worktree_paths']:self.assertTrue(line.startswith('?? ')and(line[3:]==scope['report']or line[3:].startswith(scope['evidence']+'/')))
 def test_targets_resources_no_execution(self):
  s=F['summary'];self.assertEqual(len(s['campaign_workers']),1);self.assertEqual(len(s['reservations']),43);self.assertTrue(all(r['status']=='imported'for r in s['reservations']));self.assertFalse(s['stop_exists']);self.assertTrue(s['shared_tree_matches_base']);self.assertGreater(s['mem_available_kib'],1048576)
  self.assertEqual([(t['id'],t['port'])for t in s['targets']],[('1001',18801),('1012',18802)])
  for t in s['targets']:self.assertTrue(t['bind_available']);self.assertFalse(any(t[k]for k in ['problem_record','runs','reservation_exists','repo_exists','state_exists','branch_exists','port_listeners']))
  self.assertFalse(M['launchExecuted']or M['piMutation'])
if __name__=='__main__':unittest.main(verbosity=2)
