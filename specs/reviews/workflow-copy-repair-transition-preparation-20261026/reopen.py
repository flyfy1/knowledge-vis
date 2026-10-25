"""One-off nine-request transition, prepared only; exact independent-reviewed dispatch required."""
import argparse
import copy
import fcntl
import hashlib
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import time

REPO=Path('/home/songyy/projects/leetcode-hard-campaign-20261018')
STATE=Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018')
SOURCE='28efc3067c656f4cba8f5c90477b4506aa8eb6c4'
OWNER='workflow-copy-reopen-nine-20261026-6a2e0d39'
DISPATCH='root-reviewed-workflow-copy-reopen-nine-20261026'
PINS_SHA='d1feac5dc7c6e46b08ad90cb55877d4dae1332142154d19c6f408915c7d7b24d'
IDS=('780','793','798','801','815','903','920','940','956')
RECEIPT=STATE/(OWNER+'.json')
PREVIOUS=STATE/'campaign-runner-import940956-policy-20261026-2fb1c8d0.json'
POLICY={
 'specs/leetcode-explainers.md':'7fe59194a1ab1eb838a865a6cefcfbd98d527fe7657d1614c959b73c86dc404e',
 'scripts/campaign-prompts/author.md':'5f7feaa56f9f8f1f3f434e1fe4576cc2a10da21594c9aef829cab86e69dae06b',
 'specs/reviews/leetcode-baseline-syntax-spec-review-20261026.md':'a8d04609ccb62cf79d947210156ac99c64f23e5ab3da717c5cdc513f3d7314b1',
 'specs/reviews/leetcode-workflow-copy-spec-review-20261026.md':'e1ead272a7b986d24117f00c750e65943cfe3b0b8b243ad9a5fe30e2c355da29',
 'scripts/import_leetcode_lane.py':'8642a573383d052ce6e227bd8c2374f9c50f2fc1e8e9b312a6186607015344e0',
 'scripts/leetcode_campaign.py':'a1258a0e7eba60e1d813bf0f9ede57a71f92cd504f6afb7bd0553d68d41c65ed',
}
LAUNCHER_SHA='94056740463e5f9ec4fe63d0d2c56d1ccbf1ab60556f7952580fe58512127e70'
imp=None


def require(ok,message):
 if not ok:raise RuntimeError(message)
def sha(data):return hashlib.sha256(data).hexdigest()
def canonical(value):return sha(json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode())
def read(path):return json.loads(path.read_text())
def git(*args):return imp.git(REPO,*args)
def exclusive(path,data):
 with path.open('xb') as out:out.write(data);out.flush();os.fsync(out.fileno())
 fd=os.open(path.parent,os.O_RDONLY)
 try:os.fsync(fd)
 finally:os.close(fd)
def policy_guard():
 for path,digest in POLICY.items():require(sha((REPO/path).read_bytes())==digest,'Policy/runtime changed: '+path)
 require(sha((STATE/'launch.py').read_bytes())==LAUNCHER_SHA,'Launcher changed')
def stop_guard(raw):require((STATE/'STOP').read_bytes()==raw and json.loads(raw)['owner']==OWNER,'STOP ownership/content changed')


def process_table():
 result={}
 for pr in Path('/proc').iterdir():
  if not pr.name.isdigit():continue
  try:
   args=[x.decode(errors='replace') for x in (pr/'cmdline').read_bytes().split(b'\0') if x]
   status=dict(line.split(':',1) for line in (pr/'status').read_text().splitlines())
   result[int(pr.name)]={'args':args,'ppid':int(status['PPid']),'cwd':str((pr/'cwd').resolve())}
  except OSError:pass
 return result

