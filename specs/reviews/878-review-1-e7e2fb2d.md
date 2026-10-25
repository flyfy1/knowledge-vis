# Independent review: 878 — Nth Magical Number

Candidate: `6edbe661e03cd4d7a07f979a3f2269d54e5ac4a0`. URL: http://127.0.0.1:18770/leetcode/878/. Target: basic Python, lists, loops, functions, elementary recursion. Reviewer: independent review run; exact model identity unavailable. Frozen six weights: 15/20/20/20/15/10. General Python-first interpretation applies.

## Cold browser walkthrough (saved before source audit)

Read only the frozen rubric before opening the candidate in real Playwright Chromium (1280×900). No brief, implementation, test output, prior review, or author evidence was read. This section records the cold observations; later audit is separate.

1. **Question:** what is magical and what is requested? **Action:** read step 1 and its numbered tiles and baseline. **Observed:** 1 and 5 say Skip; 2,3,4,6 have ranks 1–4; 6 says both/count once. Inputs and official bounds, positive ranks, modulo output and examples are explicit. **Conclusion:** membership is an OR, not two separate contributions to rank. Hand calculation gives rank 4 = 6. The baseline scans each integer once, costing up to U=n·min(a,b); the huge equal-divisor example explains why scanning is infeasible.
2. **Question:** how does a prefix count save scanning work? **Action:** moved inclusive limit to 5,6,7. **Observed:** readouts respectively 2+1−0=3, 3+2−1=4, 3+2−1=4; tile 6 carries the overlap label and tile 7 says Skip. **Conclusion:** integer quotients count entire lists; subtract their intersection once. The text defines gcd, lcm and inclusion–exclusion and gives a shared-factor counterexample to using a*b.
3. **Question:** which interval update preserves the answer? **Action:** operated all three next tests, then Undo. **Observed:** [1,8] tests 4/count3 → [5,8]; tests 6/count4 → [5,6]; tests 5/count3 → [6,6], remainder6. Each frame distinguishes before/current interval; history retains earlier decisions. Undo restores the second completed test and its history. **Conclusion:** count below n excludes every smaller candidate; sufficient count keeps mid, because it may be the first sufficient value. The answer remains inside the closed interval, which shrinks until a singleton.
4. **Question:** does equality permit immediate return? **Action:** chose Return 16, checked, then changed to keep [12,16] and checked. **Observed:** feedback supplies sequence 3,5,6,9,10,12,15, identifies 16 as divisible by neither divisor and explains both wrong choices. Changing a radio clears stale feedback. **Conclusion:** count equality can lie on a plateau; the first sufficient point is required. This is a new numerical exercise applying the preceding invariant.
5. **Question:** how do interval operations become Python? **Action:** opened the official-interface code disclosure and read step 5. **Observed:** Solution.nthMagicalNumber uses gcd/lcm, lo/hi, floor midpoint, the three quotient count, lo=mid+1 or hi=mid, then final modulo. For the visible [5,8], mid6/count4 transition, the else branch changes hi from8 to6 while lo remains5. The text explains //, %, gcd's remainder process, read-only inputs, integer-operation cost and separate browser snapshot storage. Three input-looking labels in this section have no visible control effect in this walkthrough; investigate after cold walk. **Conclusion:** the search update maps directly to executable Python; modulo belongs after finding the true value.

Language action: after one next test switched to Chinese; the same [1,8] → [5,8] state and history persisted. Chinese explanations preserve the duplicate correction, interval invariant, plateau warning and cost distinctions.

### Independent predictions, before their code reveal

The UI has presets only, so the following fresh custom input is explicitly a **code check**, not a UI experiment. For (n,a,b)=(8,4,7), I predict sequence 4,7,8,12,14,16,20,21, hence answer21. L=28; C(20)=7 and C(21)=8. For a separate tempting-rule counterexample, (n,a,b)=(3,3,6) should yield9; at x=6, naive addition gives 2+1=3, but distinct count is2. Using a*b=18 instead of lcm6 also wrongly returns3 at x6. These predictions are saved here before source/runtime checking. The built-in n7/a3/b5 exercise above was operated as a wrong-answer feedback probe, not claimed as this independent fresh prediction.

