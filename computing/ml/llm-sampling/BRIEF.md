# How an LLM writes word by word (llm-sampling) · build brief

- Slug: `llm-sampling` · category: `computing` · stage: `university` (outline v2 draft "R" pool; existing ids only)
- Built-By: Claude Sonnet (claude-sonnet-5-5) via Mini Claude Code, batch b4, first edition. Verified-By: author self-check only (node probe + headless Chrome smoke incl. canvas-text clipping check at 390px); no independent review.
- Template used (structure only): `cell-structure`; shared b4 canvas-page scaffold. Not a Codex edition; footer credit line shown (provenance spec unclear for Claude editions, flagged).
- Dedup: closest `entropy`, `montecarlo`, `attention-mechanism` (my own b4 page, which covers softmax scaling inside attention, not decoding). No page covers decoding/sampling. Overlap low.

## Steps

### Step 0 · The next-word probabilities
- Reader knows: nothing about LLMs; probability as numbers summing to 1.
- One question: what does the model output at each step?
- Inputs / quantity: chosen prompt (3 hand-set prompts, 10 candidate words each); sought: softmax probabilities, entropy (bits) and effective number of options 2^H.
- Controls / expected: switching prompt changes the bars; "capital of France" gives one word ≈ 94.5%, "weather" gives several close words.
- Holds when: logits are hand-set, not from a real model.

### Step 1 · Temperature
- Reader knows: softmax output (step 0).
- One question: how does T sharpen or flatten the distribution?
- Inputs / quantity: T ∈ [0.05, 3]; sought: p ∝ e^(z/T), top probability, entropy.
- Controls / expected: T small → one bar dominates (entropy → 0), T large → flat; dashed outline = T = 1.
- Holds when: temperature only reshapes; no new knowledge.

### Step 2 · Trimming the tail
- Reader knows: temperature (step 1).
- One question: how can the unreliable tail be cut?
- Inputs / quantity: T, k (1–10), p (0.05–1); order: temperature → top-k → top-p → renormalise; sought: kept words, original mass covered, entropy after.
- Controls / expected: k = 1 leaves one word with 100%; shrinking p drops tail bars to grey; mass covered drops.
- Holds when: nucleus rule = fewest top words whose renormalised cumulative ≥ p.

### Step 3 · Sampling
- Reader knows: the final distribution (steps 1–2).
- One question: how many draws until frequencies look like probabilities?
- Inputs / quantity: T, p, number of draws (1/100/1000, fixed seed 2024); sought: frequencies vs target, TV distance.
- Controls / expected: counts accumulate with each press, TV shrinks (≈1/√N); changing T, p or prompt clears counts and the readout says so; Reset clears counts and restores defaults.
- Holds when: ideal sampling from the stated distribution with a pseudo-random generator.

### Step 4 · Word by word
- Reader knows: sampling (step 3).
- One question: what gets written when the draw is repeated?
- Inputs / quantity: T, seed; sought: sequence, repeat rate of 3-grams.
- Controls / expected: T = 0.1 → "the cat sat on the cat sat on…" loop, repeat rate > 80%; T = 3 → disordered, repeat rate < 10%. "New seed" clears the sentence (label says so); Reset restores T = 1, seed 1 and clears the sentence.
- Holds when: first-order toy model (looks only at the previous word).

### Step 5 · Finale
- Recap and limits; deep links entropy#step2, attention-mechanism#step1, montecarlo#step1.

## New terms (first appearance)
| Term | Step | Plain definition at point of use |
|---|---|---|
| logit, softmax, probability | 0 | raw score; turns scores into probabilities summing to 1 |
| entropy, effective number of options | 0 | spread of the distribution; 2^entropy |
| temperature T | 1 | divide scores by T before softmax |
| top-k, top-p (nucleus) | 2 | keep k best; keep fewest words reaching cumulative p |
| total variation distance | 3 | ½Σ|frequency − probability| |
| repeat rate | 4 | repeated 3-word groups / all 3-word groups |

## Simulation versus reality / model mismatch
Scores are hand-set; the step-4 model is first order. Real LLMs have large vocabularies, use full context, and add repetition penalties, min-p, beam search etc. Temperature and truncation do not improve truthfulness. Sampling uses fixed pseudo-random seeds. Not validated by a human learner walk-through.
