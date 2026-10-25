"""Import only the pinned accepted pair, preserve policy and resume the normal queue."""
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

OWNER='import982987-only-20261026-891ce2d4'
DISPATCH='root-reviewed-import982987-only-20261026'
PINS_SHA='0d9dec18554ed18154ac5b4137371b08382bd217c290149fd048a46987387a01'  # Frozen for independent final review; separate root dispatch required.
HELPER_SHA='f0c4ac708a4b0209c7a6522787b38a04923ac922d61d8afa0dbecf7b8ad61698'
POLICY_PATH='specs/leetcode-rendered-state-contract.md'
POLICY_SHA='816990a6035d174692115767e5332be077ba79d3400bdcfc3f5f2e6f47c0002c'
STATIC_PATH='scripts/leetcode_static_versions.py'
STATIC_SHA='f92eca0575bfcf74a4b68b9d011470e99415f12b671328bba1cebf035ddfd12e'
IDS=('982','987')
REQUIRED_POLICY={'scripts/import_leetcode_lane.py','scripts/leetcode_campaign.py','scripts/leetcode_publish.py',
                 'scripts/leetcode_registry.py','scripts/register_leetcode_lesson.py','scripts/campaign-prompts/author.md',
                 'scripts/campaign-prompts/fix.md','scripts/campaign-prompts/review.md','specs/leetcode-explainers.md',
                 'specs/leetcode-review-gates.md',POLICY_PATH,STATIC_PATH}
REPO=Path('/home/songyy/projects/leetcode-hard-campaign-20261018')
STATE=Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018')


def require(ok,message):
    if not ok:raise RuntimeError(message)


def sha(raw):return hashlib.sha256(raw).hexdigest()


def pins_ready(pins):
    require(pins.get('ids')==list(IDS) and pins.get('status')=='frozen-accepted-pair', 'Acceptance pins are not frozen')
    require(set(pins.get('lanes',{}))==set(IDS) and all(pins['lanes'][pid] is not None for pid in IDS), 'Both completed acceptance pins required')
    require(REQUIRED_POLICY <= set(pins['policy']),'Required runtime/policy pins missing')
    require(pins['policy'][STATIC_PATH]==STATIC_SHA,'Approved static publisher module pin differs')
    require(pins['policy'][POLICY_PATH]==POLICY_SHA,'Unexpected frozen policy')
    require(all(pins['lanes'][pid]['entry']['status']=='accepted_local' and pins['lanes'][pid]['entry']['phase']=='done' for pid in IDS), 'Unaccepted lane pins')


def initial_guard(op,state,runner):
    frozen=op.pins['central']
    require(state['expected_head']==frozen['head'] and state['current']==frozen['current'] and runner==frozen['runner_pid'], 'Frozen central dispatch identity advanced; reprepare before STOP')
    raw=(STATE/'releases.json').read_bytes();ledger=json.loads(raw);release=op.pins['release']
    require(sha(raw)==release['ledger_sha256'] and ledger['pending'] is None, 'Release ledger/pending differs')
    require(ledger['releases'][-1]['id']==release['id'] and ledger['releases'][-1]['revision']==release['revision'] and op.canonical(ledger['releases'][-1])==release['receipt_sha256'], 'Completed public release identity differs')


def reservations(directory):
    return {p.name:p.read_bytes() for p in directory.glob('lane-*-reservation.json')}


def reservation_guard(raw,allowed_started=()):
    for name,data in raw.items():
        value=json.loads(data)
        require(name=='lane-'+str(value['id'])+'-reservation.json','Reservation identity mismatch')
        require(value['status'] in ('imported','cancelled','canceled') or
                (value['status']=='started' and str(value['id']) in allowed_started), 'Other active/pending lane prevents pair import')


def preserve_reservations(before,after,imported):
    require(set(before)==set(after),'Reservation set changed')
    for name,raw in before.items():
        pid=str(json.loads(raw)['id'])
        if pid not in imported:require(after[name]==raw,'Unrelated reservation changed')
        else:
            previous=json.loads(raw);current=json.loads(after[name]);expected=dict(previous)
            expected.update(status='imported',imported_head=imported[pid]['merged_head'],import_receipt=imported[pid]['receipt'])
            require(current==expected,'Imported reservation changed unrelated fields')


