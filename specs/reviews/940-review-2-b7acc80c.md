# Independent review of #940 — Distinct Subsequences II

Candidate: `8f9e114908f812c6ce1a43d47601917048d3b630`. URL: http://127.0.0.1:18770/leetcode/940/. Run: review-2-b7acc80c. Reviewer: independent Codex review session; exact model identity unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen dimensions/weights: 15/20/20/20/15/10. Python is the preferred original submission language for this algorithm problem.

## Cold walkthrough (saved before source, contracts, tests, prior reviews or author notes)

Only the frozen rubric was read before opening the candidate using real Chromium through Playwright. Desktop viewport 1280×900. Screenshots: `940-evidence/940-review-2-b7acc80c/cold-desktop.png`, `cold-aba-end.png`.

| Teaching step / question | Action | Observable result | My causal paraphrase |
|---|---|---|---|
| 01: What does distinct nonempty subsequence mean for aa? | Read definitions; enumerate keep-first, keep-second, keep-both; click hand reveal. | Reveal lists a, a, aa, merges equal a, excludes empty; answer 2. | Positions identify choices, but equal resulting strings count once; order must survive deletion. Bounds and modulo are explained in ordinary language. |
| 02: How do we enumerate without missing anything, and why is doubling wrong? | Read eight position choices for aba and baseline; manually deduplicate. | Six strings remain; baseline scans n positions for each mask. aa explicitly refutes 2·total+1. | Enumeration repeats construction of identical strings; counts must remove the old same-ending overlap. “Mask” is introduced as keep/delete choices, though bit syntax is advanced for this target. |
| 03: Which group changes, and why replacement? | Read concrete ab→aba sets, then press Append three times from empty. | Prefix totals 0→1→3→6; a group 0→1 then 1→4, b 0→2 and unchanged at final step; final sets a={a,aa,aba,ba}, b={ab,b}. | Appending a maps each previous string plus empty injectively into a-ending strings, including every old a-ending string. Other final-letter groups cannot collide. Replace a rather than add both old and new a groups. |
| 03: What is stored and what does history mean? | Undo final letter; compare ledger. | Returns to ab, total 3 and groups 1,2; future aba row disappears; earlier completed prefixes remain. ◆ marks selected prefix, rather than a numeric count. | Each frame is after a complete character update. Rewind restores its snapshot; history shows completed prefixes through the selected point. |
| 03: Can the same rule transfer to a longer preset? | Before reveal explicitly predict abca totals 0,1,3,7,14, final a group 1→8; select abca and complete. | Ledger exactly matches predicted sequence and 7−1+8=14. | Unseen c first creates a new disjoint group; later a replaces the earlier singleton group. |
| 04: Can I apply replacement at a different repeated position? | Work abba as 5−1+6=10, choose B, verify, then change to A. | Correct explanation shows six a-ending strings, b retains four; changing choice hides explanation and asks to verify again. | The exercise tests transfer to adjacent b repetition and replacement of a. 11 forgets subtraction; 9 subtracts twice. This run's explicit before-reveal terminal prediction was recorded for abca; the abba arithmetic here is my reconstruction, not a separately timestamped prediction artifact. |
| 05: How does the diagram become submission code? | Read canonical-looking Python listing and map ab→aba. | index=0, new=4 computed before total=6, ending[0]=4 last; modulo and fixed 26-cell storage explained. | Old total and old ending are dependencies; changing order would consume a new value too early. Simulation sets/history are distinguished from count-only submission memory. |
| Language continuity | Switch to Chinese while rewound to ab and with changed prediction choice. | Same prefix/groups, selected answer, revealed hand calculation preserved; explanation stays hidden after answer change. | Locale changes presentation without resetting experiment or prediction. Chinese preserves the causal group argument and cost explanation. |

Independently chosen fresh input **bcb**: before any custom execution predict six strings `{b,c,bc,bb,cb,bcb}`, prefix totals 1,3,6. Counterexample **cc**: predict 2 (`c,cc`), whereas unconditional doubling gives 3. The UI offers presets only; these will be **code checks**, not custom UI experiments. Neither case appears in the preset list. The invariant I reconstruct is that all groups partition the distinct nonempty strings of the processed prefix; the implementation stores their residues, and the total is their modular sum. Initialization is empty groups; termination is after the last character. No author explanation outside the rendered lesson supplied a missing bridge.

Cold phase complete. Source and contract audit follows below.

## Source, interface, and candidate identity

