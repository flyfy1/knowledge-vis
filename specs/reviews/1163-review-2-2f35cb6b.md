# Independent review — LeetCode 1163

- Candidate revision: `5cc8e5db1cbdc283ff1bccd1b3481dba4dac6c5`
- Reviewer identity/run: unavailable (independent fresh run)
- Candidate URL: http://127.0.0.1:18770/leetcode/1163/
- Frozen rubric: `specs/leetcode-review-gates.md`

## Cold walkthrough (source/tests not opened)

I first read only the frozen rubric, then opened the candidate in a real Chromium browser at 1280×900. The initial page rendered all five teaching steps, English selected, and the `abab` trace at `0/3` comparisons. I saved `cold-desktop.png` and, after the walkthrough, `cold-zh.png` in the exclusive evidence directory.

### Step 01 — Name the target
- **Question:** “What exactly is compared among all substrings?”
- **Action:** Read the worked `abab` listing and the displayed suffix/substring cards.
- **Observable result:** The page lists `a, ab, aba, abab, b, ba, bab`, states that a substring is a prefix of a suffix, and says `bab` wins because its first character is `b`.
- **Causal paraphrase:** Since extending a suffix cannot make it smaller than its prefix, the maximum substring is represented by a suffix; lexicographic comparison is decided at the first differing character.

### Step 02 — Baseline and trap
- **Question:** “Why not compare every start completely?”
- **Action:** Read the baseline nested-loop code and the two explicit counterexamples.
- **Observable result:** It states `O(n²)` substrings and possible `O(n³)` character work, explains repeated equal-prefix reads in `aaaa…a`, and shows `azb → zb` and the overlap counterexample `aaaa → aaa`.
- **Causal paraphrase:** Exhaustive slicing is correct but repeats work; the largest first character alone is insufficient, and candidate substrings may overlap.

### Step 03 — Two candidates, one survivor
- **Question:** “After the first mismatch, which starts can no longer win?”
- **Action/prediction:** Before advancing, I predicted that comparing `abab` starts `0` and `1` would discard start 0 because `a < b`. I clicked `Next →` twice.
- **Observable result:** Frame 1 became `1/3`, candidates `i=2,j=1,k=0`, with visible text “Compare s[0]=a with s[1]=b: Left is smaller; discard i…i+k.” Frame 2 became `2/3`, `i=3,j=1,k=0`; the history retained frames #0, #1, and #2. The page explains equality increments `k`, mismatch jumps by `k+1`, and displays the invariant.
- **Causal paraphrase:** The lower-character side and the equal-prefix starts before the mismatch cannot beat the witness with the larger character, so the jump preserves the surviving candidate and avoids rescanning.

### Step 04 — Predict before reveal
- **Question:** “Which start wins for `cababa`?”
- **Action/prediction:** I independently predicted start `0`, because the first character `c` exceeds the other suffix starts’ first characters (`a` and `b`), before attempting the reveal control.
- **Observable result:** The page presents exactly the three selectable candidates `0: cababa`, `1: ababa`, `2: baba` and a `Reveal and explain` control. In this cold pass the preset trace remained visible and the scripted reveal click did not produce a new observable text state, so reveal completion is unverified.
- **Causal paraphrase:** The fresh exercise asks transfer of the first-mismatch rule to a new input; the predicted winner is justified by its leading character, while the reveal path needs a code audit/recheck.

### Step 05 — Map to official Python
- **Question:** “How do the keep/discard steps map to the official interface?”
- **Action:** Read the displayed signature, cost claim, boundaries, and source controls.
- **Observable result:** It shows `Solution.lastSubstring(self, s: str) -> str`, claims `O(n)` time and `O(1)` auxiliary space, describes `i,j,k` and final `s[min(i,j):]`, and labels the browser trace as a simulation separate from Python execution. Controls include Copy Python, Download solution.py, and Show official Python source.
- **Causal paraphrase:** The visual state is intended as a direct representation of the canonical two-pointer implementation; the stated cost relies on monotonic candidate advancement and bounded state.

### Cold interaction observations
- `Next →` changed the comparison count, candidates, visible compared suffixes, and appended history while retaining earlier frames.
- `Reset`/preset switching, bilingual controls, keyboard/device/layout and reveal completion were not yet established in the cold pass and require the post-cold audit.
- The page’s visible English content includes one inline Chinese phrase (“bab 胜在首字符 b”), indicating bilingual material is present but translation equivalence still requires audit.

## Post-cold audit

(To be filled only after the cold walkthrough.)

The official statement was read at the supplied LeetCode URL. It confirms the requested last lexicographical substring, `abab → bab`, `leetcode → tcode`, lowercase-only input, and `1 ≤ length ≤ 4×10^5`.

### Canonical source and executable checks

