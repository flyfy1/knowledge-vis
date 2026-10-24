# #327 — author self-check, candidate 1

Status: complete author candidate, **independent review pending**. This is not
independent acceptance, a real-learner study, deployment, or a LeetCode submission.
Official verification date: 2026-10-25 Asia/Singapore (UTC timestamps may be the
preceding calendar day). Saved public GraphQL response and interface excerpt:
../../provenance/official-graphql.json and ../../provenance/README.md.

## Executed checks

From repository root:

- `python3 -B leetcode/327/tests/test_solution.py`: PASS. Canonical official
  Python callable executed against 17,880 independently calculated raw-subarray
  oracle cases; exhaustive length 1..6 over {-1,0,1} with every bound pair in
  [-2,2], plus 1,500 seeded cases with 32-bit extremes. Both official examples,
  equality and negative boundaries, input preservation, maximum-length valid
  cases, and 65,535 zeros (2,147,450,880 valid intervals) passed. The actual
  Python return invariant was audited at 642 recursive returns on 40 further
  seeded cases: sorted block and exact original-index-block pair count.
- `node leetcode/327/tests/test_core.cjs`: PASS. 5,950 independent-oracle cases,
  79,576 frames checked. Both boundaries, nonretreating pointers, sorted blocks,
  block-local counts, accumulated ledger totals, and deep snapshot separation.
- `node leetcode/327/tests/browser.cjs`: PASS against the already-running
  `http://127.0.0.1:18770/leetcode/327/`. Real headless Chromium, honoring the
  environment executable path. Both locales; every preset and every operation,
  forward/back/forward identity, reset, final endpoints, all six prefix pairs,
  all prediction choices → reveal → change, revealed state preserved by locale,
  localized algorithm and clipboard feedback, real clipboard success, denied
  clipboard recovery with exact selected source, actual source downloads and
  displayed/embedded/file equality. Offline file opening and denied localStorage
  also passed. Real keyboard Enter/arrow keys, focus persistence and 3px outline,
  forced colors and reduced motion were exercised. All asset requests local;
  zero captured page, console, or HTTP errors.
- Layout: 320, 390, 736, 1440 CSS px in EN and zh; populated duplicate state,
  revealed feedback, and narrow 32-bit-extreme state; no page overflow, native
  preset text fits, action targets >=48px. 200% CSS layout zoom in Chromium at
  1440px, both locales; visible values and active navigation inspected.
- Shared + shipped local CSS: **11,482 bytes**, below 25,000. Computed shared
  token text/state pairs on the three solid panel backgrounds: minimum **6.45:1**.
  Full measured pairs and representative semantic-binding text are in
  browser-results.json. Focus accent2 and disabled muted/panel2 are included.
- `node --check` for app.js, copy.js, core.js: PASS.
- Duplicate localization keys are detected before Object.fromEntries can hide
  one. Both language values are structurally paired, and exercised text is saved
  separately for cross-count boundaries, predictions and clipboard fallback.
- `python3 -B scripts/register_leetcode_lesson.py 327 --validate-only`: PASS,
  exit 0, no stdout/stderr; exact command/result in preflight.txt. No registration.
  Metadata complexity is a single time-and-space string, and title omits ID.

## Visual inspection and author corrections

Actually opened rendered PNGs with the image viewer: header-en/zh, baseline-en/zh,
trace-en-320/390/1440, trace-zh-320/390/1440, halves-en-320, extremes-en/zh-320,
prediction-en-390 and prediction-zh-320, zoom200-en/zh. Inspected readable numeric
labels, wrapped prose, retained contribution rows, distinct duplicate slots,
selected/current borders, and prediction explanation. Element screenshots can
capture sticky navigation over their top edge; this is distinct from intersecting
algorithm labels during ordinary scrolling. No essential label/value collision
was observed in inspected final states.

During author testing, rendered DOM selection omitted the source's final newline:
replaced it with a selected read-only source field for exact manual copy. The
320px English preset label originally clipped: shortened labels and added an
actual text-width assertion. Scroll-based navigation now derives the highlighted
section from settled geometry, including zoom. Merge and exercise boundary
terms are defined locally in both languages. These are author corrections, not
reviewer findings or independently closed defects.

## Reproduction and boundary of evidence

See ../README.md. All result-producing tests accept OUTPUT_DIR, so the separate
reviewer need not write into this frozen candidate. Numerical tests are offline;
browser tests use the existing preview and do not start a service. Raw official
captures and screenshots are review material and are not runtime dependencies.
CSS layout zoom is not physical browser-chrome zoom or a real phone test.
Screen-reader announcements and actual novice comprehension were not measured.
No shared registry, acceptance state, campaign report or service was changed.
Next action: separate fresh-context cold review of the hashed candidate against
the six-dimension rubric, followed by the dispatcher's decision. No agent was
spawned for this author run.
