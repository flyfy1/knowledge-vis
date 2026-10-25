"""Pure builder contract: physical routes, byte parity and input immutability."""
import copy
import json
import re
import subprocess
import unittest
from leetcode_static_versions import codex_discovery, codex_registry, codex_runtime


class StaticVersionTests(unittest.TestCase):
    def setUp(self):
        self.files = {'leetcode/51/index.html': b'<h1>#51</h1><script src="app.js"></script>',
                      'leetcode/51/app.js': b'window.ready=true;\n',
                      'leetcode/51/solution.py': b'def solve():\n    return 42\n',
                      'leetcode/51/data/sample.json': b'{"value":3}',
                      'leetcode/51/images/board.png': b'\x89PNG\x00\xff'}

    def test_physical_copies_are_exact_and_numeric_assets_remain(self):
        original = copy.deepcopy(self.files)
        output = codex_runtime(51, self.files)
        for path, data in original.items():
            self.assertEqual(output[path.replace('/51/', '/51-codex/')], data)
            if not path.endswith('/index.html'):
                self.assertEqual(output[path], data)
        self.assertEqual(len(output), 2 * len(original))
        self.assertEqual(self.files, original)
        self.assertNotEqual(output['leetcode/51/index.html'], original['leetcode/51/index.html'])
        self.assertNotIn(b'<base', output['leetcode/51/index.html'])
        self.assertNotIn(b'http-equiv', output['leetcode/51/index.html'])
        self.assertIn('打开题目讲解', output['leetcode/51/index.html'].decode())
        self.assertIn(b'Open the lesson', output['leetcode/51/index.html'])

    def test_redirect_uses_replace_and_preserves_encoded_query_fragment(self):
        html = codex_runtime(51, self.files)['leetcode/51/index.html'].decode()
        script = re.search(r'<script>(.*?)</script>', html, re.S)[1]
        test = """const vm=require('vm'),script=JSON.parse(process.argv[1]);
        const results=[];
        for(const protocol of ['https:','file:']) {
          const location={protocol,search:'?next=%2Fevil&value=%E4%B8%AD',hash:'#step3',replace:s=>results.push(s)};
          vm.runInNewContext(script,{location});
        }
        process.stdout.write(JSON.stringify(results));"""
        values = json.loads(subprocess.check_output(['node', '-e', test, json.dumps(script)]))
        self.assertEqual(values, ['../51-codex/?next=%2Fevil&value=%E4%B8%AD#step3',
                                 '../51-codex/index.html?next=%2Fevil&value=%E4%B8%AD#step3'])

    def test_registry_only_changes_exact_path_and_is_idempotent(self):
        entries = [{'id': 51, 'path': '51/', 'title': {'zh': '皇后', 'en': 'Queens'},
                    'leetcodeUrl': 'https://leetcode.com/problems/n-queens/'}]
        frozen = copy.deepcopy(entries)
        result = codex_registry(entries)
        expected = copy.deepcopy(entries)
        expected[0]['path'] = '51-codex/'
        self.assertEqual(result, expected)
        self.assertEqual(codex_registry(result), result)
        result[0]['title']['en'] = 'Changed result'
        self.assertEqual(entries, frozen)

    def test_discovery_uses_sibling_registry_and_keeps_other_bytes(self):
        original = b'<script src="problems.config.js?v=123"></script><script>fetch("leetcode/problems.config.js")</script> my-problems.config.js'
        result = codex_discovery(original)
        self.assertEqual(result, b'<script src="problems.codex.config.js?v=123"></script><script>fetch("leetcode/problems.codex.config.js")</script> my-problems.config.js')
        self.assertEqual(codex_discovery(result), result)
        self.assertIn(b'problems.config.js?v=123', original)
        with self.assertRaises(ValueError):
            codex_discovery('text instead of bytes')

    def test_unsafe_mismatched_and_duplicate_registry_routes_rejected(self):
        for pid, path in [(51, '52/'), (51, '51-claude/'), (51, '../51/'), (51, '/51/'),
                          (51, '51/?x=1'), ('051', '051/'), (True, 'True/')]:
            with self.subTest(pid=pid, path=path), self.assertRaises(ValueError):
                codex_registry([{'id': pid, 'path': path}])
        with self.assertRaises(ValueError):
            codex_registry([{'id': 51, 'path': '51/'}, {'id': '51', 'path': '51-codex/'}])

    def test_builder_rejects_unsafe_nonruntime_and_foreign_input(self):
        paths = ['leetcode/51/../52/app.js', 'leetcode/51/a//b.js', 'leetcode/51/./x.js',
                 'leetcode/51/x.js?token=a', 'leetcode/51/%2e%2e/x.js', 'leetcode/51/x\\y.js',
                 'leetcode/51/tests/a.json', 'leetcode/51/official-evidence.json',
                 'leetcode/51/BRIEF.md', 'leetcode/51/lesson-entry.json',
                 'leetcode/51/language-contract.json', 'leetcode/52/app.js',
                 'leetcode/51-codex/app.js', '/leetcode/51/a.js', 'leetcode/51/APP.js']
        for path in paths:
            with self.subTest(path=path), self.assertRaises(ValueError):
                codex_runtime(51, {**self.files, path: b'unexpected'})
        for pid in (0, -1, True, '051', '51/../../', 51.0):
            with self.subTest(pid=pid), self.assertRaises(ValueError):
                codex_runtime(pid, self.files)
        with self.assertRaises(ValueError):
            codex_runtime(51, {'leetcode/51/index.html': b'only index'})
        with self.assertRaises(ValueError):
            codex_runtime(51, {**self.files, 'leetcode/51/wrong.js': 'not bytes'})


if __name__ == '__main__':
    unittest.main()
