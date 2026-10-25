"""Read-only Pi capture body; caller supplies pins and immutable helper source."""
import datetime,hashlib,json,os,sys,types
from pathlib import Path
repo=Path('/home/songyy/projects/leetcode-hard-campaign-20261018');state=Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018')
sha=lambda raw:hashlib.sha256(raw).hexdigest()
for path,digest in pins['policy'].items():assert sha((repo/path).read_bytes())==digest,path
assert sha((state/'launch.py').read_bytes())==pins['launcher_sha256']
assert sha(helper_source.encode())=='f0c4ac708a4b0209c7a6522787b38a04923ac922d61d8afa0dbecf7b8ad61698'
os.environ['PATH']='/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin'
sys.path.insert(0,str(repo/'scripts'))
import import_leetcode_lane as imp
from leetcode_publish import _reviewed
from leetcode_registry import read_registry
helper=types.ModuleType('readonly_helper');exec(helper_source,helper.__dict__);helper.imp=imp;helper.pins=pins;helper.REOPEN_IDS=('843',)
prior_path=state/'import975980-overlap-policy-20261026-5e38ab71.json';prior_raw=prior_path.read_bytes();prior=json.loads(prior_raw)
assert prior['owner']=='import975980-overlap-policy-20261026-5e38ab71' and prior['status']=='completed-resumed' and prior['ledger_preserved'] is True
assert prior['policy_after']=='816990a6035d174692115767e5332be077ba79d3400bdcfc3f5f2e6f47c0002c'
imp.git(repo,'merge-base','--is-ancestor',prior['policy_head'],'HEAD')
raw=(state/'progress.json').read_bytes();current=json.loads(raw);head=imp.head(repo)
assert current['status']=='running' and current['expected_head']==head and len(current['queue'])==984
assert helper.canonical(current['queue'])==pins['queue_sha256'] and not (state/'STOP').exists()
entry=current['problems']['843'];assert entry['status']=='accepted_local' and entry['phase']=='done'
assert 0<entry['rounds']<6 and entry['rounds']==len(entry['reviews'])
registry={str(r['id']):r for r in read_registry(repo/'leetcode/problems.config.js')}
assert set(_reviewed(repo,current,registry,head,{'843'}))=={'843'}
procs=helper.processes();runner=int((state/'runner.pid').read_text());assert set(helper.workers(procs))=={runner}
assert not any(p['cwd'].startswith('/home/songyy/projects/leetcode-hard-lane-') for p in procs.values())
reservations={p.name:p.read_bytes() for p in state.glob('lane-*-reservation.json')}
assert all(json.loads(raw)['status'] in ('imported','cancelled','canceled') for raw in reservations.values())
files=imp.git(repo,'ls-tree','-r','--name-only',head,'leetcode/843').splitlines()
assert files
runtime={path.removeprefix('leetcode/843/'):sha((repo/path).read_bytes()) for path in files}
assert all(sha(imp.blob(repo,head,'leetcode/843/'+name))==digest for name,digest in runtime.items())
pins['accepted']['843']={'entry':entry,'entry_sha256':helper.canonical(entry),'runs_sha256':helper.canonical([r for r in current['runs'] if r['problem_id']=='843']),
 'lesson_git_tree':imp.git(repo,'rev-parse','HEAD:leetcode/843'),'runtime_sha256':runtime,'report_sha256':sha((repo/entry['prior_report']).read_bytes())}
pins['previous_receipt_sha256']=sha(prior_raw)
ledger_raw=(state/'releases.json').read_bytes();plan=helper.resume_plan(current,json.loads(ledger_raw))
assert (state/'progress.json').read_bytes()==raw and imp.head(repo)==head,'Central changed during capture; repeat'
assert (state/'releases.json').read_bytes()==ledger_raw and prior_path.read_bytes()==prior_raw
assert reservations=={p.name:p.read_bytes() for p in state.glob('lane-*-reservation.json')}
pins['status']='runtime-captured-request-source-and-documents-pending'
print(json.dumps({'pending_pins':pins,'observation':{'observed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'read_only':True,'head':head,'current':current.get('current'),'queue_count':len(current['queue']),
 'central_progress_sha256':sha(raw),'previous_receipt_sha256':sha(prior_raw),'previous_policy_head':prior['policy_head'],'previous_status':prior['status'],'ledger_sha256':sha(ledger_raw),
 'reservation_sha256':{name:sha(raw) for name,raw in reservations.items()},'policy_matches':True,'launcher_matches':True,'lane_processes_absent':True,'runner_pid':runner,'resume_plan':plan,
 'accepted843':{'candidate':entry['candidate'],'rounds':entry['rounds'],'score':entry['reviews'][-1]['weighted_score'],'lesson_tree':pins['accepted']['843']['lesson_git_tree']}}},indent=2))
