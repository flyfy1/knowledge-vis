# Independent review: LeetCode 1163

- Candidate revision: `d614c16583779277970da9a3fc17ad3e38ce4905`
- Candidate URL: http://127.0.0.1:18770/leetcode/1163/
- Reviewer identity/model: unavailable; independent fresh-reader run
- Frozen rubric: `specs/leetcode-review-gates.md`
- Evidence directory: `specs/reviews/1163-evidence/1163-review-3-d97faea9/`
- Outcome: **accepted**

## Cold walkthrough (recorded before source, tests, or earlier reviews)

I read only the frozen rubric, then opened the candidate in Chromium at 1280×900. The screenshots `cold-desktop.png`, `step2.png`, `step3.png`, and `step4.png` record the initial page and trace progression. The candidate initially showed English, all five lesson steps, and preset `abab` at `0/3` comparisons.

1. **01 · Name the target.** Question: “What exactly is compared among all substrings?” Action: read the hand-worked `abab` cards and explanation. Observable result: the page enumerates `a, ab, aba, abab, b, ba, bab`, identifies the first differing character, and concludes `bab`; it then states that every substring is a prefix of a suffix and gives the lowercase, non-empty result contract and `1 ≤ |s| ≤ 4×10⁵`. Causal conclusion: extending a suffix cannot make it lexicographically smaller than its prefix, so a maximum substring is represented by a suffix and comparison is decided at the first mismatch.
2. **02 · Baseline and trap.** Question: “Why not compare every start completely?” Action: read the nested-loop baseline, cost paragraph, `azb` warning, and `aaaa` counterexample. Observable result: the code is visibly line-broken Python; the text explains repeated equal-prefix reads, `O(n²)` candidates and `O(n³)` worst-case character work, and says that largest-first-character and disjoint-only rules fail. Causal conclusion: exhaustive comparison is correct but repeats work; the first character alone is not enough, and valid substrings may overlap.
3. **03 · Two candidates, one survivor.** Question: “After the first mismatch, which starts can no longer win?” Action: read the invariant/rule, then clicked `Next →` three times on `abab`. Observable result: the trace changed `0/3` → `1/3` → `2/3` → `3/3`; frame 1 showed `s[0]=a` versus `s[1]=b` and discarded `i…i+k`, frame 3 showed equality and `k=1`, and the history retained all prior frames. Causal conclusion: `k` is the certified equal-prefix length; at a mismatch the lower-character side and its covered prefix are proved unable to win, so the candidate jumps without rescanning.
4. **04 · Predict before reveal.** Question: “Which start wins for fresh `cababa`?” Prediction before reveal: I selected start `2` (`baba`), deliberately testing the rule rather than recalling the answer. Action: selected the preset, selected radio option 2, and clicked `Reveal and explain`. Observable result: feedback said “Not quite” and explained that starts 1 and 2 begin with `a` and `b`, both below start 0's `c`. Causal conclusion: the first character settles this fresh case and the invariant justifies discarding the smaller sides. (The UI is preset-only; independently chosen custom inputs are therefore code checks below.)
5. **05 · Map to official Python.** Question: “How do the keep/discard steps map to the official interface?” Action: read the signature, mapping paragraph, cost/boundary notes, and source controls. Observable result: it names `Solution.lastSubstring(self, s: str) -> str`, maps the state to `i,j,k`, returns `s[min(i,j):]`, claims `O(n)` time and `O(1)` auxiliary space, and explicitly labels the browser trace as a simulation separate from Python execution. Causal conclusion: the visible state is a faithful explanation of the canonical two-pointer callable, with monotone candidate advancement and constant maintained state.

## Post-cold source, contract, and independent checks

The official LeetCode page was read normally at the supplied URL (examples `abab → bab`, `leetcode → tcode`, lowercase input, length 1–400,000). The preferred faithful Python interface is present. `lesson-entry.json` uses exactly one nonempty complexity string, `O(n) time; O(1) auxiliary space`; no non-Python contract is advertised.

