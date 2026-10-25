"""Frozen proposal identity and preservation checks; no Pi writes or dispatch."""
import ast,copy,gzip,hashlib,importlib.util,json
from pathlib import Path
import unittest
P=Path(__file__).resolve().parent;C=json.loads((P/'capture.json').read_bytes());F=json.loads((P/'pins.json').read_bytes());sha=lambda b:hashlib.sha256(b).hexdigest()
class Ready(unittest.TestCase):
 def test_only_pins_constant_changed(self):
  original=(P.parent/'operate.py').read_text();self.assertEqual(sha(original.encode()),'8ed2ce05bf4a4ac273e6d3aac1dd3adceb2329b6854b3a27c179bb5ff562f6a4')
  self.assertEqual((P/'operate.py').read_text(),original.replace('PINS_SHA=None','PINS_SHA='+repr(sha((P/'pins.json').read_bytes()))))
 def test_actual_acceptance_history_and_remote_registration(self):
  self.assertEqual(F,C['pins']);self.assertEqual(F['status'],'frozen-accepted-pair')
  for i in ('996','1000'):
   a=C['archives'][i];s=json.loads(gzip.decompress((P/(i+'-completed-progress.json.gz')).read_bytes()));self.assertEqual(s,a['progress']);self.assertEqual(s['problems'][i],F['lanes'][i]['entry']);self.assertIsNone(s['current']);self.assertEqual(s['status'],'completed');self.assertTrue(all(r['status']=='completed' for r in s['runs']));self.assertEqual(a['remoteRegistration'],F['lanes'][i]['head']);self.assertEqual(len(set(a['lessonTrees'].values())),1);self.assertEqual(sha((P/Path(a['reportPath']).name).read_bytes()),F['lanes'][i]['report_sha256'])
  reviews=F['lanes']['996']['entry']['reviews'];self.assertEqual(reviews[0]['required_open'],['996-R1-COST-01']);self.assertEqual(reviews[-1]['required_open'],[]);self.assertEqual(reviews[-1]['weighted_score'],100)
  self.assertIn('996-R1-COST-01 — closed',(P/'996-review-2-f1f3e97e.md').read_text());self.assertIn('Process deviation:',(P/'996-review-2-f1f3e97e.md').read_text())
 def test_actual_native_queue_and_bound(self):
  o=C['observation'];self.assertEqual(o['current'],F['central']['current']);self.assertEqual(o['current']['run_id'],'879-author-ce034589b597');self.assertEqual(o['central_runner_pid'],1865819);self.assertEqual(o['native_proof']['native_codex_pids'],[1900058]);self.assertEqual(o['allowed_dirty_scope']['prefix'],'leetcode/879/');self.assertTrue(o['lane_processes_absent'] and o['lane_base_same_shared']);self.assertEqual(o['queue_count'],984)
  b=o['resume_plan']['publication_bound'];self.assertEqual(set(b['incoming']),{'996','1000'});self.assertEqual(b['upper_bound'],11);self.assertNotIn('995',b['eligible']);self.assertEqual(o['ledger_sha256'],F['release']['ledger_sha256'])
 def test_queued995_actual_identity_and_preservation_negative(self):
  q=F['queued995_capture'];self.assertEqual((q['entry']['status'],q['entry']['phase']),('changes_required','fix'));self.assertTrue(q['publication_ineligible']);self.assertEqual(q['handoff_receipt_sha256'],'86159f93f1a918035f10c47c6bbda09409b8a914c0320dfee40551b305eed343');self.assertEqual(F['lane_base'],'6c68b23cc306067de5a912195a3c7edeebc2a0be')
  path=P.parents[3]/'specs/reviews/parallel-968972-import-818-search-preparation-20261026/operate.py';spec=importlib.util.spec_from_file_location('preservation_helper',path);h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h);h.IDS=('996','1000')
  before={'problems':{'995':q['entry']},'runs':[{'problem_id':'995','id':'old'}],'queue':['879','995','996','1000'],'maintenance':q['maintenance'],'lane_imports':[]};after=copy.deepcopy(before);after['problems'].update({'996':{},'1000':{}});h.import_metadata_preserved(before,after)
  after['problems']['995']['status']='accepted_local'
  with self.assertRaisesRegex(RuntimeError,'Prior problem'):h.import_metadata_preserved(before,after)
 def test_capture_no_mutation_and_guard_order(self):
  text=(P/'capture-readonly.py').read_text();self.assertLess(text.index("for path,digest in pins['policy'].items()"),text.index('import import_leetcode_lane as imp'));self.assertLess(text.index('assert sha(helper_source.encode())'),text.index('exec(helper_source'))
  for node in ast.walk(ast.parse(text)):
   if isinstance(node,ast.Call) and isinstance(node.func,ast.Attribute):self.assertNotIn(node.func.attr,['write_text','write_bytes','mkdir','unlink','save','import_lane','Popen','kill','terminate'])
if __name__=='__main__':unittest.main(verbosity=2)
