from pathlib import Path
import json,hashlib,subprocess,datetime
r=Path('/home/songyy/projects/leetcode-hard-campaign-20261018');s=Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018');owner='import968972-search818-stage-a-20261026-4b7e902d'
receipt=json.loads((s/(owner+'.json')).read_text());d=json.loads((s/'progress.json').read_text());before=json.loads((s/(owner+'-before-reopen.json')).read_text());ledger=(s/'releases.json').read_bytes();stop=(s/'STOP').read_bytes();procs=[]
for pr in Path('/proc').iterdir():
 if not pr.name.isdigit():continue
 try:
  args=[x.decode(errors='replace') for x in (pr/'cmdline').read_bytes().split(b'\0') if x];cwd=str((pr/'cwd').resolve())
 except OSError:continue
 if any(a.endswith('/scripts/leetcode_campaign.py') for a in args) or (cwd==str(r) and args and '/vendor/' in args[0] and args[0].endswith('/codex')):procs.append({'pid':int(pr.name),'args':args,'cwd':cwd})
def git(*a):return subprocess.check_output(['git','-C',str(r),*a],text=True).strip()
print(json.dumps({'observed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'receipt_status':receipt['status'],'error':receipt['error'],'head':git('rev-parse','HEAD'),'remote_head':git('ls-remote','origin','refs/heads/codex/all-hard-20261018').split()[0],'worktree_status':git('status','--porcelain','--untracked-files=all'),'state_status':d['status'],'current':d['current'],'pids_present':{str(pid):Path(f'/proc/{pid}').exists() for pid in [1523670,1582005,1481177]},'campaign_or_native_processes':procs,'runs_identical_to_before_reopen':d['runs']==before['runs'],'runs_added':len(d['runs'])-len(before['runs']),'queue_identical':d['queue']==before['queue'],'queue_count':len(d['queue']),'accepted_count':sum(e['status']=='accepted_local' for e in d['problems'].values()),'released_count':len(json.loads(ledger)['released']),'pending_release':json.loads(ledger)['pending'],'progress_sha256':hashlib.sha256((s/'progress.json').read_bytes()).hexdigest(),'ledger_sha256':hashlib.sha256(ledger).hexdigest(),'ledger_preserved':hashlib.sha256(ledger).hexdigest()==receipt['ledger_sha256'],'stop_raw_sha256':hashlib.sha256(stop).hexdigest(),'stop':json.loads(stop),'818':d['problems']['818'],'834':d['problems']['834']},indent=2))
