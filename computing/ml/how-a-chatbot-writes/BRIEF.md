# BRIEF · how-a-chatbot-writes 聊天 AI 是怎么“写”出一句话的

- Built-By: Claude Code (claude-opus-5-5), essay batch 3, 2026-11-11
- Verified-By: self-check (node model test, browser smoke test, canvas sweep, screenshots at 1280/390/320 and reduced motion, full re-read of the rendered zh prose); no independent review yet (pending)
- category `computing`, subtopic `ml` (机器学习 / Machine Learning), stage `senior`
- Format: one long interactive essay (style of `demos/scarcity-moves`, as in `biology/body/body-in-balance`). Not a step page; no provenance label yet (the integrator adds it once a commit exists).
- Files:
  - `index.html`: markup and styles. Static Chinese `<title>` and meta description; the toggle reads 中 | EN.
  - `copy.zh.js`: all visible text. `copy.en.js` is loaded if present; it is absent in this batch, so every key falls back to zh.
  - `corpus.zh.js` and `corpus.en.js`: the hand-written training corpora. The corpus follows the copy language.
  - `models.js`: pure models, UMD (`window.ChatModels`).
  - `app.js`: wiring, drawing, i18n and IntersectionObserver gating.
  - `tests/models.cjs` and `tests/browser.cjs`.

## The one question

When you type a question, how does a chatbot produce a sentence back?

The essay answers by building the machine in the reader's browser, one part at a time:
1. Cut the text into tokens (ch1).
2. Count what follows what (ch2–3).
3. Make similar words similar numbers (ch4).
4. Let each token look back at the others (ch5).
5. Turn a probability table into one choice (ch6).
6. Learn the table by gradient descent on cross-entropy (ch7).
7. Loop one token at a time, then compare the scale with published models (ch8).

Ch9 gives three questions to bring to any chatbot.

The page explains the mechanism, not any product. It makes no claim about understanding or consciousness: ch8.p5 says outright that it does not discuss that question.

Every number in the prose is filled from `ChatModels.facts()` at load time. The node test recomputes each one and asserts that the rendered string contains it.

## Chapters

Each entry gives the law, the model (and the standard result it implements), the reader's controls, what the reader finds, and the limits.

1. **Tokens / 切成 token** (`#ch1`)
   - Law: models read and write tokens, entries in a list learned from text.
   - Model: BPE (Sennrich, Haddow & Birch 2016). Chinese text is pre-split at punctuation runs. English is GPT-2 style: each word carries its leading space.
   - Controls: a merge-count slider over all merges, and an input box for the reader's own sentence. Unseen characters are marked.
   - Finds (zh): the first merge is 喜欢 (33 times). At the stop, merge 63, the 1,862 characters become 1,213 tokens and the vocabulary has 233 entries. Merging to the end (192 merges) produces whole sentences such as 苹果和香蕉都是水果.
   - **Stop rule (tuned):** stop when the best pair occurs fewer than `minPair` times (zh 5, en 3). The prose says this is my rule.
   - Limits: the tokenizer starts from characters, not bytes; the corpus is tiny.
2. **Bigram / 一张计数表** (`#ch2`)
   - Law: the simplest language model is a table of what followed each token.
   - Model: maximum-likelihood bigram counts (Shannon 1948).
   - Controls: a context picker, bars, and a "write a sentence" button.
   - Finds: after 小猫 come 21 occurrences across 13 different tokens; the top one is 和 (3 times).
   - Limits: anything unseen gets zero probability.
3. **n-gram and sparsity / 多看几个 token** (`#ch3`)
   - Law: longer context gives smoother text, but on a small corpus it copies more and is lost on new contexts.
   - Model: n-gram counts up to context length 3, with longest-seen-context backoff.
   - Controls: a context-length slider (0–3) and three sentences per draw.
   - Bars per context length (0/1/2/3):
     - verbatim corpus sentences among 200 samples: 0/4/65/164;
     - unseen-context steps on 20 held-out sentences: 0/0/14/36 %;
     - zero-probability steps on the same sentences: 0/14/38/56 %.
   - Limits: no smoothing.
4. **Word vectors / 把词变成一串数** (`#ch4`)
   - Law: a word's neighbours give it numbers; similar use leads to similar numbers.
   - Model: a PPMI co-occurrence matrix factorised by symmetric eigendecomposition (cyclic Jacobi), with vectors U·√|λ| (Levy, Goldberg & Dagan 2015). Neighbours by cosine similarity. The 2-D map is a PCA of the normalised vectors.
   - Controls: the number of dimensions (1–24, default 8), the query word, and clicking on the map.
   - Finds: the nearest word to 小猫 is 小狗 (cosine 0.95). At 8 dimensions, 19 of the 22 map words have a same-kind nearest neighbour; at 2 dimensions, 8 do.
   - **Tuned:** the ±2 window, min count 3, 24 dimensions and the default of 8.
   - Limits: the corpus was written so that same-kind words share sentences, and the ch4 limit says so.
