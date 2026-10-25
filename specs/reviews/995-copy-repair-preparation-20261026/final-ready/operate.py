"""Disabled #995 request-adoption/reopen handoff; no import or policy replacement."""
import argparse
import copy
import fcntl
import hashlib
import importlib.util
import json
import os
from pathlib import Path, PurePosixPath
import re
import signal
import subprocess
import sys
import time

OWNER='995-copy-repair-20261026-9d027af3'
DISPATCH='root-reviewed-995-copy-repair-20261026'
PINS_SHA='b8daf2ba46ff675f5cc14f6ddca7e1816d14348b3438b228f13c4e6fa60ff93c'  # Frozen for final independent review; separate root dispatch required.
CAMPAIGN_HELPER_SHA='f0c4ac708a4b0209c7a6522787b38a04923ac922d61d8afa0dbecf7b8ad61698'
REOPEN_HELPER_SHA='a268466fe6101841437c730e0e7448961be4637ee60d9fe4a760c0ea6fca3424'
PREVIOUS_OWNER='import992995-only-20261026-888bb6ac'
POLICY_PATH='specs/leetcode-rendered-state-contract.md'
NEW_POLICY='816990a6035d174692115767e5332be077ba79d3400bdcfc3f5f2e6f47c0002c'
STATIC_SHA='f92eca0575bfcf74a4b68b9d011470e99415f12b671328bba1cebf035ddfd12e'
REQUEST='specs/reviews/995-teaching-copy-repair-request-20261026.md'
REPO=Path('/home/songyy/projects/leetcode-hard-campaign-20261018')
STATE=Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018')
REQUIRED_POLICY={'scripts/import_leetcode_lane.py','scripts/leetcode_campaign.py','scripts/leetcode_publish.py',
 'scripts/leetcode_static_versions.py','scripts/leetcode_registry.py','scripts/register_leetcode_lesson.py',
 'scripts/campaign-prompts/author.md','scripts/campaign-prompts/fix.md','scripts/campaign-prompts/review.md',
 'specs/leetcode-explainers.md','specs/leetcode-review-gates.md',POLICY_PATH}


def require(ok,message):
    if not ok:raise RuntimeError(message)


def sha(raw):return hashlib.sha256(raw).hexdigest()


def payload_guard(payload,pins):
    require(set(payload)==set(pins['documents'])=={REQUEST},'Request/evidence set differs')
    for path,data in payload.items():
        parsed=PurePosixPath(path)
        require(not parsed.is_absolute() and '..' not in parsed.parts and str(parsed)==path and '\\' not in path and
                path==REQUEST,'Request/evidence path escapes narrow scope')
        require(sha(data)==pins['documents'][path],'Request/evidence bytes differ')


def previous_guard(raw,pins):
    require(sha(raw)==pins['previous_receipt_sha256'],'Previous operation receipt changed')
    receipt=json.loads(raw)
    require(receipt['owner']==PREVIOUS_OWNER and receipt['status']=='completed-resumed' and receipt['ledger_preserved'] is True and
            {item['problem_id'] for item in receipt['imports']}=={'992','995'} and
            re.fullmatch('[0-9a-f]{40}',receipt['pushed_head']), 'Pair import has not completed successfully')
    return receipt


def unpublished_guard(state,ledger,reopened):
    require(ledger['pending'] is None and '995' not in ledger['released'], '995 already released or publication pending')
    if reopened:
        entry=state['problems']['995']
        require(entry['status']=='changes_required' and entry['phase']=='fix', '995 no longer queued and publication-ineligible')


def no_lanes(op):
    raw={p.name:p.read_bytes() for p in STATE.glob('lane-*-reservation.json')}
    require(all(json.loads(data)['status'] in ('imported','cancelled','canceled') for data in raw.values()),'Active/pending lane prevents handoff')
    require(not any(p['cwd'].startswith('/home/songyy/projects/leetcode-hard-lane-') for p in op.processes().values()),'Lane checkout process remains')
    return raw


