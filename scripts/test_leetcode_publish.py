#!/usr/bin/env python3
"""Disposable Git and publication roots exercise the same publisher interface."""
import copy
import functools
import http.server
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import threading
import unittest
from unittest.mock import patch

import leetcode_publish as publisher
from leetcode_registry import read_registry


class PublishTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        self.repo, self.root, self.state_dir = (self.base / name for name in ('repo', 'production', 'state'))
        self.repo.mkdir()
        self.root.mkdir()
        self.git('init', '-b', 'codex/test-publish')
        self.git('config', 'user.email', 'test@example.invalid')
        self.git('config', 'user.name', 'Test')
        self.ids = [4, 51, 52] + list(range(1000, 1101))
        self.entries = {str(pid): {'id': pid, 'path': f'{pid}/', 'difficulty': 'hard',
                        'leetcodeUrl': f'https://leetcode.com/problems/problem-{pid}/',
                        'title': {'zh': f'题目 {pid}', 'en': f'Problem {pid}'},
                        'desc': {'zh': '讲解', 'en': 'Lesson'}, 'language': 'Python'} for pid in self.ids}
        self.write('leetcode/catalog/hard-problems.json', json.dumps({'problems': [
            {'id': pid, 'officialUrl': self.entries[str(pid)]['leetcodeUrl']} for pid in self.ids]}))
        self.write('leetcode/common.js', 'window.shared = true;')
        self.write('leetcode/index.html', '<script src="common.js"></script><script src="problems.config.js?v=baseline"></script>')
        self.registry([4, 51, 52])
        for pid in (4, 51, 52):
            self.lesson(pid)
        self.baseline = self.commit('Previously public baseline')
        shutil.copytree(self.repo / 'leetcode', self.root / 'leetcode')
        # Existing production has completed the independently verified static
        # migration; canonical registry bytes and acceptance digests stay numeric.
        for pid in (4, 51, 52):
            for path, data in publisher.codex_runtime(pid, publisher._lesson(self.repo, self.baseline, str(pid))).items():
                target = self.root / path
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(data)
        (self.root / 'unrelated.html').write_text('Keep this page')
        self.state = {'expected_head': self.baseline, 'queue': list(map(str, self.ids)), 'problems': {}, 'runs': []}

    def git(self, *args):
        return subprocess.check_output(['git', *args], cwd=self.repo, stderr=subprocess.DEVNULL).decode().strip()

    def write(self, relative, value):
        path = self.repo / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(value)

    def commit(self, message):
        self.git('add', '.')
        self.git('commit', '--allow-empty', '-m', message)
        return self.git('rev-parse', 'HEAD')

    def registry(self, ids):
        self.write('leetcode/problems.config.js', 'window.LEETCODE_PROBLEMS = ' + json.dumps([self.entries[str(pid)] for pid in ids]) + ';')

    def lesson(self, pid):
        self.write(f'leetcode/{pid}/index.html', f'<h1>#{pid}</h1><script src="app.js"></script><script src="../common.js"></script>')
        self.write(f'leetcode/{pid}/app.js', 'window.ready = true;')
        self.write(f'leetcode/{pid}/solution.py', 'print("example")\n')
        self.write(f'leetcode/{pid}/tests/private.json', '{"test": true}')
        self.write(f'leetcode/{pid}/BRIEF.md', 'Author brief')

    def accept(self, ids):
        for pid in ids:
            self.lesson(pid)
        self.registry(sorted({4, 51, 52, *ids}))
        candidate = self.commit('Candidate lessons')
        for pid in ids:
            self.write(f'specs/reviews/{pid}-review.md', f'Independent review {pid}')
        review_commit = self.commit('Independent review evidence')
        for pid in map(str, ids):
            run_id = f'{pid}-review'
            self.state['runs'].append({'id': run_id, 'role': 'review', 'problem_id': pid,
                'candidate': candidate, 'session_ids': [f'fresh-{pid}'], 'status': 'completed'})
            review = {'outcome': 'accepted', 'scores': [4] * 6, 'required_open': [],
                'evidence': ['Fresh oracle and browser walkthrough'], 'run_id': run_id,
                'candidate': candidate, 'commit': review_commit, 'report_path': f'specs/reviews/{pid}-review.md'}
            self.state['problems'][pid] = {'status': 'accepted_local', 'candidate': candidate,
                'reviews': [review], 'author_runs': [f'{pid}-author']}
        self.state['expected_head'] = review_commit

    def publish(self, **kwargs):
        return publisher.maybe_publish(self.repo, self.state, self.state_dir, self.root,
            'https://example.invalid', baseline_revision=self.baseline, **kwargs)

    def ledger(self):
        return json.loads((self.state_dir / 'releases.json').read_text())

    def test_default_batch_waits_at_19_and_publishes_20(self):
        self.accept(range(1000, 1020))
        self.state['problems']['1019']['status'] = 'review_pending'
        with patch.object(publisher, '_verify_public', return_value={'testAdapter': True}) as verify:
            self.assertEqual(self.publish()['accepted_unreleased'], 19)
            verify.assert_not_called()
            self.state['problems']['1019']['status'] = 'accepted_local'
            self.assertEqual(len(self.publish()['ids']), 20)
            verify.assert_called_once()

    def test_99_wait_100_publish_unique_and_preserve_legacy(self):
        self.accept(range(1000, 1100))
        self.state['problems']['1099']['status'] = 'review_pending'
        original = copy.deepcopy(self.state)
        with patch.object(publisher, '_verify_public', return_value={'testAdapter': True}) as verify:
            self.assertEqual(self.publish(batch_size=100)['accepted_unreleased'], 99)
            verify.assert_not_called()
            self.state['problems']['1099']['status'] = 'accepted_local'
            result = self.publish(batch_size=100)
            self.assertEqual(len(result['ids']), 100)
            verify.assert_called_once()
            self.assertEqual(self.publish(batch_size=100)['accepted_unreleased'], 0)
        self.assertEqual((self.root / 'unrelated.html').read_text(), 'Keep this page')
        self.assertEqual({entry['id'] for entry in read_registry(self.root / 'leetcode/problems.config.js')}, {4, 51, 52, *range(1000, 1100)})
        self.assertFalse((self.root / 'leetcode/1000/tests').exists())
        self.assertFalse((self.root / 'leetcode/1000/BRIEF.md').exists())
        self.assertFalse(list(self.state_dir.glob('release-stage-*')))
        self.assertFalse(list(self.root.rglob('*backup*')))
        original['problems']['1099']['status'] = 'accepted_local'
        self.assertEqual(self.state, original, 'Publisher must not mutate campaign state')

    def test_new_release_has_physical_versions_dual_registry_and_original_acceptance(self):
        self.accept([1000])
        source = publisher._lesson(self.repo, self.state['expected_head'], '1000')
        original_registry = (self.repo / 'leetcode/problems.config.js').read_bytes()
        expected_digest = publisher._fingerprint(source, self.entries['1000'])
        with patch.object(publisher, '_verify_public', return_value={'testAdapter': True}) as verify:
            self.publish(batch_size=1)
        for path, data in source.items():
            self.assertEqual((self.root / path.replace('/1000/', '/1000-codex/')).read_bytes(), data)
            if not path.endswith('/index.html'):
                self.assertEqual((self.root / path).read_bytes(), data)
        self.assertIn(b'location.replace', (self.root / 'leetcode/1000/index.html').read_bytes())
        canonical = read_registry(self.root / 'leetcode/problems.config.js')
        generated = read_registry(self.root / 'leetcode/problems.codex.config.js')
        self.assertTrue(all(row['path'] == f"{row['id']}/" for row in canonical))
        self.assertEqual(generated, publisher.codex_registry(canonical))
        self.assertIn('problems.codex.config.js?v=', (self.root / 'leetcode/index.html').read_text())
        derived_hash = publisher._sha((self.root / 'leetcode/problems.codex.config.js').read_bytes())[:12]
        self.assertIn(derived_hash, (self.root / 'leetcode/index.html').read_text())
        self.assertEqual(verify.call_args.args[2][0]['path'], '1000-codex/')
        self.assertEqual(self.ledger()['released']['1000']['digest'], expected_digest)
        self.assertEqual((self.repo / 'leetcode/problems.config.js').read_bytes(), original_registry)
        self.assertEqual(publisher._lesson(self.repo, self.state['expected_head'], '1000'), source)

    def test_version_assets_precede_redirects_and_discovery(self):
        self.accept([1000])
        actual_replace = publisher.os.replace
        replaced = []
        def observed(source, destination):
            if Path(destination).resolve().is_relative_to(self.root.resolve()):
                replaced.append(Path(destination).resolve().relative_to(self.root.resolve()).as_posix())
            return actual_replace(source, destination)
        with patch.object(publisher, '_verify_public', return_value={'testAdapter': True}), patch.object(publisher.os, 'replace', side_effect=observed):
            self.publish(batch_size=1)
        redirect = replaced.index('leetcode/1000/index.html')
        self.assertTrue(all(index < redirect for index, path in enumerate(replaced) if path.startswith('leetcode/1000-codex/')))
        self.assertLess(redirect, replaced.index('leetcode/problems.config.js'))
        self.assertLess(redirect, replaced.index('leetcode/problems.codex.config.js'))
        self.assertEqual(replaced[-1], 'leetcode/index.html')

    def test_historical_pending_replays_numeric_bytes_without_regeneration(self):
        self.accept([1000])
        self.publish()  # Establish a ledger; fewer than20 remains unpublished.
        ledger = self.ledger()
        source = publisher._lesson(self.repo, self.state['expected_head'], '1000')
        payload = {**source, 'leetcode/problems.config.js': (self.repo / 'leetcode/problems.config.js').read_bytes(),
                   'leetcode/index.html': (self.repo / 'leetcode/index.html').read_bytes()}
        stage = self.state_dir / ('release-stage-' + 'b' * 32)
        for path, data in payload.items():
            target = stage / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
        ledger['pending'] = {'id': 'b' * 32, 'revision': self.state['expected_head'], 'stage': stage.name,
            'files': {path: publisher._sha(data) for path, data in payload.items()},
            'entries': [copy.deepcopy(self.entries['1000'])],
            'accepted': {'1000': {'candidate': self.state['problems']['1000']['candidate'],
                                  'digest': publisher._fingerprint(source, self.entries['1000']),
                                  'review': 'specs/reviews/1000-review.md'}}}
        (self.state_dir / 'releases.json').write_text(json.dumps(ledger))
        with patch.object(publisher, '_verify_public', return_value={'testAdapter': True}) as verify:
            self.assertEqual(self.publish()['status'], 'published')
        self.assertEqual((self.root / 'leetcode/1000/index.html').read_bytes(), source['leetcode/1000/index.html'])
        self.assertFalse((self.root / 'leetcode/1000-codex').exists())
        self.assertEqual(verify.call_args.args[2][0]['path'], '1000/')
        self.assertNotIn('route_layout', self.ledger()['releases'][-1])

    def test_missing_prior_static_migration_cannot_advertise_nonexistent_versions(self):
        self.accept([1000])
        shutil.rmtree(self.root / 'leetcode/4-codex')
        with self.assertRaisesRegex(publisher.PublicationError, 'Static route migration must precede'):
            self.publish(batch_size=1)
        self.assertFalse((self.root / 'leetcode/1000').exists())

    def test_cross_lesson_html_navigation_and_version_asset_dependencies(self):
        original = self.lesson
        def navigation(pid):
            original(pid)
            if pid == 1000:
                path = self.repo / 'leetcode/1000/index.html'
                path.write_text(path.read_text() + '<a href="../51/index.html#step1">Earlier lesson</a><a href="../51-codex/index.html">Version</a><a href="../51-codex/solution.py" download>Python</a>')
        with patch.object(self, 'lesson', side_effect=navigation):
            self.accept([1000])
        with patch.object(publisher, '_verify_public', return_value={'testAdapter': True}) as verify:
            self.publish(batch_size=1)
        hashes = verify.call_args.args[1]
        self.assertIn('leetcode/51-codex/solution.py', hashes)
        self.assertNotIn('leetcode/51/index.html', hashes)
        self.assertNotIn('leetcode/51-codex/index.html', hashes)

    def test_historical_public_problem_counts_when_independently_accepted(self):
        self.accept([4])
        with patch.object(publisher, '_verify_public', return_value={'testAdapter': True}):
            self.assertEqual(self.publish(batch_size=1)['ids'], ['4'])
        self.assertEqual(set(self.ledger()['released']), {'4', '51', '52'})

    def test_failed_verification_stays_pending_and_retry_does_not_count_twice(self):
        self.accept([1000])
        with patch.object(publisher, '_verify_public', side_effect=publisher.PublicationError('CDN stale')):
            with self.assertRaisesRegex(publisher.PublicationError, 'CDN stale'):
                self.publish(batch_size=1)
        self.assertNotIn('1000', self.ledger()['released'])
        stage = self.state_dir / self.ledger()['pending']['stage']
        self.assertTrue(stage.exists())
        with patch.object(publisher, '_verify_public', return_value={'testAdapter': True}):
            self.assertEqual(self.publish(batch_size=1)['ids'], ['1000'])
            self.assertEqual(self.publish(batch_size=1)['status'], 'waiting')
        self.assertEqual(len(self.ledger()['releases']), 1)
        self.assertFalse(stage.exists())

    def test_pending_staged_corruption_rejected(self):
        self.accept([1000])
        with patch.object(publisher, '_verify_public', side_effect=publisher.PublicationError('network')):
            with self.assertRaises(publisher.PublicationError):
                self.publish(batch_size=1)
        stage = self.state_dir / self.ledger()['pending']['stage']
        (stage / 'leetcode/1000/app.js').write_text('Corruption')
        with self.assertRaisesRegex(publisher.PublicationError, 'Staged release changed'):
            self.publish(batch_size=1)

    def test_required_findings_independent_identity_and_report_change_block(self):
        self.accept([1000])
        entry = self.state['problems']['1000']
        entry['reviews'][-1]['required_open'] = ['R1']
        with self.assertRaisesRegex(publisher.PublicationError, 'independent review gate'):
            self.publish(batch_size=1)
        entry['reviews'][-1]['required_open'] = []
        entry['author_runs'] = ['1000-review']
        with self.assertRaisesRegex(publisher.PublicationError, 'independent review gate'):
            self.publish(batch_size=1)
        entry['author_runs'] = []
        self.write('specs/reviews/1000-review.md', 'Edited after acceptance')
        self.state['expected_head'] = self.commit('Unexpected evidence edit')
        with self.assertRaisesRegex(publisher.PublicationError, 'evidence changed'):
            self.publish(batch_size=1)

    def test_dirty_head_changed_runtime_and_bad_registration_block(self):
        self.accept([1000])
        self.write('scratch.txt', 'Uncommitted')
        with self.assertRaisesRegex(publisher.PublicationError, 'clean saved'):
            self.publish(batch_size=1)
        (self.repo / 'scratch.txt').unlink()
        self.write('leetcode/1000/app.js', 'Modified')
        self.state['expected_head'] = self.commit('Changed after review')
        with self.assertRaisesRegex(publisher.PublicationError, 'changed since'):
            self.publish(batch_size=1)

    def test_unaccepted_registered_lesson_is_not_published(self):
        self.accept([1000, 1001])
        self.state['problems']['1001']['status'] = 'review_pending'
        with patch.object(publisher, '_verify_public', return_value={'testAdapter': True}):
            self.publish(batch_size=1)
        self.assertFalse((self.root / 'leetcode/1001').exists())
        self.assertNotIn(1001, {entry['id'] for entry in read_registry(self.root / 'leetcode/problems.config.js')})

    def test_final_flush_requires_all_catalog_ids_accepted(self):
        self.accept([1000])
        with self.assertRaisesRegex(publisher.PublicationError, 'every catalog lesson'):
            self.publish(flush=True)

    def test_complete_catalog_flush_publishes_final_remainder(self):
        self.write('leetcode/catalog/hard-problems.json', json.dumps({'problems': [
            {'id': pid, 'officialUrl': self.entries[str(pid)]['leetcodeUrl']} for pid in (4, 51, 52, 1000)]}))
        self.accept([4, 51, 52, 1000])
        with patch.object(publisher, '_verify_public', return_value={'testAdapter': True}):
            result = self.publish(flush=True)
        self.assertEqual(result['ids'], ['4', '1000'])
        self.assertEqual(len(self.ledger()['releases']), 1)

    def test_registry_edit_after_review_is_not_accepted(self):
        self.accept([1000])
        self.entries['1000']['desc']['en'] = 'Changed after review'
        self.registry([4, 51, 52, 1000])
        self.state['expected_head'] = self.commit('Changed only registry')
        with self.assertRaisesRegex(publisher.PublicationError, 'metadata changed since review'):
            self.publish(batch_size=1)

    def test_symlink_production_target_is_not_overwritten(self):
        self.accept([1000])
        secret = self.base / 'outside'
        secret.mkdir()
        (self.root / 'leetcode/1000').symlink_to(secret, target_is_directory=True)
        with self.assertRaisesRegex(publisher.PublicationError, 'escapes root'):
            self.publish(batch_size=1)
        self.assertEqual(list(secret.iterdir()), [])

    def test_language_provenance_is_excluded_but_runtime_json_is_published(self):
        self.write('leetcode/1000/language-contract.json', json.dumps({'verificationEvidence': 'official-interface.json'}))
        self.write('leetcode/1000/official-interface.json', '{"provenance": "official contract excerpt"}')
        self.write('leetcode/1000/data.json', '{"runtime": true}')
        self.accept([1000])
        with patch.object(publisher, '_verify_public', return_value={'testAdapter': True}):
            self.publish(batch_size=1)
        self.assertFalse((self.root / 'leetcode/1000/language-contract.json').exists())
        self.assertFalse((self.root / 'leetcode/1000/official-interface.json').exists())
        self.assertEqual((self.root / 'leetcode/1000/data.json').read_text(), '{"runtime": true}')

    def test_official_capture_is_not_in_public_payload(self):
        capture = {'source': 'https://leetcode.com/problems/problem-1000/',
                   'graphql': 'https://leetcode.com/graphql/', 'accessedAt': '2026-10-18T10:00:00Z',
                   'response': {'data': {'question': {'content': 'Observed official statement'}}}}
        captures = ('official-evidence.json', 'official-interface.json', 'official-contract.json',
                    'official-graphql.json', 'official.json')
        for name in captures:
            self.write(f'leetcode/1000/{name}', json.dumps(capture))
        self.write('leetcode/1000/provenance/response.json', json.dumps(capture))
        for source, _mirror, _export in publisher.LANGUAGE_FILES.values():
            self.write(f'leetcode/1000/{source}', 'native submission source')
        self.write('leetcode/1000/data.json', '{"runtime": true}')
        self.write('leetcode/1000/solution.sql', 'SELECT 1;')
        self.accept([1000])
        with patch.object(publisher, '_verify_public', return_value={'testAdapter': True}) as verify:
            self.publish(batch_size=1)
        for name in captures:
            self.assertFalse((self.root / f'leetcode/1000/{name}').exists())
            self.assertNotIn(f'leetcode/1000/{name}', verify.call_args.args[1])
        self.assertFalse((self.root / 'leetcode/1000/provenance').exists())
        for source, _mirror, _export in publisher.LANGUAGE_FILES.values():
            self.assertTrue((self.root / f'leetcode/1000/{source}').is_file())
        self.assertEqual((self.root / 'leetcode/1000/data.json').read_text(), '{"runtime": true}')
        self.assertEqual((self.root / 'leetcode/1000/solution.sql').read_text(), 'SELECT 1;')

    def test_excluded_evidence_still_belongs_to_frozen_candidate(self):
        self.write('leetcode/1000/evidence/official-evidence.json', '{"response": "reviewed"}')
        self.accept([1000])
        self.write('leetcode/1000/evidence/official-evidence.json', '{"response": "edited after acceptance"}')
        self.state['expected_head'] = self.commit('Unexpected provenance edit')
        with patch.object(publisher, '_verify_public', return_value={'testAdapter': True}):
            with self.assertRaisesRegex(publisher.PublicationError, 'changed since its accepted candidate'):
                self.publish(batch_size=1)
        self.assertFalse((self.root / 'leetcode/1000').exists())

    def test_reference_to_excluded_provenance_fails_before_publication(self):
        self.write('leetcode/1000/official-evidence.json', '{"response": "official statement"}')
        original = self.lesson
        def with_reference(pid):
            original(pid)
            if pid == 1000:
                path = self.repo / f'leetcode/{pid}/index.html'
                path.write_text(path.read_text() + '<a href="official-evidence.json">Source evidence</a>')
        with patch.object(self, 'lesson', side_effect=with_reference):
            self.accept([1000])
        with patch.object(publisher, '_verify_public', return_value={'testAdapter': True}):
            with self.assertRaisesRegex(publisher.PublicationError, 'excluded.*evidence|evidence.*excluded'):
                self.publish(batch_size=1)
        self.assertFalse((self.root / 'leetcode/1000').exists())

    def test_native_submission_source_is_published(self):
        self.write('leetcode/1000/solution.sql', 'SELECT 1;')
        self.accept([1000])
        with patch.object(publisher, '_verify_public', return_value={'testAdapter': True}):
            self.publish(batch_size=1)
        self.assertEqual((self.root / 'leetcode/1000/solution.sql').read_text(), 'SELECT 1;')

    def test_collection_assets_and_no_escaping_dependency(self):
        self.write('leetcode/collection.js', 'window.searchReady = true;')
        self.write('leetcode/collection.css', 'body {color:black}')
        self.write('leetcode/index.html', '<script src="problems.config.js?v=test"></script><script src="collection.js"></script><link href="collection.css" rel="stylesheet">')
        self.accept([1000])
        with patch.object(publisher, '_verify_public', return_value={'testAdapter': True}):
            self.publish(batch_size=1)
        self.assertEqual((self.root / 'leetcode/collection.js').read_text(), 'window.searchReady = true;')
        self.assertTrue((self.root / 'leetcode/collection.css').exists())
        self.write('leetcode/index.html', '<script src="problems.config.js?v=test"></script><script src="../../secret.js"></script>')
        self.accept([1001])
        with self.assertRaisesRegex(publisher.PublicationError, 'escapes LeetCode'):
            self.publish(batch_size=1)
        self.assertFalse((self.root / 'leetcode/1001').exists())

    def test_crash_after_receipt_removes_stage_on_next_invocation(self):
        self.accept([1000])
        actual_remove = publisher.shutil.rmtree
        with patch.object(publisher, '_verify_public', return_value={'testAdapter': True}):
            def crash_stage_only(path, *args, **kwargs):
                if Path(path).name.startswith('release-stage-'):
                    raise OSError('simulated crash')
                return actual_remove(path, *args, **kwargs)
            with patch.object(publisher.shutil, 'rmtree', side_effect=crash_stage_only):
                with self.assertRaisesRegex(OSError, 'simulated crash'):
                    self.publish(batch_size=1)
            self.assertIsNone(self.ledger()['pending'])
            self.assertTrue(list(self.state_dir.glob('release-stage-*')))
            self.assertEqual(self.publish(batch_size=1)['status'], 'waiting')
            self.assertFalse(list(self.state_dir.glob('release-stage-*')))
            orphan = self.state_dir / ('release-stage-' + 'a' * 32)
            orphan.mkdir()
            (orphan / 'new-bytes').write_text('orphan from crash before ledger write')
            self.publish(batch_size=1)
            self.assertFalse(orphan.exists())

    def test_cli_refuses_active_campaign_checkout_lock(self):
        import fcntl
        self.accept([1000])
        self.state_dir.mkdir()
        (self.state_dir / 'progress.json').write_text(json.dumps(self.state))
        with (self.repo / '.git/leetcode-campaign.lock').open('a') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            result = subprocess.run(['python3', str(Path(publisher.__file__)), '--repo', str(self.repo),
                '--state-dir', str(self.state_dir), '--publish-root', str(self.root),
                '--public-base', 'https://example.invalid', '--baseline-revision', self.baseline],
                capture_output=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse((self.state_dir / 'releases.json').exists())

    def test_curl_public_hash_verification_is_not_a_status_code_check(self):
        class Quiet(http.server.SimpleHTTPRequestHandler):
            def log_message(self, *_):
                pass
        handler = functools.partial(Quiet, directory=str(self.root))
        server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        self.addCleanup(server.server_close)
        self.addCleanup(server.shutdown)
        url = f'http://127.0.0.1:{server.server_address[1]}'
        actual_run = publisher._run
        def without_browser(args, **kwargs):
            return b'{}' if args[0] == 'node' else actual_run(args, **kwargs)
        with patch.object(publisher, '_run', side_effect=without_browser):
            publisher._verify_public(url, {'unrelated.html': publisher._sha(b'Keep this page')}, [])
            with self.assertRaisesRegex(publisher.PublicationError, 'Public bytes differ'):
                publisher._verify_public(url, {'unrelated.html': publisher._sha(b'Incorrect')}, [])


if __name__ == '__main__':
    unittest.main()
