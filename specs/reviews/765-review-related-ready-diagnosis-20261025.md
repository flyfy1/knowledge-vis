# Independent diagnosis: incomplete #765 verification export

Date: 2026-10-25. Candidate `3193aec4bdbbb13e094664e0de79cac6039f538a`.
Incomplete export: `/tmp/leetcode-765-repaired-candidate-20261025` (212 files).
Evidence: [mac-related-ready-20261025](765-evidence/mac-related-ready-20261025/).

**Confirmed cause: the dispatcher verification fixture omitted #41's shared
`hard-first-ten` dependencies. This is not a demonstrated #765/#41 source defect
or a navigation-readiness race. Do not add waits or weaken the assertion.**

The original full suite's failure at `test_browser.cjs:84` is preserved in
`original-suite-failure.log`: after following the actual related link, the target
section did not contain `x−1`. A focused real-browser loop reproduced failure;
waiting for that same rendered predicate timed out after 30 seconds. Ranked
falsifiable hypotheses were then recorded in `hypotheses.md` before differential
tests: missing export dependencies, readiness timing, changed target content.

## Differential evidence

Mac Chromium 151.0.7922.34, fresh context per trial; native Enter activates the
actual #765 related link. Two unchanged-export trials both show:

- HTTP 404 for `leetcode/hard-first-ten/style.css`, `core.js` and `lesson.js`.
- Runtime `ReferenceError: HardModels is not defined` in the target.
- Immediate and delayed section content remain uninitialized; `x−1` is absent.
  The document reaches `complete`; an additional 1.8-second rendered wait still
  fails, as did the initial 30-second wait. Clicking Chinese cannot render `交换`.

A third diagnostic trial supplies **only those three missing responses** from
the exact Git candidate through a browser response overlay. It changes no file
or assertion. The immediate original `x−1` condition passes, the settled condition
passes, and switching to Chinese exposes `交换`. There are no HTTP failures or page
errors in that trial. `differential.json` retains complete immediate/settled text,
errors, response statuses and overlaid asset hashes. Inspected screenshots show
blank controls in the incomplete fixture and the initialized translated target
after supplying the missing dependencies.

`fixture-receipt.json` confirms all three files are absent from the new export but
present in the earlier `/tmp/leetcode-765-778-candidate-20261025` export. Those old
bytes exactly match candidate 3193aec; no changed target semantics are needed to
explain the difference. All 188 present #765/#41 files checked after the probes
also match the candidate's Git bytes. The incomplete 212-file fixture was preserved.

## Correct next action

Create a **new**, complete immutable export of the same candidate, including the
referenced `hard-first-ten` assets. Verify its manifest, then rerun the unchanged
six-check workflow/full browser suite against that complete fixture. Preserve the
old failed export and failure evidence. No lesson source, synchronization wait,
host adapter, acceptance score or policy change is justified by this diagnosis.

The overlay is causal diagnostic evidence, not a complete-export or full-suite
pass. The dispatcher must retain the new full verification receipt before closing
the Mac check. This report does not accept/publish the candidate or authorize a
central-state mutation.

## Commands and boundaries

Served the incomplete frozen tree using `python3 -m http.server 18866 --bind
127.0.0.1 --directory /tmp/leetcode-765-repaired-candidate-20261025`. Ran the archived
`baseline.cjs` and `differential.cjs` with the installed Playwright package through
`NODE_PATH=/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules`.
The baseline terminates with the recorded 30-second readiness timeout; the
differential runner exits 0 after recording both red fixture trials and the green
diagnostic overlay. That exit is not a full-suite success.

The local diagnostic server is stopped. Only this report, its evidence directory
and temporary probe scripts were written. No frozen source, main implementation,
central/Pi state, commit or deployment was modified. No clipboard access was used.
