"""One-time, baseline-guarded root-only publication. Run with a pushed source commit."""
import hashlib,json,pathlib,shlex,subprocess,sys
commit=sys.argv[1]
content=subprocess.check_output(['git','show',commit+':index.html'])
expected='5c2fd1c30fee38137595f1599465970696c30fdf58ea687894741be508a49053'
assert hashlib.sha256(content).hexdigest()==expected
remote=r'''
import datetime,hashlib,json,os,pathlib,sys,tempfile
root=pathlib.Path('/home/songyy/projects/visual-site')
protected=['pages.config.js','leetcode/problems.config.js','leetcode/collection.js','leetcode/collection.css']
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
before={p:sha(root/p) for p in protected}
assert before['leetcode/problems.config.js']=='b6053ffefb6704b9aefdf234b127be4b9287dc92afcf834931619b9633244311'
assert sha(root/'index.html')=='f8a48d19966c0cb02905820513e3926b8076e9002da966bbb4012efebb4f39d6'
assert not (root/'leetcode/736/index.html').exists()
content=sys.stdin.buffer.read()
expected='5c2fd1c30fee38137595f1599465970696c30fdf58ea687894741be508a49053'
assert hashlib.sha256(content).hexdigest()==expected
fd,name=tempfile.mkstemp(prefix='.index-home-section-',suffix='.tmp',dir=root)
try:
 with os.fdopen(fd,'wb') as out:out.write(content);out.flush();os.fsync(out.fileno())
 os.chmod(name,0o644)
 os.replace(name,root/'index.html')
 directory=os.open(root,os.O_RDONLY);os.fsync(directory);os.close(directory)
finally:
 if os.path.exists(name):os.unlink(name)
after={p:sha(root/p) for p in protected}
assert before==after
assert sha(root/'index.html')==expected
assert not (root/'leetcode/736/index.html').exists()
print(json.dumps({'status':'published-origin','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'allowlist':['index.html'],'root_sha256':expected,'protected_before':before,'protected_after':after,'736_exists':False,'old_served_backups_created':False},indent=2))
'''
result=subprocess.run(['ssh','pi','python3 -c '+shlex.quote(remote)],input=content,stdout=subprocess.PIPE,check=True)
receipt=json.loads(result.stdout);receipt['source_commit']=commit
path=pathlib.Path(__file__).with_name('deployment.json');path.write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt,indent=2))
