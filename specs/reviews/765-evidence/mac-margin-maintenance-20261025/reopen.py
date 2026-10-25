import pathlib,json,sys,copy,subprocess,os
repo=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-20261018');state=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018');sys.path.insert(0,str(repo/'scripts'))
from import_leetcode_lane import ownership,validate_checkout
from leetcode_campaign import save_state,now,head,changed_paths
expected,source=sys.argv[1:];assert len(expected)==len(source)==40
paths=['specs/reviews/765-mac-fit-diagnosis-20261025.md','specs/reviews/765-review-mac-margin-repair-request-20261025.md']
paths += subprocess.check_output(['git','ls-tree','-r','--name-only',source,'--','specs/reviews/765-mac-fit-diagnosis-20261025/'],cwd=repo,text=True).splitlines()
assert len(paths)>2
with ownership(repo,state):
 s=validate_checkout(repo,state);old=copy.deepcopy(s)
 assert s['status']=='stopped' and s['expected_head']==expected and len(s['queue'])==984
 assert json.loads((state/'STOP').read_text())['owner']=='root-765-fit-20261025'
 assert s['current'] is None or any(r['id']==s['current']['run_id'] and r['status']=='completed' for r in s['runs'])
 assert s['problems']['780']['phase']=='review' and s['problems']['780']['status']=='review_pending'
 e=s['problems']['765'];assert e['status']=='accepted_local' and e['candidate']=='7ec592bddf5642212cdcb3363510982354da780e' and len(e['reviews'])==1
 ledger_before=(state/'releases.json').read_bytes();ledger=json.loads(ledger_before)
 assert ledger['pending'] is None and len(ledger['released'])==103 and ledger['releases'][-1]['id']=='b5d3557210f44ff68a57b83fc0b4c5ee'
 assert all(not (repo/p).exists() for p in paths)
 backup=state/'before-765-margin-reopen-20261025.json'
 with backup.open('x') as f:json.dump(s,f,indent=2);f.flush();os.fsync(f.fileno())
 fd=os.open(state,os.O_RDONLY)
 try:os.fsync(fd)
 finally:os.close(fd)
 receipt=state/'765-margin-reopen-receipt-20261025.json';assert not receipt.exists()
 record={'at':now(),'kind':'reopen-mac-text-margin','before':expected,'source':source,'problem_id':'765','finding':'765-MAC-MARGIN-01','paths':paths,'backup':str(backup),'previous_current':old['current'],'scope':'Reopen conservative native-select margin failure for label-only repair and fresh independent review. Preserve old runs, reviews, released receipts and full queue. Resume 780 at its saved review phase after the earlier 765 repair.'}
 save_state(receipt,{**record,'status':'prepared'})
 subprocess.run(['git','restore','--source',source,'--worktree','--',*paths],cwd=repo,check=True)
 assert changed_paths(repo)==set(paths)
 subprocess.run(['git','diff','--check'],cwd=repo,check=True)
 subprocess.run(['git','add','--',*paths],cwd=repo,check=True)
 subprocess.run(['git','commit','-q','-m','Reopen 765 text margin: conservative native-select budget fails on Mac','-m','Independent diagnosis confirms correct font measurement and fully visible original label, but the unchanged 24px-reserve assertion fails. Adopt shorter equivalent copy; retain history and require a fresh independent review.'],cwd=repo,check=True)
 record['prior_acceptance']={k:e.pop(k) for k in ['accepted_at','registration_commit'] if k in e}
 e.update(status='changes_required',phase='fix',prior_report=paths[1]);s.update(status='stopped',current=None,expected_head=head(repo));record['after']=s['expected_head']
 s.setdefault('maintenance',[]).append(record)
 assert s['runs']==old['runs'] and s['queue']==old['queue']
 for pid in s['problems']:
  if pid!='765':assert s['problems'][pid]==old['problems'][pid]
  else:
   for k in ['reviews','author_runs','candidate','rounds']:assert s['problems'][pid][k]==old['problems'][pid][k]
 assert not changed_paths(repo) and (state/'releases.json').read_bytes()==ledger_before
 save_state(state/'progress.json',s);save_state(receipt,{**record,'status':'completed'})
 assert json.loads(receipt.read_text())['status']=='completed' and json.loads((state/'STOP').read_text())['owner']=='root-765-fit-20261025'
 (state/'STOP').unlink();print(json.dumps(record),flush=True)
subprocess.run([sys.executable,str(state/'launch.py'),'--continuous','--max-rounds','6'],check=True)
