# Independent review: 995

Candidate: `580cfde42f1a03a1f6905f160a54b265908189ec`.
URL: http://127.0.0.1:18770/leetcode/995/.
Run: `995-review-2-1db70ea9`; reviewer identity/model identifier unavailable. Target: basic Python reader. Frozen dimensions and weights: problem/terms 15, derivation 20, correctness 20, interaction 20, Python/cost 15, bilingual/device 10. Python canonical interpretation applies.

## Cold browser walkthrough — recorded before source audit

Read only `specs/leetcode-review-gates.md` before opening the candidate in real headless Chromium via Playwright. No brief, prior review, implementation, tests or author claims were opened. Visible baseline code belongs to the teaching page and was expanded during this walkthrough; repository source was not opened.

| Teaching step / question | Action | Observable result | My causal paraphrase |
|---|---|---|---|
| 1: What changes when a length-two window flips? | Read definitions; click Show next flip twice on 010, k=2. | 010 → 100 → 111, with original values retained and fixed labels; second hand step disables next. | A flip affects both bits, including a 1; the zero created at index 1 requires another flip. Two flips return the middle bit to 1. Output counts operations, indices start at zero. |
| 2: Why must those starts be chosen, and why minimum? | Read forced-choice explanation and expand direct-flip baseline. | Page explains that later starts cannot reach the current position, repeated starts cancel, and any feasible solution must agree with earlier choices. Baseline copies and toggles each window cell. | At the first unsettled zero, only the current start can repair it without revising already forced decisions. At a one that start must be absent. Explicit k-cell writes repeat work. The tempting zero-count/k rule predicts one on 010 but neither available window covers both zeros. |
| 3: How can boundary events replace writes? | Predict first scan flips 0; advance all three position checks. | After i=0: effective 100, entry/expired/decided parity 0→0→1, expiry 2. After i=1: 111, 1→1→0, expiry 3. At i=2: 0→1→1, original 0 XOR 1=1, skip; final answer 2. Ledger retains all three rows. | Parity counts covering flips modulo two, not total flips. Remove the event at i before testing; i=2 is no longer covered by start 0. Effective cells describe after-decision values; “Pending” is check status rather than a claim that a bit is zero. |
| 4: Does expiry matter on a new case? | Select 2 flips before reveal on 0110,k=2; reveal. | Feedback rejects two: 0110→1010→1100→1111, answer 3; explains expiry of start 0 before testing index 2. | My selected two-flip prediction was wrong: two forced starts leave 00. A third forced start repairs it. The feedback diagnoses the expiry mistake with concrete intermediate arrays. |
| 5: How does the simulation become Python, and what costs remain? | Read code-mapping and boundaries text. | Page maps expiry removal, effective-bit test, overflow rejection and scheduling to Python; states unchanged nums, n+1 expiry entries, O(n) time/space. | At i=2 in 010, `parity ^= expire[2]` changes 0 to 1, so the zero-bit branch is skipped. Each iteration uses constant work instead of k writes. Expiry at n is valid and never visited. |

The UI offers eight presets, not custom arrays. Independently chosen **code-check predictions, recorded before source execution**: `[0,0,1,0,0], k=2` should need 2 (starts 0 and 3); `[0,0,1], k=3` should be impossible despite two zeros (counterexample to assuming “one window fixes all zeros”; it also destroys the final 1). Manual transitions: 00100→11100→11111; 001→110 and no further legal start. Invariant: after expiring at i, earlier prefix is all 1 and parity is exactly the parity of earlier starts still covering i. Boundary rejection excludes required starts extending beyond n.

Cold screenshot: `995-evidence/995-review-2-1db70ea9/cold-desktop.png`. Browser automation initially tried clicking a disabled hand endpoint and misidentified a radio as a button; those harness errors did not establish candidate failures. Cold notes saved before the following audit.

## Source and regression audit

**Outcome: accepted, 100/100; required-open IDs: none.** This applies only to the identified candidate and local preview, independently of publication.

HEAD exactly equals the candidate. Served bytes matched checkout bytes for index.html, app.js, core.js, copy.js, style.css, python-code.js, solution.py and shared common.js/style.css. Identity receipts (SHA-256):

- index.html: `36708dafe18c6521215e645d1ec9ee63128c9ebf522a5113fe76d91f615a3def`
- copy.js: `cb09dbd5fe234d16226d3cb56d85fb9b25db75dfbb99185eab1b6f0dcc7a6ba9`
- solution.py: `31cc55e456b9d13a0350ec26272a1601f19a9832c3dde85f5f123c54d7c848b9`

