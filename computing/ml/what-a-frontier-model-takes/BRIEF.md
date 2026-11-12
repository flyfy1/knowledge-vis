# BRIEF · what-a-frontier-model-takes 造出并运行一个最前沿的大语言模型，需要什么

- Built-By: Claude Code (claude-opus-5-5), deep essay queue 2 §7, 2026-11-11
- Verified-By: self-check (node model test, browser test at 1280/390/320 in zh, canvas sweep, screenshots at all three widths and under reduced motion, full re-read of the rendered zh prose). No independent review yet (pending).
- Category `computing`, subtopic `ml` (机器学习 / Machine Learning), stage `university`.
- Format: one long interactive essay, like `computing/ml/how-a-chatbot-writes`. It has no provenance label yet; the integrator adds one once a commit exists.
- Files:
  - `index.html`: markup and styles. It has a static Chinese `<title>` and meta description, and the toggle reads 中 | EN.
  - `copy.zh.js`: all visible text, including unit and number templates (`num.units`, `num.squeeze`, `u.*`). `copy.en.js` is loaded if present. It is absent, so every key falls back to zh.
  - `models.js`: pure models, UMD (`window.FrontierModels`). It contains no Chinese.
  - `app.js`: wiring, drawing, i18n, visibility gating and lazy loading of the weights. It contains no Chinese.
  - `tools/train.cjs`: trains the tiny transformer. It has its own forward pass, a hand-written backward pass and AdamW. `--check` runs a gradient check (worst relative error 3.2e-8). It writes `weights.js` and `tests/reference.json`. Run it with `node tools/train.cjs`; it takes about 2 min and uses seed 1 for 3000 steps.
  - `weights.js` (200 KB): the float32 weights in base64, the training record (every 50 steps) and attention snapshots. It is loaded only when the reader comes within 400 px of chapter 1, 4, 8, 9 or 11.
  - `tests/models.cjs`: forward pass vs the trainer's logits (max |Δ| = 0), KV-cache equivalence, parameter counts, and every prose number recomputed. 1207 checks.
  - `tests/browser.cjs`: layout and targets at three widths, driving every control to its extremes, live-sentence hygiene, default readouts vs prose, lazy loading and reduced motion.

## The one question

What does it take to build and run a frontier language model?

The answer is built from a real 27,930-parameter transformer that runs in the page and is scaled up with published configurations and prices:

1. One block, stepped through (ch1).
2. Why depth needs residuals and normalisation (ch2).
3. Counting parameters and FLOPs (ch3).
4. Training and a capability forming (ch4).
5. Scaling laws (ch5).
6. The training bill (ch6).
7. After pretraining, and what benchmarks can tell (ch7).
8. The KV cache (ch8).
9. The inference roofline and quantisation (ch9).
10. Mixture of experts and speculative decoding (ch10).
11. Ablation and interpretability (ch11).
12. The dated frontier (ch12).
13. Five questions for the next headline (ch13).

The essay gives no investment advice and makes no predictions. On consciousness it only describes the computation and says that a separate literature exists (ch12.q5).

## Chapters: model and the standard result it implements

1. **The block.**
   - Model: GPT-2-style pre-LN decoder in `models.js` (`TF.forward`). V 26, T 24, d 32, 2 layers × 2 heads, MLP 128, GELU (tanh), learned positions.
   - Result: Vaswani 2017 attention, Radford 2019 layout, Olsson 2022 induction heads. Positional schemes are described (learned, sinusoidal, RoPE, ALiBi).
2. **Depth.**
   - Model: `depthRun`, a random ReLU stack with He initialisation × gain, in three forms (plain, residual, pre-LN), forward and backward.
   - Result: He 2015/2016, Ba 2016, Xiong 2020.
3. **Counting.**
   - Model: `countParams` / `flopsPerToken`, covering GQA, SwiGLU, biases, tied embeddings and learned positions.
   - Result: these give exactly GPT-3 174,604,259,328, Llama 3 8B 8,030,261,248, 70B 70,553,706,496 and 405B 405,853,388,800. Forward ≈ 2N + 4LTd; training ≈ 6N.
4. **Training.**
   - Model: the real record from `tools/train.cjs` (AdamW β 0.9/0.95, weight decay 0.1, warm-up 200, cosine to 10%, clip 1, batch 32).
   - Result: the exact Bayes floor is 0.926 nat. Induction-head scores follow Olsson 2022.
5. **Scaling laws.**
   - Model: `chinLoss`/`chinOpt`, the closed-form optimum of L = E + A/N^α + B/D^β under C = 6ND.
   - Fits: Hoffmann 2022 (rounded) and the Besiroglu 2024 re-fit.
6. **The training bill.**
   - Model: `bill`. FLOP = 6ND; GPU-hours = FLOP / (peak × MFU × 3600); energy and cost follow.
