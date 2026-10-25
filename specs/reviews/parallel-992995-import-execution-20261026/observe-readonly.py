import json,hashlib,datetime,subprocess,base64
from pathlib import Path
state=Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018');repo=Path('/home/songyy/projects/leetcode-hard-campaign-20261018');owner='import992995-only-20261026-888bb6ac'
raw=(state/(owner+'.json')).read_bytes();receipt=json.loads(raw);progress=json.loads((state/'progress.json').read_bytes());current=progress.get('current');run=next((r for r in progress['runs'] if current and r['id']==current['run_id']),None)
result={'observed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'receipt':receipt,'receiptRawBase64':base64.b64encode(raw).decode(),'receiptSha256':hashlib.sha256(raw).hexdigest(),'operatorAlive':Path('/proc/1810489').exists(),'head':subprocess.check_output(['git','-C',str(repo),'rev-parse','HEAD'],text=True).strip(),'status':progress['status'],'current':current,'currentRun':run,'runnerPid':int((state/'runner.pid').read_text()),'stop':json.loads((state/'STOP').read_text()) if (state/'STOP').exists() else None,'reservation':{pid:json.loads((state/('lane-'+pid+'-reservation.json')).read_text()) for pid in ['992','995']},'ledgerSha256':hashlib.sha256((state/'releases.json').read_bytes()).hexdigest(),'policySha256':hashlib.sha256((repo/'specs/leetcode-rendered-state-contract.md').read_bytes()).hexdigest(),'log':(state/(owner+'.log')).read_text()}
if receipt['status']=='completed-resumed':
 result['remote']=subprocess.check_output(['git','-C',str(repo),'ls-remote','origin','refs/heads/codex/all-hard-20261018'],text=True).strip()
 result['native']={}
 for pid in receipt['fresh_agent']['native_codex_pids']:
  d=Path('/proc')/str(pid)
  result['native'][str(pid)]={'alive':d.exists(),'cmdline':(d/'cmdline').read_bytes().replace(b'\0',b' ').decode(),'cwd':str((d/'cwd').resolve())} if d.exists() else {'alive':False}
 result['acceptedEntries']={pid:progress['problems'][pid] for pid in ['992','995']}
 result['laneImports']=progress.get('lane_imports',[])[-2:]
print(json.dumps(result,indent=2))
