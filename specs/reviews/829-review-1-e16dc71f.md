# Independent review: 829 — Consecutive Numbers Sum

Candidate: `0609ad2ae0e4c53c393225e5873152023724b3e3`. URL: http://127.0.0.1:18770/leetcode/829/. Target: basic Python, lists, loops, functions, elementary recursion. Review run: `829-review-1-e16dc71f`; reviewer/model identity unavailable. Frozen six weights: 15,20,20,20,15,10. This is an independent review, separate from publication.

## Cold browser walkthrough (saved before source, tests, author notes or prior reviews)

Read only `specs/leetcode-review-gates.md` before opening the candidate using real headless Chromium through Playwright, desktop 1280×900. Inspected the full-page screenshot `829-evidence/829-review-1-e16dc71f/cold-desktop.png`.

| Step / question | Action | Observable result | My causal reconstruction |
|---|---|---|---|
| 01: What is counted, and how does 5 work? | Read problem; choose k=1, then k=2, then k=3. | [5]; bases 2 with offsets 0,1 give 2,3; three minimum terms 1,2,3 total 6>5. | Count positive consecutive sequences, including one term. Equal bases plus fixed offsets determine the terms. Removing offsets from 5 leaves 4 for two bases; three terms cannot fit. |
| 02: What work does the baseline do? | Open “Inspect the brute-force Python”. | Nested start/end loops add every endpoint; n=5 makes 5+4+3+2+1=15 additions and finds [2,3],[5]. Text contrasts approximately 5×10^17 additions at the limit. | The repeated work is constructing sums for every start/end; checking a length algebraically can avoid generating those terms. Early stopping still scans n starts. |
| 03: What makes a length valid and when can we stop? | Read derivation, advance next three times for n=5. | Empty ledger/count 0 → k=1 accepted count 1, R=5 → k=2 accepted count 2, R=4 → separate k=3 stop (minimum 6>5), count remains 2. | Subtract k(k−1)/2 to leave k equal starts. Integer sharing plus positive start is sufficient. Guard ensures positivity. Before each length, count covers exactly smaller lengths. Larger minimum sums justify termination. |
| 03 history: Does undo restore the prior instant? | Undo final stop, then go to final stop. | Undo restores two accepted rows/count 2 and next guard k=3; final shows stop again. | Stop is a distinct state, not a spurious accepted/rejected row. History is retained data; color marks the current row only. |
| 04: Can four terms make 18? | Before reveal, independently calculate minimum 10, offsets 6, remaining 12, start 3; choose “Yes: start a=3”, reveal. Then choose a=4. | Correct feedback gives 3+4+5+6=18 and explains a=4 gives 22. Changing choice hides the answer. | Even lengths can work. Need both minimum and remainder checks; a candidate start must rebuild the original sum. |
| 05: How does this become Python? | Open complete submission and read cost explanation. | `while k*(k+1)//2 <= n`, subtract offsets, `% k == 0`, increment answer then k. Text explains // and %, O(√n) time/O(1) space, separate browser ledger memory. | Visible n=5,k=2 transition maps to remaining=4, remainder 0 and answer 1→2. Guard includes equality for n=6,k=3; no input mutation or list of terms is needed. |

The tiny worked example precedes formulas; baseline, offsets, unique start, positivity, invariant and stop all have visible causal explanations. The odd-length-only mistake is refuted by 9=4+5. The divisibility-only mistake is refuted by n=3,k=3 yielding forbidden 0+1+2.

### Independent predictions recorded before executable checks

UI is preset-only (5,9,15,1,8,16,45). Custom-input checks below will be **code checks**, not UI experiments. Fresh input **21**: predict four sequences [21], [10,11], [6,7,8], [1,2,3,4,5,6]. Lengths 4 and 5 fail equal sharing; length 7 cannot fit. Counterexample **n=3,k=3**: remainder 0 is divisible but start 0 is illegal; predict canonical total 2 ([3],[1,2]) and exclusion of k=3 by minimum 6>3. Equality boundary **n=6**: predict two ways, including [1,2,3]. These predictions were saved before source execution.

Cold-read limitations: no measured human comprehension; no LeetCode submission. Browser simulation is explicitly labeled as not executing Python. Further source, access and interaction audit follows after this saved section.

## Post-cold source and executable audit

Applied `specs/leetcode-rendered-state-contract.md` only after saving the cold walk. HEAD equals the requested candidate. Initial status showed only this report/evidence as untracked; no candidate modifications. No earlier review report for #829 was found, so no inherited required finding is claimed closed.

