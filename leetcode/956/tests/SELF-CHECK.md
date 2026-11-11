# Author self-check — 956-author-1

This is author evidence, not an independent review. Separate acceptance pending.
Official statement/interface verification is in evidence/official-source.md and
its raw GraphQL capture. All changes are confined to leetcode/956/.

## Observed results

- Canonical Python: 1,364 exhaustive arrays, 100 seeded arrays (seed 956), all
  official examples, one rod, impossible partition, duplicate/unused rods,
  maximal individual lengths, n=20/S=5000 and dense n=20/S=4990. Dense optimum
  2495 independently established by the signed-assignment half-join oracle.
  Input remains unchanged. Exact displayed recursive baseline also executed.
- Browser core: 1,370 cases and 7,761 complete prefix maps, each matched to direct
  three-way enumeration; every witness has disjoint input indices and exactly
  the declared support heights. Incoming candidate maxima checked at every gap.
- Chromium: both locales, six presets, all four branch-x choices, all prediction
  options and stale-feedback clearing, independent experiment state, storage
  denial, offline file source, exact automatic/native-manual copy and downloads.
  Native clipboard host is Linux; Control+C used after a fresh verified sentinel
  in EACH locale. See browser-results.json, including semantic excerpts.
- Widths 320,390,736,1440 in both languages; 200% CSS zoom at viewport640 (effective
  320). Final map/witness images read visually: old gap1 shorter7 vs new shorter10;
  selected construction #1:2+#2:3+#4:5=10 against #0:1+#3:4+#5:6=11. Candidates
  from gaps5 and7 both attain10; skipping gap1 yields7 and is dominated. This
  demonstrates a nonzero gap, not a claimed equal-height answer. Final dp[0]=10.
- Screenshots visually inspected for both locale map views at all four widths,
  focused witness views at all widths, zoom views, prediction feedback, desktop
  heading, keyboard focus and forced colors. No overlapping labels/values found.
  Long English witness headings wrap and require more vertical scrolling; the
  complete candidate list/history remains available below. Sticky navigation
  scrolls horizontally by design. No page-level horizontal overflow.
- Solid rendered text/background pairs measured with calibrated sRGB luminance;
  11 unique measured pairs, all >=4.5:1. Main text exceeds 13:1. Muted text on
  panels is 7.07885:1. Focus orange on panel2 is 8.93719:1. Disabled controls have
  opacity1 and readable muted text; control borders reuse muted. Forced-colors
  focus remains visible. No opaque text is measured against an assumed overlay.
- Total served CSS (shared + local): 11,658 bytes, below 25,000. No runtime network
  asset outside the local preview, no console/page/failed-asset errors.
- Related destinations actually rendered in both languages: #805/step2 groups
  subset sums by counts, reads old sets before adding a new item; #920/step2
  merges legal playlist prefixes by used-song count. These teach related state
  summaries, not the same optimization. #805 link activated with keyboard.
- Required root command `python3 -B scripts/register_leetcode_lesson.py 956
  --validate-only`: exit0, stdout/stderr empty. See evidence/preflight.txt.
  No registration, shared registry, acceptance state or reports changed.

## Iterations retained honestly

Initial copy-shape check found numeric preset labels stored as one-string arrays.
Corrected them to exact two-string locale pairs before the passing browser run.
The first browser attempt ran before that correction and timed out at startup.
A second harness attempt tried clicking the already-disabled end control after
processing the only rod in [5]; corrected the test to recognize that legitimate
terminal state without changing the lesson endpoint behavior.

Conservative closed-selector width budget failed: text86.8802 + padding30 +
arrowReserve24 > clientWidth137. This predicate alone does not prove visible
clipping (the retained screenshot shows the selected label). Preserved
select-fit-before.json/png; expanded the selector to width100%, max320,min200.
The unchanged budget predicate now passes at all widths in both locales. A
scroll-highlight screenshot also exposed stale active navigation after jumping;
replaced the observer with an immediate scroll-position calculation, and reran
the browser suite. No independent historical review result was changed.

## Boundary of these claims

No independent teaching audit, novice teach-back, real-device testing, online
LeetCode submission, public deployment, registry integration or acceptance has
occurred in this author run. CSS zoom checks are synthetic effective-width
checks, not a claim of physical-device zoom testing. Browser simulation and
actual canonical Python execution have distinct tests. Independent reviewer
should cold-walk the frozen candidate before reading this file/BRIEF.

## 2026-10-26 · 956-COPY-R1 focused revision self-check (append-only)

Finding mapping: **956-COPY-R1 → copy.js `foot` zh/en values only → fixed
awaiting independent review**. Exact replacement values:

