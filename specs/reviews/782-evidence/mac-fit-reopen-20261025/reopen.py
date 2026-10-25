import pathlib,json,sys,copy,subprocess,os
repo=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-20261018')
state=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018')
sys.path.insert(0,str(repo/'scripts'))
from import_leetcode_lane import ownership,validate_checkout
from leetcode_campaign import save_state,now,head,changed_paths
expected,source=sys.argv[1:];assert len(expected)==len(source)==40
reports=['specs/reviews/782-review-mac-preacceptance-20261025.md','specs/reviews/782-review-mac-fit-diagnosis-20261025.md','specs/reviews/782-review-mac-margin-repair-request-20261025.md']
paths=reports+subprocess.check_output(['git','ls-tree','-r','--name-only',source,'--','specs/reviews/782-evidence/mac-preacceptance-20261025/','specs/reviews/782-evidence/mac-fit-diagnosis-20261025/'],cwd=repo,text=True).splitlines()
assert len(paths)>10
with ownership(repo,state):
 s=validate_checkout(repo,state);old=copy.deepcopy(s)
 assert s['status']=='stopped' and s['expected_head']==expected and len(s['queue'])==984
 assert json.loads((state/'STOP').read_text())['owner']=='root-782-mac-fit-20261025'
 assert s['current']['run_id']=='782-review-85be323f7d0c'
 run=next(r for r in s['runs'] if r['id']==s['current']['run_id']);assert run['status']=='completed'
 e=s['problems']['782'];assert e['candidate']=='0e53a2131353accc11a5ef746c5eba164efb14e4'
 assert len(e['reviews'])==1 and e['rounds']==1
 review=e['reviews'][-1];assert review['run_id']==run['id']
 assert (e['phase'],review['outcome']) in [('register','accepted'),('fix','changes_required')]
 assert e['prior_report']==review['report_path']=='specs/reviews/782-review-1-f9de8180.md'
 request=subprocess.check_output(['git','show',source+':'+reports[2]],cwd=repo,text=True)
 assert e['prior_report'] in request and '782-MAC-FIT-01' in request
 assert all(not (repo/p).exists() for p in paths)
 ledger_before=(state/'releases.json').read_bytes();ledger=json.loads(ledger_before)
 assert ledger['pending'] is None and len(ledger['released'])==103
 reservations={pid:(state/f'lane-{pid}-reservation.json').read_bytes() for pid in ['803','805']}
 for pid,data in reservations.items():
  reservation=json.loads(data);assert reservation['status']=='started' and reservation['publication_enabled'] is False
  assert pid not in s['problems']
 backup=state/'before-782-mac-fit-reopen-20261025.json';receipt=state/'782-mac-fit-reopen-receipt-20261025.json'
 assert not receipt.exists()
 with backup.open('x') as f:json.dump(s,f,indent=2);f.flush();os.fsync(f.fileno())
 fd=os.open(state,os.O_RDONLY)
 try:os.fsync(fd)
 finally:os.close(fd)
 record={'at':now(),'kind':'reopen-mac-selected-label','before':expected,'source':source,'problem_id':'782','finding':'782-MAC-FIT-01','paths':paths,'backup':str(backup),'previous_current':old['current'],'previous_entry':copy.deepcopy(e),'scope':'Supplement completed frozen review with visible Mac selected-label defect; preserve all runs, reviews, queue, other problems and releases. Independent803805workers remain untouched.'}
 save_state(receipt,{**record,'status':'prepared'})
 subprocess.run(['git','restore','--source',source,'--worktree','--',*paths],cwd=repo,check=True)
 assert changed_paths(repo)==set(paths)
 subprocess.run(['git','diff','--check'],cwd=repo,check=True)
 subprocess.run(['git','add','--',*paths],cwd=repo,check=True)
 subprocess.run(['git','commit','-q','-m','Reopen 782: long native-select label hides the result on Mac','-m','Independent diagnosis confirms 219.574px text exceeds the unchanged 210px budget and the closed control omits part of minus one. Require concise equivalent copy, full Mac recheck and fresh independent review. Preserve frozen review outcome.'],cwd=repo,check=True)
 e.update(status='changes_required',phase='fix',prior_report=reports[2]);s.update(current=None,expected_head=head(repo))
 record['after']=s['expected_head'];s.setdefault('maintenance',[]).append(record)
 assert s['runs']==old['runs'] and s['queue']==old['queue']
 for pid in s['problems']:
  if pid!='782':assert s['problems'][pid]==old['problems'][pid]
  else:
   assert {k:v for k,v in e.items() if k not in ['status','phase','prior_report']}=={k:v for k,v in old['problems'][pid].items() if k not in ['status','phase','prior_report']}
 assert not changed_paths(repo) and (state/'releases.json').read_bytes()==ledger_before
 assert all((state/f'lane-{pid}-reservation.json').read_bytes()==data for pid,data in reservations.items())
 save_state(state/'progress.json',s);save_state(receipt,{**record,'status':'completed'})
 assert json.loads(receipt.read_text())['status']=='completed'
 assert json.loads((state/'STOP').read_text())['owner']=='root-782-mac-fit-20261025'
 (state/'STOP').unlink();print(json.dumps(record),flush=True)
subprocess.run([sys.executable,str(state/'launch.py'),'--continuous','--max-rounds','6'],check=True)
