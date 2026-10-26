import pathlib,sys,json,hashlib,subprocess,re,datetime
r=pathlib.Path('/home/songyy/projects/leetcode-hard-campaign-20261018');d=r.parent/'leetcode-hard-campaign-state-20261018';sys.path.insert(0,str(r/'scripts'));import leetcode_publish as p
sraw=(d/'progress.json').read_bytes();lraw=(d/'releases.json').read_bytes();s=json.loads(sraw);l=json.loads(lraw);root=pathlib.Path(l['publish_root']);head=p._git(r,'rev-parse','HEAD');sha=p._sha
reg=p.read_registry(r/'leetcode/problems.config.js');registry={str(x['id']):x for x in reg};prod=p.read_registry(root/'leetcode/problems.config.js');prodmap={str(x['id']):x for x in prod};eligible=[];lessons={}
for pid in s['queue']:
 item=s['problems'].get(pid,{})
 if item.get('status')!='accepted_local' or l['released'].get(pid,{}).get('candidate')==item.get('candidate'):continue
 files=p._lesson(r,head,pid);digest=p._fingerprint(files,registry[pid])
 if digest!=l['released'].get(pid,{}).get('digest'):eligible.append(pid);lessons[pid]=files
merged=dict(prodmap);merged.update({pid:registry[pid] for pid in eligible});rows=[merged[x]for x in sorted(merged,key=int)];derived=p.codex_registry(rows);canonical=('/* Registered lessons, sorted by official frontend ID. */\nwindow.LEETCODE_PROBLEMS = '+json.dumps(rows,ensure_ascii=False,indent=2)+';\n').encode();codex=('/* Static Codex lesson destinations. */\nwindow.LEETCODE_PROBLEMS = '+json.dumps(derived,ensure_ascii=False,indent=2)+';\n').encode();files={path:data for pid in eligible for path,data in p.codex_runtime(pid,lessons[pid]).items()};files['leetcode/problems.config.js']=canonical;files['leetcode/problems.codex.config.js']=codex;index=p._tracked_bytes(r,head,'leetcode/index.html').decode();files['leetcode/index.html']=re.sub(r'problems\.codex\.config\.js\?v=[^"\']+','problems.codex.config.js?v='+sha(codex)[:12],p.codex_discovery(index.encode()).decode()).encode()
for asset in ['leetcode/collection.js','leetcode/collection.css']:files[asset]=p._tracked_bytes(r,head,asset)
shared={};errors=[]
for path,data in list(files.items()):
 for dep in p._asset_refs(data,path):
  if dep in files:continue
  try:
   source=p._tracked_bytes(r,head,re.sub(r'^leetcode/([1-9][0-9]*)-codex/',r'leetcode/\1/',dep));actual=(root/dep).read_bytes();shared[dep]={'source':sha(source),'production':sha(actual),'equal':source==actual}
  except Exception as ex:errors.append({'path':path,'dependency':dep,'error':str(ex)})
prod42={str(f.relative_to(root)):sha(f.read_bytes())for folder in ['42','42-codex']for f in (root/'leetcode'/folder).rglob('*')if f.is_file()};old42=p.codex_runtime('42',p._lesson(r,head,'42'));drift42={path:{'production':digest,'campaign':sha(old42[path])if path in old42 else None}for path,digest in prod42.items()if path not in old42 or digest!=sha(old42[path])}
discovery={}
for name in ['index.html','leetcode/index.html','leetcode/collection.js','leetcode/collection.css','leetcode/problems.config.js','leetcode/problems.codex.config.js','leetcode/common.js','leetcode/style.css','pages.config.js']:
 file=root/name
 if not file.is_file():continue
 data=file.read_bytes();discovery[name]={'production':sha(data),'planned':sha(files[name])if name in files else None,'would_replace':name in files and data!=files[name]}
 if name.endswith('.html'):discovery[name]['refs']=re.findall(r'(?:src|href)=[\"\']([^\"\']+)',data.decode())
print(json.dumps({'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head':head,'expected_head':s['expected_head'],'status':s['status'],'current':s['current'],'dirty':p._git(r,'status','--porcelain','--untracked-files=all').splitlines(),'stateSha':sha(sraw),'ledgerSha':sha(lraw),'released':len(l['released']),'pending':l['pending'],'lastRelease':{k:l['releases'][-1][k] for k in ['id','revision','published_at']},'root':str(root),'resolvedRoot':str(root.resolve()),'publicBase':l['public_base'],'registryGuard':{'actual':sha((root/'leetcode/problems.config.js').read_bytes()),'ledger':l['registry_sha256']},'eligible':eligible,'planIsOnly19AndNotPublishable':len(eligible)<20,'publisherSha':sha((r/'scripts/leetcode_publish.py').read_bytes()),'staticSha':sha((r/'scripts/leetcode_static_versions.py').read_bytes()),'candidate42':s['problems']['42']['candidate'],'ledgerCandidate42':l['released']['42']['candidate'],'registry42':{'campaign':registry['42'],'production':prodmap['42'],'merged':merged['42']},'production42':prod42,'production42CampaignDifferences':drift42,'selected42': '42'in eligible,'payload42Paths':[x for x in files if x.startswith(('leetcode/42/','leetcode/42-codex/'))],'discovery':discovery,'shared':shared,'dependencyErrors':errors,'plannedFiles':{k:sha(v)for k,v in files.items()if not re.match(r'leetcode/[0-9]',k)},'stateUnchanged':sraw==(d/'progress.json').read_bytes(),'ledgerUnchanged':lraw==(d/'releases.json').read_bytes()},indent=2))
