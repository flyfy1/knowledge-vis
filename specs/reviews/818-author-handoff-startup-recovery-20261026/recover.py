"""One exact launch/arm/freeze recovery; never repeat import or reopen."""
import argparse
import copy
import fcntl
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import time
observe=None  # Loaded only after its reviewed bytes have been checked.

OWNER='818-search-author-startup-recovery-20261026-32c8d741'
HANDOFF_OWNER=OWNER+'-author-to-mac'
OLD_OWNER='import968972-search818-stage-a-20261026-4b7e902d'
DISPATCH='root-reviewed-818-search-author-startup-recovery-20261026'
PINS_SHA='70db45a389f137b558aa7d368bedc71866fc4016c6e3c6b347a61ef0031dbaa7'  # Preparation only until independent review and exact root dispatch.
OP_SHA='f0c4ac708a4b0209c7a6522787b38a04923ac922d61d8afa0dbecf7b8ad61698'
OLD_PINS_SHA='d56628ded5a693e10762ef8e99595eff5bcbf04832bea6094aa94622c1db1540'
REPO=Path('/home/songyy/projects/leetcode-hard-campaign-20261018')
STATE=Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018')


def require(ok,message):
    if not ok:raise RuntimeError(message)


def sha(raw):return hashlib.sha256(raw).hexdigest()


def initial_guard(state,old_receipt,stop_raw,pins):
    require(state['status']=='stopped' and state['current'] is None and state['expected_head']==pins['head'], 'Wrong stopped recovery snapshot')
    require(len(state['queue'])==984 and len(state['runs'])==423, 'Recovery queue/history count differs')
    entry=state['problems']['818']
    require(entry['status']=='changes_required' and entry['phase']=='fix' and entry['rounds']==1, '818 was already advanced or reopened differently')
    require(old_receipt['owner']==OLD_OWNER and old_receipt['status']=='failed-inspect-no-retry' and
            old_receipt['error']=='Runner not active while arming author handoff' and
            old_receipt['final_head']==pins['head'], 'Not the pinned completed-import startup failure')
    require(json.loads(stop_raw)['owner']==OLD_OWNER, 'Original STOP owner differs')


def write_raw_exclusive(path,raw):
    with path.open('xb') as stream:
        stream.write(raw);stream.flush();os.fsync(stream.fileno())
    fd=os.open(path.parent,os.O_RDONLY)
    try:os.fsync(fd)
    finally:os.close(fd)


