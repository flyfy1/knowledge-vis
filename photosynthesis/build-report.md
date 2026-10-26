# build-report · photosynthesis
构建：Codex（gpt-6.1-sol）写了 index.html/style.css 后被容量中断；app.js + i18n.js 由 Alberto 按其 HTML 契约补完（同批 idiom）。
验证（Alberto）：node --check 通过；i18n 88/88 对齐；探针全过（速率单调/饱和形状/上限、原子对账 C6H12O18 两边平、限制因素切换、情境判定）。/tmp/photo-probe.js。
内容：6 步（冒泡押注 → 方程式点选对账 → 光强饱和曲线 → CO2 限制因素 → 情境判定 ×2 → 终章+模型边界）。速率模型 MAXRATE×光因子×CO2 因子（饱和型）。
待：独立评审后注册（biology/junior；CONCEPT-MAP 拟 #step1/#step3）。

## Fix pass (independent review)
Source: /Users/songyy/claude-reviews/pair2.md (photosynthesis, 8 MUST-FIX). Fixer: Claude (Opus via Claude Code).
- M1 HiDPI canvas growth: `fit()` caches the CSS height once in `cv.dataset.cssH`. Repeated resize is idempotent (probe: dpr 1/2/3, 12 slider moves plus step-0 frames, CSS stays 300px and backing store stays 300·dpr).
- M2 step-0 bet: added three bet buttons (oxygen / CO₂ / water vapour, `#s0-bet`, `BET`). The readout shows only the bubble count until the learner bets, then marks the bet right or wrong and reveals "oxygen". Reset clears the bet.
- M3 `s1hint`: removed the half-and-half counting prompt. It now states that all released O₂ comes from water (isotope labelling) and that the net equation hides this (12 H₂O in, 6 H₂O out).
- M4: no internal key names remain in visible text (eqO2/eqH2O are gone; the probe scans every string for key names).
- M5: implemented the brief's min model: `photoRate = min(lightCap(L), co2Cap(C))`, each cap 40·x/(x+K) with KL=30 and KC=25. Raising the non-limiting input now changes the rate by exactly 0 (5 seeds × 2000 samples, 0 violations; C=20, L 50→100: 0%, previously +23.1%). The finale's boundary note states the formula and parameters. s2e/s5e copy is aligned with the model.
- M6: the step-2 status comes from `isSaturated(L,C) ≡ limitingFactor(L,C)==='co2'`. For every L in 0..100 it matches limitingFactor, and "saturated" implies a flat rate. The readout also shows the computed CO₂ cap. The bend is at L=72.
- M7: `S3_LIGHT=100` (slider max). The copy now says "光开到最大（100）" / "Turn light to its maximum (100)". The limiting factor flips to light at C=84.
- M8: s1e deep-links `../mass-conservation/#step1`. srcLight links `../cell-structure/#step2`. The finale has an interlink area with 3 step-anchored links (mass-conservation#step1, cell-structure#step2, cell-structure#step3), and the "once registered" placeholder is gone.
- SHOULD-FIX (trivial ones only): `.nav-step` class on the nav anchors (active highlighting works); `.readout.warn` style; quiz/bet buttons get `.correct`/`.wrong`; the ledger is a single column of `ledger-card`s; step-0 constants moved into `MODEL`; bubble motion uses dt; the y-axis is scaled to the curve max (rounded up to 5). Skipped: the animated source/destination arrows (structural) and a ×10 speed-up.
- Checks: `node --check` app.js and i18n.js OK; i18n zh 99 / en 99, placeholders match; /tmp/photo-fix/probe.js: 35 pass / 0 fail. The reviewer's old probe still reports FAIL on the product-formula and strict-monotonic checks and on its own formula's +23%. Those checks encode the old product model, which M5 replaced on purpose.

## Android scrolling repair · Codex · 2026-10-26

- Isolated from fetched delivery base `1d90150cf9c1db194769dff92dc4178ce7779fb0`; only `photosynthesis/` changed.
- Public deployment still served an older `fit()` that re-read the mutated bitmap height. Local replay at DPR 3 measured CSS canvas heights 300 → 900 → 2700 → 8100 and document height 5790 → 7590 → 12990 → 29190 after only three resize events. See `tests/evidence/deployed-reproduction.json` and `deployed-gap.png`.
- CSS now owns the 300px canvas layout, independent of bitmap/DPR; assets have a page-local revision query. One animation frame chain, offscreen/background pause, reset stop, stable bet buttons, guarded optional Observer/Canvas support, readable static HTML and diagram fallback copy. Six teaching steps and min-limit model preserved. Added bilingual visible Codex repair attribution.
- Self-check: Chrome 156.0.8078.47 / Playwright, all 9 scenarios passed. 360×800 DPR3, 393×851 DPR3, 412×915 DPR2, 1440×900 DPR1; reduced motion; no Observer; null Canvas context; JS disabled; app script blocked. All six headings populated, no document overflow, content in every full-scroll sample, canvas always 300 CSS px. Initial document heights: 6226, 5889, 5838, 5269 px for the four normal sizes. Thirty repeated redraws did not change document height. See `tests/evidence/results.json`.
- Interaction checks: correct bet and persistent focus during animation, bubble count, reset stops playback, scroll-away/pagehide pause, equation water source, slider 0/100, quiz 2/2 and reset, zh/en switch, anchored reload, related lesson and Back, orientation/viewport height changes, actual emulated touch swipes. No photosynthesis page errors in the passed suite. Static fallback remains Chinese when JavaScript is unavailable.
- Visually inspected sequential mobile viewport screenshots (header, experiment, atom ledger, both curves, quiz, finale), desktop finale and fallback views. Screenshots are under `tests/evidence/`. No giant blank region observed in fixed-page emulation.
- Limits: not a physical Android test; no live deployment or push; independent review pending integration. All changed page assets must be delivered together because the current public app is older than the baseline. No task-owned AI model was started.
- Regression contract: `SCROLL-SPEC.md` and appended BRIEF acceptance criteria.