Cold screenshots: `878-evidence/878-review-1-e7e2fb2d/cold-initial.png`, `cold-operated.png`, `cold-zh.png`. Screenshot inspection and source/runtime/access audit follow below. No human comprehension measurement or LeetCode submission is claimed.

## Candidate identity and post-cold source audit

`git rev-parse HEAD` returned the requested revision. The tracked tree was unchanged. Independently fetched and byte-compared every lesson runtime asset plus shared `style.css` and `common.js` against this checkout; SHA-256 receipts are in [independent-checks.json](878-evidence/878-review-1-e7e2fb2d/independent-checks.json). No concurrent candidate edits were observed. Only this report and its exclusive evidence directory were written. The rendered-state supplement was first read after the cold record was saved.

Read the [official statement](https://leetcode.com/problems/nth-magical-number/) normally through the web tool: positive integer divisible by a or b; nth result modulo 1,000,000,007; both examples and bounds match the lesson. No access bypass or submission occurred. Canonical Python has the faithful scalar callable `Solution.nthMagicalNumber(self, n: int, a: int, b: int) -> int`; there is no altered input schema or conceptual substitute. `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py` specifies `solution.py`, `python-code.js`, `PYTHON_SOURCE` for Python; these exact files/export were checked. The conditional non-Python language-contract gate does not apply.

The actual source computes lcm once, then counts each midpoint with three floor divisions. For a retained interval, all values below lo have insufficient count and hi has sufficient count. A failed midpoint moves lo beyond mid; a sufficient midpoint keeps mid as hi. For lo<hi, mid<hi and either update decreases width. Thus the first sufficient point remains and termination identifies the nth distinct magical value. Modulo is applied only after search, preserving order comparisons. All inputs are integers and read only. The baseline scans at most U integers; the canonical solution costs O(log(min(a,b))+log U) integer operations and O(1) auxiliary integer cells, with U=n·min(a,b). The qualification about bit costs is appropriate. At U=4×10¹³ there are no more than 46 tests (the maximum preset actually takes45). Browser snapshots are explicitly separate teaching storage; JS's numbers remain within exact integer range for these constraints.

### Independently chosen examples and invariants

Executed the actual imported canonical Python with bytecode disabled, using a separately constructed sorted union within a whole lcm period as oracle. Saved predictions were confirmed: (8,4,7) gives21; (3,3,6) gives9. For the fresh case, complete independent interval reconstruction is [1,32] → test16/count6 → [17,32] → test24/count9 → [17,24] → test20/count7 → [21,24] → test22/count8 → [21,22] → test21/count8 → [21,21]. Each retained interval contains21 and strictly shrinks. C(20)=7 excludes all values through20; C(22)=8 includes22 as a bound but does not establish that22 itself is magical. For the custom counterexample C(6)=2, not3: union [3,6], overlap6. Its third value is9.

Additional canonical checks covered n=1 with (2,40000), n=10⁹ with equal40000, coprime39999/40000 and2/3. Raw/residue pairs include 40,000,000,000,000 / 999,720,007; 20,000,000,000,000 / 999,860,007; 1,500,000,000 / 499,999,993. Full independent calculations and intermediate interval records are saved in `independent-checks.json`. These are code checks, not custom UI input experiments.

Separately predicted in the browser **before** advancing preset n5/a4/b6: initial [1,20], mid10/count3 should retain[11,20]. Observed exactly that. Keyboard End on the focused position slider reached rank5=16; Home returned to the initial interval. The presets independently yield raw answers 6,2,16,12,12,40,000,000,000,000; all completed browser traces agree in both locales.

## Inspected tests and observed execution

Read the test scripts before running them. Their default writes target author evidence, so every invocation below supplied `OUTPUT_DIR="$PWD/specs/reviews/878-evidence/878-review-1-e7e2fb2d"`. No author assets or evidence were regenerated.

| Command (from repository root) | Observed result |
| --- | --- |
| `python3 -B leetcode/878/tests/test_solution.py` with the above OUTPUT_DIR | Exit0; actual canonical method passed8198 cases, using enumeration and period-union oracles. |
| `node leetcode/878/tests/test_core.cjs` with the above OUTPUT_DIR | Exit0;8350 traces,67317 frames,29596 counts; decoded mirror equality; Acorn detects duplicate localization keys before evaluation and checks two-string pair shapes. |
| `node leetcode/878/tests/browser.cjs` with the above OUTPUT_DIR | Exit0; real Chromium156.0.8078.4/Linux; browser result and screenshots retained here. |
| `node leetcode/878/tests/access.cjs` with the above OUTPUT_DIR | Exit0; closed-select fits, localized headings and narrow learning-path/link checks. |
| `python3 -B scripts/register_leetcode_lesson.py 878 --validate-only` | Exit0, no stdout. Safe non-mutating preflight; rerun also exit0. Complexity is exactly one nonempty string covering time and space. |

Test claims were assessed against their code. Python oracles enumerate actual values, rather than reusing binary search. Small JS midpoint counts use divisibility enumeration, and endpoint oracles merge the two streams. Browser checks compare all frames for all presets and rewind/replay in each locale, but use core-generated expected frames; independent mathematical examples above provide the additional check. Critically, the localization tests establish unique keys and valid pairs, **not the meaning of the step5 map bullets**. Their passing results therefore do not discharge finding878-R1.

## Interaction, language, access and source parity

Observed both count branches, initial/middle/final states, Undo/replay, Reset, jump-to-end and slider endpoints. History marks a completed operation; the before interval belongs to that operation and the after interval is its result. It does not mislabel the tested midpoint as the answer. Initial result/test fields are hidden; disabled previous/reset and final next/end controls behave correctly. Preset changes restart the trace. Count-slider value, prediction choice/revealed feedback, source-disclosure state, trace position and focused next button survive locale changes. Prediction changes clear obsolete feedback; all three choices give input-consistent explanations in both languages. The quiz is independent of the trace selector, so changing trace input correctly leaves its fixed n7/a3/b5 question intact.

The complete formula renders in both languages, including all operands and the overlap term. Representative `few` and `enough` messages match their respective state updates. The Chinese narrative preserves the actual count/first-sufficient reasoning. The H1 and document title match localized #878 identity through zh→en→zh. One bilingual semantic-binding defect remains in step5, detailed below.

Verified exact **untrimmed** canonical-source equality for decoded mirror, code `textContent`, successful automatic clipboard write, downloaded bytes and manual fallback. Before each English/Chinese fallback attempt, the test wrote and read back a fresh distinct non-source sentinel, then rejected automatic writes, invoked Copy, verified textarea focus/full selection, dispatched Linux Control+C and read back the complete canonical source including final newline. Each succeeded. See `browser-result.json` for attempt receipts. Offline `file://` opening also displayed the exact embedded source and operated the trace.

Inspected screenshot pixels, not just pass counts: `trace-320-en.png`, `count-320-zh.png`, `prediction-320-en.png`, `state-320-en.png`, `state-390-zh.png`, `state-1440-en.png`, `zoom-200-zh.png`, and both `mapping-settled-*` images. Large interval integers wrap within associated cards without text intersections; the narrow count terms stack; quiz options/feedback remain readable. Native closed preset labels fit at320 in both languages, including the maximum input; browser suite minimum measured margin was67.57px. Both locales were exercised at320/390/736/1440, and200% CSS zoom at1440. No document overflow was found. Some screenshots begin mid-content because the target readout was scrolled into view; the sticky navigation crossing cropped preceding prose in an element capture is a capture artifact, not a collision finding. Ordinary settled step5 screenshots establish the missing bullets directly.

Keyboard Enter activates trace controls and links; slider Home/End works. Focus outline is visible3px and primary control height≥48px. Disabled text is opacity1, rgb(154,167,184) on rgb(22,27,34), measured contrast7.07885:1. The inspected sRGB function uses0.2126/0.7152/0.0722 and was calibrated on black/white/primaries and #747474-on-black=4.492948 (correctly below4.5). Tested text palette pairs range6.4494–16.4373:1; all exceed4.5. This is solid-color scope, not proof for arbitrary compositing. Forced-colors/reduced-motion and denied-storage paths operated. Browser diagnostics found no console/page errors, failed local assets or external runtime dependencies.

Followed the rendered related links by keyboard in both locales at narrow and desktop widths. #668 step2 actually teaches kth values with duplicates and first-sufficient counting bounds; #793 step2 explains staircase counts and lower boundaries. Their local destinations are served and match the advertised concepts. This is local navigation evidence only, not publication verification.

## Required finding

### 878-R1 — Code-transfer explanations replaced by input labels (open)

- **Severity:** medium, required teaching/semantic-binding fix. **Candidate:** `6edbe661e03cd4d7a07f979a3f2269d54e5ac4a0`; problem878, step5, English and Chinese, desktop1280×1000 (also visible in full-page cold captures); independent of chosen trace preset.
- **Reproduction:** open the lesson, activate step5 in navigation, read the three bullets immediately below the gcd explanation. Switch locale and repeat; optionally disclose the solution. No author notes are needed to see the defect.
- **Expected:** the section answering “what does each code line maintain” gives meaningful mappings from the worked interval/count operation to the canonical lines, with concrete before/after values and why the update retains the answer. A reader with basic Python should not have to supply these explanations by recognizing a finished binary-search implementation.
- **Actual:** all three bullets are merely `n=4 · a=2 · b=3`, `n=1 · a=2 · b=3`, `n=5 · a=4 · b=6`. They are plain list items, not input controls or worked executions. `copy.js` map0/map1/map2 contains those same strings in both locales and `index.html` binds them as explanatory bullets. The surrounding gcd and cost paragraphs do not turn these input labels into code explanations. Step3 correctly teaches mathematical update rules, which mitigates this gap, but step5's advertised transfer itself remains partly reconstructed by the reader.
- **Evidence:** [settled English](878-evidence/878-review-1-e7e2fb2d/mapping-settled-en.png), [settled Chinese](878-evidence/878-review-1-e7e2fb2d/mapping-settled-zh.png), cold step5 observation, and inspected source binding. This is a wrong semantic binding despite unique keys and well-shaped translation pairs.
- **Violated requirement:** frozen rubric's depth/causal-bridge and executable-Python transfer requirement; rendered-state contract's meaningful localization binding. Numerical correctness and exact-source parity do not replace the missing lesson explanation.
- **Owner/next action:** lesson author should restore concrete bilingual code mappings, then submit a new frozen candidate. Recheck the actual rendered bullets against at least one failing-count and one sufficient-count transition, retain source parity and interaction regression evidence, and reassess dimension5. **Fix revision:** none. **Regression/closure:** not supplied; open. No implementation was repaired during review.

No earlier review report for878 was present in the repository file search after the cold walkthrough; there are no prior finding closures claimed here.

## Scores and conclusion

| Dimension | Score0–4 | Weight | Rationale |
| --- | --- | --- | --- |
| Problem/terms/hand calculation | 4 | 15 | Small rank list precedes abstraction; units, OR membership, overlap, bounds and modulo are explicit. |
| Derivation/saved work | 4 | 20 | Baseline's huge scan motivates quotient counting; overlap subtraction and shared-factor counterexample explain saved work. |
| State/correctness | 4 | 20 | Concrete complete search, invariant, both exclusions, termination and plateau counterexample; independent checks agree. |
| Interaction/visual meaning | 4 | 20 | Before/test/after and history align; prediction/change, rewind/reset/endpoints and preserved state behave as described. |
| Python/cost | 2 | 15 | Faithful executable source and cost are correct, but step5's intended explanatory mappings are unrelated input labels (878-R1). Earlier math permits partial reconstruction; the advertised code-transfer section does not complete its job. |
| Bilingual/device | 4 | 10 | Core reasoning and identity match; observed layouts, keyboard, source transfer and disabled readability pass. The shared content defect is charged to Python transfer rather than double-counted as a translation difference. |

Weighted total: **92.5/100**. **Outcome: changes_required.** Required open IDs: **878-R1**. Despite exceeding85 overall, dimension5 is below3 and a required teaching finding remains open. Acceptance is withheld for this candidate.

Limitations: headless Linux Chromium;200% CSS magnification, not native browser-chrome zoom; no physical-device or other OS/font-environment coverage. The review does not claim real-human novice comprehension, successful LeetCode submission, deployment or publication. No missing essential explanation was supplied from author notes. Results establish the observed candidate only; a fix requires a new candidate and regression review.
