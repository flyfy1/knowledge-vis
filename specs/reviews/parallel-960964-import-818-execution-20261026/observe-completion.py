import os,sys,json,hashlib,subprocess,datetime
from pathlib import Path
os.environ['PATH']='/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin'
r=Path('/home/songyy/projects/leetcode-hard-campaign-20261018');s=Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018');owner='import960964-reopen818964-20261026-c740a1e6'
receipt=json.loads((s/(owner+'.json')).read_text());d=json.loads((s/'progress.json').read_text());ledger_raw=(s/'releases.json').read_bytes();ledger=json.loads(ledger_raw)
assert receipt['status']=='completed-resumed' and not (s/'STOP').exists()
assert hashlib.sha256(ledger_raw).hexdigest()==receipt['ledger_sha256']
proc=[]
for pr in Path('/proc').iterdir():
 if not pr.name.isdigit():continue
 try:args=[x.decode(errors='replace') for x in (pr/'cmdline').read_bytes().split(b'\0') if x]
 except OSError:continue
 if any(a.endswith('/scripts/leetcode_campaign.py') for a in args):proc.append({'pid':int(pr.name),'argv':args})
assert len(proc)==1 and proc[0]['pid']==receipt['launch']['pid']
for flag,value in [('--publish-every','20'),('--max-rounds','6')]:assert proc[0]['argv'][proc[0]['argv'].index(flag)+1]==value
assert Path('/proc/1481538').exists()
sys.path.insert(0,str(r/'scripts'));from leetcode_registry import read_registry;from leetcode_publish import _reviewed
head=subprocess.check_output(['git','-C',str(r),'rev-parse','HEAD'],text=True).strip();remote=subprocess.check_output(['git','-C',str(r),'ls-remote','origin','refs/heads/codex/all-hard-20261018'],text=True).split()[0]
registry={str(x['id']):x for x in read_registry(r/'leetcode/problems.config.js')};prospective={pid for pid,e in d['problems'].items() if e['status']=='accepted_local' and ledger['released'].get(pid,{}).get('candidate')!=e.get('candidate')};accepted=_reviewed(r,d,registry,head,prospective)
eligible=[pid for pid in d['queue'] if pid in accepted and ledger['released'].get(pid,{}).get('digest')!=accepted[pid]['digest']]
assert not any(ledger['released'].get(pid,{}).get('digest')==v['digest'] for pid,v in accepted.items())
assert (s/'releases.json').read_bytes()==ledger_raw
out={'observed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head':head,'remote_head':remote,'current':d['current'],'campaigns':proc,'native_codex_pid':1481538,'STOP_exists':False,'queue_count':len(d['queue']),'accepted_count':sum(e['status']=='accepted_local' for e in d['problems'].values()),'released_count':len(ledger['released']),'pending_release':ledger['pending'],'changed_digest_eligible':eligible,'ledger_sha256':hashlib.sha256(ledger_raw).hexdigest(),'entries':{pid:d['problems'][pid] for pid in ['815','818','960','964']},'request_sha256':{p:hashlib.sha256((r/p).read_bytes()).hexdigest() for p in receipt['document_sources']},'original_policy_sha256':{p:hashlib.sha256((r/p).read_bytes()).hexdigest() for p in ['specs/leetcode-explainers.md','scripts/campaign-prompts/author.md','scripts/leetcode_campaign.py','scripts/leetcode_publish.py']}}
print(json.dumps(out,indent=2))
