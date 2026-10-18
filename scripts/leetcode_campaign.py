#!/usr/bin/env python3
"""Finite, resumable local author/reviewer queue. Never deploys or pushes."""
from __future__ import annotations

import argparse
import contextlib
import datetime as dt
import fcntl
import hashlib
import http.server
import json
import os
from pathlib import Path
import re
import signal
import subprocess
import sys
import threading
import uuid

from leetcode_registry import read_registry
from register_leetcode_lesson import solution_language, validate_language_sources, LANGUAGE_FILES


WEIGHTS = (15, 20, 20, 20, 15, 10)
REQUIRED = ("index.html", "app.js", "copy.js", "solution.py", "python-code.js", "BRIEF.md")
REGISTER_PATHS = {"leetcode/problems.config.js", "leetcode/index.html", "CONCEPT-MAP.md"}
TERMINAL = {"accepted_local", "blocked", "needs_review"}
AUTHOR_SCHEMA = {
    "type": "object", "additionalProperties": False,
    "properties": {"outcome": {"type": "string", "enum": ["ready", "blocked"]},
                   "detail": {"type": "string"}},
    "required": ["outcome", "detail"],
}
REVIEW_SCHEMA = {
    "type": "object", "additionalProperties": False,
    "properties": {
        "outcome": {"type": "string", "enum": ["accepted", "changes_required", "blocked"]},
        "scores": {"type": "array", "items": {"type": "integer", "minimum": 0, "maximum": 4},
                   "minItems": 6, "maxItems": 6},
        "required_open": {"type": "array", "items": {"type": "string"}},
        "report_path": {"type": "string"},
        "evidence": {"type": "array", "items": {"type": "string"}, "minItems": 1},
        "detail": {"type": "string"},
    },
    "required": ["outcome", "scores", "required_open", "report_path", "evidence", "detail"],
}


class CampaignError(RuntimeError):
    pass


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat()


def command(args, cwd, **kwargs):
    result = subprocess.run(args, cwd=cwd, check=False, capture_output=True, **kwargs)
    if result.returncode:
        error = result.stderr.decode(errors="replace") if isinstance(result.stderr, bytes) else result.stderr
        raise CampaignError(f"Command failed ({result.returncode}): {args[0]}: {error[-2000:]}")
    return result.stdout


def git(repo, *args):
    return command(["git", *args], repo).decode().strip()


def head(repo):
    return git(repo, "rev-parse", "HEAD")


def changed_paths(repo):
    paths = set()
    for args in (("diff", "--no-renames", "--name-only", "-z", "HEAD"),
                 ("ls-files", "--others", "--exclude-standard", "-z")):
        paths.update(p for p in command(["git", *args], repo).decode().split("\0") if p)
    return paths


def allowed_path(path, problem_id):
    """Author/fix runs may only change lesson-local files and ID-prefixed tests."""
    problem_id = str(problem_id)
    return (path.startswith(f"leetcode/{problem_id}/") or
            re.fullmatch(rf"leetcode/tests/{re.escape(problem_id)}[-_][^/]+", path) is not None)


def check_paths(repo, problem_id, only_review=None, evidence_dir=None):
    paths = changed_paths(repo)
    if only_review is None:
        bad = {p for p in paths if not allowed_path(p, problem_id)}
    else:
        bad = {p for p in paths if p != only_review and
               not (evidence_dir and p.startswith(evidence_dir + "/"))}
    if bad:
        raise CampaignError("Out-of-scope changes retained for inspection: " + ", ".join(sorted(bad)))
    for path in paths:
        # Do not stage links into paths outside the isolated checkout.
        target = repo / path
        if target.is_symlink() or not target.resolve().is_relative_to(repo):
            raise CampaignError(f"Unsafe changed path: {path}")
    return paths


def fingerprint(repo, problem_id, report_path, evidence_dir=None):
    """Fingerprint every nonignored file except this run's permitted evidence."""
    raw = command(["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"], repo)
    digest = hashlib.sha256()
    for path in sorted(set(raw.decode().split("\0")) - {""}):
        if path == report_path or (evidence_dir and path.startswith(evidence_dir + "/")):
            continue
        target = repo / path
        digest.update(path.encode() + b"\0")
        if target.is_symlink():
            digest.update(b"link:" + os.readlink(target).encode())
        elif target.is_file():
            digest.update(str(target.stat().st_mode).encode() + b"\0" + target.read_bytes())
        else:
            digest.update(b"missing")
    return digest.hexdigest()


