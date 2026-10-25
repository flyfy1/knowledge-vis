# Independent review: 940 — Distinct Subsequences II

Candidate: `4d65eab80efc4cff1f122918d021f0c9e308e686`. URL: http://127.0.0.1:18787/leetcode/940/. Date: 2026-10-26. Reviewer: this independent review run; exact model identifier unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen dimensions/weights: problem/terms 15, derivation 20, correctness 20, interaction 20, Python/cost 15, bilingual/device 10. Python interface is the preferred applicable contract. No author material, source, tests, earlier reviews, or rendered-state contract was read before this cold walk.

## Cold browser walkthrough (saved before source inspection)

Real Chromium through Playwright, desktop 1280×900. Read the frozen rubric first, then opened the candidate. These observations are independent reading, not measured human comprehension.

| Teaching step/question | Action and prediction before reveal | Observable result | Causal conclusion in my words |
| --- | --- | --- | --- |
| 01: What counts for two a positions? | Manually predicted `{a, aa}`, answer 2; clicked Show/hide hand calculation. | Position {1} and {2} both produce a; {1,2} produces aa; empty is excluded. Bounds 1…2000, lowercase, remainder modulus visible. | We count resulting strings rather than position choices; deletion preserves order. |
| 02: How can every possible string be generated, and why abandon it? | Read the eight aba position choices and baseline. Independently checked empty, a, b, a, ab, aa, ba, aba. Predicted naive doubling fails on aa (3 versus 2). | Set merges the duplicate a into six nonempty strings. Page explains n scans for each of 2^n choices and exponential storage. | Enumeration repeats equivalent results from different positions. Counting by last letter can avoid storing all strings. Bit-mask syntax is a little denser than the assumed prerequisites, but the keep/delete explanation is sufficient for the bridge. |
| 03: What does a new letter replace? | Predicted aba totals 0→1→3→6. Clicked Append three times. | Empty: no groups, total 0. a: a={a}, 0→1, total 1. ab: b={ab,b}, 0→2, total 3. aba: a={a,aa,aba,ba}, 1→4, b unchanged at 2, total 6. Actual old/new values and equations visible at each frame. | Appending c to each old string plus empty produces distinct new c-ending strings; removing c uniquely recovers their origin. It also reconstructs all old c-ending strings, so replace that entire group once. Other final letters cannot overlap it. |
| 03: What is retained and what marks current state? | Undo from aba, then append again; reset then complete. | Undo shows ab total 3 and prefix rows through ab; replay restores aba 6. Reset/complete restores full ledger 0,1,3,6. ◆ marks the current row, while sets/counts are actual data. Intermediate caption explicitly says the current total is not yet the whole-input answer. | State represents the completed prefix, not a partially updated letter. History through that prefix stays visible; rewind restores its counts. All-zero initial groups and disjoint final-letter groups support induction and final return. |
| 04: Can replacement transfer to a different repeat? | Before verifying, computed abba: old total 5, old a 1, new a 6, total 10; selected B and verified. Then changed to A. | Correct feedback lists new a={a,aa,ba,aba,bba,abba}, unchanged b count 4, equation 5−1+6=10. Changing choice hides feedback (“Choice recorded. Verify to see why.”). | The old repeated-letter group is subtracted exactly once; 11 omits subtraction and 9 subtracts twice. This tests transfer beyond the running aba example. |
| 05: How does the visible replacement become Python? | Compared visible ab→aba values with the displayed loop and read boundary/cost notes. | `new` is computed from old total, then total changes, then ending[index] changes; example uses index 0, new 4, total 6. Modulo residues, Python negative normalization, 26 counters, and simulation/storage distinction are explicit. | Order preserves old dependencies; fixed alphabet and modulus make each iteration constant cost, so O(n) time/O(1) auxiliary space. No final empty-string subtraction is needed. |
| Bilingual reasoning | Switched to 中 after final aba and changed prediction. | Final aba groups/equation and unrevealed changed answer persisted; Chinese definitions, replacement proof, invariant, code mapping, modulus and costs express the same reasoning. | Translation preserves both the causal explanation and the current experiment rather than restarting it. |

Independent fresh input prediction, recorded in the browser-driver output before source: **baa → 5**, strings `{b,a,ba,aa,baa}`. Counterexample to blindly doubling: the last a would predict 7, but a and ba have already existed, so replace old a group of size 2: 3−2+4=5. UI offers presets only, so this fresh-input verification will be a **code check**, not a custom-input UI claim. The cold walk's own revealed counterexample was aa → 2 rather than 3.

