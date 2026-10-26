# Independent review — LeetCode 1178

- Candidate revision: `f0f096104429617ac58328ef506361c3f6069013`
- Candidate URL: http://127.0.0.1:18770/leetcode/1178/
- Reviewer identity/run: unavailable (independent fresh run)
- Rubric: `specs/leetcode-review-gates.md`

## Cold browser walkthrough (recorded before source/tests/brief)

I opened the candidate in a headless Chromium browser at 1280×900 and read only the rendered page. The title was “#1178 · Number of Valid Words for Each Puzzle”; the page exposed English/Chinese toggles, five numbered steps, Previous/Next/Reset/Jump to end, a teaching-data selector, four answer radios, Reveal answer, and Copy Python source.

### Step 1 — Count one puzzle
- **Question:** when is a word valid?
- **Action:** read the worked `aboveyz` example and the visible word examples (`aaaa`, `actor`, and the `abslute` result list).
- **Observable result:** `aaaa` is shown valid because its distinct set `{a}` is inside the puzzle and includes first letter `a`; `actor` is shown invalid because `c,t,o,r` are outside. Repeated letters are said to count once, and the official example result is `[1, 1, 3, 2, 4, 0]`.
- **Causal paraphrase:** validity depends on the set of distinct letters being a subset of the puzzle plus inclusion of the puzzle’s first letter; multiplicity does not change the set.

### Step 2 — Baseline and trap
- **Question:** why does pairwise checking repeat work?
- **Action:** read the baseline and the explicit tempting-shortcut counterexample for puzzle `abxyqrs`, first letter `b`.
- **Observable result:** the page says checking every word against every puzzle repeats `O(WP·L)` work; counting only words containing `b` would incorrectly accept `bzz` while `bxx` is valid.
- **Causal paraphrase:** first-letter presence is necessary but not sufficient; all distinct letters must fit, so pairwise scanning repeats the same set checks.

### Step 3 — Submask invariant and simulation
- **Question:** how can only allowed letter sets be enumerated?
- **Action:** read the toy `abc`/`111₂` transition and the displayed pseudocode/invariant, then inspect the teaching simulation controls and initial official `aboveyz` data.
- **Observable result:** the visible sequence is `111₂ → 110₂ → 101₂`; `110₂` lacks first bit `a` and contributes 0, while `101₂` contains `a` and contributes 1 when its frequency is 1. The page states `(sub - 1) & puzzleMask`, `freq[m]` as exact-mask counts, and initially shows `Checked 1/127 submasks; current answer 0`, with a first row `aboveyz 0 0`.
- **Causal paraphrase:** subtract-one followed by AND enumerates submasks of the seven-letter puzzle; summing frequencies only for submasks containing the first bit gives the answer, while outside letters are removed by the AND.
- **Simulation state observed:** controls showed `words = ["aaaa","asas","able","ability","actt","actor","access"]; puzzle = aboveyz`, Previous/Next/Reset/Jump to end, and a running trace. The page explicitly labels this as a teaching simulation rather than execution of the displayed Python.

### Step 4 — Transfer exercise
- **Question:** can the invariant predict a new answer?
- **Action:** I attempted to select the visible `Transfer: abxyqrs` option. The cold automation did not settle after that click, so I wrote a prediction before any reveal for the words shown in the initial readout: **2** (`aaaa` and `asas` only). I selected radio `2` and attempted Reveal answer.
- **Observable result:** the page presents four choices (`0,1,2,3`) and a Reveal answer control; the automation did not return stable post-reveal text before timeout, so reveal confirmation is unavailable in the cold pass. A later source-informed browser audit confirmed the actual transfer preset is `aax, abx, bxx, ay` and its answer is 3; that later check is reported below and is not substituted for the cold observation.
- **Causal paraphrase:** transfer requires applying the same subset-plus-first-letter invariant to a different puzzle; my independent calculation predicts two valid words.

### Step 5 — Map to official code
- **Question:** how does each simulation row map to Python?
- **Action:** read the visible mapping/cost text and source controls without opening implementation files.
- **Observable result:** the page says the code builds `freq`, `puzzleMask`, and `firstBit`, visits submasks with `(sub - 1) & puzzleMask`, and reports `O(W·L)` frequency construction, at most `2^7` submasks per puzzle, and `O(W)` distinct word masks. It offers Copy Python source, Download solution.py, and “Show the complete local mirror of the official callable.”
- **Causal paraphrase:** preprocessing compresses words by exact letter masks, then each puzzle scans only its 7-letter subset lattice; the page claims this mapping but the cold pass did not execute or inspect source.

### Cold-pass evidence
- Screenshot: `specs/reviews/1178-evidence/1178-review-2-f33f12dc/cold-desktop.png`
- Screenshot: `specs/reviews/1178-evidence/1178-review-2-f33f12dc/cold-transfer.png` (captured while attempting transfer selection)
- The cold pass was performed before reading any source, test output, author claims, or previous review.

