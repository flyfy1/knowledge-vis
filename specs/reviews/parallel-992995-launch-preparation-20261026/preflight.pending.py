"""Read-only launch eligibility census. Does not reserve ports or mutate Pi files."""
import pathlib,json,subprocess,hashlib,datetime,os,re,importlib.util,sys,socket
repo=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-20261018');root=pathlib.Path('/home/songyy/projects');state_dir=root/'leetcode-hard-campaign-state-20261018'
receipt_path=state_dir/'import982987-only-20261026-891ce2d4.json'
receipt_bytes=receipt_path.read_bytes();receipt=json.loads(receipt_bytes)
assert receipt['status']=='completed-resumed',receipt['status']
base='__PENDING_IMPORT982987_BASE__'
assert receipt['pushed_head']==base
assert receipt['ordinary_resume_proof']['agent_candidate']==base and receipt['fresh_agent']
s=json.loads((state_dir/'progress.json').read_text());head=subprocess.check_output(['git','-C',str(repo),'rev-parse','HEAD'],text=True).strip();current=s['current'];run=next(r for r in s['runs'] if r['id']==current['run_id']);events=[]
for line in (pathlib.Path(run['directory'])/'events.jsonl').read_text().splitlines():
 try:events.append(json.loads(line))
 except ValueError:pass
sessions=[e['thread_id'] for e in events if e.get('type')=='thread.started'];assert sessions
assert current['stage'] in ('author','fix','review') and run['status']=='running'
assert run['problem_id']==current['problem_id'] and run['role']==current['stage']
assert not any(e.get('type') in ('turn.completed','turn.failed') for e in events)
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
pins_path=state_dir/'import982987-only-20261026-e0e53065/pins.json'
pins_bytes=pins_path.read_bytes()
pins_sha=hashlib.sha256(pins_bytes).hexdigest()
assert pins_sha=='0d9dec18554ed18154ac5b4137371b08382bd217c290149fd048a46987387a01'
approved_pins=json.loads(pins_bytes)
for name,digest in approved_pins['policy'].items():
 assert hashlib.sha256((repo/name).read_bytes()).hexdigest()==digest,name
