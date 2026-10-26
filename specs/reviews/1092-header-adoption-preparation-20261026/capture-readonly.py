import datetime, hashlib, json, os, pathlib, subprocess
R=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-20261018');S=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018');sha=lambda b:hashlib.sha256(b).hexdigest()
state=(S/'progress.json').read_bytes();ledger=(S/'releases.json').read_bytes();s=json.loads(state)
paths=['scripts/leetcode_campaign.py','scripts/leetcode_publish.py','scripts/leetcode_static_versions.py','scripts/leetcode_registry.py','scripts/register_leetcode_lesson.py','scripts/campaign-prompts/author.md','scripts/campaign-prompts/fix.md','scripts/campaign-prompts/review.md','specs/leetcode-explainers.md','specs/leetcode-review-gates.md','specs/leetcode-rendered-state-contract.md']
def git(*a):return subprocess.check_output(['git','-C',str(R),*a]).decode().strip()
dirty=git('status','--porcelain=v1','--untracked-files=all').splitlines();assert all(x.startswith('?? ') for x in dirty)
runs={}
for run in s['runs']:
 if run['problem_id']=='1092':
  runs[run['id']]={str(p.relative_to(S)):sha(p.read_bytes()) for p in pathlib.Path(run['directory']).rglob('*') if p.is_file()}
print(json.dumps({'observed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head':git('rev-parse','HEAD'),'state_sha256':sha(state),'ledger_sha256':sha(ledger),'queue_sha256':sha(json.dumps(s['queue'],separators=(',',':')).encode()),'queue_count':len(s['queue']),'policy':{p:sha((R/p).read_bytes()) for p in paths},'launcher_sha256':sha((S/'launch.py').read_bytes()),'quarantine':{x[3:]:sha((R/x[3:]).read_bytes()) for x in dirty},'run_files':runs,'reservations':{p.name:sha(p.read_bytes()) for p in S.glob('lane-*-reservation.json')},'state_1092':s['problems']['1092'],'current':s['current'],'status':s['status'],'remote_head':git('ls-remote','origin','refs/heads/codex/all-hard-20261018'),'stop_exists':(S/'STOP').exists()},indent=2))
