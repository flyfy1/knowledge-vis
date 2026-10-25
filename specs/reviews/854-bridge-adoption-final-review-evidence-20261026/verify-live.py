from pathlib import Path
import json,subprocess
folder=Path('specs/reviews/854-bridge-adoption-preparation-20261026'); pins=json.loads((folder/'final-ready/pins.json').read_text()); manifest=json.loads((folder/'payload-manifest.json').read_text())
body=r'''
import json,pathlib,subprocess,hashlib,datetime,os,sys
r=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-20261018');d=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018');sha=lambda b:hashlib.sha256(b).hexdigest();canonical=lambda x:sha(json.dumps(x,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode());git=lambda *a:subprocess.check_output(['git','-C',str(r),*a]).strip();blob=lambda rev,path:subprocess.check_output(['git','-C',str(r),'show',rev+':'+path])
raw=(d/'progress.json').read_bytes();s=json.loads(raw);head=git('rev-parse','HEAD').decode();assert head==s['expected_head']==p['central']['head'] and s['current']==p['central']['current'];assert s['status']=='running';assert not(d/'STOP').exists();assert len(s['queue'])==984 and canonical(s['queue'])==p['queue_sha256']
for path,h in p['policy'].items():assert sha((r/path).read_bytes())==h,path
assert sha((d/'launch.py').read_bytes())==p['launcher_sha256']
prior=(d/(p['previous_owner']+'.json')).read_bytes();assert sha(prior)==p['previous_receipt_sha256'];pr=json.loads(prior);assert pr['status']=='completed-resumed' and pr['ledger_preserved'];assert {(str(i['problem_id']),i['status']) for i in pr['imports']}=={('996','completed'),('1000','completed')};assert not pathlib.Path('/proc/1904720').exists();git('merge-base','--is-ancestor',pr['pushed_head'],head)
f=p['accepted']['854'];assert s['problems']['854']==f['entry'] and canonical(f['entry'])==f['entry_sha256'];assert canonical([x for x in s['runs'] if x['problem_id']=='854'])==f['runs_sha256'];assert git('rev-parse','HEAD:leetcode/854').decode()==f['lesson_git_tree']
for name,h in f['runtime_sha256'].items():assert sha((r/'leetcode/854'/name).read_bytes())==h
assert sha((r/f['entry']['prior_report']).read_bytes())==f['report_sha256']
ledger_raw=(d/'releases.json').read_bytes();l=json.loads(ledger_raw);assert sha(ledger_raw)==p['release']['ledger_sha256'] and l['pending'] is None and '854' not in l['released']
for path in d.glob('lane-*-reservation.json'):assert json.loads(path.read_bytes())['status'] in ('imported','cancelled','canceled')
procs={}
for path in pathlib.Path('/proc').iterdir():
 if not path.name.isdigit():continue
 try:
  args=[x.decode(errors='replace')for x in (path/'cmdline').read_bytes().split(b'\0')if x];cwd=str((path/'cwd').resolve());procs[int(path.name)]={'args':args,'cwd':cwd,'ppid':int(next(x.split(':')[1]for x in(path/'status').read_text().splitlines()if x.startswith('PPid:')))}
 except OSError:pass
assert not any(x['cwd'].startswith('/home/songyy/projects/leetcode-hard-lane-') for x in procs.values());workers=[pid for pid,x in procs.items()if any(a.endswith('/scripts/leetcode_campaign.py')for a in x['args'])];assert workers==[p['central']['runner_pid']]
native=p['central']['native_pid'];assert native in procs and procs[native]['cwd']==str(r);ancestor=procs[native]['ppid']
while ancestor in procs and ancestor!=workers[0]:ancestor=procs[ancestor]['ppid']
assert ancestor==workers[0]
run=next(x for x in s['runs']if x['id']==s['current']['run_id']);events=[]
for line in (pathlib.Path(run['directory'])/'events.jsonl').read_text().splitlines():
 try:events.append(json.loads(line))
 except ValueError:pass
assert [e['thread_id']for e in events if e['type']=='thread.started']==[p['central']['session_id']];assert any(e['type']=='turn.started'for e in events)
source=p['source_revision'];base=p['source_base'];rev=p['source_review']['revision'];assert git('ls-remote','origin',p['source_push']['ref']).decode().split()[0]==p['source_push']['head'];git('merge-base','--is-ancestor',source,rev)
def tree(revision):return {name.decode():meta.decode() for item in subprocess.check_output(['git','-C',str(r),'ls-tree','-r','-z',revision]).split(b'\0')if item for meta,name in[item.split(b'\t',1)]}
a,b,c,z=map(tree,[base,source,rev,head]);assert {x for x in a.keys()|b.keys()if a.get(x)!=b.get(x)}==set(m['files']);assert {x:v for x,v in b.items()if x.startswith('leetcode/854/')}=={x:v for x,v in c.items()if x.startswith('leetcode/854/')};assert {x:v for x,v in a.items()if x.startswith('leetcode/854/')}=={x:v for x,v in z.items()if x.startswith('leetcode/854/')}
for path,v in m['files'].items():
 assert b[path].startswith('100644 blob ') and sha(blob(source,path))==v['after_sha256'];assert z.get(path)==a.get(path)
 if v['before_sha256'] is None:assert path not in a and not(r/path).exists()
 else:assert sha(blob(base,path))==v['before_sha256']==sha((r/path).read_bytes())
for name,h in m['protected'].items():assert a['leetcode/854/'+name]==b['leetcode/854/'+name] and sha(blob(source,'leetcode/854/'+name))==h
sr=p['source_review'];receipt=blob(rev,sr['receipt_path']);assert sha(receipt)==sr['receipt_sha256'];receipt=json.loads(receipt);assert receipt['candidate']==source and receipt['verdict']=='focused-independent-acceptance' and not receipt['required_open']
for path,h in receipt['files'].items():assert sha(blob(rev,path))==h
assert receipt['files'][sr['report_path']]==sr['report_sha256']
os.environ['PATH']='/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin';sys.path.insert(0,str(r/'scripts'));from leetcode_registry import read_registry;from leetcode_publish import _reviewed
registry={str(x['id']):x for x in read_registry(r/'leetcode/problems.config.js')};prospective={pid for pid,e in s['problems'].items() if e['status']=='accepted_local' and l['released'].get(pid,{}).get('candidate')!=e.get('candidate')};reviewed=_reviewed(r,s,registry,head,prospective);eligible={pid for pid,item in reviewed.items()if l['released'].get(pid,{}).get('digest')!=item['digest']};assert not any(l['released'].get(pid,{}).get('digest')==item['digest']for pid,item in reviewed.items());assert len(eligible|{'854'}|{pid for pid,e in s['problems'].items()if e.get('phase')=='register'})<20
assert (d/'progress.json').read_bytes()==raw and (d/'releases.json').read_bytes()==ledger_raw and git('rev-parse','HEAD').decode()==head
print(json.dumps({'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'readOnly':True,'head':head,'current':s['current'],'runner':workers[0],'native':native,'session':p['central']['session_id'],'sourceRevision':source,'sourceReviewRevision':rev,'payloadPathsVerified':len(m['files']),'protectedFilesVerified':4,'old854HistoryAndRuntimeVerified':True,'priorReceiptSha256':sha(prior),'priorOperatorAbsent':True,'queueCount':len(s['queue']),'ledgerSha256':sha(ledger_raw),'releasedCount':len(l['released']),'pending':l['pending'],'eligible':sorted(eligible),'projectedEligibleWithout854':sorted(eligible-{'854'}),'noActiveLanes':True,'sourceReceiptAndEvidenceHashesVerified':True,'progressAndLedgerStable':True},indent=2))
'''
r=subprocess.run(['ssh','pi','python3 -B -'],input='p='+repr(pins)+'\nm='+repr(manifest)+'\n'+body,text=True,capture_output=True)
out=Path('specs/reviews/854-bridge-adoption-final-review-evidence-20261026');out.mkdir(exist_ok=True);(out/'live-check.stderr').write_text(r.stderr);(out/'live-check.json' if r.returncode==0 else out/'live-check-failed.txt').write_text(r.stdout);print('exit',r.returncode);print(r.stdout);print(r.stderr)
