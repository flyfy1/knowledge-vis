# BRIEF · investment/portfolio/how-much-risk-is-worth-taking · 多少风险值得冒

- Author: Claude Code sub-agent (claude-opus-5-5, thinking: unavailable), 2026-11-25. Brief: Fable architect,
  `specs/essay-briefs/TASK-econ-series.md` §3 "Q2 = N1" (CAPM and factors recapped and left to G).
- New subtopic `investment/portfolio` (组合与定价 / Portfolios and Pricing) — not yet in `pages.config.js`; the registrar adds it.
- Not investment advice. Assets 甲乙丙丁 and the coin game are invented; their parameters are labelled assumptions.

## One question
分散能消掉一部分风险；消不掉的那部分，承担它能换来多少回报，一个人又该承担多少？

## Ladder (11 chapters)
1. 风险的地板: σp² = σ̄²/N + (1−1/N)ρ̄σ̄² (opens on diversification #step1/#step2).
2. 有效前沿: Merton closed form (shorts) + exact no-short solution by subset enumeration.
3. 资本市场线与夏普比率: tangency w* ∝ Σ⁻¹(μ − rf), two-fund separation.
4. 夏普比率要测多少年: Lo (2002) SE ≈ √((1+S²/2)/T); best-of-K backtests (exact normal sampling: mean normal, variance via Gamma).
5. CAPM from the tangency portfolio (recap only, identity μi − rf = βi(μT − rf) verified in-model; regression/tests/factors → G).
6. 估计误差: resample T years monthly, re-optimise; 1/N, 1/σ, GMV, "know μ" comparison.
7. 波动拖累 and leveraged ETFs: g = μ − σ²/2, gL = r + L(μ − r) − L²σ²/2, daily-step simulation.
8. 再平衡 / diversification return ½(Σwσ² − σp²), yearly rebalancing vs buy-and-hold simulation.
9. 凯利: f* = (μ − r)/σ², g(2f*) = r, mis-estimated μ, half Kelly; 60 % coin game.
10. 前沿在哪 (2026-11): factor replication (HXZ 2020, HLZ 2016, JKP 2023), inelastic markets (Gabaix–Koijen 2021) and passive share (ICI), ML (GKX 2020; KMZ 2024 vs Nagel 2025).
11. 五个问题 (checklist, not a concept).

## Frontier sources (opened 2026-11-25)
- ICI 2025 Fact Book ch.2 (https://icifactbook.org/pdf/2025-factbook-ch2.pdf): index MFs + ETFs = 51 % of long-term fund assets, year-end 2024 (read via search snippet of the PDF text; PDF itself not text-extracted). 2026 Fact Book ch.2: $19.1 trillion index fund assets year-end 2025 (search snippet).
- Hou, Xue, Zhang, RFS 33(5) 2020 (https://econpapers.repec.org/RePEc:oup:rfinst:v:33:y:2020:i:5:p:2019-2133.): 452 anomalies, 65 % fail |t|>1.96, 82 % at 2.78.
- Harvey, Liu, Zhu, RFS 29(1) 2016 (https://www.nber.org/papers/w20592): t > 3.0 hurdle.
- Jensen, Kelly, Pedersen, JF 78(5) 2023 (https://www.nber.org/papers/w28432): most factors replicate, 13 themes, 93 countries.
- Gabaix, Koijen, NBER WP 28967, June 2021 (https://www.nber.org/papers/w28967): abstract read — $1 in → ~$5 aggregate value.
- Gu, Kelly, Xiu, RFS 33(5) 2020 (econpapers abstract): trees/NNs best; common signals momentum, liquidity, volatility. Sharpe figures differ across versions → not quoted.
- Kelly, Malamud, Zhou, JF 79(1) 2024; Nagel, NBER WP 34104 (2025) (https://www.nber.org/papers/w34104) — via search summary only.
- Haghani & Dewey 2016, arXiv:1701.01427 abstract (https://arxiv.org/abs/1701.01427): ~30 % went bust. "61 participants" from search summary, not re-read in the abstract.
- DeMiguel, Garlappi, Uppal RFS 2009 abstract (econpapers): ~3,000 months for 25 assets.
- Thorp (2006) "50 % chance of halving under full Kelly": stated from the standard result (P(ever falling to fraction x) = x for full Kelly in continuous time), not re-opened.

## Status at wrap-up 2026-11-25
**Done**
- `content.zh.md`: all 11 chapters written, zh only, every prose number bound to `bindings.cjs` (89 bindings) from `models.js`.
- `models.js` (all nine models as pure functions), `bindings.cjs`, `REGISTRY.json`, `page.json` (draft, no `status`; `languages.en = stub`), `content.en.md` structural stub (tools/make-en-stub.cjs).
- `node scripts/build-pages.cjs <dir>` builds; `--check` OK. `tests/models.cjs`: 3485/3485 pass (closed forms vs brute force, tangency optimality by random search, CAPM identity, Lo SE vs simulation, drag vs simulation, Kelly vertex/2f*/half-Kelly, coin f*, every binding defined, the hard-coded law numbers).

**Missing**
- `app.js`: no interactive wiring. The nine lab partials (`figures/ch*-model.html`, `ch9-coin.html`) are placeholders with only title + "how" line; all control/readout/say strings are already in the `::: lab` blocks. Once app.js exists, add `"app.js"` to `page.json.scripts`, declare `dynamicKeys` for the `say.*` keys, and write the lab DOM.
- Diagrams: eight `::: diagram` blocks with captions/labels written, but `figures/dg-*.html` are empty shells (shape a). Needs a `tools/diagrams.cjs` generator (dg-frontier, dg-cml, dg-sml, dg-kelly are meant to be drawn from models.js).
- English translation (leave for Haiku; contract in specs/site-template.md §9).
- `tests/browser.cjs`, screenshots: not done (nothing interactive to test yet).

**Unverified**
- The ICI 51 % and $19.1 trillion figures were read from search snippets of the PDFs, not the extracted PDF text; re-check before going live.
- Thorp halving statement; "61 participants" (Haghani–Dewey).
- No independent review.

## Proposed REGISTRY concepts (7)
`mean-variance-efficient-frontier` #ch2, `sharpe-ratio-capital-market-line` #ch3, `estimation-error-portfolio` #ch6,
`volatility-drag-geometric-return` #ch7, `rebalancing-diversification-return` #ch8 (**not** on the brief's owned list —
the brief asks for rebalancing content; registrar may drop it and move its aliases to the drag node), `kelly-criterion` #ch9,
`portfolio-frontier-2026` #ch10. Aliases avoid risk-return's「平均收益不等于每年收益」and random-walks' GBM aliases.

## Proposed edges (to-end fragment is this page)
```
diversification>mean-variance-efficient-frontier:foundation
variance>mean-variance-efficient-frontier:foundation
vectors>mean-variance-efficient-frontier:connection
mean-variance-efficient-frontier>sharpe-ratio-capital-market-line:foundation
risk-return>sharpe-ratio-capital-market-line:foundation
small-sample-variability>sharpe-ratio-capital-market-line:connection
multiple-comparisons>sharpe-ratio-capital-market-line:connection
mean-variance-efficient-frontier>estimation-error-portfolio:application
small-sample-variability>estimation-error-portfolio:foundation
montecarlo>estimation-error-portfolio:connection
compound-interest>volatility-drag-geometric-return:foundation
variance>volatility-drag-geometric-return:foundation
geometric-brownian-motion>volatility-drag-geometric-return:connection
mean-vs-median-long-tail>volatility-drag-geometric-return:connection
volatility-drag-geometric-return>rebalancing-diversification-return:foundation
diversification>rebalancing-diversification-return:foundation
volatility-drag-geometric-return>kelly-criterion:foundation
expected-value>kelly-criterion:foundation
exp-log>kelly-criterion:connection
estimation-error-portfolio>kelly-criterion:connection
sharpe-ratio-capital-market-line>capm-beta:foundation        (G's node, once live)
gamblers-ruin-first-passage>kelly-criterion:connection       (J's node, once live)
```
Sibling drafts (《一只股票值多少钱》, 《随机游走与布朗运动》) are named in plain text; turn them into `[[...]]` links at registration.
