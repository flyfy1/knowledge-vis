import datetime, fcntl, hashlib, json, os, pathlib, shutil, subprocess, sys, time
R=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-20261018');S=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018')
HEAD='5cf73ee858d9a8938b55206c867233a8397d60f6';OLD='1092-review-7c8ae6c3edaf';OWNER='1092-capacity-recovery-20261026-1409'
A=S/OWNER
pins=json.loads(sys.stdin.readline())
sha=lambda b:hashlib.sha256(b).hexdigest()
def git(*a):return subprocess.check_output(['git','-C',str(R),*a]).decode().strip()
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def workers():
 out=[]
 for p in pathlib.Path('/proc').glob('[0-9]*'):
  try:
   cmd=(p/'cmdline').read_bytes().replace(b'\0',b' ').decode(errors='replace');cwd=os.readlink(p/'cwd')
   if int(p.name)!=os.getpid() and (str(R) in cmd or str(S) in cmd or cwd==str(R)):out.append({'pid':int(p.name),'cmd':cmd,'cwd':cwd})
  except OSError:pass
 return out
receipt={'owner':OWNER,'status':'preflight','started_at':now(),'cause':'Provider selected-model capacity failure; no lesson verdict','launch_invocations':0}
def save():
 temp=A/'receipt.tmp';temp.write_text(json.dumps(receipt,indent=2)+'\n');os.replace(temp,A/'receipt.json')
locks=[]
try:
 for p in [S/'runner.lock',R/'.git/leetcode-campaign.lock',S/'release.lock']:
  f=p.open('a');fcntl.flock(f,fcntl.LOCK_EX|fcntl.LOCK_NB);locks.append(f)
 assert not workers() and not (S/'STOP').exists(),'Active writer or STOP'
 raw=(S/'progress.json').read_bytes();ledger=(S/'releases.json').read_bytes();state=json.loads(raw)
 assert sha(raw)==pins['progress_sha256'] and sha(ledger)==pins['releases_sha256'],'State or ledger drift'
 assert git('rev-parse','HEAD')==state['expected_head']==state['problems']['1092']['candidate']==HEAD
 assert state['status']=='failed' and state['current']['run_id']==OLD
 assert git('status','--porcelain=v1','--untracked-files=all').splitlines()==pins['dirty'],'Dirty scope drift'
 assert len(state['queue'])==984 and json.loads(ledger)['pending'] is None
 for path,h in pins['policy_sha256'].items():assert sha((R/path).read_bytes())==h,path
 assert sha((S/'launch.py').read_bytes())==pins['launcher_sha256']
 exact=[x[3:] for x in pins['dirty']]
 for rel in exact:
  p=R/rel;assert p.is_file() and not p.is_symlink();assert sha(p.read_bytes())==pins['file_sha256'][str(p)]
 A.mkdir(exist_ok=False);save();(A/'progress-before.json').write_bytes(raw);(A/'releases-before.json').write_bytes(ledger);(A/'audit-pins.json').write_text(json.dumps(pins,indent=2)+'\n')
 shutil.copytree(S/'runs'/OLD,A/'failed-run')
 receipt['old_run_hashes']={str(p.relative_to(S/'runs'/OLD)):sha(p.read_bytes()) for p in (S/'runs'/OLD).rglob('*') if p.is_file()}
 receipt['moved']=[]
 for rel in exact:
  src=R/rel;dst=A/'partial-review'/rel;dst.parent.mkdir(parents=True,exist_ok=True);os.rename(src,dst);assert sha(dst.read_bytes())==pins['file_sha256'][str(src)];receipt['moved'].append({'path':rel,'sha256':sha(dst.read_bytes())});save()
 assert not git('status','--porcelain=v1','--untracked-files=all')
 assert git('rev-parse','HEAD')==HEAD and (S/'progress.json').read_bytes()==raw and (S/'releases.json').read_bytes()==ledger
 for path,h in pins['policy_sha256'].items():assert sha((R/path).read_bytes())==h
 assert not workers() and not (S/'STOP').exists()
 receipt['status']='quarantined-clean';save()
 for f in reversed(locks):f.close()
 locks=[]
 receipt['launch_invocations']=1;receipt['status']='launching-once';save()
 result=subprocess.run([sys.executable,'-B',str(S/'launch.py'),'--continuous','--max-rounds','6'],capture_output=True,text=True,timeout=30)
 (A/'launch.stdout').write_text(result.stdout);(A/'launch.stderr').write_text(result.stderr);assert result.returncode==0,result.stderr
 launch=json.loads(result.stdout);receipt['launch']=launch;receipt['status']='launched-awaiting-fresh-review';save();print(json.dumps(receipt),flush=True)
except BaseException as e:
 receipt.update(status='failed-inspect-no-retry',error=str(e),failed_at=now())
 if A.exists():save()
 print(json.dumps(receipt),flush=True);raise
finally:
 for f in reversed(locks):f.close()
