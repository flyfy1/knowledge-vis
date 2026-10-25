
from pathlib import Path
import contextlib,datetime,json,os,sys
ROOT=Path('/home/songyy/projects');REPO=ROOT/'leetcode-hard-campaign-20261018';STATE=ROOT/'leetcode-hard-campaign-state-20261018';OWNER='campaign-runner-import903920-20261026-f17200ef'
os.environ['PATH']='/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin'
os.environ['NODE_PATH']='/home/songyy/projects/integ-games/node_modules'
os.environ['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH']='/home/songyy/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome'
sys.path.insert(0,str(REPO/'scripts'))
import import_leetcode_lane as imp
from leetcode_publish import _reviewed
from leetcode_registry import read_registry
central=json.loads((STATE/'progress.json').read_text()); assert central['status']=='running' and not (STATE/'STOP').exists()
assert central['expected_head']==imp.head(REPO)
lanes=[]
with contextlib.ExitStack() as locks:
 for pid in ['903','920']:
  repo=ROOT/f'leetcode-hard-lane-{pid}-20261025';state=ROOT/f'leetcode-hard-lane-state-{pid}-20261025';runner=int((state/'runner.pid').read_text())
  assert not (Path('/proc')/str(runner)).exists(), 'Lane runner still exists'
  locks.enter_context(imp.ownership(repo,state)); lane=imp.validate_checkout(repo,state)
  assert lane['status']=='completed' and lane.get('current') is None and lane['queue']==[pid]
  entry=lane['problems'][pid];assert entry['status']=='accepted_local' and entry['phase']=='done'
  assert pid not in central['problems'] and all(str(r.get('problem_id'))!=pid for r in central['runs'])
  runs=imp.validate_runs(lane,state,pid,central)
  registry={str(r['id']):r for r in read_registry(repo/'leetcode/problems.config.js')}
  _reviewed(repo,lane,registry,imp.head(repo),{pid})
  imp.same_shared(REPO,imp.head(REPO),entry['candidate']);imp.same_shared(REPO,imp.head(REPO),imp.head(repo))
  review=entry['reviews'][-1]
  for proc in Path('/proc').iterdir():
   if not proc.name.isdecimal():continue
   try:cwd=(proc/'cwd').resolve()
   except OSError:continue
   assert cwd!=repo, 'A process still owns the finished lane checkout'
  lanes.append({'id':pid,'repo':str(repo),'state_dir':str(state),'lane_head':imp.head(repo),'candidate':entry['candidate'],'score':review['weighted_score'],'required_open':review['required_open'],'report':entry['prior_report'],'run_ids':[r['id'] for r in runs],'reviewer_sessions':[r['session_ids'] for r in runs if r['role']=='review'],'runner_exited':runner})
 latest=json.loads((STATE/'progress.json').read_text());assert latest['status']=='running' and all(pid not in latest['problems'] for pid in ['903','920'])
 assert latest['expected_head']==imp.head(REPO)
 stop={'owner':OWNER,'created_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reason':'Finish the active stage, import independently accepted lanes903/920, then resume the same every20 continuous queue. Do not interrupt agents.','lane_ids':['903','920'],'resume_command':f'python3 {STATE}/launch.py --continuous --max-rounds 6'}
 with (STATE/'STOP').open('x') as out:
  json.dump(stop,out,indent=2);out.write('\n');out.flush();os.fsync(out.fileno())
 fd=os.open(STATE,os.O_RDONLY);os.fsync(fd);os.close(fd)
 receipt={'version':1,'status':'stop_requested','owner':OWNER,'created_at':stop['created_at'],'lanes':lanes,'central_before_stop':{'head':latest['expected_head'],'current':latest.get('current'),'status':latest['status']},'stop':stop}
 receipt_path=STATE/(OWNER+'.json');imp.save_state(receipt_path,receipt)
 print(json.dumps({'receipt_path':str(receipt_path),**receipt},indent=2))
