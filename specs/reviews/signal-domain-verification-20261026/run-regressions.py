from pathlib import Path
import subprocess,json,os,time
r=Path('/Users/songyy/Documents/knowledge-vis');s=Path(__file__).resolve().parent;env=os.environ.copy();env['NODE_PATH']='/Users/songyy/Documents/integ-life/integ-games/node_modules';env['ATLAS_BASE_URL']='http://127.0.0.1:18775';items=[('atlas/tests/browser.cjs','ATLAS_EVIDENCE','atlas'),('atlas/tests/response-browser.cjs','ATLAS_RESPONSE_EVIDENCE','response'),('atlas/tests/data-quality-browser.cjs','ATLAS_AUDIT_EVIDENCE','quality')];rows=[]
for script,key,slug in items:
 e=env.copy();e[key]=str(s/'regressions'/slug);start=time.time();p=subprocess.run(['node',script],cwd=r,env=e,capture_output=True,text=True);(s/('regression-'+slug+'.log')).write_text(p.stdout+'\nSTDERR\n'+p.stderr);rows.append({'command':'node '+script,'evidenceVariable':key,'evidenceDirectory':'regressions/'+slug,'exit':p.returncode,'seconds':round(time.time()-start,2),'stdoutLog':'regression-'+slug+'.log'});(s/'regressions.json').write_text(json.dumps(rows,indent=2));print(slug,'PASS'if p.returncode==0 else'FAIL',flush=True)
 if p.returncode:raise SystemExit(p.returncode)
