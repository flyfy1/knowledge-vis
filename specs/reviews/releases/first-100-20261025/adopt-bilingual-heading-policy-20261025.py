import pathlib,json,sys,copy,subprocess,hashlib,os
repo=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-20261018');state=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018');sys.path.insert(0,str(repo/'scripts'))
from import_leetcode_lane import ownership,validate_checkout
from leetcode_campaign import save_state,now,head,changed_paths
expected,source=sys.argv[1:];assert len(expected)==len(source)==40
paths=['specs/leetcode-rendered-state-contract.md','specs/reviews/bilingual-heading-spec-review-20261025.md']
with ownership(repo,state):
 s=validate_checkout(repo,state);old=copy.deepcopy(s)
 assert s['status']=='run_limit_reached' and s['current'] is None and s['expected_head']==expected and not (state/'STOP').exists()
 for pid in ['239','262']:
  assert s['problems'][pid]['status']=='accepted_local' and s['problems'][pid]['reviews'][-1]['required_open']==[]
 assert len(s['queue'])==984
 ledger_before=(state/'releases.json').read_bytes();assert json.loads(ledger_before)['pending']['id']=='b1aeec15655d493c88b66eced787cb9f'
 backup=state/'before-bilingual-heading-policy-adoption-20261025.json'
 with backup.open('x') as f:json.dump(s,f,indent=2);f.flush();os.fsync(f.fileno())
 fd=os.open(state,os.O_RDONLY)
 try:os.fsync(fd)
 finally:os.close(fd)
 spec=repo/paths[0];before_hash=hashlib.sha256(spec.read_bytes()).hexdigest()
 assert before_hash=='778d83c31d92213bf4338a1a11f654985ce7fd71ba0a364c0297a16720c79cf7'
 subprocess.run(['git','restore','--source',source,'--worktree','--',*paths],cwd=repo,check=True)
 assert changed_paths(repo)==set(paths)
 section='## 11.'+spec.read_text().split('## 11.',1)[1]
 assert hashlib.sha256(section.encode()).hexdigest()=='48eaaabe3aef442b879a50b8fbb6b8a232a4ad73e15dc8b07820bf6c45da55ba'
 subprocess.run(['git','diff','--check'],cwd=repo,check=True)
 subprocess.run(['git','add','--',*paths],cwd=repo,check=True)
 subprocess.run(['git','commit','-q','-m','Adopt independently reviewed rendered bilingual heading guidance','-m',f'Source: {source}. Adopt after 239 and 262 repair reviews complete; retain all immutable candidate and release history.'],cwd=repo,check=True)
 s['expected_head']=head(repo)
 s.setdefault('maintenance',[]).append({'at':now(),'kind':'prospective-spec-adoption','before':expected,'after':s['expected_head'],'source':source,'paths':paths,'spec_before_sha256':before_hash,'spec_after_sha256':hashlib.sha256(spec.read_bytes()).hexdigest(),'review':paths[1],'backup':str(backup),'scope':'Future candidates only; both frozen title repairs accepted before guidance adoption.'})
 assert s['problems']==old['problems'] and s['runs']==old['runs'] and s['queue']==old['queue'] and not changed_paths(repo)
 assert (state/'releases.json').read_bytes()==ledger_before
 save_state(state/'progress.json',s);print(json.dumps(s['maintenance'][-1]))
