"""Freeze author candidate identity after checks; no registration or review claim."""
import datetime,hashlib,json,os,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[1];repo=root.parents[1]
out=Path(os.environ.get('OUTPUT_DIR',root/'tests/evidence'));out.mkdir(parents=True,exist_ok=True)
for name in ['python-results.json','core-results.json','browser-results.json']:
    assert json.loads((out/name).read_text())['passed'],name
cmd=['python3','-B','scripts/register_leetcode_lesson.py','1095','--validate-only']
r=subprocess.run(cmd,cwd=repo,text=True,capture_output=True)
receipt={'command':' '.join(cmd),'cwd':str(repo),'exitCode':r.returncode,'stdout':r.stdout,'stderr':r.stderr,'scope':'safe non-mutating metadata preflight'}
(out/'preflight.json').write_text(json.dumps(receipt,indent=2)+'\n');assert r.returncode==0,receipt
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
files={str(p.relative_to(root)):sha(p) for p in sorted(root.rglob('*')) if p.is_file() and 'evidence' not in p.relative_to(root).parts and '__pycache__' not in p.parts}
policies=['WORKFLOW.md','UI-I18N-SPEC.md','specs/leetcode-explainers.md','specs/leetcode-hard-traces.md','specs/leetcode-review-gates.md','specs/leetcode-rendered-state-contract.md','specs/reviews/leetcode-all-hard-design-review.md','leetcode/common.js','leetcode/style.css']
manifest={'candidate':'1095-c1','frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'author':'Codex author session; external run id and exact model identifier unavailable','status':'self-checked; independent review pending','reviewer':None,'independentAcceptance':False,'published':False,'baseCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip(),'files':files,'sharedPolicies':{n:sha(repo/n) for n in policies},'designSkill':{'path':'/home/songyy/Documents/agent-skills/website-design/SKILL.md','sha256':sha(Path('/home/songyy/Documents/agent-skills/website-design/SKILL.md'))},'resultHashes':{n:sha(out/n) for n in ['python-results.json','core-results.json','browser-results.json','preflight.json']}}
manifest['candidateHash']=hashlib.sha256(json.dumps(files,sort_keys=True).encode()).hexdigest()
(out/'candidate.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'candidate':manifest['candidate'],'candidateHash':manifest['candidateHash'],'preflightExit':r.returncode,'files':len(files)}))
