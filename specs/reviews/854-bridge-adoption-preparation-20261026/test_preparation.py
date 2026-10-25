"""Bounded local adapter checks. No live operator, SSH, fetch, push or worker execution."""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import types
import unittest
from unittest.mock import patch

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
TEXT=(HERE/'operate.py').read_text()
MANIFEST=json.loads((HERE/'payload-manifest.json').read_text())
PENDING=json.loads((HERE/'pending-pins.json').read_text())

def module(path,name):
    result=types.ModuleType(name)
    exec(compile(path.read_text(),str(path),'exec'),result.__dict__)
    return result

M=module(HERE/'operate.py','preparation_fixture')
R=module(ROOT/'specs/reviews/workflow-copy-repair-transition-preparation-20261026/reopen.py','reopen_fixture')
R.IDS=('854',)
H=module(ROOT/'specs/reviews/parallel-968972-import-818-search-preparation-20261026/operate.py','campaign_fixture')

def git(*args):return subprocess.check_output(['git','-C',str(ROOT),*args])
def tree(rev):
    return {name.decode():meta.decode() for item in git('ls-tree','-r','-z',rev).split(b'\0') if item for meta,name in [item.split(b'\t',1)]}
OLD=tree(M.OBSERVED_BASE);NEW=tree(M.OBSERVED_SOURCE)
BLOBS={(ref,path):git('show',ref+':'+path) for ref in (M.OBSERVED_BASE,M.OBSERVED_SOURCE) for path in set(MANIFEST['files'])|{'leetcode/854/'+n for n in MANIFEST['protected']} if path in (OLD if ref==M.OBSERVED_BASE else NEW)}
REVIEW='a'*40
REPORT='specs/reviews/854-review-synthetic.md'
REPORT_BYTES=('Synthetic fixture only; candidate '+M.OBSERVED_SOURCE).encode()
REVIEW_RECEIPT_BYTES=json.dumps({'candidate':M.OBSERVED_SOURCE,'verdict':'focused-independent-acceptance','required_open':[],'runtime_unchanged_during_review':True,'closed':['854-BRIDGE-R1','854-A01'],'files':{REPORT:M.sha(REPORT_BYTES)}}).encode()

def pins():
    p=copy.deepcopy(PENDING)
    p.update(status='frozen-source-reviewed-post9961000-import',source_revision=M.OBSERVED_SOURCE,source_base=M.OBSERVED_BASE,
             source_review={'candidate':M.OBSERVED_SOURCE,'revision':REVIEW,'report_path':REPORT,'report_sha256':M.sha(REPORT_BYTES),'receipt_path':M.REVIEW_RECEIPT,'receipt_sha256':M.sha(REVIEW_RECEIPT_BYTES),'outcome':'accepted','required_open':[]},
             source_push={'head':REVIEW,'ref':'refs/heads/codex/fixture'},previous_owner='fixture-import9961000',previous_receipt_sha256='b'*64,
             accepted={'854':{}},central={},release={})
    return p

class SourceFixture:
    def __init__(self):
        self.trees={M.OBSERVED_BASE:copy.deepcopy(OLD),M.OBSERVED_SOURCE:copy.deepcopy(NEW),REVIEW:{**NEW,REPORT:'100644 blob '+'c'*40,M.REVIEW_RECEIPT:'100644 blob '+'d'*40}}
        self.blobs={**BLOBS,(REVIEW,REPORT):REPORT_BYTES,(REVIEW,M.REVIEW_RECEIPT):REVIEW_RECEIPT_BYTES}
        self.imp=types.SimpleNamespace(tree=lambda repo,revision:self.trees[revision],blob=lambda repo,revision,path:self.blobs[(revision,path)])
    def git(self,*args):
        if args[0]=='ls-remote':return REVIEW+'\trefs/heads/codex/fixture'
        if args[0]=='rev-parse':return args[1].removesuffix('^{commit}')
        if args[0] in ('fetch','merge-base'):return ''  # No remote process; explicit fixture seam.
        raise AssertionError(args)

