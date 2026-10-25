# Author self-check — candidate 732-author-2

2026-10-25. Author only; separate independent review pending. No LeetCode submission, registration, deployment, novice results, or independent acceptance claimed. Changes confined to leetcode/732/. Approved reused design referenced in BRIEF.md. Final candidate identity: tests/evidence/candidate-sha256.json.

Official statement and complete observed code snippets: provenance/official.json, obtained from public official GraphQL with access timestamp; official page also opened. Python3 class interface verified. Constraints 0 <= startTime < endTime <= 10^9; <=400 calls; no conflict rejection. Official output 1,1,2,3,3,3 tested and displayed. No premium restriction bypass.

Run from repository root (all passed):

```
python3 -B leetcode/732/tests/test_solution.py
node leetcode/732/tests/test_core.cjs
python3 -B leetcode/732/tests/test_copy.py
node leetcode/732/tests/browser.cjs
node leetcode/732/tests/capture.cjs
python3 -B scripts/register_leetcode_lesson.py 732 --validate-only
```

Evidence-producing tests accept OUTPUT_DIR; browser tests also accept LESSON_URL and use PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when set. NODE_PATH supplies installed Playwright. Example reviewer rerun: `OUTPUT_DIR=/tmp/732-review node leetcode/732/tests/browser.cjs`. Use the running preview at http://127.0.0.1:18786/leetcode/732/. Tests do not require new services or mutate runtime files.

- Python: 1,314 booking sequences, 7,034 calls, exhaustive lengths 0..3 from endpoints 0..4; 200 seeded large-coordinate cases; 400 duplicate and touching bookings. Independent direct membership counts at event starts; unit-cell oracle on tiny domains. Every delta prefix checked against membership, total delta zero, returns monotonic. Canonical class executed directly, persistent state and separate instances covered.
- JS simulation: 13,210 snapshots across presets and exhaustive three-event sequences. Independent counts at coordinates check active, every running maximum, history, and zero total delta. Snapshot simulation is explicitly distinguished from Python execution.
- Copy: 86 unique paired keys, duplicate detection before object construction, all static bindings present. Both rendered formula versions contain full prefix-sum expression. Browser semantic records include concrete membership sums and each prediction's revealed net changes.
- Chromium on Linux: 212 frame/state checks; both locales, all five presets, all forward frames, back/replay/reset/finish endpoints. Widths 320/390/736/1440; all selected preset labels measured with native arrow allowance and inspected. Prediction choices require explicit reveal; changes clear stale feedback; locale preserves choice, feedback, frame, hand probe; trace reset leaves quiz intact. Source disclosure keyboard activation and locale focus preservation verified. Related anchors fetched and checked. Blocked storage and file:// source rendering passed.
- Actual clipboard API success plus denied-write manual fallback in both languages. Distinct sentinel seeded before fallback; focus/full selection checked; Linux Control+C dispatched; actual readback equals source. Embedded/displayed/copied/downloaded source matches canonical file exactly, including final newline. These are native browser checks, not stubbed success.
- Browser console/page/network errors: zero. Requests local only. Shipped CSS 11,566 bytes including shared CSS. Rendered text contrast minimum 7.165:1; focus minimum 9.015:1; control border 6.520:1. >=48px button/select geometry; 3px focus outlines and forced colors checked. 200% CSS zoom at 1280px checked for reflow and overflow, not physical-device/browser chrome zoom evidence.
- Visually inspected all 17 main browser screenshots plus final ledger/header captures with view_image. Readable bars and labels, selected controls, source/fallback selection, prediction explanation, zoom states. At 320px the endpoint table is intentionally internally scrollable, focusable and labeled; left and right captures show all columns. Sticky navigation is visible in viewport crops; deep-link target geometry separately verified below nav.

Corrections during authoring: final scan initially reused “provisional” wording. Corrected to a dedicated completed-scan label; full browser suite rerun and final-label-results.json confirms the rendered endpoint at 7 has active=0, best=2 and return 2 in both languages. Removed duplicated step numerals. Supplemental capture harness initially tried to click an already disabled Finish button on the second locale and timed out; the UI correctly prevented it. Harness now explicitly resets first. Also resets table scroll for left-column capture. These were author harness/candidate iterations, not independent review results.

Metadata gate: `python3 -B scripts/register_leetcode_lesson.py 732 --validate-only` from repository root exited 0, no output; structured receipt in tests/evidence/preflight.json. It did not register the lesson or modify shared files. Complexity is one nonempty string covering time and space. Final hashes freeze the post-fix candidate for fresh independent review; there is no previous acceptance to supersede.

Remaining boundaries: real phones, OS/browser variants, browser-chrome zoom, production delivery, independent teaching review, and actual learner comprehension are unverified. Source is submittable for the observed interface, without a claim of LeetCode acceptance. Related concept registration belongs to the dispatcher under the user's ownership restriction.

## Repair candidate 732-MAC-R1-20261025 (author self-check)

Required finding **732-MAC-R1**, from `specs/reviews/732-review-mac-candidate-20261025.md`: corrected the browser contrast checker's green luminance coefficient from 0.7322 to 0.7152. Added `tests/test_contrast.cjs`, which extracts the actual browser checker's luminance function, calibrates black/white, all three primary colors, mid-gray, and a threshold-straddling negative/positive pair. The browser suite now requires calibration before launching Chromium and records contrast pairs separately for EN and zh-CN. Runtime lesson files, algorithm, prose, canonical Python and its mirror required no changes.

