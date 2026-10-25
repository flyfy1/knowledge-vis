import pathlib,subprocess,tarfile,io,json,hashlib,shutil,re,sys
root=pathlib.Path('/Users/songyy/Documents/knowledge-vis');ref=sys.argv[1];ids=[782,803,805]
acceptance=json.loads(pathlib.Path('/tmp/round-782803805-accepted-20261025.json').read_text())
def git(*a):return subprocess.check_output(['git',*a],cwd=root)
assert ref==acceptance['expected_head']
for i in ids:
 e=acceptance['problems'][str(i)];assert e['status']=='accepted_local' and e['reviews'][-1]['required_open']==[]
 assert not git('diff','--name-only',e['candidate'],ref,'--',f'leetcode/{i}')
 manifests={782:'782-evidence/mac-repaired-candidate-20261025/candidate-files.json',803:'803-evidence/mac-repaired-candidate-20261025/candidate-files.json',805:'805-evidence/mac-preacceptance-20261025/candidate-files.json'}
 m=json.loads((root/'specs/reviews'/manifests[i]).read_text())
 for p,h in m['files'].items():
  if p in [f'leetcode/{i}/{n}' for n in ['index.html','app.js','core.js','copy.js','style.css','solution.py','python-code.js']]+['leetcode/common.js','leetcode/style.css']:
   assert hashlib.sha256(git('show',ref+':'+p)).hexdigest()==h,p
protected=['index.html','pages.config.js','leetcode/common.js','leetcode/style.css','leetcode/collection.js','leetcode/collection.css']
def hashes():return {p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in protected}
before=hashes();concept=(root/'CONCEPT-MAP.md').read_text()
for i in ids:assert f'<!-- leetcode-{i}-campaign -->' not in concept
allfiles=git('ls-tree','-r','--name-only',ref).decode().splitlines();selected=[p for p in allfiles if any(p.startswith(f'leetcode/{i}/') or p.startswith(f'specs/reviews/{i}-') for i in ids)]
raw=git('archive',ref,*selected)
with tarfile.open(fileobj=io.BytesIO(raw)) as ar:
 for item in ar:
  if item.isfile() and (root/item.name).exists():assert (root/item.name).read_bytes()==ar.extractfile(item).read(),item.name
with tarfile.open(fileobj=io.BytesIO(raw)) as ar:ar.extractall(root,filter='data')
for i in ids:subprocess.run(['python3','-B','scripts/register_leetcode_lesson.py',str(i)],cwd=root,check=True)
for p in ['leetcode/problems.config.js','leetcode/index.html']:assert (root/p).read_bytes()==git('show',ref+':'+p),p
central=git('show',ref+':CONCEPT-MAP.md').decode();working=(root/'CONCEPT-MAP.md').read_text()
for i in ids:
 pat=rf'<!-- leetcode-{i}-campaign -->[\s\S]*?<!-- /leetcode-{i}-campaign -->';assert re.search(pat,working).group()==re.search(pat,central).group()
assert working.startswith(concept) and hashes()==before
parity={}
for i in ids:
 paths=[p for p in selected if p.startswith(f'leetcode/{i}/')]
 for p in paths:assert (root/p).read_bytes()==git('show',ref+':'+p),p
 parity[str(i)]={'files':len(paths),'candidate':acceptance['problems'][str(i)]['candidate'],'exact':True}
out=root/'specs/reviews/releases/current-round-20261025';out.mkdir(exist_ok=True)
shutil.copyfile('/tmp/round-782803805-accepted-20261025.json',out/'acceptance.json');shutil.copyfile(__file__,out/'integrate.py')
(out/'integration.json').write_text(json.dumps({'source':ref,'lessons':parity,'protected_before':before,'protected_after':hashes(),'preexisting_concept_map_preserved':True},indent=2)+'\n');print(json.dumps(parity))
