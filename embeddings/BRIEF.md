# Word embeddings · build brief

- Slug: `embeddings` · category: `computing` · stage: `university` (outline v2 draft "R" pool, entry `embeddings`; existing ids only)
- Built-By: Claude Sonnet (claude-sonnet-5-5) via Mini Claude Code, batch b4, first edition. Verified-By: author self-check only (node probe + headless Chrome smoke); no independent review.
- Template used (structure only): `cell-structure`; shared b4 canvas-page scaffold. Not a Codex edition; footer credit line shown (provenance spec unclear for Claude editions, flagged).
- Dedup: closest `linear-transform` (matrices on vectors) and `entropy`; no page teaches embeddings, cosine similarity or co-occurrence. No overlap.

## Steps

### Step 0 · Words as numbers
- Reader knows: a point on a plane has two coordinates.
- One question: how can a list of numbers stand for a word?
- Inputs / quantity: chosen x/y features and word; sought: the word's 5-D vector and position.
- Controls / expected: choose gender × royalty and king/queen/man/woman form a mirrored rectangle; other axes make words coincide (readout counts words at the same spot).
- Holds when: hand-set toy features (gender, royalty, age, human, alive); not learned.

### Step 1 · Measuring similarity
- Reader knows: vectors (step 0).
- One question: which quantity says two word vectors are alike?
- Inputs / quantity: words A, B, scale k for B; sought: dot product, norms, cosine, Euclidean distance, ranking of cosines to A.
- Controls / expected: scaling B changes bar heights and distance but the cosine stays exactly constant.
- Holds when: cosine ignores length; distance does not.

### Step 2 · Analogy arithmetic
- Reader knows: cosine (step 1).
- One question: why does king − man + woman land on queen?
- Inputs / quantity: A, B, C and λ ∈ [0, 1.2]; sought: result vector and nearest word by cosine (inputs excluded).
- Controls / expected: at λ = 1 the white dot sits on queen; small λ → nearest word is prince, λ ≥ 0.5 → queen.
- Holds when: toy 5-D features where the analogy is exact; plot shows only 2 of 5 dimensions.

### Step 3 · The nearest word
- Reader knows: analogy result is a point (step 2).
- One question: what is returned when the "right" word is not in the vocabulary?
- Inputs / quantity: vocabulary checkboxes; sought: ranked candidates for king − man + woman.
- Controls / expected: untick queen → princess (cos 0.951); untick princess too → girl (0.821). Reset restores all words.
- Holds when: candidates exclude the three inputs; cosine measures direction only.

### Step 4 · Look at the neighbours
- Reader knows: cosine similarity (step 1).
- One question: how can a machine obtain vectors without hand-made features?
- Inputs / quantity: sentences read k (0–14), window (1–2), target word; sought: co-occurrence counts and cosine between neighbour-count vectors.
- Controls / expected: Play reads one sentence per 0.35 s and counts accumulate; cat–dog cosine 0.667 at k = 14 (hand-checked: 4 shared neighbours of 6 each); king–queen 1.0. Reset restores k = 14, window 2 and stops reading.
- Holds when: tiny synthetic 3-word-sentence corpus; raw counts, not word2vec.

### Step 5 · Finale
- Recap and model limits; deep links attention-mechanism#step0, linear-transform#step1, eigen#step5.

## New terms (first appearance)
| Term | Step | Plain definition at point of use |
|---|---|---|
| word embedding, vector, dimension | 0 | fixed-length list of numbers per word; ordered list; one position |
| dot product, cosine, Euclidean distance, |A| | 1 | sum of per-dimension products; angle-only similarity; endpoint distance; vector length |
| λ | 2 | "how far" factor added by the page, 1 = full analogy |
| candidate / vocabulary | 3 | words allowed as answers |
| window, co-occurrence count vector | 4 | how far counts as neighbouring; counts of neighbours per target |

## Simulation versus reality / model mismatch
Hand-set 5-D features are interpretable by design; real embeddings are learned, hundreds of dimensions, not interpretable per axis, analogies often fail, and they inherit corpus bias. Step 4 uses raw counts on a 14-sentence synthetic corpus (windows > 2 change nothing because sentences have 3 words). No instrument or real-corpus measurement. Not validated by a human learner walk-through.
