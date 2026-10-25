import pathlib,subprocess,tarfile,io,json,hashlib,shutil,re
root=pathlib.Path('/Users/songyy/Documents/knowledge-vis');ref='5887fa0c63eb5eaa3b1966eecb903c4a707030a5';ids=[741,745,749,753,757,761]
acceptance=json.loads(pathlib.Path('/tmp/leetcode-741-761-acceptance-20261025.json').read_text())
for i in ids:
 row=acceptance['problems'][str(i)];assert row['status']=='accepted_local' and row['reviews'][-1]['required_open']==[]
 assert not subprocess.check_output(['git','diff','--name-only',row['candidate'],ref,'--',f'leetcode/{i}'],cwd=root)
protected=['index.html','pages.config.js','leetcode/common.js','leetcode/style.css','leetcode/collection.js','leetcode/collection.css']
def hashes(paths):return {p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in paths}
before=hashes(protected)
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
out=root/'specs/reviews/741-761-mac-evidence-20261025';out.mkdir(exist_ok=True)
shutil.copytree('/tmp/leetcode-741-761-mac-20261025',out,dirs_exist_ok=True)
for source,name in [('/tmp/leetcode-741-761-acceptance-20261025.json','acceptance.json'),('/tmp/check-741-761-mac-20261025.py','run-checks.py'),('/tmp/leetcode-741-761-candidate-before.json','candidate-files.json'),(__file__,'integrate.py')]:shutil.copyfile(source,out/name)
receipt={'source':ref,'lessons':parity,'protected_before':before,'protected_after':hashes(protected),'registry_sha256':hashlib.sha256((root/'leetcode/problems.config.js').read_bytes()).hexdigest(),'published':False}
(out/'integration.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2))
