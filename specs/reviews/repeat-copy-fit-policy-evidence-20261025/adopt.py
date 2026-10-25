import pathlib,json,sys,copy,subprocess,hashlib,os
repo=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-20261018')
state=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018')
sys.path.insert(0,str(repo/'scripts'))
from import_leetcode_lane import ownership,validate_checkout
from leetcode_campaign import save_state,now,head,changed_paths
expected,source=sys.argv[1:]
assert len(expected)==40 and source=='0c2cd7c6c676acb19fdb23d87f15eefc1f60089d'
paths=['specs/leetcode-rendered-state-contract.md','specs/proposals/leetcode-repeat-copy-and-fit-evidence-20261025.md','specs/reviews/repeat-copy-and-fit-spec-review-20261025.md','specs/reviews/repeat-copy-and-fit-spec-adoption-20261025.md']
with ownership(repo,state):
 s=validate_checkout(repo,state);old=copy.deepcopy(s)
 assert s['status']=='stopped' and s['expected_head']==expected and len(s['queue'])==984
 assert json.loads((state/'STOP').read_text())['owner']=='root-repeat-copy-fit-policy-20261025'
 assert s['current']['run_id']=='780-review-754e7a8c5af5'
 run=next(r for r in s['runs'] if r['id']==s['current']['run_id'])
 assert run['status']=='completed'
 entry=s['problems']['780']
 assert entry['candidate']=='c214c6549b53618d96782b6f827a5018c4c7f6e4'
 assert len(entry['reviews'])==1 and entry['reviews'][-1]['run_id']==run['id']
 assert (entry['phase'],entry['reviews'][-1]['outcome']) in [('register','accepted'),('fix','changes_required')]
 assert s['problems']['765']['status']=='accepted_local' and s['problems']['765']['candidate']=='8d44249808b43d9d56ad26592d276443a9994649'
 ledger_before=(state/'releases.json').read_bytes();ledger=json.loads(ledger_before)
 assert ledger['pending'] is None and len(ledger['released'])==103
 assert ledger['releases'][-1]['id']=='b5d3557210f44ff68a57b83fc0b4c5ee'
 spec=repo/paths[0];before=spec.read_bytes()
 assert hashlib.sha256(before).hexdigest()=='226a94fb0cd222398b710718253d7ed46cd77f986ed61eef7e25c14213845dcc'
 assert all(not (repo/p).exists() for p in paths[1:])
 backup=state/'before-repeat-copy-fit-policy-adoption-20261025.json'
 receipt=state/'repeat-copy-fit-policy-adoption-receipt-20261025.json'
 assert not receipt.exists()
 with backup.open('x') as f:json.dump(s,f,indent=2);f.flush();os.fsync(f.fileno())
 fd=os.open(state,os.O_RDONLY)
 try:os.fsync(fd)
 finally:os.close(fd)
 record={'at':now(),'kind':'prospective-spec-adoption','before':expected,'source':source,'paths':paths,'backup':str(backup),'previous_current':s['current'],'spec_before_sha256':hashlib.sha256(before).hexdigest(),'780_review':entry['reviews'][-1],'scope':'Sections4and8 for subsequent candidates after frozen765and780 reviews. Preserve all problem entries, runs, queue and release bytes.'}
 save_state(receipt,{**record,'status':'prepared'})
 subprocess.run(['git','restore','--source',source,'--worktree','--',*paths],cwd=repo,check=True)
 assert changed_paths(repo)==set(paths)
 after=spec.read_bytes()
 assert hashlib.sha256(after).hexdigest()=='d861a659f42607defb40f46505b02d0283be48a533127b40efa8c6bf543c4faa'
 assert hashlib.sha256((repo/paths[1]).read_bytes()).hexdigest()=='8997483ee9a81fcf5492362826c7eed901dd548d651a9a86738ebd8732291509'
 subprocess.run(['git','diff','--check'],cwd=repo,check=True)
 subprocess.run(['git','add','--',*paths],cwd=repo,check=True)
 subprocess.run(['git','commit','-q','-m','Adopt reviewed repeated-copy and fit evidence guidance after frozen reviews','-m',f'Source: {source}. Verify a fresh clipboard sentinel per attempt and distinguish failed width budgets from observed clipping; preserve historical candidates and release accounting.'],cwd=repo,check=True)
 s.update(expected_head=head(repo),current=None)
 record.update(after=s['expected_head'],spec_after_sha256=hashlib.sha256(after).hexdigest())
 s.setdefault('maintenance',[]).append(record)
 assert s['problems']==old['problems'] and s['runs']==old['runs'] and s['queue']==old['queue']
 assert not changed_paths(repo) and (state/'releases.json').read_bytes()==ledger_before
 save_state(state/'progress.json',s);save_state(receipt,{**record,'status':'completed'})
 assert json.loads(receipt.read_text())['status']=='completed'
 assert json.loads((state/'STOP').read_text())['owner']=='root-repeat-copy-fit-policy-20261025'
 (state/'STOP').unlink();print(json.dumps(record),flush=True)
subprocess.run([sys.executable,str(state/'launch.py'),'--continuous','--max-rounds','6'],check=True)
