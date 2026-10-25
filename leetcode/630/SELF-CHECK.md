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
