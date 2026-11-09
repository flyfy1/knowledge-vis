# 全站 canvas 文字重叠普查 · 2026-11-09

- **执行**：Claude Code（claude-opus-5-5），分支 `review/claude-pages-20261109`。
- **工具**：[`tests/canvas-text-overlap.cjs`](../../tests/canvas-text-overlap.cjs)。它记录每个 canvas 上所有 `fillText`/`strokeText` 的文字框（按当前变换换算成 CSS px），两个不同标注相交超过 2×2 px 就记一条。
- **范围**：`pages.config.js` 里的全部 208 个页面，宽度 1280/390/320，中英文各一遍，**只看默认状态**（没加 `--sweep`）。加上 `--sweep` 只会查出更多：在四个 Claude 页上，默认状态只查出 1 处重叠，sweep 又查出 3 处。
- **复现**：`python3 -m http.server 18871 --bind 127.0.0.1`，然后 `CANVAS_BASE_URL=http://127.0.0.1:18871 node tests/canvas-text-overlap.cjs <路径…>`（Playwright 需要 `NODE_PATH`，见 AGENTS.md）。

## 结论

- 208 个页面中有 **67 个**在默认状态下就有 canvas 文字重叠，其中 58 个的最大重叠 ≥ 40 px²，也就是至少有一处读不清。
- 抽查截图：climate-energy 320 宽英文下两行结论文字（255 K / 288 K）完全叠在一起，还超出了画布；这是真问题。frozen-bubble 和 reaction-rates 图例起初被报出，查明是检测器的误报（页面用 `canvas.height=` 或略小于画布的 `clearRect` 重画），已修好检测器，这里的清单不含它们。
- 普查同时记录页面报错。唯一报错的是 coordinate-plane：第 6 步读数因无限递归一直是空白，已在 5abad24c 修复，见 [spec](../coordinate-plane-distance.md)。
- 本次只修了四个 Claude Code 页面和 coordinate-plane 的递归问题。其余页面**没有改**：大多数由别的 Agent 编写，按 WORKFLOW 应派单修复，并在修复后用 `--sweep` 复查。

## 检测器的局限

- 只查文字和文字相交，查不出文字压在曲线或色块上、文字超出画布边缘。
- 只查静态绘制。持续动画的画布，抓到的是页面加载 300 ms 后的那一帧。
- 小于约 40 px² 的多是刻度数字相碰，仍可读，修不修要人判断。

## 清单（按最大重叠排序）

「主要作者」是 `node scripts/authorship.cjs <页面>/index.html` 推导出的 `primary`。很多页面是由 371fc49f（10-30 夜间批量登记）加入仓库的，这个提交被推导为 claude-code（claude-sonnet-5-5），未必等于实际写页面的 Agent，派单前请以 AUTHORSHIP.md 的规则复核。「标签」是 page-provenance.json 里登记的开发者。

