# #629 author self-check — 2026-10-25

Complete author candidate, ready for a separate reviewer. Independent acceptance is **pending**. This report is an author self-check, not a teaching-review score, a novice result, LeetCode acceptance or publication. All work is inside `leetcode/629/`; registry, shared assets, campaign state and services were untouched. No agents, submissions, commits or deployment were used.

## Contract and implemented path

Official source and supported Python3 signature were verified from the public page and public GraphQL. Full unfiltered evidence, timestamp and all starter snippets: `provenance/official-graphql.json`; interpretation: `provenance/README.md`. `solution.py` is the actual official-interface implementation. Its offline mirror is one exact JSON-string assignment. Metadata declares Python and a single complexity string, O(n(k+1)) time; O(k+1) auxiliary space.

Five steps: inspect actual inverse pairs in the six three-card arrangements; insert the unique maximum and retain the old pair; derive the counting partition and rolling window; predict fresh (5,2) from [1,3,5,6]; reconstruct the canonical Python. The visual trace is explicitly a bounded JS simulation, retaining full history, rather than execution of the Python function. The empty base row is a construction state, not a new allowed official n. The simulation intentionally fills impossible targets; Python short-circuits them.

## Executed checks

From repository root, using the installed NODE_PATH packages and provided Chromium executable:

| Command | Actual result |
|---|---|
| `python3 -B leetcode/629/tests/test_solution.py` | PASS; exhaustive permutations n=1…8, all feasible counts and impossible targets; 180 seeded direct-sum / polynomial comparisons; maximum n,k and closed-form boundaries; 2,247 intermediate checks in the actual canonical Python function |
| `node leetcode/629/tests/test_core.cjs` | PASS; 455 bounded frames / 420 transitions; each stored table cell against brute histograms, source-window membership, entering/leaving terms, deep snapshots, insertion pairs, mirror and 83 unique bilingual keys |
| `node leetcode/629/tests/browser.cjs` | PASS on final local files; real Chromium, both locales, every preset and intermediate cell, forward/back/reset/end/range, disabled endpoints, all predictions, language-state preservation, source transfer, narrow/desktop/200% layout zoom, keyboard/focus, local assets, anchors, storage denial/offline, forced colors/reduced motion and rendered contrast |
| `node leetcode/629/tests/extra-browser.cjs` | PASS; native clipboard success in both locales, 320px headers, full rightmost current table cell after scrolling, initial unknown cells |
| `node leetcode/629/tests/settled-views.cjs` | Completed fresh-context font-ready focused captures in both languages at 736/1440 and 200% CSS zoom at 640/1440 |
| `python3 -B scripts/register_leetcode_lesson.py 629 --validate-only` | PASS, exit 0; stdout/stderr empty; safe non-mutating preflight from repository root. Receipt: `tests/evidence/metadata-preflight.json`. No registration |

Artifacts: `python-results.json`, `oracle-cases.json`, `core-results.json`, `browser-results.json`, `extra-browser-results.json` and downloaded source in `tests/evidence/`. The independently derived full-bound result for (1000,1000) is 663677020, matching the canonical function. Mirror, code textContent, intercepted copy payload, actual native clipboard, full selected manual fallback plus Control+C, and downloaded bytes match the exact Python file including its final newline.

Browser presets in each language: (3,1)→2, (3,3)→1, (4,5)→3, (4,0)→1, (3,4)→0, (1,0)→1, (5,6)→20. Both formulas were read in the real DOM with complete indices and operators. Representative localized binding evidence includes no-expired-term and subtraction frames, the fresh answer 5+3+1=9, all three feedback branches, and clipboard fallback that explicitly asks for manual copying. Changing an answer clears feedback; language changes preserve answer/reveal, trace frame, insertion x, selected permutation, source disclosure and useful focus. Trace reset does not reset the separate quiz.

## Visual and accessibility inspection

The 48 PNG captures were visually inspected, including initial/middle/terminal states, both headers, pair/insertion ledgers, prediction and source/fallback, full desktop and narrow tables, and 200% zoom. The initially scroll-clipped explanatory caption was moved outside the scrolling table and given a bilingual horizontal-scroll/keyboard hint before the final browser pass. Table row numbers stay visible during horizontal scrolling; the rightmost answer remains accessible and has its matching column header. Numerical zero and pending '?' remain distinct. Frames (3,3), 11/12 and 12/12 visibly show window 2 turning into 1 by removing prev[0]=1. The n=5,k=6 frame labels its current 20 and the exact prev[2…6] contributions 5+6+5+3+1.

Some rapid viewport/locale-change screenshots omit a Latin n/k prefix despite complete DOM text. Fresh-context, font-ready focused captures reproduce complete n/k text and correct geometry at 736,1440 and both 200% zoom widths. These `*-settled*.png` captures provide the settled visual reference; rapid captures are retained with the interaction evidence. No persistent clipping was reproduced in those settled checks. The 320px scrolled table captures explicitly retain row headers and expose the complete current cell.

All measured button/select/header/related/source-link heights are ≥48 CSS px. Focus outlines are 3px with separation; actual keyboard controls and horizontally scrolling table were exercised. Colors are exact shared tokens. Rendered ratios: body 16.09:1, explanation 12.62:1, hint 7.74:1, formula 13.40:1, selected window term 10.91:1, disabled button text 6.45:1, focus against panel2 8.94:1, field border against panel2 6.45:1. Disabled content meets AA without inherited opacity loss. Combined shipped CSS is 11,708 bytes (9,425 shared + 2,283 local), below 25,000. Browser recorded zero console/page errors, failed local requests or external asset requests. All source/runtime assets are local.

One intermediate rerun lost its Chromium target during viewport checks; this is retained in `tests/evidence/browser-attempt-note.txt`. A fresh full rerun passed, followed by the final full rerun after link-height checks were added. Earlier passes are not substituted for the revised candidate's checks. A supplemental clipboard assertion initially ran before its asynchronous status update; the test now waits for acknowledged feedback and the rerun passed, without a runtime change.

## Freeze and remaining boundary

`candidate.json` binds the final authored files, tests, official capture, self-check and evidence by SHA-256, plus hashes of read-only shared dependencies. It does not assign an acceptance score. Reproduce into a separate OUTPUT_DIR as documented in `tests/README.md`, so the frozen candidate stays unchanged.

Next action: a separate run performs the independent cold walkthrough and review. Real phones, a real screen reader, browser-toolbar zoom, actual learner understanding, judge acceptance and public deployment remain unverified. No independent reviewer is attributed by this author run.
