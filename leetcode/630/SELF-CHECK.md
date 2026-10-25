# Author self-check — #630

Status: complete author candidate, ready for separate independent review. This
report is not acceptance, a learner study, a LeetCode submission result, or a
deployment receipt. Preview: http://127.0.0.1:18783/leetcode/630/.
Candidate identity is frozen in tests/evidence/candidate.json.

## Observed checks

- Official public page and GraphQL response verified statement, all three
  examples, inclusive deadlines, constraints, free access and actual Python3
  starter. See tests/evidence/official-evidence.md and official-graphql.json.
- `python3 -B leetcode/630/tests/test_solution.py`: PASS. 1,555 exhaustive arrays
  over six small pair values (length 0..4), 500 seeded cases, three official
  examples, fresh transfer/counterexample cases, and three maximum-n=10000
  boundaries. Independent subset enumeration checks the canonical Python.
  Sampled recursive all-order enumeration also checks the deadline-order oracle.
  Input preservation checked. All 10,431 simulation frames checked for unique
  retained IDs, elapsed sum, per-course feasibility, prefix-optimal count,
  operation accounting and completed-operation timing.
- `node leetcode/630/tests/browser.cjs`: PASS in real headless Chromium, using
  the already-running preview. Both languages, five presets, each forward/back
  endpoint, reset/end, independent hand choices, all prediction choices and
  stale-feedback clearing; locale preserves trace/answer/reveal/disclosure.
  Exact decoded mirror, rendered textContent, actual clipboard readback,
  downloaded bytes and selected manual fallback match solution.py including
  final newline. Copy feedback is checked after locale switching. Offline file
  source display and blocked localStorage also pass.
- Browser widths 320, 390, 736, 1440; both languages; all presets at 320/390.
  Document/card geometry passed, 48px control heights, keyboard Enter/Tab focus,
  3px focus outline and forced-colors retention checked. CSS zoom 200% in real
  Chromium passed reflow checks; this is not physical-device/browser-chrome
  zoom gesture evidence.
- Author visually inspected the ten retained trace/stage/zoom PNGs. At default
  frame 2, #0 is Removed, #1 is Just processed / Retained, #2 is Pending;
  retained #1 finishes day 2<=5; ledger displays 4+2=6>5 and removal of #0
  (4 days), restoring 2 days. Same meaning in Chinese. Course cards and ledger
  reflow without squeezing labels. Sticky navigation overlays the top of some
  tall element screenshots because of capture scrolling; ordinary navigation
  target geometry is separately checked, and course/schedule/history remain
  fully legible. This is a capture artifact, not evidence of a hidden target.
- No runtime console/page errors or failed local assets in the final run; all
  runtime requests local; related links resolve to existing anchors.
- Measured contrast in browser-results.json: body 16.09:1, explanation 12.62:1,
  stage 14.70:1, readout/control 13.40:1, muted hint 7.74:1, disabled label 6.45:1,
  active locale 13.10:1 and focus on panel2 8.94:1. Core text exceeds 7:1;
  disabled text exceeds AA. Total shared + local CSS: 10,920 bytes.
- Copy keys checked before evaluation for duplicate definitions and all entries
  checked as nonempty [zh,en] pairs. Rendered replacement arithmetic and removal
  identity explicitly checked in both locales, separately from clipboard errors.
- From repository root, `python3 -B scripts/register_leetcode_lesson.py 630
  --validate-only`: PASS, exit 0, no stdout/stderr. Receipt: preflight.json.
  Complexity is one string covering time and space. No registration was run.

Initial browser attempts exposed a test setup expecting a disabled control when
all controls were enabled, and a missing favicon request. The final tests set an
endpoint before contrast sampling; the lesson includes a local SVG favicon. All
final results above are from successful reruns after these fixes. No independent
review finding was created or rewritten.

## Limits / next gate

Only this lesson directory was authored. No shared assets, registry, campaign
reports, services, credentials, deployment, Git configuration or commits changed.
The website-design skill was used for the approved reused pattern; its independent
product/design gate is covered by the existing all-Hard design review and dispatcher
adjudication, not by this self-check. A fresh reviewer must cold-walk the frozen
candidate, audit the proof/code/evidence, and apply the six-dimension gates.
Real novice teach-back, physical devices and public delivery remain unverified.

## Repair self-check — 2026-10-25 — 630-MAC-001

This append supersedes the readiness statement above for this repaired candidate.
Status: implemented and self-checked on Linux; required native Mac evidence is
pending. Finding remains open for independent review. The historical 95/100
review and dispatcher report are unchanged. No independent acceptance is claimed.
Evidence: [repair-630-MAC-001](tests/evidence/repair-630-MAC-001/).
Frozen files and new candidate identity: candidate.json and candidate.sha256 there.