class Preparation(unittest.TestCase):
    def test_disabled_before_input_io(self):
        with patch.object(Path,'read_bytes',side_effect=AssertionError('input read')),patch.object(M,'execute',side_effect=AssertionError('execute')):
            with self.assertRaisesRegex(RuntimeError,'Preparation only'):
                M.main(['--dispatch',M.DISPATCH,'--pins','unused','--manifest','unused','--campaign-helper','unused','--reopen-helper','unused'])
        self.assertIsNone(M.PINS_SHA);self.assertIsNone(M.PREVIOUS_OWNER)
        with self.assertRaisesRegex(RuntimeError,'pending'):M.ready(PENDING,MANIFEST)

    def test_pending_review_push_acceptance_current_previous(self):
        for key in ('source_revision','source_base','source_push','source_review','central','release','previous_owner','previous_receipt_sha256'):
            self.assertIsNone(PENDING[key])
        self.assertIsNone(PENDING['accepted']['854'])
        with patch.object(M,'PREVIOUS_OWNER','fixture-import9961000'):
            M.ready(pins(),MANIFEST)
            for mutate in (lambda p:p.update(source_revision='f'*40),lambda p:p.update(source_review=None),lambda p:p['source_review'].update(required_open=['R1']),lambda p:p.update(source_push=None)):
                p=pins();mutate(p)
                with self.assertRaises(RuntimeError):M.ready(p,MANIFEST)

    def test_actual_source_inventory_and_protected_files(self):
        fixture=SourceFixture();payload,old,new=M.source_payload(fixture,pins(),MANIFEST)
        self.assertEqual(len(payload),32)
        self.assertEqual(sum(p.startswith('leetcode/854/')for p in payload),25)
        self.assertEqual(set(payload),{p for p in OLD.keys()|NEW.keys()if OLD.get(p)!=NEW.get(p)})
        for name,digest in MANIFEST['protected'].items():
            path='leetcode/854/'+name
            self.assertEqual(OLD[path],NEW[path]);self.assertEqual(M.sha(BLOBS[(M.OBSERVED_SOURCE,path)]),digest)

    def test_actual_archived_review_binding_without_remote_claim(self):
        revision='47d97f6bf07dd1f4b8c7e1ca493ca3d21b3b9c7b'
        report='specs/reviews/854-bridge-review-20261026.md'
        receipt_raw=git('show',revision+':'+M.REVIEW_RECEIPT);receipt=json.loads(receipt_raw)
        p=pins();p['source_review'].update(revision=revision,report_path=report,report_sha256=receipt['files'][report],receipt_sha256=M.sha(receipt_raw));p['source_push']['head']=revision
        f=SourceFixture();f.trees[revision]=tree(revision)
        for path in set(receipt['files'])|{M.REVIEW_RECEIPT}:f.blobs[(revision,path)]=git('show',revision+':'+path)
        original_git=f.git
        f.git=lambda *args:revision+'\trefs/heads/codex/fixture' if args[0]=='ls-remote' else original_git(*args)
        payload,_,_=M.source_payload(f,p,MANIFEST)
        self.assertEqual(len(payload),32)
        self.assertNotIn(report,payload)  # Separate review proof is checked, not silently adopted.

    def test_source_addition_mode_drift_and_review_mismatch_refused(self):
        for kind in ('extra','symlink','wrong-bytes','protected','review','review-receipt'):
            f=SourceFixture()
            if kind=='extra':f.trees[M.OBSERVED_SOURCE]['scripts/unrelated.py']='100644 blob '+'e'*40
            elif kind=='symlink':f.trees[M.OBSERVED_SOURCE]['leetcode/854/app.js']='120000 blob '+'e'*40
            elif kind=='wrong-bytes':f.blobs[(M.OBSERVED_SOURCE,'leetcode/854/app.js')]=b'changed'
            elif kind=='protected':f.trees[M.OBSERVED_SOURCE]['leetcode/854/solution.py']='100644 blob '+'e'*40
            elif kind=='review':f.blobs[(REVIEW,REPORT)]=b'wrong candidate'
            else:f.blobs[(REVIEW,M.REVIEW_RECEIPT)]=b'{}'
            with self.subTest(kind=kind),self.assertRaises(RuntimeError):M.source_payload(f,pins(),MANIFEST)

    def test_current_old_bytes_and_added_path_refused(self):
        f=SourceFixture();payload,old,new=M.source_payload(f,pins(),MANIFEST)
        with tempfile.TemporaryDirectory() as temp,patch.object(M,'REPO',Path(temp).resolve()):
            for path,item in MANIFEST['files'].items():
                if item['before_sha256'] is not None:
                    target=M.REPO/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(BLOBS[(M.OBSERVED_BASE,path)])
            M.target_guard(f,OLD,old,payload,MANIFEST)
            target=M.REPO/'leetcode/854/app.js';saved=target.read_bytes();target.write_bytes(saved+b' ')
            with self.assertRaisesRegex(RuntimeError,'old bytes'):M.target_guard(f,OLD,old,payload,MANIFEST)
            target.write_bytes(saved)
            added=M.REPO/M.REQUEST;added.parent.mkdir(parents=True,exist_ok=True);added.write_text('collision')
            with self.assertRaisesRegex(RuntimeError,'already exists'):M.target_guard(f,OLD,old,payload,MANIFEST)
            added.unlink();target.unlink();target.symlink_to(M.REPO/'elsewhere')
            with self.assertRaisesRegex(RuntimeError,'Symlink'):M.target_guard(f,OLD,old,payload,MANIFEST)

    def test_exact_commit_tree_rejects_unrelated_changes(self):
        M.expected_tree_guard(OLD,NEW,NEW,MANIFEST)
        changed=dict(NEW);changed['README.md']='100644 blob '+'e'*40
        with self.assertRaises(RuntimeError):M.expected_tree_guard(OLD,changed,NEW,MANIFEST)
        missing=dict(NEW);missing.pop('leetcode/854/app.js')
        with self.assertRaises(RuntimeError):M.expected_tree_guard(OLD,missing,NEW,MANIFEST)

    def test_previous_receipt_requires_both_completed_imports(self):
        receipt={'owner':'fixture-import9961000','status':'completed-resumed','ledger_preserved':True,'pushed_head':'d'*40,
                 'imports':[{'problem_id':'996','status':'completed'},{'problem_id':'1000','status':'completed'}]}
        with patch.object(M,'PREVIOUS_OWNER',receipt['owner']):
            for invalid in (None,'missing','wrong-id','incomplete'):
                r=copy.deepcopy(receipt)
                if invalid=='missing':r['imports'].pop()
                if invalid=='wrong-id':r['imports'][1]['problem_id']='995'
                if invalid=='incomplete':r['imports'][1]['status']='failed'
                raw=json.dumps(r).encode();p={'previous_receipt_sha256':M.sha(raw)}
                if invalid is None:M.previous_guard(raw,p)
                else:
                    with self.assertRaises(RuntimeError):M.previous_guard(raw,p)

    def test_existing_transition_preserves_history_queue_and995(self):
        entry={'status':'accepted_local','phase':'done','rounds':1,'reviews':[{'outcome':'accepted','score':92.5}], 'candidate':'old','accepted_at':'old','registration_commit':'old','author_runs':['old-author']}
        before={'queue':['854','878','995']+[str(2000+i)for i in range(981)],'problems':{'854':entry,'878':{'status':'review_pending','phase':'review'},'995':{'status':'changes_required','phase':'fix'}},'runs':[{'id':'old-author'}],'status':'stopped','current':None,'expected_head':'old','updated_at':'fixture-old'}
        record={'prior_accepted_entry':copy.deepcopy(entry)};after=R.transition(before,'new',PENDING,record)
        R.verify_transition(before,after,'new',PENDING,record)
        self.assertEqual(after['queue'],before['queue']);self.assertEqual(after['runs'],before['runs'])
        self.assertEqual(after['problems']['995'],before['problems']['995']);self.assertEqual(after['maintenance'][0]['prior_accepted_entry'],entry)
        self.assertEqual(after['problems']['854']['reviews'],entry['reviews']);self.assertEqual(after['problems']['854']['candidate'],'old')
        with patch.dict(sys.modules,{'leetcode_campaign':types.SimpleNamespace(TERMINAL={'accepted_local','blocked','needs_review'})}),patch.object(H,'publication_bound',return_value={'upper_bound':3}):
            self.assertEqual(H.resume_plan(after,{'pending':None})['next_problem_id'],'854')
        # Execute the real publisher function with only its catalog-read seam supplied.
        import ast
        source=(ROOT/'scripts/leetcode_publish.py').read_text();node=next(n for n in ast.parse(source).body if isinstance(n,ast.FunctionDef) and n.name=='_reviewed')
        ns={'json':json,'_tracked_bytes':lambda *args:b'{"problems": []}'}
        exec(compile(ast.Module(body=[node],type_ignores=[]),'<real publisher _reviewed>','exec'),ns)
        self.assertEqual(ns['_reviewed'](ROOT,after,{},'unused',{'854'}),{})
        M.unpublished_guard(after,{'pending':None,'released':{}},True)
        with self.assertRaises(RuntimeError):M.unpublished_guard(after,{'pending':None,'released':{'854':{}}},True)

    def test_durable_preparation_precedes_payload_and_next854_guard(self):
        body=TEXT[TEXT.index('def adopt_reopen('):TEXT.index('def execute(')]
        self.assertLess(body.index('op.save(receipt,record)'),body.index('write_payload(payload,manifest)'))
        self.assertIn('before_progress_utf8',body);self.assertIn('before_ledger_utf8',body)
        execute=TEXT[TEXT.index('def execute('):]
        self.assertLess(execute.index("projected_plan['next_problem_id']=='854'"),execute.index('after,maintenance=adopt_reopen'))
        self.assertIn("op.REOPEN_IDS=('854',)",TEXT)
        self.assertIn('op.hashes_unchanged()  # Verify importer',TEXT)
        self.assertIn('no_lanes(op)==lanes',TEXT)

    def test_fresh_start_requires_exact854_fix_role_and_problem(self):
        before={'status':'stopped','current':None}
        correct={'status':'running','current':{'problem_id':'854','stage':'fix','run_id':'new-fix'},
                 'runs':[{'id':'new-fix','problem_id':'854','role':'fix','status':'running'}]}
        self.assertIsNone(M.startup(before,before,{'old'},True,'854'))
        self.assertEqual(M.startup(correct,before,{'old'},True,'854'),correct['runs'][0])
        for kind in ('author','review','wrong-run-problem','wrong-current-problem','wrong-expected'):
            invalid=copy.deepcopy(correct);expected='854'
            if kind in ('author','review'):
                invalid['current']['stage']=kind;invalid['runs'][0]['role']=kind
            elif kind=='wrong-run-problem':invalid['runs'][0]['problem_id']='878'
            elif kind=='wrong-current-problem':invalid['current']['problem_id']='878'
            else:
                expected='878';invalid['current']['problem_id']='878';invalid['runs'][0]['problem_id']='878'
            with self.subTest(kind=kind),self.assertRaises(RuntimeError):
                M.startup(invalid,before,{'old'},True,expected)

    def test_disposable_git_adoption_replaces_exact_payload_then_reopens(self):
        fixture=SourceFixture();payload,_,_=M.source_payload(fixture,pins(),MANIFEST)
        with tempfile.TemporaryDirectory() as temporary:
            root=Path(temporary).resolve();repo=root/'repo';state=root/'state';repo.mkdir();state.mkdir()
            def local_git(*args):
                return subprocess.check_output(['git','-C',str(repo),*args],stderr=subprocess.PIPE).decode().strip()
            local_git('init','-q');local_git('config','user.name','Disposable fixture');local_git('config','user.email','fixture@example.invalid')
            for path in OLD:
                if path.startswith('leetcode/854/'):
                    target=repo/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(git('show',M.OBSERVED_BASE+':'+path))
            report=repo/'old-report.md';report.write_text('Historical acceptance fixture; preserved')
            local_git('add','.');local_git('commit','-qm','Fixture base')
            old_head=local_git('rev-parse','HEAD')
            def local_tree(_repo,revision):
                raw=subprocess.check_output(['git','-C',str(repo),'ls-tree','-r','-z',revision])
                return {name.decode():meta.decode() for record in raw.split(b'\0') if record for meta,name in [record.split(b'\t',1)]}
            def local_blob(_repo,revision,path):
                return subprocess.check_output(['git','-C',str(repo),'show',revision+':'+path])
            def changed(_repo):
                # Do not strip the first line's XY prefix when interpreting actual status.
                raw=subprocess.check_output(['git','-C',str(repo),'status','--porcelain','--untracked-files=all']).decode()
                return {line[3:]for line in raw.splitlines()}
            old_tree=local_tree(repo,old_head)
            source_tree=dict(old_tree)
            for path in MANIFEST['files']:source_tree[path]=NEW[path]
            entry={'status':'accepted_local','phase':'done','rounds':1,'reviews':[{'outcome':'accepted'}],'candidate':'historical','prior_report':'old-report.md','author_runs':['old-author'],'accepted_at':'old','registration_commit':old_head}
            before={'queue':['854','995']+[str(3000+i)for i in range(982)],'problems':{'854':entry,'995':{'status':'changes_required','phase':'fix'}},'runs':[{'id':'old-author','problem_id':'854'}],'status':'stopped','current':None,'expected_head':old_head,'updated_at':'old'}
            p=pins();p['queue_sha256']=R.canonical(before['queue']);p['accepted']['854']={'entry':copy.deepcopy(entry),'entry_sha256':R.canonical(entry),'runs_sha256':R.canonical(before['runs']),'lesson_git_tree':local_git('rev-parse','HEAD:leetcode/854'),'runtime_sha256':MANIFEST['protected'],'report_sha256':M.sha(report.read_bytes())}
            # accepted_guard runtime paths are relative filenames, matching these four protected files.
            ledger_raw=b'{"pending":null,"released":{},"releases":[]}\n'
            (state/'progress.json').write_text(json.dumps(before));(state/'releases.json').write_bytes(ledger_raw)
            stop_raw=json.dumps({'owner':M.OWNER}).encode();(state/'STOP').write_bytes(stop_raw)
            imp=types.SimpleNamespace(tree=local_tree,blob=local_blob,git=lambda ignored,*args:local_git(*args),head=lambda ignored:local_git('rev-parse','HEAD'),changed_paths=changed,now=lambda:'fixture')
            op=types.SimpleNamespace(imp=imp,git=local_git,read=lambda path:json.loads(path.read_text()),save=H.save,hashes_unchanged=lambda:None,owned_stop=lambda raw:self.assertEqual((state/'STOP').read_bytes(),raw))
            record={};receipt=state/'operation.json'
            with patch.object(M,'REPO',repo),patch.object(M,'STATE',state),patch.object(R,'REPO',repo),patch.object(R,'imp',imp):
                after,maintenance=M.adopt_reopen(op,R,payload,p,MANIFEST,old_tree,source_tree,before,ledger_raw,stop_raw,record,receipt)
            self.assertEqual(local_tree(repo,after['expected_head']),source_tree)
            self.assertEqual(changed(repo),set());self.assertEqual((state/'releases.json').read_bytes(),ledger_raw)
            self.assertEqual(after['problems']['854']['status'],'changes_required');self.assertEqual(after['problems']['854']['phase'],'fix')
            self.assertEqual(after['runs'],before['runs']);self.assertEqual(after['queue'],before['queue']);self.assertEqual(after['problems']['995'],before['problems']['995'])
            self.assertEqual(maintenance['prior_accepted_entry'],entry)
            prepared=json.loads(receipt.read_text());self.assertEqual(prepared['status'],'prepared-exact-payload');self.assertEqual(prepared['old_head'],old_head)
            self.assertEqual(prepared['before_ledger_utf8'].encode(),ledger_raw)
            for name,digest in MANIFEST['protected'].items():self.assertEqual(M.sha((repo/'leetcode/854'/name).read_bytes()),digest)

if __name__=='__main__':unittest.main(verbosity=2)
