# Independent review: LeetCode 295

- Candidate revision: `d83580dcd8e650a1bd8e5e39a608177019ee54aa`
- Reviewer/run identity: independent fresh review run (model identity unavailable)
- Candidate URL: http://127.0.0.1:18770/leetcode/295/
- Target reader: basic Python, lists, loops, functions, elementary recursion
- Rubric: `specs/leetcode-review-gates.md` (weights 15,20,20,20,15,10)

## Cold browser walkthrough (before source/tests)

I opened the candidate in a real Chromium browser at desktop width 1280x900 before reading any brief, implementation, tests, author notes, or earlier review.

1. **Question:** What is retained and what is the requested output when numbers arrive one at a time? **Action:** Read the first lesson and its hand calculation. **Observable:** The page states `[5,2,10,4]` sorts to `[2,4,5,10]`, median `(4+5)/2=4.5`, and shows the sequence `add 5 → 5; add 2 → [2,5], median 3.5; add 10 → [2,5,10], median 5; add 4 → [2,4,5,10], median 4.5`. **Causal paraphrase:** A median depends on the ordered middle position(s), with one middle value for odd cardinality and two averaged values for even cardinality; retaining the stream supports repeated queries.

2. **Question:** Why is repeatedly sorting a baseline costly? **Action:** Read the baseline section and the tempting-wrong-rule example. **Observable:** It says insertion can shift `O(n)` items and sorting each update costs `O(n log n)`; code appends, sorts, and indexes the middle. It gives `[1,100,2]` with medians `1`, `50.5`, `2` to reject keeping only the current median. **Causal paraphrase:** The baseline redoes global ordering work each update, and one scalar median loses necessary information from both sides.

3. **Question:** Which state is supposed to make each update cheap? **Action:** Read the two-boundary explanation. **Observable:** It names a max-heap lower half and min-heap upper half, with invariant every low value ≤ every high value and `|low|-|high| ∈ {0,1}`. The page explicitly warns the visible simulation is JavaScript sorted-array state and does not execute the Python submission. **Causal paraphrase:** Two boundary roots summarize the only values needed for the median, while size balance determines odd/even output; the visualization is an explanatory model rather than the canonical Python runtime.

4. **Question:** Can I predict a fresh next result before reveal? **Action:** Read the prediction prompt for `[3,8,2,9,4]`, processed through `[3,8,2,9]`, next `4`; independently sorted the five values as `[2,3,4,8,9]` and predicted option A (`4`) before attempting reveal. **Observable:** The UI presents A `4`, B `4.5`, C `5`, and a `Reveal answer` control. The scripted browser interaction reached the control but did not produce a separate reveal result before the page interaction timed out. **Causal paraphrase:** The fresh odd-count case should expose the single middle value after insertion; reveal behavior needs a later interaction audit.

5. **Question:** Does the stream control preserve and reverse state? **Action:** Selected preset `[5,2,10,4]` from the stream selector; clicked `Add next` twice, then `Undo`, then `Reset`. **Observable:** Status changed `Processed 0/4` → `1/4` → `2/4` → `1/4` → `0/4`; the page retains the selected four-item stream and shows lower/upper-half labels. **Causal paraphrase:** Add advances one item, Undo removes the most recent transition, and Reset clears processed state while retaining the chosen preset; the visible history is stepwise and reversible.

6. **Question:** What is the interaction's semantic boundary? **Action:** Read the control note and visible-state label. **Observable:** It says “This JavaScript sorted-array simulation displays state; it does not execute the Python submission,” and labels the visible state as lower/upper halves. **Causal paraphrase:** The learner is shown data partitions and transitions, but must still connect those transitions to canonical heap operations in Python.

Screenshots captured during this cold walk are in `specs/reviews/295-evidence/295-review-2-63dfb3ab/`.

## Post-cold audit


### Source, contract, and metadata observations

