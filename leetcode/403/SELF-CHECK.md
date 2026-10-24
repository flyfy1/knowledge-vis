# #403 author self-check — 403-author-6d7a90d86bd3

Status: complete author candidate, ready for a separate independent review. No independent acceptance, LeetCode submission, learner outcome or deployment is claimed. Only leetcode/403/ was authored; shared assets, registries and campaign records were not edited.

## Verified contract and teaching

Public official GraphQL capture: tests/evidence/official.json, dated access with statement, both examples, constraints and actual Python3 starter `Solution.canCross(self, stones: list[int]) -> bool`. Python is the canonical official submission, with exact JSON-encoded offline mirror. No language fallback or paid access was needed.

Author walkthrough (not a cold independent review): the hand example 0→1→3 shows lengths1,2 and rejects zero/water. The counterexample [0,1,2,3,6] distinguishes arrival states (3,1) and (3,2). The trace exposes all three candidate checks for one state, retains every discovered set and operation, and marks the after-update instant. At (3,2), length3 reaches6 and adds3; rewind removes it. The proof derives soundness, completeness and ascending processing from forward-only moves. The fresh prediction [0,1,2,4,7,11] has lengths1,1,2,3,4, so no global limit3 or prohibition on equal consecutive lengths applies. Full source maps that visible addition to reachable[6].add(3).

## Executed checks

- `python3 -B leetcode/403/tests/test_solution.py`: PASS. 2047 exhaustive subsets with origin0 and additional positions1..11, 700 seeded cases (seed403), 7 explicit cases, and 4 large/boundary cases including n=2000 dense and triangular sequences. Independent route enumeration visits next stone indices. Canonical Python and the displayed brute-force baseline both agree on all small cases. Input remains unchanged; mirror is exact.
- `node leetcode/403/tests/test_core.cjs`: PASS. 2555 cases and 11142 frames. Independent incoming-edge DP checks exact discovered sets, soundness, completeness at processed coordinates, rejection semantics and deep snapshot isolation. Includes 500 seeded inputs. AST duplicate-key check finds 85 bilingual keys with no duplicates.
- `node leetcode/403/tests/browser.cjs`: PASS on the already-running preview. Both locales; all six presets to end and back; forward/back/forward identity; reset/end and native disabled endpoints; all three predictions with reveal/change; locale preservation before and after reveal; trace reset independent of exercise; actual clipboard success, forced failure and selected manual source; browser download and displayed source parity; blocked storage; already-loaded offline operation; local/related anchor resolution; keyboard focus and Enter; zero console/page/asset errors.
- `node leetcode/403/tests/accessibility.cjs`: PASS. Keyboard Tab/Enter on locale, Enter on Next, Home/ArrowDown/Enter on native select, Space on prediction and Enter to reveal, hand reveal state and revealed prediction preserved on locale switch, 3px forced-color focus, reduced-motion scroll behavior.
- `python3 -B scripts/register_leetcode_lesson.py 403 --validate-only`: PASS, exit0, stdout/stderr empty, run from repository root. Receipt: tests/evidence/preflight.json. No registration performed. Metadata complexity is one string covering time and space.

## Visual and accessibility evidence

Real headless Chromium screenshots retained for EN/zh at320,390,736,1440px, plus prediction390, desktop header, 200% zoom and forced colors. Author visually inspected the populated EN/zh320 traces and candidate checks, EN/zh390 traces and prediction feedback, EN/zh desktop traces, both zoom captures, header and forced-color capture. Numeric sets and state labels stay separate; card columns reflow; long candidate explanations wrap; candidate numeric columns reserve25% each so English headers wrap at spaces. Off-screen content in viewport captures is ordinary vertical scrolling. The horizontal step navigation intentionally scrolls at narrow widths. No page overflow or card text clipping was detected at the measured widths.

Measured sRGB contrast: main text16.09:1 on canvas; panel text14.70:1; muted/disabled text6.45:1 on panel2 and7.08:1 on panel; primary action13.10:1; focus orange8.94:1 against panel2. Shared muted text meets AA but is below the preferred7:1 on panel2. Shared plus lesson CSS is11038 bytes, below25000. Runtime requests are exclusively local; official capture is review evidence, never loaded by the lesson.

## Limits and next gate

Zoom uses actual Chromium CSS zoom=2 at1440px (effective720 CSS px layout); no physical device, OS magnifier or browser toolbar zoom claim. Offline checks cover already-loaded source and controls, not a service worker or offline reload. Browser trace snapshot storage is teaching-only and excluded from submission O(n²) auxiliary space. Hash operations support expected O(n²) time. Synthetic tests cannot establish learner comprehension, independent acceptance or an accepted submission. The next action is a separate reviewer run against this frozen candidate. Rerun commands and OUTPUT_DIR instructions are in tests/README.md.
