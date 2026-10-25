"""Read-only Pi capture body. Caller supplies pins and hash-checked helper_source."""
import json,hashlib,sys,types,datetime,os
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
helper=types.ModuleType('readonly_helpers');exec(helper_source,helper.__dict__)
helper.imp=imp;helper.pins=pins;helper.IDS=('982','987');helper.REOPEN_IDS=()
raw=(state/'progress.json').read_bytes();central=json.loads(raw);head=imp.head(repo)
assert central['status']=='running' and central['expected_head']==head and len(central['queue'])==984,'Central checkpoint mismatch'
assert helper.canonical(central['queue'])==pins['queue_sha256'],'Queue changed'
assert not (state/'STOP').exists(),'STOP present'
procs=helper.processes();runner=int((state/'runner.pid').read_text())
assert set(helper.workers(procs))=={runner},'Unexpected worker set'
assert not any(p['cwd'].startswith('/home/songyy/projects/leetcode-hard-lane-') for p in procs.values()),'Active lane checkout'
expected_heads={'982':'1086f89c87cb74432d9222deba3414138d4e1b2f','987':'5e97917082c9c4b71bb26567617345a98d9171c8'}
for pid in ('982','987'):
 lane_repo=Path('/home/songyy/projects/leetcode-hard-lane-'+pid+'-20261026');lane_state=Path('/home/songyy/projects/leetcode-hard-lane-state-'+pid+'-20261026')
 lane=imp.validate_checkout(lane_repo,lane_state);entry=lane['problems'][pid]
 assert lane['status']=='completed' and lane.get('current') is None and lane['queue']==[pid],'Lane incomplete'
 assert imp.head(lane_repo)==expected_heads[pid],'Lane head changed'
 assert entry['status']=='accepted_local' and entry['phase']=='done','Not accepted'
 assert entry['reviews'][-1]['weighted_score']==({'982':95,'987':92.5}[pid]) and entry['reviews'][-1]['required_open']==[],'Unexpected acceptance score/findings'
 assert pid not in central['problems'] and not any(r['problem_id']==pid for r in central['runs']),'Central already started reserved ID'
 assert not (Path('/proc')/(lane_state/'runner.pid').read_text().strip()).exists(),'Lane runner exists'
 imp.validate_runs(lane,lane_state,pid,central)
 registry={str(r['id']):r for r in read_registry(lane_repo/'leetcode/problems.config.js')}
 assert set(_reviewed(lane_repo,lane,registry,imp.head(lane_repo),{pid}))=={pid},'Publication proof missing'
 imp.same_shared(repo,head,entry['candidate']);imp.same_shared(repo,head,imp.head(lane_repo))
 reservation=json.loads((state/('lane-'+pid+'-reservation.json')).read_bytes())
 assert reservation['status']=='started' and reservation['repo']==str(lane_repo) and reservation['state_dir']==str(lane_state),'Reservation mismatch'
 assert reservation['base']==pins['lane_base'] and reservation['policy_sha256']==pins['policy']['specs/leetcode-rendered-state-contract.md'] and reservation['publication_enabled'] is False,'Lane base/policy/publication mismatch'
 pins['lanes'][pid]={'head':imp.head(lane_repo),'entry':entry,'entry_sha256':helper.canonical(entry),'runs_sha256':helper.canonical(lane['runs']),'progress_sha256':sha((lane_state/'progress.json').read_bytes()),'report_sha256':sha((lane_repo/entry['prior_report']).read_bytes()),'reservation':reservation}
ledger_raw=(state/'releases.json').read_bytes();ledger=json.loads(ledger_raw)
plan=helper.resume_plan(central,ledger,incoming=('982','987'))
assert (state/'progress.json').read_bytes()==raw and imp.head(repo)==head,'Central changed during read-only capture; repeat'
assert (state/'releases.json').read_bytes()==ledger_raw,'Ledger changed during capture'
assert ledger['pending'] is None and ledger['releases'][-1]['id']=='84dfd908f5c94592918eb4ecb72eb87e'
assert ledger['releases'][-1]['revision']=='7fd4aa457c318f053d7dc722fd63b3012bccb838' and ledger['releases'][-1]['verification']['lessons']==20
pins['release']={'id':ledger['releases'][-1]['id'],'revision':ledger['releases'][-1]['revision'],'receipt_sha256':helper.canonical(ledger['releases'][-1]),'ledger_sha256':sha(ledger_raw)}
pins['central']={'head':head,'current':central['current'],'runner_pid':runner,'resume_plan':plan}
pins['status']='frozen-accepted-pair'
for key in ('pending','policy_basis'):pins.pop(key,None)
print(json.dumps({'pins':pins,'observation':{'observed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'read_only':True,'head':head,'central_status':central['status'],'current':central.get('current'),'queue_count':len(central['queue']),'central_progress_sha256':sha(raw),'ledger_sha256':sha(ledger_raw),'resume_plan':plan,'central_runner_pid':runner,'lane_processes_absent':True,'accepted_lanes':{pid:{'head':v['head'],'candidate':v['entry']['candidate'],'score':v['entry']['reviews'][-1]['weighted_score'],'required_open':v['entry']['reviews'][-1]['required_open']} for pid,v in pins['lanes'].items()}}},indent=2))
