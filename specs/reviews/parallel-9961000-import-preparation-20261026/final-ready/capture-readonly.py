"""Read-only Pi acceptance capture; caller provides pending pins and checked helper_source."""
import copy,datetime,hashlib,json,os,re,subprocess,sys,types
from pathlib import Path
repo=Path('/home/songyy/projects/leetcode-hard-campaign-20261018');state=Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018')
sha=lambda raw:hashlib.sha256(raw).hexdigest()
pins=copy.deepcopy(pins)
assert pins['ids']==['996','1000'] and pins['lane_base']=='6c68b23cc306067de5a912195a3c7edeebc2a0be'
# Every dependency is checked before executing runtime module or helper code.
for path,digest in pins['policy'].items():assert sha((repo/path).read_bytes())==digest,path
assert sha((state/'launch.py').read_bytes())==pins['launcher_sha256']
assert sha(helper_source.encode())=='f0c4ac708a4b0209c7a6522787b38a04923ac922d61d8afa0dbecf7b8ad61698'
os.environ['PATH']='/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin'
sys.path.insert(0,str(repo/'scripts'))
import import_leetcode_lane as imp
from leetcode_publish import _reviewed
from leetcode_registry import read_registry
helper=types.ModuleType('readonly_helpers');exec(helper_source,helper.__dict__)
helper.imp=imp;helper.pins=pins;helper.REPO=repo;helper.STATE=state;helper.IDS=('996','1000');helper.REOPEN_IDS=()
raw=(state/'progress.json').read_bytes();central=json.loads(raw);head=imp.head(repo)
assert central['status']=='running' and central['expected_head']==head and len(central['queue'])==984,'Central checkpoint mismatch'
assert helper.canonical(central['queue'])==pins['queue_sha256'],'Queue changed'
assert not (state/'STOP').exists(),'STOP present'
handoff_raw=(state/'995-copy-repair-20261026-9d027af3.json').read_bytes()
assert sha(handoff_raw)=='86159f93f1a918035f10c47c6bbda09409b8a914c0320dfee40551b305eed343'
handoff=json.loads(handoff_raw);assert handoff['status']=='completed-resumed' and handoff['pushed_head']==pins['lane_base']
imp.git(repo,'merge-base','--is-ancestor',pins['lane_base'],head)
queued=central['problems']['995'];assert queued['status']=='changes_required' and queued['phase']=='fix'
assert queued['prior_report']=='specs/reviews/995-teaching-copy-repair-request-20261026.md'
request_raw=(repo/queued['prior_report']).read_bytes();assert sha(request_raw)=='e68c8e47386c982e7545212213fcdc3905a4270a6f885ff474484d8a0290270b'
registry={str(row['id']):row for row in read_registry(repo/'leetcode/problems.config.js')}
assert _reviewed(repo,central,registry,head,{'995'})=={}
pins['queued995_capture']={'entry':queued,'entry_sha256':helper.canonical(queued),'runs_sha256':helper.canonical([r for r in central['runs'] if r['problem_id']=='995']),'maintenance':[m for m in central.get('maintenance',[]) if m.get('request_id')=='995-COPY-R1'],'request_sha256':sha(request_raw),'handoff_receipt_sha256':sha(handoff_raw),'publication_ineligible':True}

procs=helper.processes();runner=int((state/'runner.pid').read_text())
assert set(helper.workers(procs))=={runner},'Unexpected worker set; both lane runners must exit'
assert not any(p['cwd'].startswith('/home/songyy/projects/leetcode-hard-lane-') for p in procs.values()),'Active lane checkout'
current=central['current'];active=next(r for r in central['runs'] if r['id']==current['run_id'])
assert active['status']=='running' and active['role']==current['stage'] and active['problem_id']==current['problem_id']
old_runs=[r for r in central['runs'] if r['id']!=active['id']]
native_proof=helper.new_run_evidence(central,{r['id'] for r in old_runs},{x for r in old_runs for x in r.get('session_ids',[])},current['problem_id'],procs,runner)
assert native_proof and len(native_proof['native_codex_pids'])==1,'Current native/session proof absent'
native_pid=native_proof['native_codex_pids'][0];native=procs[native_pid]
assert native['cwd']==str(repo) and '-o' in native['args']
assert Path(native['args'][native['args'].index('-o')+1]).parent==Path(active['directory'])
events=[]
for line in (Path(active['directory'])/'events.jsonl').read_text().splitlines():
 try:events.append(json.loads(line))
 except ValueError:pass
