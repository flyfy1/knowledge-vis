# Author self-check — 1012-author-v1

Status: complete author candidate; independent lesson review pending. Author: current Codex run, exact model identifier unavailable. This is not a separate review, LeetCode acceptance, novice teach-back, registration, deployment or public-delivery verification. Runtime copy contains only stable learner-facing limitations.

## Official evidence

Official URL: https://leetcode.com/problems/numbers-with-repeated-digits/
Public GraphQL capture: official.json, including access timestamp, request and full response. Verified frontend1012/internal1057, Hard, public, positive inclusive [1,n], at least one repeated decimal digit, 1≤n≤10^9, official examples20→1/100→10/1000→262, and actual Python3 class Solution / numDupDigitsAtMostN(self,n:int)->int snippet. Complete observed snippets are retained. Python preferred; no non-Python exception/contract is needed.

## Commands and observed outcomes

From repository root:

- `python3 -B leetcode/1012/tests/test_solution.py` — exit0. 5,216 canonical executions: exhaustive upper bounds1..5000 against direct cumulative scanning, official/degenerate/large boundaries and 200 seeded large bounds (seed1012) against an independent direct repeated-digit DP. That oracle uses position, digit mask, repeat flag, tight bound and leading-zero state, not complement permutation blocks. 20 instrumented canonical intermediate invariant checks. Browser core:351 oracle fixtures,8,681 frame invariants,1,926 independently enumerated small groups. Exact mirror equality and86 unique bilingual keys checked. See numeric-results.json.
- `node leetcode/1012/tests/browser.cjs` — exit0, Chromium on Linux (exact browser version in browser-results.json). Both locales, all6 presets =12 complete runs; every forward/back/forward is byte-identical for algorithm state; reset and both endpoints verified. All3 quiz options, reveal/change clearing, cross-locale preservation, preset isolation, hand reveal/hide, meaningful rendered formulas and feedback checked. Canonical source textContent, native clipboard, manual fallback and downloads match exact737-byte source including final newline. Each locale has its own freshly verified non-source clipboard sentinel before real Control+C fallback. The source is never written into the clipboard by the fallback harness.
- Same browser command —16 layouts: EN/zh ×320/390/736/1440 ×1/2 CSS zoom. No page overflow, no state-card/ledger internal overflow, controls≥48 CSSpx, closed native selector width budget passed with24px arrow reserve. At320/200%, selector client width124 versus required81.456px in this Linux font environment. Core text16.087:1; current card10.910:1; disabled text6.449:1 (minimum measured normal-text pair), focus8.937:1 or higher. Contrast helper calibrated against black/white=21, primary luminances and#747474 on black≈4.492948<4.5. Forced colors and reduced motion exercised.
- Same browser command —real keyboard Enter on operation/nav, focused3px outline, related links activated with keyboard at320px in both locales. Source details, locale change and quiz state preserved. Blocked localStorage and file:// offline trace/source render. No page/console errors, failed/local404 requests or external runtime requests. CSS total11,589 uncompressed bytes.
- `node leetcode/1012/tests/visuals.cjs` — exit0. Additional focused card captures avoid sticky overlay artifacts in tall element screenshots.
- `python3 -B scripts/register_leetcode_lesson.py 1012 --validate-only` — exit0, empty stdout/stderr; preflight.json records exact command/cwd/time. No registration or shared file edits. lesson-entry complexity is one string covering time and space.

Tests use OUTPUT_DIR for emitted results/screenshots and respect the configured Chromium executable. README documents reproduction. build_html.py/build_copy.py are local authoring helpers, with OUTPUT_DIR for non-mutating comparison generation.

## Visual inspection and mathematical binding

The author opened actual screenshots, not just their file paths. Inspected bilingual hand classification, wrong-pair counterexample, fresh quiz explanation, stop event, narrow320 and390 traces, desktop ledger,200% header/formulas/focused state cards, source panels, related-link labels and forced-colors state.

Representative completed operation n=321,frame9/12: equal prefix32,used[3,2], current smaller block320 has P(7,0)=1; cumulative251; final answer remains “Not finished”. Ledger increments9,81,72,72,8,8,1 sum251; current card has both a cyan border and explicit “just-completed addition” text. Rewind/replay preserves this accounting. At endpoint, include321 contributes1,unique252,321−252=69. Prefix describes the equal path, while the separate current block describes numbers already counted; they are deliberately different roles.

Rendered central formula in both locales is complete: shorter s gives9×P(9,s−1); smaller choice at zero-based i givesP(9−i,D−i−1). n=100 stop reads used0 again at position2, final100−90=10. Fresh exercise n=121 gives90+8+1=99 unique,121−99=22; prefix10 excludes both100 and101, so zero and nonadjacent repetition are both accounted for. Option21 wrongly admits101; option23 misses120. Changing answers clears feedback, and locale switching retains its meaning.

Some tall .stage/.state element screenshots contain a sticky-nav stripe at a capture-dependent position. This is a screenshot stitching artifact, not a claim that hidden labels are legible. Focused-prefix/used/unique/result captures place each actual card below the sticky bar and independently show the complete label/value association at320/200%. Desktop and ordinary viewport captures corroborate it. At200% text reflows vertically; no tiny shrink-to-fit or data clipping is used.

## Related links observed

Both the inline first-use and related links use existing preview routes, not presumed anchors. #60/#step1 explains unused sorted digits, fixed-next-digit blocks of(m−1)! and lexicographic boundaries, matching “equal-size permutation blocks”. #902/#step1 derives shorter lengths and first-smaller-digit suffix groups under a bound, matching “counting digits under a bound”. Full observed bilingual destination text and resolved hrefs are in browser-results.json; 320px keyboard activations and labels captured. Their presence in this preview is verified; public release availability requires the later release gate. Target source hashes are bound in candidate-manifest.json.

## Author iterations / limitations

Before freeze, direct checks corrected an erroneous test expectation133→24 to the enumerated25; the implementation already returned25. The duplicate-key harness was fixed to inspect every authoring tuple, including multiple tuples on one line. Narrow200% checks exposed intrinsic selector/control widths and an unbroken quiz formula; local responsive padding/wrapping, a short numeric10⁹ label, full-width narrow controls and the official-link48px override fixed them. These were author iterations, not independent reviewer findings. Full final suites pass.

No actual novice comprehension, physical device, macOS/font environment, native browser-menu zoom, live submission or production deployment was tested. CSS zoom=2 is the stated reproducible layout stress. No network execution/Python engine runs inside the lesson. No loading/reconnect lifecycle applies to static runtime. Independent cold walkthrough, six-dimension scoring and release remain for separate authorized runs. No acceptance badge or transient workflow status is shipped in learner copy.