| 页面 | 最大重叠 px² | 位置 | 例子 | 条数 | 主要作者 | 标签 |
| --- | ---: | --- | --- | ---: | --- | --- |
| `signal/transforms/wavelets/` | 2509 | 320 en #s2-cv | "Signal (12 Hz, then 40 Hz) with the orange wavelet" × "orange = wa… | 16 | claude-code | — |
| `probability/stochastic/monte-carlo/` | 1702 | 320 en #s5-canvas | "first-two-coordinates projection (test uses all dims)" × "true vol… | 35 | alberto | Codex |
| `earth/climate/climate-energy/` | 1645 | 320 en #greenhouseCanvas | "Effective radiating temperature: 255 K" × "Model surface temperatu… | 7 | unattributed | — |
| `math/linear-algebra/eigenvectors/` | 1350 | 390 en #s1-curve | "Line angle versus direction θ (0°–180° covers each line once)" × "… | 4 | alberto | Codex |
| `physics/modern/quantum-tunneling/` | 1345 | 320 en #cv0 | "barrier V₀ = 1 eV, width 0.8 nm" × "behind the wall \|ψ\|² = T = 0… | 11 | claude-code | — |
| `physics/modern/relativity/` | 1271 | 320 en #cv3 | "prediction with time dilation" × "same flight, lifetime stretched … | 7 | claude-code | — |
| `investment/basics/stocks-bonds/` | 1235 | 320 en #cv5 | "Return comes from: Dividends + price rises" × "Return comes from: … | 17 | alberto | — |
| `probability/stochastic/risk-pooling/` | 871 | 390 en #cv2 | "premiums cover ≤ 24 claimants" × "red = cannot pay" | 4 | claude-code | — |
| `signal/sampling/sampling/` | 819 | 320 en #s4-canvas | "alias peak f_alias = 3.0" × "spectral copy" | 12 | alberto | Codex |
| `math/applied/externalities/` | 788 | 390 en #cv4 | "social optimum" × "equilibrium with 1 herder(s)" | 9 | claude-code | — |
| `signal/transforms/z-transform/` | 787 | 390 en #s4-resp | "peak near the top of the axis · exact peak in the readout" × "peak… | 8 | alberto | Codex |
| `math/calculus/derivative/` | 728 | 320 en #s2d-canvas | "Derivative f′(x)" × "Collected derivative points (x axis, measured… | 10 | alberto | Codex |
| `computing/ml/attention-mechanism/` | 626 | 390 en #s0-cv | "white = query of “sat”" × "coloured = key of each word" | 3 | claude-code | — |
| `signal/transforms/laplace/` | 587 | 320 zh #s2-plane | "收敛域 σ > −a" × "切片 σ₀ = 0.00" | 18 | alberto | Codex |
| `probability/stochastic/entropy/` | 537 | 390 zh #s3-canvas | "峰顶：p = 0.5，H = 1 bit" × "H = 1.000" | 6 | alberto | — |
| `chemistry/reactions/reaction-rates/` | 480 | 320 zh #s1-trace | "产物累计（个）" × "实线：当前 32 个粒子" | 5 | codex | — |
| `computing/ml/embeddings/` | 357 | 320 zh #s4-cv | "轻轻地" × "汪汪叫" | 65 | claude-code | — |
| `probability/inference/statistical-inference/` | 282 | 390 zh #testCanvas | "SE 2.00" × "z = 1.50" | 6 | codex | — |
| `earth/astronomy/gravitational-lensing/` | 273 | 320 en #cv2 | "1 arcsec" × "space-telescope resolution ≈ 0.05″" | 10 | claude-code | — |
| `physics/modern/blackbody-radiation/` | 243 | 320 zh #cv1 | "3000 K" × "6000 K" | 7 | claude-code | — |
| `earth/geo/plate-tectonics/` | 238 | 320 en #profile | "Seafloor spread" × "Stress buildup" | 2 | unattributed | — |
| `math/applied/auction-basics/` | 237 | 320 en #cv0 | "expected profit" × "best b = v/2" | 1 | claude-code | — |
| `math/linear-algebra/vectors/` | 231 | 1280 en #cv5 | "far bank" × "actual track" | 11 | claude-code | — |
| `computing/algorithms/sorting/` | 197 | 320 zh #s4-plot | "交叉点 n* ≈ 997" × "B = n²" | 4 | alberto | — |
| `computing/ml/gradient-descent/` | 195 | 320 en #s6-loss | "loss curve L(k) (computed live, point by point)" × "3.48" | 2 | alberto | — |
| `earth/climate/carbon-cycle/` | 191 | 320 zh #cv4 | "停排" × "CO₂（ppm）" | 4 | claude-code | — |
| `computing/systems/rsa-encryption/` | 166 | 320 en #cv5 | "10^40" × "a 10¹⁸ ops/s machine running for the age of the universe" | 12 | claude-code | — |
| `computing/ml/decision-trees/` | 165 | 390 en #s4-cv | "tree: white line = path of the query point" × "y<0.52" | 4 | claude-code | — |
| `math/geometry/perimeter-area/` | 156 | 390 zh #s4-canvas | "面积 32 平方米" × "面积 36 平方米" | 8 | alberto | — |
| `signal/sampling/modulation/` | 143 | 390 zh #s0-spec | "300" × "频率 f（Hz）" | 57 | alberto | — |
| `math/arithmetic/place-value/` | 132 | 320 en #cv5 | "ten-thousands" × "thousands" | 3 | claude-code | — |
| `earth/climate/climate-feedback/` | 125 | 320 en #carbonCanvas | "Atmosphere" × "18.0 GtC/yr" | 3 | unattributed | — |
| `physics/waves/sound-waves/` | 124 | 320 en #cv4 | "lightning" × "you" | 4 | claude-code | — |
| `investment/rates/compound-interest/` | 109 | 320 en #cv5 | "still 67.9% left at half of the term" × "100k" | 2 | claude-code | — |
| `physics/waves/interference/` | 108 | 1280 en #s0-side | "Side profile (distance → displacement)" × "λ = 2" | 3 | alberto | Codex |
| `physics/mechanics/mechanical-energy/` | 107 | 320 en #cv4 | "kinetic" × "potential at top" | 2 | claude-code | — |
| `math/calculus/taylor-series/` | 98 | 320 zh #cv3 | "2.5×10⁻5" × "2.8×10⁻6" | 16 | claude-code | — |
| `probability/stochastic/markov-chains/` | 88 | 390 zh #cv3 | "0.30" × "稳态分布 π" | 3 | claude-code | — |
| `biology/ecology/energy-pyramid/` | 82 | 320 en #s3-canvas | "biomass" × "annual production (energy)" | 1 | claude-code | — |
| `computing/algorithms/hashing/` | 80 | 320 zh #s1-cv | "32" × "变了的位数 0 → 32" | 2 | claude-code | — |
| `chemistry/reactions/activation-energy/` | 80 | 320 zh #s1-canvas | "log₁₀ (fraction ≥ E)" × "Eₐ" | 2 | claude-code | — |
| `math/algebra/complex-numbers/` | 80 | 1280 en #s4-canvas | "unit circle" × "z₂" | 16 | alberto | Codex |
| `signal/systems/frequency-response/` | 79 | 390 zh #s0-gain | "10" × "频率 f（Hz，对数轴）" | 18 | alberto | Codex |
| `biology/body/blood-circulation/` | 78 | 320 en #s2-cv | "Arterioles" × "Capillaries" | 4 | claude-code | — |
| `chemistry/solutions/buffer-capacity/` | 77 | 320 zh #s0-canvas | "50.0%" × "pH 4.80" | 14 | unattributed | — |
| `biology/ecology/food-web/` | 75 | 320 en #s2-cv | "Grasshopper" × "Rabbit" | 1 | claude-code | — |
| `math/algebra/coordinate-plane/` | 73 | 320 zh #s3-canvas | "对角线：这条斜线上的点横纵相等" × "−6" | 18 | alberto | — |
| `math/algebra/parabola/` | 69 | 390 zh #s2-canvas | "y" × "对称轴 x = 0" | 55 | alberto | — |
| `probability/inference/bayes-updating/` | 63 | 320 zh #s2-canvas | "99.0%" × "99.9%" | 14 | alberto | Codex |
| `math/data/bar-charts/` | 62 | 390 zh #cv4 | "200" × "厘米" | 15 | claude-code | — |
| `math/arithmetic/negative-numbers/` | 55 | 320 zh #s5-canvas | "−4" × "−3" | 20 | alberto | — |
| `physics/mechanics/newton-laws/` | 55 | 390 en #cv2 | "0 s" × "push F" | 8 | claude-code | — |
| `math/arithmetic/fractions/` | 54 | 390 zh #s0-canvas | "2" × "右边：切 4 取 2" | 4 | alberto | — |
| `math/applied/prisoners-dilemma/` | 52 | 320 zh #cv2 | "120.6" × "全合" | 6 | claude-code | — |
| `computing/ml/llm-sampling/` | 52 | 320 en #s3-cv | "snowy" × "strange" | 8 | claude-code | — |
| `earth/geo/seismic-waves/` | 52 | 390 en #cv0 | "P" × "schematic seismogram" | 2 | claude-code | — |
| `math/algebra/sequences-series/` | 41 | 320 zh #cv0 | "29" × "+3" | 30 | claude-code | — |
| `physics/electromagnetism/magnetic-force/` | 40 | 390 zh #s3-canvas | "2" × "狭缝" | 14 | claude-code | — |
| `computing/algorithms/recursion-divide/` | 38 | 390 zh #s3-cv | "n：1 → 64" × "64" | 6 | claude-code | — |
| `math/algebra/simultaneous-equations/` | 33 | 390 zh #cv5 | "x" × "p" | 6 | claude-code | — |
| `signal/control/inverted-pendulum/` | 30 | 320 en #s2-loop | "Angle sensor" × "Error e" | 1 | alberto | — |
| `math/geometry/circle-angles/` | 29 | 390 en #s0-canvas | "∠AOB · central angle" × "radius" | 3 | alberto | — |
| `probability/stochastic/bandit-arms/` | 24 | 320 en #s2-cv | "Machine C" × "Machine D" | 8 | claude-code | — |
| `physics/modern/photoelectric-effect/` | 23 | 320 zh #s4-canvas | "10^4" × "s" | 2 | claude-code | — |
| `probability/basics/binomial-normal/` | 19 | 390 zh #cv4 | "n" × "100" | 6 | claude-code | — |
| `math/algebra/linear-functions/` | 19 | 320 zh #s4q2-canvas | "-1" × "-1" | 16 | alberto | Codex |
| `math/geometry/polygon-angles/` | 17 | 320 zh #cv0 | "63°" × "81°" | 2 | claude-code | — |


