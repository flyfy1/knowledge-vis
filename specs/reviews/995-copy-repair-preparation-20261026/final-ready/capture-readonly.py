"""Read-only Pi capture body; caller supplies hash-bound pins/helper sources."""
import copy,datetime,hashlib,json,os,sys,types
from pathlib import Path
REPO=Path('/home/songyy/projects/leetcode-hard-campaign-20261018')
STATE=Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018')
sha=lambda raw:hashlib.sha256(raw).hexdigest()
prior_path=STATE/'import992995-only-20261026-888bb6ac.json';prior_raw=prior_path.read_bytes();prior=json.loads(prior_raw)
assert prior['owner']=='import992995-only-20261026-888bb6ac' and prior['status']=='completed-resumed' and prior['ledger_preserved'] is True
assert {item['problem_id'] for item in prior['imports']}=={'992','995'} and all(item['status']=='completed' for item in prior['imports'])
assert not Path('/proc/1810489').exists(),'Import operator still active; wait without overlapping'
for path,digest in pins['policy'].items():assert sha((REPO/path).read_bytes())==digest,path
assert sha((STATE/'launch.py').read_bytes())==pins['launcher_sha256']
assert sha(helper_source.encode())=='f0c4ac708a4b0209c7a6522787b38a04923ac922d61d8afa0dbecf7b8ad61698'
assert sha(reopen_source.encode())=='a268466fe6101841437c730e0e7448961be4637ee60d9fe4a760c0ea6fca3424'
os.environ['PATH']='/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin'
sys.path.insert(0,str(REPO/'scripts'))
import import_leetcode_lane as imp
from leetcode_publish import _reviewed
from leetcode_registry import read_registry
helper=types.ModuleType('readonly_campaign');exec(helper_source,helper.__dict__);helper.imp=imp;helper.pins=pins;helper.REOPEN_IDS=('995',)
reopen=types.ModuleType('readonly_reopen');exec(reopen_source,reopen.__dict__);reopen.IDS=('995',);reopen.REPO=REPO;reopen.STATE=STATE;reopen.imp=imp
raw=(STATE/'progress.json').read_bytes();state=json.loads(raw);head=imp.head(REPO)
assert state['status']=='running' and state['expected_head']==head and len(state['queue'])==984
assert helper.canonical(state['queue'])==pins['queue_sha256'] and not (STATE/'STOP').exists()
imp.git(REPO,'merge-base','--is-ancestor',prior['pushed_head'],head)
entry=state['problems']['995'];assert entry['status']=='accepted_local' and entry['phase']=='done' and 0<entry['rounds']<6 and entry['rounds']==len(entry['reviews'])
registry={str(r['id']):r for r in read_registry(REPO/'leetcode/problems.config.js')}
assert set(_reviewed(REPO,state,registry,head,{'995'}))=={'995'}
procs=helper.processes();runner=int((STATE/'runner.pid').read_text());assert set(helper.workers(procs))=={runner}
assert not any(p['cwd'].startswith('/home/songyy/projects/leetcode-hard-lane-') for p in procs.values())
reservations={p.name:p.read_bytes() for p in STATE.glob('lane-*-reservation.json')}
assert all(json.loads(value)['status'] in ('imported','cancelled','canceled') for value in reservations.values())
run=next(r for r in state['runs'] if r['id']==state['current']['run_id']);assert run['status']=='running' and run['role']==state['current']['stage']
events=helper.fresh_events(run);sessions=[e['thread_id'] for e in events if e['type']=='thread.started'];assert len(sessions)==1 and any(e['type']=='turn.started' for e in events)
native=helper.native_children(procs,runner);assert len(native)==1
args=procs[native[0]]['args'];assert Path(args[args.index('-o')+1]).parent==Path(run['directory'])
files=imp.git(REPO,'ls-tree','-r','--name-only',head,'leetcode/995').splitlines();assert files
runtime={path.removeprefix('leetcode/995/'):sha((REPO/path).read_bytes()) for path in files}
assert all(sha(imp.blob(REPO,head,'leetcode/995/'+name))==digest for name,digest in runtime.items())
runs=[r for r in state['runs'] if r['problem_id']=='995']
assert all(r['source_directory'].startswith('/home/songyy/projects/leetcode-hard-lane-state-995-20261026/runs/') and r['directory']==str(STATE/'runs'/r['id']) for r in runs)
pins['accepted']['995']={'entry':entry,'entry_sha256':helper.canonical(entry),'runs_sha256':helper.canonical(runs),'lesson_git_tree':imp.git(REPO,'rev-parse','HEAD:leetcode/995'),'runtime_sha256':runtime,'report_sha256':sha((REPO/entry['prior_report']).read_bytes())}
pins['previous_receipt_sha256']=sha(prior_raw)
ledger_raw=(STATE/'releases.json').read_bytes();ledger=json.loads(ledger_raw);assert ledger['pending'] is None and '995' not in ledger['released']
plan=helper.resume_plan(state,ledger)
reopen.accepted_guard(state,pins)
projected=reopen.transition(state,'future-request-adoption-head',pins,{'kind':'read-only-projection'})
projected_plan=helper.resume_plan(projected,ledger)
assert projected['queue']==state['queue'] and projected['problems']['995']['status']=='changes_required' and projected['problems']['995']['phase']=='fix'
assert _reviewed(REPO,projected,registry,head,{'995'})=={}
assert (STATE/'progress.json').read_bytes()==raw and imp.head(REPO)==head,'Central changed during capture; inspect then fresh read only'
assert (STATE/'releases.json').read_bytes()==ledger_raw and prior_path.read_bytes()==prior_raw
assert reservations=={p.name:p.read_bytes() for p in STATE.glob('lane-*-reservation.json')}
pins['status']='frozen-for-independent-final-review'
pins['capture']={'head':head,'current':state['current'],'runner_pid':runner,'native_pid':native[0],'session_id':sessions[0],'ledger_sha256':sha(ledger_raw),'resume_plan_before':plan,'resume_plan_after_queued_reopen':projected_plan}
print(json.dumps({'pins':pins,'previous_receipt':prior,'observation':{'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'read_only':True,'head':head,'current':state['current'],'central_progress_sha256':sha(raw),'previous_receipt_sha256':sha(prior_raw),'previous_pushed_head':prior['pushed_head'],'imports_schema_keys':[list(item) for item in prior['imports']],'ledger_sha256':sha(ledger_raw),'released_count':len(ledger['released']),'pending':ledger['pending'],'995_unpublished':True,'995_projected_ineligible':True,'queue_preserved_by_projection':True,'reservation_sha256':{name:sha(value) for name,value in reservations.items()},'policy_matches':True,'launcher_matches':True,'lane_processes_absent':True,'runner_pid':runner,'native_pid':native[0],'native_cwd':procs[native[0]]['cwd'],'native_output':args[args.index('-o')+1],'session_id':sessions[0],'resume_plan_before':plan,'resume_plan_after_queued_reopen':projected_plan,'accepted995':{'candidate':entry['candidate'],'rounds':entry['rounds'],'score':entry['reviews'][-1]['weighted_score'],'report':entry['prior_report'],'lesson_tree':pins['accepted']['995']['lesson_git_tree']},'imported995_runs':runs}},indent=2))
