# build-report · population-growth
构建者：Alberto 本人（Muse Wonder，Yangyu 2026-10-21 授权「简单编程可亲自上」），VM clone 直写。
内容：6 步（翻倍离散代 → 连续指数与 ln2/r → 逻辑斯蒂 vs 离散指数对照 → K 吸引子（含 N0>K 回落）→ r 越界振荡/崩盘实验 → 终章+模型边界）。canvas 通用折线图 + 第 0 步柱图。
PURE：doublingValue / expCont / doublingTime / logisticStep / logisticSeries / effRate / discreteExpValue / classifySeries（稳定/振荡/崩盘由尾段极差与非正值判定）。
自检：node --check app.js/i18n.js 过；i18n 中英 59/59 键对齐；探针断言全过（2^10=1024、翻倍时间、逻辑斯蒂单调趋近 K≤1000.5、超载回落至 K±5、离散指数对公式、r=2.3 判振荡、r=0.6 判稳定）。/tmp/pop-probe2.js。
待：独立评审（Codex 单轮）后注册（math/senior；CONCEPT-MAP 拟 #step2/#step3 两行）。

## Fix pass (independent review)
Source: `claude-reviews/pair2.md` (population-growth, 6 MUST-FIX). Everything stays computed by pure functions from live state.
1. **Step 3 negative populations.** Added the pure `maxStartN0(K) = 2.5K`. Above K(1+1/r) ≈ 2.67K (r = 0.6), the first discrete step is negative. `s3ClampN0` clamps N₀ in both slider handlers and in `s3Reset`, and resyncs the slider. A new readout line `s3cap` shows the cap and the computed threshold K(1+1/r). s3e now discloses the discrete undershoot below K. Probe: all 792 (N₀, K) slider combos stay positive and converge to K within 1%. The reviewer's case 2200/600 is clamped to 1500.
2. **Step 4 crash was unreachable, and chaos was unnamed.** The slider range is now 1.0–3.1, so the first crash is at r = 3.05. `classifySeries(series, K, r)` now returns mono, damped, osc (period p, found by `orbitPeriod`), chaos (Lyapunov λ > 0, from `lyapunov`) or crash. The borderline r = 2 is detected as damped by its shrinking amplitude (`orbitAmplitude`). There are new keys s4mono, s4damp, s4osc ({p}), s4oscLong and s4chaos ({lam}), and s4stable was removed. Probe: the regimes match theory over 5 start values × 43 r values (215/215).
3. **False self-description in s4e.** s4e is rewritten: earlier discrete r never exceeds 1 (step-2 slider max reduced 1.2 → 1.0, so step 2 never overshoots K, as the brief requires; step 3 is fixed at 0.6). It states the real thresholds: r ≤ 1 monotone, 1 < r < 2 damped overshoot, r > 2 period-doubling, chaos past ≈2.57, negative values past 3. The slider label now reads "r > 2 is out of bounds". s4conc and s5e are aligned with these thresholds.
4. **Science overclaim.** The "real regulation is smooth" sentence is replaced. The new text says the jerkiness is mostly an artefact for overlapping generations, but non-overlapping generations can really cycle or show chaos (May 1976). It also says oscillations can have other causes, such as the developmental lag in Nicholson's blowfly experiments.
5. **Step-1 tick labels.** The new `fmtTick` keeps one decimal when the tick step is not an integer. It is used for both axes in `drawChart`. Step 1 now reads 0, 2.5, 5, 7.5, 10.
6. **Step-0 bar clipping.** The bar width is now `iw/(MAX+1)`, so all 15 bars and labels fit at 320–900px.
SHOULD-FIX (trivial ones only):
- s0ro10 takes the computed `{n}` and the unsourced "most people guess" claim is dropped.
- The step-3 default N₀ is 1300, so it falls monotonically from above.
- The s3ro zh wording is now "距 K".
- The meaning of r (continuous vs per-generation) is stated in s5bound, and the "20% per generation" wording in s1e/s1conc is fixed.
- The finale links to chemical-equilibrium#step2.
- The nav aria-label is translated via `data-i18n-aria`.
- `getLang` rejects unknown stored values.
- The step-0 y caption no longer collides with the top tick (T=28).
- Cache key bumped to `?v=pop2`.

Skipped as structural: step-2 auto-play, the step-1 r range, canvas aria, badges/meta, and the CONCEPT-MAP entry (out of scope for this fix).
Self-check: `node --check` app.js and i18n.js OK. i18n zh 65 / en 65 with matching placeholders. Probes `/tmp/pg-fix/probe.js` 26/26 and `/tmp/pg-fix/seeds.js` 215/215.
