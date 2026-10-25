import pathlib,subprocess,threading,http.server,functools,os,json,hashlib,time
repo=pathlib.Path('/tmp/leetcode-239-nav-candidate-20261025');out=pathlib.Path('/tmp/leetcode-239-nav-mac-20261025');out.mkdir(exist_ok=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(repo)));threading.Thread(target=server.serve_forever,daemon=True).start()
env=os.environ.copy();env['NODE_PATH']='/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules:/Users/songyy/Documents/integ-life/integ-games/node_modules';env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH']='/Users/songyy/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';env['PREVIEW_URL']=f'http://127.0.0.1:{server.server_port}'
results=[]
try:
 for name,args in [('navigation',['node','leetcode/239/tests/navigation-regression.js']),('python',['python3','-B','leetcode/239/tests/test_solution.py']),('core',['node','leetcode/239/tests/test_core.js']),('membership',['node','leetcode/239/tests/rendered-membership.js']),('title',['node','leetcode/239/tests/title-regression.js']),('copy',['node','leetcode/239/tests/trace-copy-check.js'])]:
  env['OUTPUT_DIR']=str(out/name);start=time.monotonic();r=subprocess.run(args,cwd=repo,env=env,capture_output=True,text=True,timeout=180);(out/(name+'.log')).write_text(r.stdout+r.stderr);results.append({'name':name,'exit_code':r.returncode,'seconds':time.monotonic()-start});print(json.dumps(results[-1]),flush=True)
  if r.returncode:raise RuntimeError(name+' failed: '+r.stderr[-700:])
finally:
 server.shutdown();(out/'checks.json').write_text(json.dumps(results,indent=2))
