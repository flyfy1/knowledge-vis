"""Frozen incident regression through real registration and readiness interfaces."""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from register_leetcode_lesson import register
import leetcode_campaign as campaign
from leetcode_registry import read_registry

ROOT = Path(__file__).resolve().parents[1]
# Exact metadata bytes from candidate 95b00b368bd13ed6e969821924e438415aab7db9.
FROZEN_METADATA = '''{
  "id": 115,
  "title": {
    "zh": "不同的子序列",
    "en": "Distinct Subsequences"
  },
  "desc": {
    "zh": "从三个位置组合推导子序列计数与倒序动态规划。",
    "en": "Derive subsequence counting and reverse DP from three choices of positions."
  },
  "difficulty": "hard",
  "topics": [
    {
      "zh": "动态规划",
      "en": "Dynamic programming"
    },
    {
      "zh": "字符串",
      "en": "Strings"
    }
  ],
  "path": "115/",
  "leetcodeUrl": "https://leetcode.com/problems/distinct-subsequences/",
  "language": "Python",
  "complexity": {
    "time": "O(mn) arithmetic operations",
    "space": "O(n) integer cells"
  },
  "concepts": [
    {
      "name": "Subsequence counting",
      "step": 1,
      "description": "Partition index selections into skipping or using the last source position."
    },
    {
      "name": "Reverse rolling DP",
      "step": 2,
      "description": "Keep the previous source-prefix row available during in-place updates."
    }
  ]
}
'''


def snapshot(root):
    return {str(p.relative_to(root)): (p.read_bytes() if p.is_file() else None, p.stat().st_mode)
            for p in root.rglob('*')}


class MetadataPreflightTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.folder = self.root / 'leetcode/115'
        self.folder.mkdir(parents=True)
        self.official = {'id': 115, 'categories': ['algorithms'],
                         'officialUrl': 'https://leetcode.com/problems/distinct-subsequences/'}
        (self.root / 'leetcode/catalog').mkdir()
        (self.root / 'leetcode/catalog/hard-problems.json').write_text(json.dumps({'problems': [self.official]}))
        (self.root / 'leetcode/problems.config.js').write_text('window.LEETCODE_PROBLEMS = [];\n')
        (self.root / 'leetcode/index.html').write_text('<script src="problems.config.js?v=old"></script>')
        (self.root / 'CONCEPT-MAP.md').write_text('# Concepts\n')
        for name in campaign.REQUIRED:
            (self.folder / name).write_text('Fixture')
        (self.folder / 'index.html').write_text('<section id="step1"></section><section id="step2"></section>')
        (self.folder / 'lesson-entry.json').write_text(FROZEN_METADATA)
        (self.root / 'scripts').mkdir()
        for name in ('register_leetcode_lesson.py', 'leetcode_registry.py'):
            shutil.copyfile(ROOT / 'scripts' / name, self.root / 'scripts' / name)
        (self.root / 'untracked-sentinel').write_bytes(b'Untracked bytes\x00')

    def valid_metadata(self):
        entry = json.loads(FROZEN_METADATA)
        entry['complexity'] = 'O(mn) arithmetic operations; O(n) integer cells'
        (self.folder / 'lesson-entry.json').write_text(json.dumps(entry))
        return entry

    def test_frozen_registration_rejects_complexity_before_writes(self):
        before = snapshot(self.root)
        with self.assertRaisesRegex(ValueError, 'complexity.*nonempty string'):
            register(self.root, 115)
        self.assertEqual(snapshot(self.root), before)

    def test_readiness_rejects_frozen_complexity(self):
        before = snapshot(self.root)
        with self.assertRaisesRegex(campaign.CampaignError, 'complexity.*nonempty string'):
            campaign.required_files(self.root, self.official, new=True)
        self.assertEqual(snapshot(self.root), before)

    def test_valid_string_registers_without_changing_metadata(self):
        entry = self.valid_metadata()
        before = snapshot(self.root)
        register(self.root, 115)
        self.assertEqual(next(p for p in read_registry(self.root / 'leetcode/problems.config.js') if p['id'] == 115)['complexity'], entry['complexity'])
        changed = {p for p in before if snapshot(self.root)[p] != before[p]}
        self.assertEqual(changed, {'leetcode/problems.config.js', 'leetcode/index.html', 'CONCEPT-MAP.md'})

    def test_positional_registration_cli_remains_compatible(self):
        self.valid_metadata()
        metadata = (self.folder / 'lesson-entry.json').read_bytes()
        result = subprocess.run([sys.executable, '-B', str(self.root / 'scripts/register_leetcode_lesson.py'),
                                 '115'], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(read_registry(self.root / 'leetcode/problems.config.js')[0]['id'], 115)
        self.assertEqual((self.folder / 'lesson-entry.json').read_bytes(), metadata)

    def test_preflight_interface_and_cli_are_read_only(self):
        from register_leetcode_lesson import validate_metadata
        for value in ({'time': 'O(mn)', 'space': 'O(n)'}, None, [], 1, True, '', '   ',
                      'O(mn) arithmetic operations; O(n) integer cells'):
            with self.subTest(complexity=value):
                entry = json.loads(FROZEN_METADATA)
                entry['complexity'] = value
                (self.folder / 'lesson-entry.json').write_text(json.dumps(entry))
                before = snapshot(self.root)
                if isinstance(value, str) and value.strip():
                    validate_metadata(self.root, 115)
                    campaign.required_files(self.root, self.official, new=True)
                    expected = 0
                else:
                    with self.assertRaisesRegex(ValueError, 'complexity.*nonempty string'):
                        validate_metadata(self.root, 115)
                    expected = 2
                # Deliberately omit -B: the safe CLI must itself suppress bytecode artifacts.
                environment = dict(os.environ)
                environment.pop('PYTHONDONTWRITEBYTECODE', None)
                result = subprocess.run([sys.executable, str(self.root / 'scripts/register_leetcode_lesson.py'),
                                         '115', '--validate-only', '--root', str(self.root)],
                                        capture_output=True, text=True, env=environment)
                self.assertEqual(result.returncode, expected, result.stderr)
                if expected:
                    self.assertIn('complexity', result.stderr)
                    self.assertNotIn('Traceback', result.stderr)
                self.assertEqual(snapshot(self.root), before)


if __name__ == '__main__':
    unittest.main()