5. **Attention / 一个注意力头** (`#ch5`)
   - Law: each token scores the earlier tokens and mixes their information by the weights.
   - Model: scaled dot-product attention (Vaswani et al. 2017) with a causal mask, plus a linear distance penalty (ALiBi, Press et al. 2022). Values are the ch4 vectors.
   - Controls: pick a position and a distance-penalty slope (0–2). The arithmetic is shown in a table.
   - Finds: 它 gives 93 % of its weight to 苹果. With slope 2, 95 % of it stays on itself (它).
   - **Tuned:** the queries and keys are hand-set on four features (person, thing, action, small word). The page says so in ch5.limit and in the footer.
6. **Sampling / 温度、top-k、top-p** (`#ch6`)
   - Law: the model outputs a probability table; temperature and truncation change only how it is drawn from.
   - Model: p^(1/T) renormalised, with T = 0 meaning greedy; then top-k (Fan et al. 2018), then top-p / nucleus (Holtzman et al. 2020). The distribution is the real n-gram one from ch3.
   - Controls: T (0–2), k (0 = off, up to 10) and p (0.05–1), plus 5 sample sentences.
   - Finds (context 喜欢吃):
     - top probability: 15 % at T = 1, 24 % at T = 0.5, 12 % at T = 2;
     - distinct sentences out of 100: 1 at T = 0, 84 at T = 0.5, 97 at T = 1.
7. **Training / 当场训练一个小网络** (`#ch7`)
   - Law: training raises the probability of the true next token, one small step at a time.
   - Model: a low-rank bigram network, logits = E[a]·W + b, trained by full-batch gradient descent on mean cross-entropy.
   - Bounds: the loss starts near ln V = ln 180 ≈ 5.19. Its floor is the conditional entropy of the bigram counts, 1.64 nats (perplexity 5.2). The floor is exact, because a softmax row can match the count frequencies.
   - Controls: learning rate in 7 steps (0.5–50), d ∈ {2,4,8,16,32}, train/pause, re-initialise. Bars show the network's probabilities against the count table.
   - Finds: at d = 8 and learning rate 5, the loss reaches within 0.1 of the floor in 3,000 steps (tested). At d = 2 it stays more than 0.5 above the floor. At learning rate 50 it diverges.
   - **Tuned, and the page says so in ch7.limit:** the learning-rate steps, initial scale 0.1 (seed 1) and 90 steps/s animation.
8. **The loop and scale / 一次一个 token** (`#ch8`)
   - Law: writing is the ch2–6 steps repeated: read the context, get the table, draw, append.
   - Model: the ch3 n-gram generator with backoff, stepped one token at a time from the prompt 今天早上，.
   - Controls: step, finish, reset, context length (0–3) and T.
   - The scale table compares:
     - the n-gram table at context 3: 1,617 entries;
     - the trained network: 3,060 parameters;
     - GPT-3 and Llama 3 405B (sourced).
   - The gap is computed: more than 7 orders of magnitude in parameters and more than 8 in training tokens, against GPT-3.
   - Then a paragraph on RLHF (InstructGPT) and the limits of what the page shows.
9. **Three questions / 带着这把钥匙用聊天 AI** (`#ch9`)
   - Three questions, four things the reader can now explain, and links to the site's llm-sampling, embeddings, attention-mechanism, gradient-descent, backpropagation, overfitting, entropy and markov-chains pages. All anchors were checked.

## Parameters that are tuned, not sourced

- `minPair` 5 (zh) / 3 (en): the BPE stop rule. Said in ch1.p3.
- PPMI window ±2, min count 3, 24 dimensions, default 8 (`K0`).
- The attention queries and keys (hand-set). Said in ch5.limit and the footer.
- Learning rates [0.5, 1, 2, 5, 10, 20, 50]; init seed 1, scale 0.1; RATE 90 steps/s, at most 8 per frame. Said in ch7.limit.
- Sample counts: 200 runs (ch3), 100 samples with seed 3 (ch6), 20 held-out sentences; a 30-token cap in ch8.
- Both corpora are hand-written for this page (163 zh lines plus 20 held-out sentences). Said in ch1.limit and ch4.limit.

## Real-world figures and sources (checked 2026-11-11)

