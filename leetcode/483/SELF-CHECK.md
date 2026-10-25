# Author self-check — 483-author-v1

Status: complete author candidate, ready for a separate independent review. This document is not independent acceptance, a learner study, a LeetCode submission result, or production verification. All owned changes are inside leetcode/483/. No registry edits, commit, deployment, services or agents were used.

## Verified contract and implementation

Public official GraphQL was accessed on 2026-10-25. `tests/evidence/official.json` preserves the statement, examples, constraints and all returned code selectors, including the Python3 `Solution.smallestGoodBase(self, n: str) -> str` stub. Canonical source is solution.py, preferred because the official Python interface faithfully supports the problem. No non-Python exception applies. The source mirror is the exact JSON-encoded file, with no runtime fetch.

The six sections connect 13 = 1+3+9, repeated-division baseline, the 31 counterexample to arbitrary early return, descending representation lengths, exact monotone binary search, a reversible experiment, a fresh 40 prediction, and executable Python. The upper bound uses integer bit length and integer shifts, with no rounded-root assumption. Each trial displays pre-comparison bounds, multiply-add values, exact comparison and post-comparison bounds. Early termination explicitly distinguishes the partial sum from a full sum. Terminal fallback is labeled as a trace step rather than a comparison. The simulation retains snapshots; the submission does not.

## Executed checks

- `python3 -B leetcode/483/tests/test_solution.py` — PASS. Independently derived repeated-division oracle on all 1,998 inputs 3..2000 and 180 seeded inputs; seven official/boundary/transfer cases; 58 base-2 closed-form cases; 60 constructed representations with independent minimality checks; exact mirror parity. See python-results.json and oracle-fixtures.json.
- `node leetcode/483/tests/test_core.cjs` — PASS. 364 fixtures, 6,380 comparisons; every intermediate multiply-add agrees with independent power sums; bounded exhaustive invariant checks prove no feasible small base was discarded; monotone exponent order, early stops, history and deterministic snapshots checked. Acorn checks all 89 copy keys for duplicates before evaluating either locale. See core-results.json.
- `node leetcode/483/tests/test_browser.cjs` — PASS in real headless Chromium. Every frame in both directions for all six presets in both locales, reset/end/disabled endpoints, slider/keyboard Enter/arrows/focus, all prediction choices and reveal/change, locale preservation and experiment isolation. Exact displayed/copied/downloaded Python; successful clipboard and denial/manual selection; blocked localStorage; file:// source and trace; no console/page/asset errors and no external runtime requests. Both languages at 320/390/736/1440 widths and 200% CSS layout zoom; populated component geometry, all six navigation targets and both related links checked. Forced-colors focus, reduced-motion behavior and 120-character Latin/CJK wrapping checked. See browser-results.json.
- `node leetcode/483/tests/test_focus.cjs` — PASS. Eight extra focused captures show both locales' long-number ledger, narrow quiz and manual source, plus populated arithmetic at 200% zoom. See focus-results.json.
- `python3 -B scripts/register_leetcode_lesson.py 483 --validate-only` — PASS, exit 0, empty stdout/stderr, from repository root. Recorded in tests/evidence/preflight.json. This did not register or mutate shared files. Metadata complexity is one nonempty string. This is the first frozen author candidate; independent review remains pending.

All generated checks support `OUT_DIR` so review reruns can preserve this candidate. Commands and dependencies are in tests/README.md.

## Visual inspection and measurements

The author opened and visually inspected all 26 final PNGs listed by browser-results.json and focus-results.json, including EN/Chinese intros, 320/390 long exact integer values, 736/1440 traces, both 200% views and focused arithmetic, every narrow ledger, quiz and selected manual source. Controls and text reflow; values retain all digits, with long ledger numbers wrapping within their own cells. No adjacent label/value collisions or essential horizontal clipping were observed. The step navigation intentionally scrolls horizontally; targeted viewport captures can show cropped preceding prose behind its sticky surface. Separate focused arithmetic captures confirm the actual state and result remain readable at zoom.

Rendered sampled text contrast ranges from 7.0789:1 (disabled control) to 16.4402:1; orange focus against panel2 is 8.9372:1. Controls are at least 48×48 CSS pixels. Total shipped CSS is 12,271 bytes (9,425 shared + 2,846 local), below 25,000. Exact values and color pairs are in browser-results.json. The inherited tokens are reused without a new palette.

Bilingual meaning bindings were separately checked for too-large 13/m=3, equality 13/m=2, too-small 16/m=3, and two-digit fallback at 3, as recorded verbatim in browser-results.json. Clipboard denial copy is distinct from algorithm fallback copy. Prediction feedback rejects [6,8] and [2,5] with an explicit no-loss interval explanation; changing a choice hides old feedback. Locale changes preserve choice, reveal, preset, position, disclosure and manual-copy visibility.

## Limits and handoff

Only synthetic desktop/mobile viewports and CSS layout zoom were exercised, not physical devices, a screen reader or browser-toolbar zoom. No actual novice teach-back, independent teaching judgment, accepted online submission or public deployment is claimed. The independent reviewer should cold-walk the candidate before reading this report/BRIEF, choose a fresh input and counterexample, and apply the frozen repository review gates. Candidate file hashes and exact shared dependency hashes are recorded in CANDIDATE.json; author readiness does not authorize registration or publication.
