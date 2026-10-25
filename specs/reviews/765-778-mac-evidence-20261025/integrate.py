import pathlib,subprocess,tarfile,io,json,hashlib,shutil,re
root=pathlib.Path('/Users/songyy/Documents/knowledge-vis');ref='81bee47c5d50bf5ec2c916a3e38b7b98a176cf53';ids=[768,770,773,778]
acceptance=json.loads(pathlib.Path('/tmp/leetcode-765-778-acceptance-20261025.json').read_text())
for i in ids:
 row=acceptance['problems'][str(i)];assert row['status']=='accepted_local' and row['reviews'][-1]['required_open']==[]
 assert not subprocess.check_output(['git','diff','--name-only',row['candidate'],ref,'--',f'leetcode/{i}'],cwd=root)
protected=['index.html','pages.config.js','leetcode/common.js','leetcode/style.css','leetcode/collection.js','leetcode/collection.css']
def hashes(paths):return {p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in paths}
before=hashes(protected)
import sys
sys.path.insert(0,str(root/'scripts'))
from leetcode_registry import read_registry
baseline=pathlib.Path('/tmp/765-778-before-registry.js')
baseline.write_bytes(subprocess.check_output(['git','show','HEAD:leetcode/problems.config.js'],cwd=root))
before_registry={e['id']:e for e in read_registry(baseline)}
assert 765 not in before_registry
assert all(i not in before_registry for i in ids)
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
after_registry={e['id']:e for e in read_registry(root/'leetcode/problems.config.js')}
central_registry={e['id']:e for e in read_registry(pathlib.Path('/tmp/leetcode-765-778-candidate-20261025/leetcode/problems.config.js'))}
assert set(after_registry)==set(before_registry)|set(ids)
for i,e in before_registry.items():assert after_registry[i]==e
for i in ids:assert after_registry[i]==central_registry[i]
assert 765 not in after_registry
version=hashlib.sha256((root/'leetcode/problems.config.js').read_bytes()).hexdigest()[:12]
assert f'problems.config.js?v={version}' in (root/'leetcode/index.html').read_text()
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
out=root/'specs/reviews/765-778-mac-evidence-20261025';out.mkdir(exist_ok=True)
shutil.copytree('/tmp/leetcode-765-778-mac-20261025',out,dirs_exist_ok=True)
for source,name in [('/tmp/leetcode-765-778-acceptance-20261025.json','acceptance.json'),('/tmp/check-765-778-mac-20261025.py','run-checks.py'),('/tmp/leetcode-765-778-candidate-before.json','candidate-files.json'),(__file__,'integrate.py')]:shutil.copyfile(source,out/name)
receipt={'source':ref,'lessons':parity,'protected_before':before,'protected_after':hashes(protected),'registry_sha256':hashlib.sha256((root/'leetcode/problems.config.js').read_bytes()).hexdigest(),'published':False,'held_back':{'765':'Original Mac browser test failed native select fit assertion; diagnosis pending'},'registry_existing_entries_preserved':True}
(out/'integration.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2))
