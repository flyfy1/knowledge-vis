"""Create a read-only-input identity receipt after final author checks."""
from pathlib import Path
import datetime, hashlib, json, os, subprocess
ROOT=Path(__file__).resolve().parents[1]
REPO=ROOT.parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
command=['python3','-B','scripts/register_leetcode_lesson.py','1106','--validate-only']
r=subprocess.run(command,cwd=REPO,text=True,capture_output=True)
receipt={'command':' '.join(command),'cwd':str(REPO),'exitCode':r.returncode,'stdout':r.stdout,'stderr':r.stderr,'scope':'non-mutating metadata validation'}
(OUT/'preflight.json').write_text(json.dumps(receipt,indent=2)+'\n');assert r.returncode==0,receipt
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
files={str(p.relative_to(ROOT)):sha(p) for p in sorted(ROOT.rglob('*')) if p.is_file() and 'tests/evidence' not in str(p.relative_to(ROOT)) and '__pycache__' not in str(p)}
policies=['WORKFLOW.md','UI-I18N-SPEC.md','specs/leetcode-explainers.md','specs/leetcode-hard-traces.md','specs/leetcode-review-gates.md','specs/leetcode-rendered-state-contract.md','specs/reviews/leetcode-all-hard-design-review.md','leetcode/style.css','leetcode/common.js']
report={'candidate':'1106-c1','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'author':'Codex author run; exact model identifier unavailable','status':'self-checked author candidate; independent review pending','notClaimed':['independent acceptance','novice learner outcomes','LeetCode acceptance','publication'],'files':files,'readOnlySharedHashes':{s:sha(REPO/s) for s in policies},'evidence':{p.name:sha(p) for p in sorted(OUT.iterdir()) if p.is_file() and p.name!='candidate.json'}}
(OUT/'candidate.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'candidate':report['candidate'],'sourceFiles':len(files),'evidenceFiles':len(report['evidence']),'preflightExit':r.returncode}))
