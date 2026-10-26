# Independent review: LeetCode 1163

- Candidate revision: `d964cf8c06221cda7a22bb0b3c38d15bce819049`
- Candidate URL: http://127.0.0.1:18770/leetcode/1163/
- Reviewer identity/model: unavailable in this run; this is an independent fresh-reader review.
- Report evidence: `specs/reviews/1163-evidence/1163-review-1-aa8ab095/`
- Outcome: **changes_required**

## Cold walkthrough (completed before source inspection)

I first read only `specs/leetcode-review-gates.md`, then opened the candidate in Chromium at desktop width. I did not read the brief, source, tests, or prior report before recording this walkthrough.

1. **01 · Name the target.** Question: what is compared among all substrings? Action: read the worked `abab` cards and the explanatory text. Observable result: the page lists `a, ab, aba, abab, b, ba, bab`, says to compare at the first differing character, and concludes `bab`; it then says every substring is a prefix of a suffix and gives the lowercase/non-empty and `1 ≤ |s| ≤ 4×10^5` contract. Causal paraphrase: because extending a suffix cannot make it lexicographically smaller, a maximum substring can be found among suffixes.
2. **02 · Baseline and trap.** Question: why not compare every start completely? Action: read the baseline snippet, cost claim, `azb` warning, and `aaaa` counterexample. Observable result: the page describes repeated equal-prefix work, claims `O(n²)` candidates and `O(n³)` worst-case character work, and warns that largest-first-character and disjoint-only rules fail. Causal paraphrase: exhaustive comparison is correct but repeats work, and the first character alone does not identify the winning whole suffix.
3. **03 · Two candidates, one survivor.** Question: after the first mismatch, which starts cannot win? Action: read the invariant/rule and inspect the preset simulation at its initial `abab` state. Observable result: it shows candidates `i=0,j=1,k=0`, a zero-comparison history, and says equality increments `k` while a mismatch jumps the smaller side and its certified prefix. Causal paraphrase: `k` records a proven equal prefix; the smaller mismatch side and starts covered by that proof can be discarded without revisiting them.
4. **04 · Predict before reveal.** Question: which start wins for the fresh exercise `cababa`? Prediction before reveal: I chose start `2` (`baba`). Action: selected that radio option and clicked **Reveal and explain**. Observable result: feedback says “Not quite”; starts 1 and 2 begin with `a` and `b`, both smaller than `c` at start 0, so start 0 wins. Causal paraphrase: the invariant settles this case immediately at the first character and discarded starts need no revisit.
5. **03 simulation interaction.** Question: does the visible trace preserve the candidate/history state? Action: selected preset `cababa`, advanced four times, then used Reset and Jump to end. Observable result: progress changed `0/5` → `1/5` → `2/5` → `3/5` → `4/5`, with `j` moving 1→2→3→4→5 and each history row retained; Reset returned to `0/5`; Jump to end produced `5/5` and `j=6`. Causal paraphrase: each control changes the same trace frame and history remains available for replay.
6. **05 · Map to official Python.** Question: how do keep/discard steps map to the official interface? Action: read the mapping, complexity, and boundary text. Observable result: it names `Solution.lastSubstring(self, s: str) -> str`, maps state to `i,j,k`, gives `s[min(i,j):]`, claims `O(n)` time and `O(1)` auxiliary space, and lists one-character/all-equal/equal-first-character boundaries. Causal paraphrase: the executable solution maintains only the two candidate starts and known prefix length, advancing candidates monotonically.

The exercise input is preset-only; the `cababa` prediction is therefore a UI check. Independently chosen `baaaab` and other fresh cases were checked against the actual Python callable below, separately from the UI trace.

## Source, contract, and independent checks