def ordinary_start_observation(state,before,old_ids,alive,expected):
    require(alive,'Exact launched runner exited')
    if state.get('status')=='stopped':
        require(state==before,'Stopped startup snapshot changed')
        return None
    require(state.get('status')=='running','Runner failed or left startup')
    current=state.get('current') or {}
    if not current.get('run_id') or current['run_id'] in old_ids:return None
    require(current.get('problem_id')==expected,'Unexpected first fresh agent')
    run=next((r for r in state['runs'] if r['id']==current['run_id']),None)
    require(run and run['status']=='running' and run['role']==current['stage'],'Fresh agent already completed or identity differs')
    return run


def no_lane_processes(op):
    require(not any(x['cwd'].startswith('/home/songyy/projects/leetcode-hard-lane-') for x in op.processes().values()), 'Active lane checkout process prevents pair import')


def import_pair(op,before,record,receipt,stop_raw):
    imported={};res_before=reservations(STATE)
    for pid in IDS:
        op.owned_stop(stop_raw);op.boundary_guard();op.hashes_unchanged()
        lane_repo,lane_state=op.lane_paths(pid)
        frozen=op.pins['lanes'][pid];lane=op.read(lane_state/'progress.json')
        require(sha((lane_state/'progress.json').read_bytes())==frozen['progress_sha256'] and op.imp.head(lane_repo)==frozen['head'],'Lane moved after accepted preflight')
        require(op.read(STATE/f'lane-{pid}-reservation.json')==frozen['reservation'],'Reservation changed before import')
        # Existing deep importer owns checkout/state locks, fingerprints and merge validation.
        result=op.imp.import_lane(REPO,STATE,lane_repo,lane_state,pid)
        after=op.read(STATE/'progress.json')
        require(after['problems'][pid]==lane['problems'][pid],'Imported acceptance changed')
        imported[pid]={'merged_head':result['merged_head'],'receipt':after['lane_imports'][-1]['receipt']}
        record['imports'].append(result);op.save(receipt,record)
        reservation=dict(frozen['reservation'],status='imported',imported_head=result['merged_head'],import_receipt=imported[pid]['receipt'])
        op.save(STATE/f'lane-{pid}-reservation.json',reservation)
        preserve_reservations(res_before,reservations(STATE),imported)
    after=op.imp.validate_checkout(REPO,STATE);op.import_metadata_preserved(before,after)
    require(after['queue']==before['queue'],'Queue changed')
    return after,reservations(STATE)


def restore_if_absent(raw):
    if raw is not None and not (STATE/'STOP').exists():
        with (STATE/'STOP').open('xb') as stream:stream.write(raw);stream.flush();os.fsync(stream.fileno())


