# Independent Mac copy-adapter review — #745

Date: 2026-10-25. **Pass for this host-test adapter and focused source-transfer
check; no current runtime failure found.** This is not a new whole-lesson
acceptance or public-delivery claim.

Accepted candidate: `4a3d34fb6f4093b5e73a614d16d9a4bcf59107ca`.
Frozen batch tip: `5887fa0c63eb5eaa3b1966eecb903c4a707030a5`.
Both have #745 tree `9f3c7de59b9c104bac3d8e531e11231d82dbd274`.
All 35 tracked #745 files in the frozen archive match that Git tree; all 968
archive files stayed byte-identical through both executed checks, with no files
added. The temporary localhost server on port 18770 was shut down afterward.

## Adapter and execution evidence

The original Mac failure at `tests/browser.cjs:71` is retained in
[original-mac-failure.log](745-evidence/mac-copy-review-20261025/original-mac-failure.log):
Control+c left `745-native-copy-sentinel` unchanged. It is not reported as a pass.

The reviewed adapter requires `darwin`, requires exactly one matching copy
command, and substitutes only `Meta+c` for `Control+c`. It compiles the resulting
test with the original filename and module-resolution paths. All assertions and
runtime files remain unchanged. Its receipt explicitly corrects the original
suite's stale result-label text, which still says “Linux Control+C.” The actual
execution was local Mac Chromium 151.0.7922.34 with Meta+c.

- Original test SHA-256: `c6541d2922416cb3d0759d4675fdffdbcd2b15adedf754edb75e16af89dfe733`.
- Adapter wrapper SHA-256: `d74a7e546555551a954472ee8c589fb7ec365b39d1b486f73a8d2bb8beafe17c`.
- Derived test SHA-256: `48523471680b6f621db6db909708a895d47226fdea8223a1e7d385e616d41db1`.

Executed the complete original assertion-preserving suite through the wrapper;
exit 0. Its eight locale/viewport states plus zoom, source transfer, keyboard,
storage and contrast checks passed. See the exact command and identities in
[receipt.json](745-evidence/mac-copy-review-20261025/receipt.json), and the separately
stored `adapted-suite/` output. This is an adapted-suite pass, not an unmodified
Mac-suite pass. The approach conforms to rendered-state contract section 4's
explicit host-shortcut adapter boundary.

## Independent per-locale transfer check

A separate focused probe used a fresh browser context and a fresh, distinct
non-source sentinel for **each** of English and Chinese. It verified that the
sentinel was actually in the clipboard before denying only `writeText`, then
clicked the real lesson Copy control. Each fallback held the exact canonical
405-character source, with focus and selection `0..405`.

For each locale, Control+c retained that locale's sentinel; Meta+c then replaced
it with the exact canonical source. String equality and UTF-8 byte equality both
passed, including the final newline, without trimming or normalization. The
probe never wrote the expected source into the clipboard. The source/display
and clipboard hash was
`f1e4b4da6652b7a25b26648e9765054a683600c3db5c7ad038c36597dea1a259`.
Localized fallback instructions and both screenshots were inspected; no page
errors occurred. See [focused results](745-evidence/mac-copy-review-20261025/focused-results.json)
and the adjacent reproducible probe.

## Reusable test finding: reset the sentinel for every attempt

**745-TEST-COPY-LOOP-01 — test-evidence coverage gap.** The frozen suite seeds a
sentinel once before its two-locale fallback loop. After English copies the
source, a failed Chinese copy could read that same prior source and still pass
the equality assertion. Preserving that original test is correct for this
adapter, but its second-locale result alone does not prove a second transfer.

The independent fresh-sentinel probe closes that evidence gap for this exact
candidate. For future tests and separately reviewed guidance, reset **and verify**
a distinct non-source sentinel before every locale/fallback attempt, even inside
one loop. Then perform focus/selection, native copy, and exact readback checks.
Do not seed only once outside a loop or rely on previous successful clipboard
contents. No policy edit, retrospective acceptance change, or frozen-test mutation
is made here.

Only this review and its evidence were written. No implementation, campaign,
release ledger, commit, or deployment was changed. The confirmed issue was the
host shortcut in the harness; the focused checks provide positive evidence of
actual fallback transfer on this Mac, not proof for other browser hosts.
