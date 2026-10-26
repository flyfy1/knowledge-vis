from pathlib import Path
import json,subprocess,gzip,hashlib
p=Path('specs/reviews/parallel-10011012-launch-preparation-20261026/final-ready');script=(p/'preflight.py').read_text();assert hashlib.sha256(script.encode()).hexdigest()=='63295fc43653f73801b9ef39fb4b96fe107ba1ab1c9bcae399081fd370ce2d97'
manifest=json.loads(Path('specs/reviews/854-bridge-adoption-preparation-20261026/payload-manifest.json').read_text())
body=r'''
import io,contextlib,json,hashlib,pathlib,subprocess,datetime
out=io.StringIO()
with contextlib.redirect_stdout(out):exec(compile(preflight,'<reviewed-readonly-preflight>','exec'))
x=json.loads(out.getvalue());assert x['central_head']==x['base']=='048d217b1313ec068fbf41fe3703f5f3e83dcc90';assert x['central_current']['run_id']=='854-fix-4964d1606702';assert x['central_current']['stage']=='fix';assert x['central_session']=='01a17588-eeec-7b71-91f6-8bdbffe0305e';assert x['central_runner_pid']==1984564 and x['central_native']['pid']==1984809
r=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-20261018');d=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018');raw=(d/'progress.json').read_bytes();s=json.loads(raw);receipt=x['854_bridge_handoff_receipt'];canonical=lambda v:hashlib.sha256(json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()).hexdigest();assert canonical(s['queue'])=='434e5df4289eb8084c994f7a9bfe9920331ebcd4675beb7d2d511c1749d1fb7a';assert s['problems']['995']==receipt['before_state']['problems']['995'];assert [z for z in s['runs']if z['problem_id']=='995']==[z for z in receipt['before_state']['runs']if z['problem_id']=='995'];assert hashlib.sha256((d/'releases.json').read_bytes()).hexdigest()==receipt['before_ledger_sha256'];assert s['queue']==receipt['before_state']['queue']
args=x['campaign_workers'][0]['args'];assert args[args.index('--max-rounds')+1]=='6' and args[args.index('--publish-every')+1]=='20';assert args[args.index('--ids')+1].split(',')==s['queue']
for pr in pathlib.Path('/proc').iterdir():
 if pr.name.isdigit():
  try:assert not str((pr/'cwd').resolve()).startswith('/home/songyy/projects/leetcode-hard-lane-')
  except (FileNotFoundError,PermissionError):pass
blob=lambda path:subprocess.check_output(['git','-C',str(r),'show',x['base']+':'+path])
for path,v in manifest['files'].items():assert hashlib.sha256(blob(path)).hexdigest()==v['after_sha256']
for name,h in manifest['protected'].items():assert hashlib.sha256(blob('leetcode/854/'+name)).hexdigest()==h
assert subprocess.check_output(['git','-C',str(r),'ls-remote','origin','refs/heads/codex/all-hard-20261018'],text=True).split()[0]==x['base']
assert (d/'progress.json').read_bytes()==raw
result={k:x[k]for k in ['observed_at','base','central_head','central_current','central_runner_pid','central_session','central_native','mem_available_kib','loadavg','stop_exists','queue_length','targets','shared_tree_matches_base','policy_sha256','allowed_dirty_scope','854_bridge_handoff_receipt_sha256','approved_854_bridge_handoff_pins_sha256']};result.update(checkedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),queueHashVerified=True,centralMax6Every20FullQueueVerified=True,queued995EntryAndHistoryPreserved=True,ledgerMatchesPre854=True,all32AdoptedBlobsVerified=True,protectedFourVerified=True,noLaneProcesses=True,existingImportedReservations=len(x['reservations']),currentDirtyPathCount=len(x['current_phase_worktree_paths']),noPersistentRemoteMutation=True)
print(json.dumps(result,indent=2))
'''
result=subprocess.run(['ssh','pi','env','PATH=/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin','python3','-B','-'],input='preflight='+repr(script)+'\nmanifest='+repr(manifest)+'\n'+body,text=True,capture_output=True)
out=Path('specs/reviews/parallel-10011012-launch-review-evidence-20261026');(out/'live-check.stderr').write_text(result.stderr);(out/('live-check.json'if result.returncode==0 else'live-check-failed.txt')).write_text(result.stdout);print('exit',result.returncode);print(result.stdout);print(result.stderr)
