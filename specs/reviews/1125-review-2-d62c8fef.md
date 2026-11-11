# Independent review: 1125 Smallest Sufficient Team

Candidate: `14f1dbf6c8b859e9ed92604d82b5b9fc0e47987b`. URL: http://127.0.0.1:18770/leetcode/1125/. Target: basic Python, lists, loops, functions, elementary recursion. Reviewer identity/model identifier: unavailable; this is a separate review run. Frozen weights: 15/20/20/20/15/10. Python is the applicable canonical language preference.

## Cold walkthrough — recorded before source access

Only the frozen rubric and the rendered candidate have been read. Initial desktop browser: Chromium through Playwright, 1280×900, English. `cold-initial.png` captures the initial rendered page. No brief, tests, prior findings or implementation has been read.

Predictions recorded before operating/revealing:

- Step 1: adding 0, 1, 2 will produce {a}, {a,b}, {a,b,c}; removing 1 will preserve full coverage with [0,2].
- Step 2: the greedy trap's optimum should be [1,2], size two; choosing person 0 first forces three people because e and f have separate remaining owners.
- Step 3: after person 0, only masks 000 and 001 are reachable; after person 1, 000/001/010/011; after person 2, full coverage should store [0,2], and the [0,1,2] candidate should lose. Masks containing c without b must remain unreachable.
- Step 4: choose both [0] and [1] because equal size with different coverage cannot be merged: person 2 completes [0], but [1,2] lacks b.
- Independently chosen custom case (UI offers presets only; later **code check**, not UI): requirements [a,b,c], people [[a,b],[a],[b,c],[]]. Predict minimum size two, e.g. [0,2] or [1,2]; empty person adds nothing.
- Independent counterexample to keeping only one team per size (**code check**): requirements [a,b,c], people [[a],[b],[a,c]]. If the second singleton replaces the first, [1,2] works; retaining only [0] misses b. Predict [1,2].

Initial reading: Step 1 states inputs, indices, union and sufficient/minimum clearly and starts from a tangible three-person example. Step 2 explicitly works pairs, explains same-coverage dominance, defines subset enumeration and gives both bounds and a greedy counterexample. Step 3 defines bits, masks, OR, DP, unreachable vs empty, and the frozen previous round before asking for operation. Step 4 is a different-coverage transfer question. Step 5 explains Python operators, copying, interface, cost and boundaries. These observations concern visible prose, not verified behavior yet.

Cold operation results (saved before opening source):

| Step / question | Action | Observable result | Causal conclusion in my words |
|---|---|---|---|
| 1: who can stay home? | Apply all four operations | History retains [0]/{a}, [0,1]/{a,b}, [0,1,2]/{a,b,c}, then [0,2]/{a,b,c}; missing skills disappear as predicted. | Person 2 supplies b as well as c, so person 1 contributes nothing unique; no singleton suffices, proving minimum two. |
| 2: what work can be saved? | Read pair enumeration; select Trap and process all people | Trap returns [1,2], size two; final comparisons reject [0,1,2] against [1,2]. | The greatest immediate coverage can require extra people later. Equal coverage, rather than equal size, makes future additions equivalent. |
| 3: which states survive? | Process Hand one person at a time | Reachable counts 2,4,6; full mask changes Unreachable→[0,2] in round three. All four source attempts are listed. [1,2] loses to [2] at 110; [0,1,2] loses to [0,2] at 111. 100/101 remain unreachable. | Frozen sources prohibit reusing this person within the round. Destination comparisons may see an earlier update this round; before-round cards and stored-before-comparison serve different roles. Stars identify updates, while lists/masks are data. |
| 4: may equal-sized teams be merged? | Select both teams, then reveal | Correct feedback computes [0,2] full and [1,2] missing b; keeping only [0,1] costs three. | Different coverage predicts different future usefulness, even at equal size. This exercise tests the choice of DP key, not the preceding numerical answer. |
| 5: how does Python implement this? | Open Python disclosure and read displayed source | `before=list(dp.items())`, OR merge, strict size comparison and `team+[i]` match the final-round explanation. | Source 001/[0] plus person 2/110 makes 111/[0,2]; allocating a list prevents old teams changing. Runtime verification remains for the source audit. |

