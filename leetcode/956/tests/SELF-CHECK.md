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