def campaign_pids(procs):return [pid for pid,x in procs.items() if any(a.endswith('/scripts/leetcode_campaign.py') for a in x['args'])]
def native_children(procs,runner):
 result=[]
 for pid,x in procs.items():
  ancestor=x['ppid'];seen=set()
  while ancestor in procs and ancestor not in seen and ancestor!=runner:
   seen.add(ancestor);ancestor=procs[ancestor]['ppid']
  if ancestor==runner and x['args'] and '/vendor/' in x['args'][0] and x['args'][0].endswith('/codex') and x['cwd']==str(REPO):result.append(pid)
 return result


def boundary_guard(procs):
 require(not campaign_pids(procs) and not any(pid!=os.getpid() and x['cwd']==str(REPO) for pid,x in procs.items()),'Runner/native/preview process remains at boundary')

def accepted_guard(state,pins):
 require(len(state['queue'])==984 and canonical(state['queue'])==pins['queue_sha256'],'Queue changed')
 for pid in IDS:
  entry=state['problems'][pid];frozen=pins['accepted'][pid]
  require(entry==frozen['entry'] and canonical(entry)==frozen['entry_sha256'],'Accepted entry changed: '+pid)
  require(entry['status']=='accepted_local' and entry['phase']=='done','Target is not accepted/done: '+pid)
  require(entry['rounds']==len(entry['reviews']) and 0<entry['rounds']<6,'Retained review budget incompatible: '+pid)
  require(canonical([r for r in state['runs'] if r['problem_id']==pid])==frozen['runs_sha256'],'Historical runs changed: '+pid)
  require(git('rev-parse','HEAD:leetcode/'+pid)==frozen['lesson_git_tree'],'Tracked lesson tree changed: '+pid)
  for name,digest in frozen['runtime_sha256'].items():require(sha((REPO/'leetcode'/pid/name).read_bytes())==digest,'Runtime bytes changed: '+pid+'/'+name)
  require(sha((REPO/entry['prior_report']).read_bytes())==frozen['report_sha256'],'Prior report changed: '+pid)


def transition(before,head,pins,record):
 """Same narrow state delta as #239; retain all rounds/candidates/runs and other entries."""
 after=copy.deepcopy(before)
 for pid in IDS:
  entry=after['problems'][pid]
  require(entry['status']=='accepted_local' and entry['phase']=='done','Only accepted targets may reopen')
  require(0<entry['rounds']<6 and entry['rounds']==len(entry['reviews']),'Do not reset review budget')
  for key in ('accepted_at','registration_commit'):entry.pop(key,None)
  entry.update(status='changes_required',phase='fix',prior_report=pins['requests'][pid]['path'])
 after.update(status='stopped',current=None,expected_head=head)
 after.setdefault('maintenance',[]).append(copy.deepcopy(record))
 return after


def verify_transition(before,after,head,pins,record):
 expected=transition(before,head,pins,record)
 expected['updated_at']=after.get('updated_at') # Existing atomic save helper stamps this field.
 require(after==expected,'Unexpected state delta during nine-entry reopening')


def document_tree_guard(before,after,documents):
 changed={p for p in before.keys()|after.keys() if before.get(p)!=after.get(p)}
 require(changed==set(documents) and not set(documents)&set(before),'Request adoption changed/overwrote unexpected paths')
 require(all(after[p].split()[0]=='100644' for p in documents),'Request document mode differs')


def publication_guard(state,ledger,head):
 """Read-only equivalent of publisher candidate/digest selection; no count subtraction."""
 require(ledger['pending'] is None,'Pending release must be resolved before reopening')
 from leetcode_registry import read_registry
 from leetcode_publish import _reviewed
 registry={str(r['id']):r for r in read_registry(REPO/'leetcode/problems.config.js')}
 prospective={pid for pid,e in state['problems'].items() if e['status']=='accepted_local' and ledger['released'].get(pid,{}).get('candidate')!=e.get('candidate')}
 accepted=_reviewed(REPO,state,registry,head,prospective)
 require(not any(ledger['released'].get(pid,{}).get('digest')==item['digest'] for pid,item in accepted.items()),'Startup would refresh release pointers; inspect separately')
 eligible=[pid for pid in state['queue'] if pid in accepted and ledger['released'].get(pid,{}).get('digest')!=accepted[pid]['digest']]
 require(len(eligible)<20,'Startup would publish; inspect before reopening')
 return eligible