`lesson-entry.json` uses the preferred faithful Python interface and has the required single complexity string `O(n) time; O(1) auxiliary space`; no non-Python language contract is advertised, so a non-Python contract audit is not applicable. `solution.py` was executed directly. I checked every string over `abc` of lengths 1–7 against an independent suffix oracle, plus `a`, `abab`, `leetcode`, `aaaa`, `azb`, `cababa`, `baaaab`, and `zzzaaz`; all passed. I also evaluated the browser core trace in Node with a `window` stub and exhaustively compared its returned answer against an independent substring oracle for the same finite domain; all passed.

The displayed source was expanded and compared byte-for-byte with `solution.py` (507 bytes); `python-code.js` contains the same source string. The browser copy action reported `Full source copied.` and the source is the canonical callable. The page explicitly labels the trace as a simulation rather than Python execution. `python3 -B scripts/register_leetcode_lesson.py 1163 --validate-only` exited 0.

### Independent browser/state/device checks

At 320, 390, and 1280 CSS-pixel viewports I switched to preset `cababa`, used Jump to end, Reset, Next, Previous, selected answer 0, and revealed. The trace reached `5/5 comparisons; candidates i=0, j=6, k=0`, Reset returned `0/5 comparisons; candidates i=0, j=1, k=0`, history remained present, and the reveal feedback correctly explained start 0. Keyboard focus on Next followed by Enter advanced `abab` to `1/3`. EN→ZH→EN preserved the page and the Chinese quiz path rendered. Screenshots are in the exclusive evidence directory, including `zoom320.png`.

At ordinary 320/390 widths there was no horizontal overflow (`scrollWidth == clientWidth`). Under the required 200% CSS-zoom stress at 320px, however, `scrollWidth` became 454px; the language toggle’s right button extended to x≈351 (>320), the step-nav links formed a wide horizontal strip, and source code boxes extended to x≈375. The preset itself remained within the viewport, but the header controls and navigation are clipped/require horizontal travel at the required zoom. This is a reproducible device/access defect.

## Findings and closure

### 1163-R1-BASELINE-01 — closed on this candidate

The earlier revision’s baseline literal-escape defect is resolved in this candidate: the rendered baseline block shows real line breaks (`best = ""`, `for start ...`, `for end ...`) and is readable as Python. No regression was observed.

### 1163-R1-DEVICE-01 — open, required

- **Revision/locale/state:** `5cc8e5db1cbdc283ff1bccd1b3481dba4dac6c5`; EN and ZH; 320px viewport; 200% page zoom; initial page and step navigation visible.
- **Reproduction:** open the lesson at 320px, set page zoom to 200%, and inspect the header language toggle, horizontal step navigation, and source/code blocks.
- **Expected:** all essential controls, navigation, and displayed code remain readable and reachable at 320/390px and 200% zoom.
- **Actual:** `documentElement.scrollWidth` is 454px while client width is 320px; the language-toggle group reaches x≈353 and its EN button reaches x≈351, step-nav links extend far beyond the viewport, and code blocks reach x≈375. The page requires horizontal travel and clips essential header/navigation content at the required stress condition.
- **Violated requirement/severity:** frozen rubric dimension 6 and rendered-state contract narrow-width/200%-zoom access requirement; required medium responsive fix.
- **Owner/next action:** reflow or constrain header/navigation/code at 200% zoom while preserving bilingual meaning, then run a new candidate and fresh review. Status: **open**.

## Scores (0–4; weights 15,20,20,20,15,10)

1. **Problem, terms, hand calculation: 4/4.** `abab` is enumerated and manually resolved; substring, suffix, lexicographic comparison, output, units, and official bounds are visible.
2. **Causal derivation and saved work: 4/4.** The baseline code is readable, its repeated-prefix cost is explained, `azb` and `aaaa` expose tempting wrong rules, and the invariant-to-jump bridge is stated in both languages.
3. **Maintained state and correctness: 4/4.** `i,j,k`, equality, mismatch jumps, crossing guard, boundaries, and termination match the executable Python and independently checked core trace.
4. **Interaction and visual meaning: 4/4.** Prediction precedes reveal, state transitions and retained history are observable, preset/reset/endpoints and rewind work, and the page distinguishes simulation from canonical execution.
5. **Python transfer and cost: 4/4.** Faithful official Python interface, direct runtime checks including fresh cases, exact displayed/source parity, copy evidence, and the claimed O(n)/O(1) cost are supported.
6. **Bilingual and device access: 2/4.** EN/ZH semantic paths and normal 320/390/desktop controls work, but required 200% zoom at 320px reproducibly overflows/clips header/navigation/code.

Weighted score: **85/100**. Acceptance is unavailable because required finding `1163-R1-DEVICE-01` remains open and dimension 6 is below 3.

## Limitations

This review does not claim measured novice comprehension, a successful LeetCode submission, native-device behavior beyond browser viewport/zoom checks, or production deployment. Reviewer identity/model is unavailable. The exercise is preset-only; the `cababa` prediction is therefore a UI check, while independent fresh strings were checked by executing the actual Python callable.

## Conclusion

**Changes required.** The algorithm, teaching sequence, Python contract, and normal-width interactions are independently clear, but the candidate cannot pass the frozen gate until the open 200%-zoom responsive finding is fixed in a new revision and reviewed afresh.
