# #188 author self-check — ready for separate review

Date: 2026-10-18. Author/checker: Codex author run; exact model identifier
unavailable. This is not independent acceptance, novice research, an online
LeetCode submission, registration, publication, or public-delivery verification.
Candidate identity: tests/evidence/candidate-sha256.json. Official-source observation:
tests/evidence/official-verification.md and complete official-graphql.json.
Only leetcode/188/ was authored. Shared runtime, registry and campaign state were
not edited. Chinese title is an authored translation of the verified English title.

## Reproduce

From the repository root (NODE_PATH supplies the installed Playwright package):

```sh
OUTPUT_DIR=/tmp/188-python python3 -B leetcode/188/tests/test_solution.py
OUTPUT_DIR=/tmp/188-core node leetcode/188/tests/test_core.cjs
OUTPUT_DIR=/tmp/188-browser node leetcode/188/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 188 --validate-only
```

Browser default: http://127.0.0.1:18790/leetcode/188/. Override PREVIEW_URL with
the full lesson URL. The browser script respects
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when set. No server is started by tests.
All test-emitted screenshots/results respect OUTPUT_DIR. Source/evidence and
metadata preflight require no writes outside the supplied output or lesson folder.

## Observed results

- Python: **4629 cases passed**. Exhaustive n=0..6, prices 0..2, k=0..3;
  250 random cases, seed 188; official examples; n=1000/k=100 alternating,
  increasing, decreasing, and constant cases; one zero-price day. An independent
  oracle enumerates nonoverlapping buy/sell intervals. The actual baseline code
  extracted from index.html is also executed on exhaustive cases. Input remains
  unchanged; offline mirror bytes equal solution.py.
- JavaScript core: **21363 prefix states passed**. Independent enumeration of
  every legal action history groups maxima by holding status and budget; checks
  every day, all budgets, yesterday/candidate/new invariants, all presets and
  the fresh exercise. This oracle does not use the maximum recurrence.
- Real Chromium: **passed** in EN and zh, all 8 presets (16 locale/preset visits),
  every forward frame's rendered values and action candidates, rewind/replay,
  both endpoints, reset, end, range control, all three prediction choices,
  reveal/change clearing, language after reveal, preserved disclosure and trace,
  copy success, denied-copy manual fallback with focus and exact source,
  downloaded/displayed/file parity, keyboard Enter/Tab/Shift+Tab, 3px focus,
  denied storage and offline source display. Related/local targets return 200
  and every fragment exists. Zero page, console-runtime or local HTTP errors;
  all runtime asset requests stayed on the preview origin.
- Widths **320, 390, 736, 1440** in both locales, plus **CSS zoom 2 at 1280**
  (200% magnification, not OS/device zoom). No document overflow or card text
  overflow; controls >=48px. Ledger scrolling remains localized, labeled,
  keyboard focusable; sticky anchors land below navigation. Forced-colors and
  reduced-motion branches were exercised. Total shipped CSS: **11980 bytes**.
- Measured rendered text contrast: minimum sampled pair **6.45:1** (muted text
  on panel2); body text **12.62:1**; orange result **8.94:1**; selected navigation
  **13.10:1**. Focus colors are sampled from the focused button and adjacent
  surface; see browser-results.json for the computed ratio and all pairs.
- Required non-mutating preflight from repository root:
  `python3 -B scripts/register_leetcode_lesson.py 188 --validate-only`
  **exit 0**, empty stdout/stderr. Evidence: metadata-preflight.json. Complexity
  is the single string `O(nk) time; O(k) auxiliary space`. No registration ran.

A browser-test harness iteration initially attempted to measure a disabled
button while all buttons were enabled in an intermediate frame. It now selects
an endpoint before sampling disabled colors. The final browser run passed;
this was a harness selector issue, not a lesson-state failure.

## Visual and explanatory inspection (author only)

Inspected actual screenshots in evidence, including EN/zh 320/390 trace cards,
1440 trace and ledger, both zoom views, narrow ledger and its right edge,
header, prediction feedback, copy fallback, canonical source, derivation/proof,
and forced-colors. At day 3 of [2,5,1,4], h[2] visibly changes −2→2 from
3−1; c[2] remains 3 because selling the old share gives −1. At day 4 the ledger
retains all five rows (including day 0) and c[2]=6. Phone cards stack; the wide
ledger scrolls without shrinking its labels. Source lines scroll horizontally;
manual copy retains the complete exact source even when visually wrapped.

Author reading-path check: step0 contrasts k=1 profit 3 with k=2 profit 6.
Step1 derives grouping by actual action count before maximizing over at-most
budgets; a cheaper later purchase explains dominance concretely. Step2 shows
which old cash and price produce each candidate, rather than only a final sum.
Step3 uses fresh [1,4,2] followed by price 5 and requires the old holding state;
feedback explains missing purchase cost and lost first-trade gain. Step4 maps
cash/hold to c/h, covers all final-day actions, and counts snapshots honestly.
These are author observations, not actual learner outcomes or a separate review.

## Remaining boundary

Independent cold review, rubric scores/finding closure, physical-device testing,
OS/browser-native zoom, actual novice comprehension, online judge acceptance,
and public deployment are unverified. The next authorized step is a separate
review of the frozen candidate. Metadata changes after this identity require a
new candidate; no prior review or acceptance history was rewritten.