All browser results matched the preregistered predictions. Screenshots were captured and the final-round full-page image inspected: visible step order, coverage cards and comparison text are coherent on desktop. Preset-only UI means independently chosen custom inputs remain pending code checks. Cold walkthrough is now complete; source and other materials may be opened.

## Candidate identity and official contract

HEAD equals the requested candidate. The tracked checkout was clean before review outputs, and only this report/evidence directory was created. Normal HTTP fetches of index.html, app.js, core.js, copy.js, python-code.js, solution.py, local style.css, ../common.js and ../style.css all returned 200 and matched checkout bytes exactly. Identity hashes (SHA-256):

| Asset | Hash |
|---|---|
| index.html | 2fa1ea67aa08d59e4900fef6cc248ffef0905bc9e1c92b1870fe599d03d3975b |
| copy.js | 3023a8bcc1a614aae091f8757db3cece3d53e107940994b09217c47f50bf0239 |
| app.js | fed057cc659210b229bf85204ae8ff24140911845641c1bfe729021d66ff1fd5 |
| core.js | 09e95c51ecf6e4301acfa7329ad1e12bfd336b3a743ef696fde68d6934a06f42 |
| solution.py | 7a2969e4a224a412888915821df9d0b0f56a50aead6a7929cb3a45f563bbe6e0 |
| python-code.js | 788a8dd020c492d0d7f25d702ec326149158304eadde1f33ebc86aea432c4dbd |
| style.css | e2027e5a3e568810779261680c94d2c0c289e12e17b870b1369657fcb31ca754 |
| ../common.js | f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b |
| ../style.css | 6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27 |

