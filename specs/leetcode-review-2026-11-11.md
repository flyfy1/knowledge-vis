# LeetCode review, fixes and twelve additions — 2026-11-11

Record of one day's work on the LeetCode collection: a teaching review of the
registered lessons, the fixes that followed, twelve new lessons, and what is
still unverified. Lesson-specific detail lives in each lesson's `BRIEF.md`
("Revision 2026-11-11", "Cross-review 2026-11-11", "Integration 2026-11-11");
this file is the collection-level summary. All work was done by Claude Code
(claude-opus-5-5) sessions; no human reviewed it and no LeetCode submission was
made.

## 1. Teaching review of the registered lessons

The owner asked whether the existing lessons guide a stuck learner to the
solution (why the obvious approach fails, what observation unlocks the problem,
how it becomes the algorithm, why it is correct), rather than showing a finished
solution beside a trace. Four reviewers split the 189 registered lessons by id
range and scored each 0–3 on a frozen rubric:

| | Dimension |
| --- | --- |
| A | Starts where the learner is (plain restatement, small example, naive approach and why it fails) |
| B | The key insight is discovered from an example before the technique is named |
| C | Steps build on each other, each answering one stated question |
| D | Why it is correct (invariant / exchange argument / DP meaning, tied to the example) |
| E | The interaction lets the learner see the insight happen |
| F | Code is derived from the steps, complexity explained |
| G | Correctness of content (fully read lessons only) |

Each reviewer triaged every lesson in its range from `copy.js` and `BRIEF.md`
and read at least ten in full in a browser (zh/en).

Findings that apply to the collection as a whole:

- **Quality clusters by generation.** The "hard traces" generation (2026-10-18,
  per-lesson `core.js`) and most later campaign lessons follow a strong recipe:
  hand example, tempting mistake with a counterexample, baseline with a concrete
  cost, derivation from the same example, invariant, lab, fresh prediction,
  proof, code map. The weakest were the un-deepened "first ten" lessons (23, 41)
  and a thin group of later lessons (233, 239, 273, 295, 297, 301; 1163, 1172,
  1178, 1187) that name the technique first and have short or missing proofs.
- **Criterion B is the common gap.** In many otherwise good lessons the
  decisive observation is announced ("use a monotonic stack") instead of being
  drawn from a number the reader has just computed. Each review lists, per
  lesson, the example and question that should come before the technique.
