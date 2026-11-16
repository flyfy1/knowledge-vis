---
lang: en
---

::: strings
docTitle: Sorting & Big O · The Shape of Growth · One Interaction per Step
back: ← Knowledge Index
pageTitle: Sorting & Big O · The Shape of Growth
tagline: Sorting algorithms do not differ in whether they can sort, but in how the number of comparisons grows with n. Big O records not the stopwatch but the shape of growth: when n doubles, how many times over does the work multiply? Every counter on this page is incremented by a real sorting implementation as it runs — every number on the formula cards can be re-derived by hand from the seed.
foot: visual.integ.life · Sorting & Big O — one interaction per step
:::

## The same shuffled deck, two fates {#step0 h2=s0t}

::: strings
nav0: 0 The Race
:::

Step 0 · The Hook {#s0k .step-kicker i18n=text}

Two lanes, **the same deck** (the same array, generated from the same seed): bubble sort on the left, merge sort on the right. Press start and both advance **by comparison count** — each completed comparison buys the same slice of time on both sides, so who finishes first is decided purely by how many comparisons each needs in total. Merge sort clocks out early; bubble sort is still crawling. The gap is not diligence — it is the **shape of growth**. {#s0e .explain}

::: html step0-1
s0leftLab: Bubble Sort
s0rightLab: Merge Sort
s0race: Start the race
reset: Reset
newSeed: New seed
:::

Full disclosure: “faster” here means fewer comparisons, not a faster stopwatch. Real running time also depends on language, hardware and implementation craft — but the comparison count is the algorithm’s own ledger, and it cannot be argued with. The animation’s unit of progress is the comparison, and the captions will keep that accounting honest throughout. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
s0ro: Bubble: <span>{bc}</span> comparisons · <span>{bs}</span> swaps ({bst}) | Merge: <span>{mc}</span> comparisons · <span>{mm}</span> moves ({mst})
s0final: Final score: on the same {n} cards, bubble needed <b>{bc}</b> comparisons, merge only <b>{mc}</b> — about <b>{x}</b>× fewer. And the larger n gets, the wider that factor grows. The next six steps take this gap apart.
:::

## Bubble and selection: honest bookkeeping for the simple sorts {#step1 h2=s1t}

::: strings
nav1: 1 The O(n²) Family
:::

Step 1 · The O(n²) Family {#s1k .step-kicker i18n=text}

**Bubble sort**: compare neighbours, swap if they are out of order, and the large values “bubble” to the end. The version on this page has an **early exit** — a full pass with no swaps means the array is sorted, so it stops at once. **Selection sort**: each round, scan the unsorted part for its minimum and put it in place. Step through and watch the counters: selection’s comparison count **depends only on n, never on the data**; bubble’s swap count equals the array’s **inversion count** exactly (pairs of elements in the wrong relative order). Change the seed, change the data, and check for yourself. {#s1e .explain}

Selection comparisons ≡ n(n−1)/2 · Bubble swaps = inversions · Bubble (early exit) on sorted input: n−1 comparisons {#s1formula .formula i18n=text}

::: html step1-1
algBubble: Bubble
algSelection: Selection
presetRandom: Random
presetNearly: Nearly sorted
presetSorted: Sorted
presetReversed: Reversed
stepCmp: One comparison
play: Play
tblAlgo: Algorithm
tblBest: Best
tblAvg: Average
tblWorst: Worst
tblNote: Counting convention (matches the code on this page)
tblBubNote: Early exit; swaps = inversions
tblSelNote: Comparisons always = n(n−1)/2, data-independent
:::

Try the “Reversed” data: bubble’s swaps shoot up to n(n−1)/2 (every pair is an inversion), while selection does not blink — its comparison count does not move at all; only its swaps change. Same O(n²) family, opposite temperaments: one is data-sensitive, the other data-blind. {#s1hint .hint}

::: strings
pause: Pause
stRunning: running
stDone: sorted
stReady: ready
cmpLab: comparisons
swpLab: swaps
movLab: moves
opsLab: ops
s1roB: Bubble: <span>{c}</span> comparisons · <span>{s}</span> swaps (inversions of the original array = <span>{inv}</span>) · {st}
s1roS: Selection: <span>{c}</span> / {f} comparisons · <span>{s}</span> swaps · {st}
s1noteBubSorted: Sorted input + early exit: bubble finished after a single pass — exactly n − 1 = {v} comparisons. The “best case O(n)” in the table below is precisely this scene, and it exists only because of the early exit; an implementation without one does not get it.
s1noteBubDone: Reconciled: bubble’s total swaps {s} = inversion count {inv}, to the unit. Every adjacent swap removes exactly one inversion — never more, never less.
s1noteSel: Reconciled: selection’s comparisons {c} match the formula n(n−1)/2 = {f}. Whatever the data, every round scans the whole unsorted remainder — the bill is set by n alone.
:::

## Merge and quicksort: cut the problem down {#step2 h2=s2t}

::: strings
nav2: 2 Divide & Conquer
:::

Step 2 · Divide & Conquer {#s2k .step-kicker i18n=text}

**Merge sort**: split the array in the middle (left half ⌊n/2⌋), sort both halves recursively, then zip them back together — merging only ever compares the two “heads”, smaller one out first. Each level of merging costs about n comparisons in total, there are about log₂n levels, and the product is n log₂ n. **Quicksort** plays by rules printed right here: **the pivot is the last element**, partitioned Lomuto-style — small values swept left, large ones stay right — then recurse on both sides. Different rules, different ledger; that is why the rules are printed on the page. {#s2e .explain}

::: html step2-1
algMerge: Merge
algQuick: Quick
:::

The two panels are independent, and their counts never carry over: the merge panel counts its own comparisons and moves, the quicksort panel its own comparisons and swaps — switching across always shows that side’s own progress. {#s2panelNote .hint i18n=text}

::: html step2-2
s2formulaM: Merge: ≈ n comparisons per level × log₂n levels ≈ n·log₂n
s2splitCap: This is what the splitting looks like: halve, halve again (left half ⌊n/2⌋), down to segments of one. Splitting itself involves **no comparisons and is never counted**, so it gets no frames of its own — the animation below starts at the first merge and is exactly this split tree being merged back together, bottom-up.
s2formulaQ: Quicksort (rules on this page): pivot = last element, Lomuto partition; in random mode the pivot is drawn uniformly from the current range
s2pivotLab: Pivot rule
s2lastP: Last element
s2randP: Random
tblMerNote: Split always takes the left ⌊n/2⌋; moves = writes into the main array
tblQuiNote: Pivot = last element (the rule on this page); worst case = sorted input
:::

Merge’s “moves” count writes into the main array during merging: every element is written back once per level, so moves run to about n·log₂n — it trades extra memory for a guaranteed shape. Quicksort partitions in place and needs almost no extra space, but its shape is at the pivot’s mercy. Two flavours of n log n, two completely different ledgers. {#s2hint .hint}

::: strings
algCounting: Counting
s2splitLv: Lv {k}
s2roM: Merge: <span>{c}</span> comparisons · <span>{m}</span> moves · {st}
s2roQ: Quick: <span>{c}</span> comparisons · <span>{s}</span> swaps · <span>{p}</span> pivots placed · {st}
s2noteWorst: Degeneration, as promised: sorted input + last-element pivot finalises exactly one element per partition, and the comparison count marches to n(n−1)/2 = {f} (this run: {c}). The implementation is not broken — this is the rule’s true fate on this data, and the recurrence T(n) = T(n−1) + (n−1) says exactly that.
s2noteRand: Same sorted deck, random pivot instead: comparisons drop to {c}. Mind the wording — randomisation buys n log n **in expectation**: an unlucky draw can still pick a bad pivot. What it guarantees is that no input can reliably ambush you — not that every run is fast.
:::

## Let the numbers draw the shape themselves {#step3 h2=s3t}

::: strings
nav3: 3 The Counting Bench
:::

Step 3 · The Counting Bench {#s3k .step-kicker i18n=text}

One seed, one data distribution (random permutations), n doubling from 50 to 800, all four algorithms run for real — **every count in the table is counted by the counters, not typed in**. Read the table first: each doubling of n multiplies the n² family’s count by about 4, the n log n family’s by only about 2.2. Then the plot: both axes in log₂, reference lines of slope 1 and slope 2, and the slope the measured points form on their own *is* the shape of growth — no memorising, just counting and plotting. Quicksort runs with a random pivot, so its row reads its **typical case**; change the bench seed and the whole table plus slopes recompute, staying self-consistent. {#s3e .explain}

::: html step3-1
s3run: Run it again
:::

Comparisons (really counted) {#s3tblCounts .tbl-title i18n=text}

::: html step3-2
:::

Doubling ratios (each ÷ the previous column, computed from the table) {#s3tblRatios .tbl-title i18n=text}

::: html step3-3
:::

Fitting method: least-squares line through each curve’s 5 points (log₂ n, log₂ comparisons); the slope is the readout. The n² family should hug 2; the n log n family sits a little above 1 — the excess is the log factor’s small tail showing through in log coordinates. Note also that the bubble and selection lines nearly coincide on this plot: both counts run to about n²/2 and hug each other in log coordinates, tighter as n grows. The bubble line is therefore drawn with a wide pink halo and the orange selection line runs down its middle — follow the pink edge to trace bubble on its own. {#s3figNote .hint}

Watch the doubling ratios: at n = 50 the four counts are still within shouting distance; by n = 800 the shapes have pulled orders of magnitude apart. That is what “Big O is a long game” means — it does not predict who wins on small data; it predicts who collapses first as data grows. {#s3hint .hint}

::: strings
s3ro: Seed = <span>{seed}</span> · fitted slopes are computed on the spot from this table’s numbers by least squares (method in the figure note) · quicksort = random pivot, typical case; the rest are measured on random permutations
s3slope: Fitted slope
s3ratioTo: →
cvRef2: reference slope 2
cvRef1: reference slope 1
cvAxisY: comparisons (log₂)
cvAxisX: n (log₂)
:::

## Big O is a shape, not a speed {#step4 h2=s4t}

::: strings
nav4: 4 The Constant Duel
:::

Step 4 · The Constant Duel {#s4k .step-kicker i18n=text}

Big O throws the constants away, but constants still exist. Let A do “heavy operations” at cost **100·n·log₂n**, and B do “light operations” at cost **n²**. A has the better shape but a 100× unit price; B has the worse shape and is dirt cheap. For small n, B wins — do not laugh yet; as n grows, the two curves must cross somewhere. The crossing is not guessed: below, one integer n on each side of it has both costs computed in front of you. {#s4e .explain}

A(n) = 100 · n · log₂n (heavy ops) vs B(n) = n² (light ops) {#s4formula .formula i18n=text}

::: html step4-1
s4nLab: n (log slider)
s4termT: The dominant term: lower terms get outgrown
s4termE: Take f(n) = 2n² + 100n. While n is small, the 100n term still holds a big share; as n grows, the balance tips entirely to 2n². Big O keeps only the highest term and drops coefficients and lower terms — not because they do not exist, but because **at large enough n, they no longer get a vote**. Try a few values of n and watch the shares move.
:::

Honest bookkeeping: everything on this step compares **operation counts**, never wall-clock seconds. Real time also depends on hardware, language, caches and craft — but “past the crossover, the shape rules” holds on every machine. Production sorts switching to simple algorithms on small inputs are this crossover, put to work (step 6). {#s4hint .hint}

::: strings
s4ro: n = <span>{n}</span>: A = <span>{a}</span> · B = <span>{b}</span> → <b>{w}</b> is cheaper (by <span>{d}</span>)
s4winA: A (better shape)
s4winB: B (smaller constant)
s4cross: Crossing, self-verified: n\* = <span>{x}</span> is the first integer where A wins — at n = {xm}, A = {am} > B = {bm} (B wins); at n = {x}, A = {ax} < B = {bx} (A wins). Both readouts are computed live from the cost functions.
s4termRo: n = <span>{n}</span>: 2n² = <span>{q}</span> (<span>{qp}</span>%) · 100n = <span>{l}</span> (<span>{lp}</span>%) → f(n) is recorded as <b>O(n²)</b>
cvCross: crossover n\* ≈ {x}
:::

## Counting sort: the sort that never compares {#step5 h2=s5t}

::: strings
nav5: 5 Counting Sort
:::

Step 5 · Linear Time {#s5k .step-kicker i18n=text}

When values live in a bounded range (0 to k), there is a gloriously unfair trick: **never compare anything** — treat each value as an address, count how many times each value occurs (the buckets), then pour the elements back out in value order. Operations = one counting pass (n) + one bucket sweep (k+1) + one output pass (n): linear in n. Watch the comparison counter through the whole demo: it stays at **0**. {#s5e .explain}

Ops = n (count) + (k+1) (sweep buckets) + n (output) = 2n + k + 1 · Comparisons = 0 · Memory = k + 1 cells {#s5formula .formula i18n=text}

::: html step5-1
s5kLab: k · value-range cap (values in 0..k)
s5step: One operation
s5blow: Stretch the range to 100000
:::

Terminology discipline: comparison sorts have a lower bound of Ω(n log n), but it only constrains algorithms that learn through pairwise comparisons. Counting sort never compares, so it does not “break” the bound — it sidesteps the bound’s premise by using values as addresses. Linear time is never free: the moment the range k loses its bounds, bucket memory and sweep cost bite back (try the button above). {#s5hint .hint}

::: strings
seedLab: Seed
s5blowOff: Back to a small range
s5ro: Counting sort: <span>{ops}</span> / {total} ops · <span>0</span> comparisons · {st} | Merge sort on the same data: <span>{mc}</span> comparisons
s5roBlow: The range bites back: n = {n}, k = {k} — counting sort needs <span>{ops}</span> ops ({kb} of them just sweeping buckets) and <span>{mem}</span> memory cells; merge sort sorts the same data with only <span>{mc}</span> comparisons. It did not lose on n — k dragged it down.
cvIn: Input (n = {n})
cvBuckets: Buckets (value → count)
cvOut: Output
cvBucketsBig: Buckets: {k} cells — only the first stretch fits the canvas; the rest are empty cells
:::

## Sorting in the real world: hybrids and judgement {#step6 h2=s6t}

::: strings
nav6: 6 Finale · The Real World
:::

Step 6 · Finale {#s6k .step-kicker i18n=text}

::: html step6-1
c1h: Production sorts are hybrids
c1: Almost every sort you actually use is a crossbreed: **Timsort** (Python, Java) is built on merge sort, stirs in insertion sort, and first scans the data for naturally ordered runs to exploit; the C++ standard library’s **introsort** leads with quicksort, falls back to heapsort when recursion runs too deep, and finishes shallow pieces with insertion sort. No purebred wins on every dataset — engineering’s answer is the hybrid.
c2h: For small n, simple wins
c2: The hybrids share one detail: once a piece shrinks to a few dozen elements, they switch back to a plain O(n²) loop like **insertion sort** — exactly the crossover from step 4: at small n, the low-constant, straightforward algorithm is genuinely cheaper. O(n²) on small data is not a sin; it is value for money.
c3h: Choosing: look at n and the data first
c3: Faced with data to sort, ask four questions: **how big is n** (it sets the shape’s weight), **is it nearly sorted** (Timsort and early-exit sorts profit), **is the value range bounded** (counting sort’s opening), **must it be stable** (do equal elements keep their relative order)? Shape first, constants second — that ruler is the whole page.
s6fin: One line back to the neighbouring page, <a class="fourier-link" href="../../ml/gradient-descent/#step2">Gradient Descent</a>: there, cost was “how cheap is each step × how many steps”; here, it is “how cheap is each comparison × how many comparisons”. Cost is always two factors multiplied — one sets the unit price, the other the quantity, and the quantity’s **shape of growth** has the final say. Learn to see the shape, and you own a ruler for every algorithm.
:::
