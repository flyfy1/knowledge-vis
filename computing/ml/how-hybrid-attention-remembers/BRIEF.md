# BRIEF · how-hybrid-attention-remembers 混合注意力是怎么“记住”长文的

- Author: Antigravity (`gemini-4-hydrogen`)
- Built-By: Antigravity (`gemini-4-hydrogen`), deep-track essay (2026-11-13)
- Verified-By: self-check (`tests/models.cjs`, `tests/browser.cjs` across 1280/390/320 in `zh` and `en` + reduced motion, `canvas-text-overlap.cjs --sweep`); independent review pending
- Category: `computing`, subtopic: `ml` (机器学习 / Machine Learning), stage: `university`

## The One Question

**为什么传统大模型读得越长，内存账单就按长度线性膨胀——而混合注意力模型是怎么用一块固定大小的矩阵“记住”长文、又保留精确回忆的？**
*(Why does a standard transformer's memory footprint grow linearly with context length—and how do hybrid attention models remember long texts inside a fixed-size matrix while keeping exact recall alive?)*

## Chapter Ladder & Models

1. **`#ch1` 记下每一页，还是只留一张笔记 / Keep Every Page, or Keep One Running Note** — Deep links `../attention-mechanism/#step1`.
   - **Model**: `kvBudget` calibrated to measured llama.cpp `Q8_0` (`2,176 B/tok/layer` including block scales) and `FP16` (`4,096 B/tok/layer`) footprints on a 32-layer 9B model (`5.2 GB` LLM + `876 MB` mmproj, `50.25 MiB` recurrent state for 3:1 hybrid).
   - **Pinned facts**: At `64K`, `Q8_0`, `np=1`: Pure Full KV = `4,352 MiB`; 3:1 Hybrid KV = `1,088 MiB` (`75%` reduction) + `50.25 MiB` recurrent = `1,138.25 MiB`; at `np=2`, `2,276.5 MiB`; at `256K`, Pure Full KV = `17 GiB` vs 3:1 Hybrid `4.3 GiB`.
2. **`#ch2` 矩阵乘法换个顺序 / Reordering the Multiply: Linear Attention via Associativity** — Deep links `../attention-mechanism/#step2`.
   - **Model**: `linearAttentionTrace` (`L=16, d=4`, `phi(x)=elu(x)+1` causal kernel attention per Katharopoulos et al. 2020) + FLOPs crossover (`2 L^2 d` vs `2 L d^2` at `d=128`).
   - **Pinned facts**: Max elementwise difference between `(QK^T)V` and `Q(K^TV)` = `1.11e-16`; FLOP ratio at `L=16,384, d=128` = `128×`.
3. **`#ch3` 为什么纯加法会“写满糊掉” / Why Pure Addition Blurs: Fast-Weight Capacity Limits** — Deep links `../embeddings/#step1`.
   - **Model**: `associativeRecallSim` (`d ∈ {4, 8, 16}`, unit-norm Gaussian keys, pure additive outer products).
   - **Pinned facts (`d=8`)**: 8 distinct writes → cosine `0.74`; 24 distinct writes → `0.46`; overwriting key 0 orthogonally at step 8 → `0.84` (mixing old + new).
4. **`#ch4` 先擦再写：Delta 规则 / Erase Before You Write: The Delta Rule**.
   - **Model**: `deltaRuleComparison` (`d=8`, `16` writes, repeated key updates vs distinct keys, `β ∈ [0.1, 1.4]`).
   - **Pinned facts (`mode='update', β=1.0`)**: Additive final cosine `0.50` (MSE `0.639`) vs Delta Rule `0.88` (MSE `0.0295`).
5. **`#ch5` 再加一把遗忘闸：Gated DeltaNet / Adding a Decay Gate: Mamba-2 Meets Gated DeltaNet**.
   - **Model**: `gatedDeltaSim` (24-step stream with topic shift at `t=13` and key overwrites in Phase 2).
   - **Pinned facts (`α=0.96, β=0.90, dip=true`)**: Pure Delta stale energy `0.86`; Pure Decay active recall `0.54`; Gated DeltaNet active recall `0.92`, stale energy `0.66`.
6. **`#ch6` 训练时怎么不一步步等：分块并行 / Training Without Waiting Token by Token: Chunkwise Duality**.
   - **Model**: `chunkwiseSim` (`L=16, d=4, C ∈ {1, 2, 4, 8, 16}`), proving exact output equivalence between serial recurrence and chunked intra-chunk matmul + inter-chunk state scan.
   - **Pinned facts**: Max diff `5.55e-16`; at `C=64` on `65,536` tokens, serial scan steps drop to `1,024`.
7. **`#ch7` 为什么不能全用线性层：大海捞针与 3:1 混合 / Why Not 100% Linear? Needle-in-a-Haystack & the 3:1 Hybrid**.
   - **Model**: `needleHybridSim` (`d=8`, `2..40` planted facts, comparing `0:1` pure linear vs `7:1` / `3:1` / `1:1` / `full`).
   - **Pinned facts (`32` facts)**: Pure linear cosine `0.21` (`13%` exact hits) vs `3:1` hybrid `1.00` (`100%` exact hits) with `75%` KV savings.
8. **`#ch8` 屋顶线视角 / Roofline View: Why Hybrids Fly on Local Hardware**.
   - **Model**: `decodeSpeedModel` (bandwidth-bound decode roofline `BW / (weights + KV + state)`).
   - **Pinned facts (`150 GB/s`, `Q8_0`)**: At `64K`, Pure Full `15.4 tok/s` vs 3:1 Hybrid `23.5 tok/s` (`1.53×` speedup); at `128K`, `1.90×` speedup.
9. **`#ch9` 前沿在哪（2026 年 11 月）与四个问题 / Where the Frontier Is (Nov 2026) & Four Questions** — Deep links to `../llm-sampling/#step1`, `../../systems/switches-that-compute/#ch9`.
   - **Model**: `archCompareLab` interactive table across `8K..256K` context lengths.

## Sources Checked (Accessed 2026-11-13)

- Katharopoulos et al. (ICML 2020), *Transformers are RNNs: Fast Autoregressive Transformers with Linear Attention*, `https://arxiv.org/abs/2006.16236`
- Schlag, Irie & Schmidhuber (ICML 2021), *Linear Transformers Are Secretly Fast Weight Programmers*, `https://arxiv.org/abs/2102.11174`
- Dao & Gu (ICML 2024), *Transformers are SSMs: Generalized Models and Efficient Algorithms Through Structured State Space Duality (Mamba-2)*, `https://arxiv.org/abs/2405.21060`
- Yang, Kautz & Hatamizadeh (ICLR 2025), *Gated Delta Networks: Improving Mamba2 with Delta Rule*, `https://arxiv.org/abs/2412.06464`
- MiniMax-AI (Jan 2025), *MiniMax-01: Scaling Foundation Models with Lightning Attention*, `https://arxiv.org/abs/2501.08313`
- Moonshot AI (Oct 2025), *Kimi Linear: An Expressive, Efficient Attention Architecture*, `https://arxiv.org/abs/2510.26692`
- Hybrid Linear Attention Distillation (Jan 2026), *Hybrid Linear Attention Done Right*, `https://arxiv.org/abs/2601.22156`
- Local llama.cpp `qwen35` / `ollama.log` runtime measurements observed on host Apple Silicon (2026-11-13).

## Facts That Will Go Stale

- Chapter 9 dated frontier summary ("as of November 2026"): architectural ratios (`3:1` and `7:1` hybrids), distillation competitiveness vs from-scratch pretraining (`arXiv:2601.22156`), and inference framework support (`FLA`, `vLLM`, `SGLang`, `llama.cpp`).
- Tuned simulation parameters (explicitly disclosed in chapter limits): `d=8` toy state capacity in Chapters 3–5 & 7, fixed `7.5 GiB` desktop OS baseline in Chapter 1, hand-triggered `α=0.15` pulse at `t=13` in Chapter 5, and `150 GB/s` unified-memory baseline in Chapters 8–9.
