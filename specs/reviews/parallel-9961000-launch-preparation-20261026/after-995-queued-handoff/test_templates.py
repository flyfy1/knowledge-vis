"""Local synthetic schema/reversal checks; no operational body or Pi execution."""
import ast
import copy
import hashlib
import json
from pathlib import Path
import unittest

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
MAP=json.loads((HERE/'adaptation-map.json').read_text())
LAUNCH=(HERE/'launch.pending.py').read_text()
PREFLIGHT=(HERE/'preflight.pending.py').read_text()
BASE='b'*40

def receipt_gate(receipt, *, raw_override=None, expected_sha=None):
    raw=json.dumps(receipt,sort_keys=True).encode() if raw_override is None else raw_override
    digest=hashlib.sha256(raw).hexdigest() if expected_sha is None else expected_sha
    body=PREFLIGHT[PREFLIGHT.index('receipt_path='):PREFLIGHT.index('s=json.loads')]
    body=body.replace('__PENDING_995COPY_RECEIPT_SHA256__',digest).replace('__PENDING_995COPY_BASE__',BASE)
    class ReceiptPath:
        def __truediv__(self,name):
            assert name==MAP['futureOwner']+'.json'
            return self
        def read_bytes(self):return raw
    exec(compile(body,'<synthetic-receipt-gate>','exec'),{'state_dir':ReceiptPath(),'json':json,'hashlib':hashlib})

def good_receipt():
    return {'owner':MAP['futureOwner'],'status':'completed-resumed','queued_repair_id':'995',
            'queue_preserved':True,'ledger_preserved':True,'pushed_head':BASE,
            'resume_proof':{'agent_candidate':BASE},'fresh_agent':{'synthetic':True}}

