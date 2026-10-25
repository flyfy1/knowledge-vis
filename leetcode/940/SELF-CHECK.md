# #940 author self-check — frozen candidate

Status: complete author candidate, ready for a separate independent review.
No independent acceptance, deployment, public-byte verification, LeetCode
submission, or actual learner outcome is claimed. Only leetcode/940/ was written.

Official evidence: provenance/official.json captures the public GraphQL response
on 2026-10-26, including statement, examples, limits, all observed code snippets
and callable metadata. The public official page was also read. Python3 is a
faithful supported interface; no language exception or conceptual substitute.

Executed from repository root:

- `python3 -B leetcode/940/tests/numerical.py` — pass: 10,083 canonical checks,
  all abc strings through length 8, seeded small strings, official examples,
  closed forms and independent last-occurrence recurrence at length 2000.
  Additionally executed displayed baseline on 363 abc strings through length 5.
- `node leetcode/940/tests/core.cjs` — pass: 24,627 prefix frame checks of exact
  sets, per-letter groups, old/new counts and total; 79 bilingual copy pairs and
  duplicate-key detection. Separate position-mask oracle.
- `node leetcode/940/tests/browser.cjs` — pass: 38 recorded state observations,
  30 original screenshots, zero console/page/HTTP asset errors. Both locales,
  six presets, all prefix totals, endpoints, complete reverse/replay, reset,
  independent prediction before/reveal/change and locale persistence, successful
  native clipboard plus four native manual transfers (fresh verified sentinel
  before each), source display/download parity with final newline, offline source,
  storage denial, keyboard/focus, forced-colors outline, local related targets.
- `python3 -B scripts/register_leetcode_lesson.py 940 --validate-only` — exit 0,
  no stdout/stderr. Evidence: tests/evidence/preflight.json. Metadata complexity
  is one nonempty string; no registration or shared metadata changes were made.

Browser/host and exact rendered values are in tests/evidence/browser.json.
320/390/736/1440px and native Chromium 200% zoom were exercised in both languages.
Zoom used tabs.setZoom(2), confirming DPR 2 and 640 CSS px in a 1280px window.
Minimum measured solid text-role contrast: 6.449407898769069:1 (muted on panel2),
above AA; primary text exceeds the 7:1 target. Disabled primary state is explicitly
asserted to use solid muted/panel2. Shared + local shipped CSS is 10,937 bytes,
under 25,000; no runtime images, fonts, dependencies or external asset requests.

## Visual inspection (author, not an independent cold walk)

Viewed the original focused captures plus a labeled contact sheet of all 30
captures: tests/evidence/inspection-contact.jpg. Full desktop header/baseline
crops in both languages were also viewed. Verified final tables at 320px show
all four headers and the final total 14; text wraps with no collision. At 390px,
ending groups retain complete strings, disabled buttons look disabled, and
prediction selection and revealed explanation agree. Native 200% captures in
both languages retain the full ledger, old/new calculation and final answer.
The 320px selected preset capture visibly contains all of “abca → 14”; budget
measurements use the actual rendered font stack and a conservative 24px arrow
reserve, without claiming a specific resolved physical font.

Related links were keyboard-activated in both locales at 320px and source hashes
of the targets are retained in browser.json. #115 step0 explicitly counts position
choices, illustrating the distinction from this lesson; #552 step2 aggregates
prefix counts into six finite states. This establishes the local preview targets;
production navigation still requires the eventual release verification.

## Evidence limits and development corrections

README.md in tests records harness corrections and local visual repairs before
freeze. Full screenshots may show a naturally partial viewport; focused table and
preset captures separate component readability from sticky/scroll capture effects.
No physical phone, assistive-technology user study, production origin, or novice
teach-back was observed. Independent review must reconstruct the proof and fresh
case before consulting this brief/self-check, using the repository six-dimension
rubric. Candidate hashes are in tests/evidence/candidate.json; do not mutate this
candidate to satisfy a later review without creating a new candidate record.
