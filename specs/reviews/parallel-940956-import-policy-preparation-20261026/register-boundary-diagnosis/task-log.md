# Register-boundary diagnosis (preparation only)

Discipline: `/Users/songyy/Documents/agent-skills/diagnosing-bugs/SKILL.md`. No Pi mutation or dispatch is authorized by this diagnosis.

## Reproduction before hypotheses/fixes

Executed `python3 -B specs/reviews/parallel-940956-import-policy-preparation-20261026/register-boundary-diagnosis/reproduce-before.py` against the frozen original operator SHA `0080dafb379ee39ce413fecc7b36ff80198eae6daccaddd7f0438b0146763e23`. The reviewer supplied the minimal fixture; it calls the real runner `process_problem` register branch in an isolated Git checkout and makes any `run_agent` call fail.

Actual output: the operator expects agent problem 4, but ordinary resume registers 4 without an agent, changes HEAD and advances to problem 10. Its exact-candidate check would reject the real next agent. With 19 accepted/unreleased lessons, the existing gate passes, but that registration makes 20 and reaches publication. Runtime: under one second. No real agent, network or Pi access. `red-reproduction.log` and `operator-before.py` preserve the evidence.

## Ranked falsifiable hypotheses (recorded before fixes)

1. **Phase-blind continuation planning:** selecting the first nonterminal status incorrectly treats `review_passed/register` as an agent stage. If planning explicitly accounts for the deterministic registration prefix, the predicted next agent will match the real runner's problem 10; changing only event freshness will not fix this.
2. **Phase-blind candidate assertion:** a valid registration commit changes the candidate HEAD after policy adoption. If the operator verifies the precise runner-generated registration commit and state delta before validating the new agent candidate, legitimate registration will pass while unrelated commits or acceptance edits still fail.
3. **Incomplete publication budget:** accepted-only counting ignores registrations that the runner will perform automatically. If the guard counts those pending registrations plus imports, the 19-to-20 fixture will be rejected before STOP and checked again at the stopped boundary; thresholds below 20 will remain usable.
4. **Stale event identity alone:** if this were merely a stale persisted-current problem, supplying a truly fresh thread/turn/native child would make the original continuation proof pass. The reproduction already supplies those and still fails with the predicted old problem ID, so this is lower-ranked and already falsified by the minimal fixture.

## Intended test seam

Use the real runner's registration branch to create the resulting commit and metadata. Exercise operator continuation planning and validation against that result; verify both the low-count successful path and the 19-to-20 rejection. Keep the existing stale-run/session/native-child negative cases. Do not fake acceptance, bypass normal registration, disable publication, or edit the central runner/importer.

## Controlled tests and confirmed cause

The focused regression file was added before the behavior change. The original phase-blind planning expression was extracted without changing its result, then two deterministic tests failed: expected problem `4` versus actual `10`, and no exception for projected 19-to-20 registration (`red-tests-focused.log`).

Confirmed H1–H3: `review_passed/register` is nonterminal but does not dispatch an agent. The ordinary runner registers it, may commit deterministic registry changes, marks it accepted, then performs its normal publication check before moving to the next actual agent. Treating every nonterminal entry as an agent stage therefore mispredicts identity, candidate HEAD, and publication budget. Fresh identity evidence alone cannot fix this.

The repair leaves the runner/importer untouched. `resume_plan` predicts the deterministic registration prefix and actual next agent, counting pending registrations and incoming lanes toward the threshold before STOP, at the stopped boundary, after imports and before resume. The real runner performs registration. `verify_registered_resume` then proves its exact per-entry changes, single-parent commit ancestry, registration-only paths, provenance trailers and retained prior registry rows; the new agent candidate must be that proven chain's end. Candidate refresh for an existing pending reviewer is the one ordinary per-entry exception, with prior reviews retained. No acceptance is written by the operator.

Final validation: 11 original guard tests and 6 new register-boundary tests passed in approximately 1.3 and 1.6 seconds. The real isolated runner reproduced the legitimate changed HEAD and next agent, while wrong candidate/review metadata and unrelated successor commits were rejected. Pending registrations plus imports that reach 20 are rejected. The frozen original reproduction was rerun and still demonstrates all original symptoms (`rechecked-original.log`); the repaired seam passes (`green-tests.log`). No Pi, network, real Codex, or publication was exercised.

The first regression command accidentally exposed the imported `CampaignTests` class to unittest discovery, running its larger fake-CLI suite as well. It retained an unrelated macOS fixture-path alias failure in `red-tests.log`. Importing the fixture module rather than the class isolated the intended two-test red loop; no production guard or unrelated test was changed. This is not presented as a clean broad-suite run.

No debug instrumentation was inserted. The frozen bad operator and reproductions remain explicitly under `register-boundary-diagnosis/` for review; they are never dispatch artifacts. Confirmed-cause wording for the eventual commit: **Fix phase-blind continuation planning: registration-only stages advance identity, candidate HEAD and publication count before the next agent.**

Independent operator rereview remains required. No STOP or remote mutation occurred during diagnosis.
