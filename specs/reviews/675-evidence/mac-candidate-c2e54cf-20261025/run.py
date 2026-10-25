import pathlib,subprocess,os,functools,http.server,threading,json,hashlib
root=pathlib.Path('/tmp/leetcode-675-frozen-c2e54cf-20261025')
out=pathlib.Path('/tmp/leetcode-675-mac-c2e54cf-20261025')
receipt=json.loads((out/'receipt.json').read_text())
env=os.environ.copy();env['OUT_DIR']=str(out);env['CANDIDATE']=receipt['candidate'];env['NODE_PATH']='/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules:/Users/songyy/Documents/integ-life/integ-games/node_modules';env['PREVIEW_URL']='http://127.0.0.1:18782';env['PREVIEW_ROOT']='http://127.0.0.1:18782'
env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH']=subprocess.check_output(['node','-e','process.stdout.write(require("playwright").chromium.executablePath())'],env=env,text=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(http.server.ThreadingHTTPServer):
 def handle_error(self,*args):pass
server=Server(('127.0.0.1',18782),functools.partial(Quiet,directory=str(root)));threading.Thread(target=server.serve_forever,daemon=True).start()
receipt['commands']=[];receipt['browser_executable']=env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH']
try:
 for cmd in [['python3','-B','leetcode/675/tests/test_solution.py'],['node','leetcode/675/tests/test_core.cjs'],['node','leetcode/675/tests/browser.cjs'],['node','leetcode/675/tests/focused.cjs']]:
  print(json.dumps({'running':cmd,'candidate':receipt['candidate']}),flush=True)
  r=subprocess.run(cmd,cwd=root,env=env)
  receipt['commands'].append({'argv':cmd,'exit_code':r.returncode})
  if r.returncode:raise RuntimeError('Check failed: '+str(cmd))
finally:
 server.shutdown();server.server_close()
 for p,h in receipt['hashes'].items():assert hashlib.sha256((root/p).read_bytes()).hexdigest()==h
 (out/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
