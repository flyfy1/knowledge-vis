"""Read-only completion capture; commit bytes remain the adoption target while854fix runs."""
import base64,copy,datetime,gzip,hashlib,json,os,subprocess,sys
from pathlib import Path
S=Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018');R=Path('/home/songyy/projects/leetcode-hard-campaign-20261018');OWNER='854-bridge-adoption-20261026-185d4ba0'
sha=lambda b:hashlib.sha256(b).hexdigest();git=lambda *a:subprocess.check_output(['git','-C',str(R),*a]);receipt_raw=(S/(OWNER+'.json')).read_bytes();receipt=json.loads(receipt_raw)
assert receipt['status']=='completed-resumed' and not Path('/proc/1979827').exists() and not (S/'STOP').exists()
raw=(S/'progress.json').read_bytes();state=json.loads(raw);ledger_raw=(S/'releases.json').read_bytes();ledger=json.loads(ledger_raw);before=receipt['before_state'];head=receipt['head'];old=receipt['old_head'];manifest=receipt['payload_manifest']
assert sha(ledger_raw)==receipt['before_ledger_sha256']==pins['release']['ledger_sha256'] and ledger['pending'] is None
assert state['queue']==before['queue'];assert state['runs'][:len(before['runs'])]==before['runs'];assert state['problems']['995']==before['problems']['995']
assert all(state['problems'][i]==entry for i,entry in before['problems'].items()if i!='854')
entry=state['problems']['854'];prior=before['problems']['854'];assert entry['status']=='changes_required' and entry['phase']=='fix'
for key in ('candidate','reviews','rounds','author_runs'):assert entry[key]==prior[key]
assert state['maintenance']==before.get('maintenance',[])+[receipt['maintenance']];assert receipt['maintenance']['prior_accepted_entry']==pins['accepted']['854']['entry']
assert git('rev-list','--parents','-n','1',head).decode().split()[1:]==[old]
changed=git('diff','--name-only',old,head).decode().splitlines();assert set(changed)==set(manifest['files']) and len(changed)==32
for path,item in manifest['files'].items():assert sha(git('show',head+':'+path))==item['after_sha256']
for name,digest in manifest['protected'].items():assert sha(git('show',head+':leetcode/854/'+name))==digest
for path,digest in pins['policy'].items():assert sha((R/path).read_bytes())==digest
os.environ['PATH']='/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin';sys.path.insert(0,str(R/'scripts'))
from leetcode_publish import _reviewed
from leetcode_registry import read_registry
registry={str(r['id']):r for r in read_registry(R/'leetcode/problems.config.js')};assert _reviewed(R,state,registry,head,{'854','995'})=={}
current=state['current'];assert current==receipt['fresh_agent']['current'] and current['problem_id']=='854' and current['stage']=='fix'
run=next(r for r in state['runs']if r['id']==current['run_id']);assert run['role']=='fix' and run['status']=='running';events=[json.loads(l)for l in (Path(run['directory'])/'events.jsonl').read_text().splitlines()];thread=[e for e in events if e['type']=='thread.started'];assert len(thread)==1 and any(e['type']=='turn.started'for e in events)
runner=receipt['launch']['pid'];native=receipt['fresh_agent']['native_codex_pids'][0];assert Path('/proc/'+str(runner)).exists() and Path('/proc/'+str(native)).exists();args=[x.decode()for x in Path(f'/proc/{native}/cmdline').read_bytes().split(b'\0')if x];assert Path(args[args.index('-o')+1]).parent==Path(run['directory']) and Path(f'/proc/{native}/cwd').resolve()==R
workers=[]
for d in Path('/proc').iterdir():
 if not d.name.isdigit():continue
 try:a=[x.decode()for x in(d/'cmdline').read_bytes().split(b'\0')if x]
 except OSError:continue
 if len(a)>1 and a[1].endswith('/scripts/leetcode_campaign.py'):workers.append(int(d.name))
assert workers==[runner]
remote=git('ls-remote','origin','refs/heads/codex/all-hard-20261018').decode().split()[0];assert remote==head==receipt['pushed_head']==receipt['resume_proof']['agent_candidate']
prior_raw=(S/'import9961000-only-20261026-641c280f.json').read_bytes();assert sha(prior_raw)==pins['previous_receipt_sha256']
files={'receipt.json':receipt_raw,'progress.json':raw,'releases.json':ledger_raw,'operator.log':(S/(OWNER+'-dispatch')/'operator.log').read_bytes(),'prior-import-receipt.json':prior_raw}
print(json.dumps({'observation':{'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':receipt['status'],'head':head,'remote_head':remote,'boundary_head':old,'current':current,'runner':runner,'native':native,'session':thread[0]['thread_id'],'exact32_payload':changed,'four_protected_unchanged':manifest['protected'],'prior_acceptance_and_runs_preserved':True,'queued995_preserved':True,'854_and995_publication_ineligible':True,'queue_preserved':True,'ledger_preserved':True,'released_count':len(ledger['released']),'post_reopen_plan':receipt['post_reopen_plan'],'stop_absent':True,'operator_exited':True,'hashes':{n:sha(b)for n,b in files.items()}},'files_gzip_base64':{n:base64.b64encode(gzip.compress(b,mtime=0)).decode()for n,b in files.items()}},indent=2))