assert not any(e.get('type') in ('error','turn.failed','turn.completed') for e in events),'Current run became terminal'
prompt=(Path(active['directory'])/'prompt.md').read_text()
dirty=subprocess.check_output(['git','-C',str(repo),'status','--porcelain','--untracked-files=all'],text=True).splitlines()
if current['stage'] in ('author','fix'):
 pattern=r'^Problem metadata: (.+)$' if current['stage']=='author' else r'^Problem: (.+)$'
 metadata=json.loads(re.search(pattern,prompt,re.M)[1]);assert str(metadata['id'])==current['problem_id'] and re.fullmatch(r'[1-9][0-9]*',current['problem_id'])
 ownership='Own ONLY leetcode/<id>/ and tests inside that folder. Do not edit shared assets,' if current['stage']=='author' else 'Own only\nleetcode/<id>/ and tests/evidence inside it.'
 assert ownership in prompt
 prefix='leetcode/'+current['problem_id']+'/'
 assert all(line[3:].startswith(prefix) and ' -> ' not in line for line in dirty),dirty
 scope={'stage':current['stage'],'prefix':prefix,'trackedChangesAllowedWithinPrefix':True}
else:
 assert current['stage']=='review'
 match=re.search(r"This run's exclusive screenshot directory is (specs/reviews/[0-9]+-evidence/[A-Za-z0-9-]+)/\.",prompt);assert match
 evidence=match[1];report='specs/reviews/'+Path(evidence).name+'.md'
 assert all(line.startswith('?? ') and (line[3:]==report or line[3:].startswith(evidence+'/')) for line in dirty),dirty
 scope={'stage':'review','report':report,'evidence':evidence,'trackedChangesAllowed':False}
reservation_raw={p.name:p.read_bytes() for p in state.glob('lane-*-reservation.json')}
for name,data in reservation_raw.items():
 item=json.loads(data);assert name=='lane-'+str(item['id'])+'-reservation.json'
 assert item['status'] in ('imported','cancelled','canceled') or (str(item['id']) in helper.IDS and item['status']=='started'),'Other active lane'
archives={};lane_raws={};report_raws={}
expected={'996':{'candidate':'0cd4cc9fd8de9a9e349a8d9c74313cb7c3ec3b38','review_commit':'82715e0ead4491d2c2020432b6011a25a5ba52db','registration':'af88d4a6f1c7727420c024fe3abce66c795fccb0','score':100},'1000':{'candidate':'20f52a5cf74957ddacf1a7627ed882defe6a70f5','review_commit':'134bfbe9767a8f92fa3f1263c1f2c2d7a3485b4d','registration':'30516661a5cfc0673c2dcfaa018444e2ffa2c85b','score':92.5}}
for pid in helper.IDS:
 lane_repo=Path('/home/songyy/projects/leetcode-hard-lane-'+pid+'-20261026');lane_state=Path('/home/songyy/projects/leetcode-hard-lane-state-'+pid+'-20261026')
 lane_raw=(lane_state/'progress.json').read_bytes();lane=imp.validate_checkout(lane_repo,lane_state);entry=lane['problems'][pid];last=entry['reviews'][-1]
 assert lane['status']=='completed' and lane.get('current') is None and lane['queue']==[pid],'Lane incomplete'
 assert entry['status']=='accepted_local' and entry['phase']=='done' and last['outcome']=='accepted' and not last['required_open'],'Not accepted'
 assert entry['registration_commit']==imp.head(lane_repo)==lane['expected_head'],'Registration identity differs'
 assert entry['candidate']==last['candidate'] and entry['prior_report']==last['report_path']
 assert entry['candidate']==expected[pid]['candidate'] and last['commit']==expected[pid]['review_commit'] and entry['registration_commit']==expected[pid]['registration'] and last['weighted_score']==expected[pid]['score']
 assert pid not in central['problems'] and not any(r['problem_id']==pid for r in central['runs']),'Central reached reserved ID'
 assert not (Path('/proc')/(lane_state/'runner.pid').read_text().strip()).exists(),'Lane runner still exists'
 imp.validate_runs(lane,lane_state,pid,central)
 registry={str(r['id']):r for r in read_registry(lane_repo/'leetcode/problems.config.js')}
 reviewed=_reviewed(lane_repo,lane,registry,imp.head(lane_repo),{pid});assert set(reviewed)=={pid},'Publication proof missing'
 imp.same_shared(repo,head,entry['candidate']);imp.same_shared(repo,head,imp.head(lane_repo));imp.same_shared(repo,pins['lane_base'],head)
 trees={name:imp.git(lane_repo,'rev-parse',revision+':leetcode/'+pid) for name,revision in [('candidate',entry['candidate']),('review',last['commit']),('registration',entry['registration_commit'])]}
 assert len(set(trees.values()))==1,'Lesson tree changed after candidate review'
 for first,second in [(entry['candidate'],last['commit']),(last['commit'],entry['registration_commit'])]:
  subprocess.run(['git','-C',str(lane_repo),'merge-base','--is-ancestor',first,second],check=True)
 remote=imp.git(lane_repo,'ls-remote','origin','refs/heads/codex/lane-'+pid+'-20261026').split();assert remote and remote[0]==entry['registration_commit'],'Registration not exact-pushed'
 reservation=json.loads(reservation_raw['lane-'+pid+'-reservation.json'])
 assert reservation['status']=='started' and reservation['repo']==str(lane_repo) and reservation['state_dir']==str(lane_state),'Reservation mismatch'
 assert reservation['base']==pins['lane_base'] and reservation['policy_sha256']==pins['policy']['specs/leetcode-rendered-state-contract.md'] and reservation['publication_enabled'] is False,'Base/policy/publication mismatch'
 report_raw=(lane_repo/entry['prior_report']).read_bytes();report_raws[pid]=report_raw
 pins['lanes'][pid]={'head':imp.head(lane_repo),'entry':entry,'entry_sha256':helper.canonical(entry),'runs_sha256':helper.canonical(lane['runs']),'progress_sha256':sha(lane_raw),'report_sha256':sha(report_raw),'reservation':reservation}
 archives[pid]={'progress':lane,'rawProgress':lane_raw.decode(),'report':report_raw.decode(),'reportPath':entry['prior_report'],'lessonTrees':trees,'canonicalSha256':sha((lane_repo/'leetcode'/pid/'solution.py').read_bytes()),'lessonEntry':json.loads((lane_repo/'leetcode'/pid/'lesson-entry.json').read_bytes()),'registryEntry':registry[pid],'remoteRegistration':remote[0],'reviewedProof':{k:v for k,v in reviewed[pid].items() if k!='files'},'reviewedAssetSha256':{name:sha(data) for name,data in reviewed[pid]['files'].items()}}
 lane_raws[pid]=(lane_state,lane_repo,lane_raw)