## Source, contract, and validation audit

- `lesson-entry.json` has the required single nonempty complexity string: `O(W·L + P·2^7) time; O(W) space`; the non-Python `language-contract.json` is absent, which is appropriate because the entry declares Python and `solution.py` exposes the official `Solution.findNumOfValidWords(self, words, puzzles) -> list[int]` callable.
- `python-code.js` decodes byte-for-byte to `solution.py` (both 743 bytes); browser-rendered `pythonCode` matched `window.PYTHON_SOURCE`. The download target `solution.py` exists. The canonical Python was executed on an independent case `words=['ab','ac','bc','aaa','z']`, `puzzles=['abcdeff','bacdefg','zabcdef']`; predicted and observed output was `[3, 2, 1]`.
- `python3 -B scripts/register_leetcode_lesson.py 1178 --validate-only` exited 0; output is in `1178-evidence/1178-review-2-f33f12dc/preflight.txt`. The supplied deterministic/oracle/source-parity test exited 0 (`1178 solution/oracle/source parity: PASS`). Official URL browser access returned Cloudflare HTTP 403, so no submission or human-comprehension claim is made.
- The current core trace independently computes exact masks, frequencies, all 127 nonempty submasks, first-bit filtering, running totals, and endpoint/reset state. Browser checks at 320, 390, and 1280 px showed initial `1/127`, keyboard Enter on focused Next -> `2/127`, Jump to end -> `127/127` answer 1, Reset -> initial state, and transfer preset readout `aax, abx, bxx, ay` with answer 3. Choosing 2 gave the expected incorrect feedback; changing the choice hid feedback. Screenshots and JSON traces are in the exclusive evidence directory.
- Chinese and English trap text now agree (`bxx` valid, `bzz` rejected), and both locales contain the concrete `111₂ → 110₂ → 101₂` transition plus the `0` to `1` contribution explanation. No page errors occurred at tested widths. Copy fallback was forced to reject and displayed the manual textarea with all 743 source bytes and `Select the text`; normal copy path reported `Copied` in browser audit. Source and displayed text parity held.
- At 200% CSS zoom, 320/390 captures have `scrollWidth=911` and require horizontal scrolling; desktop remains 1280 wide. The narrow zoom screenshots show controls and explanation present but compressed, so this is retained as a device-access limitation rather than an acceptance blocker.

## Closure of prior required findings

- `1178-R1-BILINGUAL-001` (prior revision `3574936b...`): **closed for this candidate**. `copy.js` now explicitly says in Chinese that `bxx` fits and `bzz` fails due to `z`; browser assertions in both locales at 320/390/1280 passed. This closure applies only to revision `f0f0961...`.
- `1178-R1-DEPTH-002` (prior revision `3574936b...`): **closed for this candidate**. The new worked-example block precedes the abstract formula and explicitly explains subtraction, AND masking, first-bit exclusion, and a running-total change; these strings were observed in both locales and the rendered screenshots.

## Scores (0–4 observations)

1. **Problem, terms, hand calculation — 4/4:** The validity predicate, set units, first-letter condition, duplicate-letter rule, and concrete hand examples are explicit.
2. **Causal derivation and saved work — 4/4:** Baseline cost, tempting wrong rule, bit-level `111₂ → 110₂ → 101₂` derivation, AND boundary, frequency invariant, and running-total consequence are all visible before the simulation.
3. **Maintained state and correctness — 4/4:** Exact-mask frequency invariant, submask transition, first-bit filter, endpoint and reset were checked against the executable Python and core trace.
4. **Interaction and visual meaning — 4/4:** Prediction/reveal, wrong-answer feedback, change-clears-feedback, keyboard Next, preset transfer, rewind/reset/endpoints, running history, and locale-preserved state were observed. Table columns distinguish submask, contribution, and running total.
5. **Transfer to Python and cost — 4/4:** Canonical Python executed on a fresh case; complexity matches implementation and metadata; displayed, copied, and downloaded source parity was checked.
6. **Bilingual and device access — 3/4:** English/Chinese algorithm meaning and controls agree, source fallback works, and 320/390/desktop renders are present; 200% narrow layouts require horizontal scrolling and are visually compressed.

Weighted total: `15·4/4 + 20·4/4 + 20·4/4 + 20·4/4 + 15·4/4 + 10·3/4 = 95/100`.

## Conclusion

**Outcome: accepted for this candidate under the frozen independent-review rubric.** The two prior required findings are closed against revision `f0f096104429617ac58328ef506361c3f6069013` with explicit browser regression evidence. No new required finding is open. This review does not claim publication or successful LeetCode submission.
