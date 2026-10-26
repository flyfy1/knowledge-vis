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

## 2026-10-26 · 940-COPY-R1 new candidate self-check

Status: **fixed awaiting separate independent review**. This append supersedes
neither the historical acceptance nor the original candidate/evidence above.
New receipt: `tests/evidence/copy-r1/candidate.json` (content hashes, no commit).
Stable finding mapping: **940-COPY-R1** → remove the `site-foot` element and its
sole `foot` dictionary pair; bump `copy.js?v=1` to `v=2`. No acceptance claim
replaces it. Exact bilingual deletion is retained in
`tests/evidence/copy-r1/runtime.diff`. All other copy entries are unchanged.

Reconfirmed the request's copy/HTML and all five protected runtime hashes before
editing: each matches the inspected historical base. Before/after hashes are in
`before.json` and `preservation.json` within that evidence directory. app.js,
core.js, solution.py, python-code.js, style.css and lesson-entry.json remain
byte-identical. Only the footer consumed `foot`; no remaining runtime consumer
or orphan element exists. No shared files, registry, reports, acceptance state,
services, Git settings or prior evidence were edited.

Commands from repository root and observed results:

- `OUTPUT_DIR="$PWD/leetcode/940/tests/evidence/copy-r1/red" node leetcode/940/tests/copy-r1.cjs`
  — exit 1 before repair: actual footerCount=1 and old workflow wording present
  in zh→en→zh. Red result and bilingual page-end screenshots are preserved.
- `OUTPUT_DIR="$PWD/leetcode/940/tests/evidence/copy-r1/green" node leetcode/940/tests/copy-r1.cjs`
  — exit 0 after repair: 11 observations, zero page/console errors. The same
  footer regression now finds zero elements and no workflow wording throughout
  zh→en→zh. Served bytes equal checkout bytes. Checks include native 200% zoom
  and 320px page end, retained `sim`/`p4`/`boundaries`, heading/title, canonical
  formula, completed-prefix totals 0→1→3→6, rewind/replay, ab→aba calculation
  3−1+4=6, locale-retained revealed abba prediction 5−1+6=10, independent
  prediction retained after preset reset, and feedback cleared on choice change.
- Exact source checks in that browser command passed for decoded PYTHON_SOURCE,
  rendered textContent, successful copy, native manual transfer and downloads in
  both locales, with the final newline intact; offline file display also passed.
  Every manual attempt had its own distinct written/read-back sentinel before
  automatic-write denial, full focus/selection check, Linux Control+C, and exact
  clipboard readback. No whitespace/newline normalization was used.
- Focused inline `python3 -B` / `runpy.run_path` executed the actual canonical
  `Solution.distinctSubseqII`: aa→2, aba→6, abba→10, fresh baa→5, all passed.
  Interface evidence in provenance/official.json includes faithful Python3;
  preferred Python remains selected, no non-Python contract or omitted
  supportedLanguages issue exists. Read the registration table's exact Python
  pair: solution.py / python-code.js / PYTHON_SOURCE. No regeneration needed.
- `python3 -B scripts/register_leetcode_lesson.py 940 --validate-only` — exit 0,
  empty stdout/stderr. Recorded in `tests/evidence/copy-r1/preflight.json`.
  complexity remains the single string
  `O(n) time; O(26) = O(1) auxiliary space`. No registration was run.
- `node --check leetcode/940/copy.js`,
  `node --check leetcode/940/tests/copy-r1.cjs`, and `git diff --check` passed.
  Exact allowed runtime delta was also asserted against HEAD. Broad numerical
  suites were not rerun for this prose deletion, as requested by 940-COPY-R1.

Author visually inspected all four green captures: `end-zh-320.png`,
`end-en-320.png`, `end-zh-zoom200.png`, `end-en-zoom200.png`. Both page ends retain
readable cost/boundary text and related links, with normal existing section
padding and no empty footer gap or replacement status. English related labels
wrap at 320px; the final link has a visible keyboard focus outline. Tab from
Copy reaches Download, then each related link in both locales. Native Chromium
156.0.8078.4 on Linux zoom via tabs.setZoom(2) reports outerWidth=1280,
innerWidth=640 and DPR=2. Narrow source code retains its existing horizontal
scroll area; viewport screenshots naturally start partway through the section.
No CSS, font or contrast token changed; this check does not claim a new palette
audit, physical-device test, public delivery or novice teach-back.

Next action: a separate reviewer inspects the frozen receipt, exact runtime diff,
red/green evidence, bilingual page end and preserved behavior, then determines
closure of **940-COPY-R1** under the existing narrow revision rules. No author
self-check marks it independently closed. Historical optional **940-ADV-01**
remains deferred and unchanged.
