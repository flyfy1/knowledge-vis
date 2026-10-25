import pathlib,subprocess,tarfile,io,json,hashlib,shutil,re
root=pathlib.Path('/Users/songyy/Documents/knowledge-vis');ref='c214c6549b53618d96782b6f827a5018c4c7f6e4';ids=[765]
acceptance=json.loads(pathlib.Path('/tmp/leetcode-765-accepted-20261025.json').read_text())
for i in ids:
 row=acceptance['problems'][str(i)];assert row['status']=='accepted_local' and row['reviews'][-1]['required_open']==[]
 assert not subprocess.check_output(['git','diff','--name-only',row['candidate'],ref,'--',f'leetcode/{i}'],cwd=root)
protected=['index.html','pages.config.js','leetcode/common.js','leetcode/style.css','leetcode/collection.js','leetcode/collection.css']
def hashes(paths):return {p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in paths}
before=hashes(protected)
concept_before=(root/'CONCEPT-MAP.md').read_text()
assert '<!-- leetcode-765-campaign -->' not in concept_before
allfiles=subprocess.check_output(['git','ls-tree','-r','--name-only',ref],cwd=root,text=True).splitlines()
selected=[p for p in allfiles if any(p.startswith(f'leetcode/{i}/') or p.startswith(f'specs/reviews/{i}-') for i in ids)]
raw=subprocess.check_output(['git','archive',ref,*selected],cwd=root)
with tarfile.open(fileobj=io.BytesIO(raw)) as archive:
 for item in archive:
  if item.isfile() and (root/item.name).exists():assert (root/item.name).read_bytes()==archive.extractfile(item).read(),item.name
with tarfile.open(fileobj=io.BytesIO(raw)) as archive:archive.extractall(root,filter='data')
for i in ids:
 subprocess.run(['python3','-B','scripts/register_leetcode_lesson.py',str(i),'--validate-only'],cwd=root,check=True)
 subprocess.run(['python3','-B','scripts/register_leetcode_lesson.py',str(i)],cwd=root,check=True)
for p in ['leetcode/problems.config.js','leetcode/index.html']:
 assert (root/p).read_bytes()==subprocess.check_output(['git','show',ref+':'+p],cwd=root),p
central=subprocess.check_output(['git','show',ref+':CONCEPT-MAP.md'],cwd=root,text=True);main=(root/'CONCEPT-MAP.md').read_text()
for i in ids:
 pattern=rf'<!-- leetcode-{i}-campaign -->[\s\S]*?<!-- /leetcode-{i}-campaign -->'
 assert re.search(pattern,main).group()==re.search(pattern,central).group()
assert hashes(protected)==before
parity={}
for i in ids:
 paths=[p for p in selected if p.startswith(f'leetcode/{i}/')]
 for p in paths:assert (root/p).read_bytes()==subprocess.check_output(['git','show',ref+':'+p],cwd=root),p
 parity[str(i)]={'files':len(paths),'candidate':acceptance['problems'][str(i)]['candidate'],'exact':True}
out=root/'specs/reviews/765-evidence/main-integration-20261025';out.mkdir(exist_ok=True)
shutil.copyfile('/tmp/leetcode-765-accepted-20261025.json',out/'acceptance.json')
shutil.copyfile(__file__,out/'integrate.py')
assert (root/'CONCEPT-MAP.md').read_text().startswith(concept_before)
receipt={'source':ref,'lessons':parity,'protected_before':before,'protected_after':hashes(protected),'registry_sha256':hashlib.sha256((root/'leetcode/problems.config.js').read_bytes()).hexdigest(),'published':False,'preexisting_concept_map_preserved':True,'mac_verification':'specs/reviews/765-review-mac-repaired-candidate-20261025.md'}
(out/'integration.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2))
