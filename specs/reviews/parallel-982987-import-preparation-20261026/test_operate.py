"""Local one-off interface checks, no SSH or real agents."""
import copy
import importlib.util
import json
import os
from pathlib import Path
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[2]
sys.path.insert(0,str(ROOT/'scripts'))
import import_leetcode_lane as imp
import test_leetcode_campaign as fixtures

def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);return module
op=load('pair982987',HERE/'operate.py')
OLD=ROOT/'specs/reviews/parallel-968972-import-818-search-preparation-20261026/operate.py'

class Guards(unittest.TestCase):
    def test_default_refuses_before_file_or_runtime_access(self):
        with patch.object(op,'PINS_SHA',None),self.assertRaisesRegex(RuntimeError,'Preparation only'):
            op.main(['--dispatch',op.DISPATCH,'--pins','/missing','--helper','/missing'])
    def test_pending_unaccepted_or_missing_runtime_pins_refuse(self):
        pins=json.loads((HERE/'pins.json').read_bytes())
        pins['status']='pending'
        with self.assertRaises(RuntimeError):op.pins_ready(pins)
        pins.update(status='frozen-accepted-pair',lanes={pid:{'entry':{'status':'accepted_local','phase':'done'}} for pid in op.IDS})
        op.pins_ready(pins)
        pins['lanes']['987']['entry']['status']='review_pending'
        with self.assertRaisesRegex(RuntimeError,'Unaccepted'):op.pins_ready(pins)
        pins['lanes']['987']['entry']['status']='accepted_local'
        for path in ('scripts/import_leetcode_lane.py',op.STATIC_PATH):
            saved=pins['policy'].pop(path)
            with self.assertRaisesRegex(RuntimeError,'runtime/policy'):op.pins_ready(pins)
            pins['policy'][path]=saved
        pins['policy'][op.STATIC_PATH]='wrong'
        with self.assertRaisesRegex(RuntimeError,'static publisher'):op.pins_ready(pins)
    def test_changed_importer_is_refused_before_module_execution(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);repo=root/'repo';state=root/'state';state.mkdir()
            pins=json.loads((HERE/'pins.json').read_bytes())
            pins.update(status='frozen-accepted-pair',lanes={pid:{'entry':{'status':'accepted_local','phase':'done'}} for pid in op.IDS})
            marker=root/'importer-executed';expected=b'# fixture source\n'
            pins['policy']={name:op.sha(expected) for name in op.REQUIRED_POLICY}
            pins['policy'][op.POLICY_PATH]=op.POLICY_SHA
            pins['policy'][op.STATIC_PATH]=op.STATIC_SHA
            for name in pins['policy']:
                target=repo/name;target.parent.mkdir(parents=True,exist_ok=True)
                target.write_bytes((ROOT/op.POLICY_PATH).read_bytes() if name==op.POLICY_PATH else (ROOT/op.STATIC_PATH).read_bytes() if name==op.STATIC_PATH else expected)
            (repo/'scripts/import_leetcode_lane.py').write_text('from pathlib import Path\nPath('+repr(str(marker))+').touch()\n')
            (state/'launch.py').write_bytes(expected);pins['launcher_sha256']=op.sha(expected)
            pinpath=root/'pins.json';pinpath.write_text(json.dumps(pins))
            with patch.object(op,'PINS_SHA',op.sha(pinpath.read_bytes())),patch.object(op,'REPO',repo),patch.object(op,'STATE',state),self.assertRaisesRegex(RuntimeError,'Policy/runtime changed'):
                op.main(['--dispatch',op.DISPATCH,'--pins',str(pinpath),'--helper',str(OLD)])
            self.assertFalse(marker.exists())
            (repo/'scripts/import_leetcode_lane.py').write_bytes(expected)
            (repo/op.STATIC_PATH).write_text('from pathlib import Path\nPath('+repr(str(marker))+').touch()\n')
            with patch.object(op,'PINS_SHA',op.sha(pinpath.read_bytes())),patch.object(op,'REPO',repo),patch.object(op,'STATE',state),self.assertRaisesRegex(RuntimeError,'Policy/runtime changed'):
                op.main(['--dispatch',op.DISPATCH,'--pins',str(pinpath),'--helper',str(OLD)])
            self.assertFalse(marker.exists())

    def test_reservation_preservation_and_active_other_lane(self):
        before={f'lane-{pid}-reservation.json':json.dumps({'id':pid,'status':'started','old':'preserve'}).encode() for pid in op.IDS}
        op.reservation_guard(before,op.IDS)
        with self.assertRaises(RuntimeError):op.reservation_guard(before)
        after=copy.deepcopy(before);one={'982':{'merged_head':'new','receipt':'receipt'}}
        after['lane-982-reservation.json']=json.dumps({'id':'982','status':'imported','old':'preserve','imported_head':'new','import_receipt':'receipt'}).encode()
        op.preserve_reservations(before,after,one)
        after['lane-987-reservation.json']=b'{"id":"987","status":"cancelled"}'
        with self.assertRaisesRegex(RuntimeError,'Unrelated'):op.preserve_reservations(before,after,one)
    def test_stopped_startup_only_exact_snapshot_and_live_pid(self):
        before={'status':'stopped','runs':[],'current':None,'expected_head':'before'}
        self.assertIsNone(op.ordinary_start_observation(before,before,set(),True,'839'))
        for live,state in [(False,before),(True,{**before,'expected_head':'changed'}),(True,{**before,'status':'failed'})]:
            with self.assertRaises(RuntimeError):op.ordinary_start_observation(state,before,set(),live,'839')
    def test_new_wrong_agent_or_completed_run_refuses(self):
        before={'status':'stopped'}
        state={'status':'running','current':{'run_id':'new','problem_id':'839','stage':'review'},'runs':[{'id':'new','status':'running','role':'review'}]}
        self.assertEqual(op.ordinary_start_observation(state,before,set(),True,'839')['id'],'new')
        with self.assertRaises(RuntimeError):op.ordinary_start_observation(state,before,set(),True,'982')
        state['runs'][0]['status']='completed'
        with self.assertRaises(RuntimeError):op.ordinary_start_observation(state,before,set(),True,'839')
    def test_actual_gated_runner_startup_and_natural_stop(self):
        fixture=load('delayed_launch_fixture',ROOT/'specs/reviews/818-author-handoff-startup-recovery-20261026/test_startup.py')
        case=fixture.DelayedActualRunner('test_delayed_launch_waits_then_arms_fresh_fix_before_review')
        result=unittest.TestResult()
        with patch.object(fixture,'observe',side_effect=lambda state,before,ids,alive:op.ordinary_start_observation(state,before,ids,alive,'818')):
            case.run(result)
        self.assertTrue(result.wasSuccessful(),str(result.errors)+str(result.failures))
    def test_existing_publication_bound_keeps_18_plus_2_refusal(self):
        import leetcode_publish as publisher
        import leetcode_registry as registry
        helper=load('publication_helpers',OLD);helper.REOPEN_IDS=();helper.imp=SimpleNamespace(head=lambda repo:'head')
        for count,allowed in ((15,True),(18,False)):
            state={'queue':[str(i) for i in range(1,count+1)],'problems':{str(i):{'status':'accepted_local','candidate':'candidate'} for i in range(1,count+1)}}
            accepted={pid:{'digest':'changed-'+pid} for pid in state['queue']}
            with patch.object(publisher,'_reviewed',return_value=accepted),patch.object(registry,'read_registry',return_value=[]):
                if allowed:self.assertEqual(helper.publication_bound(state,{'pending':None,'released':{}},op.IDS)['upper_bound'],17)
                else:
                    with self.assertRaisesRegex(RuntimeError,'reaches 20'):
                        helper.publication_bound(state,{'pending':None,'released':{}},op.IDS)

    def test_pending_registration_and_pending_release_keep_refusal(self):
        import leetcode_publish as publisher
        import leetcode_registry as registry
        helper=load('registration_bound_helpers',OLD);helper.REOPEN_IDS=();helper.imp=SimpleNamespace(head=lambda repo:'head')
        ids=[str(i) for i in range(1,18)]
        state={'queue':ids+['99'],'problems':{pid:{'status':'accepted_local','candidate':'candidate'} for pid in ids}}
        state['problems']['99']={'status':'review_passed','phase':'register'}
        accepted={pid:{'digest':'new-'+pid}for pid in ids}
        with patch.object(publisher,'_reviewed',return_value=accepted),patch.object(registry,'read_registry',return_value=[]):
            with self.assertRaisesRegex(RuntimeError,'reaches 20'):helper.publication_bound(state,{'pending':None,'released':{}},op.IDS)
            with self.assertRaisesRegex(RuntimeError,'Pending release'):helper.publication_bound(state,{'pending':{'id':'active'},'released':{}},op.IDS)


    def test_restore_never_overwrites_foreign_stop(self):
        with tempfile.TemporaryDirectory() as directory,patch.object(op,'STATE',Path(directory)):
            stop=Path(directory)/'STOP';stop.write_bytes(b'foreign')
            op.restore_if_absent(b'ours');self.assertEqual(stop.read_bytes(),b'foreign')
            stop.unlink();op.restore_if_absent(b'ours');self.assertEqual(stop.read_bytes(),b'ours')

