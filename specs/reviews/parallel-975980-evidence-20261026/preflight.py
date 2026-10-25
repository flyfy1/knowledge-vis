"""Read-only launch eligibility census. Does not reserve ports or mutate Pi files."""
import pathlib,json,subprocess,hashlib,datetime,os,re,importlib.util,sys,socket
repo=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-20261018');root=pathlib.Path('/home/songyy/projects');state_dir=root/'leetcode-hard-campaign-state-20261018'
receipt_path=state_dir/'818-search-stage-b-20261026-8f614c20.json'
receipt_bytes=receipt_path.read_bytes();receipt=json.loads(receipt_bytes)
assert receipt['status']=='completed-review-running',receipt['status']
base=receipt['evidence_head']
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
assert '-o' in native[0]['args'] and pathlib.Path(native[0]['args'][native[0]['args'].index('-o')+1]).parent==pathlib.Path(run['directory'])
assert pathlib.Path(f'/proc/{native[0]["pid"]}/cwd').resolve()==repo
pins_path=state_dir/'818-search-stage-b-20261026-a42e8435/pins.json'
pins_bytes=pins_path.read_bytes()
pins_sha=hashlib.sha256(pins_bytes).hexdigest()
assert pins_sha=='cba2aa3afe9fd177d4dd2d44d378f94c89375f803b7d2f47ca7c7067988fcb04'
approved_pins=json.loads(pins_bytes)
for name,digest in approved_pins['policy'].items():
 assert hashlib.sha256((repo/name).read_bytes()).hexdigest()==digest,name
# Publisher's transitive static-builder dependency: bytes from the pins' fixed source revision.
static_path='scripts/leetcode_static_versions.py'
static_sha='f92eca0575bfcf74a4b68b9d011470e99415f12b671328bba1cebf035ddfd12e'
assert hashlib.sha256(subprocess.check_output(['git','-C',str(repo),'show',approved_pins['source_revision']+':'+static_path])).hexdigest()==static_sha
assert hashlib.sha256((repo/static_path).read_bytes()).hexdigest()==static_sha
sys.path.insert(0,str(repo/'scripts'))
spec=importlib.util.spec_from_file_location('lane_import',repo/'scripts/import_leetcode_lane.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);m.same_shared(repo,base,head)
reservations=[{'file':p.name,'record':json.loads(p.read_text())}for p in state_dir.glob('lane-*-reservation.json')]
mem=dict(l.split(':',1)for l in pathlib.Path('/proc/meminfo').read_text().splitlines());listeners=subprocess.check_output(['ss','-ltn'],text=True).splitlines()
targets=[]
for i,port in [('975',18793),('980',18794)]:
 targets.append({'id':i,'port':port,'in_queue':i in s['queue'],'problem_record':s['problems'].get(i),'runs':[r['id']for r in s['runs']if r.get('problem_id')==i],'reservation_exists':(state_dir/f'lane-{i}-reservation.json').exists(),'repo_exists':(root/f'leetcode-hard-lane-{i}-20261026').exists(),'state_exists':(root/f'leetcode-hard-lane-state-{i}-20261026').exists(),'branch_exists':subprocess.run(['git','-C',str(repo),'show-ref','--verify','--quiet',f'refs/heads/codex/lane-{i}-20261026']).returncode==0,'port_listeners':[l for l in listeners[1:]if l.split()[3].endswith(':'+str(port))]})
policy=hashlib.sha256((repo/'specs/leetcode-rendered-state-contract.md').read_bytes()).hexdigest()
assert policy=='d861a659f42607defb40f46505b02d0283be48a533127b40efa8c6bf543c4faa'
dirty=subprocess.check_output(['git','-C',str(repo),'status','--porcelain','--untracked-files=all'],text=True).splitlines()
prompt=(pathlib.Path(run['directory'])/'prompt.md').read_text()
match=re.search(r"This run's exclusive screenshot directory is (specs/reviews/[0-9]+-evidence/[A-Za-z0-9-]+)/\.",prompt)
allowed_evidence=match[1] if match else None
allowed_report='specs/reviews/'+pathlib.Path(allowed_evidence).name+'.md' if allowed_evidence else None
assert all(line.startswith('?? ') and (line[3:]==allowed_report or (allowed_evidence and (line[3:]==allowed_evidence+'/' or line[3:].startswith(allowed_evidence+'/')))) for line in dirty),dirty
assert s['status']=='running' and not(state_dir/'STOP').exists() and s['expected_head']==head and len(s['queue'])==984
assert len(workers)==1 and all(r['record']['status']=='imported' for r in reservations)
assert int(mem['MemAvailable'].split()[0])>1048576
assert all(t['in_queue'] and not any([t['problem_record'],t['runs'],t['reservation_exists'],t['repo_exists'],t['state_exists'],t['branch_exists'],t['port_listeners']])for t in targets)
assert any(e.get('type')=='turn.started' for e in events)
for t in targets:
 assert not list((state_dir/'runs').glob(t['id']+'-*'))
 assert not any(str(r['record'].get('id'))==t['id'] or r['record'].get('port')==t['port'] for r in reservations)
 with socket.socket() as sock:sock.bind(('127.0.0.1',t['port']))
 t['bind_available']=True
again=json.loads((state_dir/'progress.json').read_bytes())
assert again['current']==current and again['expected_head']==head and again['status']=='running'
assert not (state_dir/'STOP').exists() and receipt_path.read_bytes()==receipt_bytes
assert pathlib.Path(f'/proc/{native[0]["pid"]}/cmdline').read_bytes().split(b'\0')[0].decode()==native[0]['args'][0]
assert subprocess.check_output(['git','-C',str(repo),'rev-parse','HEAD'],text=True).strip()==head
print(json.dumps({'observed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'base':base,'central_head':head,'central_expected_head':s['expected_head'],'central_current':current,'central_status':s['status'],'central_runner_pid':runner,'central_session':sessions[-1],'central_native':native[0],'shared_tree_matches_base':True,'policy_sha256':policy,'campaign_workers':workers,'mem_available_kib':int(mem['MemAvailable'].split()[0]),'loadavg':os.getloadavg(),'reservations':[{'file':r['file'],'id':r['record'].get('id'),'status':r['record']['status']}for r in reservations],'stop_exists':False,'queue_length':984,'targets':targets,'dispatcher_preparation_source':'74f2c6729ab50f1781b2fb5fadc2ff267e27d634','stage_b_receipt':receipt,'stage_b_receipt_sha256':hashlib.sha256(receipt_bytes).hexdigest(),'normal_current_review_untracked_paths':dirty,'approved_stage_b_pins_sha256':pins_sha,'verified_policy_before_import':approved_pins['policy'],'verified_static_dependency_sha256':static_sha,'no_mutation':True},indent=2))
