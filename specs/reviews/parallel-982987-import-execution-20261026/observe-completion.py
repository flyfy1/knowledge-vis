import pathlib,json,hashlib,subprocess,datetime,re
R=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-20261018');S=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018');raw=(S/'progress.json').read_bytes();p=json.loads(raw);lr=(S/'releases.json').read_bytes();l=json.loads(lr)
policy={n:hashlib.sha256((R/n).read_bytes()).hexdigest()for n in pins['policy']};assert policy==pins['policy'];assert hashlib.sha256(lr).hexdigest()==pins['release']['ledger_sha256']
records={}
for i in ['982','987']:
 assert p['problems'][i]==pins['lanes'][i]['entry']
 runs=[dict(r) for r in p['runs']if r['problem_id']==i]
 for r in runs:
  assert r['directory']==str(S/'runs'/r['id'])
  r['directory']=r.pop('source_directory')
 canonical=lambda x:hashlib.sha256(json.dumps(x,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()).hexdigest()
 assert canonical(runs)==pins['lanes'][i]['runs_sha256']
 v=json.loads((S/f'lane-{i}-reservation.json').read_text());assert v['status']=='imported';records[i]=v
workers=[];native=None
for x in pathlib.Path('/proc').iterdir():
 if not x.name.isdigit():continue
 try:a=[v.decode()for v in(x/'cmdline').read_bytes().split(b'\0')if v];status=(x/'status').read_text();cwd=str((x/'cwd').resolve());pp=int(re.search(r'^PPid:\s+(\d+)',status,re.M)[1])
 except (FileNotFoundError,PermissionError,ProcessLookupError):continue
 if len(a)>1 and a[1].endswith('/scripts/leetcode_campaign.py'):workers.append({'pid':int(x.name),'args':a,'cwd':cwd})
 if x.name=='1774809':native={'pid':int(x.name),'ppid':pp,'args':a,'cwd':cwd}
assert len(workers)==1 and workers[0]['pid']==1774575 and native and native['cwd']==str(R)
a=workers[0]['args'];assert a[a.index('--publish-every')+1]=='20' and a[a.index('--max-rounds')+1]=='6'
head=subprocess.check_output(['git','-C',str(R),'rev-parse','HEAD'],text=True).strip();remote=subprocess.check_output(['git','-C',str(R),'ls-remote','origin','refs/heads/codex/all-hard-20261018'],text=True).split()[0];assert head==remote=='1be3c657ef0c1ef3152f8abced78df2e278f09da'
print(json.dumps({'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head':head,'remote_head':remote,'current':p['current'],'status':p['status'],'workers':workers,'native':native,'stop_exists':(S/'STOP').exists(),'accepted_count':sum(e['status']=='accepted_local'for e in p['problems'].values()),'released_count':len(l['released']),'pending':l['pending'],'ledger_sha256':hashlib.sha256(lr).hexdigest(),'policy':policy,'reservations':records,'lane_entries_exact':True,'lane_runs_preserved_except_explicit_import_directory_relocation':True,'progress_sha256':hashlib.sha256(raw).hexdigest()},indent=2))
