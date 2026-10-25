import pathlib,subprocess,threading,http.server,functools,os,json,hashlib,time
repo=pathlib.Path('/tmp/leetcode-803-candidate-20261025');out=pathlib.Path('/tmp/leetcode-803-mac-20261025');out.mkdir(exist_ok=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',18785),functools.partial(Quiet,directory=str(repo)));threading.Thread(target=server.serve_forever,daemon=True).start()
env=os.environ.copy();env['NODE_PATH']='/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules:/Users/songyy/Documents/integ-life/integ-games/node_modules';env['PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH']='/Users/songyy/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
jobs={803:['check.py','browser.cjs']}
results=[]
try:
 for i,tests in jobs.items():
  destination=out/str(i);destination.mkdir(exist_ok=True)
  for k in ['OUTPUT_DIR','LESSON_TEST_OUTPUT_DIR','LESSON_OUTPUT_DIR','EVIDENCE_DIR']:env[k]=str(destination)
  commands=[('preflight',['python3','-B','scripts/register_leetcode_lesson.py',str(i),'--validate-only'])]+[(f,(['python3','-B'] if f.endswith('.py') else ['node'])+[f'leetcode/{i}/tests/{f}']) for f in tests]
  for name,args in commands:
   start=time.monotonic()
   try:r=subprocess.run(args,cwd=repo,env=env,capture_output=True,text=True,timeout=240);code=r.returncode;log=r.stdout+r.stderr
   except subprocess.TimeoutExpired as e:code=124;log=str(e)
   (destination/(name+'.log')).write_text(log);row={'id':i,'name':name,'command':args,'exit_code':code,'seconds':round(time.monotonic()-start,3)};results.append(row);print(json.dumps(row),flush=True)
   if code:print(log[-1200:],flush=True)
   (out/'checks.json').write_text(json.dumps(results,indent=2))
finally:
 server.shutdown()
 before=json.loads(pathlib.Path('/tmp/leetcode-803-candidate-before.json').read_text());after={str(p.relative_to(repo)):hashlib.sha256(p.read_bytes()).hexdigest() for p in repo.rglob('*') if p.is_file()}
 changed=[p for p,h in before['files'].items() if after.get(p)!=h];added=sorted(set(after)-set(before['files']));receipt={'revision':before['revision'],'files_checked':len(before['files']),'changed':changed,'added':added};(out/'candidate-parity.json').write_text(json.dumps(receipt,indent=2));print(json.dumps(receipt),flush=True)
