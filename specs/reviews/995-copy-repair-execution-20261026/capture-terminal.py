"""Read-only terminal evidence capture; pins and helper_source supplied by caller."""
import base64,hashlib,json,sys,types,datetime,os
from pathlib import Path
S=Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018');R=Path('/home/songyy/projects/leetcode-hard-campaign-20261018');owner='995-copy-repair-20261026-9d027af3'
sha=lambda b:hashlib.sha256(b).hexdigest()
raw=(S/(owner+'.json')).read_bytes();receipt=json.loads(raw)
assert receipt['status']=='completed-resumed',receipt
assert not Path('/proc/1857482').exists()
for p,h in pins['policy'].items():assert sha((R/p).read_bytes())==h
assert sha(helper_source.encode())=='f0c4ac708a4b0209c7a6522787b38a04923ac922d61d8afa0dbecf7b8ad61698'
os.environ['PATH']='/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin'
sys.path.insert(0,str(R/'scripts'))
import import_leetcode_lane as imp
from leetcode_publish import _reviewed
from leetcode_registry import read_registry
helper=types.ModuleType('terminal_helpers');exec(helper_source,helper.__dict__);helper.imp=imp;helper.pins=pins;helper.REOPEN_IDS=('995',)
state_raw=(S/'progress.json').read_bytes();state=json.loads(state_raw);ledger_raw=(S/'releases.json').read_bytes();ledger=json.loads(ledger_raw)
assert not (S/'STOP').exists() and ledger['pending'] is None and '995' not in ledger['released']
assert sha(ledger_raw)==pins['capture']['ledger_sha256']
assert helper.canonical(state['queue'])==pins['queue_sha256']
entry=state['problems']['995'];assert entry['status']=='changes_required' and entry['phase']=='fix'
prior=pins['accepted']['995']['entry']
for k in ('candidate','author_runs','reviews','rounds'):assert entry[k]==prior[k],k
record=[m for m in state['maintenance'] if m.get('request_id')=='995-COPY-R1'];assert len(record)==1 and record[0]['prior_accepted_entry']==prior
runs=[r for r in state['runs'] if r['problem_id']=='995'];assert helper.canonical(runs)==pins['accepted']['995']['runs_sha256']
assert imp.git(R,'rev-parse','HEAD:leetcode/995')==pins['accepted']['995']['lesson_git_tree']
assert all(sha((R/'leetcode/995'/p).read_bytes())==h for p,h in pins['accepted']['995']['runtime_sha256'].items())
assert all(sha((R/p).read_bytes())==h for p,h in pins['documents'].items())
registry={str(r['id']):r for r in read_registry(R/'leetcode/problems.config.js')};assert _reviewed(R,state,registry,imp.head(R),{'995'})=={}
processes=helper.processes();runner=int((S/'runner.pid').read_text());assert set(helper.workers(processes))=={runner};natives=helper.native_children(processes,runner);assert len(natives)==1
run=next(r for r in state['runs'] if r['id']==state['current']['run_id']);events=helper.fresh_events(run);sessions=[e['thread_id'] for e in events if e['type']=='thread.started'];assert len(sessions)==1 and any(e['type']=='turn.started' for e in events)
args=processes[natives[0]]['args'];assert Path(args[args.index('-o')+1]).parent==Path(run['directory'])
remote=imp.git(R,'ls-remote','origin','refs/heads/codex/all-hard-20261018').split()[0];assert remote==receipt['pushed_head']
files={owner+'.json':raw,'progress.json':state_raw,'releases.json':ledger_raw,'operator.log':(S/(owner+'-dispatch')/'operator.log').read_bytes(),'prior-import-receipt.json':(S/'import992995-only-20261026-888bb6ac.json').read_bytes()}
assert sha(files['prior-import-receipt.json'])==pins['previous_receipt_sha256']
print(json.dumps({'observation':{'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':receipt['status'],'current':state['current'],'head':imp.head(R),'remote_head':remote,'runner':runner,'native':natives[0],'session':sessions[0],'native_cwd':processes[natives[0]]['cwd'],'native_output':args[args.index('-o')+1],'queued995_status':entry['status'],'queued995_phase':entry['phase'],'queue_preserved':True,'995_history_preserved':True,'995_lesson_unchanged':True,'995_publication_ineligible':True,'ledger_preserved':True,'released_count':len(ledger['released']),'stop_absent':True,'operator_exited':True,'hashes':{p:sha(b) for p,b in files.items()}},'files':{p:base64.b64encode(b).decode() for p,b in files.items()}},indent=2))
