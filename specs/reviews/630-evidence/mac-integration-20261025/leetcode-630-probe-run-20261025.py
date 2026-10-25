import functools,http.server,threading,subprocess,os,pathlib
repo=pathlib.Path('/Users/songyy/Documents/knowledge-vis')
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(http.server.ThreadingHTTPServer):
 def handle_error(self,*args):pass
server=Server(('127.0.0.1',0),functools.partial(Quiet,directory=str(repo)));threading.Thread(target=server.serve_forever,daemon=True).start()
env=os.environ.copy();env['NODE_PATH']='/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';env['PREVIEW_ROOT']='http://127.0.0.1:'+str(server.server_port);env['OUTPUT_DIR']=os.environ.get('PROBE_OUTPUT','/tmp/leetcode-630-mac-preset-red-20261025')
try:subprocess.run(['node',os.environ.get('PROBE_SCRIPT','/tmp/leetcode-630-preset-probe-20261025.cjs')],env=env,cwd=repo,check=True)
finally:server.shutdown();server.server_close()