class QueueDriftDuringExecute(unittest.TestCase):
    def exercise(self,when):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);state=root/'state';state.mkdir()
            previous={'status':'running','expected_head':'head','queue':[str(i) for i in range(1,985)],'runs':[],'problems':{}}
            write=lambda path,value:path.write_text(json.dumps(value))
            read=lambda path:json.loads(path.read_text())
            write(state/'progress.json',previous);write(state/'releases.json',{'pending':None,'released':{}})
            central=765432109;(state/'runner.pid').write_text(str(central));finished=False
            def drift():
                value=read(state/'progress.json');value['queue'][0],value['queue'][1]=value['queue'][1],value['queue'][0]
                write(state/'progress.json',value)
            def git(*args):
                if args[0]=='branch':return 'codex/all-hard-20261018'
                return ''
            def finish_wait(_seconds):
                nonlocal finished
                if when=='during-wait':drift()
                value=read(state/'progress.json');value['status']='stopped';write(state/'progress.json',value);finished=True
            def save(path,value,exclusive=False):
                with path.open('x' if exclusive else 'w') as out:json.dump(value,out)
            helper=load('queue_helpers',OLD)
            canonical=helper.canonical
            fake=SimpleNamespace(pins={'queue_sha256':canonical(previous['queue']),'release':{'ledger_sha256':op.sha((state/'releases.json').read_bytes())}},canonical=canonical,
                imp=SimpleNamespace(now=lambda:'fixture-time',head=lambda repo:'head',validate_checkout=lambda *args:read(state/'progress.json')),
                hashes_unchanged=lambda:None,lane_preflight=lambda value:[],git=git,read=read,save=save,
                processes=lambda:{central:{}},workers=lambda procs:procs,resume_plan=lambda *a,**kw:drift() if when=='before-stop' else {},
                boundary_guard=lambda:None,owned_stop=lambda raw:self.assertEqual((state/'STOP').read_bytes(),raw))
            original_exists=Path.exists
            def exists(path):
                return not finished if path==Path('/proc')/str(central) else original_exists(path)
            with patch.object(op,'STATE',state),patch.object(op,'no_lane_processes'),patch.object(op,'initial_guard'),patch.object(op.time,'sleep',side_effect=finish_wait),patch.object(Path,'exists',exists),patch.object(op,'import_pair',side_effect=RuntimeError('BUG: drift reached import step')) as imports:
                with self.assertRaisesRegex(RuntimeError,'Finite queue identity differs'):
                    op.execute(fake)
                self.assertEqual(imports.call_count,0)
            self.assertEqual((state/'STOP').exists(),when=='during-wait')
            self.assertEqual(read(state/(op.OWNER+'.json'))['status'],'failed-inspect-no-retry')
    def test_changed_order_after_projection_refused_before_stop(self):self.exercise('before-stop')
    def test_changed_order_during_wait_refused_before_import(self):self.exercise('during-wait')


