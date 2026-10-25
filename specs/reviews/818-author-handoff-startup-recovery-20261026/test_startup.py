"""Local actual-runner/fake-CLI launch seam; no SSH or real agents."""
import copy
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import time
import unittest

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
sys.path.insert(0,str(ROOT/'scripts'))
import test_leetcode_campaign as fixtures
OLD=ROOT/'specs/reviews/parallel-968972-import-818-search-preparation-20261026/operate.py'
spec=importlib.util.spec_from_file_location('old_stage_a',OLD)
op=importlib.util.module_from_spec(spec);spec.loader.exec_module(op)

def observe(state,before,old_ids,live):
    # The original loop checks exact launched PID presence before this call.
    if not live: raise RuntimeError('Resumed runner exited before handoff arm')
    if os.environ.get('STARTUP_OBSERVER') == 'recovery':
        from startup_observer import observe as fixed
        return fixed(state,before,old_ids,live,op.fresh_fix_record)
    return op.fresh_fix_record(state,old_ids)

class DelayedActualRunner(unittest.TestCase):
    def test_delayed_launch_waits_then_arms_fresh_fix_before_review(self):
        case=fixtures.CampaignTests('runTest');case.setUp();self.addCleanup(case.doCleanups)
        case.problems=[{'id':818,'title':'Race Car','paidOnly':False,'officialUrl':'https://leetcode.com/problems/race-car/'}]
        case.write('leetcode/catalog/hard-problems.json',json.dumps({'problems':case.problems}))
        case.git('add','.');case.git('commit','-m','Fixture 818 selection')
        case.state.mkdir();(case.state/'STOP').touch();self.assertEqual(case.invoke('', '--ids','818'),0)
        before=case.progress();before['problems']['818'].update(status='changes_required',phase='fix')
        (case.state/'progress.json').write_text(json.dumps(before));(case.state/'STOP').unlink()
        startup=case.root/'startup';started=case.root/'started';release=case.root/'release-author'
        # Gate the fake CLI after the actual runner has persisted its fresh fix.
        fake=fixtures.FAKE_CODEX.replace('args = sys.argv',
            'while not pathlib.Path('+repr(str(release))+').exists(): time.sleep(.005)\nargs = sys.argv')
        case.fake.write_text(fake)
        child=case.root/'delayed.py'
        child.write_text('import pathlib,time,sys\n'
            +'sys.path.insert(0,'+repr(str(ROOT/'scripts'))+')\n'
            +'import leetcode_campaign as c\n'
            +'pathlib.Path('+repr(str(started))+').touch()\n'
            +'while not pathlib.Path('+repr(str(startup))+').exists(): time.sleep(.005)\n'
            +'raise SystemExit(c.main(sys.argv[1:]))\n')
        with (case.root/'runner.log').open('w') as log:
            process=subprocess.Popen([sys.executable,'-B',str(child),'--repo',str(case.repo),'--state-dir',str(case.state),'--codex',str(case.fake),'--port','0','--ids','818'],stdout=log,stderr=log)
            def cleanup():
                release.touch();startup.touch()
                if process.poll() is None:
                    (case.state/'STOP').touch(exist_ok=True)
                    try:process.wait(timeout=3)
                    except subprocess.TimeoutExpired:process.terminate();process.wait(timeout=3)
            self.addCleanup(cleanup)
            deadline=time.monotonic()+3
            while not started.exists() and time.monotonic()<deadline:time.sleep(.005)
            self.assertTrue(started.exists());self.assertIsNone(process.poll())
            self.assertEqual(case.progress(),before)
            self.assertIsNone(observe(case.progress(),before,set(),process.poll() is None))
            startup.touch()
            record=None;deadline=time.monotonic()+3
            while record is None and time.monotonic()<deadline:
                record=observe(case.progress(),before,set(),process.poll() is None)
                if record is None:time.sleep(.005)
            self.assertIsNotNone(record);self.assertEqual(record['role'],'fix')
            (case.state/'STOP').write_text(json.dumps({'owner':'local-handoff-fixture','run_id':record['id']}))
            self.assertEqual(observe(case.progress(),before,set(),True)['id'],record['id'])
            release.touch();self.assertEqual(process.wait(timeout=4),0)
            after=case.progress()
            self.assertEqual(after['status'],'stopped')
            self.assertEqual(after['problems']['818']['status'],'review_pending')
            self.assertEqual([r['role'] for r in after['runs']],['fix'])
            self.assertEqual(after['runs'][0]['result']['outcome'],'ready')
            self.assertEqual(after['problems']['818']['reviews'],before['problems']['818']['reviews'])
            self.assertEqual(case.git('status','--porcelain'),'')

class StartupControls(unittest.TestCase):
    def test_dead_pid_refuses_unchanged_stopped_snapshot(self):
        before={'status':'stopped','runs':[],'current':None}
        with self.assertRaisesRegex(RuntimeError,'exited'):
            observe(before,before,set(),False)

    def test_changed_stopped_snapshot_refuses(self):
        before={'status':'stopped','runs':[],'current':None,'expected_head':'pinned'}
        for key,value in [('expected_head','other'),('runs',[{'id':'foreign'}]),('current',{'run_id':'foreign'})]:
            with self.subTest(key=key):
                changed=copy.deepcopy(before);changed[key]=value
                with self.assertRaises(RuntimeError):observe(changed,before,set(),True)

    def test_failed_state_and_premature_review_refuse(self):
        before={'status':'stopped','runs':[],'current':None}
        failed=copy.deepcopy(before);failed['status']='failed'
        with self.assertRaises(RuntimeError):observe(failed,before,set(),True)
        review={'status':'running','current':{'run_id':'new-review','problem_id':'818','stage':'review'},'runs':[]}
        with self.assertRaisesRegex(RuntimeError,'Missed'):observe(review,before,set(),True)

if __name__=='__main__':unittest.main(verbosity=2)
