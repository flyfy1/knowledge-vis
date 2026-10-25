"""Read-only final capture body. Caller supplies exact local pins/manifest/helper sources.
No fetch is performed here: source objects must already exist, separately evidenced.
"""
import copy,datetime,hashlib,json,os,re,sys,types
from pathlib import Path
REPO=Path('/home/songyy/projects/leetcode-hard-campaign-20261018')
STATE=Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018')
OWNER='import9961000-only-20261026-641c280f'
REVIEW='47d97f6bf07dd1f4b8c7e1ca493ca3d21b3b9c7b'
sha=lambda data:hashlib.sha256(data).hexdigest()
prior_path=STATE/(OWNER+'.json');prior_raw=prior_path.read_bytes();prior=json.loads(prior_raw)
assert prior['owner']==OWNER and prior['status']=='completed-resumed' and prior['ledger_preserved'] is True
assert len(prior['imports'])==2 and {str(i['problem_id'])for i in prior['imports']}=={'996','1000'} and all(i['status']=='completed'for i in prior['imports'])
assert not Path('/proc/1904720').exists(),'Existing import operator remains; do not overlap'
for path,digest in pins['policy'].items():assert sha((REPO/path).read_bytes())==digest,path
assert sha((STATE/'launch.py').read_bytes())==pins['launcher_sha256']
assert sha(helper_source.encode())=='f0c4ac708a4b0209c7a6522787b38a04923ac922d61d8afa0dbecf7b8ad61698'
assert sha(reopen_source.encode())=='a268466fe6101841437c730e0e7448961be4637ee60d9fe4a760c0ea6fca3424'
assert sha(operator_source.encode())=='0c8f5fcded88f98920cb3e128509889c580082e9fa80c2375bbde3433769728f'
assert sha(manifest_raw.encode())==pins['payload_manifest_sha256'];manifest=json.loads(manifest_raw)
os.environ['PATH']='/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin'
sys.path.insert(0,str(REPO/'scripts'))
import import_leetcode_lane as imp
from leetcode_publish import _reviewed
from leetcode_registry import read_registry
helper=types.ModuleType('readonly_campaign');exec(helper_source,helper.__dict__);helper.imp=imp;helper.pins=pins;helper.REOPEN_IDS=('854',)
reopen=types.ModuleType('readonly_reopen');exec(reopen_source,reopen.__dict__);reopen.IDS=('854',);reopen.REPO=REPO;reopen.STATE=STATE;reopen.imp=imp
adapter=types.ModuleType('readonly_adapter');exec(operator_source,adapter.__dict__);adapter.PREVIOUS_OWNER=OWNER
raw=(STATE/'progress.json').read_bytes();state=json.loads(raw);head=imp.head(REPO)
assert state['status']=='running' and state['expected_head']==head and len(state['queue'])==984
assert helper.canonical(state['queue'])==pins['queue_sha256'] and not (STATE/'STOP').exists()
imp.git(REPO,'merge-base','--is-ancestor',prior['pushed_head'],head)
entry=state['problems']['854'];assert entry['status']=='accepted_local' and entry['phase']=='done' and 0<entry['rounds']<6 and entry['rounds']==len(entry['reviews'])
registry={str(r['id']):r for r in read_registry(REPO/'leetcode/problems.config.js')}
assert set(_reviewed(REPO,state,registry,head,{'854'}))=={'854'}
procs=helper.processes();runner=int((STATE/'runner.pid').read_text());assert set(helper.workers(procs))=={runner}
assert not any(p['cwd'].startswith('/home/songyy/projects/leetcode-hard-lane-')for p in procs.values())
reservations={p.name:p.read_bytes()for p in STATE.glob('lane-*-reservation.json')}
assert all(json.loads(value)['status'] in ('imported','cancelled','canceled')for value in reservations.values())
current=state['current'];run=next(r for r in state['runs']if r['id']==current['run_id'])
assert run['status']=='running' and run['role']==current['stage'] and run['problem_id']==current['problem_id'] and current['stage'] in ('author','fix','review')
assert current['problem_id']!='854'
events=[]
for line in (Path(run['directory'])/'events.jsonl').read_text().splitlines():
 try:events.append(json.loads(line))
 except ValueError:pass
sessions=[e['thread_id']for e in events if e.get('type')=='thread.started']
assert len(sessions)==1 and any(e.get('type')=='turn.started'for e in events) and not any(e.get('type') in ('turn.completed','turn.failed')for e in events)
native=helper.native_children(procs,runner);assert len(native)==1
args=procs[native[0]]['args'];assert '-o' in args and Path(args[args.index('-o')+1]).parent==Path(run['directory'])
# Read-only scope observation for the active ordinary worker; no clean-worktree fiction.
import subprocess
dirty=subprocess.check_output(['git','-C',str(REPO),'status','--porcelain','--untracked-files=all'],text=True).splitlines()
prompt=(Path(run['directory'])/'prompt.md').read_text()
if current['stage'] in ('author','fix'):
 pattern=r'^Problem metadata: (.+)$' if current['stage']=='author' else r'^Problem: (.+)$'
 assert str(json.loads(re.search(pattern,prompt,re.M)[1])['id'])==current['problem_id']
 ownership='Own ONLY leetcode/<id>/ and tests inside that folder. Do not edit shared assets,' if current['stage']=='author' else 'Own only\nleetcode/<id>/ and tests/evidence inside it.'
 assert ownership in prompt
 allowed='leetcode/'+current['problem_id']+'/'
 assert all(line[3:].startswith(allowed) and ' -> ' not in line for line in dirty),dirty
