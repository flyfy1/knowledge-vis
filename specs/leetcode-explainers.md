# LeetCode explainer specification

## Product contract

The reader should be able to reconstruct an algorithm, explain why it is
correct, and implement it in Python after working through the lesson. A moving
diagram and a correct final answer alone do not establish that learning outcome.

The first complete path is: knowledge index → LeetCode collection → problem
2916 → hand calculation → optimization → Python → independent verification.
Future problems use the same path. Do not add accounts, a code execution service,
progress synchronization, or a general algorithm framework without a concrete
lesson that needs them.

All solution, baseline, pseudocode, and test examples shown to readers use
**Python**. Vanilla JavaScript may implement browser interaction. Do not present
that implementation as Python execution or claim a LeetCode acceptance without
an actual submission result. UI and prose follow `../UI-I18N-SPEC.md` in both
Chinese and English, with the shared `knowledge-lang` preference.

## Before writing the page

1. Open the official problem. Verify the definition, examples, constraints,
   indexing, modulus, and intended input size. Paraphrase the statement; link it.
2. Write a problem-local `BRIEF.md` with category, stage, target reader, one
   learning loop, expected outputs, and a concept dependency table.
3. Give every step five fields: what the reader already knows; its single
   question; available input and desired output; the action and expected visible
   observation; and conditions under which the conclusion holds.
4. Derive and test the mathematics before designing the animation. Keep the
   simple correct baseline as an independent oracle for small inputs.

## Teaching sequence

Use the shortest sequence that exposes the actual reasoning. The 2916 sequence
is an example, not a mandatory seven-section template for every algorithm.

1. **Understand the quantity.** Use the smallest nontrivial example. Distinguish
   nearby concepts: distinct count is not length; different positions can form
   equal subarrays that must still be counted separately.
2. **Calculate by hand.** Let the reader inspect or predict before revealing.
   Expose all contributions, rather than only one final total.
3. **Establish the baseline.** Show correct Python, state its actual complexity,
   and connect the constraint to the repeated work that makes it too expensive.
   Keep this reason visible, rather than hiding essential motivation inside a
   code disclosure. Distinguish finding an update interval from applying it
   efficiently: a plain loop over that interval can still be quadratic.
4. **Discover a reusable state.** Explain the invariant in ordinary language and
   symbols. Compare old and new states using the same input.
5. **Derive the optimization.** Prove the update boundary before naming a data
   structure. Explain both included and excluded cases and sentinel values.
6. **Choose sufficient summaries.** Derive what an aggregate update requires.
   Explain every stored statistic and why a smaller set is insufficient.
7. **Implement and verify.** Map the derivation to named Python functions. State
   the invariant, complexity, edge cases, and an independent checking method.
   Introduce the outer scan before full machinery. Identify diagram IDs versus
   input indices, current-node bounds versus fixed request bounds, and the
   concrete recursive stop condition. Map one operation to its Python snippet.

Every step begins with a concrete question. Define symbols locally, including
when readers jump directly to that step. Use the same names in prose, controls,
diagrams, readouts and Python. Keep English causally equivalent to Chinese.

## Interaction contract

- Each experiment has one observation task. Specify what to change, what stays
  fixed, where to look, and what would confirm the claim.
- Distinguish worked examples from retrieval checks. Include one fresh
  predict-before-reveal case for the central mechanism. Its derived answer and
  highlights stay hidden until the learner chooses and explicitly verifies.
  Explain an incorrect choice by its extra or missing states; clear stale
  feedback when the choice changes, and preserve state when switching language.
- Make the phenomenon visible. Retain a contribution ledger, show old and new
  values side by side, or retain an operation history. Replacing a frame and
  updating an isolated number is insufficient for accumulated behavior.
- Label before-state metrics and after-state metrics differently. In 2916, the
  old square sum is not yet the contribution of the new right endpoint.
- A control should predict its action: “Apply interval +1” and “Append the next
  value” are clearer than a permanent, ambiguous “Next.” Mark progress and stop
  at the endpoint. Backward navigation must restore all related values.
- State explicitly when changing a preset restarts an experiment. Keep independent
  experiments independent and identify which ones share an input.
- Lazy-tree displays must distinguish stored node summaries from effective leaf
  values. An ancestor tag already affects its summary even when its children are
  stale. During recursion, the root can be stale until the return path merges it.