After saving the cold record, read the rendered-state contract, canonical Python, mirror, HTML, app/core/copy/CSS, tests and prior review. No implementation or author evidence was changed. Inspected emitting tests before execution and set EVIDENCE_DIR to this run's exclusive directory. Did not execute copy_repair.cjs: its output path is hardcoded to author evidence; independently checked its relevant repair claims instead.

Read the [official statement](https://leetcode.com/problems/minimum-number-of-k-consecutive-bit-flips/) through the ordinary web reader: binary input, exact-length contiguous toggles, minimum count or −1, n≤100000, 1≤k≤n, and all three examples match. Ordinary Chromium access returned 403/security verification; no bypass attempted. The live language selector was therefore unavailable. Saved lesson-local tests/evidence/official.json includes the Python3 `Solution.minKBitFlips(self, nums: list[int], k: int) -> int` interface, matching the canonical callable and original semantics. Python is faithful and preferred; no non-Python exception, language-contract.json or conceptual analogy applies. LANGUAGE_FILES in scripts/register_leetcode_lesson.py specifies solution.py / python-code.js / PYTHON_SOURCE for Python; those exact files were checked.

Metadata complexity is exactly the nonempty string `O(n) time; O(n) auxiliary space`. From repository root ran `python3 -B scripts/register_leetcode_lesson.py 995 --validate-only`: **exit 0, no output**, repeated at completion with the same result. No registration or repairs performed.

## Independent computation, invariant and costs

Executed the actual solution.py with Python importlib under `python3 -B`. My independent oracle enumerated subsets of legal window starts, explicitly toggled their cells, and minimized the number of selected starts yielding all ones. Cancellation justifies considering each start once. Exhaustive n=1..8, all binary arrays and all legal k: **3,586 matches**, with every input unchanged. This oracle differs from the author's BFS and the candidate's expiry scan.

Both pre-recorded custom predictions matched canonical execution and the oracle: 00100,k=2→2; 001,k=3→−1. These are **code checks**, not UI custom-input experiments. Independent boundaries: [0],1→1; [1],1→0; [0,0],2→1; [1,1],2→0; [1,0],2→−1. The last two mixed whole-window cases rule out repairing zeros without also considering damage to ones. The oracle covers every preset, whose advertised and rendered terminal values are A–H: 2,3,−1,2,1,0,−1,1.

The invariant applies after removing expire[i] and before testing i. Earlier prefix [0,i) is 1; parity counts earlier windows whose end exceeds i, modulo two. Starting at i cannot affect that prefix. Effective zero forces i, effective one excludes i. All feasible solutions must share these unique start decisions. A required out-of-bounds window proves impossibility; otherwise after n checks all bits are 1. This establishes minimality as well as feasibility.

Independently worked dense preset B (00010110,k=3):

| i | entry→after expiry→after decision | effective bit tested | action |
|---|---|---|---|
| 0 | 0→0→1 | 0^0=0 | start 0, expiry 3 |
| 1 | 1→1→1 | 0^1=1 | skip |
| 2 | 1→1→1 | 0^1=1 | skip |
| 3 | 1→0→0 | 1^0=1 | skip |
| 4 | 0→0→1 | 0^0=0 | start 4, expiry 7 |
| 5 | 1→1→0 | 1^1=0 | start 5, expiry 8 |
| 6 | 0→0→0 | 1^0=1 | skip |
| 7 | 0→1→1 | 0^1=1 | skip |

Rendered i=5 in both locales agrees: 6/8 checked, starts 0,4,5, flips so far 3, no final result. All effective cells are already 1 but indices 6,7 remain pending. This distinguishes computed values from checked status. Preset C ends with current index 2 still pending/0, zero flips so far and final −1; failure is not mislabeled as a successful count.

Visual-to-Python mapping: on 010 at i=1, expiry is zero, `(nums[1] ^ parity)==0` is true (1^1=0), so flips becomes 2, parity becomes 0, and expire[3] becomes 1. At i=2 the expiry at 2 changes parity 0→1 before the if, so 0^1=1 skips. `i+k>n` permits the exact endpoint n, whose event is stored but never scanned.

Actual source initializes n+1 cells and scans at most n positions with constant work each: O(n) time and O(n) auxiliary space, including allocation even on early failure/all ones. nums is read only. The direct baseline copies n cells then writes k per flip, O(nk) time/O(n) space (k≥1); teaching snapshot reconstruction/history is explicitly excluded from submission costs. No zero-parameter cost omission exists in the official domain.

## Executed checks and rendered evidence

All listed tests were inspected before running. Commands ran from repository root with `EVIDENCE_DIR="$PWD/specs/reviews/995-evidence/995-review-2-1db70ea9"`; browser commands additionally used `PREVIEW_URL=http://127.0.0.1:18770/leetcode/995/`. Installed Playwright uses NODE_PATH and the executablePath environment override when present.

| Command | Observed result |
|---|---|
| `python3 -B leetcode/995/tests/test_solution.py` | Exit 0; 18,434 exhaustive BFS comparisons, 1,000 seeded cases, nine example/max checks, exact mirror and immutability; numerical.json. |
| `node leetcode/995/tests/test_core.cjs` | Exit 0; 8,194 inputs, 58,416 frames; prefix, parity, expiry, effective values and independent snapshots; core.json. |
| `node leetcode/995/tests/browser.cjs` | Exit 0; 16 locale/preset runs, 16 width/zoom runs; browser.json and screenshots/downloads. |
| `node leetcode/995/tests/visual.cjs` | Exit 0; 12 focused state screenshots plus marker geometry in visual.json. |

Generated JSON retains the original programs' author-self-check labels; rerunning them supplies computational evidence, not independent teaching judgments. Scores come from the cold reconstruction, calculations and rendered inspection above and below.

Observed interactions: every preset can advance to its terminal, rewind fully, replay identically, jump to result and reset to the initial frame. Initial previous/reset and terminal next/end disable correctly. Input change resets only its stated scan. Both hand endpoints work and rewind. Every quiz option reveals causal feedback in both locales; changing choice hides stale feedback before revealing again. The quiz has its own fixed input, independent of scan presets. Locale roundtrip preserves selected preset, current scan position, chosen prediction, revealed feedback and open source details. A separate 320px zh→en→zh roundtrip verified localized H1/document title and retained 2/3 frame plus prediction; resizing to 390/1440 retained the frame.

Rendered binding checks: full formula contains `parity ^ expire[i]` then `nums[i] ^ parity` in each locale. Chinese expiry, failure and i=5 explanations give the same operands, ordering and reasons as English and the independent table. Copy dictionary has 102 unique keys by an independent Acorn AST property check, all pairs have matching placeholders; algorithm copy and clipboard-failure copy are separate consumers.

Exact source parity: decoded mirror, DOM textContent, successful clipboard text, downloaded bytes and manual-fallback text all equal canonical source including final newline/indentation, in both locales. Linux host uses Control+C. Before each fallback attempt the browser test writes and reads back a distinct non-source sentinel, disables automatic clipboard writing, invokes the real Copy control, verifies textarea focus/full selection, dispatches Control+C and reads canonical text from the native clipboard. Both attempts passed; no whitespace normalization was used.

Keyboard Enter advances and rewinds; Shift+Tab reaches previous; 3px focus outline is visible. Ledger and code pre support keyboard horizontal scrolling. Forced colors/reduced motion, blocked localStorage, file opening and already-loaded offline code checks passed. No browser errors, failed assets or external lesson requests were observed.

Layouts tested EN/ZH at 320,390,736,1440 px with 100% and 200% CSS zoom. No page-wide overflow; cards wrap, controls remain readable, and tables/code use focused horizontal regions. CSS zoom is layout stress, not native OS browser-zoom or physical-device evidence. Dense pending/fixed/current labels have separate text rows and measured nonintersecting geometry. At narrow 200% zoom cards stack vertically; a screenshot captures only the visible subset, not clipped page content. Sticky navigation itself scrolls horizontally.

Captured and personally inspected: cold-desktop.png; en-1440-z1-bits.png (dense ledger, i=5); focus-en-overlap.png (fixed and just checked coexist); focus-zh-zoom-current.png; en-320-z1-controls.png; zh-390-z1-controls.png; zh-390-z2-prediction.png; focus-zh-expiry-ledger.png; focus-en-failure.png; focus-zh-fallback.png; focus-en-source.png; en-320-z2-bits.png; closure-en-z2-proof.png; closure-zh-destination.png. Text remains legible; no label/value intersection was observed. Screenshots cropped by scroll position were interpreted with DOM geometry and ordinary scrolling, not treated as missing content.

Native closed selector A/B labels are deliberately short; full input/k/result description remains immediately adjacent. At 320px computed font stack is `16px "PingFang SC", "Microsoft YaHei", system-ui, sans-serif`, width 260px, selected A glyph 10.224px, 4px horizontal padding per side, with the existing 20px arrow reserve. This is a configured font stack, not identification of installed fonts.

Calibrated the browser test's actual luminance function extracted from its source: black=0, white=1, primaries .2126/.7152/.0722; black/white ratio 21; #747474/black≈4.492948 correctly fails 4.5. Recorded solid-color text ratios all meet 4.5, minimum 6.449407898769069. Disabled controls independently observed fg rgb(154,167,184), bg rgb(28,35,48), opacity 1, dashed border and disabled=true; screenshots show readable labels. Focus contrast meets 3. This supports the tested solid-color palette, not arbitrary gradients/transparency.

## Earlier findings and closure

Prior report `995-review-1-c18c137a.md` reviewed accepted base `d84cfb5265103d6d321fdc3f0d5dd4b3e17ac13c`; it had no required findings and two optional low-severity advisories. Read only after cold notes were saved. Candidate runtime changes are two copy strings and the copy asset query version; source/algorithm/state/CSS are unchanged. This run nevertheless performed a fresh walkthrough and broad regression checks.

| Stable ID | Original expected / actual and reproduction | Candidate recheck / status |
|---|---|---|
| 995-A01, low advisory; related link, EN/ZH, 320px, focus second related link and Enter | Expected promised concept to match section. Old label promised greedy proof; ../330/#step2 actually taught coverage-state changes. | **Closed** at this candidate. New labels “#330: trace how the covered range grows” / “#330：逐步观察覆盖范围如何扩展” accurately describe the available destination. Keyboard activation reaches served /leetcode/330/#step2 in both locales. Read target and executed reset/next twice: coverage [0,0]→[0,1]→[0,3], with state/ledger explaining consume/patch growth. closure.json and closure-*-destination.png. Owner next action: none for this advisory. |
| 995-A02, low advisory; section 2 English proof, any width | Expected basic-reader wording; old “Window flips commute” introduced unexplained vocabulary. | **Closed** at this candidate. Visible replacement explicitly says changing the order does not change the result, then explains repeated-start cancellation and forced starts. Chinese retains equivalent reasoning. Verified rendered text at 320px, both zoom levels, and desktop cold reading; closure.json / closure-*-proof.png. Owner next action: none. |

Fix revision for both: 580cfde42f1a03a1f6905f160a54b265908189ec. No new required or optional findings. Closure is based on actual served candidate behavior, not author “fixed” claims. Original reports/evidence remain intact.

## Scores and conclusion

| Dimension | Weight | Score | Observation-based rationale |
|---|---|---|---|
| Problem / terms / hand calculation | 15 | 4 | Concrete 010 flip sequence precedes abstraction; defines bit/window, indices, output and impossible case. |
| Causal derivation / saved work | 20 | 4 | Forced choices, cancellation and unique starts justify minimum; baseline writes become start/expiry toggles with hand-worked reasons. Earlier terse vocabulary is resolved. |
| Maintained state / correctness | 20 | 4 | Complete traces expose entry/expired/decided parity; independent oracle and boundaries agree; prefix, failure and termination reconstructable. |
| Interaction / visual meaning | 20 | 4 | Prediction feedback explains the wrong answer; retained history, rewind/reset/endpoints work; values and current/fixed/pending status remain distinct. |
| Python / actual cost | 15 | 4 | Actual faithful callable executes, fresh cases transfer, exact source export verified, nonmutation and O(n)/O(n) follow from code. |
| Bilingual / device access | 10 | 4 | Equivalent causal explanations and bindings; keyboard, readable disabled controls, contrast, narrow/desktop and zoom stress verified with inspected screenshots. |

Weighted score **100/100**; every dimension ≥3; no required-open IDs; evidence complete for this scope. **Accepted** for the candidate above. No publication, successful LeetCode submission or real-human comprehension claim is made.

Limitations: one independent review run; live official browser selector blocked by normal security verification, so Python interface evidence additionally uses the saved official snippet. No native mobile hardware, OS-level zoom, cross-platform font equivalence or production delivery verification. Only this report and this run's exclusive evidence directory were written; implementation, tests, author evidence and prior reviews were preserved.

