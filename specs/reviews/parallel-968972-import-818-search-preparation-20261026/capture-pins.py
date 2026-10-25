import json,hashlib,subprocess,datetime
from pathlib import Path
R=Path('/home/songyy/projects');C=R/'leetcode-hard-campaign-20261018';S=R/'leetcode-hard-campaign-state-20261018'
def sha(b):return hashlib.sha256(b).hexdigest()
def can(v):return sha(json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode())
def read(p):return json.loads(p.read_text())
def git(repo,*a):return subprocess.check_output(['git','-C',str(repo),*a]).decode().strip()
d=read(S/'progress.json');out={'captured_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source':'a1d48550f44a65bc936de1706642a1b9ad858afd','ids':['968','972'],'queue_sha256':can(d['queue']),'queue_count':len(d['queue']),'lanes':{},'accepted818':{},'policy':{}}
for pid in out['ids']:
 repo=R/f'leetcode-hard-lane-{pid}-20261026';state=R/f'leetcode-hard-lane-state-{pid}-20261026';lane=read(state/'progress.json');e=lane['problems'][pid]
 assert lane['status']=='completed' and lane['current'] is None and e['status']=='accepted_local';runner=int((state/'runner.pid').read_text());assert not Path(f'/proc/{runner}').exists()
 out['lanes'][pid]={'head':git(repo,'rev-parse','HEAD'),'entry':e,'entry_sha256':can(e),'runs_sha256':can(lane['runs']),'progress_sha256':sha((state/'progress.json').read_bytes()),'report_sha256':sha((repo/e['prior_report']).read_bytes()),'runner_pid':runner,'reservation':read(S/f'lane-{pid}-reservation.json')}
e=d['problems']['818'];out['accepted818']={'entry':e,'entry_sha256':can(e),'runs_sha256':can([r for r in d['runs'] if r['problem_id']=='818']),'lesson_git_tree':git(C,'rev-parse','HEAD:leetcode/818'),'report_sha256':sha((C/e['reviews'][-1]['report_path']).read_bytes()),'runtime_sha256':{p.name:sha(p.read_bytes()) for p in (C/'leetcode/818').iterdir() if p.is_file()}}
paths=['scripts/import_leetcode_lane.py','scripts/leetcode_campaign.py','scripts/leetcode_publish.py','scripts/leetcode_registry.py','specs/leetcode-explainers.md','specs/leetcode-review-gates.md','specs/leetcode-rendered-state-contract.md','scripts/campaign-prompts/author.md','scripts/campaign-prompts/review.md','scripts/campaign-prompts/fix.md']
paths += [str(p.relative_to(C)) for p in sorted((C/'specs/reviews/workflow-copy-repair-requests-20261026').glob('*.md'))]
out['policy']={p:sha((C/p).read_bytes()) for p in paths};out['launcher_sha256']=sha((S/'launch.py').read_bytes());out['documents']={'specs/reviews/818-review-search-alternative-design-20261026.md':'3b09c41938373edd6abf2770d9873ad9c9888ef2ce1da4c19dff8fe633630ade','specs/reviews/818-review-search-alternative-request-20261026.md':'c8953ac8442b86fe3a63f97b1ed7832bda39897a798f1249cbc50af8b4e81528'}

out['observed_central']={'current':d['current'],'head':d['expected_head'],'stop_exists':(S/'STOP').exists()}
print(json.dumps(out,indent=2,ensure_ascii=False))
