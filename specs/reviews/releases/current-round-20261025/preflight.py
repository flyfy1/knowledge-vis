import pathlib,json,sys,hashlib,fcntl,subprocess
repo=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-20261018');directory=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018');root=pathlib.Path('/home/songyy/projects/visual-site')
sys.path.insert(0,str(repo/'scripts'))
from leetcode_publish import _reviewed
from leetcode_registry import read_registry
sha=lambda b:hashlib.sha256(b).hexdigest()
lockpath=pathlib.Path(subprocess.check_output(['git','rev-parse','--git-path','leetcode-campaign.lock'],cwd=repo,text=True).strip());lockpath=lockpath if lockpath.is_absolute() else repo/lockpath
with (directory/'runner.lock').open('a') as a,lockpath.open('a') as b:
 for lock in (a,b):fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
 s=json.loads((directory/'progress.json').read_text());l=json.loads((directory/'releases.json').read_text())
 assert s['status'] in ('stopped','run_limit_reached') and s.get('current') is None
 assert all(r['status']!='running' for r in s['runs'])
 assert json.loads((directory/'STOP').read_text())['owner']=='root-import803805-20261025'
 assert all(s['problems'][p]['status']=='accepted_local' for p in ['782','803','805'])
 rev=subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip();assert rev==s['expected_head']
 assert not subprocess.check_output(['git','status','--porcelain','--untracked-files=all'],cwd=repo).strip()
 assert l['pending'] is None and l['repo']==str(repo) and l['publish_root']==str(root) and l['public_base']=='https://visual.integ.life'
 assert sha((root/'leetcode/problems.config.js').read_bytes())==l['registry_sha256']
 registry={str(p['id']):p for p in read_registry(repo/'leetcode/problems.config.js')}
 prospective={p for p,e in s['problems'].items() if e.get('status')=='accepted_local' and l['released'].get(p,{}).get('candidate')!=e.get('candidate')}
 accepted=_reviewed(repo,s,registry,rev,prospective)
 ids=[p for p in s['queue'] if p in accepted and l['released'].get(p,{}).get('digest')!=accepted[p]['digest']]
 assert ids and len(ids)==len(set(ids))
 protected={p:sha((root/p).read_bytes()) for p in ['index.html','pages.config.js']}
 assert protected=={'index.html':'5c2fd1c30fee38137595f1599465970696c30fdf58ea687894741be508a49053','pages.config.js':'b75957b10f86d26c112447ca45327f3b3ff30aecbdeb12518b178cf81e81e0eb'}
 existing={str(p['id']) for p in read_registry(root/'leetcode/problems.config.js')}
 result={'revision':rev,'ids':ids,'batch_size':len(ids),'entries':[accepted[p]['registry'] for p in ids],'total':len(existing|set(ids)),'accepted':{p:{k:accepted[p][k] for k in ['candidate','digest','review']} for p in ids},'protected':protected,'state_sha256':sha((directory/'progress.json').read_bytes()),'ledger_sha256':sha((directory/'releases.json').read_bytes()),'status':s['status'],'queue_count':len(s['queue']),'normal_publish_every':100,'one_time_user_requested':True}
 dest=directory/'current-round-release-preflight-20261025.json';assert not dest.exists();dest.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:result[k] for k in ['revision','ids','batch_size','total','status']}))
