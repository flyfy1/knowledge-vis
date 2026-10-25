from pathlib import Path
import json,subprocess,sys,tempfile,hashlib
sys.path.insert(0,'/Users/songyy/Documents/knowledge-vis/scripts')
import leetcode_publish as p
from build_leetcode_static import build
from leetcode_registry import read_registry
source=Path('/Users/songyy/Documents/knowledge-vis'); base=Path(tempfile.mkdtemp(prefix='static-routes-independent-')); repo=base/'repo';repo.mkdir();out=base/'generated'
rows=read_registry(source/'leetcode/problems.config.js');row=next(r for r in rows if r['id']==51)
payload=p._lesson(source,'HEAD','51')
for name in ['index.html','leetcode/index.html','leetcode/common.js','leetcode/style.css','leetcode/collection.js','leetcode/collection.css','scripts/leetcode_static_versions.py']:
 payload[name]=(source/name).read_bytes()
payload['leetcode/problems.config.js']=('window.LEETCODE_PROBLEMS = '+json.dumps([row])+';').encode()
pending=[n for n in payload if n.startswith('leetcode/')];seen=set()
while pending:
 name=pending.pop()
 if name in seen:continue
 seen.add(name)
 for dep in p._asset_refs(payload[name],name):
  if dep not in payload:payload[dep]=(source/dep).read_bytes();pending.append(dep)
for name,data in payload.items():
 target=repo/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
def git(*args):return subprocess.check_output(['git',*args],cwd=repo,stderr=subprocess.DEVNULL).decode().strip()
git('init','-b','codex/independent-static-fixture');git('config','user.name','Review Fixture');git('config','user.email','review@example.invalid');git('add','.');git('commit','-m','Frozen fixture')
revision=git('rev-parse','HEAD');manifest=build(repo,revision,out)
assert (out/'leetcode/problems.config.js').read_bytes()==payload['leetcode/problems.config.js']
derived=read_registry(out/'leetcode/problems.codex.config.js');expected=dict(row,path='51-codex/');assert derived==[expected]
for name,data in p._lesson(repo,revision,'51').items():assert (out/name.replace('/51/','/51-codex/')).read_bytes()==data
assert git('status','--porcelain')==''
for html in ['index.html','leetcode/index.html']:
 assert b'problems.codex.config.js' in (out/html).read_bytes()
 assert b'problems.config.js' in payload[html]
assert not list(out.rglob('780-claude'))
# Existing unrelated site file is intentionally outside build overlay.
(out/'pages.config.js').write_bytes((source/'pages.config.js').read_bytes())
summary={'base':str(base),'root':str(out),'revision':revision,'files':len(manifest['files']),'checks':['numeric registry exact bytes','derived registry path-only','runtime copied exactly','canonical source clean','both discovery documents derived','no Claude discovery']}
(base/'independent-results.json').write_text(json.dumps(summary,indent=2));Path('/tmp/static-routes-independent-latest.json').write_text(json.dumps(summary));print(json.dumps(summary))
