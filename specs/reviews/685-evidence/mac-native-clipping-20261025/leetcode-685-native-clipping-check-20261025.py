import functools,http.server,threading,subprocess,os,pathlib,json
repo=pathlib.Path('/tmp/leetcode-685-frozen-cfba14b-20261025')
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
class Server(http.server.ThreadingHTTPServer):
 def handle_error(self,*args): pass
server=Server(('127.0.0.1',0),functools.partial(Quiet,directory=str(repo)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url='http://127.0.0.1:'+str(server.server_port)
env=os.environ.copy(); env['NODE_PATH']='/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules:/Users/songyy/Documents/integ-life/integ-games/node_modules'
env['PREVIEW_ROOT']=url;env['OUTPUT_DIR']='/tmp/leetcode-685-native-clipping-20261025';env['COLLECTION_URL']=url+'/leetcode/';env['COLLECTION_TEST_OUTPUT_DIR']='/tmp/leetcode-675-integration-20261025/collection'
try:
 for cmd in [['node','/tmp/leetcode-685-preset-probe-20261025.cjs']]:
  print(json.dumps({'running':cmd,'preview':url}),flush=True)
  subprocess.run(cmd,cwd=repo,env=env,check=True)
finally:server.shutdown();server.server_close()
