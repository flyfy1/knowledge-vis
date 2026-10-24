# Independent review: LeetCode 295

Revision: `25db360e7977f44b73aa2f4c68015b6e315d130a`

## Cold walkthrough (before source or prior reports)

Candidate opened at `http://127.0.0.1:18770/leetcode/295/` in Chromium. Screenshots are in `specs/reviews/295-evidence/295-review-1-c71b2ded/`.

- Step 0, “Calculate the median.” Question: what must be retained as values arrive? Action: read the worked `[5,2,10,4]` trace and hand calculation. Observable result: sorted `[2,4,5,10]` gives `(4+5)/2=4.5`; the visible sequence reports medians 5, 3.5, 5, 4.5. Causal paraphrase: the requested value is determined by the middle one or two order statistics, with even counts requiring an average; the persistent interface is `MedianFinder`, `addNum`, `findMedian`.
- Step 1, “Why the baseline stalls.” Question: why not sort every update? Action: read the baseline snippet and the `[1,100,2]` tempting-rule counterexample. Observable result: the page says insertion can shift `O(n)` items and repeated sort costs `O(n log n)` per update; medians are 1, 50.5, 2. Causal paraphrase: a single current median loses both side boundaries, so retaining all values and repeatedly sorting repeats work.
- Step 2, “Two heap boundaries.” Question: how can two boundaries suffice? Action: select preset `[1,100,2] · counterexample`, click Add next twice, then Undo and Reset. Observable result: states show `low=[1], high=[]`, then `low=[1], high=[100]`, median 50.5; Undo returns to one item and Reset to zero. The visible invariant says every low value ≤ every high value and size difference 0 or 1. Causal paraphrase: partitioning into balanced lower/upper halves exposes only the roots needed for the median; history controls preserve or rewind state. The page explicitly labels this as a JavaScript sorted-array visualization, not execution of the Python submission.
- Step 3, “Predict before reveal.” Question: after `[3,8,2,9]`, what happens when 4 arrives? Prediction before reveal: chose A, 4. Action: selected A then clicked Reveal answer. Observable result: “Correct”; sorted `[2,3,4,8,9]` and middle value 4 are shown. Causal paraphrase: adding an item changes the partition and the odd-size median is the single middle boundary; reveal follows a prediction interaction.
- Step 4, “Proof and Python.” Question: why does the invariant survive insertion and what are costs? Action: read the proof, Python mapping, and cost text. Observable result: the page states compare against `-low[0]`, push, move one root if needed, return one root for odd size or average roots for even; `addNum O(log n)`, `findMedian O(1)`, space `O(n)`. Causal paraphrase: placement plus one rebalance restores size/order at each loop entry, and heap roots make query constant time.

Independent fresh code check used the visible `[3,8,2,9,4]` exercise and the counterexample preset; the UI offered presets only, so this is labelled a code check rather than a custom-input UI experiment. English and Chinese rendered equivalent visible reasoning at 390px. Desktop initial screenshot and mobile/prediction/Chinese screenshots were captured.

## Source and evidence audit

- Canonical `solution.py` matches the official persistent `MedianFinder` class. I executed fresh cases including one item, even counts, negatives, duplicates, and extremes; outputs matched `statistics.median`. The randomized oracle test passed 1,600 updates. `python-code.js`, rendered code, copy textarea, and `solution.py` were byte-for-byte equal (726 bytes). The lesson's simulation is explicitly JavaScript-only and is not advertised as the Python runtime.
- `language-contract.json` supports the complete faithful option (Python), gives the class/method contract and rationale, and cites the saved official-page evidence. No non-Python contract was needed. The official URL was opened normally; the public page was Cloudflare-gated in this environment, while the saved evidence records the observed statement/interface and constraints.
- `lesson-entry.json` has the required single nonempty complexity string: `O(log n) per addNum; O(1) per findMedian; O(n) space`. `python3 -B scripts/register_leetcode_lesson.py 295 --validate-only` completed with exit code 0 and no output.
- Browser interaction test (`NODE_PATH=/home/songyy/projects/integ-games/node_modules node leetcode/295/tests/browser.cjs`) and core/source checks passed. Preset switching, add, undo, reset, range control, prediction/reveal, locale switch, keyboard-focusable controls, and disabled-state styling were inspected. Desktop and 390px screenshots are clear. Chinese text preserves the same algorithm and answer.
- At 320px, the normal page is visually readable and the step navigation is horizontally scrollable, but the preset `<select>` has rendered width 386px against a 320px viewport (measured `scrollWidth=386`; at 390px it fits). At a 200% emulation, page scroll width was 772px for both 320px and 390px viewports. This leaves the essential preset control partly off-screen and requires horizontal scrolling at the narrowest supported width/zoom.

## Findings

### DEV-295-01 — narrow/zoom layout overflows the essential preset control (open, required)

At 320px, open the lesson and scroll to “Two heap boundaries.” The preset select's right edge is x=386 while the viewport is 320px; at 200% emulation the document scroll width is 772px. Expected: the essential preset selector and controls remain usable within the supported narrow viewport/zoom (or have an explicit associated component scroll). Actual: the selector and some stage content extend beyond the viewport, with no local overflow affordance. This violates the 320/390/desktop and 200% zoom access requirement. Owner should constrain the selector/stage to `max-width:100%` and recheck both locales, then provide fresh screenshots and keyboard evidence.

## Scores (frozen weights)

- Problem, terms, and hand calculation: **4/4** — units, interface, odd/even definition, and a complete hand trace are visible.
- Causal derivation and saved work: **3/4** — baseline repetition, counterexample, invariant, proof bridge, and cost are reconstructable; the heap rebalancing mechanism is stated rather than shown with a highlighted move.
- Maintained state and correctness: **4/4** — order/size invariant, boundaries, reset/undo, termination, canonical execution, and fresh edge cases agree.
- Interaction and visual meaning: **3/4** — prediction/reveal and retained ledger work, and the simulation disclaimer is clear; data movement is represented as sorted state rather than an actual heap transition.
- Transfer to Python and cost: **4/4** — exact executable source, parity checks, independent runtime cases, and honest simulation/cost distinction.
- Bilingual and device access: **2/4** — English/Chinese reasoning is equivalent and desktop/390px are readable, but DEV-295-01 is open for 320px and 200% zoom overflow.

Weighted total: **85/100**. Required finding DEV-295-01 remains open and one dimension is below 3, so this revision is **changes required**, not accepted. Limitations: no real novice comprehension claim; official page body was Cloudflare-gated during this run, though the saved lesson-local official evidence was audited.

Conclusion: changes required pending a new candidate and fresh review after the narrow/zoom layout fix.

