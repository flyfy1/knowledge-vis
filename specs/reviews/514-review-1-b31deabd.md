# Independent review: 514 Freedom Trail

Candidate: `c6a0413a50394c3aaa4323ef8549fc8d531afd86`. URL: http://127.0.0.1:18774/leetcode/514/. Review date: 2026-10-25. Reviewer: this independent review run; exact model identifier unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen dimensions and weights: problem/terms 15, derivation 20, correctness 20, interaction 20, Python/cost 15, bilingual/device 10. Python official-interface interpretation applies.

## Cold browser walkthrough (saved before repository source audit)

Only the frozen rubric was read before opening the page using real Chromium through Playwright. No BRIEF, repository implementation, tests, earlier review or author evidence was read. Rendered author-check claims were encountered as page content and are not independent evidence. Browser viewport: 1280×900. Screenshots: `514-evidence/514-review-1-b31deabd/cold-full.png`, `cold-counter.png`.

| Teaching step | Question | Action | Observable result | Causal conclusion in my words |
|---|---|---|---|---|
| 01: hand count | What counts as a step, and does pressing reset position? | Read and manually follow abc / ca. | Engraved strip labels positions 0,1,2 and joins the ends; text works (1+1)+(1+1)=4. | Crossing the seam is one rotation; each letter also costs a press; the second move begins at c. |
| 02: nearest letter | Can the cheapest next match be discarded or chosen permanently? | Hand-evaluate abxxcbx / bc from the displayed positions. | b(1) route totals 6; b(5) totals 5. Baseline recursion enumerates endpoints, followed by a same-endpoint dominance explanation. | Future movement depends on where a route stops. Only routes with the same prefix AND endpoint have identical continuations, so retaining only one globally cheapest endpoint is unsound. |
| 03: endpoint ledger | How does the recurrence produce actual before/after values? | Enter c then a for abc / ca; select counterexample; enter b then c; rewind and replay. | Initial {0:0}; c layer {2:2}; ca layer {0:4}. Counterexample b layer {1:2,5:3}; c layer {4:5}; candidates 2+3+1=6 and 3+1+1=5. History retains earlier rows. Rewind restores b and replay restores 5. | Each row stores minimum cumulative cost after exactly that prefix. Nonmatching positions are absent, not zero. Old endpoint costs plus shorter-arc movement plus press enumerate every last move; minimizing separately by destination preserves the invariant. |
| 04: prediction | Can the rule transfer to a longer ring? | Independently calculate displayed abxxxcbxx / bc before clicking 6 steps and reveal. | My calculation: b costs 2 or 4; c costs 7 or 6. Reveal says Correct and explains both routes and the missing-press distractor. | Keeping a more expensive endpoint can improve the complete result; ignoring presses undercounts by two. |
| 05: Python/cost | Where does the visible 5 enter code, and why separate layers? | Expand the rendered Python solution and map the c candidates. | current[target]=best follows comparisons over previous.items(); previous=current occurs after all target positions. Text explains O(m n²) time, O(n) auxiliary space and separate simulation history. | For target 4, best changes from 6 to 5; changing previous too early would mix prefixes. After all letters, minimizing endpoints is sufficient because returning home is unnecessary. |

The lesson gradually moves from a tiny hand calculation to a wrong greedy rule, baseline enumeration, dominance, recurrence, proof and code. “Prefix”, state and invariant receive explanations. Dictionary syntax and enumerate/items may add minor friction for the stated reader; their jobs are explained in prose. No source explanation was needed to reconstruct the mechanism.

### Independent predictions recorded before canonical-source execution

The browser has presets only, so these are forthcoming **code checks**, not custom UI experiments.

* Fresh small input: ring="abac", key="cca". Predict 5: move 0→3 and press (2), press c again (1), move to either adjacent a and press (2). This checks repeated letters and duplicate tied destinations.
* Fresh counterexample: ring="abxxxcbx", key="bc". Predict optimum 5 via b(6): 2+1+1+1. Nearest b(1) gives 1+1+4+1=7. This excludes the tempting rule of keeping only the currently cheapest endpoint.
* Boundaries predicted: a / a = 1; a / aaa = 3; abcd / c = 3 (equal arcs); a repeated 100 times / a repeated 100 times = 100 (all endpoints and ties).

## Source and regression audit

Completed after the cold walkthrough above had been saved. The rendered-state supplement was first read at that point.

### Candidate and official contract

`git rev-parse HEAD` returned the requested revision. Initial and final `git status --short` showed only this report and this run's evidence directory; no candidate file was changed. Direct browser-request byte comparisons verified that the seven lesson assets served on port 18774 equal the checkout. SHA-256 values are retained in [independent-browser.json](514-evidence/514-review-1-b31deabd/independent-browser.json); notably solution.py is `b2ec69b256ba18e8dcabb0a2569a5bb7ae21b87af420225386fcceb543a30993`, app.js is `d180469d3beaa3665bb1fd24f19be1999f654366f80db7c957169fc6cf3ddd01`, and core.js is `6b45793bacfa3c8120ebe0665507ba9656bfc675d14337ad2894c4d93d50781f`.