7. **After pretraining.**
   - LoRA: `lora`, with Hu 2021 parameter counts and 16 bytes per parameter for mixed-precision Adam (Rajbhandari 2020).
   - Benchmarks: `benchReversal` (normal approximation) and `benchSim` (seeded simulation; ties count ½), with answer-key errors and contamination.
8. **KV cache.**
   - Model: `TF.cacheStep`/`TF.generate` on the tiny model, which gives the same output with and without the cache (tested). Operation counts are measured, not modelled.
   - Large models: `kvBytesPerToken`.
9. **Inference.**
   - Model: `serveStep`, a roofline in the style of Williams 2009. Weights plus every sequence's cache are read per step; compute is batch × (2N + attention) at 50% of peak; cost is GPU price ÷ tokens per second.
   - Quantisation: `TF.quantize`, symmetric round-to-nearest with one scale per output channel, re-measured on the same 150 sequences.
10. **Cheaper.**
    - Mixture of experts: `moeRoute`/`moeBalanceStep`, top-k routing with capacity (Fedus 2022) and bias balancing (Wang 2024, as in DeepSeek-V3).
    - Speculative decoding: `specTokens`/`specSpeedup`, Leviathan 2023, checked against `specSim`.
    - Distillation, RAG and reasoning tokens are described only.
11. **Inside.** Ablation by zeroing a head's output on the tiny model. Superposition (Elhage 2022) and SAEs (Templeton 2024) are described as research, with the dispute.
12. **Frontier.**
    - `FRONTIER` is the single data block in `models.js`, dated `2026-11`.
    - `records`/`computeTrend` give a least-squares log-linear fit.
    - Every fact carries one of three labels: 确立 (established), 已公布/已演示 (disclosed/demonstrated) or 估计/声称 (estimated/claimed).

## Figures of merit (default settings, all pinned by tests/models.cjs)

**Tiny model and chapter 1**
- 27,930 parameters.
- Position 12 'o' at 99.9%. Head 1.1 puts 85% on position 1.
- Position 4: 't' at 9%, against a Bayes-ideal 12.5%.

**Chapter 2**
- 48 layers, gain 0.8. Plain stack 7.3×10⁻⁶ (gradient 1.5×10⁻⁵). Residual 8.2×10³. Pre-LN 5.4 / 5.0.

**Chapter 3**
- Llama 3 70B at 8,192 tokens: 160 GFLOP per token, 13.4% of it attention. At 131,072 tokens: 71.2%.

**Chapter 4**
- Loss 3.76 → 2.84 by step 200.
- Accuracy on repeats 45% → 96% between steps 250 and 350; induction score 0.39 → 0.84.
- Final loss 0.957, perplexity 2.6; floor 0.926.
- Head 0.1: 43% previous-token attention; the other heads 4–13%.

**Chapter 5 (Epoch re-fit, C = 3.16×10²³)**
- Optimum: 531 亿 parameters, 9,920 亿 tokens, 18.7 tokens per parameter.
- The chosen point (1778 亿 / 2960 亿) has a loss gap of 0.017.
- GPT-3's loss needs 61% of GPT-3's compute.
- Hoffmann's rounded fit gives about 87 tokens per parameter.
- Llama 3 8B: 1,875 tokens per parameter, gap 0.054.

**Chapter 6 (Llama 3.1 405B)**
- 3.79×10²⁵ FLOP.
- 2,596 万 H100-hours at 41% MFU.
- 66 days on 16,384 GPUs.
- 1.8 万 MWh.
- About 6500 万 USD at $2.5/h.

**Chapter 7**
- LoRA on GPT-3, Q and V, r = 4: 18,874,368 trainable parameters, 1/9,251 of the total; memory 2.79 TB vs 350 GB (8×).
- Benchmark, 500 questions with a 2-point gap: ±3.5 points; reversal 22%.

**Chapter 8**
- Tiny model: 7,569,600 vs 648,192 MACs (11.7×).
- Llama 3 70B: 327,680 B per token; 42.9 GB at 128K.

**Chapter 9 (4×H100, Llama 3 70B, 16-bit, context 8,192)**
- Batch 32: 59 tokens/s per user, 1,889 tokens/s total, $1.47 per M tokens.
- Batch 1: 93 tokens/s per user, $29.8 per M.
- Batch 64: cache 172 GB, more than the 141 GB of weights.
- 4-bit: 111 tokens/s per user.
- Tiny-model quantisation: loss 0.985 → 0.991 at 4 bits; accuracy on repeats 96.7% at 3 bits and 15.5% at 2 bits.

**Chapter 10**
- Mixture of experts: 5.3× max/mean, 45.6% dropped. After 200 balancing rounds, 0% dropped and aux 2.4 → 1.0.
- Speculative decoding: 3.36 tokens per pass, 2.80×; best γ = 8 at 3.09×.