else:
 match=re.search(r"This run's exclusive screenshot directory is (specs/reviews/[0-9]+-evidence/[A-Za-z0-9-]+)/\.",prompt);assert match
 allowed=match[1];report='specs/reviews/'+Path(allowed).name+'.md'
 assert all(line.startswith('?? ') and (line[3:]==report or line[3:].startswith(allowed+'/'))for line in dirty),dirty
files=imp.git(REPO,'ls-tree','-r','--name-only',head,'leetcode/854').splitlines();assert files
runtime={path.removeprefix('leetcode/854/'):sha((REPO/path).read_bytes())for path in files}
assert all(sha(imp.blob(REPO,head,'leetcode/854/'+name))==digest for name,digest in runtime.items())
runs=[r for r in state['runs']if r['problem_id']=='854']
imp.validate_runs({'runs':runs,'problems':{'854':entry}},STATE,'854',{'runs':[r for r in state['runs']if r['problem_id']!='854']})
pins['accepted']['854']={'entry':entry,'entry_sha256':helper.canonical(entry),'runs_sha256':helper.canonical(runs),'lesson_git_tree':imp.git(REPO,'rev-parse','HEAD:leetcode/854'),'runtime_sha256':runtime,'report_sha256':sha((REPO/entry['prior_report']).read_bytes())}
pins['previous_owner']=OWNER;pins['previous_receipt_sha256']=sha(prior_raw)
ledger_raw=(STATE/'releases.json').read_bytes();ledger=json.loads(ledger_raw)
assert ledger['pending'] is None and '854' not in ledger['released']
pins['central']={'head':head,'current':current,'runner_pid':runner,'native_pid':native[0],'session_id':sessions[0]}
pins['release']={'ledger_sha256':sha(ledger_raw),'released_count':len(ledger['released']),'pending':None,'last_receipt':ledger['releases'][-1]}
pins['source_revision']=adapter.OBSERVED_SOURCE;pins['source_base']=adapter.OBSERVED_BASE
report_path='specs/reviews/854-bridge-review-20261026.md'
receipt_raw=imp.blob(REPO,REVIEW,adapter.REVIEW_RECEIPT);source_receipt=json.loads(receipt_raw)
pins['source_review']={'candidate':adapter.OBSERVED_SOURCE,'revision':REVIEW,'report_path':report_path,'report_sha256':source_receipt['files'][report_path],'outcome':'accepted','required_open':[],'receipt_path':adapter.REVIEW_RECEIPT,'receipt_sha256':sha(receipt_raw)}
pins['source_push']={'head':REVIEW,'ref':'refs/heads/codex/leetcode-854-proof-bridge'}
pins['status']='frozen-source-reviewed-post9961000-import'
adapter.ready(pins,manifest);adapter.previous_guard(prior_raw,pins);adapter.initial_guard(helper,state,pins)
# The full source guard is reused. Its sole fetch call becomes an object-existence read,
# because any needed exact object fetch was separately authorized and already recorded.
def readonly_source_git(*args):
 if args[0]=='fetch':
  assert args==('fetch','--no-tags','origin',REVIEW)
  return imp.git(REPO,'cat-file','-e',REVIEW+'^{commit}')
 return imp.git(REPO,*args)
source_op=types.SimpleNamespace(imp=imp,git=readonly_source_git)
payload,source_base,source_tree=adapter.source_payload(source_op,pins,manifest)
adapter.target_guard(source_op,imp.tree(REPO,head),source_base,payload,manifest)
reopen.accepted_guard(state,pins)
plan=helper.resume_plan(state,ledger)
projected=reopen.transition(state,head,pins,{'kind':'read-only-projection'})
projected_plan=helper.resume_plan(projected,ledger)
assert projected_plan['next_problem_id']=='854' and projected['problems']['854']['phase']=='fix'
assert projected['queue']==state['queue'] and projected['runs']==state['runs'] and projected['problems']['995']==state['problems']['995']
assert _reviewed(REPO,projected,registry,head,{'854'})=={}
assert (STATE/'progress.json').read_bytes()==raw and imp.head(REPO)==head,'Central advanced during capture; do not silently repin'
assert (STATE/'releases.json').read_bytes()==ledger_raw and prior_path.read_bytes()==prior_raw and not (STATE/'STOP').exists()
assert reservations=={p.name:p.read_bytes()for p in STATE.glob('lane-*-reservation.json')}
assert not Path('/proc/1904720').exists() and Path('/proc/'+str(native[0])).exists()
assert imp.git(REPO,'ls-remote','origin','refs/heads/codex/all-hard-20261018').split()[0]==head
print(json.dumps({'pins':pins,'previous_receipt':prior,'accepted854_runs':runs,'source_review_receipt':source_receipt,'source_review_report':imp.blob(REPO,REVIEW,report_path).decode(),'observation':{'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'read_only':True,'object_fetch_performed_here':False,'head':head,'current':current,'runner_pid':runner,'native_pid':native[0],'native_args':args,'native_cwd':procs[native[0]]['cwd'],'session_id':sessions[0],'progress_sha256':sha(raw),'previous_receipt_sha256':sha(prior_raw),'ledger_sha256':sha(ledger_raw),'released_count':len(ledger['released']),'pending':None,'queue_sha256':helper.canonical(state['queue']),'lane_processes_absent':True,'reservation_sha256':{name:sha(value)for name,value in reservations.items()},'current_dirty_paths':dirty,'current_prompt_sha256':sha(prompt.encode()),'allowed_current_scope':allowed,'payload_paths':sorted(payload),'protected_files':manifest['protected'],'plan_before':plan,'plan_after854_reopen':projected_plan,'854_projected_ineligible':True,'995_entry':state['problems']['995'],'995_runs_sha256':helper.canonical([r for r in state['runs']if r['problem_id']=='995'])}},indent=2))