class PartialImport(unittest.TestCase):
    def test_second_import_failure_retains_first_receipt_and_reservation(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);state=root/'central';state.mkdir();stop=b'{"owner":"fixture"}'
            (state/'STOP').write_bytes(stop)
            baseline={'problems':{},'runs':[],'queue':['982','987'],'lane_imports':[]}
            save=lambda path,value:path.write_text(json.dumps(value))
            read=lambda path:json.loads(path.read_text())
            save(state/'progress.json',baseline)
            lanes={};pins={'lanes':{}}
            for pid in op.IDS:
                lane=root/pid;lane.mkdir();lane_state={'problems':{pid:{'status':'accepted_local'}},'runs':[]}
                save(lane/'progress.json',lane_state);reservation={'id':pid,'status':'started','repo':str(lane),'state_dir':str(lane)}
                save(state/f'lane-{pid}-reservation.json',reservation);lanes[pid]=(lane,lane)
                pins['lanes'][pid]={'progress_sha256':op.sha((lane/'progress.json').read_bytes()),'head':pid+'head','reservation':reservation}
            calls=[]
            def do_import(repo,directory,lane_repo,lane_state,pid):
                calls.append(pid)
                if pid=='987':raise RuntimeError('deterministic second import failure')
                now=read(state/'progress.json');now['problems'][pid]={'status':'accepted_local'};now['lane_imports'].append({'receipt':'real-first-receipt'})
                save(state/'progress.json',now)
                return {'merged_head':'first-merged-head'}
            helper=SimpleNamespace(pins=pins,owned_stop=lambda raw:self.assertEqual((state/'STOP').read_bytes(),raw),boundary_guard=lambda:None,hashes_unchanged=lambda:None,lane_paths=lambda pid:lanes[pid],read=read,save=save,
                                   imp=SimpleNamespace(head=lambda repo:repo.name+'head',import_lane=do_import))
            record={'imports':[]};receipt=state/'operation.json'
            with patch.object(op,'STATE',state),self.assertRaisesRegex(RuntimeError,'second import failure'):
                op.import_pair(helper,baseline,record,receipt,stop)
            self.assertEqual(calls,['982','987'])
            self.assertEqual(read(state/'lane-982-reservation.json')['status'],'imported')
            self.assertEqual(read(state/'lane-987-reservation.json')['status'],'started')
            self.assertEqual(len(read(receipt)['imports']),1)
            self.assertEqual(read(state/'progress.json')['problems'],{'982':{'status':'accepted_local'}})
            self.assertEqual((state/'STOP').read_bytes(),stop)


