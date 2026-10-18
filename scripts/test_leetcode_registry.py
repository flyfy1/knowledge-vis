import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path
from leetcode_registry import read_registry, merge_registry
from register_leetcode_lesson import register

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

if __name__=='__main__': unittest.main()
