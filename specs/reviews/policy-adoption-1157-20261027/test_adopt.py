import contextlib
import copy
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import types
import unittest
from unittest.mock import patch

sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location('adopt', Path(__file__).with_name('adopt.py'))
a = importlib.util.module_from_spec(spec)
spec.loader.exec_module(a)


def fixture():
    queue = ['1157'] + [str(i) for i in range(2000, 2983)]
    review = dict(run_id='review-one', candidate='candidate', commit='head', outcome='accepted',
                  required_open=[], evidence=['actual'], scores=[4] * 6, report_path='report.md')
    run = dict(id='review-one', role='review', problem_id='1157', candidate='candidate',
               status='completed', session_ids=['review-session'])
    state = dict(status='stopped', expected_head='head', queue=queue, runs=[run],
                 problems={'1157': dict(status='review_passed', phase='register', reviews=[review],
                                       candidate='candidate', author_runs=[])})
    pins = dict(queue=queue, queue_sha256=a.sha(json.dumps(queue, separators=(',', ':')).encode()),
                boundary=dict(head='head', review=copy.deepcopy(review), run=copy.deepcopy(run)))
    return state, pins


class Guards(unittest.TestCase):
    def test_real_boundary_accepts(self):
        a.boundary_valid(*fixture())

    def test_pending_and_changed_review_refuse(self):
        for change in ('pending', 'candidate', 'outcome', 'run', 'queue', 'head', 'score', 'session'):
            with self.subTest(change=change):
                s, p = fixture()
                if change == 'pending': p['boundary'] = None
                if change == 'candidate': s['problems']['1157']['candidate'] = 'different'
                if change == 'outcome': s['problems']['1157'].update(status='changes_required', phase='fix')
                if change == 'run': s['runs'][0]['status'] = 'running'
                if change == 'queue': s['queue'] = list(reversed(s['queue']))
                if change == 'head': s['expected_head'] = 'different'
                if change == 'score':
                    s['problems']['1157']['reviews'][0]['scores'] = [2] * 6
                    p['boundary']['review'] = copy.deepcopy(s['problems']['1157']['reviews'][0])
                if change == 'session':
                    s['problems']['1157']['author_runs'] = ['author']
                    s['runs'].append(dict(id='author', status='completed', session_ids=['review-session']))
                with self.assertRaises(RuntimeError): a.boundary_valid(s, p)

    def test_changed_runtime_not_executed(self):
        with tempfile.TemporaryDirectory() as d:
            p = Path(d); (p/'evil.py').write_text("raise AssertionError('executed')")
            with self.assertRaisesRegex(RuntimeError, 'drift'):
                a.load_runtime(p, {'runtime_hashes': {'evil.py': 'wrong'}})

    def test_cli_disabled_before_any_mutation(self):
        with tempfile.TemporaryDirectory() as d:
            p = Path(d)/'pins.json'; p.write_text('{}')
            before = list(Path(d).iterdir())
            result = subprocess.run([sys.executable, str(Path(a.__file__)), '--pins', str(p),
                                     '--dispatch', a.DISPATCH], capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('Disabled', result.stderr)
            self.assertEqual(before, list(Path(d).iterdir()))

    def test_publication_bound_actual_digests_and_register(self):
        publisher = types.SimpleNamespace(_reviewed=lambda *args: {str(i): {'digest': str(i)} for i in range(19)})
        registry = types.SimpleNamespace(read_registry=lambda path: [])
        s = {'queue': [], 'problems': {}}
        with patch.dict(sys.modules, leetcode_publish=publisher, leetcode_registry=registry), patch.object(a, 'git', return_value=b'head'):
            with self.assertRaisesRegex(RuntimeError, 'threshold'):
                a.publication_bound(Path('/unused'), s, {'pending': None, 'released': {}})
            publisher._reviewed = lambda *args: {'a': {'digest': 'same'}}
            with self.assertRaisesRegex(RuntimeError, 'refresh'):
                a.publication_bound(Path('/unused'), s, {'pending': None, 'released': {'a': {'digest': 'same'}}})
            with self.assertRaisesRegex(RuntimeError, 'progress'):
                a.publication_bound(Path('/unused'), s, {'pending': {'id': 'release'}, 'released': {}})

    def test_transaction_exact_tree_state_and_failure_preservation(self):
        for fail in (False, True):
            with self.subTest(fail=fail), tempfile.TemporaryDirectory() as d:
                root = Path(d); repo = root/'repo'; directory = root/'state'
                repo.mkdir(); directory.mkdir()
                subprocess.run(['git', 'init', '-q', str(repo)], check=True)
                for key, value in [('user.name', 'Fixture'), ('user.email', 'fixture@example.invalid')]:
                    a.git(repo, 'config', key, value)
                payload = {p: b'new\n' for p in a.PATHS}
                for path in a.PATHS:
                    (repo/path).parent.mkdir(parents=True, exist_ok=True); (repo/path).write_bytes(b'old\n')
                (repo/'untouched').write_text('keep')
                a.git(repo, 'add', '.'); a.git(repo, 'commit', '-m', 'base')
                state = {'expected_head': a.git(repo, 'rev-parse', 'HEAD').decode(),
                         'problems': {'1157': {'candidate': 'frozen'}}, 'runs': [{'id': 'original'}], 'queue': ['1157']}
                raw = json.dumps(state).encode(); ledger = b'{"pending":null}'; stop = b'owned STOP'
                for name, data in [('progress.json', raw), ('releases.json', ledger), ('STOP', stop)]:
                    (directory/name).write_bytes(data)
                def tree(r, rev):
                    return {line.split(b'\t')[1].decode(): line.split(b'\t')[0].decode()
                            for line in a.git(r, 'ls-tree', '-r', rev).splitlines()}
                def changes(r):
                    return set(a.git(r, 'diff', '--name-only', 'HEAD').decode().splitlines())
                helper = types.SimpleNamespace(ownership=lambda *x: contextlib.nullcontext(), tree=tree, changed_paths=changes)
                pins = dict(repo=str(repo), state_dir=str(directory))
                pre = (helper, state, raw, ledger, stop, payload, {'upper_bound': 1})
                if fail:
                    hook = repo/'.git/hooks/pre-commit'; hook.write_text('#!/bin/sh\nexit 1\n'); hook.chmod(0o755)
                with patch.object(a, 'preflight', return_value=pre):
                    if fail:
                        with self.assertRaises(subprocess.CalledProcessError): a.adopt(pins)
                    else:
                        result = a.adopt(pins)
                        message = a.git(repo, 'show', '-s', '--format=%B', result['head']).decode()
                        self.assertIn('Built-By: Codex; exact model unavailable; guarded two-file adoption operator', message.splitlines())
                        after = json.loads((directory/'progress.json').read_bytes())
                        expected = copy.deepcopy(state); expected['expected_head'] = result['head']
                        self.assertEqual(after, expected)
                        self.assertEqual(set(p for p in tree(repo, result['head']) if tree(repo, result['head'])[p] != tree(repo, state['expected_head'])[p]), a.PATHS)
                self.assertEqual((directory/'STOP').read_bytes(), stop)
                self.assertEqual((directory/'releases.json').read_bytes(), ledger)
                self.assertEqual((directory/(a.OWNER+'-before')/'progress.json').read_bytes(), raw)
                receipt = json.loads((directory/(a.OWNER+'.json')).read_bytes())
                self.assertEqual(receipt['status'], 'failed-inspect-no-retry' if fail else 'adopted-stopped-awaiting-root')
                if fail: self.assertEqual((directory/'progress.json').read_bytes(), raw)
                with patch.object(a, 'preflight', return_value=pre), self.assertRaises(FileExistsError): a.adopt(pins)


if __name__ == '__main__':
    unittest.main()