- Before deferred updates, teach interval decomposition separately from numeric
  summaries: define boxes, root, leaves and halves on a zero-state structure.
  Keep the requested interval next to every operation and show one specific
  wrong result that would follow from omitting a required push. Explain why
  whole blocks stop and only boundary-cut blocks continue, rather than using
  tree height alone as the proof of logarithmic update work.
- Keep controls keyboard-accessible, preserve focus when changing languages,
  announce meaningful updates, and test narrow screens without shrinking labels
  into illegibility. Honor reduced motion. Avoid automatic looping playback.

## Repository pattern

- Collection entry: `/leetcode/`, registered once in root `pages.config.js` under
  category `leetcode`, stage `university`.
- Problem entry: `/leetcode/<id>/`, registered in `leetcode/problems.config.js`
  with bilingual title, description and topics, difficulty, language, path, and
  `leetcodeUrl` pointing to the exact official problem. Show `#<id> · <title>`
  in the collection heading and the lesson H1. Provide separate lesson and
  official-problem links on the collection card, plus an official link beside
  the lesson header; never nest an external link inside a clickable card link.
- Problem files: `index.html`, `copy.js`, `app.js`, an independently testable
  numerical core when needed, `solution.py`, and `BRIEF.md`.
- The shared `leetcode/style.css` starts from the existing Fourier theme.
  `leetcode/common.js` implements the site's existing language behavior.
- For offline opening, embed the displayed Python source in `python-code.js`.
  Regenerate it from `solution.py`; test exact source equality. Do not require
  network requests to display solution code or local experiment data.
- Add concept deep links and register the new lesson in `CONCEPT-MAP.md`.
- General authoring lessons belong here; problem-specific evidence belongs in
  the problem's brief. Bump asset query versions when changing a served asset.

## Acceptance checks

For an independent teaching review, use the outcome-based
[novice rubric](reviews/leetcode-2916-rubric.md). Freeze its criteria before the
reviewer reads the implementation; preserve per-round findings and responses.

First walk the lesson as a new reader without using the brief as a decoder.
For every experiment, explain what the interaction made visible. If that is
unclear, revise it before checking numeric details.

Then verify:

1. Python against the baseline on exhaustive small inputs and seeded random
   inputs. Use relevant closed-form large cases and the maximum constraint.
2. The browser's numerical model against an independent baseline. Check every
   completed round, not just the final sum. For deferred updates, test overlapping
   ranges and effective leaf values, not only cached root summaries.
3. Every control to both endpoints, backward navigation, presets, reveal feedback,
   copy fallback, language changes after interaction, and unavailable storage.
4. A real browser at desktop and narrow widths (including 320 and 390), console
   and network errors, link targets, keyboard access and readable diagrams.
   Wait for the experiment's initial readout to be populated before operating
   it; a static button's presence alone does not establish initialization.
5. The exact downloaded Python source equals the displayed source.
6. After publication, check the real collection, problem page and asset hashes.
   A Git push alone is not deployment evidence. Use the current deployment route
   and preserve unrelated files and a rollback copy of changed served files.

Report only observed evidence. Passing tests establishes computational behavior;
it does not prove that a real learner understood the lesson or that LeetCode
accepted a submission.

## Findings from 2916

- Partitioning subarrays by right endpoint makes the final summation and the
  incrementally maintained state correspond directly.
- The previous occurrence gives both a sufficient condition and a precise
  boundary: only starts in `[p+1, r]` change. Showing the excluded start `p`
  makes the off-by-one boundary easier to understand.
- Define the new start as a reserved zero before applying the increment. This
  explains why singleton subarrays need no separate branch.
- Derive `Q' = Q + 2kS + k²m` before introducing lazy propagation. Use old `S`
  when updating `Q`; use general `k` because tags accumulate.
- A second overlapping update is necessary to demonstrate why tags must be
  pushed down. A single fully covered update only demonstrates deferral.
- If the implementation keeps tags even on leaves, explain that those tags are
  never pushed further. Do not describe a leaf tag as work owed to children.
- Preserve the distinction between the current endpoint's `F(r)` and the
  cumulative answer. The official `[1,2,1]` example exposes confusing them:
  final root square sum `9`, full answer `15`.

## Extension: first ten Hard problems

For multi-algorithm batches, also apply [the Hard trace specification](leetcode-hard-traces.md).
It adds explicit frame timing, data-versus-highlight semantics, identity tests,
trace omission notices, rolling-memory disclosure, and misconception-driven
prediction requirements derived from the first ten numeric-ID Hard lessons.
