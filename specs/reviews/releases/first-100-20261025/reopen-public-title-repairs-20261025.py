import pathlib,json,sys,copy,subprocess,os,hashlib
repo=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-20261018');state=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018');sys.path.insert(0,str(repo/'scripts'))
from import_leetcode_lane import ownership,validate_checkout
from leetcode_campaign import save_state,now,head,changed_paths
source=sys.argv[1];assert len(source)==40
with ownership(repo,state):
 s=validate_checkout(repo,state);old=copy.deepcopy(s)
 assert s['status']=='failed' and s['current'] is None and s['expected_head']=='7e35e4d6040aa295d1de0269996d8b91ba5d20a3'
 assert 'Missing lesson ID 239' in s['error'] and len(s['queue'])==984 and not (state/'STOP').exists()
 ledger_before=(state/'releases.json').read_bytes();ledger=json.loads(ledger_before)
 assert ledger['pending']['id']=='b1aeec15655d493c88b66eced787cb9f' and set(ledger['released'])=={'51','52','60'}
 paths=subprocess.check_output(['git','diff-tree','--no-commit-id','--name-only','-r',source],cwd=repo,text=True).splitlines()
 assert len(paths)==14 and all(p in ['scripts/leetcode_publish.py','scripts/test_leetcode_publish_browser.py'] or p.startswith('specs/reviews/') for p in paths)
 for pid in ['239','262']:assert s['problems'][pid]['status']=='accepted_local'
 backup=state/'before-public-title-repairs-20261025.json'
 with backup.open('x') as f:json.dump(s,f,indent=2);f.flush();os.fsync(f.fileno())
 fd=os.open(state,os.O_RDONLY)
 try:os.fsync(fd)
 finally:os.close(fd)
 subprocess.run(['git','restore','--source',source,'--worktree','--',*paths],cwd=repo,check=True)
 assert changed_paths(repo)==set(paths)
 assert hashlib.sha256((repo/'scripts/leetcode_publish.py').read_bytes()).hexdigest()=='f5937fc02c2603dfbba395c511578fa6f2a60ad0539e76e696e68ef04fa80494'
 subprocess.run(['git','diff','--check'],cwd=repo,check=True)
 subprocess.run(['git','add','--',*paths],cwd=repo,check=True)
 subprocess.run(['git','commit','-q','-m','Repair release gate: reviewed bilingual titles can be identical','-m','Confirmed IPO gate assumption with red fixture; actual 239 missing IDs and 262 English-only title require fresh separate repairs and independent reviews. Adopt reviewed publisher correction and preserve original failed release metadata.'],cwd=repo,check=True)
 reopen=[]
 for pid in ['239','262']:
  e=s['problems'][pid];report=f'specs/reviews/{pid}-review-public-title-20261025.md'
  prior={k:e.pop(k) for k in ['accepted_at','registration_commit'] if k in e}
  e.update(status='changes_required',phase='fix',prior_report=report)
  reopen.append({'problem_id':pid,'finding':pid+'-PUB-R1','report':report,'prior_acceptance':prior})
 s.update(status='stopped',expected_head=head(repo))
 s.setdefault('maintenance',[]).append({'at':now(),'kind':'reopen-public-title-repairs','source':source,'before':old['expected_head'],'after':s['expected_head'],'backup':str(backup),'reopened':reopen,'scope':'Original full queue and run/review history retained. Repair-only run omits publication; failed pending release and successful counters remain unchanged.'})
 assert s['runs']==old['runs'] and s['queue']==old['queue']
 for pid in s['problems']:
  if pid not in ['239','262']:assert s['problems'][pid]==old['problems'][pid]
  else:
   for k in ['reviews','author_runs','candidate']:assert s['problems'][pid][k]==old['problems'][pid][k]
 assert not changed_paths(repo) and (state/'releases.json').read_bytes()==ledger_before
 save_state(state/'progress.json',s)
 print(json.dumps({'head':s['expected_head'],'reopened':reopen}),flush=True)
env=os.environ.copy();env['PATH']='/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin';env['NODE_PATH']='/home/songyy/projects/integ-games/node_modules';env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH']='/home/songyy/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome'
with (state/'runner.log').open('a') as log:
 p=subprocess.Popen(['nice','-n','10',sys.executable,str(repo/'scripts/leetcode_campaign.py'),'--repo',str(repo),'--state-dir',str(state),'--ids',','.join(s['queue']),'--port','18770','--max-rounds','6','--run-count','2'],cwd=repo,env=env,stdin=subprocess.DEVNULL,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
(state/'runner.pid').write_text(str(p.pid)+'\n');print(json.dumps({'runner_pid':p.pid}),flush=True)
