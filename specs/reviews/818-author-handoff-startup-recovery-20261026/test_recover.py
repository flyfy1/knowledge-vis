"""Frozen recovery guards; no remote reads, agents, dispatch or runtime writes."""
import copy
import hashlib
import importlib.util
import json
import os
import sys
import subprocess
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import recover

HERE=Path(__file__).resolve().parent
EVIDENCE=HERE.parent/'parallel-968972-import-818-search-execution-20261026'
class RecoveryGuards(unittest.TestCase):
    def setUp(self):
        self.pins=json.loads((HERE/'pins.json').read_bytes())
        self.state=json.loads((EVIDENCE/'progress-failed.json').read_bytes())
        self.receipt=json.loads((EVIDENCE/'receipt-failed.json').read_bytes())
        self.stop=(EVIDENCE/'STOP-preserved.json').read_bytes()
    def check(self):recover.initial_guard(self.state,self.receipt,self.stop,self.pins)
    def test_actual_failed_snapshot_is_launch_only_admissible(self):
        self.check()
        for name,key in [('progress-failed.json','progress_sha256'),('receipt-failed.json','failed_receipt_sha256'),('STOP-preserved.json','stop_sha256')]:
            self.assertEqual(hashlib.sha256((EVIDENCE/name).read_bytes()).hexdigest(),self.pins[key])
    def test_advanced_state_wrong_head_or_history_count_refuses(self):
        for key,value in [('status','running'),('current',{'run_id':'new'}),('expected_head','other'),('runs',self.state['runs']+[{'id':'new'}])]:
            original=copy.deepcopy(self.state);self.state[key]=value
            with self.assertRaises(RuntimeError):self.check()
            self.state=original
        self.state['problems']['818']['phase']='review'
        with self.assertRaises(RuntimeError):self.check()
    def test_unrelated_failure_or_stop_owner_refuses(self):
        self.receipt['error']='different failure'
        with self.assertRaises(RuntimeError):self.check()
        self.receipt=json.loads((EVIDENCE/'receipt-failed.json').read_bytes());self.stop=b'{"owner":"foreign"}'
        with self.assertRaises(RuntimeError):self.check()
    def test_recovery_has_distinct_lineage(self):
        self.assertNotEqual(recover.OWNER,recover.OLD_OWNER)
        self.assertEqual(recover.HANDOFF_OWNER,recover.OWNER+'-author-to-mac')
    def test_restore_is_byte_exact_and_never_overwrites_foreign_stop(self):
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'STOP';raw=b'{ "owner": "fixture" }\n'
            recover.write_raw_exclusive(path,raw);self.assertEqual(path.read_bytes(),raw)
            with self.assertRaises(FileExistsError):recover.write_raw_exclusive(path,b'other')
            self.assertEqual(path.read_bytes(),raw)
    def test_disabled_entrypoint_has_no_runtime_or_pin_access(self):
        with patch.object(recover,'PINS_SHA',None),self.assertRaisesRegex(RuntimeError,'frozen pins'):
            recover.main(['--dispatch',recover.DISPATCH,'--pins','/not-present','--stage-a-operator','/not-present','--stage-a-pins','/not-present'])

class ModuleLoadGuards(unittest.TestCase):
    def test_cli_does_not_import_observer_before_dispatch_guard(self):
        with tempfile.TemporaryDirectory() as temporary:
            root=Path(temporary);marker=root/'observer-executed'
            (root/'recover.py').write_bytes((HERE/'recover.py').read_bytes())
            (root/'startup_observer.py').write_text('from pathlib import Path\nPath('+repr(str(marker))+').touch()\ndef observe(*a):pass\n')
            result=subprocess.run([sys.executable,'-B',str(root/'recover.py'),'--dispatch','not-authorized','--pins','missing','--stage-a-operator','missing','--stage-a-pins','missing'],capture_output=True,text=True)
            self.assertNotEqual(result.returncode,0)
            self.assertIn('Exact reviewed root dispatch',result.stderr)
            self.assertFalse(marker.exists())

    def test_changed_importer_and_observer_refuse_before_execution(self):
        original=HERE.parent/'parallel-968972-import-818-search-preparation-20261026/operate.py'
        for changed in ('importer','observer'):
            with self.subTest(changed=changed),tempfile.TemporaryDirectory() as temporary:
                root=Path(temporary);repo=root/'repo';state=root/'state'
                (repo/'scripts').mkdir(parents=True);state.mkdir()
                marker=root/'module-executed'
                harmful=('from pathlib import Path\nPath('+repr(str(marker))+').touch()\n').encode()
                expected=b'# Expected immutable source\n'
                importer=repo/'scripts/import_leetcode_lane.py'
                importer.write_bytes(harmful if changed=='importer' else expected)
                observer=root/'startup_observer.py'
                observer.write_bytes(harmful if changed=='observer' else expected)
                (state/'launch.py').write_bytes(expected)
                oldpins={'policy':{'scripts/import_leetcode_lane.py':recover.sha(expected)},'launcher_sha256':recover.sha(expected)}
                oldpath=root/'old-pins.json';oldpath.write_text(json.dumps(oldpins))
                newpath=root/'pins.json';newpath.write_text(json.dumps({'observer_sha256':recover.sha(expected)}))
                with patch.object(recover,'REPO',repo),patch.object(recover,'STATE',state),patch.object(recover,'__file__',str(root/'recover.py')),patch.object(recover,'PINS_SHA',recover.sha(newpath.read_bytes())),patch.object(recover,'OLD_PINS_SHA',recover.sha(oldpath.read_bytes())),patch.dict(os.environ,{}),patch.object(sys,'path',list(sys.path)):
                    with self.assertRaisesRegex(RuntimeError,'Policy/runtime changed' if changed=='importer' else 'observer differs'):
                        recover.main(['--dispatch',recover.DISPATCH,'--pins',str(newpath),'--stage-a-operator',str(original),'--stage-a-pins',str(oldpath)])
                self.assertFalse(marker.exists(),'Changed module executed before refusal')

if __name__=='__main__':unittest.main(verbosity=2)
