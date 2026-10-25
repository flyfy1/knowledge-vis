# #780 author self-check — candidate r4

Date: 2026-10-25. Status: complete author candidate, ready for separate independent review; not accepted, registered, deployed or submitted to LeetCode. Base checkout: 81bee47c5d50bf5ec2c916a3e38b7b98a176cf53. Candidate hashes are in candidate.json. Only leetcode/780/ is owned by this author run.

Official source: public LeetCode GraphQL, full response and Python3 callable snippet saved in tests/evidence/official-graphql.json; exact official URL and access timestamp in official-verification.md. Direct HTML 403 was retained, not bypassed; GraphQL normally exposed the complete free statement and selector snippets. Python is the preferred, verified official interface.

## Computational evidence

`python3 -B leetcode/780/tests/test_solution.py` passed 15,774 canonical Python cases and the same browser-core fixtures. Forward BFS is the independent small-input oracle. Exhaustive positive starts 1..7 and targets 1..17, seed 780 random cases, 400 large constructive paths, official examples and maximum/boundary expectations passed. Tests checked 34,934 intermediate transitions: exact quotient/remainder arithmetic, strictly decreasing sum, forward-oracle reachability preservation, immutable nested snapshots and deterministic replay. Exact solution.py/python-code.js parity passed.

`python3 -B leetcode/780/tests/test_copy.py` passed 97 unique two-string translation pairs, rejecting duplicate keys before evaluation. Representative dynamic meanings are recorded in browser.json: all terminal branches in both locales, central complete formula, every prediction choice and clipboard fallback. This is a semantic author check, not merely key equality.

## Rendered checks

`node leetcode/780/tests/browser.cjs` and `node leetcode/780/tests/boundary-browser.cjs` passed in the real provided Chromium on Linux. Both locales, nine presets, every frame forward/back/replay, reset/endpoints, hand-addition cap/undo, predictions before/reveal/change/reset, locale state preservation, successful source copying, real native manual copying after a distinct sentinel, exact displayed/embedded/copied/downloaded source and file:// initialization passed. Native manual copy used Control+C and clipboard readback; source equality includes the trailing newline.

Preset results in order: true, true, true, false, false, false, true, true, false. Initial frames do no work; batch frames finish one full modulo; final check frames leave coordinates unchanged. The boundary supplement checked 16 narrow terminal cases and the large coordinate 1000000000.

Widths: 320, 390, 736 and 1440 CSS px; English and Chinese; plus 200% CSS zoom at 1440px (effective 720px content) in real Chromium. This is a content zoom test, not a claim about OS zoom or physical devices. Native selects were measured for every option including padding and arrow allowance. Actual keyboard Tab order, Enter activation, local anchor landing below the sticky nav, 48px targets, 3px focus, reduced motion, forced colors and denied localStorage passed. No browser console, asset or external runtime request errors were observed.

Measured minimum text contrast: 7.078851579017443:1, exceeding the 4.5:1 text threshold and 7:1 core-text target. Focus contrast is recorded in browser.json. Calibration uses correct 0.2126/0.7152/0.0722 weights and the below-threshold #747474 control. Total shared + local CSS: 11,331 bytes, below 25,000.

Visual inspection was performed by opening the generated screenshots, including the populated English/Chinese 320px trace and hand path, 390px trace, English/Chinese predictions, 736px and desktop stages, large terminal coordinates at 320px, bilingual 200% views and final bilingual header identity at 320px. Coordinates, history equations and choice labels remain associated and legible; controls reflow. Stage-only screenshots intentionally suppress sticky navigation at capture time; ordinary zoom/header screenshots keep it. The 200% viewport is scrolled within a tall stage, so text above that viewport is naturally outside the view.

The author caught and fixed inherited smooth scrolling interfering with keyboard anchors, and primary-button specificity overriding disabled endpoint styling. The final browser check asserts both anchor geometry and disabled primary background, while native disabled behavior remains checked. See tests/evidence/author-debug-notes.md for earlier author/harness observations. No independent findings are implied.

## Metadata preflight

From repository root: `python3 -B scripts/register_leetcode_lesson.py 780 --validate-only` exited 0, with empty stdout/stderr. Evidence: tests/evidence/metadata-preflight.json. Complexity is one nonempty string covering time and space. No registration command or shared metadata mutation was performed.

The final metadata/source/assets are frozen together as a new author candidate r4 for independent review. Related links remain within this lesson: #step1 explains the forced predecessor, #step2 explains the modulo invariant and boundary, in both languages. No external continuation is advertised. Registration, campaign state and historical review results are untouched.

Limitations: author checks are not a separate reviewer, novice teach-back, LeetCode submission result, production verification, physical-device audit, or cross-platform browser/font certification. Next action is a separate run's cold walkthrough and source audit of this frozen candidate.
