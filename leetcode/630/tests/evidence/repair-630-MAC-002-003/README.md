# Follow-up candidate: author evidence only

Required native Mac check remains pending. This Linux run cannot close
630-MAC-001 or provide the requested new-candidate Mac rerun for 630-MAC-003.
The preceding report and its evidence remain historical and unchanged.

candidate.sha256 freezes all lesson files outside tests/evidence, including test
sources and author notes. candidate.json identifies the manifest and records
shared read-only dependencies. Verify from the repository root:

```sh
shasum -a 256 -c leetcode/630/tests/evidence/repair-630-MAC-002-003/candidate.sha256
```

On native Mac, serve the verified candidate with the usual preview workflow
outside this task. Use native installed Playwright Chromium (unset the Linux
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH), set PREVIEW_ROOT to that server, and set
OUTPUT_DIR to a new directory outside the frozen candidate for each command:

```sh
node leetcode/630/tests/preset-probe-original.cjs
node leetcode/630/tests/preset-labels.cjs
node leetcode/630/tests/browser.cjs
node leetcode/630/tests/clipboard-transfer.cjs
```

The first command is the unchanged original probe (same SHA-256 as the previous
native Mac report's original-preset-probe.cjs). It must pass on native Mac, not
under a Linux wrapper. Retain candidate receipt, browser/platform, all results,
and inspected selected-control screenshots (especially 320px replacement,
impossible and ties, EN/ZH). The clipboard test must report Meta+C on Mac,
sentinel present before copy, complete focused selection, exact source after
copy, and a no-action sentinel control which fails source equality. Do not write
canonical data into the clipboard to make the manual-transfer assertion pass.
Then obtain separate independent review; author checks do not close findings.

Local commands and finding mapping are appended to ../../../SELF-CHECK.md.
The red scope assertion is recorded in red-feedback.json. All current final
result files report pass; Linux-only original-probe results are under
linux-original/. A paired crop harness initially failed due to screenshot
coordinate scope, then passed with fullPage capture; this was not a lesson bug.
