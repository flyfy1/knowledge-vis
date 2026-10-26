# #1095 author self-check — frozen c1

Status: complete author candidate, independent review pending. This is the implementer's own verification, not a separate review, actual novice teach-back, accepted LeetCode submission or publication. Exact model/run identifier unavailable. Identity and shared-policy dependencies: candidate.json. Official evidence: ../../provenance/official-graphql.json and official-verification.md.

## What the learner can inspect

1. In [1,4,2], three retained reads distinguish return index2 from a requested height. A left-to-right first-match scan is correct but can need10000 gets, exceeding100.
2. On [1,5,4,3,2], compare4>3, then5>4, then1<5. Each retained interval still contains peak1. Whole-array ascending binary search for3 instead discards the true index3. This supplies the causal reason for separating slopes.
3. Visible tiles distinguish still-possible indices from just-read indices; both markers coexist. History stores exact old/new intervals, values and cumulative call counts. Frames are after a comparison or phase change; no omitted events. Two sides share the target; independent hand and prediction experiments do not share trace state. Left-side priority establishes minimum index even when both sides contain the target.
4. Fresh prediction [0,3,8,6,4,1],target6: descending midpoint4 has value4. All positions at or right of4 have value≤4, so [3,3] remains; get(3)=6 returns3. Opposite direction and premature absence are explained after explicit reveal. Changing choice clears the feedback; locale retains its meaning.
5. Exact official Python method uses only length/get, three loops, no caching or mutation. Every loop shrinks; peak loop2 calls per round, side searches1 each; at most56 gets at official n≤10000. JS snapshots/full-array teaching view are explicitly separated from executing Python and from submission O(1) auxiliary space.

This reading is an author walkthrough. It cannot stand in for the future independent cold walkthrough or prove learning outcomes.

## Computational evidence

- python-results.json: actual Solution.findInMountainArray through strict counted MountainArray mock; independent linear first-match oracle.42,359 cases:41,712 exhaustive,600 seeded,5 explicit examples/value boundaries,42 length10000 cases with peak near either end or center. All pass, max observed53 gets, bound56. Checks valid indices, exactly one length call and unchanged caller input.
- core-results.json:41,719 independent checks /386,852 frames. Peak stays within retained bounds; every possible match on the current side stays retained; no discarded value equals target; each comparison shrinks correctly; reads/call totals/history agree; final result matches linear scan. Canonical mirror exact;95 unique bilingual key pairs, duplicate detection before evaluation.
- browser-results.json:14 localized full-preset paths, every operation forward/back/forward, all event explanations and candidate/read markers. Expected final indices use first occurrence. Reset/start/end/disabled states and language roundtrips checked.

Commands are in ../README.md; all result/download/screenshot writers accept OUTPUT_DIR so reviewers can rerun separately without modifying c1. The numerical oracle is independent of the algorithm, but the person running it is still the author.

## Browser and accessibility evidence

Chromium desktop on Linux, supplied PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH; system font stack, no external fonts. EN/ZH at320,390,736,1440 and CSS zoom1/2;16 layouts, no document/tile overflow, values remain24px CSS text, controls at least48px. The short numbered select stays within its measured label budget with20px reserved for the arrow; full localized scenario description wraps directly below and is associated by aria-describedby. This budget is evidence for the observed browser/font environment, not every platform.

Real keyboard Enter advances the algorithm; Tab/Shift+Tab produces the3px focus outline. Forced colors retained outlines and double candidate border. Native radios/fieldset/labels and text markers distinguish candidate state, just-read activity and keyboard focus. State tests cover source disclosure and prediction preservation, blocked storage and file:// source display. All lesson network requests stay local; no console/asset errors in final run.

Source code textContent, decoded mirror, successful clipboard readback, downloaded bytes and canonical solution.py agree exactly including final newline. Four manual fallback attempts (two per locale) each seed and verify a fresh non-source sentinel, invoke the real Copy button with write denial, verify full selection/focus, press host-native Control+C, then read back exact source. No test writes source to the clipboard to simulate a successful fallback. download-en.py/download-zh.py are transfer evidence, not separately authored solutions.

Contrast calculation is calibrated against black/white21, primary sRGB weights .2126/.7152/.0722 and #747474-on-black≈4.492948 (below4.5). Rendered solid foreground/background pairs are in browser-results.json; main body≈16.087:1, muted log≈7.07885:1, lowest recorded pair≈6.4494079:1. Focus orange vs panel also exceeds3:1. Shared tokens are reused exactly. Total shipped CSS11,438 bytes (<25000). The test supports the solid pairs used here; no generalized gradient/opacity claim is made.

## Visual inspection

Inspected the16-layout contact sheet and full-size narrow/desktop views, header EN/ZH320/200%, focused overlap/select screenshots, terminal views, forced-colors view and full English-page slices. Array tile values remain distinct from zero-based indices. At the overlap frame, index4 remains a candidate and separately shows ◆ just read; index3 has the same just-read mark while excluded. At200% narrow width tiles become a single column instead of squeezing labels. Header reflow preserves the full collection back link and right-aligned toggle; long H1 words can wrap without losing characters. Disabled Next at the endpoint now has muted text and panel2 fill, matching its disabled semantics. Source, prediction feedback and the retained interval ledger remain legible.

Original pre-fix select/tile captures and development-notes.md preserve the observed author failures and harness corrections. The tall terminal stage capture can contain the sticky navigation at a screenshot-dependent position; real anchor navigation separately verifies the target is below the sticky bar. This is not described as a live content overlap.

Related links were keyboard activated in both locales at320px on the preview: #4/step1 actually derives ordered cut boundaries and binary exclusion; #154/step1 compares middle/right and shows equality failing to determine a side, with duplicate counterexamples. The destination headings, section text, labels, resolved URLs and local hashes are retained in browser-results.json. Both are served by this preview; production availability is unverified by this author run and must be checked at release.

## Scope and next gate

Only leetcode/1095 files were authored. preflight.json records `python3 -B scripts/register_leetcode_lesson.py 1095 --validate-only` from repository root: exit0, empty stdout/stderr. Complexity metadata is a single string. No registration, shared registry/concept-map update, campaign state change, commit, agent spawn or deployment occurred. Frozen c1 awaits a separate reviewer using the cold walkthrough and six-dimension rubric. Public delivery, physical devices, other browser/font platforms and actual novice learning remain unverified.