def select_queue(catalog, ids=None, limit=None):
    problems = catalog["problems"]
    mapping = {str(p["id"]): p for p in problems}
    if len(mapping) != len(problems):
        raise CampaignError("Catalog contains duplicate IDs")
    if ids:
        requested = list(dict.fromkeys(ids))
        unknown = set(requested) - mapping.keys()
        if unknown:
            raise CampaignError("IDs absent from Hard catalog: " + ", ".join(sorted(unknown)))
        problems = [mapping[i] for i in requested]
    return problems[:limit] if limit is not None else problems


def validate_result(result, review=False):
    schema = REVIEW_SCHEMA if review else AUTHOR_SCHEMA
    if not isinstance(result, dict) or set(result) != set(schema["required"]):
        raise CampaignError("Agent final output does not match the required object schema")
    outcomes = schema["properties"]["outcome"]["enum"]
    if result["outcome"] not in outcomes or not isinstance(result["detail"], str) or not result["detail"].strip():
        raise CampaignError("Invalid agent outcome or empty detail")
    if review:
        scores = result["scores"]
        if not isinstance(scores, list) or len(scores) != 6 or any(type(x) is not int or not 0 <= x <= 4 for x in scores):
            raise CampaignError("Review requires six integer scores from 0 to 4")
        for field in ("required_open", "evidence"):
            if not isinstance(result[field], list) or any(not isinstance(x, str) or not x.strip() for x in result[field]):
                raise CampaignError(f"Invalid review {field}")
        if not result["evidence"] or not isinstance(result["report_path"], str):
            raise CampaignError("Review evidence or report path is missing")
    if re.search(r"(?:rate.?limit|usage.?limit|quota|budget (?:exhausted|exceeded)|insufficient credits)", result["detail"], re.I):
        raise CampaignError("Agent reported a capacity/budget failure; queue stopped")
    return result


def acceptance(result):
    validate_result(result, review=True)
    score = sum(weight * value / 4 for weight, value in zip(WEIGHTS, result["scores"]))
    return (result["outcome"] == "accepted" and score >= 85 and
            min(result["scores"]) >= 3 and not result["required_open"]), score


def save_state(path, state):
    state["updated_at"] = now()
    temporary = path.with_suffix(".tmp")
    with temporary.open("w") as out:
        json.dump(state, out, indent=2, ensure_ascii=False)
        out.write("\n")
        out.flush()
        os.fsync(out.fileno())
    os.replace(temporary, path)
    directory = os.open(path.parent, os.O_RDONLY)
    try:
        os.fsync(directory)
    finally:
        os.close(directory)


def load_state(path, repo, queue):
    ids = [str(p["id"]) for p in queue]
    if path.exists():
        state = json.loads(path.read_text())
        if state.get("version") != 1 or state["repo"] != str(repo) or state["queue"] != ids:
            raise CampaignError("State belongs to another checkout or queue; use the original selection")
        if state["expected_head"] != head(repo):
            raise CampaignError("Checkout HEAD changed outside the saved queue; inspect before resuming")
        return state
    return {"version": 1, "repo": str(repo), "queue": ids, "expected_head": head(repo),
            "started_at": now(), "status": "ready", "current": None, "problems": {}, "runs": []}


@contextlib.contextmanager
def preview(repo, port):
    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(repo), **kwargs)

        def log_message(self, *_args):
            pass

    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), Handler)
    worker = threading.Thread(target=server.serve_forever, daemon=True)
    worker.start()
    try:
        yield f"http://127.0.0.1:{server.server_address[1]}"
    finally:
        server.shutdown()
        server.server_close()
        worker.join()