Opened the [official statement](https://leetcode.com/problems/freedom-trail/) normally through the web tool after the cold walk. Its initial alignment, unit rotations, one press per letter, spellability and 1…100 bounds match the lesson; examples are 4 and 13. No access bypass was used. Inspected lesson-local provenance/official.json, including the Python3 starter `Solution.findRotateSteps(self, ring: str, key: str) -> int`; the actual canonical file preserves it. This is Python, so a non-Python language-contract exception, selector completeness audit and TypeScript compilation are inapplicable. The live text extraction did not expose the official editor's language selector; the local capture supplies its starter evidence. No LeetCode submission was performed.

Read `LANGUAGE_FILES` in scripts/register_leetcode_lesson.py: Python maps to solution.py, python-code.js, PYTHON_SOURCE. Checked actual canonical source, its decoded mirror, rendered `textContent`, successful copy, denied-copy fallback and download with exact equality including final newline. Beyond the supplied selection test, forced clipboard write failure, used Control+C in the selected fallback textarea, and read the actual browser clipboard back: exact canonical source. Both localized fallback labels correctly describe manual copying and do not replace algorithm feedback.

### Execution and correctness

Executed the actual solution.py with `exec` in Python, called Solution().findRotateSteps, and compared it to an independently written BFS over unit clockwise/counterclockwise rotations and legal presses. The previously recorded fresh predictions passed: abac / cca = 5; abxxxcbx / bc = 5. Boundary predictions 1, 3, 3 and 100 also passed; return values were integers and input strings retained their values. Official examples returned 4 and 13. Another 250 independently seeded valid inputs (seed 827514, rings/keys up to length 12) agreed with BFS. These custom inputs were **code checks**, since the UI has no free-input editor.

Inspected test files before running. Their output paths honor OUTPUT_DIR, so all generated output was redirected to this run's directory, leaving author evidence untouched. Commands and results:

* `OUTPUT_DIR="$PWD/specs/reviews/514-evidence/514-review-1-b31deabd" python3 -B leetcode/514/tests/test_solution.py`: exit 0; 2,207 cases; actual Python and every browser-core endpoint layer agree with unit-operation BFS. Also checks exact source mirror and raw duplicate-free two-string translation pairs. See [numerical.json](514-evidence/514-review-1-b31deabd/numerical.json).
* Same OUTPUT_DIR with `node leetcode/514/tests/browser.cjs`: exit 0; fourteen locale/preset paths, sixteen layout combinations, no page/HTTP errors. See [browser.json](514-evidence/514-review-1-b31deabd/browser.json).
* Same OUTPUT_DIR with `node leetcode/514/tests/accessibility.cjs`: exit 0; actual clipboard, keyboard, disclosure, scroll/focus/control geometry checks. See [accessibility.json](514-evidence/514-review-1-b31deabd/accessibility.json).
* **Required non-mutating preflight:** `python3 -B scripts/register_leetcode_lesson.py 514 --validate-only`, from repository root: exit 0, empty stdout/stderr (also rerun independently of the hash command, with the same result). No registration was run. lesson-entry.json complexity is exactly the nonempty string `O(m n²) time; O(n) auxiliary space`.

The source is correct for the official domain. Initially {0:0} represents zero letters. Each pass reads the completed previous layer only; nonmatching destinations are skipped; every matching destination compares every previous source. The shorter circular distance and mandatory press account for the last move. A more expensive route to the same endpoint has no cheaper continuation, while different endpoints must survive. Nonempty spellability ensures dictionaries never become empty. Finishing after m passes and minimizing over endpoints needs no return movement. Local dictionaries are new each iteration, and inputs are immutable strings. Actual submission cost is O(m n²) time and O(n) auxiliary space, including simultaneous previous/current dictionaries; trace history is correctly distinguished as O(m n²) extra simulation storage.

### Rendered state, localization and controls

Independently inspected the official gd completed frame in both locales, where the winning source is **not** last: g(0)→d(2) gives 1+2+1=4 and is labeled a target minimum; later g(6)→d(2) gives 2+3+1=6 and is labeled worse. d(3) has minimum 5, not the global answer 4. Rewind/replay preserves these identity/value pairs. In aaaa / aa, all sixteen second-layer candidates correctly tie at 2; labels allow ties. The fixed ring cells represent possible endpoints, not multiple physical dials. At the full godding / godding endpoint, g(0)=14 and g(6)=13, consistent with the minimum readout 13.

For both EN and Chinese, independently read the complete recurrence, previous/current definitions, the dominance reason, the counterexample candidate rows and correct/incorrect prediction explanations. The Chinese explanation retains both 2+4+1=7 and 4+1+1=6, same-state merging and the prohibition on discarding different endpoints. The raw translation object is duplicate checked before JSON overwrite; its consumer explicitly selects pair element 0/1. Key presence was not used as a substitute for meaning checks.

All seven presets were stepped forward, rewound and replayed in both languages. Initial controls disable back/reset; terminal controls disable next/complete; reset and range endpoints restore appropriate states. Locale switching preserves the layer, selected prediction, reveal and open source disclosure. Selecting a new prediction hides old feedback before re-reveal. Changing experiment preset resets the layer while preserving the separately stated, fixed-input prediction: feedback still describes abxxxcbxx / bc, so it is not stale feedback for the changed experiment. Width changes preserve the selected layer and revealed prediction. Native Tab/Enter activated next and locale controls, with a visible 3px focus outline.

### Layout and screenshot inspection

Used installed Playwright through NODE_PATH and `process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Captured and visually opened this run's cold counterexample, EN 320 settled view, EN 390 view, Chinese 390 endpoint cells, both right-scrolled 320 candidate tables, both 200% CSS zoom views and half-width desktop-reflow endpoint captures. State identities and numerical values remain separate and readable; cells wrap. Disabled text remains legible (measured 7.08:1); explanation text is 12.62:1, muted text 7.74:1 and reachable-cell text 10.91:1. Focus contrast is at least 8.94:1 against the three tested surfaces. Controls measured at least 48px high. Forced colors preserves the outline, and reduced-motion mode has no lesson animation to suppress.

At 320/390, tables deliberately scroll horizontally rather than squeeze labels. Focus/ArrowRight reaches the ledger's right edge (204/134px); independently did the same for candidate comparisons and captured both locales at the right edge. Longer select labels truncate inside the native collapsed select, but the adjacent full ring/key summary remains readable. Navigation also scrolls. There is no observed label/value collision or essential inaccessible state. The cold element screenshot includes a sticky-navigation strip crossing prose due to its capture scroll position; settled ordinary viewport captures were checked rather than treating that capture artifact as a defect.

Representative inspected screenshots (all exclusive to this run):

* [Cold complete trace](514-evidence/514-review-1-b31deabd/cold-counter.png)
* [EN 320 controls/state](514-evidence/514-review-1-b31deabd/en-320-settled.png), [EN 390](514-evidence/514-review-1-b31deabd/en-390-zoom1.png)
* [Chinese endpoint values](514-evidence/514-review-1-b31deabd/zh-390-ring.png)
* [EN right-side comparisons](514-evidence/514-review-1-b31deabd/en-320-candidates-right.png), [Chinese right-side values/comparisons](514-evidence/514-review-1-b31deabd/zh-320-candidates-right.png)
* [EN 200% CSS](514-evidence/514-review-1-b31deabd/en-desktop-css200.png), [Chinese 200% CSS](514-evidence/514-review-1-b31deabd/zh-desktop-css200.png)
* [EN effective desktop 200% reflow](514-evidence/514-review-1-b31deabd/en-reflow200-official.png), [Chinese reflow](514-evidence/514-review-1-b31deabd/zh-reflow200-official.png)

### Findings and earlier-review closure

No required finding identified; required IDs open: **none**. No earlier review report for 514 was present in specs/reviews, so no earlier required finding is claimed closed. Author self-check notes were inspected only after the cold walk and execution audit; their claims agree with the inspected tests and rerun results. Author-resolved issues are not independent-review closure records.

Nonblocking observations: a basic-list Python reader still encounters unfamiliar dictionary notation and enumerate/items syntax, although the prose maps their algorithmic jobs. A short syntax walkthrough would improve accessibility. Narrow-table scrolling, long native select labels and the horizontally scrolling navigation create minor device friction; full input summaries, focusable tables and readable endpoint cells preserve essential access. These are score rationale, not required defects.

## Scores and conclusion

| Dimension | Weight | Score /4 | Observation supporting score |
|---|---:|---:|---|
| Problem, terms, hand calculation | 15 | 4 | Concrete abc/ca arithmetic precedes abstraction; positions, seam, presses and retained position are explicit. |
| Causal derivation and saved work | 20 | 4 | Wrong greedy rule has 6-versus-5 causal arithmetic; baseline branching, repeated state and same-endpoint dominance form a reconstructable bridge. |
| Maintained state and correctness | 20 | 4 | Explicit invariant, initial condition, full predecessor coverage, separate layers and terminal minimum; independently verified intermediate identities and boundaries. |
| Interaction and visual meaning | 20 | 4 | Predict/reveal/change, ledger history, rewind/replay and endpoint controls work; absent state and completed-layer semantics are explicit. |
| Python and cost | 15 | 3 | Exact official callable executed successfully; numeric code mapping and costs are sound; dictionary syntax is minor friction for this reader. |
| Bilingual and device access | 10 | 3 | Both reasoning paths agree, keyboard/state/contrast checks pass; horizontal tables/navigation and truncated select labels add minor friction. |

Weighted score: **93.75/100** = 15 + 20 + 20 + 20 + 11.25 + 7.5. Every dimension is at least 3 and no required finding is open. **Accepted for this candidate revision and review scope**, independently of publication.

Limitations: this is an independent reconstruction and browser/code review, not observed human novice comprehension or a successful LeetCode submission. Headless Chromium device widths, 200% CSS zoom and half-width desktop reflow were exercised; physical phones and browser-chrome/OS zoom were not measured. Screenshots and supplied test counts support the observations above but do not independently establish teaching effectiveness. No publication, service changes or candidate repairs were performed.