def resume_evidence(state,old_ids,old_sessions,expected,runner):
 current=state.get('current') or {};procs=process_table()
 if state['status']!='running' or current.get('problem_id')!=expected or current.get('stage')!='fix' or current.get('run_id') in old_ids:return None
 run=next((r for r in state['runs'] if r['id']==current.get('run_id')),None)
 if not run or run['status']!='running':return None
 events=[];path=Path(run['directory'])/'events.jsonl'
 if path.exists():
  for line in path.read_text().splitlines():
   try:e=json.loads(line)
   except ValueError:continue
   if e.get('type') in ('thread.started','turn.started'):events.append(e)
 threads=[e.get('thread_id') for e in events if e.get('type')=='thread.started'];children=native_children(procs,runner)
 if len(threads)!=1 or not threads[0] or threads[0] in old_sessions or not children or not any(e['type']=='turn.started' for e in events):return None
 require(campaign_pids(procs)==[runner],'Expected exactly one central runner')
 for flag,value in [('--publish-every','20'),('--max-rounds','6'),('--state-dir',str(STATE))]:
  args=procs[runner]['args'];require(args.count(flag)==1 and args[args.index(flag)+1]==value,'Live launch option changed')
 return {'current':current,'session_id':threads[0],'native_codex_pids':children,'candidate':run['candidate'],'events':events}


