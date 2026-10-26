# #1092 capacity failure: read-only recovery audit

Observed 2026-10-26 14:05:04 UTC. **Confirmed cause: the provider returned “Selected model is at capacity. Please try a different model.”** Both `error` and `turn.failed` events contain that message. The reviewer exited 1 at 08:33:32 UTC, before a final JSON/verdict. Its partial report explicitly ends “Source and extended browser audit pending.” This is neither a lesson rejection nor evidence of available capacity now.

The health assertion ran red. Ranked hypotheses were recorded before probes in task-log.md. No distinct local failure is evidenced in this run; stderr is empty. Older runner.log publication traces belong to earlier runs and are not this failure. No recovery was attempted, so no green runtime claim is made. A first read-only audit command lacked Node in SSH PATH; its stderr is retained, then the audit used the existing launcher's PATH and passed. This audit tooling issue is separate from the original capacity failure.

## Verified boundary

- HEAD, saved expected_head and #1092 candidate all equal `5cf73ee858d9a8938b55206c867233a8397d60f6` on `codex/all-hard-20261018`.
- #1092 remains `review_pending`, phase `review`, rounds 0, no reviews. Original failed run `1092-review-7c8ae6c3edaf` and session `01a17756-56f8-7b23-804b-e4f0d0c338fc` remain recorded.
- Candidate required-files/metadata/source validation passed. Lesson tree `4394c608d3e049bb4159fd9b48d068b421bf0ea2`; canonical SHA `14d22228824f7a8e8268b546be296e51753fc2745ad53354123a58ab5e1b9868`.
- No process with central checkout/state arguments or checkout cwd was found. Known runner is gone; preview port18770 has no listener. Existing runner, checkout and release locks have no owners in `/proc/locks`; no lock was acquired by this audit. STOP absent.
- Queue has 984 IDs in exactly the launcher's catalog order. State contains 177 accepted_local, 42 blocked and one review_pending. Ledger has 158 released and no pending release. Actual unchanged `_reviewed` API plus digest comparison yields 19 eligible IDs, listed in capture.json; no ledger candidate pointers were refreshed.
- Progress SHA `d18e25bf3e3ee2a8b7907ee0c62c14776daba2c9ea3f9bc4191b3265d43286be`; ledger SHA `acfe8d78b6c416364ef04aa35bc3e825f26ca2bdbddd57417b1d8f9b6b6e962e`. Both byte-identical after the audit.
- Remote campaign head is still `faff333c35e1e553e787762361d5febd048a19c1`. No push was performed. This is a durability lag, not a load_state mismatch; any exact-head push is a separate authorized action.
- Runtime and prompt hashes plus launcher bytes are preserved. Launcher SHA `94056740463e5f9ec4fe63d0d2c56d1ccbf1ab60556f7952580fe58512127e70` retains gpt-6.1-sol via runner, continuous984 queue, max-rounds override, preview18770 and publication every20.

## Minimal recovery proposal — not executed

1. Freshly revalidate all observed identities, policy hashes, absent workers/locks/STOP, publication bound and the exact dirty set below. Refuse drift rather than overwrite it. Acquire the existing state and checkout locks for the short quarantine transaction; no active process is interrupted.
2. Create one new exclusive external recovery evidence directory under the state directory. Copy and hash-verify progress, ledger and the original failed-run directory. Preserve their bytes in place. Copy each exact untracked partial artifact below into that external directory retaining its repository-relative path; verify source/destination hashes, then remove only that verified source file. Retain a source→archive mapping and immutable receipt. No git reset, clean, commit, shared-file change or acceptance rewrite is needed. An atomic same-filesystem move after verified copying is also sufficient. Do not commit the partial review into the candidate merely to make Git clean.
3. Require a completely clean checkout and identical HEAD/progress/ledger/accepted entries/runs/queue after quarantine. Release the short operator locks before the normal runner acquires them. Run the existing detached wrapper **once**, from an authorized dispatcher with an exclusive receipt:

   `python3 -B /home/songyy/projects/leetcode-hard-campaign-state-20261018/launch.py --continuous --max-rounds 6`

   The wrapper already detaches its child and appends runner.log. Do not wrap this in a retry loop, change models silently, edit progress.current/status/error, reuse the failed review session, reset rounds, or launch obsolete1001/1012 lanes.
4. Observe the exact returned PID, then a genuinely new #1092 review run/session, native child/output/cwd and fresh events. `load_state` preserves all existing objects; main changes status to running and removes the top-level error; `run_agent` appends the new run and replaces current. The old failed run remains failed. The new report has round1 plus a new unique suffix. The old partial cold walk must not be passed as completed review evidence.
5. Startup has 19 eligible and no pending release, so it should not publish immediately. A later independently accepted/registered #1092 can naturally make20 and trigger the already authorized publisher. Check its actual receipt/public verification then; never count attempted reviews as accepted. If capacity fails again, preserve its new run, partial files and exit state and report—no automatic retry.

Exact quarantine scope (all currently untracked):

| Path | SHA-256 |
|---|---|
| `specs/reviews/1092-evidence/1092-review-1-326032ac/cold-complete.png` | `7da67d4f007153921d862aafeee2038f799f6d71a049de5f6a836578e4bdb8fe` |
| `specs/reviews/1092-evidence/1092-review-1-326032ac/cold-initial.png` | `96997fffa56358354a32acf81ef9ebc9cdbda3003ba32e535b5ed9e2c3bc944b` |
| `specs/reviews/1092-review-1-326032ac.md` | `e83d2fa760d83ed91c99ead638f154970d64cf72604c0491934293c9fcfcaefa` |

The production #42 wall-lab change in main5d5b73cd touches only #42 lesson assets/tests/review. #42 is not in the19 eligible IDs. The existing publisher writes selected lesson routes and collection assets, not unrelated lesson42 files. Recovery must neither merge main into the campaign nor deploy/reset production. Preserve the separate #42 production work; no production bytes were changed by this audit.

`capture.py` is a read-only evidence collector, not a recovery dispatcher. `preserved-files.json.gz` stores base64 exact failed-run files, the three partial artifacts, launcher and relevant runtime source. `capture.json` binds hashes and process/lock/current observations. No commit, push, source adoption, STOP, provider request or worker launch occurred.