def startup(state,before,old_ids,alive,expected):
    require(alive,'Exact launched runner exited')
    if state.get('status')=='stopped':
        require(state==before,'Stopped startup snapshot changed');return None
    require(state.get('status')=='running','Runner failed or left startup')
    current=state.get('current') or {}
    if not current.get('run_id') or current['run_id'] in old_ids:return None
    require(current.get('problem_id')==expected,'Unexpected first fresh agent')
    run=next((r for r in state['runs'] if r['id']==current['run_id']),None)
    require(run and run['status']=='running' and run['role']==current['stage'],'Fresh agent already finished or identity differs')
    return run


def adopt_reopen(op,reopen,payload,pins,before,ledger_raw,stop_raw):
    payload_guard(payload,pins);reopen.accepted_guard(before,pins);op.owned_stop(stop_raw)
    old=before['expected_head'];tree=op.imp.tree(REPO,old)
    require(not set(payload)&set(tree),'Request/evidence already tracked')
    maintenance={'kind':'reopen-accepted-995-copy','request_id':'995-COPY-R1','at':op.imp.now(),
                 'source_revision':pins['source_revision'],'before':old,'prior_accepted_entry':copy.deepcopy(before['problems']['995']),
                 'previous_current':copy.deepcopy(before.get('current'))}
    for path,data in payload.items():
        target=REPO/path
        require(not target.exists() and not target.is_symlink() and target.resolve().is_relative_to(REPO.resolve()),'Adoption path exists or escapes checkout')
        target.parent.mkdir(parents=True,exist_ok=True)
        with target.open('xb') as out:out.write(data)
        target.chmod(0o644)
    require(op.imp.changed_paths(REPO)==set(payload),'Unexpected adoption worktree scope')
    op.git('diff','--check');op.git('add','--',*sorted(payload))
    require(set(op.git('diff','--cached','--name-only').splitlines())==set(payload),'Unexpected staged adoption scope')
    require(op.read(STATE/'progress.json')==before and (STATE/'releases.json').read_bytes()==ledger_raw,'State/ledger changed before adoption')
    op.git('commit','-m','Prepare ordinary LeetCode 995 teaching-copy repair\n\nAdopt the independently examined copy request; preserve prior acceptance history and remaining review budget. Queued ordinary repair and fresh independent review remain required; preserve queue order.\n\nRequest-Source: '+pins['source_revision'])
    head=op.imp.head(REPO)
    require(op.git('rev-list','--parents','-n','1',head).split()[1:]==[old],'Unexpected adoption parents')
    reopen.document_tree_guard(tree,op.imp.tree(REPO,head),payload)
    require(not op.imp.changed_paths(REPO) and all(op.imp.blob(REPO,head,p)==b for p,b in payload.items()),'Committed request/evidence differs')
    reopen.accepted_guard(before,pins);op.hashes_unchanged();op.owned_stop(stop_raw)
    require(op.read(STATE/'progress.json')==before and (STATE/'releases.json').read_bytes()==ledger_raw,'State/ledger changed before reopening')
    maintenance['after']=head
    after=reopen.transition(before,head,pins,maintenance);op.save(STATE/'progress.json',after)
    require(op.read(STATE/'progress.json')==after,'Reopening state write differs')
    return after,maintenance


