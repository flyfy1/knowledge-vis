# Attention mechanism · build brief

- Slug: `attention-mechanism` · category: `computing` · stage: `university` (outline v2 draft, "R" pool; existing ids)
- Built-By: Claude Sonnet (claude-sonnet-5-5) via Mini Claude Code, batch b4, first edition. Verified-By: author self-check only (node probe + headless Chrome smoke); no independent review.
- Template used (structure only): `cell-structure`; page code scaffold shared with the other b4 canvas pages. Not a Codex edition; footer credit line shown (provenance spec unclear for Claude editions, flagged).
- Dedup: closest pages `gradient-descent`, `entropy`, `linear-transform`; none teaches attention. No overlap.

## Steps

### Step 0 · Query and key
- Reader knows: vectors as arrows in a plane, dot product as a number (linear-transform).
- One question: how does one word score every other word for relevance?
- Inputs / quantity: chosen query word, query rotation and stretch; sought: score_j = q·k_j = |q||k|cosθ for each key.
- Controls / expected: pick a word, rotate the query; the highest bar moves to whichever key the arrow points at; stretching scales all bars proportionally and does not change which is highest.
- Holds when: 2-D hand-set toy vectors; nothing is trained.

### Step 1 · Scores to weights
- Reader knows: scores (step 0).
- One question: how do positive/negative scores become weights that sum to 1?
- Inputs / quantity: sharpness β; sought: softmax weights, their maximum, entropy in bits.
- Controls / expected: β up → top word takes nearly everything, entropy falls toward 0; β → 0 → weights flatten to 1/6, entropy → log2 6 = 2.58 bits. Standard β = 1/√d_k = 0.71 marked in the label.
- Holds when: softmax uses e^(β s) with max-subtraction for stability; query fixed at "sat".

### Step 2 · Weighted sum
- Reader knows: weights (step 1).
- One question: what is the word's new representation?
- Inputs / quantity: query direction (length 1.5 fixed, scale 1/√2); sought: output o = Σ w_j v_j and its trace over a full turn.
- Controls / expected: drag direction or press Sweep; weight bars and the arrow chain change, the green trace grows (bright = covered, grey = not yet); output stays within the span of the values. Reset stops the sweep and clears to 20°.
- Holds when: non-negative weights summing to 1 (convex combination).

### Step 3 · Sentence matrix
- Reader knows: one row of attention (steps 0–2).
- One question: what is the table when all six words ask at once, and what does the causal mask do?
- Inputs / quantity: query rotation, mask on/off, selected row; sought: 6×6 weights, row sums, upper-triangle total.
- Controls / expected: rotating changes the pattern; mask on → upper triangle exactly 0, first row one-hot, rows still sum to 1.
- Holds when: toy Q/K; rotation stands in for learned projection; mask applied before softmax.

### Step 4 · Why divide by √d
- Reader knows: softmax sharpness (step 1).
- One question: what happens to dot products as dimension grows?
- Inputs / quantity: d = 2^e (1–256); sought: sd of q·k (≈√d), of scaled q·k (≈1), mean largest softmax weight over 8 keys, 300 seeded trials.
- Controls / expected: d up → orange histogram widens, scaled one stays; mean max weight unscaled → ~1, scaled stays below ~0.6.
- Holds when: iid standard-normal components; gradient saturation is stated, not simulated.

### Step 5 · Finale
- Question: the three-stage recipe. Controls: three deep links (entropy#step1, linear-transform#step1, gradient-descent#step0). Holds under the model limits card.

## New terms (first appearance)
| Term | Step | Plain definition at point of use |
|---|---|---|
| key / query / value vector | 0 / 0 / 2 | what I am / what I look for / content I offer |
| dot product | 0 | multiply components and add; |q||k|cosθ |
| softmax, β | 1 | e^(βs) over their sum; β sharpness |
| entropy (bits) | 1 | spread of weights; 0 when one takes all |
| causal mask | 3 | only itself and earlier words visible |
| standard deviation | 4 | typical deviation from the mean |

## Simulation versus reality / model mismatch
d_k = 2 hand-set toy vectors; real attention uses learned projections, many heads, high dimension, positional information and layers. Attention weights are not a full explanation of a model's output. Step 4 uses a seeded random simulation (values wobble with seed; theory √d is the expectation). Not validated by a human learner walk-through.
