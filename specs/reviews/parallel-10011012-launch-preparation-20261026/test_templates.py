"""Local static/synthetic checks only; no operational execution or Pi access."""
import ast
import hashlib
import json
from pathlib import Path
import unittest
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
M=json.loads((HERE/'parameter-map.json').read_text())
L=(HERE/'launch.pending.py').read_text()
P=(HERE/'preflight.pending.py').read_text()
BASE='a'*40

def reverse(name,text):
    for c in reversed(M['substitutions'][name]):
        assert c['to']in text
        text=text.replace(c['to'],c['from'])
    original=(ROOT/M['sources'][name]['path']).read_bytes()
    assert hashlib.sha256(original).hexdigest()==M['sources'][name]['sha256']
    assert text==original.decode()
    assert ast.dump(ast.parse(text))==ast.dump(ast.parse(original))

def schema(receipt,digest=None,raw=None):
    raw=json.dumps(receipt,sort_keys=True).encode()if raw is None else raw
    digest=hashlib.sha256(raw).hexdigest()if digest is None else digest
    body=P[P.index('receipt_path='):P.index('s=json.loads')].replace('__PENDING_854BRIDGE_RECEIPT_SHA256__',digest).replace('__PENDING_854BRIDGE_BASE__',BASE)
    class Fixture:
        def __truediv__(self,name):
            assert name==M['futureOwner']+'.json'
            return self
        def read_bytes(self):return raw
    exec(compile(body,'<synthetic-receipt>','exec'),{'state_dir':Fixture(),'json':json,'hashlib':hashlib})

def valid_receipt():
    return {'owner':M['futureOwner'],'status':'completed-resumed','queued_repair_id':'854','queue_preserved':True,'ledger_preserved':True,'pushed_head':BASE,'resume_proof':{'agent_candidate':BASE},'fresh_agent':{'current':{'problem_id':'854','stage':'fix'}}}

class Templates(unittest.TestCase):
    def test_exact_reversal(self):
        reverse('launch.pending.py',L);reverse('preflight.pending.py',P)

    def test_disabled_before_io(self):
        def no_io(*args,**kwargs):raise AssertionError('Disabled template reached IO/import')
        for body in [L,P]:
            self.assertIsInstance(ast.parse(body).body[1],ast.Raise)
            with self.assertRaisesRegex(RuntimeError,'Disabled preparation'):
                exec(compile(body,'<disabled>','exec'),{'__builtins__':{'RuntimeError':RuntimeError,'__import__':no_io,'open':no_io}})

    def test_pending_no_readiness_claim(self):
        self.assertEqual(L.count('__PENDING_854BRIDGE_'),6)
        for k in ['finalReceiptSha256','finalOperatorSha256','externalPinsPath','externalPinsSha256']:self.assertIsNone(M[k])
        self.assertTrue(all(v is None for v in M['finalRuntimePins'].values()))
        self.assertFalse(any(M[k]for k in ['piAccessPerformed','preflightPerformed','readinessClaim','authorContextInjection']))
        self.assertEqual([(x['id'],x['port'])for x in M['targets']],[('1001',18801),('1012',18802)])
        self.assertIn('__PENDING_854BRIDGE_PINS_PATH__',P)
        self.assertIn('__PENDING_854BRIDGE_PINS_SHA256__',P)

    def test_exact_bridge_receipt_schema(self):
        schema(valid_receipt())
        for k,v in [('owner','import9961000-only-placeholder'),('status','awaiting-fresh-ordinary-agent'),('queued_repair_id','995'),('queue_preserved',False),('ledger_preserved',False),('queue_preserved',1),('pushed_head','b'*40)]:
            r=valid_receipt();r[k]=v
            with self.subTest(k=k,v=v),self.assertRaises(AssertionError):schema(r)
        for k,v in [('problem_id','995'),('stage','author'),('stage','review')]:
            r=valid_receipt();r['fresh_agent']['current'][k]=v
            with self.subTest(k=k,v=v),self.assertRaises(AssertionError):schema(r)
        r=valid_receipt();r['ordinary_resume_proof']=r.pop('resume_proof')
        with self.assertRaises(KeyError):schema(r)
        r=valid_receipt();r['resume_proof']['agent_candidate']='b'*40
        with self.assertRaises(AssertionError):schema(r)
        with self.assertRaises(AssertionError):schema({},digest='0'*64,raw=b'not-json')

    def test_preserved_dependency_and_scope_guards(self):
        markers=["assert hashlib.sha256(receipt_bytes)","receipt=json.loads","assert pins_sha=='__PENDING_854BRIDGE_PINS_SHA256__'","for name,digest in approved_pins['policy'].items():","'cat-file','-e',base+'^{commit}'","'show',base+':'+static_path",'spec.loader.exec_module(m)','m.same_shared(repo,base,head)']
        offsets=[P.index(v)for v in markers];self.assertEqual(offsets,sorted(offsets))
        for token in ["'--untracked-files=all'","line.startswith('?? ')","allowed_fix='leetcode/'+current['problem_id']+'/'","allowed_author='leetcode/'+current['problem_id']+'/'","assert len(native)==1","assert len(workers)==1 and all(r['record']['status']=='imported'","MemAvailable","sock.bind(('127.0.0.1',t['port']))"]:self.assertIn(token,P)
        for token in ["validate(1)","validate(count)","['nice','-n','10'","'--max-rounds','6'","publication_enabled=False","assert '--publish-root' not in args and '--public-base' not in args"]:self.assertIn(token,L)
        self.assertIn("plan=[('1001',18801),('1012',18802)]",L)
        self.assertNotIn("approved_pins['lane_base']",P)

    def test_reference_adapter_schema_only_not_final_identity(self):
        for name,ref in M['disabled854AdapterReference'].items():
            raw=(ROOT/ref['path']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),ref['sha256'])
        r=M['disabled854AdapterReference'];op=(ROOT/r['operate.py']['path']).read_text()
        self.assertIn("OWNER='"+M['futureOwner']+"'",op)
        self.assertIn('PINS_SHA=None',op)
        self.assertIn("record['resume_proof']=",op)
        self.assertIn("queued_repair_id='854',queue_preserved=True",op)
        pins=json.loads((ROOT/r['pending-pins.json']['path']).read_text());self.assertNotIn('lane_base',pins)
        self.assertIsNone(pins['central'])

    def test_guard_changes_rejected_by_reversal(self):
        for old,new in [(M['disableLine'],''),("'--max-rounds','6'","'--max-rounds','1'"),("validate(count)",'pass')]:
            with self.subTest(old=old),self.assertRaises(AssertionError):reverse('launch.pending.py',L.replace(old,new))

    def test_artifact_hashes(self):
        for name,digest in M['artifacts'].items():self.assertEqual(hashlib.sha256((HERE/name).read_bytes()).hexdigest(),digest)

if __name__=='__main__':unittest.main(verbosity=2)