Read canonical `solution.py`, `python-code.js`, `core.js`, `app.js`, `copy.js`, `index.html`, lesson CSS, shared locale consumer and metadata. Read `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py`: Python requires `solution.py`, `python-code.js`, export `PYTHON_SOURCE`, all present. Faithful Python is available and used; no non-Python contract exception is needed. The saved lesson-local official snippet has `class Solution` and `consecutiveNumbersSum(self, n: int) -> int`, matching canonical code. Read the [official statement](https://leetcode.com/problems/consecutive-numbers-sum/) normally through the web tool: positive consecutive integers, examples 5→2, 9→3, 15→4, range 1..10^9 agree. No access bypass or submission was performed.

**Fresh code checks confirmed the saved predictions.** Executed the actual canonical class through `runpy.run_path`, independently enumerating starts and growing sums without using the length formula: 21→4 with exactly the four predicted sequences; 3→2 ([1,2],[3]); 6→2 ([1,2,3],[6]). Additional selected checks: 2→1, 7→2, 10→2, 28→2, 31→2. For 10^9 canonical returns 10 and an independent integer-square-root guard calculation gives 44,720 tested lengths. Custom 21 and counterexample 3 are code checks, not browser experiments.

Correctness reconstruction: for fixed k, the sum is k*a plus the offsets; there is at most one integer a. The guard implies remaining≥k and hence positive a. The modulo condition is then necessary and sufficient. Updating answer accounts for exactly this new length, and increasing k cannot duplicate a sequence. The first failing minimum bound excludes every larger k. At n=6,k=3 guard equality is essential. Input is an immutable integer and the canonical routine neither mutates a collection nor allocates a sequence. Its bounded-range integer-operation cost is O(√n) time and O(1) auxiliary space. Displayed baseline really does scan n(n+1)/2 endpoint additions with constant state. The visible ledger has one record per checked length; browser snapshots additionally retain copied history and are separate from submission memory.

All tests were inspected before execution. They honor `OUTPUT_DIR`; the authoring helper `build_html.py` was not run. Commands from repository root (each output-producing test redirected into this run's exclusive evidence directory):

```
OUTPUT_DIR=specs/reviews/829-evidence/829-review-1-e16dc71f python3 -B leetcode/829/tests/test_solution.py
OUTPUT_DIR=specs/reviews/829-evidence/829-review-1-e16dc71f node leetcode/829/tests/test_core.cjs
OUTPUT_DIR=specs/reviews/829-evidence/829-review-1-e16dc71f node leetcode/829/tests/browser.cjs
OUTPUT_DIR=specs/reviews/829-evidence/829-review-1-e16dc71f node leetcode/829/tests/state-audit.cjs
python3 -B scripts/register_leetcode_lesson.py 829 --validate-only
```

All exited 0. Preflight produced no output: **PASS**, and metadata `complexity` is the single nonempty string `O(sqrt(n)) time; O(1) auxiliary space`. Computational suite ran canonical source against start-and-grow oracle for 1..1000, 290 large/boundary cases against odd-part divisor factoring, intermediate positivity/count invariants, and exact HTML baseline for 1..100. Core suite checked all intermediate snapshots through n=1000, snapshot isolation, mirror equality, localization AST duplicate-key detection, pair shapes and placeholder agreement. Reused test JSON retains its original “author self-check” kind labels; these are test implementations rerun during this review, not separate reviewer identities or proof of comprehension.

## Rendered interaction, language and access observations

Real browser: Chromium 156.0.8078.4 on Linux, Playwright resolved with NODE_PATH; executable path taken from `process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Reused browser test passed 32 recorded branches and 14 layout cases. All seven preset endpoints independently counted by start-and-grow: 5→2, 9→3, 15→4, 1→1, 8→1, 16→1, 45→6. It exercised every frame, reverse/replay, initial and final disabled controls, reset, input change, all prediction options and invalidation after changing selection, locale switching, independent simulation/quiz state, keyboard Enter/Tab and focus outline, forced colors, reduced motion, denied storage, offline load and local links. No page errors or failed local responses were observed.

I additionally inspected an independently operated n=45 intermediate frame at 320px after four checks and a wrong prediction. Before switching locales, hand calculation gives k=1,2,3 accepted (starts 45,22,14), then k=4 rejected since T=6,R=39,R%4=3; cumulative count must remain 3. Observed all these values and retained rows in zh→en→zh. Both H1 and document title carried #829 and the correct localized title. The choice remained checked, and revealed wrong-choice feedback preserved the same 18/k=4 reasoning. Formula operands remained complete in both languages; translated invariant, zero-start exclusion, odd-length trap and Python mapping retain the same reasoning. Localized rejected-row text correctly means inability to share into integer bases, rather than a clipboard or unrelated fallback message.

Readout semantics are consistent: “checks completed” includes the separate final guard event, while ledger explicitly includes only tested lengths. At 45 the stop is check 10/10 with nine ledger rows and six accepted sequences. Tested-frame count, per-row cumulative count and accepted sequence identity agree; the terminal guard is not inserted as a tested row.

Inspected screenshots after capture: cold desktop and stop; `independent-zh-320-middle.png`; `en-1440-trace.png`; `zh-header-final.png`; both `*-390-ledger.png`; `en-390-quiz.png`; `zh-320-hand.png`; both `*-320-zoom200.png`. Narrow ledger rows wrap without value/label intersection, and current-row styling does not replace textual accepted/rejected labels. Some component screenshots have their uppermost row beneath the sticky navigation because capture scrolls the component; this is a capture/scroll artifact, not evidence of a row collision. Main-page settled screenshots and sequential row content remain usable. At 200% CSS zoom, the 320px view is readable but very tall with strong wrapping (including an isolated punctuation line). This is minor reading friction, not missing content. Layout checks at 320/390/736/1440 and zoom 2 at 320/390/1440 found no document or essential row overflow in either locale.

Closed select at 320px uses the short label `n = 45`: width 98px, text measured 45.664px, left/right padding 15px each, leaving about 22px for its native arrow. CSS font stack is `"PingFang SC", "Microsoft YaHei", system-ui, sans-serif`; exact resolved font is not asserted. Desktop screenshot visibly confirms the complete closed label; short options share this format. Keyboard activation and Tab navigation have a visible 3px focus outline; controls and option-label targets meet the tested 48px minimum.

Contrast: inspected actual opaque foreground/background pairs and the measurement code, then independently exercised the **actual extracted browser-test luminance helper** against black, white and RGB primaries. It returns 0/1/.2126/.7152/.0722 and #747474-on-black ratio 4.492948073111701 (correctly below 4.5). Recorded body contrast 16.087, hint 7.744, tile secondary text 6.449, current-row heading 8.937; disabled initial undo/reveal and terminal next use rgb(154,167,184) on rgb(22,27,34), ratio 7.079 with opacity 1. Correct feedback ratio 10.005 and incorrect feedback 13.397. These measurements cover the solid colors inspected, not arbitrary future styles.

Source fidelity passed **without trimming**: canonical bytes, decoded offline mirror, `pythonCode.textContent`, actual download, successful clipboard and selected manual fallback all equal the full canonical file including final newline. Each locale had two fallback transfers, each preceded by its own distinct non-source clipboard sentinel write/read verification; the real Copy control then failed automatic writing, focused and selected the whole textarea, and Linux `Control+C` read back exact source. Browser result records all four attempts. No test-written source was used as manual-transfer evidence.

Related rendered links were followed in both locales to `/leetcode/483/#step2` and `/leetcode/233/#step2`. Read destination excerpts: #483 explains monotone integer-base sums and safe search bounds (13 with m=2 gives S₂(2)=7,S₂(3)=13,S₂(4)=21); #233 explains disjoint digit-cycle contributions using higher/current/lower. These support the actual “integer boundaries” and “count without overlap” labels. This is local-preview navigation evidence, not publication verification of those lessons.

## Candidate identity receipt

Fetched runtime assets from the preview and compared bytes directly to checkout; all seven matched. SHA-256:

| File | SHA-256 |
|---|---|
| index.html | 58e08a0b58a9650302b1917e0eb4ef27687a4229d927243f861a079f37b6c0b3 |
| app.js | c1242d90d967f641dbf1165fa4984acb3d92cb2f0ef17f0a5e4376a5b7edfb79 |
| copy.js | 39b87776eb7163db86aa433e9efe43dd1f1c08424b019fedb9bb64f84ffa3812 |
| core.js | 7f0526f16c86d415451d5355034fdeeba6408b64798ed8f24638f022da8f9e7f |
| style.css | 89bb5affbc759cd1b792ce86dfd41b028d15ea33728a58aee7b55a21092fe075 |
| python-code.js | 889f306cdbdcd5c454012aa33378348c152dd9f2cf2e17e380bdb993f9161139 |
| solution.py | 890565cfdc772ed56bbcec415ab73b2729751a2ee2ecc6de718797e9c3c7efe3 |

## Scores and conclusion

| Dimension | Weight | Score /4 | Observation supporting score |
|---|---:|---:|---|
| Problem / terms / hand calculation | 15 | 4 | Positive, consecutive, single-term and output count are explicit; worked 5 reconstructs bases and offsets before abstraction. |
| Derivation / saved work | 20 | 4 | Exact baseline additions, eliminated term generation, offset derivation, unique start and two wrong rules are explained causally. |
| Maintained state / correctness | 20 | 4 | Count invariant, integer sharing, positivity, equality boundary and monotone termination reconstruct and match executable checks. |
| Interaction / visual meaning | 20 | 4 | Predict/reveal/change, retained ledger, rejected middle row, undo/replay/reset/end and independent experiment state behave consistently. |
| Python / cost | 15 | 4 | Actual faithful canonical code executes fresh cases; transition and arithmetic operators map directly; costs and memory scope are explained. |
| Bilingual / device | 10 | 3 | Equivalent reasoning and preserved states, keyboard access and solid contrast; strong wrapping at 200%/320px adds minor reading friction. |

Weighted score: **97.5/100**. Every dimension ≥3. Required open IDs: **none**. No required finding was discovered and no earlier finding was silently closed. Optional polish: reduce extreme zoom wrapping while retaining readable type and complete formulas.

Outcome: **accepted** for the stated frozen revision and reviewed local-preview scope. No actual-human comprehension, LeetCode acceptance, native browser-chrome zoom, physical device testing, other-OS font behavior or deployed/public delivery is claimed. Zoom evidence uses CSS zoom 2. Only this exact report and this run's evidence directory were written; no implementation, candidate assets, tests, prior evidence, service or registry was changed.