Cold screenshots saved: `940-evidence/940-review-1-e4da4b0e/cold-desktop.png` and `cold-zh.png`. Subsequent screenshot inspection and all source/contract checks are recorded below, after this saved cold-walk boundary.

## Candidate/source and official-statement audit

Only after the saved cold walk, read `specs/leetcode-rendered-state-contract.md`, the canonical Python, HTML, core, controller, locale dictionary, CSS, metadata, provenance, shared locale helper, and test programs. No earlier report for 940 exists in `specs/reviews/` apart from this report; no closure is being inherited. `git rev-parse HEAD` returned the requested revision, before and after checks. `git diff --exit-code` passed; status contains only this new report and its exclusive evidence directory.

Read the [official statement](https://leetcode.com/problems/distinct-subsequences-ii/) through normal web access. Its nonempty distinct-string semantics, order-preserving deletion, modulus, examples 7/6/3 and bounds 1…2000 lowercase match the lesson. No access bypass or submission was attempted. Lesson-local `provenance/official.json` includes the official Python3 skeleton `class Solution: def distinctSubseqII(self, s: str) -> int`, matching the actual canonical callable and string-to-integer semantics. The live statement reader did not expose an editor language selector; this is a Python lesson, so the special independent non-Python selector/`language-contract.json` audit is not applicable. Python is a faithful original implementation, not a conceptual analogy. Read `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py`: required Python pair is `solution.py`, `python-code.js`, export `PYTHON_SOURCE`; all are present and exact. No non-Python submission is advertised.

Fetched preview assets independently and compared exact bytes with the checkout. SHA-256:

| Asset | SHA-256 |
| --- | --- |
| 940/index.html | f8efd06fa5d97dda71c3f8f58f64d7ebf8061dab81f951d1479bf2e1c2d8ffe8 |
| 940/style.css | 55daf13738d41170dafbbc7eea44ee1293c92c42c53047729c1efe985609d670 |
| 940/app.js | 30273f051166f24883089dd119777161ba912f830213e08bf377351ec69d203b |
| 940/core.js | 3cea959f00aff9baab4c395265f507d404e69d29c10063fb3fe7136c2d703267 |
| 940/copy.js | db79c8f2ba6489ef7bf4af67e232f9d0c3e80ed3a442ad8a8f2f6f6b1e1c3e93 |
| 940/python-code.js | 9b0898ed1836be9769b19e11b5300553ca678ad8753217b30d4c47858864e9b5 |
| 940/solution.py | 55fce8a63ac723d74be619500fdbfcb23c2eaa712d24c118974bd7f88ff53db4 |
| shared common.js | f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b |
| shared style.css | 6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27 |

## Independent correctness, invariant, and transfer checks

Executed the actual `solution.py` using `exec(compile(...))` / its `Solution().distinctSubseqII` callable, not the teaching simulation. A separately written position-combinations set oracle checked all 3,279 nonempty strings over `abz` through length 7. Fresh **baa returned 5**, exactly the pre-reveal prediction `{a,aa,b,ba,baa}`. Additional explicit checks: z→1, zz→2, abba→10, zazbza→45, 2000 z letters→2000, and all 26 different letters→67,108,863. The tempting doubling rule would give 7 for baa; old a-ending strings a and ba are regenerated, so 3−2+4=5. These are code checks because arbitrary UI input is unavailable.

For length-2000 checks, used independent arbitrary-precision prefix counts including empty, subtracting the count before the previous occurrence of each character (no modulo until the oracle's final return). Canonical results matched: `ab` repeated 1000→694708213; alphabet repeated 76 plus `abcdefghijklmnopqrstuvwx`→995084322; 1999 a letters followed by z→3999. Instrumented the actual canonical function at each completed iteration on `ab`×1000: all 2000 arrays matched the independent unbounded ending-group counts reduced modulo M, and `total == sum(ending) % M` held. In 990 frames total was below the just-updated group residue, demonstrating why residue order cannot be treated as true magnitude. The code correctly normalizes with `%`. Reusing the same Solution instance for baa still gave 5; counters are local, and input s remains unchanged.

The transition's dependencies are correct: `new` reads old total, subtraction reads old ending[index], then that slot is replaced. Initial zero counters represent no nonempty strings. Each iteration completes one prefix and termination returns its nonempty total; no erroneous final −1. For fixed alphabet/modulus, the loop does fixed work per character, O(n) time and O(26)=O(1) auxiliary space. The displayed baseline really scans every position for every nonzero mask; O(n·2^n) time and its stated O(n·2^n) stored-character upper bound are safe. Teaching sets/history are explicitly excluded from the submission's space bound.

Visual-to-code mapping independently checked at ab→aba: rendered old total 3, old a count 1, new 4 and final 6 correspond to `index=0`, then the three assignments. At prefix aba inside preset abab, the same values appear while the result explicitly says it is not the whole-input answer. At abca the full ledger is 0,1,3,7,14 with a replaced 1→8; b remains 2 and c remains 4. This checks before/after semantics and excludes a final-answer value being paired with an intermediate identity.

## Test inspection and safe executions

Inspected all three test programs and README **before** running them. They honor `OUTPUT_DIR`; browser screenshots/downloads/native zoom extension and profile go there, not into tracked candidate evidence. Used the exclusive directory for every emitted artifact. Numerical tests execute canonical Python and the baseline extracted from HTML. Core tests independently enumerate prefix sets, verify group membership, pair shapes and duplicate-key detection. Browser tests compare original source exactly and exercise actual clipboard actions; they do not infer comprehension from assertion counts.

Commands run from repository root (all exited 0):

- `OUTPUT_DIR="$PWD/specs/reviews/940-evidence/940-review-1-e4da4b0e" python3 -B leetcode/940/tests/numerical.py` — 10,083 checks, pass; `numerical.json`.
- `OUTPUT_DIR="$PWD/specs/reviews/940-evidence/940-review-1-e4da4b0e" node leetcode/940/tests/core.cjs` — 24,627 prefix checks, 79 bilingual keys, pass; `core.json`.
- `OUTPUT_DIR="$PWD/specs/reviews/940-evidence/940-review-1-e4da4b0e" node leetcode/940/tests/browser.cjs` — 38 recorded states, 30 screenshots, no page/console/HTTP errors; `browser.json`.
- **Required metadata preflight:** `python3 -B scripts/register_leetcode_lesson.py 940 --validate-only` — exit 0, no output. No registration run. Metadata complexity is exactly the nonempty string `O(n) time; O(26) = O(1) auxiliary space`.

The supplied checks remain author-written programs rerun independently; they supplement the cold reading and independent calculations above.

## Browser, bilingual, access and source-transfer evidence

Chromium 156.0.8078.4 on Linux, using NODE_PATH and the provided `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Both locales and all six presets were exercised. Advertised answers and each prefix count matched independent enumerations. Initial previous/reset and terminal next/end disable correctly; reset, complete, rewind/replay reproduce the exact state. Prediction choices 11/10/9 produce the proper explanations; changing a choice hides the explanation. Locale switching preserves answer selection, reveal state, trace and prefix. A separate independent 320px run verified that changing preset retains a revealed correct abba answer while restarting only the trace, then used Space/Enter to reach aba inside abab. A zh→en→zh roundtrip preserved its 3−1+4=6 calculation and the independent prediction.

Reviewed the actual Chinese and English definitions, proof, formula, calculation, empty/partial/final labels, correct/incorrect feedback, Python mapping and copy-fallback message against their states. Formula is a complete `[zh,en]` pair consumed by the shared helper; no truncated formula or semantic key collision. Duplicate-key test covers all 79 dictionary entries before JS overwrites could hide a duplicate. Visible H1 and document titles include #940 and the appropriate localized title across widths/roundtrips, with the correct official URL.

Exact source fidelity passed without `trim()` or normalization: canonical Python, decoded offline mirror, rendered code via `textContent`, successful native clipboard write, manual fallback textarea and actual transferred clipboard text, and both downloaded files including final newline. For **each** fallback attempt in each locale (two attempts each), the browser test seeded and read back a fresh distinct non-source sentinel, then denied automatic writes, invoked the actual Copy button, checked focus/full selection, pressed **Control+C on Linux**, and read back the exact source. `download-en.py` and `download-zh.py` in this directory equal canonical bytes. Offline file mode renders the same source. Storage denial does not break locale control. No test-written source was substituted for native fallback copying.

Keyboard evidence: Enter/Space operate next; Tab from next reaches reset; visible 3px solid orange focus ring; forced-colors focus retained. The narrow Python block supports keyboard horizontal scrolling (ArrowRight moved scrollLeft 0→40). Related links were activated with Enter at 320px in zh/en/zh. Read the served destinations: #115 step0 teaches counting position choices even for identical text; #552 step2 aggregates disjoint prefix counts in six states and explains why final-character transitions do not overlap. Their bilingual labels truthfully describe that content. Destination source hashes and excerpts are in `browser.json`; this is local-preview navigation evidence, not deployment verification.

Layout checks cover 320/390/736/1440 CSS px in both locales, plus cold 1280 desktop. Native Chromium zoom was set to 2 through the tabs API: outerWidth 1280, innerWidth 640, devicePixelRatio 2. Dense abca sets, ledger, selected preset, equations, prediction feedback and disabled controls remain readable in inspected images. Narrow table headings wrap into their own columns, with all numbers visible and no label/value intersection. Native closed preset at 320px shows `abca → 14` fully; measured text 78.096px + padding 30 + arrow allowance 24 fits its 256px client width. Font stack: PingFang SC, Microsoft YaHei, system-ui, sans-serif; exact resolved font not inferred. Sticky navigation scrolls horizontally; partial nav items at the viewport edge are scroll-position behavior, not clipped essential state. Page and history-table overflow assertions passed.

Contrast helper was inspected and calibrated against black/white (21), RGB primary luminances .2126/.7152/.0722 and #747474 on black≈4.492948 (below 4.5). Actual measured text-role ratios were all ≥6.449407898769069 against the three solid backgrounds. Disabled next uses rgb(154,167,184) on rgb(28,35,48), opacity 1; screenshot inspection confirms legible text. Focus/active colors also passed their applicable checks. This is solid-token evidence, not certification of every possible composited/transparent surface.

Inspected these saved captures with the image viewer: `cold-desktop.png`, `trace-en-320.png`, `table-en-320.png`, `table-zh-320.png`, `trace-zh-390.png`, `prediction-zh-390.png`, `preset-zh-320.png`, `zoom200-en.png`, `zoom200-zh.png`, `independent-middle-320.png`. Other generated captures remain available as supplemental evidence; their presence alone is not a score basis. Viewport captures may begin partway through a section because of deliberate scrolling; table crops and the settled independent intermediate capture distinguish that from content clipping.

## Findings and scores

**Required open IDs: none.** No prior required finding is being closed. One optional teaching refinement is recorded with a stable ID:

**940-ADV-01 — baseline Python syntax assumes extra knowledge (advisory, open).** Revision as above; section 02, both locales, any viewport, default aba. Read the mask baseline after its keep/delete explanation: `1 << i`, `mask & ...`, a generator expression, join and set are used without a worked bit-level interpretation. Expected for maximal ease with this reader: a short explanation connecting one mask to concrete kept positions. Actual: the prose defines mask and gives all results, so the combinatorial baseline and saved-work bridge remain independently reconstructable; the optimized submission needs none of these operations. Severity: minor, optional; owner: lesson author; next action: consider annotating one mask. Fix revision/regression: not applicable; no required repair or acceptance dependency.

| Dimension | Score | Weighted points | Observation/rationale |
| --- | --- | --- | --- |
| Problem/terms/hand calculation | 4/4 | 15 | Tiny aa precedes abstraction; deletion, distinct strings, positions, nonempty and remainder are defined and hand-checkable. |
| Causal derivation/saved work | 4/4 | 20 | Explicit enumeration cost, doubling counterexample, concrete ab→aba sets, uniqueness and old-group containment establish why replacement saves work. |
| Maintained state/correctness | 4/4 | 20 | Initial state, completed-prefix invariant, disjoint groups, old dependencies, modulo boundary and termination reconstruct independently; executable checks agree. |
| Interaction/visual meaning | 4/4 | 20 | Actual before/after counts, retained prefix ledger and current marker agree; partial/final distinction, rewind, reset and changed prediction work. |
| Python/cost | 3/4 | 11.25 | Canonical interface, exact transfers, update mapping and actual costs are clear and executable. Minor friction from unexplained bit syntax in baseline (940-ADV-01) for this target reader. |
| Bilingual/device | 4/4 | 10 | Equivalent causal text and preserved state; narrow dense states, native zoom, keyboard, source scrolling, focus, contrast and readable disabled controls observed. |
| **Total** | | **96.25/100** | Every dimension ≥3; no required open finding. |

## Conclusion and limits

**Accepted for independent lesson review at candidate 4d65eab80efc4cff1f122918d021f0c9e308e686.** Acceptance is based on the saved source-blind cold walk, independently checked mechanisms and examples, actual canonical execution, exact transfer, source identity and browser evidence. The optional baseline annotation does not obstruct the core causal bridge. Metadata preflight passed.

This review does not claim real novice comprehension, a successful LeetCode submission, production publication, physical-device testing or cross-platform font/clipboard coverage. Custom input and modular wraparound were code checks; the preset-only UI explicitly limits its scope. Browser access evidence is Linux Chromium. No implementation, shared files, tests, author evidence, Git settings or services were changed; only this report and this run's exclusive evidence directory were written.
