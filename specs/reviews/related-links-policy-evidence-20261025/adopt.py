import pathlib,json,sys,copy,subprocess,hashlib,os
repo=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-20261018')
state=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018')
sys.path.insert(0,str(repo/'scripts'))
from import_leetcode_lane import ownership,validate_checkout
from leetcode_campaign import save_state,now,head,changed_paths
expected,source=sys.argv[1:]
assert len(expected)==40 and source=='e40e6260e7ecfd6693f70442a306acf5416cf9b4'
paths=['specs/leetcode-rendered-state-contract.md','specs/proposals/leetcode-related-concept-links-20261025.md','specs/reviews/related-concept-links-spec-review-20261025.md','specs/reviews/related-concept-links-adoption-request-20261025.md']
with ownership(repo,state):
 s=validate_checkout(repo,state);old=copy.deepcopy(s)
 assert s['status']=='stopped' and s['expected_head']==expected and len(s['queue'])==984
 assert json.loads((state/'STOP').read_text())['owner']=='root-related-links-policy-20261025'
 assert s['current']['run_id']=='736-review-8dd8e06cbcd5'
 run=next(r for r in s['runs'] if r['id']==s['current']['run_id'])
 assert run['status']=='completed'
 entry=s['problems']['736']
 assert entry['candidate']=='fd5760e3a18bdc79f365db1aa62bea9e38b2671f'
 assert len(entry['reviews'])==1 and entry['reviews'][-1]['run_id']==run['id']
 assert (entry['phase'],entry['reviews'][-1]['outcome']) in [('register','accepted'),('fix','changes_required')]
 assert s['problems']['239']['status']=='accepted_local' and s['problems']['239']['candidate']=='08d7986c52ed70aefe1b0a970a210c73d6291a49'
 ledger_before=(state/'releases.json').read_bytes();ledger=json.loads(ledger_before)
 assert ledger['pending'] is None and len(ledger['released'])==103
 assert ledger['releases'][-1]['id']=='b5d3557210f44ff68a57b83fc0b4c5ee'
 spec=repo/paths[0];before=spec.read_bytes()
 assert hashlib.sha256(before).hexdigest()=='f1bbcaafcedf8d448e2ac00cb4a23f1cad137cb55160489e99b8f942139c20e4'
 assert all(not (repo/p).exists() for p in paths[1:])
 backup=state/'before-related-links-policy-adoption-20261025.json'
 receipt=state/'related-links-policy-adoption-receipt-20261025.json'
 assert not receipt.exists()
 with backup.open('x') as f:json.dump(s,f,indent=2);f.flush();os.fsync(f.fileno())
 fd=os.open(state,os.O_RDONLY)
 try:os.fsync(fd)
 finally:os.close(fd)
 record={'at':now(),'kind':'prospective-spec-adoption','before':expected,'source':source,'paths':paths,'backup':str(backup),'previous_current':s['current'],'spec_before_sha256':hashlib.sha256(before).hexdigest(),'736_review':entry['reviews'][-1],'scope':'Section12 for subsequent candidates, after frozen239 and736 reviews. Preserve all problem entries, runs, queue and release bytes.'}
 save_state(receipt,{**record,'status':'prepared'})
 subprocess.run(['git','restore','--source',source,'--worktree','--',*paths],cwd=repo,check=True)
 assert changed_paths(repo)==set(paths)
 after=spec.read_bytes();section=after[after.index(b'## 12.'):]
 assert after==before.rstrip()+b'\n\n'+section
 assert hashlib.sha256(after).hexdigest()=='226a94fb0cd222398b710718253d7ed46cd77f986ed61eef7e25c14213845dcc'
 assert hashlib.sha256(section).hexdigest()=='27c57059efa5186e8e9f48be316f9adb63c95fe18c377e82de4c1359f814fa2f'
 subprocess.run(['git','diff','--check'],cwd=repo,check=True)
 subprocess.run(['git','add','--',*paths],cwd=repo,check=True)
 subprocess.run(['git','commit','-q','-m','Adopt reviewed related-link guidance after frozen lesson reviews','-m',f'Source: {source}. Labels must match the destination concept; preserve historical candidates and release accounting.'],cwd=repo,check=True)
 s.update(expected_head=head(repo),current=None)
 record.update(after=s['expected_head'],spec_after_sha256=hashlib.sha256(after).hexdigest(),section_sha256=hashlib.sha256(section).hexdigest())
 s.setdefault('maintenance',[]).append(record)
 assert s['problems']==old['problems'] and s['runs']==old['runs'] and s['queue']==old['queue']
 assert not changed_paths(repo) and (state/'releases.json').read_bytes()==ledger_before
 save_state(state/'progress.json',s);save_state(receipt,{**record,'status':'completed'})
 assert json.loads(receipt.read_text())['status']=='completed'
 assert json.loads((state/'STOP').read_text())['owner']=='root-related-links-policy-20261025'
 (state/'STOP').unlink();print(json.dumps(record),flush=True)
subprocess.run([sys.executable,str(state/'launch.py'),'--continuous','--max-rounds','6'],check=True)