ledger_raw=(state/'releases.json').read_bytes();ledger=json.loads(ledger_raw)
plan=helper.resume_plan(central,ledger,incoming=helper.IDS)
assert ledger['pending'] is None and ledger['releases'],'No completed release ledger'
pins['release']={'id':ledger['releases'][-1]['id'],'revision':ledger['releases'][-1]['revision'],'receipt_sha256':helper.canonical(ledger['releases'][-1]),'ledger_sha256':sha(ledger_raw)}
pins['central']={'head':head,'current':current,'runner_pid':runner,'resume_plan':plan}
pins['status']='frozen-accepted-pair'
assert (state/'progress.json').read_bytes()==raw and imp.head(repo)==head,'Central changed during capture; repeat read-only'
assert (state/'releases.json').read_bytes()==ledger_raw,'Ledger changed during capture'
assert {p.name:p.read_bytes() for p in state.glob('lane-*-reservation.json')}==reservation_raw,'Reservations changed during capture'
for pid,(lane_state,lane_repo,before) in lane_raws.items():
 assert (lane_state/'progress.json').read_bytes()==before and imp.head(lane_repo)==pins['lanes'][pid]['head'],'Lane advanced during capture'
 assert (lane_repo/pins['lanes'][pid]['entry']['prior_report']).read_bytes()==report_raws[pid]
end_procs=helper.processes();assert set(helper.workers(end_procs))=={runner} and end_procs.get(native_pid)==native,'Current native changed'
assert not (state/'STOP').exists()
assert (state/'995-copy-repair-20261026-9d027af3.json').read_bytes()==handoff_raw
print(json.dumps({'pins':pins,'observation':{'observed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'read_only':True,'head':head,'current':current,'central_progress_sha256':sha(raw),'ledger_sha256':sha(ledger_raw),'resume_plan':plan,'central_runner_pid':runner,'native_proof':native_proof,'native':native,'current_prompt_sha256':sha(prompt.encode()),'allowed_dirty_scope':scope,'current_dirty_paths':dirty,'lane_processes_absent':True,'queue_count':984,'lane_base_same_shared':True,'reservation_hashes':{k:sha(v) for k,v in reservation_raw.items()}},'archives':archives},indent=2))