def run_agent(args, role, problem, candidate, report, prior, state, state_path, base_url, evidence_dir=""):
    run_id = f"{problem['id']}-{role}-{uuid.uuid4().hex[:12]}"
    directory = args.state_dir / "runs" / run_id
    directory.mkdir(parents=True)
    schema_path, final_path = directory / "schema.json", directory / "final.json"
    schema_path.write_text(json.dumps(REVIEW_SCHEMA if role == "review" else AUTHOR_SCHEMA))
    prompt = (args.repo / "scripts" / "campaign-prompts" / f"{role}.md").read_text()
    replacements = {"problem_json": json.dumps(problem, ensure_ascii=False), "repo": str(args.repo),
                    "base_url": base_url, "candidate": candidate, "report_path": report,
                    "prior_report": prior if role == "fix" else "", "evidence_dir": evidence_dir}
    for key, value in replacements.items():
        prompt = prompt.replace("{" + key + "}", value)
    if role == "review":
        prompt += f"\nThis run's exclusive screenshot directory is {evidence_dir}/. Write evidence only inside it; preserve all earlier reports and screenshots.\n"
    (directory / "prompt.md").write_text(prompt)
    run = {"id": run_id, "problem_id": str(problem["id"]), "role": role,
           "started_at": now(), "status": "running", "candidate": candidate,
           "directory": str(directory), "session_ids": []}
    state["runs"].append(run)
    state["status"] = "running"
    state["current"] = {"problem_id": str(problem["id"]), "stage": role, "started_at": run["started_at"], "run_id": run_id}
    save_state(state_path, state)
    invocation = [args.codex, "exec", "-m", "gpt-6.1-sol", "-c", 'model_reasoning_effort="medium"',
                  "-c", 'approval_policy="never"', "--sandbox", "danger-full-access", "--json",
                  "-o", str(final_path), "--output-schema", str(schema_path), "-C", str(args.repo), "-"]
    try:
        with (directory / "events.jsonl").open("w") as stdout, (directory / "stderr.log").open("w") as stderr:
            process = subprocess.Popen(invocation, stdin=subprocess.PIPE, text=True, stdout=stdout, stderr=stderr,
                                       cwd=args.repo, start_new_session=True)
            try:
                process.communicate(input=prompt, timeout=args.codex_timeout)
            except BaseException:
                # The CLI can launch browser/tool children; terminate the entire isolated session.
                with contextlib.suppress(ProcessLookupError):
                    os.killpg(process.pid, signal.SIGTERM)
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    pass
                with contextlib.suppress(ProcessLookupError):
                    os.killpg(process.pid, signal.SIGKILL)
                process.wait()
                raise
            # No per-run tools may outlive the CLI, including after a nonzero exit.
            with contextlib.suppress(ProcessLookupError):
                os.killpg(process.pid, signal.SIGTERM)
            with contextlib.suppress(ProcessLookupError):
                os.killpg(process.pid, signal.SIGKILL)
        session_ids = set()
        errors = []
        for line in (directory / "events.jsonl").read_text().splitlines():
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                raise CampaignError(f"Malformed JSONL in {directory}")
            if not isinstance(event, dict):
                raise CampaignError("Agent event was not an object")
            for key in ("thread_id", "session_id"):
                if isinstance(event.get(key), str):
                    session_ids.add(event[key])
            if event.get("type") in ("error", "turn.failed"):
                errors.append(event)
        run["session_ids"] = sorted(session_ids)
        if process.returncode or errors:
            raise CampaignError(f"Agent failed (exit {process.returncode}); inspect {directory}")
        previous_ids = {sid for old in state["runs"][:-1] for sid in old["session_ids"]}
        if not session_ids or session_ids & previous_ids:
            raise CampaignError("Missing or reused agent session identity; independent review cannot be established")
        output = validate_result(json.loads(final_path.read_text()), review=role == "review")
        run.update(status="completed", finished_at=now(), result=output)
        save_state(state_path, state)
        return output, run_id
    except BaseException as error:
        run.update(status="failed", finished_at=now(), error=str(error))
        save_state(state_path, state)
        raise


def commit_changes(repo, paths, title, trailers):
    if paths:
        command(["git", "add", "--", *sorted(paths)], repo)
        command(["git", "commit", "-m",
                 title + "\n\n" + "\n".join(f"{key}: {value}" for key, value in trailers.items())], repo)
    return head(repo)


