# Author self-check — #726 candidate r5

Date: 2026-10-25. Scope: author implementation and self-check only. Independent
review, novice teach-back, LeetCode submission acceptance and deployment are pending
or unperformed. SHA-256 identities are frozen in evidence/candidate-sha256.json.
Only leetcode/726/ was authored; shared assets, registries and campaign records were
not changed. Chinese title is an authored translation, not a claim of official localization.

## Reproduce

From the repository root, with the supplied NODE_PATH and Chromium executable:

```
python3 -B leetcode/726/tests/check.py
node leetcode/726/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 726 --validate-only
```

Both test scripts accept OUTPUT_DIR. For a reviewer, set it to a new evidence directory;
no candidate files need changing. The browser uses the already-running preview at
http://127.0.0.1:18784/leetcode/726/ and honors
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. No service is started.

## Observed results

- Official GraphQL statement, access timestamp and full language snippets are preserved
  in evidence/official.json. The observed Python3 signature matches solution.py.
- check.py: PASS, 1,294 canonical cases, 1,280 small expansion-oracle cases, 15,780
  intermediate frames. Exhaustive concatenations of five units through length four;
  500 seeded (726) nested cases; all official examples; maximum length 1,000;
  499 nested groups; multi-digit counts, repeated names, adjacent groups, omitted
  multipliers, maximum signed 32-bit count, and one 1,000-character name.
- The right-to-left oracle tracks suffix multipliers, independently of the canonical
  forward stack-of-maps algorithm. Small cases also use actual atom expansion. The
  exact expansion baseline displayed on the page is executed and checked. Each JS
  frame is checked by parsing the separate completed segment belonging to each open
  level. This checks the intermediate invariant, not only final output.
- browser.cjs: PASS in Chromium on Linux. All seven presets in both locales; every
  forward event, backward restoration, replay, reset and final endpoint. All terminal
  preset results are separately hard-coded expected values. Every prediction option,
  reveal, changed-answer feedback clearing and locale roundtrip were exercised.
- The rendered outer close of K4(ON(SO3)2)2 contains O: 0 + 7 × 2 = 14 in both
  locales; the localized explanation describes popping/merging the child. Prediction
  feedback describes the actual missed/extra multiplications, while clipboard fallback
  separately describes manual source copying. Copy pair shapes and duplicate object
  keys are checked before silent overwrite can conceal a defect.
- Source mirror, rendered textContent, automatic clipboard copy, downloaded bytes and
  manual fallback clipboard content equal solution.py exactly, including final newline.
  The fallback seeds a distinct sentinel, forces writeText rejection, verifies full
  focused selection and dispatches the Linux host's real Control+C before readback.
- 320/390/736/1440px layouts, EN/zh, populated nested merge states and native-select
  label measurements pass. 200% CSS layout zoom passes at 1440 and 390px, with
  screenshots. This is desktop Chromium layout-zoom evidence, not native-device testing.
- Enter/Tab controls, deep-link position, related target anchors, 3px focus outline,
  forced-colors/reduced-motion styling, control heights >=48px, storage denial and
  file:// offline trace/source were checked. No runtime console errors, HTTP errors
  or external asset requests were observed. Zero automatic animation is used.
- Shipped shared + local CSS: 11,066 bytes. Measured core text contrasts:
  text/panel2 13.40:1, text/panel 14.70:1, text/bg 16.09:1. Lowest checked muted
  pair: 6.45:1. Accent and focus pairs exceed 3:1. Exact ratios and native select
  widths/font stack are in evidence/browser.json. Resolved font identities are not inferred.
- Metadata preflight: `python3 -B scripts/register_leetcode_lesson.py 726 --validate-only`
  exited 0, empty stdout/stderr. Exact command, cwd and timestamp: evidence/preflight.json.
  This was validate-only, with no registration or shared-file mutation.

## Visual inspection and fixes

The author opened the actual headless screenshot files with the image-viewing tool.
Inspected desktop headers and prediction panels in both languages, 320/390px
before/after maps, the 736px Chinese trace, desktop merge state and 200% layout-zoom
maps. The completed outer merge visibly preserves K:4, changes O:7 to O:14 and
N:1/S:2 to N:2/S:4. Maps reflow to one column on phones, retain level labels,
and keep each atom name and count on one line. History remains visible below.

An initial 390px/200% case overflowed due to an unbroken interface signature;
evidence/zoom-overflow-before.png retains that failure. Local wrapping fixed it.
A later measured height assertion exposed the shared .btn specificity overriding
a generic minimum-height rule; the local .btn override fixes this, and the final
suite passes the unchanged >=48px assertion. Screenshot inspection also exposed
stale top-of-page navigation highlighting; the final scroll-based active-step
calculation defaults to step0 and provides aria-current. Final runtime assets use
version 726-5. Metadata needed no correction and is frozen with this candidate.

Limits: synthetic desktop viewport and CSS layout zoom do not prove physical phone,
Mac font/clipboard behavior, browser-native zoom shortcuts, screen-reader speech,
learner comprehension, independent acceptance or public release. No scores or
claims from a separate reviewer are invented.