# Publisher's transitive static-builder dependency: existing ancestry from hash-pinned import pins.
static_path='scripts/leetcode_static_versions.py'
static_sha='f92eca0575bfcf74a4b68b9d011470e99415f12b671328bba1cebf035ddfd12e'
subprocess.run(['git','-C',str(repo),'cat-file','-e',approved_pins['lane_base']+'^{commit}'],check=True)
assert hashlib.sha256(subprocess.check_output(['git','-C',str(repo),'show',approved_pins['lane_base']+':'+static_path])).hexdigest()==static_sha
assert hashlib.sha256((repo/static_path).read_bytes()).hexdigest()==static_sha
sys.path.insert(0,str(repo/'scripts'))
spec=importlib.util.spec_from_file_location('lane_import',repo/'scripts/import_leetcode_lane.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);m.same_shared(repo,base,head)
reservations=[{'file':p.name,'record':json.loads(p.read_text())}for p in state_dir.glob('lane-*-reservation.json')]
mem=dict(l.split(':',1)for l in pathlib.Path('/proc/meminfo').read_text().splitlines());listeners=subprocess.check_output(['ss','-ltn'],text=True).splitlines()
targets=[]
for i,port in [('992',18797),('995',18798)]:
 targets.append({'id':i,'port':port,'in_queue':i in s['queue'],'problem_record':s['problems'].get(i),'runs':[r['id']for r in s['runs']if r.get('problem_id')==i],'reservation_exists':(state_dir/f'lane-{i}-reservation.json').exists(),'repo_exists':(root/f'leetcode-hard-lane-{i}-20261026').exists(),'state_exists':(root/f'leetcode-hard-lane-state-{i}-20261026').exists(),'branch_exists':subprocess.run(['git','-C',str(repo),'show-ref','--verify','--quiet',f'refs/heads/codex/lane-{i}-20261026']).returncode==0,'port_listeners':[l for l in listeners[1:]if l.split()[3].endswith(':'+str(port))]})
policy=hashlib.sha256((repo/'specs/leetcode-rendered-state-contract.md').read_bytes()).hexdigest()
assert policy=='816990a6035d174692115767e5332be077ba79d3400bdcfc3f5f2e6f47c0002c'
dirty=subprocess.check_output(['git','-C',str(repo),'status','--porcelain','--untracked-files=all'],text=True).splitlines()
prompt=(pathlib.Path(run['directory'])/'prompt.md').read_text()
match=re.search(r"This run's exclusive screenshot directory is (specs/reviews/[0-9]+-evidence/[A-Za-z0-9-]+)/\.",prompt)
allowed_evidence=match[1] if match else None
allowed_report='specs/reviews/'+pathlib.Path(allowed_evidence).name+'.md' if allowed_evidence else None
if current['stage']=='author':
 metadata=json.loads(re.search(r'^Problem metadata: (.+)$',prompt,re.M)[1])
 assert str(metadata['id'])==current['problem_id'] and re.fullmatch(r'[1-9][0-9]*',current['problem_id'])
 assert 'Own ONLY leetcode/<id>/ and tests inside that folder. Do not edit shared assets,' in prompt
 allowed_author='leetcode/'+current['problem_id']+'/'
 assert all(line[3:].startswith(allowed_author) and ' -> ' not in line for line in dirty),dirty
 allowed_dirty_scope={'stage':'author','prefix':allowed_author,'source':'Exact Own ONLY instruction plus current prompt problem metadata','trackedChangesAllowedWithinPrefix':True}
elif current['stage']=='fix':
 metadata=json.loads(re.search(r'^Problem: (.+)$',prompt,re.M)[1])
 assert str(metadata['id'])==current['problem_id'] and re.fullmatch(r'[1-9][0-9]*',current['problem_id'])
 assert 'Own only\nleetcode/<id>/ and tests/evidence inside it.' in prompt
 allowed_fix='leetcode/'+current['problem_id']+'/'
 assert all(line[3:].startswith(allowed_fix) and ' -> ' not in line for line in dirty),dirty
 allowed_dirty_scope={'stage':'fix','prefix':allowed_fix,'source':'Exact fix prompt ownership instruction plus current problem metadata','trackedChangesAllowedWithinPrefix':True}
else:
 assert current['stage']=='review',current['stage']
 assert all(line.startswith('?? ') and (line[3:]==allowed_report or (allowed_evidence and (line[3:]==allowed_evidence+'/' or line[3:].startswith(allowed_evidence+'/')))) for line in dirty),dirty
 allowed_dirty_scope={'stage':'review','report':allowed_report,'evidence':allowed_evidence,'trackedChangesAllowed':False}
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
print(json.dumps({'observed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'base':base,'central_head':head,'central_expected_head':s['expected_head'],'central_current':current,'central_status':s['status'],'central_runner_pid':runner,'central_session':sessions[-1],'central_native':native[0],'shared_tree_matches_base':True,'policy_sha256':policy,'campaign_workers':workers,'mem_available_kib':int(mem['MemAvailable'].split()[0]),'loadavg':os.getloadavg(),'reservations':[{'file':r['file'],'id':r['record'].get('id'),'status':r['record']['status']}for r in reservations],'stop_exists':False,'queue_length':984,'targets':targets,'dispatcher_preparation_source':'d3d2aa8eb61c17081beffdca687f9f2d15555973','982987_import_receipt':receipt,'982987_import_receipt_sha256':hashlib.sha256(receipt_bytes).hexdigest(),'current_phase_worktree_paths':dirty,'allowed_dirty_scope':allowed_dirty_scope,'current_prompt_sha256':hashlib.sha256(prompt.encode()).hexdigest(),'approved_982987_import_pins_sha256':pins_sha,'verified_policy_before_import':approved_pins['policy'],'verified_static_dependency_sha256':static_sha,'no_mutation':True},indent=2))
