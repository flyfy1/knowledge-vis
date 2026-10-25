import pathlib,json,subprocess,fcntl,sys,os,hashlib
repo=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-20261018');state=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018')
source=sys.argv[1];expected=sys.argv[2]
assert source=='f9a98f177bfb016e97530326e51cbe9e15253e47'
def git(*args):return subprocess.check_output(['git',*args],cwd=repo)
lockpath=pathlib.Path(git('rev-parse','--git-path','leetcode-campaign.lock').decode().strip());lockpath=lockpath if lockpath.is_absolute() else repo/lockpath
with (state/'runner.lock').open('a') as a,lockpath.open('a') as b:
 for lock in (a,b):fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
 data=json.loads((state/'progress.json').read_text());original=json.loads(json.dumps(data))
 assert data['status']=='stopped' and data['expected_head']==expected==git('rev-parse','HEAD').decode().strip()
 assert not git('status','--porcelain','--untracked-files=all').strip()
 assert all(r['status']!='running' for r in data['runs'])
 assert json.loads((state/'STOP').read_text())['owner']=='root-import803805-20261025'
 e=data['problems']['782'];assert e['phase']=='fix' and e['status']=='changes_required' and e['rounds']==2
 assert e['reviews'][-1]['candidate']=='efa6a0356f63e851c594c346dd2ec07b644655e7' and e['reviews'][-1]['required_open']==['782-MAC-FIT-01']
 names=['specs/reviews/782-review-mac-repaired-candidate-20261025.md','specs/reviews/782-review-mac-repair-closure-20261025.md','specs/reviews/782-review-mac-proof-handoff-20261025.md']
 paths=git('ls-tree','-r','--name-only',source,'--',*names,'specs/reviews/782-evidence/mac-repaired-candidate-20261025').decode().splitlines()
 assert set(names)<=set(paths) and len(paths)==63
 assert git('rev-parse',source).decode().strip()==source
 for p in paths:
  assert git('ls-tree',source,'--',p).decode().split()[0] in ('100644','100755')
 assert all(not (repo/p).exists() for p in paths)
 receiptpath=state/'782-mac-proof-handoff-20261025.json';assert not receiptpath.exists()
 def save(p,v):
  tmp=p.with_suffix('.tmp');raw=(json.dumps(v,indent=2)+'\n').encode()
  with tmp.open('wb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
  tmp.replace(p)
  descriptor=os.open(p.parent,os.O_RDONLY)
  try:os.fsync(descriptor)
  finally:os.close(descriptor)
 receipt={'status':'prepared','before':expected,'source':source,'paths':paths};save(receiptpath,receipt)
 subprocess.run(['git','restore','--source',source,'--staged','--worktree','--',*paths],cwd=repo,check=True)
 assert set(git('diff','--cached','--name-only').decode().splitlines())==set(paths)
 subprocess.run(['git','commit','-m','Attach exact repaired 782 Mac proof for normal independent re-review','-m','Built-By: Codex dispatcher (exact model unavailable), evidence handoff only\nVerified-By: independent supplemental Mac evidence review; no acceptance override'],cwd=repo,check=True)
 after=git('rev-parse','HEAD').decode().strip();receipt['after']=after;save(receiptpath,receipt)
 data['expected_head']=after;e['prior_report']=names[2]
 check=json.loads(json.dumps(data));check['expected_head']=original['expected_head'];check['problems']['782']['prior_report']=original['problems']['782']['prior_report'];assert check==original
 assert not git('status','--porcelain','--untracked-files=all').strip();save(state/'progress.json',data)
 receipt['status']='completed';receipt['acceptance_override']=False;save(receiptpath,receipt)
 print(json.dumps(receipt))
