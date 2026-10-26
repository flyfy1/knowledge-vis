"""Local identity/reversal checks; no operational launch or Pi calls."""
import ast,gzip,hashlib,json,unittest
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
M=json.loads((HERE/'parameter-map.json').read_text());L=(HERE/'launch.py').read_text();P=(HERE/'preflight.py').read_text();RAW=gzip.decompress((HERE/'preflight.json.gz').read_bytes());O=json.loads(RAW);H=json.loads((HERE/'handoff-capture.json').read_text());R=json.loads(gzip.decompress((HERE/'handoff-receipt.json.gz').read_bytes()));D=json.loads((HERE/'handoff-dispatch.json').read_text())
class Final(unittest.TestCase):
 def test_reversible_sources(self):
  for name,text in [('launch.py',L),('preflight.py',P)]:
   source=M['sources'][name];raw=(ROOT/source['path']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),source['sha256'])
   for c in reversed(M['substitutions'][name]):self.assertIn(c['to'],text);text=text.replace(c['to'],c['from'])
   lines=text.splitlines(True);text=lines[0]+M['removedDisableLine']+''.join(lines[1:]);self.assertEqual(text,raw.decode());self.assertEqual(ast.dump(ast.parse(text)),ast.dump(ast.parse(raw)))
 def test_completed_receipt_and_base(self):
  self.assertTrue(H['operatorAbsent']);self.assertEqual(R['status'],'completed-resumed');self.assertEqual(R['owner'],'854-bridge-adoption-20261026-185d4ba0');self.assertEqual(R['queued_repair_id'],'854');self.assertIs(R['queue_preserved'],True);self.assertIs(R['ledger_preserved'],True)
  self.assertEqual(R['pushed_head'],R['resume_proof']['agent_candidate']);self.assertEqual(R['pushed_head'],H['base']);self.assertEqual(H['base'],O['base']);self.assertEqual(H['remoteHead'],O['base']);self.assertEqual(O['854_bridge_handoff_receipt'],R)
  self.assertEqual(R['fresh_agent']['current']['problem_id'],'854');self.assertEqual(R['fresh_agent']['current']['stage'],'fix')
  self.assertEqual(hashlib.sha256(gzip.decompress((HERE/'handoff-receipt.json.gz').read_bytes())).hexdigest(),H['receiptSha256'])
 def test_transfer_helpers_and_source(self):
  self.assertEqual(D['hashes'],H['externalHashes']);self.assertEqual(D['args'][D['args'].index('--pins')+1],H['externalPinsPath']);self.assertEqual(M['externalPinsSha256'],D['hashes']['pins.json']);self.assertEqual(O['approved_854_bridge_handoff_pins_sha256'],M['externalPinsSha256'])
  self.assertEqual(len(H['verifiedPayloadAtBase']),32);self.assertEqual(len(H['protectedFilesAtBase']),4);self.assertTrue(H['allPinnedRuntimeBytesVerified']);self.assertEqual(H['sourceCandidate'],R['maintenance']['source_revision'])
 def test_runtime_frozen_exactly(self):
  values={'base':O['base'],'centralHead':O['central_head'],'run':O['central_current']['run_id'],'problem':O['central_current']['problem_id'],'stage':O['central_current']['stage'],'session':O['central_session']};self.assertEqual(values,M['runtime']);self.assertNotIn('__PENDING_',L+P)
  self.assertEqual(O['central_current'],H['freshAgent']['current']);self.assertEqual(O['central_session'],H['freshAgent']['session_id']);self.assertEqual(O['central_native']['pid'],H['freshAgent']['native_codex_pids'][0]);self.assertEqual(O['central_native'],M['externalNativeProof']['native'])
 def test_current_target_resource_guards(self):
  self.assertEqual(O['queue_length'],984);self.assertEqual(len(O['reservations']),43);self.assertTrue(all(r['status']=='imported'for r in O['reservations']));self.assertEqual(len(O['campaign_workers']),1);self.assertEqual(O['campaign_workers'][0]['pid'],O['central_runner_pid']);self.assertGreater(O['mem_available_kib'],1048576);self.assertTrue(O['shared_tree_matches_base']);self.assertFalse(O['stop_exists'])
  self.assertEqual([(t['id'],t['port'])for t in O['targets']],[('1001',18801),('1012',18802)])
  for t in O['targets']:self.assertTrue(t['in_queue']and t['bind_available']);self.assertFalse(any(t[k]for k in ['problem_record','runs','reservation_exists','repo_exists','state_exists','branch_exists','port_listeners']))
 def test_queue_995_ledger_no_lane_preservation(self):
  for k in ['queuePreserved','995EntryPreserved','noLaneProcesses','stopAbsent']:self.assertTrue(H[k])
  self.assertEqual(H['995Status'],'changes_required');self.assertEqual(H['854Status'],'changes_required');self.assertIsNone(H['pendingRelease']);self.assertEqual(H['ledgerSha256'],R['before_ledger_sha256']);self.assertEqual(H['ledgerSha256'],'163b32ba940e02a8f17c1ccaf5e9a9f6dfcd606491007d096faa9b971b45eda6')
 def test_hash_order_and_original_launch_scope(self):
  tokens=["assert hashlib.sha256(receipt_bytes)","receipt=json.loads","assert pins_sha=","for name,digest in approved_pins['policy'].items():","'cat-file','-e',base+'^{commit}'","'show',base+':'+static_path",'spec.loader.exec_module(m)','m.same_shared(repo,base,head)'];positions=[P.index(t)for t in tokens];self.assertEqual(positions,sorted(positions))
  for t in ["plan=[('1001',18801),('1012',18802)]","validate(count)","['nice','-n','10'","'--max-rounds','6'","publication_enabled=False","assert '--publish-root' not in args and '--public-base' not in args"]:self.assertIn(t,L)
  for t in ["'--untracked-files=all'","line.startswith('?? ')","allowed_fix='leetcode/'+current['problem_id']+'/'"]:self.assertIn(t,P)
 def test_lossless_hashes_and_no_execution(self):
  self.assertEqual(hashlib.sha256(RAW).hexdigest(),M['preflightRawSha256']);summary=json.loads((HERE/'preflight-summary.json').read_text());self.assertEqual(summary,{k:v for k,v in O.items()if k!='854_bridge_handoff_receipt'})
  for name,digest in M['artifacts'].items():self.assertEqual(hashlib.sha256((HERE/name).read_bytes()).hexdigest(),digest)
  self.assertFalse(M['launchExecuted']or M['piPersistentMutation']or M['authorContextInjection'])
if __name__=='__main__':unittest.main(verbosity=2)
