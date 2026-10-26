# Independent review — LeetCode 1178

- Candidate revision: `3574936bfc5cfdfab37230511e441a721d7428df`
- Candidate URL: http://127.0.0.1:18770/leetcode/1178/
- Reviewer identity/run: unavailable (independent fresh browser run)
- Target reader: basic Python, lists, loops, functions, elementary recursion
- Frozen rubric: `specs/leetcode-review-gates.md`

## Cold walkthrough (recorded before source/test inspection)

I opened the candidate in a real Playwright Chromium browser at 1280×900 before reading any brief, source, tests, author notes, or prior review. The page loaded as a static bilingual lesson with five linked teaching steps and a submask simulation.

1. **Question:** When is a word valid? **Action:** Read step 1 and its worked examples (`puzzle=aboveyz`, `aaaa`, `actor`, and `abslute`). **Observable result:** The page states that the distinct-letter set must be a subset of the puzzle and must contain the first puzzle letter; repeated letters count once; it gives `[1,1,3,2,4,0]` and names `aaaa`, `asas`, `able` for `abslute`. **Causal paraphrase:** Validity is a set-inclusion test plus the required-first-letter condition, so repeated characters do not add constraints.

2. **Question:** Why does pairwise checking repeat work? **Action:** Read step 2 and its tempting shortcut/counterexample. **Observable result:** The baseline checks every word against every puzzle and costs about `O(WP·L)`; “count words containing the first letter only” is rejected using a word with an outside letter. **Causal paraphrase:** The first-letter test alone is insufficient because all distinct word letters must stay inside the puzzle.

3. **Question:** How can only allowed letter sets be enumerated? **Action:** Read the invariant and code line, then use teaching data `aboveyz`; clicked `Next` twice. **Observable result:** Each click advanced the displayed row from `1/127` to `2/127` to `3/127`, showing `aboveyz`, `boveyz`, then `aoveyz`, each contribution `0` and running total `0`. **Causal paraphrase:** `(sub-1)&puzzleMask` walks submasks while `freq[sub]` contributes only when the first-bit test passes.

4. **Question:** What does completion look like and is state resettable? **Action:** Clicked `Jump to end`, then `Reset`. **Observable result:** End showed `127/127`, current answer `1`, with the final `a` row contributing `1`; reset returned to `1/127` and answer `0`. **Causal paraphrase:** The finite seven-bit enumeration terminates after all nonempty submasks and preserves a running total; reset restores the initial trace.

5. **Question:** Can I transfer the invariant to a fresh selection? **Action:** Opened step 4, selected radio value `2`, clicked `Reveal answer`, then changed selection to `3`. **Prediction before reveal:** I predicted the displayed official-data answer should be `1`, because only the `a` submask has a matching word and contains the first letter. **Observable result:** Reveal said “Correct answer is 1. Reason: only submasks containing the first letter contribute.” Changing the radio after reveal produced no new feedback. **Independent check:** I computed the provided words for `aboveyz`: only `aaaa` has mask `{a}`, so answer `1`; this agrees with the reveal. This is a preset/code check because the UI has no custom-input editor.

6. **Question:** Does language switching preserve the lesson? **Action:** Clicked `中`, captured the page, then returned to `EN`. **Observable result:** Chinese text translated headings, explanations, controls, and cost text; the invariant and interaction remained present. Some formula/example fragments stayed in English/Latin notation (for example `a ⊆ aboveyz and contains the required first letter a.`). **Causal paraphrase:** Core bilingual structure is present, but translation parity needs source-level checking for semantic completeness.

7. **Question:** Does the simulation visually expose data versus highlighting? **Action:** Inspected the table and running-trace text at initial, intermediate, and end states. **Observable result:** Submask, contribution, running columns and numbered trace are text-visible; there is no obvious separate highlighted code/data linkage in the cold view. **Causal paraphrase:** The simulation communicates changing values through rows and totals, while the exact mapping to executable code is deferred to step 5.

Cold screenshots saved in `specs/reviews/1178-evidence/1178-review-1-da08b69b/`: `cold-desktop.png`, `cold-step3-initial.png`, `cold-step3-next1.png`, `cold-step3-next2.png`, `cold-step3-end.png`, `cold-step3-reset.png`, `cold-step4-reveal2.png`, `cold-step4-change3.png`, and `cold-zh.png`.


## Source, contract, and independent checks after the cold walk

