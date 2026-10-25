"""Read-only launch eligibility census. Does not reserve ports or mutate Pi files."""
import pathlib,json,subprocess,hashlib,datetime,os,re,importlib.util,sys
repo=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-20261018');root=pathlib.Path('/home/songyy/projects');state_dir=root/'leetcode-hard-campaign-state-20261018';base='58cb97e51878f40e234b3e78a8bf9adb24f30c51'
s=json.loads((state_dir/'progress.json').read_text());head=subprocess.check_output(['git','-C',str(repo),'rev-parse','HEAD'],text=True).strip();current=s['current'];run=next(r for r in s['runs'] if r['id']==current['run_id']);events=[]
for line in (pathlib.Path(run['directory'])/'events.jsonl').read_text().splitlines():
 try:events.append(json.loads(line))
 except ValueError:pass
sessions=[e['thread_id'] for e in events if e.get('type')=='thread.started'];assert sessions
procs=[]
for p in pathlib.Path('/proc').iterdir():
 if not p.name.isdecimal():continue
 try:
  args=[x.decode() for x in (p/'cmdline').read_bytes().split(b'\0') if x]
  status=(p/'status').read_text();ppid=int(re.search(r'^PPid:\s+(\d+)',status,re.M)[1])
 except (FileNotFoundError,ProcessLookupError,PermissionError):continue
 if args:procs.append({'pid':int(p.name),'ppid':ppid,'args':args})
workers=[p for p in procs if len(p['args'])>1 and p['args'][1].endswith('/scripts/leetcode_campaign.py')]
runner=int((state_dir/'runner.pid').read_text());assert any(p['pid']==runner for p in workers)
desc={runner}
while True:
 added={p['pid'] for p in procs if p['ppid'] in desc}-desc
 if not added:break
 desc|=added
native=[p for p in procs if p['pid'] in desc and '/bin/codex' in p['args'][0] and 'exec' in p['args']]
assert len(native)==1,native
sys.path.insert(0,str(repo/'scripts'))
spec=importlib.util.spec_from_file_location('lane_import',repo/'scripts/import_leetcode_lane.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);m.same_shared(repo,base,head)
reservations=[{'file':p.name,'record':json.loads(p.read_text())}for p in state_dir.glob('lane-*-reservation.json')]
mem=dict(l.split(':',1)for l in pathlib.Path('/proc/meminfo').read_text().splitlines());listeners=subprocess.check_output(['ss','-ltn'],text=True).splitlines()
targets=[]
for i,port in [('968',18791),('972',18792)]:
 targets.append({'id':i,'port':port,'in_queue':i in s['queue'],'problem_record':s['problems'].get(i),'runs':[r['id']for r in s['runs']if r.get('problem_id')==i],'reservation_exists':(state_dir/f'lane-{i}-reservation.json').exists(),'repo_exists':(root/f'leetcode-hard-lane-{i}-20261026').exists(),'state_exists':(root/f'leetcode-hard-lane-state-{i}-20261026').exists(),'branch_exists':subprocess.run(['git','-C',str(repo),'show-ref','--verify','--quiet',f'refs/heads/codex/lane-{i}-20261026']).returncode==0,'port_listeners':[l for l in listeners[1:]if l.split()[3].endswith(':'+str(port))]})
policy=hashlib.sha256((repo/'specs/leetcode-rendered-state-contract.md').read_bytes()).hexdigest()
assert s['status']=='running' and not(state_dir/'STOP').exists() and s['expected_head']==head and len(s['queue'])==984
assert len(workers)==1 and all(r['record']['status']=='imported' for r in reservations)
assert int(mem['MemAvailable'].split()[0])>1048576
assert all(t['in_queue'] and not any([t['problem_record'],t['runs'],t['reservation_exists'],t['repo_exists'],t['state_exists'],t['branch_exists'],t['port_listeners']])for t in targets)
assert any(e.get('type')=='turn.started' for e in events)
assert subprocess.check_output(['git','-C',str(repo),'rev-parse','HEAD'],text=True).strip()==head
print(json.dumps({'observed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'base':base,'central_head':head,'central_expected_head':s['expected_head'],'central_current':current,'central_status':s['status'],'central_runner_pid':runner,'central_session':sessions[-1],'central_native':native[0],'shared_tree_matches_base':True,'policy_sha256':policy,'campaign_workers':workers,'mem_available_kib':int(mem['MemAvailable'].split()[0]),'loadavg':os.getloadavg(),'reservations':[{'file':r['file'],'id':r['record'].get('id'),'status':r['record']['status']}for r in reservations],'stop_exists':False,'queue_length':984,'targets':targets,'dispatcher_preparation_source':'ca4622c7af1d498ab4fa02dc76a40b44161d715f','no_mutation':True},indent=2))