**Chapter 11**
- Without head 1.1: 0.6%. Without head 0.1: 16.6%. Without heads 0.0 or 1.0: 100%.

**Chapter 12**
- Record-setters grow 4.4×/yr. Verifiable points: 2.0×/yr. All points: 2.5×/yr.

## Facts that will go stale (all opened on 2026-11-11 unless noted; all in `FRONTIER` or copy `ch12.f.*`)

**Training compute (Epoch AI database)**
- Source: Epoch AI, *Notable/large-scale AI models* CSV, https://epoch.ai/data/large_scale_ai_models.csv, downloaded 2026-11-11.
- **Estimated:**
  - GPT-6 Astra (OpenAI, Sept 2026): 9.4×10²⁶ FLOP, "Likely", CI 5×10²⁶–2×10²⁷, basis "≥100k GB200".
  - Grok 4: 5×10²⁶ (Speculative).
  - Grok 3: 3.5×10²⁶.
  - GPT-4.5: 3.8×10²⁶.
  - Gemini 1 Ultra: 5×10²⁵.
  - GPT-4: 2.1×10²⁵.
  - Mistral Large 4 (Oct 2026): 1.24×10²⁵ (Confident).
- 25 entries above 10²⁵ and 4 above 10²⁶.
- Kimi K3, Mistral Large 4 and GLM-5 are open-weight, with total parameters between 700B and 2.8T (same CSV).
- Dates are entered as decimal years.

**DeepSeek-V4-Pro**
- Source: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- **Disclosed:** 1.6T total / 49B active parameters, 1M context, more than 32T tokens, MIT licence.
- **Company claim:** KV cache is 10% of V3.2's at 1M tokens.
- Derived compute: 6 × 49e9 × 33e12 ≈ 9.7×10²⁴. The token count is "more than 32T"; the stored value uses 33T.

**DeepSeek-V3**
- Source: arXiv 2412.19437 abstract and Table 1, https://arxiv.org/abs/2412.19437, https://arxiv.org/html/2412.19437
- **Disclosed:** 671B / 37B parameters, 14.8T tokens, 2.788M H800-hours, $5.576M at $2 per GPU-hour.

**Llama 3 / 3.1**
- Llama 3.1 model card: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/MODEL_CARD.md
  - **Disclosed:** 405B used 30.84M GPU-hours; 39.3M across all three sizes; 700 W TDP.
- Llama 3 paper: https://arxiv.org/html/2407.21783
  - **Disclosed:** 3.8×10²⁵ FLOP, 15.6T tokens, 16K H100, MFU 38–43%, 419 unexpected interruptions in 54 days; configurations in Table 3.

**GPT-3**
- Source: arXiv 2005.14165, https://arxiv.org/abs/2005.14165, Table D.1. 174.6B parameters, 3.14×10²³ FLOP, 300B tokens.

**Hardware**
- NVIDIA H100: https://www.nvidia.com/en-us/data-center/h100/
  - BF16 1,979 TFLOPS sparse, so 989.5 dense. 3.35 TB/s. 80 GB is taken from the SXM 80 GB part.
- GB200 NVL72: https://www.nvidia.com/en-us/data-center/gb200-nvl72/
  - Rack figures ÷ 72 per GPU. The sparse figure is halved, giving 2.5 PFLOPS dense BF16; 576 TB/s ÷ 72 = 8 TB/s; 186 GB.
- A100: https://www.nvidia.com/en-us/data-center/a100/ (312 TFLOPS dense BF16, 2.039 TB/s).
- DGX B200: https://www.nvidia.com/en-us/data-center/dgx-b200/ (14.3 kW per 8 GPUs, hence 1,788 W per GPU including the host).

**Prices**
- Lambda: https://lambda.ai/pricing
  - **Disclosed:** H100 $4.59/h and B200 $7.69/h on demand, effective 16 Nov 2026.
  - The $2–3 contract range in ch6.p3 is "per industry reports"; it comes from secondary search results and was **not verified**.
- OpenAI GPT-6 Astra: https://developers.openai.com/api/docs/models/gpt-6-astra
  - $10 / $50 per M input / output tokens.
  - Context 1,050,000 tokens (922k input, 128k output); input above 272K is billed at a higher rate.
- Anthropic: https://platform.claude.com/docs/en/about-claude/pricing. Claude Fable 5.2 costs $8 / $40.
- DeepSeek API: https://api-docs.deepseek.com/quick_start/pricing. V4-Pro input $0.66–1.32 and output $1.98–3.96, by time of day.
- Epoch AI, *LLM inference price trends* (12 Mar 2025): https://epoch.ai/data-insights/llm-inference-price-trends. Prices fall 9–900× per year depending on the threshold.