def execute(pins):
 require(not RECEIPT.exists(),'Existing receipt; inspect rather than retry')
 stop_raw=None;record={'owner':OWNER,'status':'preflight','source':SOURCE,'created_at':imp.now(),'request_documents':pins['documents']}
 with (STATE/(OWNER+'.lock')).open('a') as lock:
  fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
  require(not RECEIPT.exists(),'Operation already started')
  exclusive(RECEIPT,(json.dumps(record,indent=2)+'\n').encode())
  try:
   policy_guard();previous=read(PREVIOUS)
   require(previous['status']=='completed-resumed' and previous['stop_removed'] and previous['fresh_resume']['session_id'],'Previous operator is not complete')
   require(not (STATE/'STOP').exists(),'Do not replace an existing STOP')
   require(git('branch','--show-current')=='codex/all-hard-20261018','Wrong central branch')
   state=read(STATE/'progress.json');accepted_guard(state,pins)
   require(state['status']=='running' and state['expected_head']==imp.head(REPO),'No coherent active central checkpoint')
   old_pid=int((STATE/'runner.pid').read_text());procs=process_table()
   require(campaign_pids(procs)==[old_pid] and native_children(procs,old_pid),'Expected live central runner/native agent')
   git('fetch','--no-tags','origin',SOURCE)
   payload={path:imp.blob(REPO,SOURCE,path) for path in pins['documents']}
   require(all(sha(data)==pins['documents'][path] for path,data in payload.items()),'Fixed source document hash mismatch')
   require(not set(payload)&set(imp.tree(REPO,imp.head(REPO))),'Request already tracked')
   latest=read(STATE/'progress.json');accepted_guard(latest,pins)
   require(latest['status']=='running' and latest['expected_head']==imp.head(REPO),'Checkpoint moved inconsistently')
   ledger=read(STATE/'releases.json');require(ledger['pending'] is None,'Pending publication')
   preview=transition(latest,latest['expected_head'],pins,{'preflight':True})
   record['startup_eligible_preflight']=publication_guard(preview,ledger,latest['expected_head'])
   stop={'owner':OWNER,'created_at':imp.now(),'reason':'Finish active stage; adopt fixed COPY-R1 requests, preserve acceptance history, reopen nine entries for ordinary fix/fresh review and resume every20/max6.'}
   exclusive(STATE/'STOP',(json.dumps(stop,indent=2)+'\n').encode());stop_raw=(STATE/'STOP').read_bytes()
   record.update(status='waiting-for-boundary',stop=stop,previous_current=latest['current']);imp.save_state(RECEIPT,record)
   deadline=time.monotonic()+6000
   while (Path('/proc')/str(old_pid)).exists():
    stop_guard(stop_raw);require(read(STATE/'progress.json')['status']!='failed','Central failed before boundary');require(time.monotonic()<deadline,'Boundary wait exceeded budget; preserve STOP');time.sleep(5)
   boundary_guard(process_table())
   with (STATE/'release.lock').open('a') as release,imp.ownership(REPO,STATE):
    fcntl.flock(release,fcntl.LOCK_EX|fcntl.LOCK_NB)
    old=imp.validate_checkout(REPO,STATE);require(old['status']=='stopped','Not stopped');accepted_guard(old,pins);policy_guard();stop_guard(stop_raw)
    require(git('branch','--show-current')=='codex/all-hard-20261018','Central branch changed')
    require(old.get('current') is None or any(r['id']==old['current']['run_id'] and r['status']=='completed' for r in old['runs']),'Previous current run did not complete')
    ledger_raw=(STATE/'releases.json').read_bytes();ledger=json.loads(ledger_raw);require(ledger['pending'] is None,'Release pending at boundary')
    backup=STATE/(OWNER+'-before.json');exclusive(backup,(STATE/'progress.json').read_bytes())
    maintenance={'kind':'reopen-workflow-copy-nine','at':imp.now(),'source':SOURCE,'before':old['expected_head'],'problem_ids':list(IDS),'findings':[pid+'-COPY-R1' for pid in IDS],'backup':str(backup),'previous_current':copy.deepcopy(old.get('current')),'prior_acceptance':{pid:{k:old['problems'][pid][k] for k in ('accepted_at','registration_commit','prior_report') if k in old['problems'][pid]} for pid in IDS}}
    record.update(status='prepared',maintenance=maintenance,ledger_sha256=sha(ledger_raw));imp.save_state(RECEIPT,record)
    tree_before=imp.tree(REPO,old['expected_head'])
    for path,data in payload.items():require(not (REPO/path).exists() and not (REPO/path).is_symlink(),'Document path already exists');(REPO/path).parent.mkdir(parents=True,exist_ok=True);exclusive(REPO/path,data)
    require(imp.changed_paths(REPO)==set(payload),'Unexpected request worktree diff');git('diff','--check');git('add','--',*payload)
    require(set(git('diff','--cached','--name-only').splitlines())==set(payload),'Unexpected staged files')
    git('commit','-m','Reopen nine workflow-copy requests for normal fix and independent review\n\nPreserve previous acceptance, candidates, rounds, runs and release receipts. Adopt request documents only; no runtime repair or new acceptance claimed.\n\nRequest-Source: '+SOURCE+'\nBuilt-By: guarded one-off maintenance operator\nVerified-By: independently reviewed transition; fresh lesson reviews remain required')
    head=imp.head(REPO);require(git('rev-list','--parents','-n','1',head).split()[1:]==[old['expected_head']],'Unexpected request commit ancestry')
    document_tree_guard(tree_before,imp.tree(REPO,head),payload)
    require(not imp.changed_paths(REPO) and all(imp.blob(REPO,head,p)==b for p,b in payload.items()),'Committed request bytes differ or dirty checkout')
    require(read(STATE/'progress.json')==old and (STATE/'releases.json').read_bytes()==ledger_raw,'State/ledger changed before reopening')
    maintenance['after']=head;after=transition(old,head,pins,maintenance)
    record['startup_eligible']=publication_guard(after,ledger,head)
    verify_transition(old,after,head,pins,maintenance);imp.save_state(STATE/'progress.json',after)
    verify_transition(old,read(STATE/'progress.json'),head,pins,maintenance);policy_guard();stop_guard(stop_raw)
    require((STATE/'releases.json').read_bytes()==ledger_raw,'Ledger changed during reopening')
    record.update(status='reopened-still-stopped',request_commit=head,maintenance=maintenance,prior_state_preserved=True);imp.save_state(RECEIPT,record)
    git('push','origin','HEAD:refs/heads/codex/all-hard-20261018');require(git('ls-remote','origin','refs/heads/codex/all-hard-20261018').split()[0]==head,'Exact request commit push not confirmed')
   stop_guard(stop_raw);require(not campaign_pids(process_table()),'Worker appeared before resume')
   require(read(STATE/'progress.json')==after and imp.head(REPO)==head and not imp.changed_paths(REPO),'Stopped checkpoint changed')
   old_ids={r['id'] for r in after['runs']};old_sessions={x for r in after['runs'] for x in r.get('session_ids',[])}
   from leetcode_campaign import TERMINAL
   expected=next(pid for pid in after['queue'] if after['problems'].get(pid,{}).get('status') not in TERMINAL)
   require(expected=='780' and after['problems'][expected]['phase']=='fix','Unexpected first reopened problem')
   (STATE/'STOP').unlink()
   launched=json.loads(subprocess.check_output([sys.executable,str(STATE/'launch.py'),'--continuous','--max-rounds','6'],cwd=REPO,text=True))
   record.update(status='awaiting-fresh-fix',launch=launched);imp.save_state(RECEIPT,record)
   require(launched['continuous'] and launched['queue_count']==984,'Launch queue changed');proof=None
   for _ in range(120):
    require((Path('/proc')/str(launched['pid'])).exists(),'Resumed runner exited')
    resumed=read(STATE/'progress.json');proof=resume_evidence(resumed,old_ids,old_sessions,expected,launched['pid'])
    if proof:break
    time.sleep(.5)
   require(proof is not None and proof['candidate']==head,'Fresh fix/run/thread/turn/native candidate not proven')
   require(resumed['problems']==after['problems'] and resumed['queue']==old['queue'] and resumed['runs'][:len(old['runs'])]==old['runs'],'Resume altered retained entries/queue/runs before fix completed')
   require((STATE/'releases.json').read_bytes()==ledger_raw and not (STATE/'STOP').exists(),'Ledger or STOP changed during resume')
   record.update(status='completed-resumed',completed_at=imp.now(),fresh_resume=proof,stop_removed=True,release_ledger_preserved=True);imp.save_state(RECEIPT,record);print(json.dumps(record),flush=True)
  except BaseException as error:
   if stop_raw is not None and not (STATE/'STOP').exists():exclusive(STATE/'STOP',stop_raw)
   record.update(status='failed-inspect-no-retry',error=str(error) or type(error).__name__,failed_at=imp.now(),recovery='Preserve actual/saved HEAD, backup, maintenance receipt and owned STOP. Do not retry, reset acceptance/history or start a second worker. Active agents were not signaled.');imp.save_state(RECEIPT,record);raise


def main(argv=None):
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--dispatch',required=True);parser.add_argument('--pins',type=Path,default=Path(__file__).with_name('pins.json'));args=parser.parse_args(argv)
 require(args.dispatch==DISPATCH,'Explicit independently reviewed root dispatch required')
 data=args.pins.read_bytes();require(sha(data)==PINS_SHA,'Pins differ from reviewed snapshot');pins=json.loads(data)
 require(pins['source']==SOURCE and pins['ids']==list(IDS),'Pinned scope mismatch')
 os.environ.update(PATH='/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin',NODE_PATH='/home/songyy/projects/integ-games/node_modules',PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/home/songyy/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome',PYTHONDONTWRITEBYTECODE='1')
 policy_guard();sys.path.insert(0,str(REPO/'scripts'))
 global imp
 import import_leetcode_lane as imp
 def interrupted(signum,_frame):raise KeyboardInterrupt(f'Signal {signum}; active agents not signaled')
 signal.signal(signal.SIGTERM,interrupted);execute(pins)


if __name__=='__main__':main()
