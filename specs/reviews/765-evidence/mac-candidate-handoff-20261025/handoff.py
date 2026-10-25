"""One-time evidence handoff; inspect prepared receipts instead of blindly retrying."""
import pathlib,json,sys,copy,subprocess,os,hashlib
repo=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-20261018');state=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018');sys.path.insert(0,str(repo/'scripts'))
from import_leetcode_lane import ownership,validate_checkout
from leetcode_campaign import save_state,now,head,changed_paths
expected,source=sys.argv[1:];assert len(expected)==len(source)==40
prefix='specs/reviews/765-evidence/mac-repaired-candidate-20261025/'
report='specs/reviews/765-review-mac-repaired-candidate-20261025.md'
def source_json(path):return json.loads(subprocess.check_output(['git','show',source+':'+path],cwd=repo))
diagnosis='specs/reviews/765-review-related-ready-diagnosis-20261025.md'
diagnosis_prefix='specs/reviews/765-evidence/mac-related-ready-20261025/'
paths=[report,diagnosis]+subprocess.check_output(['git','ls-tree','-r','--name-only',source,'--',prefix,diagnosis_prefix],cwd=repo,text=True).splitlines()
assert len(paths)>2
with ownership(repo,state):
 s=validate_checkout(repo,state);old=copy.deepcopy(s)
 assert s['status']=='stopped' and s['expected_head']==expected and len(s['queue'])==984
 assert json.loads((state/'STOP').read_text())['owner']=='root-765-mac-evidence-20261025'
 assert s['current'] and s['current']['run_id']=='765-fix-f62a2cf56e90'
 assert any(r['id']==s['current']['run_id'] and r['status']=='completed' for r in s['runs'])
 e=s['problems']['765'];assert e['status']=='blocked' and e['phase']=='done' and e['candidate']==expected
 assert len(e['reviews'])==1 and e['author_runs'][-1]=='765-fix-f62a2cf56e90'
 assert s['problems']['780']['status']=='review_pending' and s['problems']['780']['phase']=='review'
 assert s['problems']['780']['candidate']=='38db1038f63c3334adb3c36ae671569694228114'
 manifest=source_json(prefix+'candidate-files.json');parity=source_json(prefix+'candidate-parity.json');checks=source_json(prefix+'checks.json')
 assert manifest['revision']==parity['revision']==expected and not parity['changed'] and not parity['added']
 assert len(manifest['files'])==parity['files_checked']==219
 expected_checks={'preflight':['python3','-B','scripts/register_leetcode_lesson.py','765','--validate-only'],
  'test_solution.py':['python3','-B','leetcode/765/tests/test_solution.py'],
  **{name:['node','leetcode/765/tests/'+name] for name in ['test_core.cjs','test_browser.cjs','test_margin.cjs','test_rendered_contract.cjs']}}
 assert len(checks)==len(expected_checks) and {c['name'] for c in checks}==set(expected_checks)
 assert all(c['id']==765 and c['exit_code']==0 and c['command']==expected_checks[c['name']] for c in checks)
 for path,digest in manifest['files'].items():
  target=repo/path;assert target.resolve().is_relative_to(repo) and hashlib.sha256(target.read_bytes()).hexdigest()==digest,path
 ledger_before=(state/'releases.json').read_bytes();ledger=json.loads(ledger_before)
 assert ledger['pending'] is None and len(ledger['released'])==103
 assert all(not (repo/p).exists() for p in paths)
 backup=state/'before-765-mac-evidence-handoff-20261025.json'
 with backup.open('x') as f:json.dump(s,f,indent=2);f.flush();os.fsync(f.fileno())
 fd=os.open(state,os.O_RDONLY)
 try:os.fsync(fd)
 finally:os.close(fd)
 receipt=state/'765-mac-evidence-handoff-receipt-20261025.json';assert not receipt.exists()
 record={'at':now(),'kind':'native-mac-evidence-handoff','before':expected,'source':source,'problem_id':'765','finding':'765-MAC-MARGIN-01','paths':paths,'backup':str(backup),'previous_current':old['current'],'prior_detail':e['detail'],'scope':'Attach exact repaired-candidate Mac evidence and resume independent review. Preserve history, other entries, full queue and release bytes; no acceptance inferred.'}
 save_state(receipt,{**record,'status':'prepared'})
 subprocess.run(['git','restore','--source',source,'--worktree','--',*paths],cwd=repo,check=True)
 assert changed_paths(repo)==set(paths)
 subprocess.run(['git','add','--',*paths],cwd=repo,check=True)
 subprocess.run(['git','diff','--cached','--check'],cwd=repo,check=True)
 subprocess.run(['git','commit','-q','-m','Attach native Mac evidence for 765 margin repair before independent review'],cwd=repo,check=True)
 e.pop('detail');e.update(status='review_pending',phase='review');s.update(status='stopped',current=None,expected_head=head(repo));record['after']=s['expected_head'];s.setdefault('maintenance',[]).append(record)
 assert s['runs']==old['runs'] and s['queue']==old['queue']
 for pid in s['problems']:
  if pid!='765':assert s['problems'][pid]==old['problems'][pid]
  else:assert {k:v for k,v in e.items() if k not in ['status','phase']}=={k:v for k,v in old['problems'][pid].items() if k not in ['status','phase','detail']}
 assert not changed_paths(repo) and (state/'releases.json').read_bytes()==ledger_before
 save_state(state/'progress.json',s);save_state(receipt,{**record,'status':'completed'})
 assert json.loads(receipt.read_text())['status']=='completed' and json.loads((state/'STOP').read_text())['owner']=='root-765-mac-evidence-20261025'
 (state/'STOP').unlink();print(json.dumps({'after':record['after'],'receipt':str(receipt),'status':'completed'}),flush=True)
subprocess.run([sys.executable,str(state/'launch.py'),'--continuous','--max-rounds','6'],check=True)
