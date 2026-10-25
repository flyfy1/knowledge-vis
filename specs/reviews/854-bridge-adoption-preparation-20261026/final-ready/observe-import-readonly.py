import json,datetime
from pathlib import Path
s=Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018')
p=s/'import9961000-only-20261026-641c280f.json'
r=json.loads(p.read_bytes()) if p.exists() else None
proc=Path('/proc/1904720')
print(json.dumps({'observed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'operator_pid':1904720,'operator_exists':proc.exists(),'operator_args':[x.decode()for x in (proc/'cmdline').read_bytes().split(b'\0')if x] if proc.exists() else None,'receipt':r},indent=2))