def execute(op,pins):
    receipt=STATE/(OWNER+'.json');old_receipt_path=STATE/(OLD_OWNER+'.json')
    require(not receipt.exists(),'Existing recovery receipt: inspect, never retry')
    record={'owner':OWNER,'status':'preflight','created_at':op.imp.now(),'recovery_of':OLD_OWNER,
            'confirmed_cause':'H1: launched PID may be live before it replaces the exact persisted stopped prelaunch snapshot.',
            'prior_head':pins['head']}
    restore_raw=None
    with (STATE/(OWNER+'.lock')).open('a') as lock:
        fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
        op.save(receipt,record,exclusive=True)
        try:
            with (STATE/'release.lock').open('a') as release,op.imp.ownership(REPO,STATE):
                fcntl.flock(release,fcntl.LOCK_EX|fcntl.LOCK_NB)
                op.hashes_unchanged();op.boundary_guard()
                require(op.git('branch','--show-current')=='codex/all-hard-20261018','Wrong branch')
                before=op.imp.validate_checkout(REPO,STATE)
                old_raw=old_receipt_path.read_bytes();initial_raw=(STATE/'STOP').read_bytes()
                ledger_raw=(STATE/'releases.json').read_bytes()
                for raw,key in [(old_raw,'failed_receipt_sha256'),(initial_raw,'stop_sha256'),
                                ((STATE/'progress.json').read_bytes(),'progress_sha256'),(ledger_raw,'ledger_sha256')]:
                    require(sha(raw)==pins[key],'Pinned recovery input changed: '+key)
                initial_guard(before,json.loads(old_raw),initial_raw,pins)
                restore_raw=initial_raw
                require(op.imp.head(REPO)==pins['head'] and op.git('ls-remote','origin','refs/heads/codex/all-hard-20261018').split()[0]==pins['head'],'Actual/saved/remote head differ')
                require(op.git('rev-parse','HEAD:leetcode/818')==pins['lesson_tree'],'Frozen pre-author lesson changed')
                for path,digest in op.pins['documents'].items():
                    require(sha((REPO/path).read_bytes())==digest,'Adopted search request changed')
                plan=op.resume_plan(before,json.loads(ledger_raw))
                require(plan['next_problem_id']=='818' and not plan['registration_ids'],'Unexpected registration/agent before 818')
                record.update(status='validated-launch-only',publication_bound=plan['publication_bound']);op.save(receipt,record)
            # Ownership locks must be released before the ordinary runner can acquire them.
            op.boundary_guard();op.hashes_unchanged()
            require((STATE/'progress.json').read_bytes() and sha((STATE/'progress.json').read_bytes())==pins['progress_sha256'] and
                    (STATE/'STOP').read_bytes()==initial_raw and (STATE/'releases.json').read_bytes()==ledger_raw and
                    old_receipt_path.read_bytes()==old_raw and op.imp.head(REPO)==pins['head'] and not op.imp.changed_paths(REPO),'Recovery inputs changed before launch')
            (STATE/'STOP').unlink()
            launched=json.loads(subprocess.check_output([sys.executable,str(STATE/'launch.py'),'--continuous','--max-rounds','6'],cwd=REPO,text=True))
            record.update(status='awaiting-fresh-fix',launch=launched);op.save(receipt,record)
            require(launched['continuous'] and launched['queue_count']==984,'Launch selection differs')
            old_ids={r['id'] for r in before['runs']};old_sessions={s for r in before['runs'] for s in r.get('session_ids',[])}
            evidence=None;armed=None;before_fix=None;deadline=time.monotonic()+60
            while time.monotonic()<deadline:
                procs=op.processes();live=launched['pid'] in procs
                resumed=op.read(STATE/'progress.json')
                fresh=observe(resumed,before,old_ids,live,op.fresh_fix_record)
                if fresh is not None and armed is None:
                    stop={'owner':HANDOFF_OWNER,'transaction':OWNER,'recovery_of':OLD_OWNER,'created_at':op.imp.now(),
                          'reason':'Finish only this fresh 818 fix; stop before review for exact Mac measurements. Reviewed Stage B required.', 'run_id':fresh['id']}
                    op.save(STATE/'STOP',stop,exclusive=True);restore_raw=(STATE/'STOP').read_bytes();armed=fresh['id']
                    record.update(status='author-stop-written-awaiting-native-proof',handoff_stop=stop);op.save(receipt,record)
                    resumed=op.read(STATE/'progress.json')
                    require(op.fresh_fix_record(resumed,old_ids)['id']==armed,'Fix left before STOP arm completed')
                if armed:
                    op.owned_stop(restore_raw)
                    evidence=op.new_run_evidence(resumed,old_ids,old_sessions,'818',procs,launched['pid'])
                    if evidence:break
                time.sleep(.1)
            require(evidence is not None and armed,'Fresh fix/thread/turn/native proof absent')
            resumed=op.read(STATE/'progress.json')
            require(op.fresh_fix_record(resumed,old_ids)['id']==armed,'Fix completed before armed proof')
            fresh=next(r for r in resumed['runs'] if r['id']==armed)
            require(fresh['role']=='fix' and evidence['current']['run_id']==armed and evidence['current']['stage']=='fix','Wrong fresh stage')
            require(Path(fresh['directory']).resolve()==(STATE/'runs'/armed).resolve(),'Fresh run directory differs')
            record['ordinary_resume_proof']=op.verify_registered_resume(before,resumed,pins['head'],plan,fresh)
            worker=op.workers(op.processes());require(set(worker)=={launched['pid']},'Not exactly the launched central worker')
            for flag,value in [('--publish-every','20'),('--max-rounds','6'),('--state-dir',str(STATE))]:
                args=worker[launched['pid']]['args'];require(args.count(flag)==1 and args[args.index(flag)+1]==value,'Runner flags differ')
            require((STATE/'releases.json').read_bytes()==ledger_raw and old_receipt_path.read_bytes()==old_raw,'Ledger/prior receipt changed')
            before_fix=copy.deepcopy(resumed)
            record.update(status='author-running-stop-armed',fresh_author=evidence,pre_author_head=pins['head'],zero_new_818_reviews=True);op.save(receipt,record)
            deadline=time.monotonic()+6000
            while (Path('/proc')/str(launched['pid'])).exists():
                op.owned_stop(restore_raw);current=op.read(STATE/'progress.json')
                require(len(current['runs'])==len(before_fix['runs']) and current['status']!='failed','Extra agent or failed author at boundary')
                require(time.monotonic()<deadline,'Natural author wait budget exceeded; retain STOP')
                time.sleep(5)
            op.boundary_guard()
            with (STATE/'release.lock').open('a') as release,op.imp.ownership(REPO,STATE):
                fcntl.flock(release,fcntl.LOCK_EX|fcntl.LOCK_NB)
                stopped=op.imp.validate_checkout(REPO,STATE);op.hashes_unchanged();op.owned_stop(restore_raw)
                require(old_receipt_path.read_bytes()==old_raw,'Failed Stage A receipt changed')
                frozen=op.freeze_author(before_fix,stopped,evidence,dict(record,_ledger_raw=ledger_raw),restore_raw)
                record.update(status='waiting-for-Mac',stage_a_complete=True,completed_at=op.imp.now(),frozen_author=frozen,
                              release_ledger_preserved=True,owned_stop_present=True,failed_stage_a_receipt_preserved=True,
                              recovery='Keep this recovery author-to-Mac STOP. Root measures exact candidate; separately reviewed Stage B binds this successful recovery receipt. No review or acceptance yet.')
                op.save(receipt,record)
            print(json.dumps(record),flush=True)
        except BaseException as error:
            if restore_raw is not None and not (STATE/'STOP').exists():write_raw_exclusive(STATE/'STOP',restore_raw)
            record.update(status='failed-inspect-no-retry',error=str(error) or type(error).__name__,
                          recovery='Keep failed original/recovery receipts and actual source/state. Never reimport, reopen, reset, relaunch or signal an agent. Inspect exact STOP owner.')
            op.save(receipt,record);raise


