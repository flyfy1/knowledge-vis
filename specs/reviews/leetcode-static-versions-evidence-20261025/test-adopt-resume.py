"""Pure local guard tests. Never call main, SSH, Git, the launcher or the queue."""
import copy
import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location('static_adoption', Path(__file__).with_name('adopt-resume.py'))
adoption = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(adoption)


class GuardTests(unittest.TestCase):
    def receipt(self):
        return {'status': 'public-verified', 'public_base': 'https://visual.integ.life',
                'source_revision': adoption.PAYLOAD, 'policy_source_revision': adoption.SOURCE,
                'manifest_sha256': adoption.MANIFEST, 'files_verified': 1717, 'lessons_verified': 120,
                'browser_exit_code': 0, 'root_workflow_status': 'pass',
                'verified_at': '2026-10-25T12:00:00+00:00',
                'evidence_sha256': {key: 'a' * 64 for key in ('http', 'browser', 'homepage', 'in_app')}}

    def test_public_receipt_requires_complete_exact_verified_payload(self):
        good = self.receipt()
        adoption.validate_public(good)
        variants = [dict(good, status='pending'), dict(good, files_verified=1716),
                    dict(good, browser_exit_code=False), dict(good, policy_source_revision='x' * 40),
                    dict(good, evidence_sha256={'http': 'a' * 64}),
                    dict(good, verified_at='2026-10-25T12:00:00')]
        for value in variants:
            with self.subTest(value=value), self.assertRaises((RuntimeError, ValueError)):
                adoption.validate_public(value)

    def test_launcher_replacement_is_exact_and_preserves_every_other_byte(self):
        original = (b'import sys\nargs=["--publish-every","100"]\n'
                    b'if "--max-rounds" in sys.argv:\n    args += ["--max-rounds", "6"]\n')
        with patch.object(adoption, 'OLD_LAUNCHER', adoption.sha(original)):
            updated = adoption.rewrite_launcher(original)
            self.assertEqual(updated.replace(b'"--publish-every","20"', b'"--publish-every","100"'), original)
            with self.assertRaises(RuntimeError):
                adoption.rewrite_launcher(original + b'# concurrent change\n')
        duplicate = original.replace(b'args=[', b'args=["--publish-every","100",')
        with patch.object(adoption, 'OLD_LAUNCHER', adoption.sha(duplicate)), self.assertRaises(RuntimeError):
            adoption.rewrite_launcher(duplicate)

    def test_checkpoint_cannot_change_problem_evidence_or_status(self):
        before = {'expected_head': 'old', 'status': 'run_limit_reached', 'current': None,
                  'queue': ['793'], 'runs': [{'id': 'real-review-run'}],
                  'problems': {'51': {'status': 'accepted_local', 'candidate': 'immutable'}}}
        good = copy.deepcopy(before)
        good['expected_head'] = 'new'
        adoption.only_expected_head_changed(before, good, 'new')
        for key, value in (('status', 'running'), ('queue', []), ('runs', []), ('problems', {})):
            bad = copy.deepcopy(good)
            bad[key] = value
            with self.subTest(key=key), self.assertRaises(RuntimeError):
                adoption.only_expected_head_changed(before, bad, 'new')

    def test_allowlist_contains_root_but_no_lesson_registry_or_historical_reviews(self):
        self.assertEqual(len(adoption.ALLOWLIST), 13)
        self.assertIn('index.html', adoption.ALLOWLIST)
        self.assertFalse(any(path.startswith(('leetcode/', 'specs/reviews/')) for path in adoption.ALLOWLIST))
        self.assertNotIn('CONCEPT-MAP.md', adoption.ALLOWLIST)

    def test_atomic_receipt_preserves_json_without_extra_fields(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / 'checkpoint.json'
            value = {'expected_head': 'new', 'status': 'run_limit_reached'}
            adoption.save(target, value)
            import json
            self.assertEqual(json.loads(target.read_text()), value)
            self.assertEqual([path.name for path in Path(folder).iterdir()], ['checkpoint.json'])


if __name__ == '__main__':
    unittest.main()
