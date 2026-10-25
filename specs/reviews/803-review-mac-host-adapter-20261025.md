# Independent review: #803 Mac host-key adapter

Date: 2026-10-25. Candidate:
`3960c91f27e095983bfe639fede452427eb5bc62`.
Scope: read-only inspection of the original failure, external diagnostic test
adapter, file comparisons and completed result records. No browser or clipboard
test was executed by this reviewer.

**Verdict: approve this narrow test-host adapter. The original failure is a
Linux-shortcut harness mismatch on Mac, not an established product-copy defect.**
The observed positive result is an **adapted-suite pass**, not an unmodified
original-suite pass, runtime repair, whole-lesson acceptance or publication.

## Exact change and preserved contract

Compared `/tmp/leetcode-803-candidate-20261025` with
`/tmp/leetcode-803-mac-host-candidate-20261025`: both contain 115 files, with no
added/removed files. Only `leetcode/803/tests/browser.cjs` differs. Its two changed
lines select `Meta+c` on `process.platform === 'darwin'` and retain `Control+c`
elsewhere, then record the actual host and selected shortcut instead of claiming
Linux unconditionally. The test launches Chromium locally, so the runner platform
identifies this browser host; this inference would not establish a remote host.

Independently computed SHA-256 values agree with
`/tmp/leetcode-803-mac-host-adapter.json`:

- Original test: `371926968912a48ef8f614380e997c14cf012e386457057d3f5d108254e1342b`.
- Adapted test: `fbf8bea9cf6f4def3afd6a724c6c790b797bd441fe80c37a84ed7198b4507362`.

Every assertion remains unchanged, including successful automatic copy, fresh
verified non-source sentinel before each repeated fallback attempt, visible manual
fallback, focus/full selection, exact source readback, download/source equality,
layout and other browser checks. Runtime and canonical source files are byte
identical between the exports. The original parity receipt reports no changed
candidate files; the adapter parity receipt names only the test above.

## Failure and completed adapter evidence

The original `/tmp/leetcode-803-mac-20261025/803/browser.cjs.log` records line 44
failing because Control+c leaves the newly seeded `803-en-0-1792931720145` in the
clipboard. Earlier assertions had verified the reset, full canonical textarea,
focus and selection. The test README explicitly documents Linux Control+C.
The actual bilingual UI correctly instructs use of the system copy shortcut,
rather than incorrectly telling Mac users to press Control+C.

The adapter result was complete when reviewed:
`/tmp/leetcode-803-mac-host-20261025/checks.json` records the browser command exit 0
in 7.015 seconds, and `803/browser.cjs.log` reports 38 recorded states and 11,635
CSS bytes. `803/browser.json` identifies `darwin`; all four fallback records
(two attempts in each locale) identify Meta+c, verified sentinels and exact
transfer. Its errors array is empty. The original failure remains separate and
must not be relabeled as a pass.

This supports actual Mac transfer through the assertion-preserving adapter.
It does not generalize to every host or establish a fresh independent teaching
walkthrough. I did not re-inspect layout screenshots, rerun numerical checks,
exercise clipboard operations or verify public delivery. The result explicitly
describes CSS zoom, not native browser-chrome zoom.

Only this review report was written. No frozen source, Pi/campaign state, score,
acceptance, Git commit or deployment was changed. Preserve both original and
adapted evidence and their identities in the integration receipt.
