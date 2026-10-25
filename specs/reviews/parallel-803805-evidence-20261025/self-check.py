"""Local guard checks only. Does not execute launcher top-level or contact Pi."""
import ast,json,os,pathlib,tempfile,time,types
from unittest.mock import patch
source=pathlib.Path(__file__).with_name('launch.py')
node=ast.parse(source.read_text())
ns=dict(json=json,os=os,pathlib=pathlib,time=time)
exec(compile(ast.Module(body=[n for n in node.body if isinstance(n,ast.FunctionDef) and n.name in {'read','syncdir','save','observe'}],type_ignores=[]),str(source),'exec'),ns)
with tempfile.TemporaryDirectory() as temp:
    root=pathlib.Path(temp); receipt=root/'receipt.json'
    ns['save'](receipt,{'status':'prepared'},True)
    try: ns['save'](receipt,{'status':'wrong'},True)
    except FileExistsError: pass
    else: raise AssertionError('exclusive create failed')
    assert json.loads(receipt.read_text())=={'status':'prepared'}
    ns['save'](receipt,{'status':'spawned','runner_pid':123})
    assert json.loads(receipt.read_text())=={'status':'spawned','runner_pid':123}
    assert list(root.iterdir())==[receipt]
    state=root/'state';state.mkdir();repo=root/'repo'
    current={'problem_id':'803','stage':'author','run_id':'fixture'}
    (state/'progress.json').write_text(json.dumps({'repo':str(repo),'queue':['803'],'status':'running','current':current}))
    args=['python3',str(repo/'scripts/leetcode_campaign.py'),'--repo',str(repo),'--state-dir',str(state),'--ids','803','--port','18785']
    class Proc:
        pid=123
        def poll(self): return None
    class Cmdline:
        def __init__(self,words): self.words=words
        def read_bytes(self): return ('\0'.join(self.words)+'\0').encode()
    with patch.object(pathlib,'Path',return_value=Cmdline(args)),patch.object(os,'getpriority',return_value=10):
        assert ns['observe'](Proc(),repo,state,'803',18785)==current
    for bad in [args+['--publish-root','/production'],args[:-4]+['--ids','805','--port','18785']]:
        with patch.object(pathlib,'Path',return_value=Cmdline(bad)),patch.object(os,'getpriority',return_value=10):
            try: ns['observe'](Proc(),repo,state,'803',18785)
            except AssertionError: pass
            else: raise AssertionError('bad worker was accepted')
    dead=Proc();dead.poll=lambda:1
    try: ns['observe'](dead,repo,state,'803',18785)
    except AssertionError: pass
    else: raise AssertionError('exited child was accepted')
print(json.dumps({'exclusive_receipt':True,'atomic_receipt_update':True,'exact_live_worker':True,'publication_rejected':True,'wrong_id_rejected':True,'exited_child_rejected':True,'remote_launch_executed':False}))
