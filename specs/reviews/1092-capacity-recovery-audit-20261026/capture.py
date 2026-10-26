import base64, collections, datetime, hashlib, json, os, pathlib, subprocess, sys
os.environ['PATH']='/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin'
r=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-20261018');d=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018')
sha=lambda b:hashlib.sha256(b).hexdigest()
def git(*a):return subprocess.check_output(['git','-C',str(r),*a]).decode().strip()
sraw=(d/'progress.json').read_bytes();s=json.loads(sraw);lr=(d/'releases.json').read_bytes();l=json.loads(lr);run=next(x for x in s['runs'] if x['id']=='1092-review-7c8ae6c3edaf');rd=pathlib.Path(run['directory']);h=git('rev-parse','HEAD');dirty=git('status','--porcelain=v1','--untracked-files=all').splitlines()
files={}
for p in [rd/'events.jsonl',rd/'stderr.log',rd/'prompt.md',rd/'schema.json',d/'launch.py',r/'scripts/leetcode_campaign.py',r/'scripts/leetcode_publish.py']+[r/x[3:] for x in dirty]:files[str(p)]=base64.b64encode(p.read_bytes()).decode()
processes=[]
for p in pathlib.Path('/proc').glob('[0-9]*'):
 try:
  cmd=(p/'cmdline').read_bytes().replace(b'\0',b' ').decode(errors='replace');cwd=os.readlink(p/'cwd')
  if str(r) in cmd or str(d) in cmd or cwd==str(r):processes.append({'pid':int(p.name),'cwd':cwd,'cmd':cmd})
 except (OSError,PermissionError):pass
lock_lines=pathlib.Path('/proc/locks').read_text().splitlines();locks=[]
for p in [d/'runner.lock',r/'.git/leetcode-campaign.lock',d/'release.lock',d/'releases.lock',d/'import.lock']:
 if p.exists():
  st=p.stat();token=f'{os.major(st.st_dev):02x}:{os.minor(st.st_dev):02x}:{st.st_ino}';locks.append({'path':str(p),'token':token,'owners':[x for x in lock_lines if token in x]})
sys.path.insert(0,str(r/'scripts'));import leetcode_publish as pub;import leetcode_campaign as campaign
registry={str(x['id']):x for x in pub.read_registry(r/'leetcode/problems.config.js')};prospective={pid for pid,x in s['problems'].items() if x['status']=='accepted_local' and l['released'].get(pid,{}).get('candidate')!=x.get('candidate')};accepted=pub._reviewed(r,s,registry,h,prospective);eligible=[pid for pid in s['queue'] if pid in accepted and l['released'].get(pid,{}).get('digest')!=accepted[pid]['digest']]
catalog=json.loads((r/'leetcode/catalog/hard-problems.json').read_text());problem=next(x for x in catalog['problems'] if str(x['id'])=='1092');campaign.required_files(r,problem,True)
policy_paths=['scripts/leetcode_campaign.py','scripts/leetcode_publish.py','scripts/leetcode_static_versions.py','scripts/register_leetcode_lesson.py','scripts/campaign-prompts/author.md','scripts/campaign-prompts/review.md','scripts/campaign-prompts/fix.md','specs/leetcode-explainers.md','specs/leetcode-review-gates.md']
first=[51,52,60,65];expected_queue=list(map(str,first+[p['id'] for p in catalog['problems'] if p['id'] not in first]))
result={'observed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head':h,'expected_head':s['expected_head'],'branch':git('branch','--show-current'),'current':s['current'],'status':s['status'],'error':s.get('error'),'entry':s['problems']['1092'],'run':run,'counts':dict(collections.Counter(x['status'] for x in s['problems'].values())),'queue_count':len(s['queue']),'queue_exact_launch_match':s['queue']==expected_queue,'queue_sha256':sha(json.dumps(s['queue'],separators=(',',':')).encode()),'progress_sha256':sha(sraw),'releases_sha256':sha(lr),'released_count':len(l['released']),'pending_release':l['pending'],'eligible':eligible,'eligible_count':len(eligible),'dirty':dirty,'processes':processes,'locks':locks,'all_lock_lines':lock_lines,'stop_exists':(d/'STOP').exists(),'final_json_exists':(rd/'final.json').exists(),'candidate_required_files_valid':True,'lesson_tree':git('rev-parse',h+':leetcode/1092'),'canonical_sha256':sha((r/'leetcode/1092/solution.py').read_bytes()),'policy_sha256':{p:sha((r/p).read_bytes()) for p in policy_paths if (r/p).is_file()},'launcher_sha256':sha((d/'launch.py').read_bytes()),'remote_head':git('ls-remote','origin','refs/heads/codex/all-hard-20261018'),'file_sha256':{k:sha(base64.b64decode(v)) for k,v in files.items()},'state_unchanged_during_audit':(d/'progress.json').read_bytes()==sraw and (d/'releases.json').read_bytes()==lr}
print(json.dumps({'result':result,'files':files}))
