import pathlib,subprocess,threading,http.server,functools,os,json,hashlib,time
repo=pathlib.Path('/tmp/leetcode-736-candidate-20261025');out=pathlib.Path('/tmp/leetcode-736-mac-20261025');out.mkdir(exist_ok=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',18770),functools.partial(Quiet,directory=str(repo)));threading.Thread(target=server.serve_forever,daemon=True).start()
env=os.environ.copy();env['NODE_PATH']='/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules:/Users/songyy/Documents/integ-life/integ-games/node_modules';env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH']='/Users/songyy/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';env['PREVIEW_URL']=f'http://127.0.0.1:{server.server_port}'
results=[]
try:
 for name,args in [('numerical',['python3','-B','leetcode/736/tests/check.py']),('browser',['node','leetcode/736/tests/browser.cjs']),('focused',['node','leetcode/736/tests/inspect.cjs'])]:
  env['OUTPUT_DIR']=str(out/name);start=time.monotonic();r=subprocess.run(args,cwd=repo,env=env,capture_output=True,text=True,timeout=180);(out/(name+'.log')).write_text(r.stdout+r.stderr);results.append({'name':name,'exit_code':r.returncode,'seconds':time.monotonic()-start});print(json.dumps(results[-1]),flush=True)
  if r.returncode:raise RuntimeError(name+' failed: '+r.stderr[-700:])
finally:
 server.shutdown();(out/'checks.json').write_text(json.dumps(results,indent=2))