The official statement was read normally from [LeetCode](https://leetcode.com/problems/last-substring-in-lexicographical-order/): return the lexicographically last substring; examples `abab → bab` and `leetcode → tcode`; length 1..400,000; lowercase letters. The candidate uses the faithful preferred Python interface and no non-Python submission or conceptual substitute is advertised, so a non-Python `language-contract.json` audit is not applicable. `lesson-entry.json` has the required single complexity string `O(n) time; O(1) auxiliary space`.

`python3 -B scripts/register_leetcode_lesson.py 1163 --validate-only` completed with `EXIT:0`.

I independently executed `solution.py` on `a`, `abab`, `leetcode`, `aaaa`, `azb`, `cababa`, and `baaaab`, plus every string over `abc` of lengths 1–7, against an independent suffix/substr oracle; all passed. I also executed `core.js` in Node and exhaustively compared its trace answer with an independent substring oracle for the same domain; all passed. The canonical Python source, decoded `python-code.js` mirror, displayed `#pythonCode` text, successful clipboard text, and downloaded `solution.py` were byte-identical (507 bytes); evidence is in the review evidence directory.

The render-state checks covered preset switching, forward stepping, rewind/reset, terminal state, prediction-before-reveal, locale EN→ZH→EN, keyboard Enter on **Next**, 320/390/1280 viewports, and a 200% zoom stress check. The device receipt is `device-checks.json`; screenshots include `cold-desktop.png`, `normal320.png`, and `zoom320.png`.

## Findings

### 1163-R1-BASELINE-01 — open, required teaching defect

- **Revision/locale/state:** `d964cf8c06221cda7a22bb0b3c38d15bce819049`; EN and ZH; step 02 at the initial page state.
- **Reproduction:** open the baseline code block and read the rendered text.
- **Expected:** a hand-readable Python baseline with line breaks that a basic Python reader can follow.
- **Actual:** the code block visibly contains literal `\\n` characters (`best = ""\\nfor start ...`) instead of line breaks. This makes the baseline hard to execute or map line-by-line while it is the only concrete baseline implementation shown.
- **Violated requirement/severity:** detailed causal derivation and transfer-to-code must be independently reconstructable for the target reader; required teaching fix (medium).
- **Owner/next action:** replace the literal escapes with actual code newlines in a new candidate, then rerun the affected cold/source/parity checks. Status: **open**.

### 1163-R1-DEVICE-01 — open, required responsive/zoom defect

- **Revision/locale/state:** `d964cf8c06221cda7a22bb0b3c38d15bce819049`; EN, preset `cababa`; 320px and 390px viewports at 200% CSS zoom.
- **Reproduction:** open at 320px or 390px, set browser/page zoom to 200%, and inspect the closed native preset selector.
- **Expected:** controls and selected labels remain readable and reachable at required narrow widths and 200% zoom.
- **Actual:** `documentElement.scrollWidth` was 583px versus client widths 320px/390px; the closed `#preset` measured about 521px wide at the 320px stress case and extends beyond the viewport. `zoom320.png` records the resulting narrow, overflowing layout. The long selected label is not locally constrained to the viewport.
- **Violated requirement/severity:** bilingual/device dimension and rendered-state contract sections 2 and 8 require readable controls/selected labels under narrow/zoom checks; required responsive fix (medium).
- **Owner/next action:** reflow or constrain the selector/adjacent layout while preserving the complete localized scenario meaning, then rerun 320/390/desktop, both locales, and 200% checks. Status: **open**.

A minor translation polish remains advisable: the hardcoded step-01 hint contains English and Chinese in the Chinese view, although the algorithm explanation itself is equivalent. It is not counted as a separate required finding because the meaning remains recoverable.

## Scores (0–4; weights 15,20,20,20,15,10)

1. Problem, terms, hand calculation: **3/4** — `abab` is fully enumerated and manually resolved; units, non-empty result, and bound are clear.
2. Causal derivation and saved work: **3/4** — baseline cost, repeated-prefix reason, invariant, and counterexamples are present, but the literal-escape baseline block creates a required reconstructability gap.
3. Maintained state and correctness: **4/4** — invariant and jump rule agree with the Python implementation; exhaustive independent Python/core checks and boundary cases passed.
4. Interaction and visual meaning: **3/4** — prediction feedback, history, next/previous, reset/endpoints, and state preservation work; the trace is explicitly labeled as a simulation.
5. Python transfer and cost: **3/4** — faithful callable, exact source parity, actual Python execution, and `O(n)`/`O(1)` claim checked; baseline presentation weakens transfer.
6. Bilingual and device access: **2/4** — EN/ZH semantic paths, keyboard activation, and normal widths worked, but the 200% narrow-width selector overflow is a required defect.

Weighted total: **72.5/100**. Acceptance is unavailable because the total is below 85, dimension 6 is below 3, and two required findings remain open.

## Limitations

This review does not claim measured novice comprehension, a successful LeetCode submission, or production deployment. Official editor selector details beyond the public statement were not needed because the preferred faithful Python interface is present; no non-Python contract was advertised. The 200% check is a browser CSS-zoom stress check, with screenshots and DOM measurements saved; it is not a native-device claim.

## Conclusion

**Changes required.** Keep this report and evidence attached to revision `d964cf8c06221cda7a22bb0b3c38d15bce819049`; a new candidate and fresh review are required after both open findings are addressed.
