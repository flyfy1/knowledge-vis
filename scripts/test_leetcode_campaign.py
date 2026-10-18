#!/usr/bin/env python3
"""Integration tests use disposable Git checkouts and a fake CLI, never real agents."""
import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time
import unittest
from unittest.mock import patch


SPEC = importlib.util.spec_from_file_location("leetcode_campaign", Path(__file__).with_name("leetcode_campaign.py"))
campaign = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(campaign)


FAKE_CODEX = r'''#!/usr/bin/env python3
import json, os, pathlib, subprocess, sys, time, uuid
args = sys.argv
repo = pathlib.Path(args[args.index('-C') + 1])
final = pathlib.Path(args[args.index('-o') + 1])
lines = sys.stdin.read().splitlines()
role, problem, report = lines[0], json.loads(lines[1]), lines[2]
pid = str(problem['id'])
scenario = os.environ.get('CAMPAIGN_TEST_SCENARIO', '')
print(json.dumps({'type': 'thread.started', 'thread_id': uuid.uuid4().hex}), flush=True)
if scenario == 'fail_author' and role == 'author':
    sys.exit(7)
if scenario == 'fail_review' and role == 'review':
    sys.exit(8)
if scenario == 'timeout':
    subprocess.Popen([sys.executable, '-c', "import time,pathlib; time.sleep(2); pathlib.Path(" + repr(str(repo / 'descendant-marker')) + ").write_text('survived')"])
    time.sleep(30)
if role in ('author', 'fix'):
    folder = repo / 'leetcode' / pid
    folder.mkdir(parents=True, exist_ok=True)
    sources = ('solution.js','javascript-code.js','concept.py') if 'javascript' in problem.get('categories', []) else ('solution.py',)
    for name in ('index.html','app.js','copy.js','python-code.js','BRIEF.md','lesson-entry.json', *sources):
        if scenario == 'missing_js_comparison' and name == 'concept.py':
            continue
        (folder / name).write_text('Candidate ' + pid + ' ' + role)
    if 'javascript' in problem.get('categories', []):
        contract = {'problemId': problem['id'], 'language': 'JavaScript', 'officialSource': problem['officialUrl'],
                    'supportedLanguages': ['JavaScript', 'TypeScript'], 'interface': 'function memoize(fn)',
                    'rationale': 'Owner explicitly chose JavaScript for this exact-six exception.', 'verifiedAt': '2026-10-18T00:00:00Z',
                    'verificationEvidence': 'language-evidence.md'}
        (folder / 'language-contract.json').write_text(json.dumps(contract))
        (folder / 'language-evidence.md').write_text('Official fixture supports JavaScript and TypeScript; owner chose original JavaScript.')
        for source, mirror, export in [('solution.js','javascript-code.js','JAVASCRIPT_SOURCE'), ('concept.py','python-code.js','PYTHON_SOURCE')]:
            if (folder / source).exists():
                (folder / mirror).write_text('window.' + export + ' = ' + json.dumps((folder / source).read_text()) + ';')
    if scenario == 'shared_change':
        (repo / 'shared.txt').write_text('unauthorized change')
    output = {'outcome': 'blocked' if scenario == 'blocked' else 'ready', 'detail': 'Source unavailable' if scenario == 'blocked' else 'Checks completed'}
else:
    target = repo / report
    target.parent.mkdir(parents=True, exist_ok=True)
    if scenario != 'missing_report':
        target.write_text('Independent observations for ' + pid)
    if scenario == 'mutate_review':
        (repo / 'leetcode' / pid / 'app.js').write_text('Reviewer changed candidate')
    if scenario == 'overwrite_evidence':
        (repo / 'specs/reviews' / (pid + '-evidence') / 'prior.png').write_text('Overwritten')
    output = {'outcome': 'changes_required' if scenario == 'changes' else 'accepted',
              'scores': [4,4,4,4,4,4], 'required_open': ['F1'] if scenario == 'changes' else [],
              'report_path': report, 'evidence': ['Fresh case and cold walkthrough observed'], 'detail': 'Reviewed'}
final.write_text(json.dumps(output))
print(json.dumps({'type': 'turn.completed'}))
'''


class CampaignTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.repo = self.root / "repo"
        self.repo.mkdir()
        self.state = self.root / "state"
        self.fake = self.root / "fake-codex"
        self.fake.write_text(FAKE_CODEX)
        self.fake.chmod(0o755)
        self.problems = [{"id": i, "title": f"Problem {i}", "paidOnly": i == 10} for i in (4, 10)]
        self.write("leetcode/catalog/hard-problems.json", json.dumps({"problems": self.problems}))
        self.write("leetcode/problems.config.js", "window.LEETCODE_PROBLEMS = [];")
        for role in ("author", "review", "fix"):
            self.write(f"scripts/campaign-prompts/{role}.md", role + "\n{problem_json}\n{report_path}\n{prior_report}\n")
        self.write("scripts/register_leetcode_lesson.py", "from pathlib import Path\nimport sys\np=Path('leetcode/problems.config.js')\np.write_text(p.read_text()+'\\n// registered '+sys.argv[1])\n")
        self.git("init", "-b", "codex/campaign-test")
        self.git("config", "user.email", "campaign-test@example.invalid")
        self.git("config", "user.name", "Campaign Test")
        self.git("add", ".")
        self.git("commit", "-m", "Test fixture")

    def write(self, path, content):
        target = self.repo / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content)

    def git(self, *args):
        return subprocess.run(["git", *args], cwd=self.repo, text=True, capture_output=True, check=True).stdout.strip()

    def invoke(self, scenario="", *extra):
        with patch.dict(os.environ, {"CAMPAIGN_TEST_SCENARIO": scenario}), contextlib.redirect_stdout(io.StringIO()):
            return campaign.main(["--repo", str(self.repo), "--state-dir", str(self.state),
                                  "--codex", str(self.fake), "--port", "0", *extra])

    def progress(self):
        return json.loads((self.state / "progress.json").read_text())

    def test_selection_preserves_paid_and_explicit_order(self):
        catalog = {"problems": self.problems}
        self.assertEqual(campaign.select_queue(catalog), self.problems)
        self.assertEqual([p["id"] for p in campaign.select_queue(catalog, ["10", "4"], 1)], [10])
        with self.assertRaises(campaign.CampaignError):
            campaign.select_queue(catalog, ["99"])

    def test_score_gating_and_strict_schema(self):
        result = {"outcome": "accepted", "scores": [4] * 6, "required_open": [],
                  "report_path": "x.md", "evidence": ["Observed"], "detail": "Reviewed"}
        self.assertEqual(campaign.acceptance(result), (True, 100))
        for values in ([3] * 6, [4, 4, 4, 4, 4, 2]):
            self.assertFalse(campaign.acceptance({**result, "scores": values})[0])
        self.assertFalse(campaign.acceptance({**result, "required_open": ["F1"]})[0])
        self.assertFalse(campaign.acceptance({**result, "outcome": "changes_required"})[0])
        with self.assertRaises(campaign.CampaignError):
            campaign.acceptance({**result, "scores": [True, 4, 4, 4, 4, 4]})
        with self.assertRaises(campaign.CampaignError):
            campaign.acceptance({**result, "evidence": []})

    def test_author_scope_excludes_shared_and_review_files(self):
        self.assertTrue(campaign.allowed_path("leetcode/4/app.js", "4"))
        self.assertTrue(campaign.allowed_path("leetcode/tests/4-oracle.py", "4"))
        for path in ("leetcode/41/app.js", "leetcode/problems.config.js", "specs/reviews/4-review.md", "leetcode/tests/test_core.cjs"):
            self.assertFalse(campaign.allowed_path(path, "4"))
        with self.assertRaises(campaign.CampaignError):
            self.invoke("shared_change")
        self.assertEqual(self.progress()["status"], "failed")
        self.assertEqual(len(self.progress()["runs"]), 1)
        self.assertTrue((self.repo / "shared.txt").exists())

    def test_nonzero_stops_queue_and_clean_resume_retries_problem(self):
        with self.assertRaises(campaign.CampaignError):
            self.invoke("fail_author")
        state = self.progress()
        self.assertEqual(state["status"], "failed")
        self.assertEqual(state["runs"][0]["status"], "failed")
        self.assertNotIn("10", state["problems"])
        self.invoke()
        state = self.progress()
        self.assertEqual(state["status"], "completed")
        self.assertEqual({p["status"] for p in state["problems"].values()}, {"accepted_local"})
        self.assertEqual(self.git("status", "--porcelain"), "")
        count = len(state["runs"])
        self.invoke()
        self.assertEqual(len(self.progress()["runs"]), count)

    def test_failed_review_is_not_skipped_on_resume(self):
        with self.assertRaises(campaign.CampaignError):
            self.invoke("fail_review")
        state = self.progress()
        self.assertEqual(state["problems"]["4"]["phase"], "review")
        self.assertEqual(state["problems"]["4"]["rounds"], 0)
        self.invoke()
        roles = [run["role"] for run in self.progress()["runs"] if run["problem_id"] == "4"]
        self.assertEqual(roles, ["author", "review", "review"])
        self.assertEqual(self.progress()["problems"]["4"]["status"], "accepted_local")

    def test_review_mutation_and_missing_report_stop(self):
        with self.assertRaisesRegex(campaign.CampaignError, "changed during review"):
            self.invoke("mutate_review")
        self.assertNotEqual(self.progress()["problems"]["4"]["status"], "accepted_local")
        self.assertNotIn("10", self.progress()["problems"])

    def test_missing_report_stops(self):
        with self.assertRaisesRegex(campaign.CampaignError, "report missing"):
            self.invoke("missing_report")
        self.assertEqual(self.progress()["status"], "failed")

    def test_round_bound_continues_but_never_accepts(self):
        self.invoke("changes", "--max-rounds", "2")
        state = self.progress()
        self.assertEqual({p["status"] for p in state["problems"].values()}, {"needs_review"})
        self.assertEqual([r["role"] for r in state["runs"] if r["problem_id"] == "4"],
                         ["author", "review", "fix", "review"])
        self.assertEqual(state["problems"]["4"]["rounds"], 2)
        self.assertEqual(state["status"], "queue_exhausted_incomplete")

    def test_content_blocked_continues(self):
        self.invoke("blocked")
        self.assertEqual({p["status"] for p in self.progress()["problems"].values()}, {"blocked"})
        self.assertEqual(len(self.progress()["runs"]), 2)
        self.assertEqual(self.progress()["status"], "queue_exhausted_incomplete")

    def test_existing_lesson_is_reviewed_first(self):
        for name in campaign.REQUIRED:
            self.write(f"leetcode/4/{name}", "Existing lesson")
        self.write("leetcode/problems.config.js", 'window.LEETCODE_PROBLEMS = [{"id":4}];')
        self.git("add", ".")
        self.git("commit", "-m", "Existing lesson")
        self.invoke("", "--ids", "4")
        self.assertEqual([run["role"] for run in self.progress()["runs"]], ["review"])

    def test_unregistered_partial_lesson_is_authored_before_review(self):
        for name in campaign.REQUIRED:
            self.write(f"leetcode/4/{name}", "Partial lesson")
        self.git("add", ".")
        self.git("commit", "-m", "Partial lesson without registry metadata")
        self.invoke("", "--ids", "4")
        self.assertEqual([r["role"] for r in self.progress()["runs"]], ["author", "review"])
        self.assertTrue((self.repo / "leetcode/4/lesson-entry.json").is_file())

    def javascript_fixture(self, sources=()):
        problem = {"id": 2630, "title": "Memoize II", "categories": ["javascript"], "officialUrl": "https://leetcode.com/problems/memoize-ii/"}
        self.write("leetcode/catalog/hard-problems.json", json.dumps({"problems": [problem]}))
        for name in sources:
            self.write(f"leetcode/2630/{name}", "Existing source")
        self.git("add", ".")
        self.git("commit", "-m", "JavaScript lesson fixture")
        return problem

    def test_javascript_owner_exception_requires_native_solution_even_with_typescript(self):
        problem = self.javascript_fixture()
        self.invoke()
        self.assertEqual(self.progress()["problems"]["2630"]["status"], "accepted_local")
        self.assertEqual([r["role"] for r in self.progress()["runs"]], ["author", "review"])
        self.assertFalse((self.repo / "leetcode/2630/solution.py").exists())
        folder = self.repo / "leetcode/2630"
        contract = json.loads((folder / "language-contract.json").read_text())
        self.assertIn("TypeScript", contract["supportedLanguages"])
        self.assertIn("solution.js", campaign.required_for(problem, True, folder))
        self.assertNotIn("solution.ts", campaign.required_for(problem, True, folder))
        for missing in ("solution.js", "javascript-code.js", "concept.py", "python-code.js", "language-contract.json"):
            with self.subTest(missing=missing):
                path = self.repo / "leetcode/2630" / missing
                content = path.read_bytes()
                path.unlink()
                with self.assertRaisesRegex(campaign.CampaignError, missing):
                    campaign.required_files(self.repo, problem, new=True)
                path.write_bytes(content)

    def test_javascript_python_only_candidate_is_authored_again(self):
        self.javascript_fixture((*campaign.REQUIRED, "lesson-entry.json"))
        self.invoke()
        self.assertEqual([r["role"] for r in self.progress()["runs"]], ["author", "review"])

    def test_javascript_missing_comparison_stops_before_review(self):
        self.javascript_fixture()
        with self.assertRaisesRegex(campaign.CampaignError, "concept.py"):
            self.invoke("missing_js_comparison")
        self.assertEqual([r["role"] for r in self.progress()["runs"]], ["author"])
        self.assertEqual(self.progress()["status"], "failed")

    def test_python_required_files_unchanged_and_javascript_policy_scoped(self):
        self.assertEqual(campaign.required_for(self.problems[0]), campaign.REQUIRED)
        self.assertIn("solution.py", campaign.required_for(self.problems[0]))
        for problem in ({"id": 51, "categories": ["javascript"]},
                        {"id": 2630, "categories": ["algorithms"]}):
            with self.assertRaisesRegex(ValueError, "six approved"):
                campaign.required_for(problem)

    def test_exception_files_and_parity_are_checked_before_review(self):
        problem = {"id": 185, "categories": ["database"], "officialUrl": "https://leetcode.com/problems/department-top-three-salaries/"}
        folder = self.repo / "leetcode/185"
        contract = {"problemId": 185, "language": "MySQL", "officialSource": problem["officialUrl"],
                    "supportedLanguages": ["MySQL"], "interface": "Employee and Department SQL tables",
                    "rationale": "Fixture exposes SQL only.", "verifiedAt": "2026-10-18T00:00:00Z",
                    "verificationEvidence": "language-evidence.md"}
        self.write("leetcode/185/language-contract.json", json.dumps(contract))
        self.write("leetcode/185/language-evidence.md", "Observed official SQL fixture schema.")
        files = campaign.required_for(problem, True, folder)
        self.assertIn("solution.sql", files)
        self.assertNotIn("solution.py", files)
        for name in files:
            if not (folder / name).exists():
                self.write("leetcode/185/" + name, "Fixture")
        self.write("leetcode/185/solution.sql", "SELECT 1;\n")
        self.write("leetcode/185/sql-code.js", 'window.SQL_SOURCE = "SELECT 1;\\n";')
        campaign.required_files(self.repo, problem, True)
        self.write("leetcode/185/sql-code.js", 'window.SQL_SOURCE = "SELECT 2;";')
        with self.assertRaisesRegex(campaign.CampaignError, "parity"):
            campaign.required_files(self.repo, problem, True)
        contract.update(language="TypeScript", supportedLanguages=["TypeScript"])
        self.write("leetcode/185/language-contract.json", json.dumps(contract))
        self.assertIn("solution.ts", campaign.required_for(problem, True, folder))
        with self.assertRaisesRegex(campaign.CampaignError, "solution.ts"):
            campaign.required_files(self.repo, problem, True)

    def test_prior_evidence_cannot_be_overwritten(self):
        self.write("specs/reviews/4-evidence/prior.png", "Original evidence")
        self.git("add", ".")
        self.git("commit", "-m", "Prior evidence")
        with self.assertRaisesRegex(campaign.CampaignError, "changed during review"):
            self.invoke("overwrite_evidence")
        self.assertEqual(self.progress()["status"], "failed")

    def test_checkout_lock_blocks_different_state_directories(self):
        with (self.repo / ".git/leetcode-campaign.lock").open("a") as lock:
            campaign.fcntl.flock(lock, campaign.fcntl.LOCK_EX | campaign.fcntl.LOCK_NB)
            for state_name in ("state-a", "state-b"):
                self.state = self.root / state_name
                with self.assertRaisesRegex(campaign.CampaignError, "owns this state directory or checkout"):
                    self.invoke()

    def test_timeout_terminates_descendants_and_stops_queue(self):
        with self.assertRaises(subprocess.TimeoutExpired):
            self.invoke("timeout", "--codex-timeout", "1")
        time.sleep(2)
        self.assertFalse((self.repo / "descendant-marker").exists())
        self.assertEqual(self.progress()["status"], "failed")
        self.assertNotIn("10", self.progress()["problems"])

    def test_run_count_keeps_full_queue_and_resumes_remaining(self):
        self.invoke("", "--run-count", "1")
        state = self.progress()
        self.assertEqual(state["queue"], ["4", "10"])
        self.assertEqual(state["status"], "run_limit_reached")
        self.assertNotIn("10", state["problems"])
        first_count = len(state["runs"])
        self.invoke()
        self.assertEqual(self.progress()["status"], "completed")
        self.assertEqual(len(self.progress()["runs"]), first_count + 2)

    def test_stop_file_and_dry_run_start_no_agents(self):
        self.invoke("", "--dry-run")
        self.assertFalse(self.state.exists())
        self.state.mkdir()
        (self.state / "STOP").touch()
        self.invoke()
        self.assertEqual(self.progress()["status"], "stopped")
        self.assertEqual(self.progress()["runs"], [])

    def test_queue_identity_and_external_commit_rejected(self):
        self.invoke("", "--run-count", "1")
        with self.assertRaisesRegex(campaign.CampaignError, "another checkout or queue"):
            self.invoke("", "--ids", "4")
        self.git("commit", "--allow-empty", "-m", "External commit")
        with self.assertRaisesRegex(campaign.CampaignError, "HEAD changed"):
            self.invoke()


if __name__ == "__main__":
    unittest.main()
