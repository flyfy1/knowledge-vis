"""Run from any cwd. OUTPUT_DIR redirects all emitted results/screenshots."""
from pathlib import Path
import os,subprocess,json,datetime
root=Path(__file__).resolve().parents[3]
out=Path(os.environ.get('OUTPUT_DIR',Path(__file__).resolve().parent/'evidence')).resolve();out.mkdir(parents=True,exist_ok=True)
env={**os.environ,'OUTPUT_DIR':str(out)}
commands=[['python3','-B','leetcode/927/tests/test_solution.py'],['node','leetcode/927/tests/test_core.cjs'],['node','leetcode/927/tests/browser.cjs'],['node','leetcode/927/tests/contrast.cjs'],['node','leetcode/927/tests/layout.cjs'],['python3','-B','scripts/register_leetcode_lesson.py','927','--validate-only']]
records=[]
for cmd in commands:
    p=subprocess.run(cmd,cwd=root,env=env,capture_output=True,text=True)
    r={'command':' '.join(cmd),'exitCode':p.returncode,'stdout':p.stdout,'stderr':p.stderr};records.append(r);print(json.dumps(r),flush=True)
    if p.returncode:break
(out/'commands.json').write_text(json.dumps({'kind':'author self-check','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'commands':records},indent=2))
raise SystemExit(any(r['exitCode'] for r in records))