def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__)
    for name in ('pins','stage-a-operator','stage-a-pins'):parser.add_argument('--'+name,type=Path,required=True)
    parser.add_argument('--dispatch',required=True);args=parser.parse_args(argv)
    require(args.dispatch==DISPATCH and PINS_SHA is not None,'Exact reviewed root dispatch and frozen pins required')
    raw=args.pins.read_bytes();require(sha(raw)==PINS_SHA,'Recovery pins differ')
    require(sha(args.stage_a_operator.read_bytes())==OP_SHA and sha(args.stage_a_pins.read_bytes())==OLD_PINS_SHA,'Frozen Stage A helper/pins differ')
    pins=json.loads(raw)
    require(sha(Path(__file__).with_name('startup_observer.py').read_bytes())==pins['observer_sha256'],'Reviewed observer differs')
    os.environ.update(PATH='/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin',NODE_PATH='/home/songyy/projects/integ-games/node_modules',PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/home/songyy/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome',PYTHONDONTWRITEBYTECODE='1')
    sys.path.insert(0,str(REPO/'scripts'))
    spec=importlib.util.spec_from_file_location('frozen_stage_a',args.stage_a_operator)
    op=importlib.util.module_from_spec(spec);spec.loader.exec_module(op)
    op.pins=json.loads(args.stage_a_pins.read_bytes());op.REPO=REPO;op.STATE=STATE
    op.hashes_unchanged()  # Refuse changed runtime modules before importing them.
    observer_path=Path(__file__).with_name('startup_observer.py')
    observer_spec=importlib.util.spec_from_file_location('reviewed_startup_observer',observer_path)
    observer=importlib.util.module_from_spec(observer_spec);observer_spec.loader.exec_module(observer)
    global observe
    observe=observer.observe
    import import_leetcode_lane as imp
    op.imp=imp
    op.OWNER=OWNER;op.HANDOFF_OWNER=HANDOFF_OWNER;op.RECEIPT=STATE/(OWNER+'.json')
    execute(op,pins)

if __name__=='__main__':
    def interrupted(signum,_frame):raise InterruptedError(f'Signal {signum}; no agent signaled')
    signal.signal(signal.SIGTERM,interrupted)
    main()