def execute(op):
    receipt=STATE/(OWNER+'.json');require(not receipt.exists(),'Existing transaction: inspect, never retry')
    record={'owner':OWNER,'status':'preflight','created_at':op.imp.now(),'imports':[]};stop_raw=None
    with (STATE/(OWNER+'.lock')).open('a') as lock:
        fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB);op.save(receipt,record,exclusive=True)
        try:
            op.hashes_unchanged();require(not (STATE/'STOP').exists(),'Existing STOP must not be replaced')
            require(op.git('branch','--show-current')=='codex/all-hard-20261018','Unexpected central branch')
            latest=op.read(STATE/'progress.json')
            require(latest['status']=='running' and latest['expected_head']==op.imp.head(REPO) and len(latest['queue'])==984,'Central checkpoint differs')
            require(op.canonical(latest['queue'])==op.pins['queue_sha256'],'Finite queue identity differs')
            record['lanes']=op.lane_preflight(latest)
            reservation_guard(reservations(STATE),IDS);no_lane_processes(op)
            latest=op.read(STATE/'progress.json');central=int((STATE/'runner.pid').read_text())
            require(set(op.workers(op.processes()))=={central},'Expected one central runner and no lane worker')
            require(all(pid not in latest['problems'] and not any(r['problem_id']==pid for r in latest['runs']) for pid in IDS),'Central reached reserved ID')
            initial_guard(op,latest,central)
            record['pre_stop_plan']=op.resume_plan(latest,op.read(STATE/'releases.json'),incoming=IDS)
            stop={'owner':OWNER,'created_at':op.imp.now(),'reason':'Finish current stage; import independently accepted982/987 under unchanged policy, then resume the normal queue.','lane_ids':list(IDS)}
            pre_stop=op.read(STATE/'progress.json');initial_guard(op,pre_stop,central)
            pre_stop_queue=pre_stop['queue']
            require(len(pre_stop_queue)==984 and op.canonical(pre_stop_queue)==op.pins['queue_sha256'],'Finite queue identity differs before STOP')
            op.save(STATE/'STOP',stop,exclusive=True);stop_raw=(STATE/'STOP').read_bytes()
            record.update(status='waiting-for-natural-boundary',stop=stop);op.save(receipt,record)
            deadline=time.monotonic()+6000
            while (Path('/proc')/str(central)).exists():
                op.owned_stop(stop_raw);require(op.read(STATE/'progress.json')['status']!='failed','Central failed before boundary')
                require(time.monotonic()<deadline,'Natural boundary wait exceeded budget');time.sleep(5)
            op.boundary_guard();baseline=op.imp.validate_checkout(REPO,STATE)
            require(baseline['status']=='stopped','Not an ordinary stopped boundary')
            require(len(baseline['queue'])==984 and op.canonical(baseline['queue'])==op.pins['queue_sha256'],'Finite queue identity differs before import')
            op.lane_preflight(baseline);ledger_raw=(STATE/'releases.json').read_bytes()
            require(sha(ledger_raw)==op.pins['release']['ledger_sha256'],'Release ledger moved before boundary')
            record['boundary_plan']=op.resume_plan(baseline,json.loads(ledger_raw),incoming=IDS)
            record.update(status='importing-old-policy',boundary_head=baseline['expected_head']);op.save(receipt,record)
            with (STATE/'release.lock').open('a') as release:
                fcntl.flock(release,fcntl.LOCK_EX|fcntl.LOCK_NB)
                after,res_after=import_pair(op,baseline,record,receipt,stop_raw)
                require((STATE/'releases.json').read_bytes()==ledger_raw,'Import changed ledger')
                with op.imp.ownership(REPO,STATE):
                    op.boundary_guard();op.hashes_unchanged();op.owned_stop(stop_raw)
                    require(op.imp.validate_checkout(REPO,STATE)==after,'State changed after imports')
                    reservation_guard(res_after);no_lane_processes(op)
                    record['post_import_plan']=op.resume_plan(after,json.loads(ledger_raw))
                    head=after['expected_head']
                    op.hashes_unchanged()
                    op.git('push','origin',head+':refs/heads/codex/all-hard-20261018')
                    require(op.git('ls-remote','origin','refs/heads/codex/all-hard-20261018').split()[0]==head,'Exact imported head push not verified')
                    record.update(status='imported-pushed-still-stopped',imported_head=head,policy_preserved=True);op.save(receipt,record)
            op.boundary_guard();op.hashes_unchanged();op.owned_stop(stop_raw);reservation_guard(reservations(STATE));no_lane_processes(op)
            require(op.read(STATE/'progress.json')==after and op.imp.head(REPO)==head and not op.imp.changed_paths(REPO) and
                    (STATE/'releases.json').read_bytes()==ledger_raw and reservations(STATE)==res_after,'Inputs changed before resume')
            plan=op.resume_plan(after,json.loads(ledger_raw));expected=plan['next_problem_id']
            old_ids={r['id'] for r in after['runs']};old_sessions={sid for r in after['runs'] for sid in r.get('session_ids',[])}
            (STATE/'STOP').unlink()
            launch=json.loads(subprocess.check_output([sys.executable,str(STATE/'launch.py'),'--continuous','--max-rounds','6'],cwd=REPO,text=True))
            record.update(status='awaiting-fresh-agent',launch=launch);op.save(receipt,record)
            require(launch['continuous'] and launch['queue_count']==984,'Launch scope differs')
            evidence=None;deadline=time.monotonic()+60
            while time.monotonic()<deadline:
                procs=op.processes();resumed=op.read(STATE/'progress.json')
                fresh=ordinary_start_observation(resumed,after,old_ids,launch['pid'] in procs,expected)
                if fresh:
                    evidence=op.new_run_evidence(resumed,old_ids,old_sessions,expected,procs,launch['pid'])
                    if evidence:break
                time.sleep(.1)
            require(evidence is not None,'Fresh run/thread/turn/native proof absent')
            record['ordinary_resume_proof']=op.verify_registered_resume(after,resumed,head,plan,fresh)
            active=op.workers(op.processes());require(set(active)=={launch['pid']},'Expected exactly launched central worker')
            require(Path(fresh['directory']).resolve()==(STATE/'runs'/fresh['id']).resolve(),'Fresh run evidence path differs')
            for flag,value in [('--publish-every','20'),('--max-rounds','6'),('--state-dir',str(STATE))]:
                args=active[launch['pid']]['args'];require(args.count(flag)==1 and args[args.index(flag)+1]==value,'Runner option differs')
            agent_head=record['ordinary_resume_proof']['agent_candidate']
            if agent_head!=head:op.git('push','origin',agent_head+':refs/heads/codex/all-hard-20261018')
            require(op.git('ls-remote','origin','refs/heads/codex/all-hard-20261018').split()[0]==agent_head,'Exact continuation head not pushed')
            require((STATE/'releases.json').read_bytes()==ledger_raw and reservations(STATE)==res_after and not (STATE/'STOP').exists(),'Resume altered ledger/reservations/STOP')
            record.update(status='completed-resumed',completed_at=op.imp.now(),fresh_agent=evidence,pushed_head=agent_head,ledger_preserved=True)
            op.save(receipt,record);print(json.dumps(record),flush=True)
        except BaseException as error:
            restore_if_absent(stop_raw)
            record.update(status='failed-inspect-no-retry',error=str(error) or type(error).__name__,recovery='Preserve actual partial imports, importer receipts, import commits, state, reservations and owned STOP. Do not reset, retry or launch another worker. No active agent was signaled.')
            op.save(receipt,record);raise