Evidence directory: `tests/evidence/repair-732-MAC-R1-20261025/`. New candidate identity: its `candidate-sha256.json` (lesson sources, tests, metadata and this self-check; generated evidence excluded to avoid circular hashes). The prior report, original evidence and prior review outcome remain historical. The old 7.165/9.015/6.520 contrast figures above came from the defective checker and must not be used as valid contrast evidence. This appendix records author repair verification, not independent closure or acceptance.

Feedback loop, run before the repair: `node leetcode/732/tests/test_contrast.cjs` exited **1**, with its stdout preserved in `calibration-red.json`. White was 1.017, pure green 0.7322, and #747474 on black was incorrectly 4.5523281903546. The same command after the coefficient repair exited **0** (`calibration-green.json`): white 1, green 0.7152, black/white 21:1, #747474 on black **4.492948073111701** (fails 4.5), and #757575 on black **4.557768319672582** (passes).

Ranked falsifiable hypotheses, stated before changing the checker: (1) the green coefficient causes the bias, so changing only it will fix calibration; (2) gamma conversion also fails, so mid-gray will remain wrong after correcting the weight; (3) background selection causes additional failures, so calibrated math will pass but actual rendered pairs will fail. The single-coefficient change made all calibration vectors pass, rejecting (2) for those vectors; the rendered sampler passed in both locales, providing no support for (3) in its sampled pairs. This does not extend the existing sampler into an exhaustive opacity/state audit. No runtime palette defect was reproduced; no temporary instrumentation was added.

Commands run from the repository root (all final runs exited **0**):

```sh
node leetcode/732/tests/test_contrast.cjs
OUTPUT_DIR=leetcode/732/tests/evidence/repair-732-MAC-R1-20261025 python3 -B leetcode/732/tests/test_solution.py
OUTPUT_DIR=leetcode/732/tests/evidence/repair-732-MAC-R1-20261025 node leetcode/732/tests/test_core.cjs
python3 -B leetcode/732/tests/test_copy.py
OUTPUT_DIR=leetcode/732/tests/evidence/repair-732-MAC-R1-20261025 node leetcode/732/tests/browser.cjs
OUTPUT_DIR=leetcode/732/tests/evidence/repair-732-MAC-R1-20261025 node leetcode/732/tests/capture.cjs
python3 -B scripts/register_leetcode_lesson.py 732 --validate-only
```

`command-results.json` records the non-browser commands, working directory, exit codes and output. **Metadata preflight exited 0 with empty stdout/stderr**, without registration. `lesson-entry.json` already has one nonempty complexity string covering time and space; no metadata correction was needed. Official interface evidence in `provenance/official.json` includes faithful Python3 and TypeScript interfaces. Python remains the preferred canonical interface. There is no nondefault language contract or supportedLanguages list omitting these interfaces. Read the registration policy's exact `solution.py` / `python-code.js` / `PYTHON_SOURCE` mapping; parity passed without normalization, so no mirror regeneration was necessary.

Final browser result: Linux Chromium 156.0.8078.4, using NODE_PATH and PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH; **212 state checks, 17 screenshots, zero console/page/network errors**. Both locales have 12 sampled text pairs, minimum **7.078851579017443:1**; minimum focus **8.937191437807625:1**; border **6.449407898769069:1**. CSS remains 11,566 bytes. Widths 320/390/736/1440 and 200% CSS zoom reflow passed. These replace only the defective contrast measurements, not the historical reports.

Applicable rendered-state regressions: full prefix-sum operands render in both locales; hand membership at 4/5/6 remains 2/2/1. All presets, initial/update/middle/final frames, return-history lengths, ledger values and rewind/replay passed, backed by the independent membership oracle (13,210 simulation frames). Final-label captures verify completed scan language in EN/zh-CN, with last active=0, best=2 and return 2; the ledger retains active counts 1,2,2,1,0 and returns 1,2,2. Added-event count and returned-call count have different explicit scopes. Prediction remains the independent [1,4), [4,8), then [2,6) case, returns 2, invalidates feedback on choice change and preserves state across locale switches. There is no recursive candidate-enumeration identity to check in this sweep.

Actual canonical Python execution passed **1,314 sequences / 7,034 calls**. Source mirror, DOM textContent, download, native clipboard API and manual fallback transfers match exactly, including the final newline. Each locale's fallback used a distinct sentinel, verified focus/full selection and actual Linux Control+C readback. Blocked storage and file:// source checks passed. Generated evidence is separate from the original evidence.

Actually inspected the new `en-320-trace.png`, `zh-320-final-ledger.png`, `en-fallback.png`, and `zh-prediction.png`: update readout distinguishes unstarted scan from completed calls; final ledger and retained history agree; complete source is selected; incorrect prediction feedback explains the shared endpoint. The table intentionally scrolls horizontally. Other captures are retained but not claimed individually inspected. Existing Mac evidence remains historical; this repair rerun establishes Linux Chromium behavior, not a new Mac/native-device, screen-reader, browser-chrome zoom, production or novice-comprehension check. Ready only for a separate reviewer to assess **732-MAC-R1** closure on this newly frozen candidate.