**Benchmarks**
- Scale HLE leaderboard: https://labs.scale.com/leaderboard/humanitys_last_exam (last updated 17 Sept 2026).
- **Disclosed:** GPT 6 Astra 54.80 ± 1.94, calibration error 39; second place 46.50.

**Data centres**
- Epoch AI *Frontier data centers* (updated 6 Nov 2026): https://epoch.ai/data/frontier-data-centers
- **Estimated:** Colossus 2 946 MW, Stargate Abilene 824 MW, New Carlisle 1,037 MW. Epoch says about 80% of its estimates fall within ×1.4.
- Cross-check: Cleanview report on Colossus (~1.3 GW planned), https://cleanview.co/reports/behind-the-meter-data-centers/full-report/colossus

**Law**
- EU GPAI guidelines: https://digital-strategy.ec.europa.eu/en/policies/guidelines-gpai-providers
  - Obligations apply from 2 Aug 2025; enforcement powers from 2 Aug 2026.
- AI Act Art. 51(2): https://artificialintelligenceact.eu/article/51/ (10²⁵ FLOP presumption).
- California SB 53:
  - Governor's release, signed 29 Sept 2025: https://www.gov.ca.gov/2025/09/29/governor-newsom-signs-sb-53-advancing-californias-world-leading-artificial-intelligence-industry/
  - FPF explainer (effective 1 Jan 2026; 10²⁶ operations): https://fpf.org/blog/californias-sb-53-the-first-frontier-ai-law-explained/
- China, CAC *Measures for labelling AI-generated synthetic content*, in force 1 Sept 2025: https://www.cac.gov.cn/2025-03/14/c_1743654685896173.htm. The 2023 interim measures' date was not verified and is not stated.

**Research context**
- Villalobos et al. 2024, data exhaustion 2026–2032: https://arxiv.org/abs/2211.04325
- Gema et al. 2024, *Are we done with MMLU?*: 6.49% erroneous, Virology 57%. https://arxiv.org/abs/2406.04127
- Hu et al. 2021, LoRA (10,000× fewer parameters, 3× less memory): https://arxiv.org/abs/2106.09685
- Besiroglu et al. 2024, Chinchilla re-fit (Table 1): https://arxiv.org/abs/2404.10102
- Kaplan et al. 2020: https://arxiv.org/abs/2001.08361. Opened, but the exponents are described only qualitatively.
- DeepMind interpretability team, 2025, on deprioritising SAE research: https://www.alignmentforum.org/posts/HpAr8k74mW4ivCvCu/

## Checked

- The forward pass equals the trainer's logits to 0. The gradient check gives a worst relative error of 3.2e-8.
- Cached and uncached generation give the same output for prompts of 3–12 letters.
- Parameter counts equal the published figures exactly.
- Chinchilla closed form vs numeric minimum (earlier session). Speculative-decoding formula vs simulation (within 0.05). Benchmark normal approximation vs simulation (within 0.02).
- Every number in the zh prose is recomputed in `tests/models.cjs`.
- Browser test, every model driven to its extremes:
  - no unfilled placeholders, NaN or raw keys;
  - no overflow or overlapping controls at 1280/390/320;
  - every target at least 48 px;
  - reduced motion jumps instead of animating;
  - weights.js is not requested at page top.

## Not checked

- Papers cited from memory and not opened in this session: Schaeffer 2023, Templeton 2024 ("tens of millions of features"), Rafailov 2023, Ouyang 2022, Hinton 2015, Williams 2009, Frantar 2022 (GPTQ), Fedus 2022, Wang 2024, Leviathan 2023 (formula verified by simulation), Rajbhandari 2020 (16 bytes per parameter), Su 2021, Elhage 2022.
- The secondary contract-price range for H100s.
- The 2023 Chinese interim-measures date (omitted).
- Whether the roofline matches any real serving stack.
- Multimodality: the frontier chapter has no sourced facts about modalities (agents appear only in ch12.q4).

## Tuned (not sourced) parameters

- Roofline efficiency 50% of peak (`eff`).
- Default rental price $2.5/GPU-hour, inside the reported contract range.
- Default MFU 41%, inside Meta's 38–43%.
- Power defaults: board TDP, or DGX B200 ÷ 8.
- MoE toy:
  - random features with dm 16 and T 512;
  - "skew" is a fixed per-expert popularity offset;
  - γ = 0.01 per balancing round.
- Benchmark toy: pA 0.80 and 400 trials on the page.
- Tiny-model task and hyper-parameters, chosen so the attention is interpretable.
- Depth toy: width 64, batch 8, seed 5.

## Prerequisites the site lacks

`why-compute-waits-for-memory` (referred to by title in ch9.p1; same queue, not yet on the site). `how-a-chatbot-writes` exists but is not yet in `pages.config.js`. The site has no page on probability for perplexity/cross-entropy beyond `entropy`, and none on floating-point formats (BF16/FP8).
