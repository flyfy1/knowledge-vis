# Lesson 23 — required-finding author self-check

Date: 2026-10-18. Scope: lesson 23 only. Base independent report:
[23-review-1-8b9525f6](../../specs/reviews/23-review-1-8b9525f6.md).
This is implementation-run evidence, **not independent acceptance**. Candidate is
the working-tree files identified by `evidence/candidate-hashes.json` (no commit).
Both findings are **fixed awaiting separate independent re-review**; the report
and frozen rubric were not edited. No publication or LeetCode submission claimed.

## LC23-R1 — construction and mutation bridge

Step 01 now defines node.val/node.next/None, judge-supplied ListNode, the Python
list of heads, and the returned head object. Its five-node hand calculation names
all identities and candidates through every selection, including ties.

Step 03 adds the requested equivalent concrete table within existing components:
default events 0, 1, 3; dummy/tail aliasing; D.next None → 0:0; then
0:0.next 0:1 → 1:0 and tail 0:0 → 1:0. Each row shows the actual reachable chain.
The table is clearly labeled as a fixed reference for the default preset, not a
live pointer view of other presets. The ledger paragraph explains the temporary
unprocessed suffix, event 2 retaining 0:1 in the heap before event 3 overwrites its
incoming link, and node.next surviving the old tail's mutation so event 4 can
insert 1:1. Input rows are explicitly original order, not current next fields.
Step 05 explains allocation, variable movement, reuse, termination and dummy.next,
including empty return. A numerical heap repair and whole-list counterexample
also make the optimization gradual. Existing fresh prediction remains hidden
until explicitly checked, with feedback for all three misconceptions.

Evidence: `evidence/solution-check.json` records actual canonical Python pointer
snapshots, agreeing with both table transitions. `en/zh-320-linkBridge.png`,
`en/zh-390-linkBridge.png`, `en/zh-736-linkBridge.png`,
`en/zh-1440-linkBridge.png` show bilingual layout; filename `en/zh` here denotes
separate `en-...` and `zh-...` files. Native-zoom table screenshots also show the
same old/new values. Narrow tables wrap within their container; code retains its
internal scroller. Inspected EN and ZH small-screen tables and diagrams and
larger-screen table captures; no page overflow or clipped table data observed. Some tall normal-width element
captures include the sticky navigation over prose; the native viewport captures
position each target below the navigation and confirm access to that text.

## LC23-R2 — native 200% browser zoom evidence

Test-only unpacked Chromium extension, under `tests/zoom-extension`, invokes the
actual `chrome.tabs.setZoom(2)` / `chrome.tabs.getZoom` APIs. In both locales the
API returns 2; at a 1440×1000 configured viewport innerWidth changes 1440 → 720,
devicePixelRatio 1 → 2, while computed CSS zoom stays 1. Document scrollWidth is
720. This is native page zoom, not CSS zoom, pinch zoom, or a device-scale-only
substitute. The isolated temporary browser profile is removed on completion.

Both locales preserve the exact event-3 trace and selected/revealed quiz state
through zoom. Keyboard Enter advances, Space rewinds to the identical snapshot,
ArrowRight changes the range, Reset restores event 0, and switching to all-empty
disables Next. Sticky navigation lands with the heading below the bar.

`evidence/browser-check.json` records API and DOM measurements. Screenshots
`en-native200-*.png` and `zh-native200-*.png` capture the hand calculation, table,
ledger explanation, diagram, heap, emitted ledger, controls and Python bridge.
Native-zoom Playwright surface captures were blank on this Chromium build; final
evidence uses `Page.captureScreenshot({fromSurface:false})` to capture the actual
compositor viewport after positioning content below the sticky bar. Captures are
populated and inspected. Long sections require scrolling, as at ordinary zoom.
This verifies headless Chromium native page zoom; physical devices and other
browsers remain untested.

## Executed regression and parity evidence

Commands, from repository root:

- `python3 -B leetcode/23/tests/check_solution.py`
- `NODE_PATH=$NODE_PATH node leetcode/23/tests/check_browser.cjs`
- `git diff --check`

Python: 8,412 cases, including all 8,000 triples of nondecreasing -1/0/1 lists of
length 0–3, 400 seeded random inputs, fresh negative/empty/tie case, the
[[1,100],[2,3]] counterexample, value boundaries, k=10000 empty or singleton lists,
and N=10000 with list lengths 500. Independent sorted-value oracle, exact original
node identity set, deterministic tie order, unmodified node values/head-array,
no cycles, and actual default pointer snapshots pass. This executes solution.py
in Python 3 with a judge-shaped ListNode, not a translated implementation.

JS model: 1,005 inputs and 7,327 frame checks pass: source uniqueness, heap parent
ordering, exact eligible heads (with the documented pending source after a pop),
emitted-prefix order and final independent sorted oracle. Inputs are not mutated.

Browser: both locales at 320/390/736/1440 and native 200%; all presets and endpoints,
rewind/replay/reset/slider, all prediction choices and stale-feedback clearing,
locale/resize state preservation, keyboard, internal links/deep targets, denied
clipboard and localStorage, and file:// offline rendering pass. No lesson page,
console or HTTP errors; any missing site favicon is separately excluded in the
browser log as unrelated shared-site metadata. Canonical solution.py equals its exact python-code.js JSON export,
displayed code, actual clipboard readback, streamed download and offline display.
Canonical solution/mirror are unchanged, so regeneration was unnecessary.

Registration policy read exactly: Python uses solution.py / python-code.js /
PYTHON_SOURCE. No non-Python contract or supportedLanguages array exists here;
faithful preferred Python is retained. The [official problem](https://leetcode.com/problems/merge-k-sorted-lists/)
was re-read and confirms the linked-list return, sample values and numeric bounds.
All additional changes are lesson-local prose, existing HTML table elements,
BRIEF and this evidence. Shared assets, registry, scripts, other lessons, services,
review report and rubric remain outside the change. The outstanding next action
is separate independent review of this identified candidate, especially the cold
linked-list teach-back; author tests cannot establish novice comprehension.

Inherited presentation check: added table body #e8edf4 on #0d1117 = 16.09:1; table headers #9aa7b8 on #0d1117 = 7.74:1; prose #c9d4e2 on #0a0e14 = 12.89:1 (sRGB contrast). No CSS or focus/disabled semantics changed. One final browser run closed
unexpectedly before finishing; restarting the same test passed all assertions.
No product change was made in response. The final successful browser log is the
retained browser-check.json; no claim is based on the incomplete run.
