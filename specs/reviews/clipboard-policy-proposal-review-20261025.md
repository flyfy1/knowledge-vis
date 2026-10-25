# Independent review: native clipboard verification proposal

Date: 2026-10-25. Scope: the proposed clarification in
[leetcode-native-clipboard-checks-20261025.md](../proposals/leetcode-native-clipboard-checks-20261025.md),
the retained #639 Mac evidence, and section 4 of the existing rendered-state
contract. This is a policy proposal review, not a lesson acceptance or an active
policy change.

## Verdict

**Approve for dispatcher adoption at the proposed safe boundary. No required
changes found.** The proposal preserves the exact-source gate while distinguishing
a test shortcut error from an application copy failure. It does not authorize
acceptance from a harness correction or retroactively alter frozen evidence.

## Evidence checked

- The [dispatcher report](639-review-mac-candidate-20261025.md) identifies candidate
  `b96c90a99bc3eb8b09b07e14e977fe380053df98`, native Mac Chromium
  `151.0.7922.34`, the original suite's failure, and the adapted suite's pass.
- The retained [probe](639-evidence/mac-candidate-b96c90a-20261025/clipboard-probe.cjs)
  launches a local Chromium browser and creates a fresh context for each shortcut
  case. Its [results](639-evidence/mac-candidate-b96c90a-20261025/clipboard-probe.json)
  show active focus and selection `0..764` in all three cases. Control+c leaves the
  sentinel unchanged both immediately and after 200ms; Meta+c transfers the
  compared source. This supports the reported shortcut cause in the observed
  environment. It is not an exhaustive browser or operating-system experiment.
- A direct diff of the retained original and adapter shows one replacement only:
  `Control+c` becomes `process.platform === 'darwin' ? 'Meta+c' : 'Control+c'`.
  Both SHA-256 hashes were recomputed and match the retained
  [receipt](639-evidence/mac-candidate-b96c90a-20261025/receipt.json).
- The probe alone compares clipboard contents with displayed code. The full
  suite separately reads canonical `solution.py`, checks displayed text against
  it, seeds a distinct clipboard sentinel, checks fallback contents, focus and
  full selection, invokes the native shortcut, and requires clipboard equality
  with the canonical source. Download and offline display checks remain intact.
  Thus the proposal's exact-source claim is supported by the combined evidence,
  not by assuming the displayed code is canonical.
- The retained adapted browser result says `passed` and contains no runtime
  errors. Its generic result type still says `author browser self-check`; the
  dispatcher report and receipt identify its actual use as a Mac platform check.
  This review does not reinterpret that result as independent lesson acceptance.

## Technical and scope assessment

The browser-host distinction is correct. The retained adapter's use of
`process.platform` is justified for its local `chromium.launch()` execution. It
would not establish a remotely hosted browser's operating system. The proposal
explicitly prevents that inference and also excludes locale, viewport and
user-agent emulation as evidence of the host shortcut. No remote-browser claim
is made from the local #639 experiment.

The sentinel requirement prevents a previous successful copy from satisfying the
fallback check. Requiring actual copy plus readback prevents DOM selection from
being reported as clipboard transfer. Prohibiting a test-written canonical value
preserves the behavior under test. The proposal also retains section 4's explicit
clipboard newline-conversion boundary and exact mirror/download requirements;
it does not introduce trimming or normalization to obtain a pass.

The adapter allowance is appropriately narrow: preserve the original failure,
diagnose it, change only the required host shortcut, retain assertions, and bind
both tests and results to the same candidate. An unavailable clipboard readback
remains a verification gap. That clause supplies no waiver of the source-parity
gate or acceptance workflow.

The adoption boundary is appropriate: apply the reviewed clarification to future
candidates only after active lanes have been imported at a safe boundary, so
their policy fingerprints remain stable during review. Deferring a shared
clipboard framework, a full platform matrix, and retroactive accepted-lesson
edits is proportionate to the demonstrated failure. There is no runtime, UI,
algorithm, rubric, or scoring change to review here.

## Limitations and handoff

This review inspected retained source, results, hashes and policy text. It did
not rerun the candidate, access the network, edit runtime or active policy files,
change Pi state, or register lesson acceptance. Dispatcher adoption must still
check the actual campaign boundary and preserve existing review history.