| Figure in the page | Source actually checked |
| --- | --- |
| GPT-3: 175B parameters, 96 layers, 96 heads, d_model 12288, 300B training tokens, context 2048 | Brown et al. 2020, *Language Models are Few-Shot Learners*, arXiv:2005.14165. Abstract (175B); Table 2.1 row "175.0B 96 12288 96 128"; §2.2 "trained for a total of 300 billion tokens"; n_ctx = 2048 (read via ar5iv). |
| Llama 3: 405B parameters, 126 layers, 15.6T text tokens, 128K vocabulary, context up to 128K | Llama Team, Meta 2024, *The Llama 3 Herd of Models*, arXiv:2407.21783 (arxiv.org/html). Quotes: "405B trainable parameters on 15.6T text tokens"; "vocabulary with 128K tokens"; 126 layers in the model-size table; 128K context in the abstract. |
| Chat assistants are made by supervised demonstrations plus RLHF on human rankings | Ouyang et al. 2022, *Training language models to follow instructions with human feedback*, arXiv:2203.02155 (abstract). |
| Greedy/beam text is "bland and strangely repetitive"; nucleus sampling truncates "the less reliable tail" | Holtzman et al. 2020, *The Curious Case of Neural Text Degeneration*, arXiv:1904.09751 (abstract and §1 via arxiv html). |
| ALiBi: a penalty proportional to distance added to attention scores | Press, Smith & Lewis 2022, *Train Short, Test Long*, arXiv:2108.12409 (abstract). |
| BPE for subword segmentation | Sennrich, Haddow & Birch 2016, *Neural Machine Translation of Rare Words with Subword Units*, arXiv:1508.07909 (abstract). |
| −ln 1 % = 4.6; UTF-8 uses 3 bytes for common CJK characters | Arithmetic, and the UTF-8 encoding table (U+0800–U+FFFF → 3 bytes); the RFC itself was not opened. |

Cited as the origin of a named method, not opened: Shannon 1948, Vaswani et al. 2017, Fan et al. 2018, Levy, Goldberg & Dagan 2015.

## Fixes made after looking at the page

- **The ch3 and ch8 context sliders ran 1–4.** The code reads the value as the context length, and the prose says 0–3. At 4 the page threw (`ngramDist` asked for an order-5 table) and printed ∞. The browser test found it. Both ranges are now 0–3, and both tests pin that the range equals the table's orders.
- **The ch1 stop rule was not presented as my choice.** ch1.p3 now says so, giving the threshold and the count of the next pair (both from `facts()`). ch7.limit now says the learning rates, init scale and animation rate are chosen for the demo.
- **Layout fixes from screenshots:** the list indentation of the merge list and sentence lists; the attention weight percent hidden behind its bar; the ch4 selected label touching its ring.
- **Prose fixes from re-reading:** the ch3 example (很→甜 versus 小猫很→可), the ch4 cat/dog sentence, ch1 "出现过两次", the ch7 scale sentence and the ch3 "很多倍".

## Checked / not checked

Checked:
- `node computing/ml/how-a-chatbot-writes/tests/models.cjs` gives `PASS: 528 checks`. For both corpora it checks:
  - the relations: the stop rule; copying and sparsity rising with context; good8 > good2; the ch5 results; temperature monotonicity; the distinct-sentence ordering; that `shape()` is correct; floor = conditional entropy; the untrained loss ≈ ln V; d = 8 reaching the floor; d = 2 stalling; lr 50 diverging; determinism.
  - the zh literal claims, every placeholder supplied, and no Chinese outside copy/corpus files except 中 and the static title/meta.
- `ESSAY_BASE_URL=http://127.0.0.1:18962 node …/tests/browser.cjs` passes in zh at 1280/390/320. It covers:
  - no overflow and no clipped text; every control at least 48 px; the toggle with copy.en.js absent;
  - every control of the eight models driven to its extremes, with each live sentence checked for unfilled placeholders, NaN or undefined;
  - training, divergence and d = 2;
  - reduced motion: no smooth scroll, the button trains 200 steps, nothing runs by itself;
  - no errors.
- `tests/canvas-text-overlap.cjs --sweep` gives `PASS: 732 canvas states … zh/en` (scroll-aware mode).
- I looked at screenshots of every chapter at 1280, 390, 320 and at 390 with reduced motion.

Not checked:
- No English copy exists yet. The English corpus is built and tested in node, but the en layout and en live sentences have not been seen in a browser.
- There was no independent review. The four cited-but-unopened papers above were not re-read.
- Behaviour on real touch devices and with screen readers was not checked, beyond aria labels on the canvases.
