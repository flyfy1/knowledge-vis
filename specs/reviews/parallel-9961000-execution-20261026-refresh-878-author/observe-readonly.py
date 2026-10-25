"""Observe the one authorized launch; does not retry or mutate runtime."""
from pathlib import Path
import json,hashlib,datetime,os,base64,subprocess
root=Path('/home/songyy/projects');s=root/'leetcode-hard-campaign-state-20261018';repo=root/'leetcode-hard-campaign-20261018';directory=s/'parallel-9961000-20261026-d58b169d'
procs={}
for d in Path('/proc').iterdir():
 if not d.name.isdigit():continue
 try:
  args=[v.decode()for v in (d/'cmdline').read_bytes().split(b'\0')if v];status=dict(line.split(':',1)for line in (d/'status').read_text().splitlines());procs[int(d.name)]={'args':args,'ppid':int(status['PPid']),'cwd':str((d/'cwd').resolve())}
 except (OSError,ProcessLookupError):pass
workers={pid:p for pid,p in procs.items()if any(a.endswith('/scripts/leetcode_campaign.py')for a in p['args'])}
central_raw=(s/'progress.json').read_bytes();central=json.loads(central_raw)
result={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'launcherAlive':1871363 in procs,'log':(directory/'launch.log').read_text(),'launcherSha256':hashlib.sha256((directory/'launch.py').read_bytes()).hexdigest(),'workers':workers,'central':{'current':central['current'],'expectedHead':central['expected_head'],'progressSha256':hashlib.sha256(central_raw).hexdigest(),'queueLength':len(central['queue']),'runnerPid':int((s/'runner.pid').read_text())},'head':subprocess.check_output(['git','-C',str(repo),'rev-parse','HEAD'],text=True).strip(),'stopAbsent':not(s/'STOP').exists(),'policySha256':hashlib.sha256((repo/'specs/leetcode-rendered-state-contract.md').read_bytes()).hexdigest(),'ledgerSha256':hashlib.sha256((s/'releases.json').read_bytes()).hexdigest(),'lanes':{}}
for pid in ['996','1000']:
 rp=s/('lane-'+pid+'-reservation.json');lane={'reservation':json.loads(rp.read_text())if rp.exists()else None}
 state=root/('leetcode-hard-lane-state-'+pid+'-20261026');path=state/'progress.json'
 if path.exists():
  raw=path.read_bytes();progress=json.loads(raw);current=progress.get('current');lane.update(current=current,progressRawBase64=base64.b64encode(raw).decode(),status=progress['status'])
  runner=int((state/'runner.pid').read_text());lane['runnerPid']=runner;lane['nice']=os.getpriority(os.PRIO_PROCESS,runner)if runner in procs else None
  if current:
   run=next(r for r in progress['runs']if r['id']==current['run_id']);events=[]
   event_path=Path(run['directory'])/'events.jsonl'
   if event_path.exists():
    eraw=event_path.read_bytes();lane['eventRawBase64']=base64.b64encode(eraw).decode()
    for line in eraw.decode().splitlines():
     try:e=json.loads(line)
     except ValueError:continue
     if e.get('type')in ['thread.started','turn.started','turn.completed','turn.failed','error']:events.append(e)
   desc={runner}
   while True:
    added={p for p,v in procs.items()if v['ppid']in desc}-desc
    if not added:break
    desc|=added
   native={p:v for p,v in procs.items()if p in desc and v['args']and '/vendor/'in v['args'][0]and v['args'][0].endswith('/codex')}
   lane.update(run=run,events=events,native=native)
 result['lanes'][pid]=lane
print(json.dumps(result,indent=2))