- zh: `本地模拟，无上传、无在线提交。`
- en: `Local simulation, no upload or online submission.`

Runtime before/after identity is recorded in `evidence/copy-r1/before.json` and
`evidence/copy-r1/candidate.json`. All seven runtime files initially matched
accepted base `61c1660d36c3e2b77aa2249c0daeeb60133cb0ae`; after the repair,
app.js, core.js, index.html, solution.py, python-code.js and style.css still
match that base byte-for-byte. copy.js has exactly one changed line (two values).
The regression compares all remaining copy entries against that base, checks
served bytes against the local candidate and keeps the same footer/binding.
No metadata, language selection, source mirror or asset reference needed changing.
The existing copy.js URL serves the new candidate bytes in the supplied preview;
publication/cache invalidation remains outside this run.

Commands from the repository root:

```bash
node leetcode/956/tests/copy-r1.cjs
python3 -B scripts/register_leetcode_lesson.py 956 --validate-only
```

Browser command uses NODE_PATH's installed Playwright and
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH; default preview is the supplied
`http://127.0.0.1:18770/leetcode/956/`. Exit 0; result in
`evidence/copy-r1/green.txt` and `browser-results.json`. Chromium 156.0.8078.4
on Linux; native fallback uses Control+C after a distinct clipboard sentinel is
written and read back **before each locale's attempt**. Automatic copy, native
fallback, decoded offline mirror, DOM textContent and downloaded bytes equal
canonical solution.py exactly, including its final newline, without trimming.

Before repair the same test failed on the actual rendered old Chinese footer;
see `red.txt`. During harness development, an assertion incorrectly expected
the substring `0 → 1` without the intervening label, retained in
`harness-label-failure.txt`. Replaced it with the complete independently expected
localized sentence for old shorter height 0 and new shorter height 1. A second
harness geometry assertion ran during the page's smooth scrolling;
`harness-scroll-failure.txt` retains that failure. Explicit instant bottom-scroll
settles capture; footer boxes use a 1 CSS-pixel allowance for fractional scroll
rounding (observed bottom 900.109375 / 900.3125 in a 900px viewport). No runtime
repair was made for either harness issue. Screenshots show all footer text fully
visible and wrapping; bottom rounding affects padding only.

Observed both locales at 320px and at viewport640/body zoom2 (effective 320px):
exact retained footer, no stale workflow wording or replacement acceptance claim,
no console/page errors, no failed requests or orphan footer. Inspected all four
`*-footer-*.png` images: English wraps naturally to two lines; Chinese stays
readable; neighboring #805/#920 labels wrap without collision and keyboard focus
is visible. Copy→Tab reaches Download, and #805→Tab reaches #920 with a 3px outline.

At `[1,2,3]`, after two rods, inspect gap1: old h=0, new h=1; skip candidate
h=0 is dominated and shorter-side candidate h=1 survives. Hand calculation:
heights 0,1 become 2,1, giving gap1/shorter1. The complete formula retains
`(|d−x|, h+min(d,x))` in both locales. Rewind/replay restores the full trace.
zh→en→zh preserves preset0, frame2/3, gap1 and the revealed correct independent
prediction `(1,8)`; prediction asks only shorter-side candidates from `(3,2)`
and `(3,5)`, not a full-input optimum. `sim`, `p4`, `boundaries` and every other
copy entry are unchanged and rendered in their proper locale. No cumulative
operation-count UI is added or changed; progress remains processed rods.

Canonical Python was actually executed via `python3 -B`/`runpy.run_path` on
`[1,2,3]→3`, `[1,2,3,6]→6`, `[1,2,3,4,5,6]→10`, `[1,2]→0`,
`[2,2,2]→2`, and fresh `[3,4,7]→7`, asserting unchanged input after each call.
Direct JSON decode of python-code.js matched canonical bytes, and a pre-evaluation
key scan found no duplicate copy keys. Existing official.json was inspected:
frontend ID956 includes faithful Python3 `tallestBillboard` and TypeScript
interfaces. Python remains the preferred canonical language; there is no
supportedLanguages list omitting it, and no non-Python contract is required.
Broad numerical suites were intentionally not rerun for this prose-only repair,
as requested by the report; historical evidence above remains historical.

Required metadata preflight: exit 0, no stdout/stderr. Full command/result is in
`evidence/copy-r1/preflight.txt`; complexity remains the original nonempty
`O(nS) expected time; O(S) auxiliary space, S = sum(rods)` string.
This is author evidence only. A fresh reviewer must close 956-COPY-R1 against
the new hash manifest; no independent acceptance, submission, real-device or
public-delivery claim is made. No registration, reports, campaign state, shared
files, services, commits or deployments were changed.