class Templates(unittest.TestCase):
    def test_declared_reversal_restores_exact_originals(self):
        for name,changes in [('launch.pending.py','launcherSubstitutions'),('preflight.pending.py','preflightSubstitutions')]:
            source=(ROOT/MAP['sources'][name]['path']).read_bytes()
            self.assertEqual(hashlib.sha256(source).hexdigest(),MAP['sources'][name]['sha256'])
            body=(HERE/name).read_text()
            for item in reversed(MAP[changes]):
                self.assertIn(item['to'],body)
                body=body.replace(item['to'],item['from'])
            self.assertEqual(body,source.decode())
            self.assertEqual(ast.dump(ast.parse(body)),ast.dump(ast.parse(source)))

    def test_original_parent_files_unchanged(self):
        for name,digest in MAP['parentFiles'].items():
            self.assertEqual(hashlib.sha256((HERE.parent/name).read_bytes()).hexdigest(),digest,name)

    def test_disabled_before_import_read_or_write(self):
        def prohibited(*args,**kwargs):raise AssertionError('Disabled entry reached IO/import')
        for source in [LAUNCH,PREFLIGHT]:
            tree=ast.parse(source)
            self.assertIsInstance(tree.body[1],ast.Raise)
            with self.assertRaisesRegex(RuntimeError,'Disabled preparation'):
                exec(compile(source,'<disabled>','exec'),{'__builtins__':{'RuntimeError':RuntimeError,'__import__':prohibited,'open':prohibited}})

    def test_valid_handoff_schema_only(self):
        receipt_gate(good_receipt())
        for key in ['owner','status','queued_repair_id','queue_preserved','ledger_preserved','pushed_head','resume_proof','fresh_agent']:
            value=good_receipt();del value[key]
            with self.subTest(missing=key),self.assertRaises((KeyError,AssertionError)):receipt_gate(value)
        for key,value in [('owner','import992995-only-20261026-888bb6ac'),('status','awaiting-fresh-agent'),('queued_repair_id','992'),('queue_preserved',False),('ledger_preserved',False),('queue_preserved',1),('ledger_preserved',1),('pushed_head','a'*40),('fresh_agent',{})]:
            receipt=good_receipt();receipt[key]=value
            with self.subTest(field=key,value=value),self.assertRaises(AssertionError):receipt_gate(receipt)
        receipt=good_receipt();receipt['ordinary_resume_proof']=receipt.pop('resume_proof')
        with self.assertRaises(KeyError):receipt_gate(receipt)
        receipt=good_receipt();receipt['resume_proof']['agent_candidate']='c'*40
        with self.assertRaises(AssertionError):receipt_gate(receipt)

    def test_receipt_digest_checked_before_json_or_pins(self):
        with self.assertRaises(AssertionError):receipt_gate({},raw_override=b'not-json',expected_sha='0'*64)
        self.assertLess(PREFLIGHT.index("assert hashlib.sha256(receipt_bytes)"),PREFLIGHT.index('receipt=json.loads'))

    def test_unresolved_actual_identities(self):
        self.assertEqual(LAUNCH.count('__PENDING_995COPY_'),6)
        self.assertTrue(all(v is None for v in MAP['finalRuntimePins'].values()))
        for key in ['futureReceiptSha256','futureExternalPinsPath','futureExternalPinsSha256']:self.assertIsNone(MAP[key])
        self.assertIn('__PENDING_995COPY_RECEIPT_SHA256__',PREFLIGHT)
        self.assertIn('__PENDING_995COPY_PINS_PATH__',PREFLIGHT)
        self.assertIn('__PENDING_995COPY_PINS_SHA256__',PREFLIGHT)
        self.assertNotIn('d9d7989e9952749a83a80cdde4ce1d6b2c5f7c78',LAUNCH+PREFLIGHT)
        self.assertFalse(MAP['authorContextInjection'] or MAP['piAccessPerformed'])

    def test_hashes_before_import_with_compatible_static_source(self):
        ordered=["assert pins_sha=='__PENDING_995COPY_PINS_SHA256__'","for name,digest in approved_pins['policy'].items():","'cat-file','-e',base+'^{commit}'","'show',base+':'+static_path","assert hashlib.sha256((repo/static_path).read_bytes()).hexdigest()==static_sha",'spec.loader.exec_module(m)','m.same_shared(repo,base,head)']
        offsets=[PREFLIGHT.index(v)for v in ordered]
        self.assertEqual(offsets,sorted(offsets))
        self.assertNotIn("approved_pins['lane_base']",PREFLIGHT)

    def test_original_native_scope_resource_target_guards_retained(self):
        for fragment in ["'--untracked-files=all'","line.startswith('?? ')","allowed_author='leetcode/'+current['problem_id']+'/'","allowed_fix='leetcode/'+current['problem_id']+'/'","assert len(native)==1","assert len(workers)==1","'status']=='imported'","MemAvailable","sock.bind(('127.0.0.1',t['port']))","not(state_dir/'STOP').exists()"]:
            self.assertIn(fragment,PREFLIGHT)
        self.assertIn("plan=[('996',18799),('1000',18800)]",LAUNCH)
        self.assertIn("['nice','-n','10'",LAUNCH)
        self.assertIn("'--max-rounds','6'",LAUNCH)
        self.assertIn("assert '--publish-root' not in args and '--public-base' not in args",LAUNCH)
        for source in [LAUNCH,PREFLIGHT]:self.assertIn(MAP['policySha256'],source)

    def test_approved_handoff_source_identity_and_schema(self):
        source=MAP['approvedHandoffSource']
        for prefix in ['operator','pins']:
            raw=(ROOT/source[prefix+'Path']).read_bytes()
            self.assertEqual(hashlib.sha256(raw).hexdigest(),source[prefix+'Sha256'])
        pins=json.loads((ROOT/source['pinsPath']).read_text())
        self.assertNotIn('lane_base',pins)
        operator=(ROOT/source['operatorPath']).read_text()
        self.assertIn("record['resume_proof']=",operator)
        self.assertIn("queued_repair_id='995',queue_preserved=True",operator)

    def test_artifact_hashes(self):
        for name,digest in MAP['artifacts'].items():self.assertEqual(hashlib.sha256((HERE/name).read_bytes()).hexdigest(),digest)

if __name__=='__main__':unittest.main(verbosity=2)
