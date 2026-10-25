"""One-time operator launch; never publish or change central progress/source."""
import datetime,fcntl,hashlib,json,os,pathlib,socket,subprocess,sys,time
ROOT=pathlib.Path('/home/songyy/projects')
REPO=ROOT/'leetcode-hard-campaign-20261018'
STATE=ROOT/'leetcode-hard-campaign-state-20261018'
BASE='6c68b23cc306067de5a912195a3c7edeebc2a0be'
CENTRAL_HEAD='cf1a31fc75c66ca79e54513e050b7e0ba31b6e70'
CENTRAL_RUN='878-author-004c6e7e9e78'
POLICY='816990a6035d174692115767e5332be077ba79d3400bdcfc3f5f2e6f47c0002c'

def read(p): return json.loads(p.read_text())
def syncdir(p):
    fd=os.open(p,os.O_RDONLY)
    try: os.fsync(fd)
    finally: os.close(fd)
def save(p,v,exclusive=False):
    target=p if exclusive else p.with_name(p.name+'.'+str(os.getpid())+'.tmp')
    with target.open('x') as f:
        json.dump(v,f,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
    if not exclusive: os.replace(target,p)
    syncdir(p.parent)
def observe(proc,repo,state,pid,port):
    deadline=time.monotonic()+45
    while time.monotonic()<deadline:
        assert proc.poll() is None, 'New worker exited; inspect receipt and log, do not retry'
        args=[x.decode() for x in pathlib.Path(f'/proc/{proc.pid}/cmdline').read_bytes().split(b'\0') if x]
        if len(args)>1 and args[1]==str(repo/'scripts/leetcode_campaign.py'):
            for flag,value in [('--repo',str(repo)),('--state-dir',str(state)),('--ids',pid),('--port',str(port))]:
                assert args.count(flag)==1 and args[args.index(flag)+1]==value
            assert '--publish-root' not in args and '--public-base' not in args
            assert os.getpriority(os.PRIO_PROCESS,proc.pid)>=10
            progress=state/'progress.json'
            if progress.exists():
                s=read(progress)
                assert s['repo']==str(repo) and s['queue']==[pid]
                assert s['status']=='running',s['status']
                if s.get('current'):
                    assert s['current']['problem_id']==pid
                    run=next(r for r in s['runs'] if r['id']==s['current']['run_id'])
                    events=pathlib.Path(run['directory'])/'events.jsonl'
                    if events.exists():
                        parsed=[]
                        for line in events.read_text().splitlines():
                            try: parsed.append(json.loads(line))
                            except ValueError: pass
                        if any(e.get('type')=='thread.started' for e in parsed) and any(e.get('type')=='turn.started' for e in parsed):
                            return s['current']
        time.sleep(.2)
    raise RuntimeError('Observation timed out; preserve spawned receipt and re-poll exact PID, never restart')
def git(*args): return subprocess.check_output(['git','-C',str(REPO),*args],text=True).strip()
def workers():
    result=[]
    for proc in pathlib.Path('/proc').iterdir():
        if not proc.name.isdecimal(): continue
        try: args=[x.decode() for x in (proc/'cmdline').read_bytes().split(b'\0') if x]
        except FileNotFoundError: continue
        if len(args)>1 and args[1].endswith('/scripts/leetcode_campaign.py'):
            result.append((int(proc.name),args))
    return result

def validate(expected_workers):
    s=read(STATE/'progress.json')
    assert s['status']=='running' and not (STATE/'STOP').exists()
    assert s['expected_head']==CENTRAL_HEAD and git('rev-parse','HEAD')==CENTRAL_HEAD
    assert s['current']['problem_id']=='878'
    assert s['current']['stage']=='author' and s['current']['run_id']==CENTRAL_RUN
    run=next(r for r in s['runs'] if r['id']==CENTRAL_RUN)
    events=[json.loads(line) for line in (pathlib.Path(run['directory'])/'events.jsonl').read_text().splitlines() if line.startswith('{')]
    assert any(e.get('type')=='thread.started' and e.get('thread_id')=='01a17555-5f63-7560-97fa-cc0c74925f3f' for e in events)
    assert len(s['queue'])==984
    for pid in ['996','1000']:
        assert pid in s['queue'] and pid not in s['problems']
        assert not any(r.get('problem_id')==pid for r in s['runs'])
    current=workers();assert len(current)==expected_workers,current
    central_pid=int((STATE/'runner.pid').read_text())
    central=next(args for pid,args in current if pid==central_pid)
    assert central[1]==str(REPO/'scripts/leetcode_campaign.py')
    assert central[central.index('--state-dir')+1]==str(STATE)
    assert hashlib.sha256((REPO/'specs/leetcode-rendered-state-contract.md').read_bytes()).hexdigest()==POLICY
    return s

with (STATE/'parallel-launch-9961000.lock').open('a') as lock:
    fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
    validate(1)
    for p in STATE.glob('lane-*-reservation.json'): assert read(p).get('status')=='imported',p
    mem=dict(line.split(':',1) for line in pathlib.Path('/proc/meminfo').read_text().splitlines())
    assert int(mem['MemAvailable'].split()[0])>1024*1024
    plan=[('996',18799),('1000',18800)]
    for pid,port in plan:
        assert not (ROOT/f'leetcode-hard-lane-{pid}-20261026').exists()
        assert not (ROOT/f'leetcode-hard-lane-state-{pid}-20261026').exists()
        assert not (STATE/f'lane-{pid}-reservation.json').exists()
        assert not subprocess.run(['git','-C',str(REPO),'show-ref','--verify','--quiet',f'refs/heads/codex/lane-{pid}-20261026']).returncode==0
        with socket.socket() as sock: sock.bind(('127.0.0.1',port))
    env=dict(os.environ,PATH='/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin',NODE_PATH='/home/songyy/projects/integ-games/node_modules',PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/home/songyy/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome')
    for count,(pid,port) in enumerate(plan,1):
        validate(count)
        repo=ROOT/f'leetcode-hard-lane-{pid}-20261026';state=ROOT/f'leetcode-hard-lane-state-{pid}-20261026'
        receipt=STATE/f'lane-{pid}-reservation.json'
        record=dict(id=pid,base=BASE,repo=str(repo),state_dir=str(state),port=port,nice=10,status='prepared',started_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),policy_sha256=POLICY,publication_enabled=False,rule='Import only after independent acceptance at a stopped central boundary and while this ID remains unstarted. Monitor central before it reaches either reserved ID; do not count or publish lane acceptance independently.')
        save(receipt,record,True)
        subprocess.run(['git','-C',str(REPO),'worktree','add','-b',f'codex/lane-{pid}-20261026',str(repo),BASE],check=True,stdout=subprocess.DEVNULL)
        state.mkdir()
        with (state/'runner.log').open('a') as log:
            proc=subprocess.Popen(['nice','-n','10',sys.executable,str(repo/'scripts/leetcode_campaign.py'),'--repo',str(repo),'--state-dir',str(state),'--ids',pid,'--port',str(port),'--max-rounds','6'],cwd=repo,env=env,stdin=subprocess.DEVNULL,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
        (state/'runner.pid').write_text(str(proc.pid)+'\n')
        record.update(status='spawned',runner_pid=proc.pid);save(receipt,record)
        current=observe(proc,repo,state,pid,port)
        record.update(status='started',observed_current=current);save(receipt,record)
        print(json.dumps(record),flush=True)
