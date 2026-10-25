import pathlib,subprocess,os,functools,http.server,threading,json,hashlib
root=pathlib.Path('/tmp/leetcode-691-frozen-c7b80d7-20261025')
out=pathlib.Path('/tmp/leetcode-691-mac-c7b80d7-20261025')
receipt=json.loads((out/'receipt.json').read_text())
env=os.environ.copy();env['OUTPUT_DIR']=str(out);env['CANDIDATE']=receipt['candidate'];env['NODE_PATH']='/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules:/Users/songyy/Documents/integ-life/integ-games/node_modules';env['PREVIEW_URL']='http://127.0.0.1:18783/leetcode/691/';env['PREVIEW_ROOT']='http://127.0.0.1:18783'
env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH']=subprocess.check_output(['node','-e','process.stdout.write(require("playwright").chromium.executablePath())'],env=env,text=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(http.server.ThreadingHTTPServer):
 def handle_error(self,*args):pass
server=Server(('127.0.0.1',18783),functools.partial(Quiet,directory=str(root)));threading.Thread(target=server.serve_forever,daemon=True).start()
receipt['commands']=[];receipt['browser_executable']=env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH']
try:
 for cmd in [['node','leetcode/691/tests/browser.cjs'],['node','/tmp/leetcode-691-fallback-probe-20261025.cjs'],['node','/tmp/leetcode-691-preset-probe-20261025.cjs'],['node','leetcode/691/tests/selected-label.cjs'],['node','leetcode/691/tests/rendered-state.cjs']]:
  print(json.dumps({'running':cmd,'candidate':receipt['candidate']}),flush=True)
  caseenv=env.copy();caseenv['OUTPUT_DIR']=str(out/('labels' if 'preset-probe' in cmd[-1] else 'fallback' if 'fallback-probe' in cmd[-1] else 'focused' if 'selected-label' in cmd[-1] or 'rendered-state' in cmd[-1] else 'original'));r=subprocess.run(cmd,cwd=root,env=caseenv)
  receipt['commands'].append({'argv':cmd,'exit_code':r.returncode})
  if r.returncode:raise RuntimeError('Check failed: '+str(cmd))
finally:
 server.shutdown();server.server_close()
 for p,h in receipt['hashes'].items():assert hashlib.sha256((root/p).read_bytes()).hexdigest()==h
 (out/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
