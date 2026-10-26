import copy
import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('adopt', HERE / 'adopt.py')
a = importlib.util.module_from_spec(spec); spec.loader.exec_module(a)


class AdoptionTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name).resolve(); self.repo = self.root / 'repo'; self.repo.mkdir(); self.state = self.root / 'state'; self.state.mkdir(); self.archive = self.state / 'archive'
        self.g('init', '-q'); self.g('config', 'user.email', 'fixture@example.test'); self.g('config', 'user.name', 'Fixture'); self.g('checkout', '-qb', 'codex/fixture')
        for name in a.PROTECTED:
            self.put('leetcode/1092/' + name, b'protected ' + name.encode())
        self.put('leetcode/1092/style.css', b'old style'); self.put('scripts/policy.py', b'# fixture policy\n')
        self.g('add', '.'); self.g('commit', '-qm', 'base'); self.base = self.g('rev-parse', 'HEAD').strip()
        self.put('leetcode/1092/style.css', b'new style'); self.put('leetcode/1092/tests/new.cjs', b'new test')
        self.g('add', '.'); self.g('commit', '-qm', 'candidate'); self.candidate = self.g('rev-parse', 'HEAD').strip()
        self.put(a.REVIEW_PATH, ('Approved exact candidate ' + self.candidate).encode()); self.put(a.PROVENANCE_PATH, b'Honest attribution')
        self.g('add', '.'); self.g('commit', '-qm', 'review'); self.review = self.g('rev-parse', 'HEAD').strip()
        self.g('checkout', '-q', self.base)
        self.addCleanup(patch.stopall); patch.object(a, 'BASE', self.base).start(); patch.object(a, 'CANDIDATE', self.candidate).start()
        self.old, self.new, self.final = (a.tree(self.repo, x) for x in (self.base, self.candidate, self.review))
        protected = {p: a.sha((self.repo / 'leetcode/1092' / p).read_bytes()) for p in a.PROTECTED}
        self.manifest = {'base': self.base, 'candidate': self.candidate, 'files': self.manifest_files(self.candidate), 'protected': protected}
        state = {'status': 'failed', 'expected_head': self.base, 'current': {'run_id': a.FAILED}, 'queue': [str(x) for x in range(984)], 'problems': {'1092': {'status': 'changes_required', 'phase': 'fix', 'rounds': 1, 'reviews': [{'required_open': ['1092-R1']}], 'candidate': self.base}, '42': {'status': 'accepted_local'}}, 'runs': [{'id': a.FAILED, 'status': 'failed'}], 'error': 'capacity', 'maintenance': ['original']}
        self.raw = json.dumps(state).encode(); self.ledger = b'{"released":{"42":{}},"pending":null}'
        (self.state / 'progress.json').write_bytes(self.raw); (self.state / 'releases.json').write_bytes(self.ledger); (self.state / 'launch.py').write_bytes(b'# unchanged launcher')
        quarantine = {}
        for n in range(19):
            rel = f'leetcode/1092/tests/partial/{n}.txt'; self.put(rel, str(n).encode()); quarantine[rel] = a.sha(str(n).encode())
        rt = {'state_sha256': a.sha(self.raw), 'ledger_sha256': a.sha(self.ledger), 'queue_sha256': a.sha(json.dumps(state['queue'], separators=(',', ':')).encode()), 'quarantine': quarantine, 'policy': {'scripts/policy.py': a.sha(b'# fixture policy\n')}, 'launcher_sha256': a.sha(b'# unchanged launcher'), 'run_files': {}, 'reservations': {}}
        self.pins = {'runtime': rt, 'review': {'candidate': self.candidate, 'revision': self.review, 'ref': 'refs/heads/codex/leetcode-1092-header-fit', 'report_path': a.REVIEW_PATH, 'report_sha256': a.sha(self.blob(self.review, a.REVIEW_PATH)), 'evidence_sha256': {a.PROVENANCE_PATH: a.sha(self.blob(self.review, a.PROVENANCE_PATH))}}, 'payload_manifest': {'revision': self.review, 'files': self.manifest_files(self.review)}}
        real_git = a.git
        def wrapped(repo, *args):
            return (self.review + '\t' + self.pins['review']['ref']).encode() if args[0] == 'ls-remote' else real_git(repo, *args)
        patch.object(a, 'git', wrapped).start()

    def g(self, *args):
        return subprocess.check_output(['git', '-C', str(self.repo), *args], stderr=subprocess.DEVNULL).decode()

    def put(self, rel, data):
        p = self.repo / rel; p.parent.mkdir(parents=True, exist_ok=True); p.write_bytes(data)

    def blob(self, ref, rel):
        return a.git(self.repo, 'show', ref + ':' + rel)

    def manifest_files(self, ref):
        old, new = a.tree(self.repo, self.base), a.tree(self.repo, ref)
        return {p: {'before': old.get(p), 'after': new.get(p), 'before_sha256': a.sha(self.blob(self.base, p)) if p in old else None, 'after_sha256': a.sha(self.blob(ref, p))} for p in sorted(old.keys() | new.keys()) if old.get(p) != new.get(p)}

    def guard(self):
        return a.snapshot_guard(self.repo, self.state, self.pins)

    def adopt(self):
        raw, ledger = self.guard(); old, final, payload = a.validate_source(self.repo, self.pins, self.manifest)
        return a.transaction(self.repo, self.state, self.archive, self.pins, self.manifest, old, final, payload, raw, ledger, [str(x) for x in range(19)])

    def test_disabled_cli_and_missing_review(self):
        r = subprocess.run(['python3', '-B', str(HERE / 'adopt.py'), '--dispatch', a.TOKEN, '--pins', str(HERE / 'pending-pins.json'), '--candidate-manifest', str(HERE / 'candidate-manifest.json')], capture_output=True, text=True)
        self.assertNotEqual(r.returncode, 0); self.assertIn('Disabled pending', r.stderr)
        pins = {'status': 'frozen-reviewed-adoption', 'base': self.base, 'candidate': self.candidate, 'review': None}
        with self.assertRaisesRegex(RuntimeError, 'Review missing'): a.ready(pins, {})

    def test_wrong_head(self):
        self.g('checkout', '-q', self.candidate)
        with self.assertRaisesRegex(RuntimeError, 'Wrong HEAD'): self.guard()

    def test_changed_state(self):
        (self.state / 'progress.json').write_bytes(self.raw + b'\n')
        with self.assertRaisesRegex(RuntimeError, 'State changed'): self.guard()

    def test_changed_ledger(self):
        (self.state / 'releases.json').write_bytes(b'{"pending":{}}')
        with self.assertRaisesRegex(RuntimeError, 'Ledger changed'): self.guard()

    def test_untracked_hash(self):
        self.put(next(iter(self.pins['runtime']['quarantine'])), b'drift')
        with self.assertRaisesRegex(RuntimeError, 'Untracked hash'): self.guard()

    def test_extra_path_and_stop(self):
        self.put('extra.txt', b'x')
        with self.assertRaisesRegex(RuntimeError, 'Dirty paths'): self.guard()
        (self.repo / 'extra.txt').unlink(); (self.state / 'STOP').write_bytes(b'owner')
        with self.assertRaisesRegex(RuntimeError, 'Unexpected STOP'): self.guard()

    def test_protected_hash(self):
        self.manifest['protected']['app.js'] = '0' * 64
        with self.assertRaisesRegex(RuntimeError, 'Protected source'): a.validate_source(self.repo, self.pins, self.manifest)

    def test_review_hash(self):
        self.pins['review']['report_sha256'] = '0' * 64
        with self.assertRaisesRegex(RuntimeError, 'Review report'): a.validate_source(self.repo, self.pins, self.manifest)

    def test_manifest_missing_addition_and_mode(self):
        path = 'leetcode/1092/tests/new.cjs'; item = self.pins['payload_manifest']['files'].pop(path)
        with self.assertRaisesRegex(RuntimeError, 'full changed-path'): a.validate_source(self.repo, self.pins, self.manifest)
        self.pins['payload_manifest']['files'][path] = item; item['after'] = dict(item['after'], mode='100755')
        with self.assertRaisesRegex(RuntimeError, 'blob/mode'): a.validate_source(self.repo, self.pins, self.manifest)

    def test_complete_transaction_preserves_history_and_quarantine(self):
        result = self.adopt(); self.assertEqual(result['status'], 'completed-adopted-no-launch')
        after = json.loads((self.state / 'progress.json').read_bytes()); before = json.loads(self.raw); before['expected_head'] = result['adopted_head']; self.assertEqual(before, after)
        self.assertEqual((self.state / 'releases.json').read_bytes(), self.ledger); self.assertEqual(a.tree(self.repo, 'HEAD'), self.final)
        self.assertEqual(self.g('status', '--porcelain'), '')
        for path, digest in self.pins['runtime']['quarantine'].items(): self.assertEqual(a.sha((self.archive / 'partial-fix' / path).read_bytes()), digest)
        with self.assertRaisesRegex(RuntimeError, 'Archive already exists'):
            a.transaction(self.repo, self.state, self.archive, self.pins, self.manifest, self.old, self.final, {}, self.raw, self.ledger, [])

    def test_copy_failure_removes_no_originals(self):
        original = a.durable
        def fail(path, data, replace=False):
            if str(path).endswith('/1.txt'): raise OSError('injected disk failure')
            return original(path, data, replace)
        with patch.object(a, 'durable', fail), self.assertRaisesRegex(OSError, 'disk failure'): self.adopt()
        self.assertTrue(all((self.repo / p).exists() for p in self.pins['runtime']['quarantine']))
        self.assertEqual(json.loads((self.archive / 'receipt.json').read_bytes())['status'], 'failed-inspect-no-retry')

    def test_commit_hook_failure_retains_partial_payload_and_original_state(self):
        hook = self.repo / '.git/hooks/pre-commit'; hook.write_text('#!/bin/sh\nexit 1\n'); hook.chmod(0o755)
        with self.assertRaises(subprocess.CalledProcessError): self.adopt()
        self.assertEqual((self.state / 'progress.json').read_bytes(), self.raw)
        self.assertEqual(self.g('rev-parse', 'HEAD').strip(), self.base)
        self.assertEqual(len(json.loads((self.archive / 'quarantine-map.json').read_bytes())), 19)
        self.assertTrue(self.g('status', '--porcelain')); self.assertEqual(json.loads((self.archive / 'receipt.json').read_bytes())['status'], 'failed-inspect-no-retry')

    def test_checkpoint_failure_retains_commit_and_before_state(self):
        original = a.write_json
        def fail(path, value, replace=False):
            if path == self.state / 'progress.json': raise OSError('checkpoint denied')
            return original(path, value, replace)
        with patch.object(a, 'write_json', fail), self.assertRaisesRegex(OSError, 'checkpoint denied'): self.adopt()
        self.assertNotEqual(self.g('rev-parse', 'HEAD').strip(), self.base)
        self.assertEqual((self.state / 'progress.json').read_bytes(), self.raw)
        r = json.loads((self.archive / 'receipt.json').read_bytes()); self.assertEqual(r['status'], 'failed-inspect-no-retry'); self.assertIn('adopted_head', r)


if __name__ == '__main__':
    unittest.main()
