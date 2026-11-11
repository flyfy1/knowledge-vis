"""Emit a read-only source manifest; OUTPUT_DIR allows review reruns elsewhere."""
import hashlib,json,os
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
REPO=ROOT.parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
files={str(p.relative_to(ROOT)):sha(p) for p in sorted(ROOT.rglob('*')) if p.is_file() and p.name!='candidate.json' and '__pycache__' not in p.parts}
policies=['WORKFLOW.md','UI-I18N-SPEC.md','specs/leetcode-explainers.md','specs/leetcode-hard-traces.md','specs/leetcode-review-gates.md','specs/leetcode-rendered-state-contract.md','specs/reviews/leetcode-all-hard-design-review.md','leetcode/common.js','leetcode/style.css','scripts/register_leetcode_lesson.py']
deps={p:sha(REPO/p) for p in policies}
body={'candidate':'1096-c1','author':'Codex author run; exact model identifier unavailable','status':'self-checked; ready for separate independent review','independentReview':{'status':'pending','reviewer':None,'report':None,'accepted':False},'generatedAt':datetime.now(timezone.utc).isoformat(),'files':files,'sharedReadOnlyDependencies':deps}
body['manifestDigest']=hashlib.sha256(json.dumps({'files':files,'dependencies':deps},sort_keys=True).encode()).hexdigest()
(OUT/'candidate.json').write_text(json.dumps(body,ensure_ascii=False,indent=2)+'\n');print(body['manifestDigest'])
