# Review · investment/rates/what-the-yield-curve-says · 2026-11-25

Reviewer: Claude Code (claude-opus-5-5), independent of the writer (Opus) and the translator (Haiku). Content-first review per the econ-graph COMMON.md updates. No git operations, no deletions.

## Verdict
**Ready for the registrar after these fixes.** The models are correct and their numbers re-derive. I fixed one real model-explanation error (the ch2 arbitrage legs were swapped) and several overstatements. I applied the concept ownership rules from §4.B. One known gap is left: `real-yield-breakeven-inflation` now has a passage (ch12 #e3b) but is not registered as a concept.

## 已核 (checked)
- **ch1–2:** ACM zero curve on 2026-11-23. YTM of the 10y 6% bond is 4.91% against z(10) 4.95%. The forward rate is f(2,5) = (4.70·5 − 4.58·2)/3 = 4.78%. Units = P5/P2 = 0.8664. Arbitrage at 5.5%: 100(e^{0.165} − e^{0.1434}) = 2.52.
- **ch3:** the "cuts" path averages 3.475, so y10 = 4.28. The inverse path under TP −0.5 is p_n = path_n + 1.3·(2n−1)/10, giving 5.47 for years 9–10 and 4.17 for years 4–5. Both match.
- **ch4:** the hold identities hold (forwards realised ⇒ return = r1; unchanged ⇒ return = f(n−1,n) = 5.35). Break-even = 0.79/9 ≈ 9 bp.
- **ch6:** 10y 4%/4%: Macaulay 8.44, modified 8.11, convexity 80.8, DV01 0.0811. 30y +3 pp: exact −37.23%, duration −51.88%. 30y Macaulay 17.98 = 26·(1 − 1.04^−30). The 2022 move of DGS10 from 1.52 to 4.25 is RAW-checked.
- **ch7:** w = 8/13 = 62%. Dispersion 0.615·25 + 0.385·64 = 40. A +1 twist gives 44.91·e^{0.01} + 28.07·e^{−0.12} − 72.98 = −2.72. Convexity gain ≈ ½·72.98·40·1e-4 ≈ 0.15, against the page's 0.13 / 0.16.
- **ch8:** λ = 1/(0.0609·12) = 1.37 years. NS limits give y(0) = β0 + β1 and y(∞) = β0, so −β1 = long − short holds. 441 monthly changes is correct.
- **ch9:** the ACM split components add up.
- **Inversion runs (independent script on raw T10Y3M, same merge rule):** 2022-10-18 → 2024-12-12 has min −1.89 and is the deepest and longest since 1982. The previous long run, 2006-07-17 → 2007-05-29 with min −0.64, is correct.
- **ch10:** the risky-zero formula is correct. BBB annual PD = 1 − (1 − 0.0136)^{1/5} = 0.27%, and EL ≈ 0.27%·0.6 ≈ 16 bp (the model gives 15). Expected-loss shares are 13 / 30 / 47 / 43%. The zh and en sentences on "BBB → B" both state the correct direction: the lower the rating, the larger the share.
- **ch11:** Vasicek 99% quantile at p = 3.9%, ρ = 0.1: N((−1.762 + 0.316·2.326)/0.949) = 14.0%. The ρ = 0 binomial sd √(0.039·0.961/1000) = 0.61 pp matches the simulated 0.63.
- **S&P tables:** Table 1 (speculative-grade default rates 2009 9.89, 2021 1.68, 2022 1.94, 2023 3.71, 2024 3.94; 1991 11.02) and Table 24 (5-year cumulative AAA 0.34, AA 0.28, A 0.39, BBB 1.36, BB 5.75, B 15.60, CCC/C 46.53) were read in the writer's extracted text of the S&P PDF. The mirror is maalot.co.il, S&P's Israeli affiliate, so it is acceptable as a copy.
- **Papers:**
  - Huang & Huang, RAPS 2(2) 2012, 153–202: abstract confirms "small fraction for IG, much larger for HY".
  - Fama & Bliss, AER 77(4) 1987: exists; it finds forward rates forecast expected returns and rates.
  - Litterman & Scheinkman 1991: secondary sources confirm three factors (level, steepness, curvature) from a factor analysis of *returns*. The wording is now adjusted.
- **294 vs 277:** the difference is the 17 checks gated on `RAW=`. No test was dropped.
- **Not investment advice:** stated in the hero, the footer and ch13, and pinned by a test. No sentence recommends a trade.

## 已改 (changed; zh and en together)
1. **ch2, `say.lend` / `say.borrow`: the replication legs were swapped.** When the quote is above the forward, you lend at the quote and must borrow synthetically, which means buy the t₁ zero and short the t₂ zero. The default paragraph now says the strategy above locks in lending, and that at a 5.5% quote you do the reverse.
2. **ch4 take:** "已确立平均超额回报不为零" overstated the evidence. The mean is 1.68 with sd 9.5 over n = 64, about 1.4 standard errors. The take now says the sample is small (links numbers-lie #c2) and that the firmer evidence is Fama–Bliss / Campbell–Shiller predictability.
3. **ch9 limit:** "风险中性的预期" is now "ACM 模型用历史数据推出的短期利率预期（ACM 称风险中性收益率）".
4. **ch11 and the dg-ladder aria:** "从 AAA 一路升…每降一级翻几倍" was false at AA (0.28 < 0.34). The text now says AAA/AA/A are all below 0.5%, and the rate multiplies 3–4× per grade from BBB.
5. **ch1:** the "11 个承诺" are now spelled out as 10 coupons plus the principal.
6. **ch8 and the footer:** Litterman–Scheinkman is now described as a factor analysis of returns. ch8 links eigenvectors for PCA.
7. **ch12:** 三类 is now 四种标签, and the en line is rewritten.
   - New item #e3b (已确立): nominal = real + breakeven, with DFII10 1.53 → 2.79 and T10YIE 2.12 → 2.13 (2024-09-17 → 2026-11-23). The whole 1.27 pp rise in the 10-year yield was in the real yield. The item adds that a breakeven is not a forecast, and links CPI (how-an-economy-is-measured #ch3). These numbers are RAW-pinned.
   - #e8 gets the breakeven fact as a counterpoint.
   - The three 常见解释 keep their label and now name representative mechanism studies: Greenwood–Vayanos 2014 for supply and Campbell–Sunderam–Viceira 2017 for inflation risk. r* links to why-one-rate #ch6.
   - The NBER sentence is made precise.
8. **Concept ownership (§4.B):**
   - Owner links added in the first lines of ch1 (why-one-rate #ch1, #ch3), ch2 (#ch3) and ch6 (#ch2).
   - ch7 now opens with a three-sentence convexity recap and a link to #ch2.
   - ch9 now links how-an-economy-is-measured #ch7 and numbers-lie #c6.
   - ch11 now links markov-chains (rating migration).
9. **REGISTRY.json:** removed `zero-coupon-bonds-coupon-effect`, `forward-rate-lock-in` and `dv01-price-shock`.
   - The nine owned ids remain.
   - The ch3 concept is retitled "同一条曲线，两种读法" and given observational-equivalence aliases. The generic "为什么长期利率比短期高" aliases were dropped, because those belong to term-premium-curve-inversion.
   - Dropped "收益率曲线倒挂是什么意思" (it duplicates the sibling).
   - Added the free aliases 骑乘收益 / 滚动收益, 曲线变陡 / 变平, 倒挂一定衰退吗, 违约率, 评级下调 and 哑铃和子弹.
   - Collision check against site-registry: none.
10. **English:**
    - `u.ym` rendered as "month 6, 2023"; it is now `{y}-{m}`, with app.js zero-padding the month in en (2023-06).
    - "{date}, the two…" now reads "On {date}, …".
    - "yuan" is replaced by "dollars" throughout, since these are US bonds.
    - The hero subtitle is rephrased.
    - Every zh change above is mirrored.
11. **page.json provenance and BRIEF.md:** updated (English is translated, not a stub; reviewer recorded).

## 没核 (not checked)
- The ACM/GSW continuous-compounding convention is still from memory. The NY Fed page was not read.
- I did not open Greenwood–Vayanos, Campbell–Sunderam–Viceira or Litterman–Scheinkman themselves; the last was confirmed only through secondary sources.
- tests/browser.cjs (21/21) covers zh. I took no English screenshots of the new paragraphs and did not re-check layout at 390/320 after the text grew.
- The 3-month bill (4.37%) sits above the target upper bound (4.00%) on 2026-11-23. This is the raw FRED data; I did not investigate it.

## For the registrar
- **Concept not registered:** `real-yield-breakeven-inflation`. The passage is ch12 #e3b, and essay K can link `what-the-yield-curve-says#ch12`. `duration-supply-demand` is not added and goes back to the gap list.
- **Orphaned aliases:** DV01 / 基点价值 / PV01 no longer have a node here. Suggest attaching them to `bond-duration-convexity`.
- **Must-links not made:**
  - essay A (`public-debt-holders-currency`): not in the registry.
  - a-fair-price-for-a-bet: swaps are mentioned without a link.
  - stocks-bonds, risk-return, expected-value, regression-correlation, floating-rate-reset, equity-duration-house-affordability: no natural slot within the wrap-up scope.
- **Edges:** as listed in TASK-econ-series §4.B. `markov-chains>junk-bonds-default-clustering` now qualifies, because ch11 mentions the migration matrix, although not as a model.

## Final checks
- `node scripts/build-pages.cjs <dir> --check` → OK, outputs match the sources (draft warning only).
- `tests/models.cjs` → 286/286. With `RAW=…/raw` → 305/305.
- `tests/browser.cjs` (own server on port 18893, closed) → 21/21.
- `node scripts/build-registry.cjs --check` → PASS (270 pages, 900 concepts).
