"""Read-only post-launch process, event, and ownership verification."""
import pathlib,json,subprocess,datetime,os,re
root=pathlib.Path('/home/songyy/projects');central=root/'leetcode-hard-campaign-20261018';state_dir=root/'leetcode-hard-campaign-state-20261018';base='2b1cd8cfe14432d1e8d78433f080b1bdaeaf32ba'
procs=[]
for p in pathlib.Path('/proc').iterdir():
 if not p.name.isdecimal():continue
 try:
  args=[x.decode() for x in (p/'cmdline').read_bytes().split(b'\0') if x];status=(p/'status').read_text();ppid=int(re.search(r'^PPid:\s+(\d+)',status,re.M)[1])
 except (FileNotFoundError,ProcessLookupError,PermissionError):continue
 if args:procs.append({'pid':int(p.name),'ppid':ppid,'args':args})
workers=[p for p in procs if len(p['args'])>1 and p['args'][1].endswith('/scripts/leetcode_campaign.py')];assert len(workers)==3,workers
listeners=subprocess.check_output(['ss','-ltn'],text=True).splitlines()[1:]
lanes=[];sessions=[];nativepids=[]
for i,port in [('975',18793),('980',18794)]:
 repo=root/f'leetcode-hard-lane-{i}-20261026';sd=root/f'leetcode-hard-lane-state-{i}-20261026';receipt=json.loads((state_dir/f'lane-{i}-reservation.json').read_text());s=json.loads((sd/'progress.json').read_text());pid=int((sd/'runner.pid').read_text());worker=next(p for p in workers if p['pid']==pid);args=worker['args'];assert args[1]==str(repo/'scripts/leetcode_campaign.py')
 for flag,value in [('--repo',str(repo)),('--state-dir',str(sd)),('--ids',i),('--port',str(port)),('--max-rounds','6')]:assert args.count(flag)==1 and args[args.index(flag)+1]==value
 assert '--publish-root' not in args and '--public-base' not in args;nice=os.getpriority(os.PRIO_PROCESS,pid);assert nice>=10
 assert receipt['status']=='started' and receipt['runner_pid']==pid and receipt['base']==base and not receipt['publication_enabled'];assert s['status']=='running' and s['queue']==[i] and s['current']['problem_id']==i and s['current']['stage']=='author'
 run=next(r for r in s['runs']if r['id']==s['current']['run_id']);assert run['candidate']==s['expected_head']==base and not(sd/'STOP').exists();assert any(l.split()[3].endswith(':'+str(port))for l in listeners);eventpath=pathlib.Path(run['directory'])/'events.jsonl';events=[]
 for line in eventpath.read_text().splitlines():
  try:events.append(json.loads(line))
  except ValueError:pass
 thread=[e['thread_id'] for e in events if e.get('type')=='thread.started'];assert len(thread)==1 and any(e.get('type')=='turn.started'for e in events)
 desc={pid}
 while True:
  add={p['pid']for p in procs if p['ppid']in desc}-desc
  if not add:break
  desc|=add
 natives=[p for p in procs if p['pid']in desc and '/bin/codex'in p['args'][0] and 'exec'in p['args']];assert len(natives)==1
 native=natives[0];native_nice=os.getpriority(os.PRIO_PROCESS,native['pid']);assert native_nice==nice==10;assert str(pathlib.Path(run['directory'])/'final.json')in native['args'];assert str(pathlib.Path(run['directory'])/'schema.json')in native['args'];assert str(repo)in native['args'];sessions+=thread;nativepids.append(native['pid'])
 lanes.append({'id':i,'repo':str(repo),'state_dir':str(sd),'port':port,'reservation':receipt,'worker':worker,'nice':nice,'native_nice':native_nice,'preview_listening':True,'current':s['current'],'candidate':run.get('candidate'),'expected_head':s['expected_head'],'session':thread[0],'native':native,'events_bytes':eventpath.stat().st_size,'turn_started':True})
assert len(set(sessions))==2 and len(set(nativepids))==2
assert '01a174bb-07c4-7881-855c-30619660e8d7' not in sessions and 1609492 not in nativepids
s=json.loads((state_dir/'progress.json').read_text());head=subprocess.check_output(['git','-C',str(central),'rev-parse','HEAD'],text=True).strip();pid=int((state_dir/'runner.pid').read_text());assert head==s['expected_head']=='96e82a2f927f7506f2dd97956f1b837e67c9df1e' and s['current']['run_id']=='839-author-ed3a2c092deb' and not(state_dir/'STOP').exists();assert any(p['pid']==pid for p in workers)
centralrun=next(r for r in s['runs']if r['id']==s['current']['run_id']);centralnative=next(p for p in procs if p['pid']==1609492);assert str(pathlib.Path(centralrun['directory'])/'final.json')in centralnative['args']
mem=dict(l.split(':',1)for l in pathlib.Path('/proc/meminfo').read_text().splitlines())
print(json.dumps({'observed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'worker_count':len(workers),'lanes':lanes,'central':{'head':head,'pid':pid,'current':s['current'],'native':centralnative,'stop_exists':False,'unchanged_since_preflight':True},'mem_available_kib':int(mem['MemAvailable'].split()[0]),'loadavg':os.getloadavg()},indent=2))
