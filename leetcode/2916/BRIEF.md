# Problem 2916: interactive lesson brief

Category: `leetcode`. Stage: `university`. Solution language: Python.

## Learning contract

Target reader: a learner who knows lists, sets, loops and elementary algebra,
but need not already know segment trees.

Job: reconstruct an efficient solution, explain its interval boundary and square
update, and translate the reasoning into Python.

Riskiest assumption: a learner can see why the affected starts are contiguous
and why an aggregate update needs both the count sum and square sum. Prove those
transformations with before/after experiments before teaching tree mechanics.

P1 loop: homepage → collection → inspect all six subarrays → group by endpoint
→ compare counts before/after appending → derive aggregate formula → step an
overlapping lazy update → read Python → independently check examples.

Representative inputs: `[1,2,1]` → 15; `[2,2]` → 3;
`[1,2,1,3,2]` → 70; `[1,2,3,4]` → 50.

Success evidence: browser interactions expose the claimed state changes, the
numerical model and Python independently match brute enumeration, and both
language paths work at desktop and mobile widths. Real-user comprehension
remains a learning outcome to assess from use, not a claim inferred from tests.

No-gos: no hosted code runner, accounts, new dependencies, persistent test data,
non-Python solution variants, or claims of a LeetCode submission result.

## Step outline

| Step | Reader knows | One question | Input → desired output | Action → visible observation | Conditions |
| --- | --- | --- | --- | --- | --- |
| 0 | Lists, equality, squares | What does a subarray contribute? | `[1,2,1]` → six contributions | Select a triangular cell, predict total → distinct set and squared count | Nonempty contiguous intervals; count positions separately |
| 1 | One contribution | How can we partition all contributions? | All subarrays → groups `F(r)` | Advance `r` → retain ledger `1,5,9`, total 15 | Each interval has exactly one right endpoint |
| 2 | `F(r)` and previous round | Which starts change when `x` arrives? | Old `d`, last occurrence `p` → new `d` | Predict, apply +1, append → paired bars and range boundary | Only `[p+1,r]`; unseen `p=-1`; future starts zero |
| 3 | Updated starts and elementary square expansion | What summaries allow a whole-range update? | `[2,2,1]`, increment `k` → new sums | Change `k` → per-count square deltas sum to `2kS+k²m` | Uniform increment; old `S` used first |
| 4 | Aggregate update | How can arbitrary intervals update efficiently? | Five-start tree after `r=2` → rounds 3 and 4 | Step operations → covered node, deferred children, push, merge | Tags count increments owed to descendants; root valid after complete update |
| 5 | Interval logic and tree operations | How does it become Python? | Algorithm → submission-shaped class | Inspect/copy/download same source → functions map to derivation | Official positive nonempty input; sums modulo `10^9+7` |
| 6 | Full algorithm | Do boundary cases follow the same rule? | Four examples → per-round ledger | Predict, switch example → recurrence and brute totals match | Exact small teaching inputs; maximum-size Python checked separately |

## First-definition table

| Concept | First introduced | Plain-language definition | Depends on |
| --- | --- | --- | --- |
| Distinct count | Header / step 0 | How many different values occur, irrespective of repetitions | Equality |
| Subarray, `l`, `r` | Step 0 | Nonempty consecutive positions, from left index through right index | List indexing |
| `F(r)` | Step 1 | Sum of squared distinct counts for the group ending at `r` | Subarray contribution |
| `d[l]` | Step 2 | Distinct count for start `l` and the current endpoint | `F(r)` |
| `p` | Step 2 | Most recent earlier position of the new value, or −1 | Index, equality |
| `S`, `Q`, `m`, `k` | Step 3 | Sum of counts, sum of their squares, segment length, uniform increase | `d`, algebra |
| Segment tree | Step 4 | A recursively halved partition storing summaries | Interval, `S`, `Q` |
| Lazy tag `t` | Step 4 | Uniform increment already applied at a node but owed to children | Tree, increment |
| Push / pull | Step 4 | Pass owed increments to children / sum child summaries into parent | Lazy tag |
| Invariant | Step 5 | What each maintained count means after every complete round | `d`, input prefix |

## Demonstration boundaries

Steps 0–1 share `[1,2,1]`. Step 2 allows four independent presets and restarts
on selection. Step 3 fixes the three affected counts from the five-value case;
changing `k` is an algebra experiment, not a new input array. Step 4 always
uses `[1,2,1,3,2]`, independently of earlier presets. Step 6 is a fresh ledger.

The small browser model uses exact small integers. Python uses modular sums
and supports the official maximum length. The tree shows actual recursive
intermediate states, including temporarily stale ancestors before merging.

## References and reusable process

- [Official problem](https://leetcode.com/problems/subarrays-distinct-element-sum-of-squares-ii/)
- [Repository explainer specification](../../specs/leetcode-explainers.md)
- [Site UI specification](../../UI-I18N-SPEC.md)

## Verification commands

```sh
node leetcode/tests/test_core.cjs
python3 leetcode/tests/test_solution.py
python3 -m http.server 18767 --bind 127.0.0.1
# Optional authoring dependency; not needed by the website:
NODE_PATH=/path/to/playwright/packages node leetcode/tests/test_browser.cjs
```

The browser check accepts `LESSON_BASE_URL` (default `http://127.0.0.1:18767`)
and `LESSON_SCREENSHOTS` (optional screenshot directory).

## Verified evidence (2026-10-17)

- Python: 3,279 exhaustive inputs (lengths 1–7 over three values), 500 seeded
  random inputs, and maximum-length all-equal and all-distinct cases passed.
- Browser numerical core: 3,579 complete-input checks validate every endpoint
  against direct distinct sets; 3,200 overlapping interval updates validate
  effective leaves and root square sums.
- The exact lazy trace includes a nonzero push from `[0,2]`; complete rounds
  give `Q=23` and `Q=32`, with final effective counts `[3,3,3,2,1]`.
- Real Chromium: index → collection → lesson, both languages, all preset
  endpoints, backward stepping, dynamic labels, history, active navigation,
  clipboard success and denial, blocked storage, downloaded/displayed Python
  equality, internal deep links, and widths 320/390/736/1440 passed without
  console errors or horizontal page overflow.
- Mobile and desktop screenshots were visually inspected. This evidence covers
  implementation and presentation; no LeetCode submission or real-user
  comprehension result is claimed.
- Published code revision `a3386ea` to the existing Pi static service. The live
  homepage, collection, lesson and nine supporting entry/assets (12 URLs total)
  returned exact source bytes. The complete browser check also passed against
  `https://visual.integ.life`. Unrelated served pages were not replaced; previous
  homepage/config files are backed up at
  `/home/songyy/backups/visual-site/leetcode-a3386ea` on Pi.

## Novice-clarity review iterations

See the independent [Astra rubric](../../specs/reviews/leetcode-2916-rubric.md),
[round 1 findings](../../specs/reviews/leetcode-2916-round1.md), and
[iteration record](../../specs/reviews/leetcode-2916-iterations.md). The first
candidate exposes the baseline workload, adds a separate interval-partition
primer before tags, retains the requested interval during every tree operation,
and adds a concrete visual-to-Python bridge. This extends step 4's outline:
partition an initially zero structure before loading the first three rounds.
