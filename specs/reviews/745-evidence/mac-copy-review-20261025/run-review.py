import pathlib,json,subprocess,os,threading,http.server,functools,hashlib,shutil
root=pathlib.Path('/tmp/leetcode-741-761-candidate-20261025')
repo=pathlib.Path('/Users/songyy/Documents/knowledge-vis')
out=repo/'specs/reviews/745-evidence/mac-copy-review-20261025'
out.mkdir(parents=True,exist_ok=True);(out/'adapted-suite').mkdir(exist_ok=True)
original=root/'leetcode/745/tests/browser.cjs';adapter=pathlib.Path('/tmp/leetcode-745-mac-copy-adapter.cjs')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def snapshot():return {str(p.relative_to(root)):sha(p) for p in root.rglob('*') if p.is_file()}
before=snapshot()
shutil.copyfile(original,out/'original-browser.cjs');shutil.copyfile(adapter,out/'mac-copy-adapter.cjs')
shutil.copyfile('/tmp/leetcode-741-761-mac-20261025/745/browser.cjs.log',out/'original-mac-failure.log')
candidate=subprocess.check_output(['git','rev-parse','4a3d34f'],cwd=repo,text=True).strip()
tip=subprocess.check_output(['git','rev-parse','5887fa0'],cwd=repo,text=True).strip()
tree1=subprocess.check_output(['git','rev-parse',candidate+':leetcode/745'],cwd=repo,text=True).strip()
tree2=subprocess.check_output(['git','rev-parse',tip+':leetcode/745'],cwd=repo,text=True).strip();assert tree1==tree2
names=subprocess.check_output(['git','ls-tree','-r','--name-only',tip,'--','leetcode/745'],cwd=repo,text=True).splitlines()
for name in names:assert (root/name).read_bytes()==subprocess.check_output(['git','show',tip+':'+name],cwd=repo)
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',18770),functools.partial(Quiet,directory=str(root)))
thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
env={**os.environ,'NODE_PATH':'/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules','LESSON_TEST_OUTPUT_DIR':str(out/'adapted-suite'),'FROZEN_ROOT':str(root),'COPY_REVIEW_OUTPUT':str(out),'LESSON_PREVIEW_URL':'http://127.0.0.1:18770/leetcode/745/'}
env.pop('PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH',None)
results=[]
try:
 for name,args in [('adapted-suite',['node',str(adapter),str(original)]),('focused-probe',['node',str(out/'focused-copy-probe.cjs')])]:
  with (out/(name+'.log')).open('w') as log:r=subprocess.run(args,env=env,stdout=log,stderr=subprocess.STDOUT)
  results.append({'name':name,'command':args,'exitCode':r.returncode});print(json.dumps(results[-1]),flush=True)
finally:
 server.shutdown();server.server_close();thread.join()
 after=snapshot();assert before==after
 receipt={'candidate':candidate,'batchTip':tip,'lessonTree':tree1,'candidateFilesCompared':len(names),'allFrozenFilesUnchanged':True,'frozenFileCount':len(before),'originalTestSha256':sha(original),'adapterSha256':sha(adapter),'commands':results,'serverClosed':True}
 (out/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt),flush=True)
raise SystemExit(0 if all(r['exitCode']==0 for r in results) else 1)
