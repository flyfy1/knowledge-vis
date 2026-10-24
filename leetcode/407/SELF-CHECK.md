# #407 author self-check — candidate 1

Status: complete author candidate, ready for a separate independent review. This document is not independent acceptance, a LeetCode submission result, a novice teach-back, registration, deployment or public-delivery evidence.

## Verified contract and scope

The public official GraphQL response was saved with its exact query, URL, timestamp, complete statement, official examples and language snippets in `provenance/official.json`. It confirms problem 407, non-premium access, nonempty rectangular dimensions 1…200, integer heights 0…20000 and the Python3 callable `Solution.trapRainWater(self, heightMap: list[list[int]]) -> int`. Both official examples are included as complete trace presets and pass in Python. Python is the preferred canonical language. No paywall bypass or credential use occurred.

All authored files are inside `leetcode/407/`. Shared assets, registries, workflow, other lessons, services and Git configuration were not edited. No agents, commits, publishing or registration were performed. Metadata contains a single time-and-space complexity string and valid local concept anchors; dispatcher-owned concept-map/registry writes remain outside this author task.

## Actual checks and results

Commands from repository root (all exited 0 in their final runs):

```
OUTPUT_DIR=leetcode/407/tests/evidence python3 -B leetcode/407/tests/test_solution.py
OUTPUT_DIR=leetcode/407/tests/evidence node leetcode/407/tests/browser.cjs
OUTPUT_DIR=leetcode/407/tests/evidence node leetcode/407/tests/accessibility.cjs
python3 -B scripts/register_leetcode_lesson.py 407 --validate-only
```

- `tests/evidence/numerical.json`: 20,142 oracle cases, including all 19,683 ternary 3×3 maps, 450 seed-407 rectangles, both official examples, all six outlet heights and the fresh transfer case. Five additional maximum-size/thin closed forms pass, including the 200×200 bowl returning 784,080,000. Python preserves all tested inputs.
- The independent oracle searches exterior-connected integer water layers, rather than transcribing the heap recurrence. JavaScript matches every oracle cell level, final volume and 202,344 complete intermediate frames. Checks cover unique seeds/queue entries/removals, monotone pop levels, exact first-discovery transitions, immutable snapshots, cumulative depth and visited/frontier conservation.
- Acorn checks object keys before overwrite, both localized values and interpolation fields. Canonical mirror bytes match `solution.py` exactly.
- `tests/evidence/browser.json`: both locales × all six presets; every round forward/back/forward; all endpoints, reset and finish; all outlet settings; all prediction options, change-clears-feedback, explicit reveal and locale preservation; copy success and denial; displayed/copied/downloaded source equality; denied storage; already-loaded source available offline; local/deep anchors; no runtime console errors, failed assets or external runtime requests.
- Real Chromium native clipboard read/write additionally passes in `tests/evidence/accessibility.json`. Both-language semantic-binding observations distinguish the actual `(0,1) → (1,1)` transition and W=3−1=2 from clipboard fallback text. Native Tab/Enter/Home/End/arrow input, useful focus, disclosure state, independent prediction/reset state, forced colors and reduced motion were exercised.
- Screenshots and geometry cover EN/中文 at 320, 390, 736 and 1440 CSS px, plus 736×414 landscape and 200% CSS layout zoom at 1440×1000 (effective half-width layout). These are real Chromium renders; CSS layout zoom is the measured method, not an OS magnifier or a physical-device claim. Wide grids intentionally scroll with row headings retained. Source blocks scroll; manual source selection is exact despite visual wrapping.
- Computed text-pair contrast is at least 6.4494:1; core body text is 16.087:1. Disabled controls retain readable text. The 3px orange focus outline exceeds 3:1 against adjacent panel backgrounds. All measured visible buttons/selects are at least 48×48 CSS px.
- Shared CSS 9,425 bytes + local CSS 2,679 bytes = 12,104 bytes, below the 25,000-byte ceiling. No external fonts/images/runtime libraries.
- Non-mutating preflight: `python3 -B scripts/register_leetcode_lesson.py 407 --validate-only` returned exit code 0 with empty stdout/stderr. Exact command, working directory and timestamp are recorded in `tests/evidence/preflight.json`. Metadata is frozen in this candidate for the later reviewer.

## Visual inspection and author read-through

The author opened the screenshots with the image viewer, rather than relying on file existence or page-overflow checks. Inspected the entire 320/390/736/1440 trace matrix, both zoom views, the Chinese prediction reveal, English positive-depth tiny bowl, Chinese completed corridor, narrow clipboard fallback and landscape grid. Labels remain associated with H/L/W; unknown cells use ?, not zero. The tiny center visibly retains H=1, L=3, W=2; highlighted dry cells retain W=0. Accumulated known cells and causal history remain available when rewinding. Horizontal clipping at the scroll viewport edge is intentional, disclosed and keyboard-scrollable; the table itself does not shrink its values.

Author read-through observations (not a cold independent review or actual learner observation):

| Step | Action and visible inference |
|---|---|
|0|Reveal: eight edge cells contribute zero; center contributes 3−1=2.|
|1|Trace the bent route in the printed map: the four low cells escape over 2 although the straight walls reach 5; the integer-layer baseline explains what is being counted.|
|2|Advance the tiny bowl twice: the center becomes fixed at 3 and history records +2; undo restores unknown center and zero volume. The corridor gate experiment changes only one real ground value, and propagation uses max(parent level, ground).|
|3|Select before reveal: the left zero needs the internal height-3 ridge while the right zero only needs outlet 2; the revealed total is 5. Changing the answer hides that explanation again.|
|4|Map pop (3,0,1), center ground 1, add 2, push (3,1,1) to exact source; distinguish Python execution from browser simulation and tutorial snapshots from submission auxiliary memory.|

## Fixes during self-check

The control audit found the Chinese language button was only 44px wide; local CSS now gives it a 48px minimum. Screenshot inspection found a stale navigation highlight during layout zoom; navigation now derives the current section from its rendered scroll position. Wide grids keep their row-heading column during horizontal scrolling. Test-harness corrections narrowed a radio selector that also matched the slider and waited for completed smooth scrolling/clipboard promises instead of sampling too early. One overlapping-browser run terminated before completion; the final full browser run was executed on its own and passed. Earlier attempts are not represented as independent reviews.

## Candidate boundary

`tests/evidence/candidate-sha256.json` identifies the runtime, metadata, brief, official evidence, self-check, reproducible test sources and shared dependencies used. Evidence reports/screenshots are author-run outputs. No material issue remains known from the checks above. Independent per-problem teaching acceptance, actual learner outcomes, physical mobile devices, native browser-chrome zoom UI and production delivery remain unverified. The 200% layout behavior was explicitly tested with CSS zoom. This candidate must be reviewed separately before registration or release.
