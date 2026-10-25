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