def execute(op,reopen,pins):
    receipt=STATE/(OWNER+'.json');require(not receipt.exists(),'Existing operation: inspect, never retry')
    record={'owner':OWNER,'status':'preflight','created_at':op.imp.now()};stop_raw=None
    with (STATE/(OWNER+'.lock')).open('a') as lock:
        fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB);op.save(receipt,record,exclusive=True)
        try:
            op.hashes_unchanged();prior_raw=(STATE/(PREVIOUS_OWNER+'.json')).read_bytes();previous=previous_guard(prior_raw,pins)
            op.git('merge-base','--is-ancestor',previous['pushed_head'],'HEAD')
            require(op.git('branch','--show-current')=='codex/all-hard-20261018' and not (STATE/'STOP').exists(),'Wrong branch or existing STOP')
            lanes=no_lanes(op);state=op.read(STATE/'progress.json');reopen.accepted_guard(state,pins)
            require(state['status']=='running' and state['expected_head']==op.imp.head(REPO),'Central checkpoint differs')
            require(re.fullmatch('[0-9a-f]{40}',pins['source_revision']),'Request source must be an exact commit')
            op.git('fetch','--no-tags','origin',pins['source_revision'])
            payload={path:op.imp.blob(REPO,pins['source_revision'],path) for path in pins['documents']};payload_guard(payload,pins)
            current=op.read(STATE/'progress.json');reopen.accepted_guard(current,pins)
            central=int((STATE/'runner.pid').read_text());require(set(op.workers(op.processes()))=={central},'Expected one central runner')
            unpublished_guard(current,op.read(STATE/'releases.json'),reopened=False)
            record['pre_stop_plan']=op.resume_plan(current,op.read(STATE/'releases.json'))
            stop={'owner':OWNER,'created_at':op.imp.now(),'reason':'Finish current stage; adopt reviewed995-COPY-R1 and queue only995 for ordinary fix/review without reprioritizing.'}
            reopen.accepted_guard(op.read(STATE/'progress.json'),pins)
            op.save(STATE/'STOP',stop,exclusive=True);stop_raw=(STATE/'STOP').read_bytes();record.update(status='waiting-for-natural-boundary',stop=stop);op.save(receipt,record)
            deadline=time.monotonic()+6000
            while (Path('/proc')/str(central)).exists():
                op.owned_stop(stop_raw);require(op.read(STATE/'progress.json')['status']!='failed','Central failed before boundary')
                require(time.monotonic()<deadline,'Natural stage wait exceeded budget');time.sleep(5)
            op.boundary_guard()
            with (STATE/'release.lock').open('a') as release,op.imp.ownership(REPO,STATE):
                fcntl.flock(release,fcntl.LOCK_EX|fcntl.LOCK_NB)
                before=op.imp.validate_checkout(REPO,STATE);require(before['status']=='stopped','Not an ordinary stopped boundary')
                reopen.accepted_guard(before,pins);op.hashes_unchanged();op.owned_stop(stop_raw)
                require(no_lanes(op)==lanes and (STATE/(PREVIOUS_OWNER+'.json')).read_bytes()==prior_raw,'Lane reservations or prior operation changed')
                ledger_raw=(STATE/'releases.json').read_bytes();unpublished_guard(before,json.loads(ledger_raw),reopened=False)
                record['boundary_plan']=op.resume_plan(before,json.loads(ledger_raw))
                record.update(status='adopting-request-and-reopening-only995',boundary_head=before['expected_head']);op.save(receipt,record)
                after,maintenance=adopt_reopen(op,reopen,payload,pins,before,ledger_raw,stop_raw)
                unpublished_guard(after,json.loads(ledger_raw),reopened=True)
                plan=op.resume_plan(after,json.loads(ledger_raw));record['post_reopen_plan']=plan
                head=after['expected_head'];op.git('push','origin',head+':refs/heads/codex/all-hard-20261018')
                require(op.git('ls-remote','origin','refs/heads/codex/all-hard-20261018').split()[0]==head,'Exact adoption push not verified')
                record.update(status='reopened-pushed-still-stopped',maintenance=maintenance,head=head);op.save(receipt,record)
            op.boundary_guard();op.hashes_unchanged();op.owned_stop(stop_raw)
            require(op.read(STATE/'progress.json')==after and op.imp.head(REPO)==head and not op.imp.changed_paths(REPO) and (STATE/'releases.json').read_bytes()==ledger_raw and no_lanes(op)==lanes,'Inputs changed before resume')
            plan=op.resume_plan(after,json.loads(ledger_raw));require(plan==record['post_reopen_plan'],'Resume plan changed')
            expected=plan['next_problem_id']
            old_ids={r['id'] for r in after['runs']};sessions={sid for r in after['runs'] for sid in r.get('session_ids',[])}
            (STATE/'STOP').unlink()
            launch=json.loads(subprocess.check_output([sys.executable,str(STATE/'launch.py'),'--continuous','--max-rounds','6'],cwd=REPO,text=True))
            record.update(status='awaiting-fresh-ordinary-agent',launch=launch);op.save(receipt,record)
            require(launch['continuous'] and launch['queue_count']==984,'Launch selection differs')
            evidence=None;deadline=time.monotonic()+60
            while time.monotonic()<deadline:
                procs=op.processes();live=op.read(STATE/'progress.json');fresh=startup(live,after,old_ids,launch['pid'] in procs,expected)
                if fresh:
                    evidence=op.new_run_evidence(live,old_ids,sessions,expected,procs,launch['pid'])
                    if evidence:break
                time.sleep(.1)
            require(evidence is not None,'Fresh ordinary agent/session/turn/native proof absent')
            record['resume_proof']=op.verify_registered_resume(after,live,head,plan,fresh)
            workers=op.workers(op.processes());require(set(workers)=={launch['pid']},'Expected exactly launched central worker')
            require(Path(fresh['directory']).resolve()==(STATE/'runs'/fresh['id']).resolve(),'Fresh run evidence directory differs')
            for flag,value in [('--publish-every','20'),('--max-rounds','6'),('--state-dir',str(STATE))]:
                args=workers[launch['pid']]['args'];require(args.count(flag)==1 and args[args.index(flag)+1]==value,'Runner options differ')
            require((STATE/'releases.json').read_bytes()==ledger_raw and no_lanes(op)==lanes and not (STATE/'STOP').exists(),'Resume changed ledger/lanes/STOP')
            unpublished_guard(live,json.loads(ledger_raw),reopened=True)
            agent_head=record['resume_proof']['agent_candidate']
            if agent_head!=head:op.git('push','origin',agent_head+':refs/heads/codex/all-hard-20261018')
            require(op.git('ls-remote','origin','refs/heads/codex/all-hard-20261018').split()[0]==agent_head,'Exact continuation head not pushed')
            record.update(status='completed-resumed',completed_at=op.imp.now(),fresh_agent=evidence,pushed_head=agent_head,ledger_preserved=True,queued_repair_id='995',queue_preserved=True)
            op.save(receipt,record);print(json.dumps(record),flush=True)
        except BaseException as error:
            if stop_raw is not None and not (STATE/'STOP').exists():
                with (STATE/'STOP').open('xb') as out:out.write(stop_raw);out.flush();os.fsync(out.fileno())
            record.update(status='failed-inspect-no-retry',error=str(error) or type(error).__name__,recovery='Preserve actual source/state/maintenance and owned STOP. Do not reset, retry or launch another worker. No active agent was signaled.')
            op.save(receipt,record);raise