def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dispatch',required=True);parser.add_argument('--pins',type=Path,required=True);parser.add_argument('--helper',type=Path,required=True)
    args=parser.parse_args(argv)
    require(args.dispatch==DISPATCH and PINS_SHA is not None,'Preparation only: completed acceptance pins and exact reviewed dispatch required')
    raw=args.pins.read_bytes();require(sha(raw)==PINS_SHA,'Pins differ');pins=json.loads(raw);pins_ready(pins)
    require(sha(args.helper.read_bytes())==HELPER_SHA,'Proven helper changed')
    spec=importlib.util.spec_from_file_location('proven_helpers',args.helper);op=importlib.util.module_from_spec(spec);spec.loader.exec_module(op)
    op.pins=copy.deepcopy(pins);op.REPO=REPO;op.STATE=STATE;op.IDS=IDS;op.REOPEN_IDS=();op.OWNER=OWNER;op.HANDOFF_OWNER=OWNER
    op.hashes_unchanged()  # Includes importer: check before executing runtime Python.
    os.environ.update(PATH='/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin',NODE_PATH='/home/songyy/projects/integ-games/node_modules',PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/home/songyy/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome',PYTHONDONTWRITEBYTECODE='1')
    sys.path.insert(0,str(REPO/'scripts'))
    import import_leetcode_lane as imp
    op.imp=imp;execute(op)

if __name__=='__main__':
    def interrupted(signum,_frame):raise InterruptedError(f'Signal {signum}; no active agent signaled')
    signal.signal(signal.SIGTERM,interrupted);main()
