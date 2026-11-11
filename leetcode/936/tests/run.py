"""Non-mutating candidate checks. OUTPUT_DIR selects reviewer evidence location."""
import os,pathlib,subprocess,json,datetime
ROOT=pathlib.Path(__file__).resolve().parents[3]
LESSON=ROOT/'leetcode/936'
OUT=pathlib.Path(os.environ.get('OUTPUT_DIR',LESSON/'tests/evidence')).resolve()
OUT.mkdir(parents=True,exist_ok=True)
env=dict(os.environ,OUTPUT_DIR=str(OUT))
commands=[['python3','-B','leetcode/936/tests/test_solution.py'],['node','leetcode/936/tests/test_core.cjs'],['node','leetcode/936/tests/browser.cjs'],['node','leetcode/936/tests/contrast.cjs'],['python3','-B','scripts/register_leetcode_lesson.py','936','--validate-only']]
records=[]
for cmd in commands:
    r=subprocess.run(cmd,cwd=ROOT,env=env,text=True,capture_output=True)
    records.append({'command':cmd,'exitCode':r.returncode,'stdout':r.stdout,'stderr':r.stderr})
    print(' '.join(cmd),r.returncode,flush=True)
    OUT.joinpath('commands.json').write_text(json.dumps({'kind':'author or reviewer execution, identity supplied separately','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'commands':records},indent=2)+'\n')
    if r.returncode:raise SystemExit(r.returncode)