After saving the cold walkthrough, read the rendered-state contract, actual HTML, `copy.js`, `core.js`, `app.js`, CSS, shared locale helper, canonical Python, offline mirror, metadata, official provenance, test programs, previous review and copy-repair request. No BRIEF or author self-check supplied the cold explanation.

`git rev-parse HEAD` returned the requested candidate. Independently fetched all eight lesson runtime/metadata assets plus shared `common.js` and `style.css`; every response matched checkout bytes. Exact SHA-256 receipts are in [independent.json](940-evidence/940-review-2-b7acc80c/independent.json). Key current identities:

| Asset | SHA-256 |
|---|---|
| index.html | `5e7264aa5c2d9464797587c04c8069899ae6bc43d4bd1d5526d0e88a0ae67f78` |
| copy.js | `01289f0dbf58facd3dadfb2200657ab3817fd4343b33c4790032029595242b12` |
| solution.py | `55fce8a63ac723d74be619500fdbfcb23c2eaa712d24c118974bd7f88ff53db4` |
| app.js | `30273f051166f24883089dd119777161ba912f830213e08bf377351ec69d203b` |
| core.js | `3cea959f00aff9baab4c395265f507d404e69d29c10063fb3fe7136c2d703267` |

Read the [official statement](https://leetcode.com/problems/distinct-subsequences-ii/) normally through the web reader: distinct nonempty strings, order-preserving deletion, modulus 10^9+7, examples abc=7/aba=6/aaa=3, and bounds 1…2000 lowercase letters all match. No access bypass or submission. Lesson-local official provenance supplies Python3's original `class Solution` / `distinctSubseqII(self, s: str) -> int` skeleton, matching the canonical callable's string-to-integer semantics. Live statement extraction did not expose the editor selector; the special non-Python language-contract verification is inapplicable because this lesson uses faithful Python, with no alternative submission or analogy advertised. No `supportedLanguages` contract is required for this Python case. Read `LANGUAGE_FILES`: Python maps exactly to `solution.py`, `python-code.js`, and `PYTHON_SOURCE`.

The actual Python loop computes the replacement before changing the old total or old group count, uses 26 slots indexed by `ord(char)-ord('a')`, normalizes subtraction with `%`, and returns the already-nonempty total. It allocates fresh local counters for each invocation and does not mutate the input string. The mathematical invariant is exact group counts; the submission maintains their residues, with addition/subtraction preserving the invariant modulo the fixed modulus. Zero initialization, each completed character, and final return are justified by the visible proof.

The simulation constructs actual string groups and deep-copies each completed frame. It is correctly labeled a JavaScript teaching simulation, retaining strings/history rather than Python execution. Its counts agree with the canonical algorithm on the offered small inputs. Rewind renders a saved earlier frame and removes future rows from the displayed ledger; replay recovers the same rows. There are no hidden partial updates represented as completed state.

## Independent numerical and cost checks

Executed the **actual canonical file** via `exec(compile(read_bytes(), ..., 'exec'))` and called `Solution().distinctSubseqII`, independently of core.js. A separately written position-combinations oracle checked all **3,279 nonempty strings over acz through length 7**. Fresh code checks match the pre-source predictions: **bcb=6**, **cc=2**. The latter excludes the tempting duplicate single c; unconditional doubling gives 3. Further checked z=1 (last array index), all 26 different letters=67,108,863, a repeated 2000 times=2000, and ab repeated 1000 times=694,708,213. The last case was checked against a separate exact-integer, empty-inclusive prefix recurrence subtracting the prefix before the prior occurrence; modulo was taken only at the end of that oracle. Evidence: `independent.json`.

Before/after dependency check: ab has ending[a]=1, ending[b]=2, total=3. Adding a computes new=4, total=3−1+4=6, then overwrites ending[0]=4. At abca, old total 7 and old a count 1 become new a count 8 and total 14; other groups remain 2 and 4. All these values and their units agree between formula, table, sets and final result in both locales.

The optimized cost claim is valid: one pass of n letters, constant modular work per letter, 26 fixed-modulus counts and scalar temporaries, hence O(n) time/O(1) auxiliary space. At n=1 the initialization remains constant; at n=2000 counts remain bounded residues. The baseline really does scan n positions for each mask, construct strings and deduplicate them; O(n·2^n) time and O(n·2^n) stored-character upper bounds are safe. It is explicitly separate from the submission and from retained teaching history. No timing or test count is used as proof of complexity.

## Inspected tests and observed browser regressions

Read `numerical.py`, `core.cjs`, `browser.cjs`, and `copy-r1.cjs` before running. All output directories were explicitly redirected into this review's exclusive evidence directory. Tests import the canonical file with bytecode disabled; browser zoom extension/profile files are created under the redirected output and removed by the tests. No tracked candidate assets or earlier evidence were regenerated. Result documents retain their original “author self-check” type label because these are existing author-authored harnesses rerun by this reviewer; they supplement the independent reasoning above.

Commands run from repository root (E = `$PWD/specs/reviews/940-evidence/940-review-2-b7acc80c`):

- `OUTPUT_DIR="$E/numerical" python3 -B leetcode/940/tests/numerical.py` — exit 0, 10,083 checks passed, including canonical execution and length-2000 cases; `numerical/numerical.json`.
- `OUTPUT_DIR="$E/core" node leetcode/940/tests/core.cjs` — exit 0, 24,627 prefix checks, 78 translation keys; `core/core.json`. Inspected duplicate-key detection before parsing: regex covers this dictionary's unquoted alphanumeric key syntax, including comma-separated entries; count matches parsed namespace. All consumed entries are two nonempty strings.
- `OUTPUT_DIR="$E/browser" PREVIEW_ROOT=http://127.0.0.1:18770 node leetcode/940/tests/browser.cjs` — exit 0, 38 recorded states, 30 screenshots, zero page/console/HTTP errors; `browser/browser.json`.
- `OUTPUT_DIR="$E/copy" PREVIEW_ROOT=http://127.0.0.1:18770 node leetcode/940/tests/copy-r1.cjs` — exit 0, 11 recorded states, zero errors; `copy/result.json`.
- **`python3 -B scripts/register_leetcode_lesson.py 940 --validate-only` — exit 0, no stdout.** Repeated separately to confirm the result. `lesson-entry.json` complexity is exactly the nonempty string `O(n) time; O(26) = O(1) auxiliary space`, covering both costs. No registration was run.

Real Chromium **156.0.8078.4**, Linux host. The browser runs observed:

- Both locales, all six presets, each completed prefix independently compared with position-mask enumeration, exact rewind/replay, reset and disabled endpoints. Complete results were 6,7,3,1,11,14, matching selector labels. Initial/partial totals are explicitly marked as not yet whole-input answers.
- Full rendered formula in both locales: `new = total + 1; total′ = total − ending[c] + new; ending[c] = new`. Correct and incorrect abba feedback consistently refers to total 10. Changing an answer hides old feedback. Changing the trace preset restarts it while preserving the independent quiz, as documented. Locale roundtrips preserve trace, selection, reveal state and hand reveal. H1 and document titles match #940 and the localized title.
- Displayed code via `textContent`, decoded offline mirror, successful clipboard, native fallback clipboard, and downloaded bytes match canonical Python exactly, including final newline. Each fallback attempt seeds and reads back a fresh non-source sentinel before automatic writes are disabled; full source is focused/selected and actual Linux **Control+C** transfers it. Broad harness repeats twice per locale; focused harness repeats once per locale. No whitespace normalization. Offline file display and blocked-storage locale operation also passed.
- Enter activates Append, Tab reaches Reset, and a visible 3px solid orange focus outline remains distinct from cyan algorithm state. Forced-colors focus check passes. Copy → Download → both related links are keyboard reachable.
- 320/390/736/1440px both locales: dense abca final sets wrap; all four table columns and current-row ◆ are readable; no document/table overflow. Native selected `abca → 14` fits with the harness's conservative 24px arrow allowance, and its screenshot shows the complete label. Font stack is `"PingFang SC", "Microsoft YaHei", system-ui, sans-serif`; exact resolved fonts are not inferred. Horizontal step navigation is scrollable and may show a partial adjacent tab; this does not clip the essential state.
- Actual browser **200% zoom**, using tabs.setZoom(2), verified DPR=2, outerWidth=1280, innerWidth=640 (not CSS scaling). Complete table, equation, result and changed page-end screenshots remain readable in both locales.
- Disabled Append/Complete at the endpoint use opaque muted text `rgb(154,167,184)` on `rgb(28,35,48)`, with visible labels. The contrast helper was inspected and calibrated on black/white=21, RGB primaries and #747474/black≈4.492948 below 4.5. Recorded solid text role pairs have minimum ratio **6.449407898769069**, threshold 4.5; focus also meets its 3:1 requirement. This covers actual solid token surfaces, not arbitrary overlays.
- Related links followed by keyboard at 320px in zh/en/zh: #115/#step0 explains counting position choices even when strings match; #552/#step2 explains six finite prefix counts and next-day accumulation. These agree with the rendered labels. Destination text and source hashes are retained in `browser/browser.json`; this is local preview availability, not a production claim.

Screenshots were **opened and visually inspected**, including `cold-desktop.png`, `browser/table-en-320.png`, `browser/table-zh-320.png`, `browser/trace-en-390.png`, `browser/preset-en-320.png`, `browser/prediction-zh-390.png`, `browser/zoom200-en.png`, `browser/zoom200-zh.png`, `copy/end-en-320.png`, `copy/end-en-zoom200.png`, and `copy/end-zh-zoom200.png`. The narrow table wraps headings but keeps label/value association; final a group and ledger marker remain clear; the selected preset is complete. No visible state-text intersection or missing operand was observed. Page-end screenshots show preserved boundaries and continuation links with no footer gap or acceptance badge.

## Earlier findings and closure against this candidate

Earlier review `940-review-1-e4da4b0e.md` accepted historical revision `4d65eab80efc4cff1f122918d021f0c9e308e686`; it contained no required open findings. Its minor advisory remains applicable:

**940-ADV-01 — optional, open.** Section 02, both locales, any viewport, default aba: read the baseline after the keep/delete prose. Expected for maximum ease: annotate one bit mask as concrete positions. Actual: `<<`, `&`, generator expression, join and set arrive without syntax-level explanation. The visible eight choices and duplicate example still establish the baseline and optimization causally, while optimized Python avoids bit masks, so this is minor friction rather than a required missing bridge. Owner: lesson author; next action: optionally annotate one mask. Fix revision/regression: none; not an acceptance dependency.

**940-COPY-R1 — closed at `8f9e114908f812c6ce1a43d47601917048d3b630`.** The separate workflow-copy repair request identified the earlier footer in both locales. Original reproduction: open historical lesson, switch zh/en and scroll to page end; learner sees internal author/review status. Expected: remove that workflow footer and unused binding while preserving specific simulation/submission limitations and surrounding behavior. Severity: minor learner-copy repair explicitly selected for revision. Owner: lesson author. Actual current diff against the historical accepted revision removes only the HTML footer and `foot` dictionary entry (with corresponding comma removal), and bumps copy.js URL v1→v2. `app.js`, `core.js`, canonical/mirror Python, local CSS and shared assets are byte-identical to that base.

Explicit new-candidate closure evidence: `copy/result.json` records zh→en→zh footer count 0, absent old workflow strings, unchanged `sim`/`p4`/`boundaries`, no replacement acceptance claim, no orphan footer gap (`bodyEnd == mainEnd`), zero errors, retained trace/quiz and keyboard/source transfers. Inspected changed page end at 320px and native 200% zoom in both languages; source and behavior remain intact. Regression command is the focused `copy-r1.cjs` command above. This closes the request against the actual current candidate; it does not rewrite historical findings or authorize publication.

**Required open IDs: none.** No new required finding was reproduced.

## Scores and conclusion

| Dimension | Score | Weighted points | Observation/rationale |
|---|---:|---:|---|
| Problem / terms / hand calculation | 4 | 15 | aa position choices versus resulting strings, excluded empty case, bounds and modulo are concrete before abstraction. |
| Causal derivation / saved work | 4 | 20 | Enumeration cost and duplicate work lead to vivid ab→aba replacement; injectivity, inclusion of the old group and exclusion of other endings are explained. |
| Maintained state / correctness | 4 | 20 | Initial groups, old/new dependencies, disjoint invariant, modular semantics and final return reconstruct independently; fresh and boundary execution agrees. |
| Interaction / visual meaning | 4 | 20 | Prediction/reveal/change, visible group sets and arithmetic, retained prefix ledger, marker, rewind/reset/endpoints and locale continuity observed. |
| Python / cost | 3 | 11.25 | Actual official callable executes correctly; code mapping, exact source transfers and cost are clear. Baseline bit syntax adds minor friction for the stated reader (940-ADV-01). |
| Bilingual / device | 4 | 10 | Equivalent causal explanations, keyboard and preserved state; narrow dense layouts, selected labels, disabled text, contrast and native zoom checked and inspected. |
| **Total** | | **96.25/100** | Every dimension ≥3; zero required open findings. |

**Accepted for independent lesson review at the specified candidate.** Cold browser reading and canonical execution are both complete; metadata preflight passes. The selected footer repair is independently closed. This is separate from publication.

Limitations: no measured real human comprehension, successful LeetCode submission, production delivery, physical-device testing, other-browser/OS clipboard or font coverage is claimed. Fresh custom inputs and modular wraparound are code checks because the UI is preset-only. Only this exact report and this run's exclusive evidence directory were written; earlier evidence remains intact.
