---
lang: en
---

::: strings
docTitle: Binary Search · Halve the Candidates
back: ← Knowledge Index
pageTitle: Binary Search · Halve the Candidates
tagline: In a sorted array, you do not have to try every item. Read the middle value, then discard the impossible half after one comparison.
foot: Binary Search · Make “discard half” a recomputable step-by-step idea
linearLab: Linear search O(n)
binaryLab: Binary search O(log₂ n)
targetFound: target found
targetMiss: target missing
dirL: left
dirR: right
dirEq: hit
rangeNone: empty interval
startReady: Ready: target = {target}. Click “One step” to start at the middle.
stepMsg: Compare a[{mid}] = {value}: {action}; next interval [{lo}, {hi}].
doneFound: Found {target} on comparison {count}.
doneMiss: The interval is empty: {target} is not in the array. {count} comparisons.
metricN: candidate count n
metricLinear: linear worst case
metricBinary: binary worst case
stepsUnit: comparisons
pathEmpty: —
pathText: {path}
resultText: {result}
:::

## Read the middle: one comparison cuts the table in half {#step0 h2=s0t}

::: strings
nav0: 0 Read the middle
:::

Step 0 · The hook {#s0k .step-kicker i18n=text}

The array is sorted. Click **One step** and read one middle value: if the target is larger, cross out the left half; if smaller, cross out the right half. Grey cells are impossible. {#s0e .explain}

::: html step0-1
targetLab: Target
stepOnce: One step
play: Play
reset: Reset
rangeLab: Still possible
probeLab: This probe
cmpLab: Comparisons
:::

Watch the causal order: **compare the middle → keep one half → the next middle changes**. The algorithm is fast because it can safely discard half every time. {#s0hint .hint}

::: strings
pause: Pause
:::

## lo, mid and hi circle the interval that remains {#step1 h2=s1t}

::: strings
nav1: 1 Halve each time
:::

Step 1 · The core move {#s1k .step-kicker i18n=text}

Write the search with three numbers: **lo**, **mid**, and **hi**. Each step updates only lo or hi; the invariant stays true: if the answer exists, it is inside [lo, hi]. {#s1e .explain}

::: html step1-1
presetLow: Target to the left
presetHigh: Target to the right
presetMiss: Missing target
traceLab: Trace
formulaNote: Each loop makes one equality/ordering comparison, then shrinks the interval.
:::

Put exclusion into the boundary update: when <code>target &lt; a[mid]</code>, set <code>hi = mid − 1</code>; otherwise set <code>lo = mid + 1</code>. Boundaries matter more than a slogan. {#s1hint .hint}

## Change only the target; the path forks from the other side {#step2 h2=s2t}

::: strings
nav2: 2 Change the target
:::

Step 2 · Causal experiment {#s2k .step-kicker i18n=text}

Keep the same deck and algorithm, then choose another target. Compare each middle value with the excluded intervals to see how position determines the fork. {#s2e .explain}

::: html step2-1
pathLab: Directions
resultLab: Result
replay: Replay path
:::

Binary search is fast under a condition: the array is sorted. If sorting is still needed, its cost belongs in the total account; algorithm choice always includes the input condition. {#s2hint .hint}

## Double n, and binary search asks only one more question {#step3 h2=s3t}

::: strings
nav3: 3 Count the work
:::

Step 3 · Keep the ledger {#s3k .step-kicker i18n=text}

Use the slider to change n and compare the worst-case questions for linear and binary search. Bar height is comparisons, not stopwatch time. {#s3e .explain}

::: html step3-1
nLab: Array length n
formulaNote3: Worst-case binary comparisons = ⌊log₂ n⌋ + 1 (for this closed-interval version).
:::

Complexity describes growth: at n=32 the gap is a few bars; at n=1024 it is an order-of-magnitude gap. Halving is where the logarithm comes from. {#s3hint .hint}

## Write binary search as three preconditions {#step4 h2=s4t}

::: strings
nav4: 4 Takeaway
:::

Step 4 · Takeaway {#s4k .step-kicker i18n=text}

Remember three lines: the array is **sorted**; boundaries stay correct; each comparison **rules out half**. Then search becomes O(log n) instead of trying items one by one. {#s4e .explain}

::: html step4-1
finalRule: "Reusable rule: "
finalText: First ask whether the input has order, then ask how many candidates one comparison can remove. Complexity comes from the part you dare to delete.
:::