- **Workflow status in learner copy.** Most lessons still showed "author
  self-checked candidate; independent review pending" in a footer or verify
  paragraph, which `leetcode-explainers.md` ("Workflow records and learner
  copy") forbids. A separate pass removed it from the lessons not revised today;
  the revised lessons and the six below had it removed by their fixers or by the
  integration step. Removing it does not claim acceptance.
- **Dead and mis-targeted related links** in the later lessons (282, 295, 297,
  301, 1172, 1178, 1187, 1163, 312): links to lessons that do not exist or whose
  label did not match the target. Link checks and a 390 px overflow check had
  evidently not run on those lessons before merge.
- **Interaction is the weakest dimension.** Most main traces replay presets;
  only a minority let the learner enter the input that carries the insight.

Content errors found by the review (all fixed, see §2): 420 proof
misstatement (M=2 for a single long run); 1178 hand example and wrong-rule
example; 1163 a counterexample copied from #1044; 1172 a wrong fill state;
301 balances, character positions, an en/zh mismatch, and a trace that did
not follow `solution.py`. 818 taught only an exponential-worst-case A* while an
O(T log T) DP exists; 843 did not say whether its heuristic meets LeetCode's
guess budget.

## 2. Fixes

**Revised lessons (31).** Insight rewrites, content corrections and link fixes
following the review: 23, 41, 214, 233, 239, 273, 282, 295, 297, 301, 315, 336,
420, 517, 591, 685, 726, 753, 770, 773, 818, 843, 857, 975, 1163, 1172, 1178,
1187. Three Codex candidates that were never registered (1159, 1168, 1192)
were reviewed against the rubric, rewritten in full and cross-reviewed as new
lessons. Cross-reviewed by a second Claude Code session: 23, 301, 818, 843,
1159, 1168, 1178, 1192. The others are self-checked by their fixer only.

**Content check of the remaining 137 lessons.** A quick read-through
(about ten minutes per 45 lessons; examples recomputed with each lesson's
solution, proofs checked by reading only, no browser) found six slips, fixed by
the integration step:

| Lesson | Finding | Fix |
| --- | --- | --- |
| 312 | Related link labelled "Minimum Cost to Cut a Stick" pointed at #132 | Points at #1000 step 3 (interval DP), relabelled |
| 391 | Corner-only contact "usually" does not make a rectangle | "never" |
| 483 | Quiz state [2,8], midpoint 5 is not what the lesson's bound gives at m = 3 | Quiz rebuilt on n = 15: [2,4], midpoint 3, 40 > 15, keep [2,2] |
| 765 | English same-page links "#2 →", "#4 →" read like problem numbers | Plain "Revisit: …" labels |
| 936 | "reaches a billion" character checks | about 2.5×10⁸ (n·(n−m+1)·m peaks at m ≈ 500) |
| 956 | Explanation names "Option 0/2" but options are unnumbered | Names them by their pairs |

Also: 1178's quiz used 3-letter words although the problem requires length ≥ 4
(words replaced, answer still 5).

**Metadata.** Registry entries were checked against every revised lesson's
`lesson-entry.json`. Drift fixed: 301 complexity ("O(2^p·n) time in the worst
case (p ≤ 20 parentheses); O(n) recursion space plus output"); 818 desc,
topics and complexity now name the O(T log T) run DP as the solution to submit
and A* as the explored route; 1178 complexity (P·2^6, not 2^7). CONCEPT-MAP
rows for 297, 301 and 1178 were resynced by the registration script.

**Shared stylesheet.** `leetcode/style.css` `.readout` gained
`overflow-wrap:anywhere`; long unbroken tokens had overflowed narrow readouts
(found in 1178, which also patched its own stylesheet). Checked on ten lessons
(23, 185, 391, 630, 843, 1000, 1097, 1159, 1178, 2916) at 320 px in zh and en:
no page overflow or readout overflow before or after, no readout height change.
Lesson pages load `../style.css` with assorted `?v=` queries that were not bumped.

**Browser-test server variable.** Fixers had independently added
`PREVIEW_URL`, `BASE_URL`, `LESSON_BASE_URL`, `LESSON_URL`,
`LESSON_PREVIEW_URL` and hard-coded ports (18770, 18775–18795, 18901–18905).
In every lesson touched today the browser tests now read one variable:

- `PREVIEW_ROOT` — the site root, no trailing slash; default
  `http://127.0.0.1:18770`. Tests append `/leetcode/<id>/`.

Example: `PREVIEW_ROOT=http://127.0.0.1:18941 NODE_PATH=… node leetcode/1063/tests/browser.cjs`.
Older lessons not touched today may still use other names; new or edited tests
use `PREVIEW_ROOT`. Output-directory variables (`OUTPUT_DIR`, `EVIDENCE_DIR`,
`LESSON_OUTPUT_DIR`, …) were not unified.

## 3. Twelve new lessons

727, 759, 772, 774, 1063, 1067, 1088, 1097, 1121, 1127, 1153, 1183 — all
subscriber-only problems whose preparation pass had stopped at the paywall.
Each was built from its prepared brief, self-checked by its builder, then
cross-reviewed by a separate Claude Code session that re-derived the statement
from public mirrors, wrote its own brute-force oracle before reading the
builder's, recomputed the page's numbers, and read the page in zh/en at
1280/390/320 (verdict: publish, caveats stated on the pages). Registered with
`scripts/register_leetcode_lesson.py`: 189 → 201 entries. The three rewritten
Codex candidates (1159, 1168, 1192), never registered before, were registered
in a separate commit after their cross-review: 204 entries.
Builders: 774, 1063, 1067, 1088, 1097, 1121 record Claude Code
(claude-opus-5-5) in their BRIEF; 727, 759, 772, 1127, 1153, 1183 do not name
their builder, and their commit says `model unavailable`.

## 4. What remains unverified

- No LeetCode submission of any solution, new or revised.
- The twelve new lessons' statements, signatures and limits are confirmed only
  from public mirrors (doocs/leetcode, walkccc, leetcode.ca and others), not
  from the official page.
- SQL lessons 1097, 1127 and 1159 were run on SQLite with translations and
  read as MySQL 8; none was run on real MySQL.
- 772 assumes no unary minus (implied by "non-negative integers" and "valid",
  not stated in words by either mirror).
- 818's DP shape argument (the exchange argument limiting the first run) rests
  on exhaustive comparison with the proved-optimal A* for every target
  1…10 000, not on a proof.
- The content read-through of 137 lessons was quick and checked proofs only by
  reading; most lessons were not opened in a browser for it.
- Self-checked revisions (23 lessons) have had no second reader.
- No learner has used any of these lessons.

## 5. Test results at integration

Server `python3 -m http.server 18941 --bind 127.0.0.1` from the repo root,
Playwright via `NODE_PATH`, browser tests run serially.

- Every test file of the 49 lessons touched today was run. All pass, with
  these exceptions:
  - Pre-existing (same failure on a scratch copy of HEAD `a137ddc0` served on
    its own port): 391 `browser.cjs` (anchor lands 3 px under the sticky nav),
    765 `test_browser.cjs` (extension service worker never starts in the
    headless shell), 936 `browser.cjs` (keyboard order in a native select).
    Environment-dependent; not fixed.
  - Harness, not lesson: 282 `browser-check.mjs` cannot resolve Playwright
    through `NODE_PATH` as an ES module; 315 `test_solution.py` needs
    `PYTHONPATH=leetcode/315`; several `test_core.cjs` need the fixtures their
    `test_solution.py` writes first, or are run by it (all pass in that order);
    the `check_*access*.py` probes need network/`requests` and are not tests.
  - 1159 `browser-check.js` targets the replaced Codex candidate and fails on
    the rewrite; kept as history.
- Collection: `leetcode/tests/test_core.cjs`, `test_hard_core.cjs`,
  `test_hard_solutions.py`, `test_solution.py`, `test_browser.cjs`,
  `test_hard_browser.cjs`; `scripts/test_leetcode_{registry,metadata,campaign,
  publish,static_versions}.py`, `test_import_leetcode_lane.py`,
  `test_campaign_publication.py`, `test_leetcode_collection.cjs`,
  `test_index_pagination.cjs`; `tests/page-provenance-core.cjs`,
  `tests/leetcode-home-section.cjs`: all pass.
- Two collection tests failed identically on HEAD and were fixed:
  `leetcode/tests/test_browser.cjs` still expected one collection card on the
  homepage (the view now lists every lesson; the test checks the count against
  the registry), and one case in `scripts/test_leetcode_campaign.py` compared an
  unresolved temp path with the resolved one main() uses (macOS `/var` vs
  `/private/var`).
- Homepage LeetCode view, zh and en at 1280 and 390: 204 cards including the
  fifteen added today, no overflow or console errors; every same-site link and
  anchor on the new lessons resolves.