- `solution.py` is the canonical Python persistent class (`MedianFinder`, `addNum`, `findMedian`) using `heapq`; it returns `None` from `addNum` and a float median. Independent runtime checks on `[7]`, `[2,1]`, `[0,-1,-1,2]`, extremes, and `[3,8,2,9,4]` matched `statistics.median` at every prefix. The existing oracle test also passed 1,600 randomized updates.
- `language-contract.json` declares Python as the complete supported faithful language, gives the official class/method contract, and points to lesson-local official evidence. No conceptual-only non-Python option is advertised. `python-code.js`, displayed `#pythonCode`, copy textarea, and `solution.py` were byte-identical (726 bytes). The canonical Python file was executed directly; the JavaScript trace is explicitly labelled explanatory sorted-array simulation.
- `lesson-entry.json` uses one nonempty string complexity value: `O(log n) per addNum; O(1) per findMedian; O(n) space`. The required safe preflight command was run from the repository root: `python3 -B scripts/register_leetcode_lesson.py 295 --validate-only` (exit 0, no output).
- The official URL was opened normally in Chromium; LeetCode returned its security-verification page in this environment, so statement/interface verification is limited to the lesson-local evidence and visible official-link target. No successful submission or human-comprehension claim is made.

### Interaction, language, and device checks

- Preset selection, Add next, Undo, Reset, range slider, prediction selection, and Reveal answer were exercised. The selected stream remains while Reset returns `Processed 0/n`; the ledger records each processed prefix. A correct prediction for the fresh exercise produced the visible feedback “Correct” and the sorted-order explanation. Clicking Reveal without a prediction is disabled by design.
- The visual state distinguishes lower/upper data partitions and the ledger from explanatory prose; it does not claim to animate actual heap internals. The simulation disclaimer is visible in both locales. The missing operation-level highlight (which root moved) creates minor friction in reconstructing the rebalancing mechanism, reflected in the interaction/derivation scores, but did not produce an incorrect state.
- English and Chinese text were checked at 320px, 390px, and 1280px. Measured `document.documentElement.scrollWidth` equalled the viewport at 320 and 390 in both locales; the preset selector stayed inside the viewport (320: x=29..291; 390: x=29..361). At 200% zoom emulation on 320px, scroll width remained 320 and the selector remained inside the viewport. The earlier report's DEV-295-01 overflow is therefore fixed in this candidate; this recheck is the closure evidence for the actual revision, while the prior report remains unchanged.
- Native buttons, select, range, radios, links, and summary are keyboard-focusable; visible focus outlines are defined. Disabled Undo/Reset/Reveal states remain readable (opacity is overridden for lesson buttons). A clipboard rejection was simulated: the manual textarea fallback appeared with the expected localized message. Desktop and narrow screenshots are saved in the exclusive evidence directory.

## Scores (frozen weights)

- Problem, terms, and hand calculation: **4/4** — interface, constraints, units, odd/even median definition, and a complete hand trace are visible.
- Causal derivation and saved work: **3/4** — baseline repetition, tempting-rule counterexample, two-boundary invariant, proof bridge, and stated costs are reconstructable; the exact root-transfer operation is described but not shown as a concrete highlighted transition.
- Maintained state and correctness: **4/4** — order/size invariant, heap-root dependencies, odd/even boundaries, persistence, undo/reset/endpoints, direct canonical execution, and independent edge cases agree.
- Interaction and visual meaning: **3/4** — prediction-before-reveal, retained ledger, state controls, and the simulation disclaimer work; sorted-array partitions do not expose an actual heap move, so some visual-to-code mapping requires reading the proof text.
- Transfer to Python and cost: **4/4** — canonical source executes, mutation/persistence behavior is checked, source surfaces are byte-identical, and claimed costs match the heap implementation.
- Bilingual and device access: **4/4** — equivalent algorithm reasoning in English and Chinese, keyboard-native controls, readable disabled states and copy fallback, and no overflow at 320/390/desktop or 200% zoom in both locales.

Weighted total: **87.5/100**.

## Required findings and closure

No required finding remains open for candidate `d83580dcd8e650a1bd8e5e39a608177019ee54aa`. Earlier `DEV-295-01` (320px/200% overflow) is closed for this candidate by the measured viewport checks and screenshots above; the earlier report is preserved and not rewritten. The pedagogical root-transfer visualization gap is recorded as a minor scoring observation, not a correctness or access blocker.

## Limitations and conclusion

The official LeetCode page was Cloudflare-gated, so the official statement could not be independently read beyond the saved lesson-local official evidence. This review does not claim real novice comprehension or a successful LeetCode submission. Within the available evidence, the frozen gates are met: score ≥85, every dimension ≥3, metadata preflight passes, canonical source and displayed/copy surfaces match, and no required finding is open. **Outcome: independently accepted for this revision and scope.**