## 726-R1 follow-up — candidate 726-r1-fix-20261025

Date: 2026-10-25. Author self-check only; **fixed awaiting separate review**.
The original review at specs/reviews/726-review-1-c464c564.md and its historical
changes_required outcome are preserved. No independent acceptance is claimed.
Candidate identity and file hashes: evidence/review-r1-after/candidate-sha256.json.

| Finding | Causal fix | Evidence | Review status |
| --- | --- | --- | --- |
| 726-R1 | Step 02 now uses O(n + A·(d+1)); defines n, A and maximum parenthesis depth d, explicitly d=0 without parentheses; explains base-level building/tallying and further copying, with (H2O)3 worked as d=1, A=9. Both locales agree. | review-r1-before/regression.json retains the failing rendered paragraphs; review-r1-after/regression.json records passing text and exact displayed-baseline execution. baseline-en/zh-320/390/1440.png show the repaired paragraph. | fixed awaiting review; reviewer recheck/closure pending |

The error was explanatory: parenthesis depth omitted the base parsing level's
expansion work. The focused test failed on the old O(n + A·d) paragraph in both
locales, then passed against the corrected text. The actual displayed expansion
baseline returns H:1000 for H1000, H:100000 for H100000 (both d=0), and H:6/O:3
for (H2O)3 (d=1, A=9). Peak traced allocations are 16,488, 1,600,488 and 768 bytes
in this run. Allocation corroborates materialization; it is not a timing proof.
The upper bound follows because each final occurrence can be copied at each of
at most d enclosing groups plus the base, and Counter also traverses A entries.

Commands run from repository root (each exited as indicated):

```
OUTPUT_DIR="$PWD/leetcode/726/tests/evidence/review-r1-before" node leetcode/726/tests/review-r1.cjs
# exit 1, expected red: incorrect bound and missing zero-depth explanation
OUTPUT_DIR="$PWD/leetcode/726/tests/evidence/review-r1-after" node leetcode/726/tests/review-r1.cjs
# exit 0
OUTPUT_DIR="$PWD/leetcode/726/tests/evidence/review-r1-after" python3 -B leetcode/726/tests/check.py
# exit 0: 1294 canonical cases, 1280 expansion comparisons, 15780 intermediate frames
OUTPUT_DIR="$PWD/leetcode/726/tests/evidence/review-r1-after" node leetcode/726/tests/browser.cjs
# exit 0: 30 recorded state/source/layout observations, no browser/request errors
python3 -B scripts/register_leetcode_lesson.py 726 --validate-only
# exit 0, empty stdout/stderr; evidence/review-r1-after/preflight.json
```

The original algorithm and browser suites were run unchanged. Both-locale coverage:
all seven presets, every forward/back/replay operation, reset and endpoints,
all prediction choices, feedback invalidation, locale roundtrips, keyboard/focus,
320/390/736/1440 layouts, and CSS 200% layout zoom. Focused regression additionally
checks the complete hand ledger; nested operation 8's O:1+3×2=7, K:4, 8 history
entries and consumed 11/13 characters; output remains pending. It confirms that a
trace preset change resets history while retaining the independent prediction,
and that changing the prediction clears feedback. Central formula and cost text
remain complete after locale switches. Candidate/best-value optimization pairs
are inapplicable to this parsing lesson.

The Python canonical interface remains faithful to the saved official Python3
snippet in evidence/official.json. That evidence also includes TypeScript; Python
already has preference. No non-Python contract or supportedLanguages list exists
or is needed. Read the exact registration LANGUAGE_FILES pair:
solution.py / python-code.js / PYTHON_SOURCE. Canonical Python execution passed;
its source and mirror did not change. Rendered textContent, successful clipboard,
forced fallback with sentinel and real Linux Control+C/readback, downloaded bytes,
and offline source all equal the canonical source including final newline.
No embedded-source regeneration was necessary.

Metadata complexity remains exactly the nonempty string
`O(n² + kL log k) time; O(n) auxiliary space`. The safe validate-only preflight
was executed from the root and returned 0; no registration was performed.
Local preview response bytes equal candidate assets (served-parity.json).

Visually inspected repaired baseline screenshots en-320/en-1440 and zh-320/zh-390,
and the populated en-320 trace. Paragraphs wrap, the full corrected formula and
base-level explanation are readable, and the nested counts retain level labels.
Both locale cost paragraphs also passed 390px/200% CSS layout zoom overflow checks.
Chromium 156.0.8078.4 on Linux; CSS/shared tokens unchanged (11,066 total CSS bytes).
No new layout, runtime dependency, algorithm or interaction change. The copy.js
query version was bumped so the corrected text can be fetched as a new asset.
No child agents, commits, deployments, shared assets or review reports changed.
Real devices, native browser zoom, other-platform fonts/clipboard, learner
comprehension, LeetCode submission and separate review remain unverified.
