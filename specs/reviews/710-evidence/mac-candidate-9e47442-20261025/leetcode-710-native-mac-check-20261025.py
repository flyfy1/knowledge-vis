import pathlib,subprocess,os,functools,http.server,threading,json,hashlib
root=pathlib.Path('/tmp/leetcode-710-frozen-9e47442-20261025')
original=pathlib.Path('/tmp/leetcode-710-mac-9e47442-20261025')
out=pathlib.Path('/tmp/leetcode-710-mac-native-9e47442-20261025');out.mkdir(exist_ok=False)
receipt=json.loads((original/'receipt.json').read_text())
env=os.environ.copy();env.update(OUTPUT_DIR=str(out),PREVIEW_URL='http://127.0.0.1:18770/leetcode/710/',NODE_PATH='/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules:/Users/songyy/Documents/integ-life/integ-games/node_modules',PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=receipt['browser_executable'])
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',18770),functools.partial(Quiet,directory=str(root)));threading.Thread(target=server.serve_forever,daemon=True).start()
receipt['commands']=[];receipt['scope']='Supplemental longest native select screenshots and actual clipboard sentinel readback before host shortcut.'
try:
 cmd=['node','/tmp/leetcode-710-native-supplement-20261025.cjs']
 with (out/'browser.log').open('w') as log:r=subprocess.run(cmd,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT)
 receipt['commands'].append({'argv':cmd,'exit_code':r.returncode});print(json.dumps(receipt['commands']),flush=True)
finally:
 server.shutdown();server.server_close()
 receipt['unchanged_after']=all(hashlib.sha256((root/p).read_bytes()).hexdigest()==h for p,h in receipt['hashes'].items())
 (out/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');assert receipt['unchanged_after']