def required_for(problem, new=False, folder=None):
    language = solution_language(problem, folder)
    required = ("index.html", "app.js", "copy.js", "BRIEF.md", *LANGUAGE_FILES[language][:2])
    if language == "Python":
        required = REQUIRED
    else:
        required = (*required, "language-contract.json")
    if problem['id'] in (2630, 2650, 2675, 2691, 2756, 2759):
        required = (*required, "concept.py", "python-code.js")
    return (*required, "lesson-entry.json") if new else required


def required_files(repo, problem, new):
    problem_id = problem["id"]
    folder = repo / "leetcode" / str(problem_id)
    try:
        required = required_for(problem, new, folder)
        missing = [name for name in required if not (folder / name).is_file()]
        if missing:
            raise CampaignError(f"Lesson {problem_id} is not ready; missing {', '.join(missing)}")
        validate_language_sources(problem, folder)
    except (ValueError, KeyError) as error:
        raise CampaignError(f"Lesson {problem_id} language contract is invalid: {error}") from error


def process_problem(args, problem, state, state_path, base_url):
    pid = str(problem["id"])
    if pid not in state["problems"]:
        registered = any(str(item["id"]) == pid for item in read_registry(args.repo / "leetcode/problems.config.js"))
        files = required_for(problem, new=not registered, folder=args.repo / "leetcode" / pid)
        complete = all((args.repo / "leetcode" / pid / name).is_file() for name in files)
        state["problems"][pid] = {
            "status": "pending", "rounds": 0, "new": not registered,
            "phase": "review" if complete else "author",
            "reviews": [], "author_runs": [], "prior_report": "",
        }
    entry = state["problems"][pid]
    if entry["status"] in TERMINAL:
        return
    while True:
        if args.stop_file.exists():
            state["status"] = "stopped"
            save_state(state_path, state)
            return
        phase = entry["phase"]
        if phase == "register":
            if (args.repo / "leetcode" / pid / "lesson-entry.json").exists():
                before = head(args.repo)
                command([sys.executable, "scripts/register_leetcode_lesson.py", pid], args.repo)
                if head(args.repo) != before:
                    raise CampaignError("Registration command changed HEAD")
                paths = changed_paths(args.repo)
                if paths - REGISTER_PATHS:
                    raise CampaignError("Registration changed paths outside its deterministic allowlist")
                entry["registration_commit"] = commit_changes(args.repo, paths,
                    f"Register independently reviewed LeetCode {pid} locally",
                    {"Campaign-Status": "accepted_local", "Review-Candidate": entry["candidate"],
                     "Review-Report": entry["prior_report"], "Built-By": "deterministic registry script (no model)",
                     "Verified-By": "campaign runner (path allowlist); lesson review linked above"})
                state["expected_head"] = head(args.repo)
            entry.update(status="accepted_local", phase="done", accepted_at=now())
            save_state(state_path, state)
            return
        before = head(args.repo)
        if phase in ("author", "fix"):
            output, run_id = run_agent(args, phase, problem, before, "", entry["prior_report"], state, state_path, base_url)
            if head(args.repo) != before:
                raise CampaignError("Agent committed or changed HEAD; changes retained for inspection")
            paths = check_paths(args.repo, pid)
            entry["author_runs"].append(run_id)
            if output["outcome"] == "ready":
                required_files(args.repo, problem, entry["new"])
            entry["candidate"] = commit_changes(args.repo, paths, f"Develop LeetCode {pid} candidate pending independent review",
                {"Campaign-Status": "blocked" if output["outcome"] == "blocked" else "review_pending",
                 "Author-Run": run_id, "Built-By": f"gpt-6.1-sol ({run_id})",
                 "Verified-By": "independent review pending; author self-check only"})
            state["expected_head"] = head(args.repo)
            if output["outcome"] == "blocked":
                entry.update(status="blocked", detail=output["detail"], phase="done")
                save_state(state_path, state)
                return
            entry.update(phase="review", status="review_pending")
            save_state(state_path, state)
            continue
        if phase != "review":
            raise CampaignError(f"Unknown phase: {phase}")
        round_number = entry["rounds"] + 1
        report = f"specs/reviews/{pid}-review-{round_number}-{uuid.uuid4().hex[:8]}.md"
        evidence_dir = f"specs/reviews/{pid}-evidence/{Path(report).stem}"
        frozen = fingerprint(args.repo, pid, report, evidence_dir)
        entry["candidate"] = before
        output, run_id = run_agent(args, "review", problem, before, report, "", state, state_path, base_url, evidence_dir)
        if head(args.repo) != before or fingerprint(args.repo, pid, report, evidence_dir) != frozen:
            raise CampaignError("Reviewed candidate changed during review; no acceptance recorded")
        paths = check_paths(args.repo, pid, only_review=report, evidence_dir=evidence_dir)
        supplied = Path(output["report_path"])
        supplied = supplied if supplied.is_absolute() else args.repo / supplied
        expected = args.repo / report
        if supplied.resolve() != expected.resolve() or not expected.is_file() or not expected.read_text().strip():
            raise CampaignError("Reviewer report missing, empty, or at a different path")
        accepted, score = acceptance(output)
        if output["outcome"] == "accepted" and not accepted:
            raise CampaignError("Review claimed acceptance without satisfying the frozen rubric")
        if accepted:
            required_files(args.repo, problem, entry["new"])
        review = {**output, "run_id": run_id, "candidate": before, "candidate_sha256": frozen,
                  "weighted_score": score, "round": round_number}
        review["commit"] = commit_changes(args.repo, paths, f"Record independent review of LeetCode {pid} round {round_number}",
            {"Campaign-Status": "accepted_local" if accepted else output["outcome"], "Reviewer-Run": run_id,
             "Review-Candidate": before, "Review-Score": str(score), "Review-Report": report,
             "Built-By": f"gpt-6.1-sol ({run_id}); review report only",
             "Verified-By": f"gpt-6.1-sol ({run_id}); lesson rubric review"})
        state["expected_head"] = head(args.repo)
        entry["reviews"].append(review)
        entry.update(rounds=round_number, prior_report=report)
        if accepted:
            entry.update(phase="register", status="review_passed")
        elif output["outcome"] == "blocked":
            entry.update(phase="done", status="blocked", detail=output["detail"])
        elif round_number >= args.max_rounds:
            entry.update(phase="done", status="needs_review", detail="Review round limit reached; required fixes remain")
        else:
            entry.update(phase="fix", status="changes_required")
        save_state(state_path, state)
        if entry["status"] in TERMINAL:
            return


