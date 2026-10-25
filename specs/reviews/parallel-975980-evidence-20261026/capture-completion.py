"""Read-only completed-lane archive. Send to Pi Python -B with an explicit ID."""
import pathlib,json,hashlib,subprocess,datetime,gzip,base64,sys
pid=sys.argv[1];assert pid in ['975','980']
root=pathlib.Path('/home/songyy/projects');repo=root/f'leetcode-hard-lane-{pid}-20261026';sd=root/f'leetcode-hard-lane-state-{pid}-20261026';raw=(sd/'progress.json').read_bytes();s=json.loads(raw);e=s['problems'][pid]
assert s['status']=='completed' and e['status']=='accepted_local' and s['current'] is None
head=subprocess.check_output(['git','-C',str(repo),'rev-parse','HEAD'],text=True).strip();assert head==s['expected_head']==e['registration_commit']
files={};report=e['prior_report'];files[report]=(repo/report).read_text();evidence_dir=repo/'specs/reviews'/f'{pid}-evidence'/pathlib.Path(report).stem
manifest={str(p.relative_to(repo)):{'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for p in evidence_dir.rglob('*') if p.is_file()}
for p in evidence_dir.rglob('*.json'):files[str(p.relative_to(repo))]=p.read_text()
runs=[]
for r in s['runs']:
 rd=pathlib.Path(r['directory']);ev=(rd/'events.jsonl').read_bytes();events=[]
 for line in ev.splitlines():
  try:events.append(json.loads(line))
  except ValueError:pass
 runs.append({'record':r,'eventsSha256':hashlib.sha256(ev).hexdigest(),'eventsGzipBase64':base64.b64encode(gzip.compress(ev,mtime=0)).decode(),'final':json.loads((rd/'final.json').read_text()),'finalSha256':hashlib.sha256((rd/'final.json').read_bytes()).hexdigest(),'promptSha256':hashlib.sha256((rd/'prompt.md').read_bytes()).hexdigest(),'threadEvents':[v for v in events if v.get('type')in ['thread.started','turn.started','turn.completed']]})
live=[]
for p in pathlib.Path('/proc').iterdir():
 if not p.name.isdecimal():continue
 try:a=[x.decode()for x in(p/'cmdline').read_bytes().split(b'\0')if x]
 except OSError:continue
 if str(repo/'scripts/leetcode_campaign.py')in a or (a and '/bin/codex'in a[0] and str(repo)in a):live.append({'pid':int(p.name),'args':a})
assert not live
out={'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'state':s,'stateSha256':hashlib.sha256(raw).hexdigest(),'rawState':raw.decode(),'head':head,'dirty':subprocess.check_output(['git','-C',str(repo),'status','--porcelain'],text=True),'lessonTree':subprocess.check_output(['git','-C',str(repo),'rev-parse',e['candidate']+':leetcode/'+pid],text=True).strip(),'entry':json.loads((repo/'leetcode'/pid/'lesson-entry.json').read_text()),'entrySha256':hashlib.sha256((repo/'leetcode'/pid/'lesson-entry.json').read_bytes()).hexdigest(),'canonicalSha256':hashlib.sha256((repo/'leetcode'/pid/'solution.py').read_bytes()).hexdigest(),'reportSha256':hashlib.sha256((repo/report).read_bytes()).hexdigest(),'files':files,'evidenceManifest':manifest,'runs':runs,'liveRunnerOrNative':live,'reservation':json.loads((root/'leetcode-hard-campaign-state-20261018'/f'lane-{pid}-reservation.json').read_text())}
assert (sd/'progress.json').read_bytes()==raw
print(json.dumps(out))
