import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path
from leetcode_registry import read_registry, merge_registry
from register_leetcode_lesson import register, solution_language, JAVASCRIPT_PROBLEM_IDS

ROOT = Path(__file__).resolve().parents[1]


class RegistryTests(unittest.TestCase):
    def test_existing_generator_preserves_later_lessons(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            shutil.copytree(ROOT/'leetcode', root/'leetcode')
            shutil.copytree(ROOT/'scripts', root/'scripts', ignore=shutil.ignore_patterns('__pycache__'))
            registry=root/'leetcode/problems.config.js'
            before=read_registry(registry)
            extra={**before[0], 'id': 51, 'path':'51/', 'title':{'en':'N-Queens','zh':'N 皇后'}}
            merge_registry(registry,[extra])
            subprocess.run(['python3',str(root/'leetcode/hard-first-ten/build.py')],check=True)
            after=read_registry(registry)
            self.assertEqual(next(x for x in after if x['id']==51),extra)
            self.assertEqual(next(x for x in after if x['id']==2916),next(x for x in before if x['id']==2916))
            data=registry.read_bytes()
            subprocess.run(['python3',str(root/'leetcode/hard-first-ten/build.py')],check=True)
            self.assertEqual(data,registry.read_bytes())

    def test_registration_idempotent_and_validates_before_write(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            shutil.copytree(ROOT/'leetcode',root/'leetcode')
            shutil.copy(ROOT/'CONCEPT-MAP.md',root/'CONCEPT-MAP.md')
            p=root/'leetcode/51'; p.mkdir(exist_ok=True)
            (p/'index.html').write_text('<section id="step1"></section>')
            entry={'id':51,'path':'51/','title':{'en':'N-Queens','zh':'N 皇后'},'desc':{'en':'Search','zh':'搜索'},'difficulty':'hard','topics':[{'en':'Backtracking','zh':'回溯'}],'leetcodeUrl':'https://leetcode.com/problems/n-queens/','language':'Python','complexity':'O(n!)','concepts':[{'name':'Queens','step':1,'description':'Explore constraints'}]}
            (p/'lesson-entry.json').write_text(json.dumps(entry))
            register(root,51)
            paths=[root/'leetcode/problems.config.js',root/'leetcode/index.html',root/'CONCEPT-MAP.md']
            before=[p.read_bytes() for p in paths]
            register(root,51)
            self.assertEqual(before,[p.read_bytes() for p in paths])
            entry['concepts'][0]['step']=999
            (p/'lesson-entry.json').write_text(json.dumps(entry))
            with self.assertRaises(AssertionError): register(root,51)
            self.assertEqual(before,[p.read_bytes() for p in paths])

    def test_catalog_language_policy_matches_exact_approved_six(self):
        catalog=json.loads((ROOT/'leetcode/catalog/hard-problems.json').read_text())
        native={p['id'] for p in catalog['problems'] if solution_language(p)=='JavaScript'}
        self.assertEqual(native,JAVASCRIPT_PROBLEM_IDS)
        self.assertEqual(len(native),6)

    def test_registration_enforces_native_language_before_any_write(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            shutil.copytree(ROOT/'leetcode',root/'leetcode')
            shutil.copy(ROOT/'CONCEPT-MAP.md',root/'CONCEPT-MAP.md')
            catalog=json.loads((root/'leetcode/catalog/hard-problems.json').read_text())
            paths=[root/'leetcode/problems.config.js',root/'leetcode/index.html',root/'CONCEPT-MAP.md']
            for problem_id, correct, wrong in ((2630,'JavaScript','Python'),(51,'Python','JavaScript')):
                with self.subTest(problem_id=problem_id):
                    official=next(p for p in catalog['problems'] if p['id']==problem_id)
                    folder=root/'leetcode'/str(problem_id)
                    folder.mkdir(exist_ok=True)
                    (folder/'index.html').write_text('<section id="step1"></section>')
                    entry={'id':problem_id,'path':f'{problem_id}/','title':{'en':official['title'],'zh':'概念'},
                           'desc':{'en':'Explore','zh':'探索'},'difficulty':'hard','topics':[{'en':'Concept','zh':'概念'}],
                           'leetcodeUrl':official['officialUrl'],'language':wrong,'complexity':'O(n)',
                           'concepts':[{'name':'Concept','step':1,'description':'Explore behavior'}]}
                    (folder/'lesson-entry.json').write_text(json.dumps(entry))
                    before=[p.read_bytes() for p in paths]
                    with self.assertRaises(AssertionError): register(root,problem_id)
                    self.assertEqual(before,[p.read_bytes() for p in paths])
                    entry['language']=correct
                    (folder/'lesson-entry.json').write_text(json.dumps(entry))
                    register(root,problem_id)
                    actual=next(p for p in read_registry(paths[0]) if p['id']==problem_id)
                    self.assertEqual(actual['language'],correct)

    def test_registration_removes_only_matching_display_id_from_title(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            shutil.copytree(ROOT/'leetcode',root/'leetcode')
            shutil.copy(ROOT/'CONCEPT-MAP.md',root/'CONCEPT-MAP.md')
            folder=root/'leetcode/51'
            folder.mkdir(exist_ok=True)
            (folder/'index.html').write_text('<section id="step1"></section>')
            entry={'id':51,'path':'51/','title':{},'desc':{'en':'Search','zh':'搜索'},
                   'difficulty':'hard','topics':[{'en':'Backtracking','zh':'回溯'}],
                   'leetcodeUrl':'https://leetcode.com/problems/n-queens/','language':'Python','complexity':'O(n!)',
                   'concepts':[{'name':'Queens','step':1,'description':'Explore constraints'}]}
            for title, expected in (('#51 · N-Queens','N-Queens'),('N-Queens','N-Queens')):
                with self.subTest(title=title):
                    entry['title']={'en':title,'zh':title}
                    metadata=folder/'lesson-entry.json'
                    metadata.write_text(json.dumps(entry))
                    frozen=metadata.read_bytes()
                    register(root,51)
                    actual=next(p for p in read_registry(root/'leetcode/problems.config.js') if p['id']==51)
                    self.assertEqual(actual['title'],{'en':expected,'zh':expected})
                    self.assertEqual(metadata.read_bytes(),frozen)
            paths=[root/'leetcode/problems.config.js',root/'leetcode/index.html',root/'CONCEPT-MAP.md']
            for locale in ('en','zh'):
                with self.subTest(mismatched_locale=locale):
                    entry['title']={'en':'#51 · N-Queens','zh':'#51 · N 皇后'}
                    entry['title'][locale]='#52 · Wrong problem'
                    metadata.write_text(json.dumps(entry))
                    before=[p.read_bytes() for p in [*paths,metadata]]
                    with self.assertRaisesRegex(AssertionError, 'Title problem ID differs'):
                        register(root,51)
                    self.assertEqual(before,[p.read_bytes() for p in [*paths,metadata]])

if __name__=='__main__': unittest.main()
