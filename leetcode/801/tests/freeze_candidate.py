"""Read-only preflight plus lesson-local candidate receipt; never registers."""
import datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess

LESSON = Path(__file__).resolve().parents[1]
REPO = LESSON.parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', LESSON / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
command = ['python3', '-B', 'scripts/register_leetcode_lesson.py', '801', '--validate-only']
result = subprocess.run(command, cwd=REPO, capture_output=True, text=True)
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
(OUT / 'preflight.json').write_text(json.dumps({
    'command': ' '.join(command), 'cwd': str(REPO), 'exitCode': result.returncode,
    'stdout': result.stdout, 'stderr': result.stderr, 'verifiedAt': now,
    'mode': 'validate-only, no registration'
}, indent=2) + '\n')
if result.returncode:
    raise SystemExit(result.stderr)

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

owned = {str(p.relative_to(LESSON)): digest(p) for p in sorted(LESSON.rglob('*'))
         if p.is_file() and 'evidence' not in p.relative_to(LESSON).parts
         and '__pycache__' not in p.parts}
shared_paths = ['leetcode/common.js', 'leetcode/style.css', 'WORKFLOW.md',
                'UI-I18N-SPEC.md', 'specs/leetcode-explainers.md',
                'specs/leetcode-hard-traces.md', 'specs/leetcode-review-gates.md',
                'specs/leetcode-rendered-state-contract.md',
                'specs/reviews/leetcode-all-hard-design-review.md',
                'scripts/register_leetcode_lesson.py']
related_paths = [f'leetcode/{i}/{name}' for i in (10,123)
                 for name in ('index.html','copy.js','app.js')]
receipt = {
    'problemId': 801, 'frozenAt': now,
    'status': 'author self-checked; independent review pending',
    'candidateSha256': hashlib.sha256(json.dumps(owned, sort_keys=True).encode()).hexdigest(),
    'files': owned,
    'sharedPolicyAndRuntime': {p: digest(REPO/p) for p in shared_paths},
    'relatedDestinations': {p: digest(REPO/p) for p in related_paths},
    'preflight': 'pass; exit 0',
    'scope': 'leetcode/801 only; no registration, commit, deployment or acceptance'
}
(OUT / 'candidate.json').write_text(json.dumps(receipt, indent=2) + '\n')
print('Metadata preflight PASS (exit 0); candidate', receipt['candidateSha256'])
