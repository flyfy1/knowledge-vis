# Decision trees and information gain · build brief

- Slug: `decision-trees` · category: `computing` · stage: `university` (outline v2 draft "R" pool; existing ids only)
- Built-By: Claude Sonnet (claude-sonnet-5-5) via Mini Claude Code, batch b4, first edition. Verified-By: author self-check only (node probe + headless Chrome smoke incl. canvas-text clipping check); no independent review.
- Template used (structure only): `cell-structure`; shared b4 canvas-page scaffold. Not a Codex edition; footer credit line shown (provenance spec unclear for Claude editions, flagged).
- Dedup: closest `entropy` (teaches entropy, Huffman, twenty questions with binary entropy; no splitting of data or trees). Overlap well under 80%.
- Cross-link: step 3 text links to `../overfitting/#step1` (added after that sibling page was built and verified).

## Steps

### Step 0 · Impurity
- Reader knows: nothing beyond proportions; entropy is linked.
- One question: how can one number measure how mixed a group is?
- Inputs / quantity: number of squares k out of 40; sought: p = k/40, entropy H (bits), Gini 2p(1−p).
- Controls / expected: dots recolour, both curve markers slide; both peak at p = 0.5 (H = 1, G = 0.5) and are 0 at the ends.
- Holds when: two classes.

### Step 1 · Where to cut
- Reader knows: impurity (step 0).
- One question: what makes a single cut good?
- Inputs / quantity: feature (x/y), threshold; sought: counts both sides, entropy before/after, information gain, best threshold.
- Controls / expected: the white line moves, the orange dot moves along the gain curve; the white dot marks the maximum.
- Holds when: this 80-point data set (seed 7, 8% flipped labels); gain wobbles with samples.

### Step 2 · Growing a tree
- Reader knows: a single best cut (step 1).
- One question: how does the tree grow when every region is cut again?
- Inputs / quantity: number of cuts 0–15 (best-first, weighted gain); sought: leaves, training accuracy, misclassified points.
- Controls / expected: slider or Auto grow (one cut per 0.55 s) adds cuts, the partition refines, red rings shrink, accuracy rises 61% → ~99%; Reset returns to 0 cuts and stops the demo.
- Holds when: greedy best-first, axis-parallel cuts, training accuracy only.

### Step 3 · How deep
- Reader knows: growth (step 2).
- One question: does a deeper tree also do better on new data?
- Inputs / quantity: max depth 1–10, label noise 0–25%; sought: training accuracy and accuracy on 600 clean new points per depth.
- Controls / expected: at noise 8% train → 100% while test peaks at depth 3 (97%) then falls to ~91%; at noise 0 the test curve does not fall.
- Holds when: this fixed data set and seeds; no pruning or cross-validation.

### Step 4 · Using the tree
- Reader knows: a trained tree (steps 2–3).
- One question: how does the tree classify a new point?
- Inputs / quantity: depth, query (x, y); sought: path, leaf counts, predicted class, confidence = majority share.
- Controls / expected: crosshair moves, path highlights in the tree, leaf box highlights on the partition; shallower tree = fewer questions.
- Holds when: confidence is not a calibrated probability.

### Step 5 · Finale
- Recap and limits; deep links entropy#step3, binary-search#step1, bayes#step1.

## New terms (first appearance)
| Term | Step | Plain definition at point of use |
|---|---|---|
| impurity, entropy, Gini | 0 | how mixed a group is; formulas given |
| entropy after the cut, information gain | 1 | weighted entropy of both sides; before − after |
| greedy | 2 | take the best cut now, never go back |
| leaf | 2 | region not cut further, predicts majority class |
| max depth, new data | 3 | most cuts from root to a leaf; 600 clean points from the true rule |
| confidence | 4 | majority share in the leaf |

## Simulation versus reality / model mismatch
Artificial 2-D data with a two-rectangle true rule; the 8% label noise is injected. Real trees handle many features, categorical splits, missing data, pruning and cross-validation, and are often used in ensembles. Accuracy comparisons are for this fixed data only. Not validated by a human learner walk-through.