def publish_if_due(args, state, flush=False):
    """Keep deployment behind one explicit, independently reviewed release interface."""
    if args.publish_root is None or args.stop_file.exists():
        return None
    from leetcode_publish import maybe_publish
    return maybe_publish(args.repo, state, args.state_dir, args.publish_root,
                         args.public_base, batch_size=args.publish_every, flush=flush)


def parser():
    result = argparse.ArgumentParser(description=__doc__)
    result.add_argument("--repo", type=Path, default=Path(__file__).resolve().parents[1])
    result.add_argument("--state-dir", type=Path, required=True)
    result.add_argument("--ids", help="Comma-separated catalog IDs; omitted means all Hard problems")
    result.add_argument("--limit", type=int)
    result.add_argument("--run-count", type=int, help="Stop after this many nonterminal problems without changing the saved queue")
    result.add_argument("--max-rounds", type=int, default=3)
    result.add_argument("--port", type=int, default=18770)
    result.add_argument("--codex", default="codex")
    result.add_argument("--codex-timeout", type=int, default=5400)
    result.add_argument("--stop-file", type=Path)
    result.add_argument("--publish-root", type=Path, help="Explicit production directory; enables accepted batch publication")
    result.add_argument("--public-base", help="Public site origin used for release verification")
    result.add_argument("--publish-every", type=int, default=100)
    result.add_argument("--dry-run", action="store_true")
    return result