## 复查与修复（2026-11-09，同一会话）

### 用更严的检查器重新普查

检查器补了几项后重新跑了一遍：
- **新增出界检查**：文字伸出画布就报告。完全画在画布外、根本看不见的文字不算。
- **按实际宽度计算**：用 `maxWidth` 压缩过的文字，按压缩后的宽度计算。
- **`--sweep` 扩大范围**：增加两个滑杆的组合，同时触发 `change` 事件，并覆盖复选框和单选按钮。

全部 207 个页面路径**只看默认状态**的结果：
- **有问题：** 99 页。其中 67 页有文字重叠，32 页只有文字出界。
- **没有署名标签：** 87 页。按 [visual-page-provenance](../visual-page-provenance.md)，这些可以由本分支修复；另外 12 页带 Codex 标签，不改。

### 修复方式

1. **逐页手工修**：wavelets、climate-energy、quantum-tunneling、relativity、stocks-bonds、externalities、binary-search、reaction-rates、embeddings。
   - climate-energy 还修了中文界面里残留的英文说明。
   - externalities 第 4 步的曲线原来画进了下面的子图，也一并修了。
2. **共用 `text()` 的 66 个页面**：这个函数里加了标注避让和限界。
   - 同一次绘制中，重叠的标注错开一行；
   - 文字不会伸出画布；
   - 支持 `o.mw` 限宽。
   - 另外 3 页的超长图例改到画布下方的 HTML 段落里，以便换行：shortest-path、rsa-encryption、atmospheric-circulation。