class ImportOnly(unittest.TestCase):
    def test_operator_has_no_policy_or_reopen_mutation_path(self):
        import ast
        tree=ast.parse((HERE/'operate.py').read_text())
        self.assertFalse(hasattr(op,'policy_transition'))
        calls=[node for node in ast.walk(tree) if isinstance(node,ast.Call)]
        for node in calls:
            if isinstance(node.func,ast.Attribute):
                self.assertNotIn(node.func.attr,('adopt_reopen','freeze_author','accepted818_guard'))
                if node.func.attr=='git' and node.args and isinstance(node.args[0],ast.Constant):
                    self.assertNotIn(node.args[0].value,('apply','commit','add','fetch','checkout','reset'))
        self.assertIn('op.REOPEN_IDS=()', (HERE/'operate.py').read_text())
    def test_frozen_identity_release_and_pending_refuse_before_stop(self):
        helper=load('initial_helpers',OLD)
        with tempfile.TemporaryDirectory() as directory,patch.object(op,'STATE',Path(directory)):
            path=Path(directory)/'releases.json';receipt={'id':'release','revision':'commit','verification':{'lessons':20}}
            ledger={'pending':None,'releases':[receipt]};path.write_text(json.dumps(ledger))
            state={'expected_head':'head','current':{'run_id':'run','problem_id':'854','stage':'author'}}
            pins={'central':{'head':'head','current':state['current'],'runner_pid':7},'release':{'ledger_sha256':op.sha(path.read_bytes()),'id':'release','revision':'commit','receipt_sha256':helper.canonical(receipt)}}
            fake=SimpleNamespace(pins=pins,canonical=helper.canonical)
            op.initial_guard(fake,state,7)
            for changed,pid in [({**state,'expected_head':'new'},7),({**state,'current':{'run_id':'new'}},7),(state,8)]:
                with self.assertRaisesRegex(RuntimeError,'identity advanced'):op.initial_guard(fake,changed,pid)
            ledger['pending']={'id':'other'};path.write_text(json.dumps(ledger))
            with self.assertRaisesRegex(RuntimeError,'ledger/pending'):op.initial_guard(fake,state,7)
            self.assertFalse((Path(directory)/'STOP').exists())

class Registration(unittest.TestCase):
    def test_actual_runner_registration_and_review_history_proof(self):
        old=load('register_fixture',ROOT/'specs/reviews/parallel-940956-import-policy-preparation-20261026/test_register_boundary.py')
        helper=load('current_register_helper',OLD);helper.REOPEN_IDS=()
        # Exercise the actual current helper verifier against the established real-runner fixture.
        for method in ['test_real_registration_head_and_unchanged_review_proof','test_unrelated_post_registration_head_is_rejected','test_review_boundary_refreshes_candidate_without_rewriting_prior_reviews']:
            case=old.RegisterBoundary(method);result=unittest.TestResult()
            original_plan=old.op.resume_plan
            def plan(state,ledger,incoming=()):
                with patch.object(helper,'publication_bound',return_value={}):return helper.resume_plan(state,ledger,incoming)
            with patch.object(old.op,'resume_plan',side_effect=plan),patch.object(old.op,'verify_registered_resume',side_effect=lambda before,resumed,head,plan,run: self.verify(helper,old.op,before,resumed,head,plan,run)):
                case.run(result)
            self.assertTrue(result.wasSuccessful(),str(result.errors)+str(result.failures))
    def verify(self,helper,original,before,resumed,head,plan,run):
        with patch.object(helper,'REPO',original.REPO),patch.object(helper,'STATE',original.STATE),patch.object(helper,'imp',original.imp):
            return helper.verify_registered_resume(before,resumed,head,plan,run)

if __name__=='__main__':unittest.main(verbosity=2)
