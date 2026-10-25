import pathlib,json,sys,copy,subprocess,os
repo=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-20261018');state=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018');sys.path.insert(0,str(repo/'scripts'))
from import_leetcode_lane import ownership,validate_checkout
from leetcode_campaign import save_state,now,head,changed_paths
expected,source=sys.argv[1:];assert len(expected)==len(source)==40
paths=['specs/reviews/239-review-related-links-20261025.md','specs/reviews/239-review-navigation-repair-request-20261025.md']
with ownership(repo,state):
 s=validate_checkout(repo,state);old=copy.deepcopy(s)
 assert s['status']=='stopped' and s['expected_head']==expected and len(s['queue'])==984
 assert json.loads((state/'STOP').read_text())['owner']=='root-239-nav-20261025'
 assert s['current'] is None or any(r['id']==s['current']['run_id'] and r['status']=='completed' for r in s['runs'])
 assert s['problems']['736']['phase']=='review' and s['problems']['736']['status']=='review_pending'
 e=s['problems']['239'];assert e['status']=='accepted_local' and e['candidate']=='e0f51bb5f022702e7eea2ff108ee1fe99077a7fe' and len(e['reviews'])==3
 ledger_before=(state/'releases.json').read_bytes();ledger=json.loads(ledger_before)
 assert ledger['pending'] is None and len(ledger['released'])==103 and ledger['releases'][-1]['id']=='b5d3557210f44ff68a57b83fc0b4c5ee'
 assert all(not (repo/p).exists() for p in paths)
 backup=state/'before-239-navigation-reopen-20261025.json'
 with backup.open('x') as f:json.dump(s,f,indent=2);f.flush();os.fsync(f.fileno())
 fd=os.open(state,os.O_RDONLY)
 try:os.fsync(fd)
 finally:os.close(fd)
 receipt=state/'239-navigation-reopen-receipt-20261025.json';assert not receipt.exists()
 record={'at':now(),'kind':'reopen-navigation-advisory','before':expected,'source':source,'problem_id':'239','finding':'239-NAV-R1','paths':paths,'backup':str(backup),'previous_current':old['current'],'scope':'Reopen selected navigation advisory for a real fix and fresh independent review. Preserve all old runs, reviews, released receipts and full queue. Resume 736 at its saved review phase after the earlier 239 repair.'}
 save_state(receipt,{**record,'status':'prepared'})
 subprocess.run(['git','restore','--source',source,'--worktree','--',*paths],cwd=repo,check=True)
 assert changed_paths(repo)==set(paths)
 subprocess.run(['git','diff','--check'],cwd=repo,check=True)
 subprocess.run(['git','add','--',*paths],cwd=repo,check=True)
 subprocess.run(['git','commit','-q','-m','Reopen 239 navigation: labels promise concepts absent from target sections','-m','Independent follow-up confirms regex and rain-water destinations do not teach the advertised stack and prefix sums. Adopt truthful 84/327 repair request; retain historical acceptance and require a fresh separate review.'],cwd=repo,check=True)
 record['prior_acceptance']={k:e.pop(k) for k in ['accepted_at','registration_commit'] if k in e}
 e.update(status='changes_required',phase='fix',prior_report=paths[1]);s.update(status='stopped',current=None,expected_head=head(repo));record['after']=s['expected_head']
 s.setdefault('maintenance',[]).append(record)
 assert s['runs']==old['runs'] and s['queue']==old['queue']
 for pid in s['problems']:
  if pid!='239':assert s['problems'][pid]==old['problems'][pid]
  else:
   for k in ['reviews','author_runs','candidate','rounds']:assert s['problems'][pid][k]==old['problems'][pid][k]
 assert not changed_paths(repo) and (state/'releases.json').read_bytes()==ledger_before
 save_state(state/'progress.json',s);save_state(receipt,{**record,'status':'completed'})
 assert json.loads(receipt.read_text())['status']=='completed' and json.loads((state/'STOP').read_text())['owner']=='root-239-nav-20261025'
 (state/'STOP').unlink();print(json.dumps(record),flush=True)
subprocess.run([sys.executable,str(state/'launch.py'),'--continuous','--max-rounds','6'],check=True)