The required preflight command was run from the repository root:

```text
python3 -B scripts/register_leetcode_lesson.py 1163 --validate-only
exit 0
```

I executed the canonical `solution.py` on fresh `bac` (prediction `c`, observed `c`) and on `aaaa`, `azb`, and one-character `a`, against an independent brute-force substring oracle. I also checked the browser core independently in Node for `bac`, `aaaa`, `azb`, and `cababa`; every returned answer matched the oracle. The saved `test_core.py` and `oracle_check.py` outputs pass (`oracle_check` covers 3,584 cases and source parity).

Displayed `#pythonCode`, `python-code.js`, the copy textarea, and `solution.py` were compared exactly, including the final newline. A forced clipboard failure selected the full readonly fallback textarea and showed the localized fallback status; `copy-fallback.png` records this state. Keyboard Enter advanced Next and Reset restored the initial frame. Preset switching reset the trace; Previous, Jump to end, and Reset preserved/replayed history as expected.

I checked EN→ZH→EN and state preservation at terminal `aaaa`; the numeric state remained `3/3`, `i=0,j=1,k=3` while localized text changed. At 320, 390, and 1280 CSS-pixel widths, `scrollWidth` equaled `clientWidth`; the closed preset labels fit. At 200% CSS zoom the page remained within the viewport (`scrollWidth == clientWidth`), and `layout-zoom200.png` shows readable reflow. Disabled Previous at the initial frame had a distinct computed opacity (`0.4`) while retaining legible text. The Chinese explanation follows the same algorithm and controls; the step-01 hardcoded hint mixes a short English phrase with Chinese but does not change the algorithm meaning.

## Earlier finding closure

Earlier report `1163-review-2-2f35cb6b.md` left `1163-R1-DEVICE-01` open for 200% narrow-width overflow. On this candidate, the unchanged responsive checks at 320/390/1280 and 200% report no horizontal overflow, and the captured `layout-320.png`, `layout-390.png`, and `layout-zoom200.png` show the constrained selector, navigation, and code blocks. I close that finding against this candidate. The earlier baseline literal-escape finding was already fixed and remains readable here.

## Scores (0–4; weights 15, 20, 20, 20, 15, 10)

1. **Problem, terms, hand calculation: 4/4.** The `abab` enumeration, units, requested non-empty substring, suffix reduction, and official bound are explicit.
2. **Causal derivation and saved work: 4/4.** A concrete baseline precedes the invariant; repeated work, both tempting wrong rules, and the mismatch/equality bridge are explained in both locales.
3. **Maintained state and correctness: 4/4.** `i,j,k`, crossing guards, boundaries, termination, and displayed history agree with the executable Python and independent oracle checks.
4. **Interaction and visual meaning: 4/4.** Prediction precedes reveal, the visible comparison state changes coherently, history is retained, rewind/reset/endpoints work, and simulation is distinguished from canonical execution.
5. **Python transfer and cost: 4/4.** The official callable executes on fresh and boundary cases; source, embedded, displayed, copied, and downloaded representations are exact; `O(n)`/`O(1)` matches the implementation.
6. **Bilingual and device access: 3/4.** EN/ZH reasoning and state-preserving locale switching work, keyboard and disabled controls are usable, and 320/390/desktop plus 200% zoom remain readable. The mixed-language step-01 hint is minor polish friction.

Weighted score: **97.5/100**. No required finding remains open; every dimension is at least 3, and the required evidence is present.

## Limitations

This review does not claim measured novice comprehension, a successful LeetCode submission, native-device behavior beyond the browser viewport/zoom checks, or deployment/public-delivery verification. Reviewer identity/model is unavailable. The `cababa` exercise is preset-only, so custom-input claims are based on the independently executed canonical Python/core checks rather than a UI custom-input experiment.

## Conclusion

**Accepted independently for revision `d614c16583779277970da9a3fc17ad3e38ce4905`.**