def main(argv=None):
    args = parser().parse_args(argv)
    args.repo, args.state_dir = args.repo.resolve(), args.state_dir.resolve()
    args.stop_file = (args.stop_file or args.state_dir / "STOP").resolve()
    if bool(args.publish_root) != bool(args.public_base):
        raise CampaignError("Publication requires both --publish-root and --public-base")
    if args.publish_root is not None:
        args.publish_root = args.publish_root.resolve()
        if args.publish_root == args.repo or args.publish_root.is_relative_to(args.repo) or args.repo.is_relative_to(args.publish_root):
            raise CampaignError("Production directory must be separate from the campaign checkout")
    if (args.publish_every < 1 or args.max_rounds < 1 or args.codex_timeout < 1 or (args.limit is not None and args.limit < 1) or
            (args.run_count is not None and args.run_count < 1)):
        raise CampaignError("Limits must be positive")
    if args.state_dir.is_relative_to(args.repo):
        raise CampaignError("State directory must be outside the checkout")
    catalog = json.loads((args.repo / "leetcode/catalog/hard-problems.json").read_text())
    ids = [value.strip() for value in args.ids.split(",")] if args.ids else None
    queue = select_queue(catalog, ids, args.limit)
    if args.dry_run:
        print(json.dumps({"count": len(queue), "ids": [p["id"] for p in queue],
                          "repo": str(args.repo), "state_dir": str(args.state_dir), "agents_started": 0}))
        return 0
    if Path(git(args.repo, "rev-parse", "--show-toplevel")).resolve() != args.repo:
        raise CampaignError("--repo must identify the checkout root")
    if not git(args.repo, "branch", "--show-current").startswith("codex/"):
        raise CampaignError("Campaign requires an isolated codex/ branch")
    if changed_paths(args.repo):
        raise CampaignError("Checkout is dirty; preserve and inspect changes before running/resuming")
    args.state_dir.mkdir(parents=True, exist_ok=True)
    checkout_lock = Path(git(args.repo, "rev-parse", "--git-path", "leetcode-campaign.lock"))
    checkout_lock = checkout_lock if checkout_lock.is_absolute() else args.repo / checkout_lock
    with (args.state_dir / "runner.lock").open("a") as lock, checkout_lock.open("a") as repo_lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            fcntl.flock(repo_lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise CampaignError("Another campaign owns this state directory or checkout")
        state_path = args.state_dir / "progress.json"
        state = load_state(state_path, args.repo, queue)
        state["status"] = "running"
        state.pop("error", None)
        save_state(state_path, state)
        try:
            publish_if_due(args, state)
            with preview(args.repo, args.port) as base_url:
                processed = 0
                for problem in queue:
                    previously_terminal = state["problems"].get(str(problem["id"]), {}).get("status") in TERMINAL
                    process_problem(args, problem, state, state_path, base_url)
                    if state["status"] == "stopped":
                        break
                    if not previously_terminal:
                        publish_if_due(args, state)
                        processed += 1
                    if args.run_count is not None and processed >= args.run_count:
                        state["status"] = "run_limit_reached"
                        state["current"] = None
                        break
                else:
                    state["status"] = ("completed" if all(p["status"] == "accepted_local" for p in state["problems"].values())
                                       else "queue_exhausted_incomplete")
                    state["current"] = None
                    entire_catalog = set(state["queue"]) == {str(p["id"]) for p in catalog["problems"]}
                    if state["status"] == "completed" and entire_catalog:
                        publish_if_due(args, state, flush=True)
                save_state(state_path, state)
        except BaseException as error:
            state.update(status="failed", error=str(error) or type(error).__name__)
            save_state(state_path, state)
            raise
        print(json.dumps({"status": state["status"], "state": str(state_path),
                          "counts": {status: sum(p["status"] == status for p in state["problems"].values())
                                     for status in sorted(TERMINAL)}}))
        return 0


if __name__ == "__main__":
    def stop_on_signal(signum, _frame):
        raise KeyboardInterrupt(f"Received signal {signum}")

    signal.signal(signal.SIGTERM, stop_on_signal)
    try:
        raise SystemExit(main())
    except (CampaignError, OSError, ValueError, subprocess.TimeoutExpired) as error:
        print(f"Campaign stopped: {error}", file=sys.stderr)
        raise SystemExit(1)