Read the public [official statement](https://leetcode.com/problems/smallest-sufficient-team/) normally through the web tool after the cold walkthrough. It was accessible without bypass. The requested minimum-size list of person indices, arbitrary answer order, existence guarantee and examples agree with the lesson. Official bounds are 1–16 required skills, 1–60 people, 0–16 skills per person, unique skills within each list, lowercase names of length 1–16, and every person's skill belongs to the requirements. The lesson-local saved official response corroborates these and provides the Python3 `Solution.smallestSufficientTeam(self, req_skills: list[str], people: list[list[str]]) -> list[int]` interface. The canonical source matches it. No successful LeetCode submission is claimed.

Read LANGUAGE_FILES in scripts/register_leetcode_lesson.py: Python maps to solution.py, python-code.js and PYTHON_SOURCE, the actual files/export here. This is a faithful original Python solution. Non-Python language-contract requirements and the exact-six JavaScript exception do not apply.

Applied the rendered-state supplement only after saving the cold walkthrough. Read canonical source, HTML, copy, styles, shared locale consumer and tests before executing their relevant checks. No author explanation was needed to supply the cold causal bridges. Earlier report was opened only after the cold record was saved.

## Independent execution, invariant and costs

The fresh custom case returned [0,2] in actual canonical Python; independent combinations/set-union enumeration confirmed minimum size two and also allowed [1,2]. The core simulation returned [1,2], an equally valid answer. Different iteration orders can retain different tied teams, as the page allows. The independent counterexample returned [1,2], uniquely minimum. Both preserved input lists. These are **code checks**, because the browser supports presets only. Additional independent canonical executions returned [0] for m=16,n=1 with all skills in one person and [59] for m=1,n=60 with 59 empty people followed by the skilled person, with inputs unchanged.

The invariant is: after k people, each reachable exact coverage stores a shortest team from indices below k. Initially only coverage zero is reachable. For a next-prefix team omitting i, its state already exists. For one including i, remove i; replace the remainder with the shortest previous-prefix team of the same coverage; add i back. Coverage is preserved and size cannot increase. Every candidate constructed is legal, so minimizing these candidates attains the true optimum rather than merely bounding it. After n rounds, the full mask exists by the official feasibility guarantee.

Visual-to-code mapping checked: Hand round three, source 001/[0], person 2/110, `merged=mask|person=111`, `len(team)+1=2`; save `[0,2]`. The later 011/[0,1] source constructs `[0,1,2]` and loses to the current destination `[0,2]`. The card's before-round destination is still Unreachable, while the later attempt's incumbent is `[0,2]`; these label different instants correctly. Masks 100 and 101 remain unreachable because every c supplier also supplies b. Snapshot entries come from `list(dp.items())`; this is a shallow entry copy, safe because `team+[i]` allocates a new list and the old lists are never mutated. Inputs are only read. Duplicate/empty-skilled people cannot improve unchanged coverage. Ties are permitted; a later full-skilled person can replace a two-person team.

Costs were checked against the actual loops, not timings: building masks costs O(L), where L counts person-skill entries. At most 2^m previous coverages are scanned for each person. Accepted team copies have at most m indices: every member of a minimum team must have a skill not supplied by its other members, or removal would improve the team. Time O(L+n·m·2^m), auxiliary space O(m·2^m+m), including snapshot entries and lists retained during the round, are valid upper bounds. The m-entry skill dictionary is included. With official m≥1, empty-skilled people still incur bounded per-round work even when their L contribution is zero. The baseline really enumerates combinations and set unions, with O(2^n·n·m) time and O(n+m) auxiliary space. The browser history's O(n·m·2^m) storage is explicitly distinguished from submission space. Impossible instances and empty required-skill lists are correctly outside the official contract.

## Browser operation and access audit

Browser: Chromium 156.0.8078.4, headless Playwright on Linux, NODE_PATH packages; executablePath uses PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when set. Both locales were operated. Preset minimum sizes independently enumerated by set union are Hand 2, Ex.1 2, Empty 2, Full 1, Trap 2, Ex.2 2, One 1, Later 1. Observed final teams were respectively [0,2], [0,2], [1,3], [0], [1,2], [1,2], [1], [2]. Every forward round was rewound and replayed with identical card text; reset restored initialization; end reproduced the endpoint. Initial previous/reset and final next/end were disabled. Hand history rewound to its initial state.

Later's final full-coverage card shows **before [0,1] → after [2]**, so improvement is concrete. Full coverage before termination is labeled optimum among processed people only; the endpoint explicitly says final minimum. A starred person row identifies the just-processed person; starred cards identify changed states. They are separate objects with explicit text labels. At Hand's endpoint, unchanged reachable cards 001/010/011 are distinguishable from changed 110/111; numeric masks and teams remain visible regardless of highlighting.

All three prediction options were revealed in both languages. Option 1 gives Correct/正确; options 0 and 2 give Reconsider/再想一想. Explanations retain the actual missing b and two-versus-three-person calculations. Selecting a different answer hides stale feedback. Changing the trace preset preserves this exercise because its separately stated four-skill input is fixed, rather than silently rebinding it to the trace. Switching language preserves selected answer, revealed feedback and trace state. A separate 390px check preserved two hand-history operations through zh/en switching and final-round rewind/replay, and operated Next with keyboard Enter.

Representative binding evidence at Hand round three, 390px, zh→en: the complete formula contains `merged = mask | person`, the absent-destination case and `len(team)+1 < len(dp[merged])` in both locales. The 111 card renders Unreachable/未覆盖 → [0,2]; attempts show candidate [0,1,2] versus incumbent [0,2] and correctly reject it. The Chinese proof, bit/OR derivation, copying explanation and costs express the same causal argument as English. The shared locale consumer expects [zh,en] pairs; Acorn duplicate-key detection and pair-shape validation passed for the lesson's namespace. Algorithm feedback and clipboard fallback use distinct correctly bound entries.

Exact source parity passed for canonical solution.py, decoded offline mirror, displayed code through textContent, copied text and downloaded bytes, including final newline and indentation. Both locales exercised automatic copy and native manual fallback. **Before each fallback attempt**, the test wrote a distinct non-source clipboard sentinel and read it back, then denied automatic writes, invoked the real Copy button, checked focused textarea/full selection, dispatched Linux Control+C, and read back the exact canonical source. No normalization or test-written source clipboard value stood in for the transfer. Storage-denied language operation and offline embedded-source access also passed.

Keyboard checks exercised ArrowRight between radios, Tab to Reveal, Enter to reveal, Space on a focused radio and Enter on Next. Focus uses a visible 3px outline; forced-color and reduced-motion paths were checked. The tested viewport widths were 320,390,736,1440, in both locales at CSS zoom 1 and 2. This is reproducible **200% layout magnification**, not physical-device or native browser-menu zoom verification. No page-wide overflow was observed; all closed preset labels passed the 24px arrow-reserve measurement. Recorded font stack: PingFang SC, Microsoft YaHei, system-ui, sans-serif; exact resolved native fonts and other platforms are not established.

Personally inspected this run's screenshots: cold-final-round.png; en-1440-zoom1-coverage.png; en-320-zoom2-coverage.png; zh-320-zoom1-coverage.png; zh-390-dense.png; en-390-endpoint.png; en-320-zoom2-prediction.png; zh-320-zoom2-header-confirmed.png; zh-bounds.png. Cards keep headings, exact before/after values and long identifiers associated through wrapping; disabled controls remain readable. No actual label/value text intersection was observed. Scrolled screenshot edges/sticky navigation cropping were not treated as text collisions. At 320px/200%, the content is readable but requires extensive vertical travel. Dense 64-card states also put substantial distance between people, state and controls. This is minor interaction/device friction, not a required correctness defect.

Contrast was checked using the actual helper extracted from the browser test, independently calibrated against black/white=21, red/green/blue luminances .2126/.7152/.0722 and #747474 on black=4.492948073111701 (correctly failing 4.5). Recorded rendered ratios include disabled Next 6.4494, hints 7.0789, card headings 10.9101, card values 13.3971 and focus outline 8.9372. These are solid-color checks, not a universal accessibility certification. Correct bilingual H1/document identity and official URL were asserted at narrow widths through zh→en→zh with Later's endpoint and revealed prediction preserved.

Related links were keyboard-followed in both languages. Local #step3 explains exact-coverage equivalence; #step4 contrasts equal-sized teams of different coverage. The served #691/step2 explains reusing missing-letter counts while permitting repeated stickers; #1092/step3 explains suffix-length states and shortest-supersequence reconstruction. The observed destination prose supports the labels; this is local-preview navigation evidence, not publication verification.

## Safe test execution and metadata gate

All test files were inspected before running. Every generating test used `OUTPUT_DIR="$PWD/specs/reviews/1125-evidence/1125-review-2-d62c8fef"`; Node commands used NODE_PATH. No tracked candidate assets, author evidence or earlier review evidence were regenerated.

| Command from repository root | Actual result |
|---|---|
| `python3 -B leetcode/1125/tests/test_solution.py` | Exit 0; 4,296 feasible oracle cases, two maximum-size cases and extracted displayed baseline executed. |
| `node leetcode/1125/tests/test_core.cjs` | Exit 0; 4,304 cases, 21,617 prefix frames and 44,834 candidate events checked against independent exact-coverage subset enumeration; duplicate keys and exact mirror passed. |
| `node leetcode/1125/tests/browser.cjs` | Exit 0; 42 recorded groups, 32 screenshots; behavior, parity, both native fallbacks, widths/zoom, keyboard, contrast and navigation passed. |
| `node leetcode/1125/tests/header.cjs` | Exit 0; narrow title/state locale roundtrips passed. |
| `node leetcode/1125/tests/review_r1.cjs` | Exit 0; both rendered bounds paragraphs, Trap and actual Python m=16,n=1 passed. |
| `python3 -B scripts/register_leetcode_lesson.py 1125 --validate-only` | Exit 0, no stdout. Run from repository root. No registration performed. |

lesson-entry.json complexity is exactly one nonempty string: `O(L + n m 2^m) time; O(m 2^m + m) auxiliary space, with m skills, n people, L input skill entries`. Its shape and mathematical interpretation pass. Counts above establish tested coverage, not scores or measured comprehension.

## Earlier finding and closure

**1125-R1 — Incorrect comparison of input parameter counts. Severity: moderate, required teaching/mathematical correction. Status: closed for this candidate.**

Original candidate: 07cc0f1656abea6764b0716165a7cdd501299a3a. Original report: [1125-review-1-b4279a73.md](1125-review-1-b4279a73.md), retained unchanged. Original reproduction: step 2, Chinese, 1280×1000, read baseline-cost paragraph; actual “m 是技能数，比人数小” asserted m<n. English “the smaller skill count” was ambiguous. Expected: compare official upper bounds, not assert the input counts are always ordered. Violated frozen requirements: mathematical accuracy, causal derivation and equivalent bilingual reasoning. Trap m=6,n=3 and valid m=16,n=1 refute the former premise.

Fix revision: 14f1dbf6c8b859e9ed92604d82b5b9fc0e47987b. Runtime diff from the original candidate is the bilingual baseCost paragraph and copy.js query-version update; other changed files are documentation/tests/evidence. Actual current paragraph explicitly says m≤16,n≤60 **does not guarantee m<n**, names both refuting examples and compares 65,536 possible skill coverages with at most 2^60 person subsets. Independently read both rendered paragraphs, inspected zh-bounds.png, reran the focused regression at desktop and 320px/zoom 1 and 2, observed Trap [1,2], and separately executed actual canonical Python at m=16,n=1 to get [0]. Evidence: this run's r1-results.json, zh/en-bounds.png and narrow bounds captures. Expected and actual now agree. Owner next action: none for this finding. Reviewer recheck complete; closure applies only to this frozen candidate. No new required findings were reproduced.

## Scores and conclusion

| Dimension | Weight | Score 0–4 | Observation-based rationale |
|---|---:|---:|---|
| Problem/terms/hand calculation | 15 | 4 | Concrete union/redundancy history precedes abstraction; actual indices, sufficiency, minimality and bounds are explicit. |
| Derivation/saved work | 20 | 4 | Pair enumeration, same-coverage future equivalence, greedy trap, bounded coverage count and inclusion/omission proof are reconstructable; R1's false premise is removed. |
| Maintained state/correctness | 20 | 4 | Exact-prefix invariant, all four final-round comparisons, frozen dependencies, unreachable masks, boundaries and termination agree with independent execution. |
| Interaction/visual meaning | 20 | 3 | Predict/reveal/change, rewind/reset/end and explicit before/after semantics work; dense states require lengthy travel between input/cards/controls. |
| Python/cost | 15 | 4 | Faithful executable interface, concrete OR/list bridge, independent custom inputs, no mutation, exact transfers and copy-aware cost bounds all verified. |
| Bilingual/device | 10 | 3 | Equivalent causal reasoning and preserved state; keyboard, contrast and narrow/200% content work, with substantial wrapping/scrolling at the smallest magnified width. |

Weighted total: **92.5/100**. Every dimension is at least 3. Required open IDs: **none**. Outcome: **accepted** for the identified candidate and local preview. This is separate from publication.

Limitations: no measured human comprehension, successful LeetCode submission, physical-device/native browser-menu zoom test, other-OS font guarantee, full screen-reader audit or public deployment verification is claimed. The Python interface is corroborated by saved official evidence; the public statement was independently accessible. No implementation, service, workflow, shared file, prior report or prior evidence was edited.
