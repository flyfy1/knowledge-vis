"""Read-only completed handoff/source binding; never load operator or mutate Pi."""
from pathlib import Path
import json,hashlib,base64,subprocess,datetime
s=Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018');repo=Path('/home/songyy/projects/leetcode-hard-campaign-20261018');owner='854-bridge-adoption-20261026-185d4ba0';d=s/(owner+'-dispatch');sha=lambda raw:hashlib.sha256(raw).hexdigest()
dispatch_raw=(d/'dispatch.json').read_bytes();dispatch=json.loads(dispatch_raw);args=dispatch['args'];expected={'operate.py':'22236e0fb21250ad29b5a33c4784ff347aecf9de277f8dac924c389e2e45cf42','pins.json':'2b6a396c630e912348d480ad295674745f73e672ca1c7007e1f79a78fbad041d','payload-manifest.json':'35cb72e2f7e5003a9c33865d57ec678a190f61392c36f2ebd95962e64e53535d','campaign-helper.py':'f0c4ac708a4b0209c7a6522787b38a04923ac922d61d8afa0dbecf7b8ad61698','reopen-helper.py':'a268466fe6101841437c730e0e7448961be4637ee60d9fe4a760c0ea6fca3424'}
assert dispatch['hashes']==expected
for name,digest in expected.items():assert sha((d/name).read_bytes())==digest,name
pins_path=Path(args[args.index('--pins')+1]);assert pins_path==d/'pins.json';pins=json.loads(pins_path.read_bytes())
raw=(s/(owner+'.json')).read_bytes();assert sha(raw)=='b806def3f37922cfda0d48e1f23afe52f7b450bed84d1a7abab0e71a7eef83b0';r=json.loads(raw)
assert not Path('/proc/1979827').exists() and r['owner']==owner and r['status']=='completed-resumed'
assert r['queued_repair_id']=='854' and r['queue_preserved'] is True and r['ledger_preserved'] is True
base=r['pushed_head'];assert r['resume_proof']['agent_candidate']==base
assert r['fresh_agent']['current']['problem_id']=='854'and r['fresh_agent']['current']['stage']=='fix'
manifest=json.loads((d/'payload-manifest.json').read_bytes());assert r['maintenance']['source_revision']==pins['source_revision']==manifest['observed_candidate']
source_checks={}
for path,record in manifest['files'].items():
 raw_blob=subprocess.check_output(['git','-C',str(repo),'show',base+':'+path]);assert sha(raw_blob)==record['after_sha256'];source_checks[path]=sha(raw_blob)
for name,digest in manifest['protected'].items():assert sha(subprocess.check_output(['git','-C',str(repo),'show',base+':leetcode/854/'+name]))==digest
for path,digest in pins['policy'].items():assert sha((repo/path).read_bytes())==digest,path
assert sha((s/'launch.py').read_bytes())==pins['launcher_sha256']
progress=json.loads((s/'progress.json').read_bytes());assert progress['queue']==r['before_state']['queue']
assert progress['problems']['995']==r['before_state']['problems']['995'];assert progress['problems']['995']['status']=='changes_required'
ledger_raw=(s/'releases.json').read_bytes();assert sha(ledger_raw)==r['before_ledger_sha256']==pins['release']['ledger_sha256']
assert json.loads(ledger_raw)['pending']is None and not(s/'STOP').exists()
head=subprocess.check_output(['git','-C',str(repo),'rev-parse','HEAD'],text=True).strip();remote=subprocess.check_output(['git','-C',str(repo),'ls-remote','origin','refs/heads/codex/all-hard-20261018'],text=True).split()[0];assert head==remote==base
lane_procs=[]
for p in Path('/proc').iterdir():
 if p.name.isdigit():
  try:
   if str((p/'cwd').resolve()).startswith('/home/songyy/projects/leetcode-hard-lane-'):lane_procs.append(p.name)
  except OSError:pass
assert not lane_procs
print(json.dumps({'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'operatorAbsent':True,'receiptSha256':sha(raw),'receiptRawBase64':base64.b64encode(raw).decode(),'dispatch':dispatch,'dispatchRawBase64':base64.b64encode(dispatch_raw).decode(),'externalPinsPath':str(pins_path),'externalHashes':expected,'base':base,'head':head,'remoteHead':remote,'freshAgent':r['fresh_agent'],'current':progress['current'],'sourceCandidate':pins['source_revision'],'sourceReview':pins['source_review'],'verifiedPayloadAtBase':source_checks,'protectedFilesAtBase':manifest['protected'],'allPinnedRuntimeBytesVerified':True,'queuePreserved':True,'queueLength':len(progress['queue']),'995EntryPreserved':True,'995Status':progress['problems']['995']['status'],'854Status':progress['problems']['854']['status'],'ledgerSha256':sha(ledger_raw),'pendingRelease':None,'noLaneProcesses':True,'stopAbsent':True,'readOnly':True},indent=2))