def load_helper(path,digest,name):
    require(sha(path.read_bytes())==digest,'Reviewed helper changed')
    spec=importlib.util.spec_from_file_location(name,path);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);return module


def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__)
    for flag in ('pins','campaign-helper','reopen-helper'):parser.add_argument('--'+flag,type=Path,required=True)
    parser.add_argument('--dispatch',required=True);args=parser.parse_args(argv)
    require(args.dispatch==DISPATCH and PINS_SHA is not None,'Preparation only: final request and post-import pins pending')
    raw=args.pins.read_bytes();require(sha(raw)==PINS_SHA,'Pins differ');pins=json.loads(raw)
    require(REQUIRED_POLICY<=set(pins['policy']) and pins['policy'][POLICY_PATH]==NEW_POLICY and pins['policy']['scripts/leetcode_static_versions.py']==STATIC_SHA,'Required adopted policy/runtime pins differ')
    require(pins['requests']=={'995':{'path':REQUEST}} and set(pins['accepted'])=={'995'},'Only995 may reopen')
    op=load_helper(args.campaign_helper,CAMPAIGN_HELPER_SHA,'campaign_helpers');op.pins=copy.deepcopy(pins);op.REPO=REPO;op.STATE=STATE;op.OWNER=OWNER;op.HANDOFF_OWNER=OWNER;op.REOPEN_IDS=('995',)
    op.hashes_unchanged()  # Verify importer and all transitive runtime pins before imports.
    reopen=load_helper(args.reopen_helper,REOPEN_HELPER_SHA,'reopen_helpers');reopen.IDS=('995',);reopen.REPO=REPO;reopen.STATE=STATE
    os.environ.update(PATH='/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin',NODE_PATH='/home/songyy/projects/integ-games/node_modules',PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/home/songyy/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome',PYTHONDONTWRITEBYTECODE='1')
    sys.path.insert(0,str(REPO/'scripts'))
    import import_leetcode_lane as imp
    op.imp=imp;reopen.imp=imp;execute(op,reopen,pins)

if __name__=='__main__':
    def interrupted(signum,_frame):raise InterruptedError(f'Signal {signum}; no active agent signaled')
    signal.signal(signal.SIGTERM,interrupted);main()