3. **其余 49 个页面**：画字方式各不相同，统一加载新的 [`canvas-label-guard.js`](../../canvas-label-guard.js)，说明见 [spec](../canvas-label-guard.md)。

### 结果

- **`--sweep`**：87 个无标签页面全部通过，覆盖三种宽度、中英文，以及滑杆、组合、按钮、复选框和单选按钮。
- **最终默认状态普查**：没有署名标签的页面全部通过；剩下 12 页都带 Codex 标签，见下表。
- **截图抽查**：wavelets、climate-energy、quantum-tunneling、relativity、stocks-bonds、risk-pooling、externalities、gravitational-lensing、blackbody-radiation、shortest-path、binary-search、embeddings、parabola。
  - 挪开后的标注都能读。
  - 个别标注离它所指的点远了一些，或压在了曲线上，如 blackbody-radiation 的「6000 K」。这类属于版面问题，检查器查不出，以后改页面时可以顺手调整。
- **验证范围**：这些页面大多没有自带测试，所以这次只做了 canvas 文字检查和截图抽查。逻辑和数值没有重新评审，也没有独立评审（self-check）。

### 仍待处理：带 Codex 标签的 12 页

这些是 Codex 的改进版本。按 provenance 规则，不能由 Claude Code 修改后继续挂在 Codex 名下，所以留给 Codex，或由 Yangyu 决定处理方式。这一轮没有对它们跑 `--sweep`，派单时应一并要求。

| 页面 | 标签 | 最大重叠 px² | 条数 | 例子 |
|---|---|---|---|---|
| `probability/stochastic/monte-carlo/` | Codex | 1702 | 39 | 320 en #s5-canvas: "first-two-coordinates projection (test uses all dims)" × "true volume ratio by d (log scale)" (146.7 |
| `math/linear-algebra/eigenvectors/` | Codex | 1350 | 6 | 320 en #s1-curve: "Line angle versus direction θ (0°–180° covers each line once)" × "zeros = eigendirections" (126.2×10. |
| `signal/sampling/sampling/` | Codex | 819 | 26 | 320 en #s4-canvas: "alias peak f_alias = 3.0" × "spectral copy" (71.8×11.4 px) |
| `signal/transforms/z-transform/` | Codex | 787 | 11 | 320 en #s4-resp: "peak near the top of the axis · exact peak in the readout" × "peak Ω = 1.10" (74.2×10.6 px) |
| `math/calculus/derivative/` | Codex | 728 | 16 | 320 en #s2d-canvas: "Derivative f′(x)" × "Collected derivative points (x axis, measured f′ vertical)" (75.1×9.7 px) |
| `signal/transforms/laplace/` | Codex | 587 | 28 | 320 zh #s2-plane: "收敛域 σ > −a" × "切片 σ₀ = 0.00" (53.4×11.0 px) |
| `physics/waves/interference/` | Codex | 108 | 3 | 1280 en #s0-side: "Side profile (distance → displacement)" × "λ = 2" (29.2×3.7 px) |
| `math/algebra/complex-numbers/` | Codex | 80 | 18 | 1280 en #s4-canvas: "unit circle" × "z₂" (10.6×7.5 px) |
| `signal/systems/frequency-response/` | Codex | 79 | 19 | 320 en #s0-gain: "10" × "Frequency f (Hz, log axis)" (10.2×7.7 px) |
| `probability/inference/bayes-updating/` | Codex | 63 | 18 | 320 en #s2-canvas: "99.0%" × "99.9%" (7.1×8.9 px) |
| `math/algebra/linear-functions/` | Codex | 19 | 16 | 320 en #s4q2-canvas: "-1" × "-1" (5.0×3.8 px) |
| `signal/systems/convolution/` | Codex | 0 | 1 | 320 en #s6-canvas: "Time-domain convolution (point by point)" outside the 274×300 canvas (x 48..281, y 11..23) |
