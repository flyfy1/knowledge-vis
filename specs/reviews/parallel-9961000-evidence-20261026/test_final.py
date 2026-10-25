"""Frozen proposal tests only: no Pi calls or launch execution."""
import ast
import hashlib
import json
from pathlib import Path
import unittest
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
M=json.loads((HERE/'parameter-map.json').read_text())
L=(HERE/'launch.py').read_text()
P=(HERE/'preflight.py').read_text()
O=json.loads((HERE/'preflight.json').read_text())
H=json.loads((HERE/'handoff-completed-observation.json').read_text())

class Final(unittest.TestCase):
    def test_exact_source_reversal(self):
        for name,text in [('launch.py',L),('preflight.py',P)]:
            source=M['sources'][name];raw=(ROOT/source['path']).read_bytes()
            self.assertEqual(hashlib.sha256(raw).hexdigest(),source['sha256'])
            for c in reversed(M['substitutions'][name]):
                self.assertIn(c['to'],text)
                text=text.replace(c['to'],c['from'])
            lines=text.splitlines(True);text=lines[0]+M['removedDisableLine']+''.join(lines[1:])
            self.assertEqual(text,raw.decode())
            self.assertEqual(ast.dump(ast.parse(text)),ast.dump(ast.parse(raw)))

    def test_completed_handoff_identity(self):
        r=H['receipt']
        self.assertFalse(H['operatorAlive'])
        self.assertEqual(r['owner'],'995-copy-repair-20261026-9d027af3')
        self.assertEqual(r['status'],'completed-resumed')
        self.assertEqual(r['queued_repair_id'],'995')
        self.assertIs(r['queue_preserved'],True);self.assertIs(r['ledger_preserved'],True)
        self.assertEqual(r['pushed_head'],r['resume_proof']['agent_candidate'])
        self.assertEqual(r['pushed_head'],O['base'])
        self.assertEqual(hashlib.sha256((HERE/'handoff-receipt.json').read_bytes()).hexdigest(),H['receiptSha256'])
        self.assertEqual(O['995_queued_handoff_receipt'],r)

    def test_actual_external_pins_source(self):
        d=H['dispatch'];args=d['args']
        self.assertEqual(args[args.index('--pins')+1],H['externalPinsPath'])
        self.assertEqual(H['externalPinsSha256'],d['sha256']['pins.json'])
        self.assertEqual(H['externalPinsSha256'],'b8daf2ba46ff675f5cc14f6ddca7e1816d14348b3438b228f13c4e6fa60ff93c')
        self.assertEqual(H['externalPinsSha256'],O['approved_995_queued_handoff_pins_sha256'])
        self.assertIn(H['externalPinsPath'],P)

    def test_six_runtime_parameters_match_capture(self):
        v=M['runtime'];self.assertEqual(v['base'],O['base'])
        for key,capture in [('centralHead',O['central_head']),('run',O['central_current']['run_id']),('problem',O['central_current']['problem_id']),('stage',O['central_current']['stage']),('session',O['central_session'])]:
            self.assertEqual(v[key],capture);self.assertIn(capture,L)
        self.assertNotIn('__PENDING_',L+P)
        self.assertEqual(O['central_head'],O['central_expected_head'])

    def test_live_preflight_guards(self):
        self.assertEqual(O['central_status'],'running');self.assertFalse(O['stop_exists'])
        self.assertTrue(O['shared_tree_matches_base']);self.assertEqual(O['queue_length'],984)
        self.assertEqual(len(O['reservations']),41)
        self.assertTrue(all(r['status']=='imported' for r in O['reservations']))
        self.assertGreater(O['mem_available_kib'],1048576)
        self.assertEqual(len(O['campaign_workers']),1)
        self.assertEqual(O['campaign_workers'][0]['pid'],O['central_runner_pid'])
        self.assertNotEqual(O['central_native']['pid'],O['central_runner_pid'])
        self.assertEqual([(t['id'],t['port'])for t in O['targets']],[('996',18799),('1000',18800)])
        for t in O['targets']:
            self.assertTrue(t['bind_available'] and t['in_queue'])
            self.assertFalse(any(t[k]for k in ['problem_record','runs','reservation_exists','repo_exists','state_exists','branch_exists','port_listeners']))

    def test_hash_order_and_static_receipt_base(self):
        markers=["assert hashlib.sha256(receipt_bytes)","receipt=json.loads",'assert pins_sha=',"for name,digest in approved_pins['policy'].items():","'cat-file','-e',base+'^{commit}'","'show',base+':'+static_path",'spec.loader.exec_module(m)','m.same_shared(repo,base,head)']
        positions=[P.index(s)for s in markers];self.assertEqual(positions,sorted(positions))
        self.assertNotIn("approved_pins['lane_base']",P)
        self.assertNotIn('ordinary_resume_proof',P)

    def test_launcher_scope_preserved(self):
        for value in ["plan=[('996',18799),('1000',18800)]","validate(count)","['nice','-n','10'","'--max-rounds','6'","publication_enabled=False","assert '--publish-root' not in args and '--public-base' not in args"]:self.assertIn(value,L)
        for value in ["'--untracked-files=all'","line.startswith('?? ')","allowed_author='leetcode/'+current['problem_id']+'/'","allowed_fix='leetcode/'+current['problem_id']+'/'"]:self.assertIn(value,P)

    def test_artifact_hashes(self):
        for name,digest in M['artifacts'].items():self.assertEqual(hashlib.sha256((HERE/name).read_bytes()).hexdigest(),digest)
        self.assertFalse(M['launchExecuted'] or M['piPersistentMutation'] or M['authorContextInjection'])

if __name__=='__main__':unittest.main(verbosity=2)