- `lesson-entry.json` uses the required single nonempty complexity string: `O(W·L + P·2^7) time; O(W) space`.
- `language-contract.json` is absent. The entry declares Python and the canonical `solution.py` is a faithful LeetCode `Solution.findNumOfValidWords(self, words, puzzles) -> list[int]` interface, so no non-Python contract is required; supported-language omission is not applicable.
- `python-code.js` decodes byte-for-byte to `solution.py`; rendered `textContent`, copied source payload, and `solution.py` all measured 743 bytes in the browser check. The `solution.py` download target exists. I executed the canonical Python on an independently chosen case (`words=['ab','ac','bc','aaa','z']`, puzzles `['abcdeff','bacdefg','zabcdef']`), predicted `[3,2,1]`, and observed `[3,2,1]`.
- The core trace independently computes masks, frequencies, all nonempty submasks, first-bit filtering, running totals, reset, and endpoint. The third preset hand-checks to 3; the UI reveal agrees. The randomized 300-case brute-force test and fixed official examples pass.
- `python3 -B scripts/register_leetcode_lesson.py 1178 --validate-only` was run from the repository root and exited 0 (no output). `python3 leetcode/1178/tests/test_solution.py` passed (`1178 solution/oracle/source parity: PASS`). The supplied Playwright browser test passed at 320, 390, and 1280 widths.
- Keyboard activation of a nav link and `Next` advanced the trace to `2/127`. Copy fallback was forced to reject: the manual textarea appeared with all 743 source bytes; restoring success reported `Copied` and hid fallback. Locale switching after a revealed answer preserved the answer and translated feedback.
- At 320, 390, and 1280 CSS-zoom-2 captures, disabled controls had readable text and visibly reduced opacity. The 320/390 zoom-2 document scroll widths were 911px, so the page requires horizontal scrolling under this stress setting; the saved captures show the narrow single-column content remains present. Screenshots are in `specs/reviews/1178-evidence/1178-review-1-da08b69b/` (`width-320-zoom2.png`, `width-390-zoom2.png`, `width-1280-zoom2.png`).
- The official LeetCode URL was opened with `curl`; Cloudflare returned a challenge page in this environment, so I could not inspect the live statement beyond the provided metadata/lesson examples. No LeetCode submission or human-comprehension claim is made.

## Findings

### 1178-R1-BILINGUAL-001 — required, open

- **Scope:** revision `3574936bfc5cfdfab37230511e441a721d7428df`, Chinese locale, step 2 “基线与陷阱”, preset text/counterexample.
- **Reproduction:** Open the candidate, click `中`, read the “错误捷径” paragraph.
- **Expected:** The Chinese counterexample must preserve the English/algorithm meaning: `bxx` is inside `abxyqrs` and therefore is a valid example when the first letter is `b`; a different word such as `bzz` is the rejected outside-letter case.
- **Observed:** Chinese says `bxx` contains the first letter and “它仍含 x，必须拒绝” (“it still contains x, [so] it must be rejected”), while `x` is explicitly inside `abxyqrs`. English correctly says `bxx` “also fits” and uses `bzz` as the failure. This teaches the opposite result for a central counterexample.
- **Violated requirement:** Frozen rubric bilingual dimension; materially equivalent reasoning in both languages; mathematically contradictory explanation is a required fix regardless of passing tests.
- **Severity/owner:** High; lesson author must correct the Chinese counterexample and add a bilingual regression assertion. Closure requires a new candidate and fresh review of the affected path.

### 1178-R1-DEPTH-002 — required, open

- **Scope:** revision `3574936bfc5cfdfab37230511e441a721d7428df`, step 3 submask derivation/simulation, both locales.
- **Reproduction:** Read step 3 from the cold start, then click `Next` through the first rows.
- **Expected:** A basic-Python reader should see a small concrete mask/submask hand-worked transition that explains why `(sub - 1) & puzzleMask` enumerates exactly the allowed sets, why the first-bit test includes/excludes a row, and how the running total changes. The rubric requires a vivid worked example before abstraction and a causal bridge for maintained state.
- **Observed:** The page gives the formula, an invariant sentence, and rows `aboveyz`, `boveyz`, `aoveyz` all contributing zero; the only nonzero row appears at the final `a`. It never decodes a bit position, shows a concrete subtraction-and-AND transition, or hand-checks an included word mask against a rejected outside-letter mask. The reader must supply the central causal bridge from the compact formula to the trace.
- **Violated requirement:** Frozen rubric causal derivation/maintained-state depth (“vivid hand-worked tiny example precedes abstraction”, “every optimization bridge”, and unexplained state transition remains a required fix).
- **Severity/owner:** Medium-high; lesson author must add a tiny explicit mask transition and contribution explanation before/alongside the simulation. Closure requires a new candidate and fresh review.

## Scores (0–4 observations)

1. **Problem, terms, hand calculation — 3/4:** Validity rule, units, repeated-letter treatment, and named hand examples are visible; one complete output is cited rather than fully tabulated.
2. **Causal derivation and saved work — 2/4:** Baseline cost and wrong shortcut are stated, but the key submask enumeration bridge is largely asserted and the trace has no concrete bit-level worked transition.
3. **Maintained state and correctness — 3/4:** `freq` invariant, first-bit filter, running total, endpoint, reset, and canonical-code behavior agree; boundaries are mostly reconstructable.
4. **Interaction and visual meaning — 3/4:** Predict/reveal, preset selection, step/rewind/end/reset, keyboard activation, and state-preserving locale switch work; the table communicates values, though there is no explicit current-row/highlight distinction.
5. **Transfer to Python and cost — 4/4:** Official Python interface is executable, independently checked, exact source mirrors are present, and stated `O(W·L + P·2^7)`/`O(W)` cost matches the implementation and constraints.
6. **Bilingual and device access — 2/4:** Controls and major structure are readable across locales and widths, but the Chinese counterexample reverses correctness; 200% narrow stress also introduces horizontal scrolling (captured and documented).

Weighted total: `15·3/4 + 20·2/4 + 20·3/4 + 20·3/4 + 15·4/4 + 10·2/4 = 67.5/100`.

## Conclusion

**Outcome: changes_required.** The candidate is not eligible for independent acceptance because required findings `1178-R1-BILINGUAL-001` and `1178-R1-DEPTH-002` remain open, and the score is below 85 with dimensions 2 and 6 below 3. Re-review the corrected candidate with a fresh cold walkthrough; preserve this report and evidence as the original finding record.
