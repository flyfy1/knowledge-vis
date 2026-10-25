import pathlib, subprocess, os, functools, http.server, threading, json, hashlib, tarfile, io
repo=pathlib.Path('/Users/songyy/Documents/knowledge-vis')
candidate='3106c17dd225e92aeea6dfb08cb2e1e630001eaa'
root=pathlib.Path('/tmp/leetcode-726-frozen-3106c17-20261025')
out=pathlib.Path('/tmp/leetcode-726-mac-3106c17-20261025')
assert not root.exists() and not out.exists()
root.mkdir(); out.mkdir()
paths=subprocess.check_output(['git','ls-tree','-r','--name-only',candidate,'leetcode'],cwd=repo,text=True).splitlines()
paths=[p for p in paths if p.startswith('leetcode/726/') or len(pathlib.PurePosixPath(p).parts)==2 or (len(pathlib.PurePosixPath(p).parts)==3 and p.endswith('/index.html'))]
archive=subprocess.check_output(['git','archive',candidate,'--',*paths],cwd=repo)
with tarfile.open(fileobj=io.BytesIO(archive)) as tf: tf.extractall(root,filter='data')
hashes={}
for p in paths:
 data=(root/p).read_bytes()
 assert data==subprocess.check_output(['git','show',candidate+':'+p],cwd=repo)
 hashes[p]=hashlib.sha256(data).hexdigest()
env=os.environ.copy()
env.update(OUTPUT_DIR=str(out),PREVIEW_URL='http://127.0.0.1:18784/leetcode/726/',NODE_PATH='/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules:/Users/songyy/Documents/integ-life/integ-games/node_modules',PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Users/songyy/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing')
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',18784),functools.partial(Quiet,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start()
receipt={'candidate':candidate,'hashes':hashes,'commands':[],'browser_executable':env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH']}
try:
 for cmd in [['python3','-B','leetcode/726/tests/check.py'],['node','leetcode/726/tests/browser.cjs'],['node','leetcode/726/tests/review-r1.cjs']]:
  print(json.dumps({'running':cmd}),flush=True)
  with (out/(pathlib.Path(cmd[-1]).name+'.log')).open('w') as log: r=subprocess.run(cmd,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT)
  receipt['commands'].append({'argv':cmd,'exit_code':r.returncode})
  print(json.dumps(receipt['commands'][-1]),flush=True)
  if r.returncode: raise RuntimeError('Original check failed: '+str(cmd))
finally:
 server.shutdown();server.server_close()
 receipt['unchanged_after']=all(hashlib.sha256((root/p).read_bytes()).hexdigest()==h for p,h in hashes.items())
 (out/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
 assert receipt['unchanged_after']
