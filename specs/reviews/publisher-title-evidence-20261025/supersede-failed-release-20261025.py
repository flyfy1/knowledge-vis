"""After independently accepted repairs, retire failed staged metadata only.
No production bytes or successful release counters are changed. The original
publisher will stage and verify a new batch; a prepared receipt covers the
ledger/progress two-file update. --apply is explicit; default is read-only.
"""
import pathlib,json,sys,copy,fcntl,hashlib,os
repo=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-20261018');state=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018');root=pathlib.Path('/home/songyy/projects/visual-site');sys.path.insert(0,str(repo/'scripts'))
from import_leetcode_lane import ownership,validate_checkout
from leetcode_campaign import save_state,now
from leetcode_publish import _reviewed,_safe,_sha
from leetcode_registry import read_registry
expected=sys.argv[1];ids=sys.argv[2].split(',');apply='--apply' in sys.argv[3:]
assert len(expected)==40 and ids and len(ids)==len(set(ids)) and all(x.isdigit() for x in ids)
with ownership(repo,state),(state/'release.lock').open('a') as lock:
 fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
 s=validate_checkout(repo,state);assert s['status']=='run_limit_reached' and s['current'] is None and s['expected_head']==expected
 assert not (state/'STOP').exists() and len(s['queue'])==984
 ledger_path=state/'releases.json';ledger=json.loads(ledger_path.read_text());old=copy.deepcopy(ledger);pending=ledger['pending']
 assert pending['id']=='b1aeec15655d493c88b66eced787cb9f' and not pending.get('published_at') and not pending.get('verification')
 assert set(ledger['released'])=={'51','52','60'} and len(ledger['releases'])==1 and len(pending['accepted'])==100
 assert ledger['repo']==str(repo) and ledger['publish_root']==str(root) and ledger['public_base']=='https://visual.integ.life'
 registry={str(r['id']):r for r in read_registry(repo/'leetcode/problems.config.js')}
 prospective={pid for pid,item in s['problems'].items() if item.get('status')=='accepted_local' and ledger['released'].get(pid,{}).get('candidate')!=item.get('candidate')}
 accepted=_reviewed(repo,s,registry,expected,prospective)
 eligible=[pid for pid in s['queue'] if pid in accepted and ledger['released'].get(pid,{}).get('digest')!=accepted[pid]['digest']]
 assert eligible==list(pending['accepted']) and len(eligible)==100, 'Original publisher would select a different batch'
 assert set(pending['accepted']).issubset(accepted)
 for pid in ids:
  assert pid in pending['accepted'] and s['problems'][pid]['status']=='accepted_local'
  assert accepted[pid]['candidate']!=pending['accepted'][pid]['candidate']
  assert s['problems'][pid]['reviews'][-1]['required_open']==[]
 for pid in set(pending['accepted'])-set(ids):assert accepted[pid]['candidate']==pending['accepted'][pid]['candidate'] and accepted[pid]['digest']==pending['accepted'][pid]['digest']
 stage=_safe(state,pending['stage']);assert stage.is_dir() and stage.name=='release-stage-'+pending['id']
 for path,digest in pending['files'].items():assert _sha(_safe(stage,path).read_bytes())==digest
 for path,digest in pending['public_files'].items():assert _sha(_safe(root,path).read_bytes())==digest, path
 before_registry=ledger['registry_sha256'];applied_registry=pending['files']['leetcode/problems.config.js']
 assert _sha(_safe(root,'leetcode/problems.config.js').read_bytes())==applied_registry
 audit=json.loads((state/'release-title-audit-v2-20261025.json').read_text());assert audit['release']==pending['id'] and audit['exit_code']!=0
 failure=json.loads((state/'before-public-title-repairs-20261025.json').read_text());assert failure['status']=='failed' and 'Missing lesson ID 239' in failure['error']
 assert s['queue']==failure['queue'], 'Queue changed since failed release'
 data={'kind':'supersede-failed-pending-release','at':now(),'failed_release_id':pending['id'],'source_revision':pending['revision'],'repaired_revision':expected,'repair_ids':ids,'successful_releases_unchanged':len(ledger['releases']),'released_unchanged':len(ledger['released']),'registry_sha_before':before_registry,'observed_materialized_registry_sha':applied_registry,'production_files_verified':len(pending['public_files']),'reason':failure['error'],'scope':'No successful release recorded; only physical registry ownership baseline acknowledges the already materialized failed batch. Original publisher must independently stage and verify all 100 again.'}
 print(json.dumps({**data,'apply':apply}),flush=True)
 if not apply:sys.exit(0)
 bp=state/'before-supersede-failed-release-ledger-20261025.json';bs=state/'before-supersede-failed-release-progress-20261025.json';receipt=state/'supersede-failed-release-receipt-20261025.json'
 for path,value in [(bp,ledger),(bs,s)]:
  with path.open('x') as f:
   json.dump(value,f,indent=2);f.flush();os.fsync(f.fileno())
 directory_fd=os.open(state,os.O_RDONLY)
 try:os.fsync(directory_fd)
 finally:os.close(directory_fd)
 assert not receipt.exists();save_state(receipt,{**data,'status':'prepared','ledger_backup':str(bp),'progress_backup':str(bs)})
 ledger.setdefault('superseded_pending',[]).append({**pending,'superseded_at':data['at'],'status':'failed_public_verification','failure':failure['error'],'repair_ids':ids,'replacement_revision':expected})
 ledger['pending']=None;ledger['registry_sha256']=applied_registry
 assert ledger['released']==old['released'] and ledger['releases']==old['releases']
 save_state(ledger_path,ledger)
 s.setdefault('maintenance',[]).append({**data,'receipt':str(receipt)})
 save_state(state/'progress.json',s);save_state(receipt,{**data,'status':'completed','ledger_backup':str(bp),'progress_backup':str(bs)})
 print('Failed pending metadata preserved; original publisher retry still required.',flush=True)
