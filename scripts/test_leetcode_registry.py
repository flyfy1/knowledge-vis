import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path
from leetcode_registry import read_registry, merge_registry
from register_leetcode_lesson import register, solution_language, JAVASCRIPT_PROBLEM_IDS, validate_language_sources, LANGUAGE_FILES

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
                    if correct == 'JavaScript':
                        contract = {'problemId': problem_id, 'language': correct, 'officialSource': official['officialUrl'],
                                    'supportedLanguages': [correct], 'interface': 'function memoize(fn)',
                                    'rationale': 'Fixture supports only JavaScript.', 'verifiedAt': '2026-10-18T00:00:00Z',
                                    'verificationEvidence': 'language-evidence.md'}
                        (folder/'language-contract.json').write_text(json.dumps(contract))
                        (folder/'language-evidence.md').write_text('Official fixture exposes JavaScript only.')
                        for source, mirror, export in [('solution.js','javascript-code.js','JAVASCRIPT_SOURCE'),('concept.py','python-code.js','PYTHON_SOURCE')]:
                            (folder/source).write_text('Source fixture')
                            (folder/mirror).write_text('window.'+export+' = "Source fixture";')
                    entry['language']=correct
                    (folder/'lesson-entry.json').write_text(json.dumps(entry))
                    register(root,problem_id)
                    actual=next(p for p in read_registry(paths[0]) if p['id']==problem_id)
                    self.assertEqual(actual['language'],correct)

    def test_language_contract_prefers_python_then_typescript_and_preserves_native(self):
        with tempfile.TemporaryDirectory() as tmp:
            folder=Path(tmp)
            official={'id':185,'officialUrl':'https://leetcode.com/problems/department-top-three-salaries/','categories':['database']}
            base={'problemId':185,'language':'MySQL','officialSource':official['officialUrl'],
                  'supportedLanguages':['MySQL'],'interface':'Employee and Department tables',
                  'rationale':'Fixture has only the SQL interface.','verifiedAt':'2026-10-18T00:00:00Z',
                  'verificationEvidence':'language-evidence.md'}
            (folder/'language-evidence.md').write_text('Observed official SQL fixture schema.')
            def write(**changes):
                (folder/'language-contract.json').write_text(json.dumps({**base,**changes}))
            for language, supported in [('MySQL',['MySQL']),('TypeScript',['JavaScript','TypeScript']),('Python',['Python','TypeScript'])]:
                write(language=language,supportedLanguages=supported)
                self.assertEqual(solution_language(official,folder),language)
                source,mirror,export=LANGUAGE_FILES[language]
                (folder/source).write_text('canonical \"value\"\n')
                (folder/mirror).write_text('window.'+export+' = '+json.dumps((folder/source).read_text())+';')
                self.assertEqual(validate_language_sources(official,folder),language)
                (folder/mirror).write_text('window.'+export+' = "wrong";')
                with self.assertRaisesRegex(ValueError,'parity'): validate_language_sources(official,folder)
            for changes in [dict(language='JavaScript',supportedLanguages=['JavaScript','TypeScript']),
                            dict(language='TypeScript',supportedLanguages=['Python','TypeScript']),
                            dict(officialSource='https://example.com/'),dict(problemId=186),
                            dict(verificationEvidence='../outside.md'),dict(verifiedAt='2026-10-18')]:
                with self.subTest(changes=changes):
                    write(**changes)
                    with self.assertRaises(ValueError): solution_language(official,folder)
            (folder/'language-contract.json').unlink()
            self.assertEqual(solution_language(official,folder),'Python')
            native={'id':2630,'officialUrl':'https://leetcode.com/problems/memoize-ii/','categories':['javascript']}
            with self.assertRaisesRegex(ValueError,'language-contract'): validate_language_sources(native,folder)

    def test_exception_registration_requires_evidence_and_parity_before_writing(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            shutil.copytree(ROOT/'leetcode',root/'leetcode')
            shutil.copy(ROOT/'CONCEPT-MAP.md',root/'CONCEPT-MAP.md')
            official=next(p for p in json.loads((root/'leetcode/catalog/hard-problems.json').read_text())['problems'] if p['id']==185)
            folder=root/'leetcode/185'; folder.mkdir(exist_ok=True)
            (folder/'index.html').write_text('<section id="step1"></section>')
            entry={'id':185,'path':'185/','title':{'en':official['title'],'zh':'薪水'},'desc':{'en':'Explore','zh':'探索'},
                   'difficulty':'hard','topics':[{'en':'Ranking','zh':'排名'}],'leetcodeUrl':official['officialUrl'],
                   'language':'MySQL','complexity':'O(n log n)',
                   'concepts':[{'name':'Ranking','step':1,'description':'Explore ties'}]}
            (folder/'lesson-entry.json').write_text(json.dumps(entry))
            contract={'problemId':185,'language':'MySQL','officialSource':official['officialUrl'],
                      'supportedLanguages':['MySQL'],'interface':'Employee and Department tables',
                      'rationale':'Synthetic fixture offers only SQL; not a real availability claim.',
                      'verifiedAt':'2026-10-18T00:00:00Z','verificationEvidence':'language-evidence.md'}
            (folder/'language-contract.json').write_text(json.dumps(contract))
            (folder/'solution.sql').write_text('SELECT 1;\n')
            (folder/'sql-code.js').write_text('window.SQL_SOURCE = '+json.dumps('SELECT 1;\n')+';')
            paths=[root/'leetcode/problems.config.js',root/'leetcode/index.html',root/'CONCEPT-MAP.md']
            before=[p.read_bytes() for p in paths]
            with self.assertRaisesRegex(ValueError,'verificationEvidence'): register(root,185)
            self.assertEqual(before,[p.read_bytes() for p in paths])
            (folder/'language-evidence.md').write_text('Synthetic official interface fixture.')
            register(root,185)
            self.assertEqual(next(p for p in read_registry(paths[0]) if p['id']==185)['language'],'MySQL')
            before=[p.read_bytes() for p in paths]
            (folder/'sql-code.js').write_text('window.SQL_SOURCE = "SELECT 2;";')
            with self.assertRaisesRegex(ValueError,'parity'): register(root,185)
            self.assertEqual(before,[p.read_bytes() for p in paths])

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
