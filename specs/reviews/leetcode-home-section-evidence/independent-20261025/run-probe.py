import http.server,threading,functools,subprocess,os
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory='/Users/songyy/Documents/knowledge-vis'))
thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
env={**os.environ,'REVIEW_BASE':f'http://127.0.0.1:{server.server_port}','NODE_PATH':'/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'}
try:
 result=subprocess.run(['node','/tmp/home-inline-independent-review.cjs'],env=env)
finally:
 server.shutdown();server.server_close();thread.join()
raise SystemExit(result.returncode)
