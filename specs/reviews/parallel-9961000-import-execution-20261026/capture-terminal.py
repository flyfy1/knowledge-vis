"""Read-only completion proof; caller supplies reviewed pins, lane snapshots and helper bytes."""
import base64,copy,datetime,hashlib,json,os,sys,types
from pathlib import Path
S=Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018');R=Path('/home/songyy/projects/leetcode-hard-campaign-20261018');OWNER='import9961000-only-20261026-641c280f'
sha=lambda b:hashlib.sha256(b).hexdigest()
receipt_raw=(S/(OWNER+'.json')).read_bytes();receipt=json.loads(receipt_raw);assert receipt['status']=='completed-resumed'
assert not Path('/proc/1904720').exists() and not (S/'STOP').exists()
for path,digest in pins['policy'].items():assert sha((R/path).read_bytes())==digest
assert sha(helper_source.encode())=='f0c4ac708a4b0209c7a6522787b38a04923ac922d61d8afa0dbecf7b8ad61698'
os.environ['PATH']='/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin'
sys.path.insert(0,str(R/'scripts'))
import import_leetcode_lane as imp
from leetcode_publish import _reviewed
from leetcode_registry import read_registry
h=types.ModuleType('read_only_helpers');exec(helper_source,h.__dict__);h.imp=imp;h.pins=pins;h.IDS=('996','1000');h.REOPEN_IDS=()
raw=(S/'progress.json').read_bytes();state=json.loads(raw);ledger_raw=(S/'releases.json').read_bytes();ledger=json.loads(ledger_raw)
assert sha(ledger_raw)==pins['release']['ledger_sha256'] and ledger['pending'] is None
assert h.canonical(state['queue'])==pins['queue_sha256'] and state['status']=='running'
q=pins['queued995_capture'];assert state['problems']['995']==q['entry'];assert h.canonical([r for r in state['runs'] if r['problem_id']=='995'])==q['runs_sha256'];assert [m for m in state['maintenance'] if m.get('request_id')=='995-COPY-R1']==q['maintenance']
files={'receipt.json':receipt_raw,'progress.json':raw,'releases.json':ledger_raw,'operator.log':(S/(OWNER+'-dispatch')/'operator.log').read_bytes()}
for pid in ('996','1000'):
 frozen=pins['lanes'][pid];assert state['problems'][pid]==frozen['entry']
 expected=[]
 for run in lane_snapshots[pid]['runs']:
  item=copy.deepcopy(run);item['source_directory']=item['directory'];item['directory']=str(S/'runs'/item['id']);expected.append(item)
 assert [r for r in state['runs'] if r['problem_id']==pid]==expected
 assert imp.git(R,'rev-parse','HEAD:leetcode/'+pid)==imp.git(R,'rev-parse',frozen['entry']['candidate']+':leetcode/'+pid)
 reservation_raw=(S/f'lane-{pid}-reservation.json').read_bytes();res=json.loads(reservation_raw);assert res['status']=='imported' and res['base']==pins['lane_base'];files[pid+'-reservation.json']=reservation_raw;files[pid+'-import-receipt.json']=Path(res['import_receipt']).read_bytes()
registry={str(r['id']):r for r in read_registry(R/'leetcode/problems.config.js')};assert set(_reviewed(R,state,registry,imp.head(R),{'996','1000'}))=={'996','1000'};assert _reviewed(R,state,registry,imp.head(R),{'995'})=={}
procs=h.processes();runner=int((S/'runner.pid').read_text());assert set(h.workers(procs))=={runner};native=h.native_children(procs,runner);assert len(native)==1
run=next(r for r in state['runs'] if r['id']==state['current']['run_id']);events=h.fresh_events(run);sessions=[e['thread_id'] for e in events if e['type']=='thread.started'];assert len(sessions)==1 and any(e['type']=='turn.started' for e in events)
args=procs[native[0]]['args'];assert Path(args[args.index('-o')+1]).parent==Path(run['directory']);assert procs[native[0]]['cwd']==str(R)
remote=imp.git(R,'ls-remote','origin','refs/heads/codex/all-hard-20261018').split()[0];assert remote==receipt['pushed_head']
assert (S/'progress.json').read_bytes()==raw and (S/'releases.json').read_bytes()==ledger_raw
print(json.dumps({'observation':{'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':receipt['status'],'head':imp.head(R),'remote':remote,'current':state['current'],'runner_pid':runner,'native_pid':native[0],'session_id':sessions[0],'native_cwd':procs[native[0]]['cwd'],'native_output':args[args.index('-o')+1],'accepted_pair_and_relocated_histories_preserved':True,'queued995_preserved_ineligible':True,'queue_preserved':True,'ledger_preserved':True,'released_count':len(ledger['released']),'eligible_ids':sorted(_reviewed(R,state,registry,imp.head(R))),'stop_absent':True,'operator_exited':True,'files_sha256':{n:sha(b) for n,b in files.items()}},'files':{n:base64.b64encode(b).decode() for n,b in files.items()}},indent=2))
