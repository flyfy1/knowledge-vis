"""CLI seam tests on tiny fixtures only; no Pi, full-range run or old large BFS."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import unittest

HERE=Path(__file__).resolve().parent
HARNESS=HERE/'measure.py'
ASTAR='''from heapq import heappop, heappush
class Solution:
    def racecar(self, target: int) -> int:
        def lower(p, v):
            diff=target-p
            if diff==0:return 0
            if diff*v<0:return 1+abs(diff).bit_length()
            return ((abs(diff)+abs(v)-1)//abs(v)).bit_length()
        best={(0,1):0}
        heap=[(lower(0,1),0,0,1)]
        while heap:
            _,neg,p,v=heappop(heap)
            g=-neg
            if best[(p,v)]!=g:continue
            if p==target:return g
            for position,speed in ((p+v,2*v),(p,-1 if v>0 else 1)):
                cost=g+1
                if cost<best.get((position,speed),float('inf')):
                    best[(position,speed)]=cost
                    heappush(heap,(cost+lower(position,speed),-cost,position,speed))
'''


@unittest.skipUnless(sys.platform=='darwin','Harness is intentionally Mac-only')
class MeasurementCLI(unittest.TestCase):
    def setUp(self):
        self.temporary=tempfile.TemporaryDirectory();self.addCleanup(self.temporary.cleanup)
        self.root=Path(self.temporary.name);self.source=self.root/'solution.py';self.output=self.root/'result'

    def run_fixture(self,source=ASTAR,extra=(),expected=None):
        self.source.write_text(source)
        sha=hashlib.sha256(self.source.read_bytes()).hexdigest()
        command=[sys.executable,'-B',str(HARNESS),'--source',str(self.source),'--expected-sha256',expected or sha,'--output',str(self.output),'--test-limit','12','--wall-seconds','10','--per-target-seconds','2',*extra]
        process=subprocess.run(command,capture_output=True,text=True,timeout=15)
        return process,sha

    def summary(self):return json.loads((self.output/'summary.json').read_text())
    def rows(self,name='survey.jsonl'):return [json.loads(line) for line in (self.output/name).read_text().splitlines()]

    def test_tiny_real_astar_actual_callable_parity_and_isolated_rss(self):
        result,sha=self.run_fixture()
        self.assertEqual(result.returncode,0,result.stderr+result.stdout)
        summary=self.summary();self.assertEqual(summary['status'],'passed_limited');self.assertFalse(summary['full_official_range_passed'])
        self.assertTrue(summary['source_immutable']);self.assertEqual(summary['original_sha256_after'],sha)
        rows=self.rows();self.assertEqual([r['target'] for r in rows],list(range(1,13)))
        self.assertTrue(all(r['matches_raw_bfs'] and r['matches_reference_dp'] for r in rows))
        self.assertTrue(all(r['peak_rss_bytes']==r['peak_rss_raw']>0 and r['peak_rss_raw_unit']=='bytes' for r in rows))
        self.assertTrue(all(r['call_seconds']>=0 and r['process_wall_seconds']>0 for r in rows))
        self.assertTrue(self.rows('isolated.jsonl'));self.assertFalse(list(self.root.rglob('*.pyc')))

    def test_hash_mismatch_refuses_before_output_creation(self):
        result,_=self.run_fixture(expected='0'*64)
        self.assertEqual(result.returncode,2);self.assertFalse(self.output.exists())
        self.assertIn('SHA256 differs',result.stderr)

    def test_existing_output_is_never_overwritten(self):
        self.output.mkdir();sentinel=self.output/'sentinel';sentinel.write_text('preserve')
        result,_=self.run_fixture();self.assertEqual(result.returncode,2)
        self.assertEqual(sentinel.read_text(),'preserve');self.assertEqual(list(self.output.iterdir()),[sentinel])

    def test_wrong_return_records_each_target_as_mismatch(self):
        result,_=self.run_fixture('class Solution:\n def racecar(self,target):return 0\n')
        self.assertEqual(result.returncode,1);self.assertFalse(self.summary()['full_official_range_passed'])
        self.assertEqual(len(self.rows()),12);self.assertTrue(all(r['status']=='mismatch' and r['answer']==0 for r in self.rows()))

    def test_invalid_return_and_exception_are_not_answers(self):
        result,_=self.run_fixture('class Solution:\n def racecar(self,target):\n  if target==1:return True\n  raise RuntimeError("fixture failure")\n')
        self.assertEqual(result.returncode,1);rows=self.rows();self.assertEqual(rows[0]['status'],'invalid_return')
        self.assertIsNone(rows[0]['answer']);self.assertEqual(rows[1]['status'],'exception');self.assertIn('fixture failure',rows[1]['error'])

    def test_timeout_and_overall_deadline_are_recorded_not_partial_answers(self):
        result,_=self.run_fixture('import time\nclass Solution:\n def racecar(self,target):time.sleep(30)\n',extra=['--test-limit','4','--wall-seconds','0.23','--per-target-seconds','0.15'])
        self.assertEqual(result.returncode,1);rows=self.rows();self.assertEqual(len(rows),4)
        self.assertTrue(any(r['status']=='timeout' for r in rows));self.assertTrue(any(r['status']=='overall_deadline' for r in rows));self.assertTrue(all(r['answer'] is None for r in rows))
        self.assertLess(self.summary()['elapsed_seconds'],3)

    def test_snapshot_mutation_is_detected_and_original_unchanged(self):
        code='from pathlib import Path\nclass Solution:\n def racecar(self,target):\n  Path(__file__).write_text("mutated")\n  return 1\n'
        result,sha=self.run_fixture(code,extra=['--test-limit','1','--workers','1'])
        self.assertEqual(result.returncode,1);self.assertFalse(self.summary()['source_immutable'])
        self.assertEqual(hashlib.sha256(self.source.read_bytes()).hexdigest(),sha)
        self.assertEqual(self.rows()[0]['status'],'source_changed')

    def test_timeout_cleans_descendant_process_group(self):
        marker=self.root/'escaped'
        child='import time;from pathlib import Path;time.sleep(0.8);Path('+repr(str(marker))+').write_text("bad")'
        source='import subprocess,sys,time\nclass Solution:\n def racecar(self,target):\n  subprocess.Popen([sys.executable,"-c",'+repr(child)+'])\n  time.sleep(30)\n'
        result,_=self.run_fixture(source,extra=['--test-limit','1','--wall-seconds','2','--per-target-seconds','0.2'])
        self.assertEqual(result.returncode,1);time.sleep(.9);self.assertFalse(marker.exists())


if __name__=='__main__':unittest.main(verbosity=2)
