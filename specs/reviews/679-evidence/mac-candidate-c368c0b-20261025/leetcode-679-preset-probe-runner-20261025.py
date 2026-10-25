import pathlib,subprocess,os,functools,http.server,threading,json,hashlib
root=pathlib.Path('/tmp/leetcode-679-frozen-c368c0b-20261025')
out=pathlib.Path('/tmp/leetcode-679-mac-c368c0b-20261025')
receipt=json.loads((out/'receipt.json').read_text())
env=os.environ.copy();env['OUTPUT_DIR']=str(out);env['CANDIDATE']=receipt['candidate'];env['NODE_PATH']='/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules:/Users/songyy/Documents/integ-life/integ-games/node_modules';env['PREVIEW_URL']='http://127.0.0.1:18783';env['PREVIEW_ROOT']='http://127.0.0.1:18783'
env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH']=subprocess.check_output(['node','-e','process.stdout.write(require("playwright").chromium.executablePath())'],env=env,text=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(http.server.ThreadingHTTPServer):
 def handle_error(self,*args):pass
server=Server(('127.0.0.1',18783),functools.partial(Quiet,directory=str(root)));threading.Thread(target=server.serve_forever,daemon=True).start()
receipt['label_probe_commands']=[];receipt['browser_executable']=env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH']
try:
 for cmd in [['node','/tmp/leetcode-679-preset-probe-20261025.cjs']]:
  print(json.dumps({'running':cmd,'candidate':receipt['candidate']}),flush=True)
  r=subprocess.run(cmd,cwd=root,env=env)
  receipt['label_probe_commands'].append({'argv':cmd,'exit_code':r.returncode})
  if r.returncode:raise RuntimeError('Check failed: '+str(cmd))
finally:
 server.shutdown();server.server_close()
 for p,h in receipt['hashes'].items():assert hashlib.sha256((root/p).read_bytes()).hexdigest()==h
 (out/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
