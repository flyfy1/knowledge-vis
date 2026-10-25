# Author self-check — #793

Status: ready for a separate independent lesson review. This is author evidence,
not independent acceptance, learner testing, deployment or LeetCode acceptance.
Official public statement and Python3 stub verified on 2026-10-25; full capture
and access notes are in tests/evidence/official.json and official-notes.md.

Commands from repository root:

- `python3 -B leetcode/793/tests/check.py` — passed: 150 literal-factorial cases,
  5,001 exhaustive accumulated-factor cases, 3,010 seeded/boundary greedy-oracle
  cases, 151 displayed-baseline cases; exact source mirror and unique bilingual
  dictionary keys. The maximum official k=1,000,000,000 returns 5.
- The same command runs `core.cjs`: 8,011 cases, 333,385 intermediate frames and
  1,001 direct factorization checks passed, including both bound invariants,
  midpoint value, strict shrink and stable history.
- `node leetcode/793/tests/browser.cjs` — passed in real headless Chromium
  156.0.8078.4 on Linux: both locales, every preset/frame, reset/end/rewind/replay,
  input endpoints, both prediction questions/all choices/reveal/change,
  locale-state preservation, blocked storage, file:// offline source, exact
  embedded/displayed/copied/downloaded source including final newline.
  Four native fallback transfers passed with a fresh verified clipboard sentinel
  per attempt and actual Linux Control+C. No runtime/console/asset errors;
  runtime requests stayed on the provided preview origin.
- Layout: EN/zh at 320,390,736,1440px plus 200% browser-rendered CSS zoom.
  Closed select labels measured with padding and a 32px arrow reserve; no
  document overflow. Shared system font stack is used; resolved font identity
  was not inferred. 98 measured text pairs pass AA; minimum 6.449407898769069:1.
  Contrast helper calibrated using black/white, RGB primaries and the
  4.492948 near-threshold case. Shipped CSS total: 11,334 bytes.
- `node leetcode/793/tests/supplement.cjs` — full backwards traversal for all
  six presets in both languages, current-bound labels, 48×48 control targets,
  actual disabled styles, focus ring visibility/contrast, forced colors,
  reduced motion and keyboard source scrolling. See supplement.json.
- `python3 -B scripts/register_leetcode_lesson.py 793 --validate-only` — exit 0,
  empty stdout/stderr. Shared registry/concept file hashes unchanged. Exact
  command, timestamp and result saved in tests/evidence/preflight.json.

Visual inspection performed through the image viewer, including final English
and Chinese 390px trace, prediction and source screenshots; 320px headings and
large-value operation cards; 736px trace; desktop heading/trace; both 200% zoom
screenshots. Text remains associated with its values; closed selects show full
k values; large numbers wrap without losing digits. Source is intentionally
horizontally scrollable and keyboard focusable; its exact bytes are separately
verified. The sticky nav scrolls horizontally on narrow screens. Screenshots
are browser evidence, not physical device tests.

Related links were followed in both locales on the actual preview: #4 step2
explains the cross comparisons and cut-direction experiment; #668 step2 derives
the first-sufficient-value search. Labels promise those specific concepts.
Existing destination lessons have their own review status; none is claimed here.

Two author findings/harness corrections are retained in self-check-history.md:
the initial overly narrow link-text assertion and disabled primary selector
specificity. The final product and checks include the corrections. Canonical
algorithm did not change. No prior independent finding or acceptance was altered.

Limits: physical devices, browser-chrome zoom, screen-reader spoken output,
novice teach-back, public publication and independent lesson review are untested
or pending. The 200% check uses CSS zoom inside the real browser, with screenshots
inspected for reflow. No claim of measured learner outcomes or accepted submission.
Reproduce checks with OUTPUT_DIR outside this folder to preserve candidate bytes;
see tests/README.md. Candidate identity is in candidate.json.

## 2026-10-26 — 793-COPY-R1 (fixed awaiting independent review)

Candidate `793-copy-r1-20261026` is identified by `candidate-copy-r1.json`;
original candidate.json and all historical evidence remain unchanged. This is
an author self-check, ready for separate focused re-review.

Finding/fix mapping: **793-COPY-R1** → removed the footer binding and unused
`foot` pair; updated the two local authoring generators to prevent restoration;
bumped the changed copy.js query. No replacement workflow/acceptance claim.
All remaining copy entries, including `sim`, `s4e`, frame boundaries, full history
and official callable explanation, compare exactly to the base in both locales.
`tests/evidence/copy-r1/runtime.diff` is the exact bilingual runtime diff.
`before.json` records base identity and pre-edit hashes; protected-hashes.json
proves app.js, core.js, solution.py, python-code.js and style.css byte-identical
before/after. Metadata remains unchanged, with one nonempty time/space string.

Focused commands and results, from repository root:

- `EXPECT_RED=1 node leetcode/793/tests/copy-r1.cjs` on the original runtime:
  exit 1 at “workflow footer must be removed”; retained red.json.
- `node leetcode/793/tests/copy-r1.cjs`: exit 0; browser.json and
  browser-command.log. Chromium 156.0.8078.4/Linux. Actual zh→en→zh roundtrip
  retained lab x=25, k=5 trace at comparison 1 (mid=15, f(mid)=3; range
  [0,30]→[16,30]), history count 1, selected/revealed k=29 answer 0.
  Formula operands and subtraction complete in both locales; rewind/replay
  restored the frame; changing quiz input invalidated feedback.
- Both locales: exact canonical/mirror/rendered/native clipboard/download bytes,
  including final newline. Each manual fallback attempt seeded and read back a
  fresh non-source sentinel, then focused/selected the entire source and used
  Linux Control+C; native readback equaled solution.py. file:// display exact.
- Keyboard Tab reached Copy → Download → source summary → both related links;
  Enter toggled the summary. No missing-key, page, console or HTTP errors.
- Page end screenshots at 320×1000 (100%) and 1440×1000 (200% CSS zoom), both
  locales, visually inspected: controls and links readable, focus outline visible,
  no footer/orphan gap, no page overflow. Evidence: *-end.png. This does not
  establish physical-device or browser-chrome zoom behavior.
- The first harness also combined 320px with 200% CSS zoom and failed its overflow
  assertion. Its failure is retained in harness-320-plus-zoom-failure.json.
  A read-only browser comparison serving historical HTML/copy by route interception
  confirmed identical 361px document width on both base and repair in both locales
  (combined-extreme-check.json). The final scoped harness uses the existing
  separate 320px and desktop-200% verification targets. This records a pre-existing
  limit; it does not claim the combined extreme passes.
- Executed actual canonical Python for k=0,3,5,6,29,31 → 5,5,0,5,0,5.
  Preserved official evidence contains the faithful Python3 stub; Python is the
  preferred available interface, so no non-Python language contract is needed.
  Exact source/mirror pair checked against scripts/register_leetcode_lesson.py.
  No broad numerical suites rerun for this prose deletion.
- Both authoring generators reproduce the repaired runtime bytes exactly; all
  translation keys unique and all values valid bilingual string pairs.
- `python3 -B scripts/register_leetcode_lesson.py 793 --validate-only`: exit 0,
  empty stdout/stderr. Result and Python/interface checks in validation.json.
  No registration or metadata changes performed.

Next action: fresh separate reviewer checks the new hash-bound candidate and
explicitly closes 793-COPY-R1 if warranted. Historical acceptance, review reports,
registry, campaign state and services were not changed. No commit or publication.