Fix mapping: **630-MAC-001** → shorten the five bilingual preset labels in copy.js,
keep output counts explicitly scoped to courses, preserve inputRead's full arrays,
and bump the copy.js query in index.html. Native 16px type, shared stack, padding,
arrow, options, inputs, Python and trace logic remain intact. `Ties` identifies the
same tied deadline/duration input visible below. No source regeneration is needed:
solution.py and its exact python-code.js mirror are unchanged.

The website-design skill was applied to the already approved reused layout. The
diagnosing-bugs skill was also applied: before runtime edits, a new actual-control
test (`tests/preset-labels.cjs`) failed with six English overflow records (three
presets at 320px, visited twice in the locale roundtrip). Baseline measurements:
replacement 258.66px, impossible 222.38px, ties 251.18px versus 214px available.
The saved before/en-320-0.png visibly truncates the array and ending/output.
This is the actual clipping symptom, not a page-overflow proxy.

Ranked hypotheses were stated before testing: (1) shorter labels fit, (2) removing
padding fits, (3) Arial fits. One-factor DOM experiments in hypotheses.json support
(1) and reject (2)/(3) as complete fixes: both still fail replacement and ties.
The initial short-label experiment used `Replacement: 2 courses` (178.24px);
the final `Replace: 2 courses` provides more room. No instrumentation remains in
runtime code. Original probe is retained byte-for-byte as tests/preset-probe-original.cjs.

Commands run from the repository root (each output directory below is prefixed
with `$PWD/leetcode/630/tests/evidence/repair-630-MAC-001/`):

- Before repair: `PREVIEW_ROOT=http://127.0.0.1:18770 OUTPUT_DIR=<prefix>before node leetcode/630/tests/preset-labels.cjs`
  → exit 1, 45 records, six clipping failures. The later count-scope assertion is
  additional regression coverage; the width assertion that failed is preserved.
- After repair: same command with `OUTPUT_DIR=<prefix>after` → exit 0, 45 records,
  zero failures at 320/390/1440, EN→ZH→EN, all five presets. Full visible input
  matches each independent fixture; output counts 2/3/1/0/3 have explicit units.
- `FONT_SIZE_PX=20 PREVIEW_ROOT=http://127.0.0.1:18770 OUTPUT_DIR=<prefix>stress-20px node leetcode/630/tests/preset-labels.cjs`
  → exit 0, 45 records, zero failures. Synthetic sensitivity only, not Mac emulation.
- `OUTPUT_DIR=<prefix>validation python3 -B leetcode/630/tests/test_solution.py`
  → exit 0; actual Python, 2055 cases, three official examples, three large
  boundaries and 10431 trace frames; independent oracles, feasibility, prefix
  optimum, accounting, unchanged input, exact source/mirror parity all pass.
- `PREVIEW_ROOT=http://127.0.0.1:18770 OUTPUT_DIR=<prefix>validation node leetcode/630/tests/browser.cjs`
  → exit 0; both locales, all presets/frames/rewinds, replacement arithmetic,
  course identity, completed counts and ledger, independent prediction feedback
  and invalidation, locale preservation, keyboard/focus, 320/390/736/1440 and
  200% CSS zoom, source display/copy/download/offline parity all pass. Strengthened
  manual fallback to execute Control+C and compare clipboard readback exactly,
  including final newline. Duplicate keys and [zh,en] shape checks pass.
- `python3 -B scripts/register_leetcode_lesson.py 630 --validate-only`
  → exit 0, empty stdout/stderr; receipt preflight.json. Complexity remains the
  single string `O(n log n) time; O(n) auxiliary space`. No metadata repair or
  registration occurred. Python remains the faithful preferred official interface;
  saved official-graphql.json includes Python3 and TypeScript starters. Read the
  registration mapping: solution.py → python-code.js → PYTHON_SOURCE. No non-Python
  language contract is applicable.

Platform: Linux aarch64, Chromium 156.0.8078.4; executable selected through
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. Measured CSS stack is PingFang SC / Microsoft
YaHei / system-ui / sans-serif; this does not identify the resolved glyph font.
The 16px arrow allowance is retained from the incident probe, not generalized.
Visually inspected every repaired EN/ZH 320px control image: complete identity,
count and ending beside the arrow. Inspected the before replacement crop,
20px impossible crop, both 320px intermediate stages and 200% zoom screenshots.
Stage captures retain the known sticky-nav capture overlay; dedicated control
crops show the selected labels unobscured. Full input and intermediate 4+2=6,
remove #0 (4 days), repaired 2 days remain legible and coherent in both locales.

Directly running the unchanged original probe on Linux first failed because its
default Playwright headless-shell executable is absent. An in-memory launch-only
wrapper selected the provided executable and reran the unchanged script: 20
checks, zero clipping failures (linux-original-probe/results.json). This is Linux
evidence only. The frozen native Mac command, checksums and screenshot handoff
are in the evidence README. Native Mac execution and independent assessment are
the concrete remaining evidence; this run cannot supply them. No prior report,
rubric, registry, shared assets, campaign state, services or other lessons changed.
