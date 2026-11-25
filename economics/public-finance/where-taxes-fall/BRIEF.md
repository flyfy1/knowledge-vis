# BRIEF · economics/public-finance/where-taxes-fall · 税和限价：写在谁头上，落在谁头上

Author: Claude Code sub-agent (claude-opus-5-5, thinking: unavailable), essay writer N5, 2026-11-25.
Brief: specs/essay-briefs/TASK-econ-series.md § N5 (line 1200). Not reviewed. Not registered.

## Status at wrap-up 2026-11-25

Stopped by the WRAP-UP order before any prose was written.

**Done**
- `models.js`: every model in the brief, plus a two-good Ramsey model for ch3. All are pure functions (UMD, `window.TaxModels`):
  `incidence` (linear, exact; legal-payer toggle; negative t = subsidy), `curve` (revenue and loss on one axis), `ramsey`,
  `laffer` (ETI with Pareto parameter a; R ∝ τ(1−τ)^{ae}), `iit` / `bonus` / `bonusNotches` (China's 2018 IIT tables, the
  separate one-off bonus rule, a hypothetical benefit cliff), `vat` (VAT, retail sales tax, turnover tax, an exempt firm
  in the middle or at the end), `cap` (rent ceiling, Q_t = Q_{t−1} + λ(Q*(P̄) − Q_{t−1}), shadow price), `land`
  (P = R/(r+τ)), and a `FRONTIER` data block.
- `tests/models.cjs`: 71/71 pass. Every model is checked against an independent derivation: market clearing, brute-force
  peaks, the quick deductions against a bracket sum, the excess-burden integral, and the SSG worked example.
- `tools/diagrams.cjs` generates 7 static SVG partials in `figures/` (dg-wedge, dg-legal, dg-square, dg-bracket, dg-vat,
  dg-cap, dg-land). Their labels are `data-i18n` keys with no strings yet, and nothing has rendered them.

**Missing (nothing reader-facing exists yet)**
- `content.zh.md`, `content.en.md`, `page.json`, `REGISTRY.json`, `app.js`, `page.css`, the lab partials, `bindings.cjs`.
  The page cannot be built, so `node scripts/build-pages.cjs <dir> --check` was not run.
- English: not started. Use the Haiku pass after zh exists.

**Planned chapter ladder (anchors), with the model numbers already pinned**
1. `#ch1` 楔子（复述 [[supply-demand#step1]]，三句）— dg-wedge.
2. `#ch2` 谁写在税单上不重要 — default ε_d 0.5, ε_s 1.5, tax 10 on price 100: buyer pays 107.5, seller keeps 97.5,
   buyers bear 75%, Q 96.25, revenue 962.5, loss 18.75. Toggling the legal payer changes only the price tag (107.5 vs 97.5).
3. `#ch3` 损失随税率的平方增长 — twice the tax gives exactly 4× the loss (linear). Ramsey: raising 1,000 from good A
   (ε_d 0.3) and good B (ε_d 2) with ε_s 1. The optimum takes 74.3% from A, loss 8.88, against 11.75 under one uniform
   tax; t_A/t_B ≈ k_B/k_A.
4. `#ch4` 税收的驼峰 — commodity case: prohibitive tax 266.7, peak at 133.3, loss = revenue at 177.8 (2/3).
   Income case: τ* = 1/(1 + a·e). With a = 1.6, e 0.12 → 83.9%, 0.25 → 71.4%, 0.4 → 61.0%, 0.5 → 55.6%. At τ = 35%,
   e = 0.5, 43.1% of mechanical revenue is lost and the marginal excess burden is 76%. These reproduce SSG's own worked
   example. The page will not say where any country sits on the curve.
5. `#ch5` 边际与平均税率、断崖 — annual income 500,000 (after the 60,000 deduction): tax 79,080, average rate 15.8%,
   marginal rate 30%. One-off bonus: 36,000 → tax 1,080; 36,001 → 3,390.1; take-home stays lower until 38,566.67.
   At 144,000 the jump is 13,200.2 and the dead zone ends at 160,500. A hypothetical 6,000 benefit withdrawn above
   95,000 gives an implied 603% marginal rate over the next 1,000.
6. `#ch6` 增值税：同一道楔子放在不同位置 — farm 30 / mill 30 / bakery 40 at 13%. VAT 13 = retail sales tax 13.
   Turnover tax cascades to 26.79, or 17.41 if mill and bakery merge. An exempt mill raises the total to 17.41 and the
   consumer price to 117.41, because its unrecoverable input VAT is embedded and taxed again. An exempt bakery lowers it to 7.8, price 107.8.
   Link [[how-an-economy-is-measured#ch1]] (value added).
7. `#ch7` 补贴是反方向的楔子 — reuses the ch2 model with t = −10, ε_d 0.8, ε_s 0.2: sellers capture 80%.
8. `#ch8` 限价：短缺、排队、质量 — cap 85, ε_d 0.5, short-run ε_s 0.1: shortage 9, shadow price 103. Link
   scarcity-moves #c4 (its market model has a cap).
9. `#ch9` 十年以后 — the same cap with λ 0.3 and long-run ε_s 1: stock 85.4 and shortage 22.1 at year 10; the shadow
   price tends to 130, above the uncapped 100.
10. `#ch10` 对走不了的东西征税：土地 — r 3%, τ 1%: land price −25%, which equals the present value of all future tax
    (the owner at announcement bears it). The ch2 model with ε_s = 0: sellers bear 100% and there is no loss.
11. `#ch11` 前沿在哪（2026 年 11 月）— facts below.
12. `#ch12` 读到税和限价新闻时问四件事 (not a concept).

## Sources (opened 2026-11-25)

- Saez, Slemrod & Giertz, "The Elasticity of Taxable Income with Respect to Marginal Tax Rates: A Critical Review",
  JEL 50(1):3–50, 2012. Text read from the 2009 working-paper PDF, https://eml.berkeley.edu/~saez/saez-slemrod-giertzJEL09elasticity.pdf:
  "The most reliable longer-run estimates range from 0.12 to 0.4". It gives τ* = 1/(1 + a·e) (eq. 7), a ≈ 1.6 for the
  US above $300,000, and the example e = 0.5, a = 1.6 → 55.6%, 43.1% lost, MEB $0.76. [已确立 formula / 已演示 estimates]
- Benzarti, Carloni, Harju & Kosonen, "What Goes Up May Not Come Down", JPE 128(12), 2020; NBER w23849 abstract
  (https://www.nber.org/papers/w23849): prices respond twice as much to VAT increases as to decreases; EU VAT changes
  1996–2015 show similar asymmetry.
- Fuest, Neumeier & Stöhlker, ifo WP 341 (2020), abstract via https://econpapers.repec.org/RePEc:ces:ifowps:_341:
  the German VAT cut of 1 July 2020 (to 31 Dec 2020) was passed through nearly fully in supermarkets, ~190,000 products,
  Austria as control, prices −2% on average. The model's full pass-through for 7%→5% is −1.87% and for 19%→16% is −2.52%.
- Montag, Sagimuldina & Schnitzer, arXiv 2008.08511 abstract: fuel pass-through of the same cut was "fast and
  substantial but remains incomplete for all fuel types". The ~61% E10 figure appears only in search snippets of a
  VoxEU column that returned 403, so it is **not verified** and must not be used.
- Diamond, McQuade & Qian, AER 109(9):3365–94, 2019; NBER w24181 abstract (https://www.nber.org/papers/w24181):
  San Francisco's 1994 expansion made tenants nearly 20% more likely to stay, treated landlords cut rental supply by 15%,
  and citywide rents rose 5.1%. These map onto ch8–9's two outputs.
- 财政部 税务总局公告2023年第30号 (2023-08-18), https://www.gov.cn/zhengce/zhengceku/202308/content_6900595.htm:
  separate taxation of the one-off annual bonus (bonus ÷ 12 → monthly table) is in force to 2027-12-31.
- 《中华人民共和国增值税法》: adopted 2024-12-25, in force 2026-01-01, rates 13/9/6 unchanged, 3% levy rate. Confirmed
  only via search summaries of gov.cn, news.cn (2026-03-20) and KPMG. **Open the gov.cn text before use.**
- 房地产税: NPC Standing Committee authorisation of 2021-10-23, five years. 21世纪经济报道 (2026-07-27, via
  https://news.sina.cn/gn/2026-07-27/detail-inikfnpf3124233.d.html) says the pilot "尚未落地"; only Shanghai and Chongqing
  have taxed some personal housing since 2011. No NPC decision after October 2026 was found. Shanghai's extension to
  2031 appeared only in a search snippet and is **not verified**.
- OECD Pillar Two Side-by-Side package, 2026-01-05. Per Baker McKenzie and EY (2026-01-06), it exempts groups whose
  parent sits in a qualifying jurisdiction (so far only the US) from the IIR and UTPR for fiscal years from 2026-01-01;
  QDMTTs still apply. The OECD press release returned 403. The 147-member figure is **not verified**.
- China IIT rate tables: 个人所得税法 (2018) annual table and the monthly table attached to 2023 No. 30. The rates are
  as recalled and the test checks them for internal consistency; **re-open the statute text before publishing.**

## Proposed REGISTRY concepts (7 ids, per the brief)

| id | anchor | zh title | aliases to use (avoid 税负归宿, 税负转嫁, 税到底谁出, 无谓损失, 补贴给了谁, tax incidence, deadweight loss, who pays a sales tax, 庇古税 — owned by Q1 / who-pays-a-tariff / why-a-few-firms-win / externalities) |
|---|---|---|---|
| `tax-incidence-elasticity-shares` | #ch2 | 税负怎么分：只看弹性 | 消费税到底谁出, 税写在卖家头上为什么买家付, 法定纳税人和实际负担, statutory vs economic incidence |
| `deadweight-loss-revenue-hump` | #ch4 | 税收驼峰与拉弗曲线 | 拉弗曲线, 税率越高税收越多吗, 收入最大化税率, 应税收入弹性, Laffer curve, elasticity of taxable income |
| `marginal-average-tax-rate` | #ch5 | 边际税率、平均税率与断崖 | 个税累进怎么算, 边际税率和平均税率, 涨工资到手变少, 年终奖临界点, marginal vs average tax rate, tax notch |
| `vat-value-added-chain` | #ch6 | 增值税：按增加值一路抵扣 | 增值税是怎么回事, 进项抵扣, 销项税, 营业税为什么重复征税, how does VAT work |
| `price-controls-shortage` | #ch8 | 限价、短缺与排队 | 为什么限价会缺货, 房租管制有用吗, 价格上限, 影子价格, price ceiling, does rent control work |
| `land-tax-inelastic-base` | #ch10 | 对走不了的东西征税：土地税与资本化 | 房产税会让房价跌吗, 土地税, 税收资本化, 亨利·乔治, land value tax, tax capitalisation |
| `tax-frontier-2026` | #ch11 | 税与限价的证据（2026 年 11 月） | 增值税降了价格降没降, 全球最低税, 房地产税试点进展, VAT pass-through evidence, global minimum tax status |

Ramsey (#ch3), subsidies (#ch7) and the long run (#ch9) are chapters, not concepts.

## Proposed edges (registrar types them into atlas/graph/lessons/where-taxes-fall.json)

- `supply-demand>tax-incidence-elasticity-shares:foundation`; `tax-wedge-deadweight-loss>tax-incidence-elasticity-shares:foundation`
  (once Q1 registers it); `price-elasticity>tax-incidence-elasticity-shares:foundation`
- `tax-incidence-elasticity-shares>deadweight-loss-revenue-hump:foundation`; `consumer-producer-surplus>deadweight-loss-revenue-hump:connection`; `derivative>deadweight-loss-revenue-hump:connection`
- `deadweight-loss-revenue-hump>marginal-average-tax-rate:connection`; `incentives>marginal-average-tax-rate:connection`; `veil-of-ignorance>marginal-average-tax-rate:connection`
- `gdp-three-ways>vat-value-added-chain:foundation`; `tax-incidence-elasticity-shares>vat-value-added-chain:application`
- `consumer-producer-surplus>price-controls-shortage:foundation`; `price-elasticity>price-controls-shortage:foundation`; `price-signal>price-controls-shortage:connection`
- `tax-incidence-elasticity-shares>land-tax-inelastic-base:application`; `present-value-discounting>land-tax-inelastic-base:connection`
- `tax-incidence-elasticity-shares>tax-frontier-2026:application`; `price-controls-shortage>tax-frontier-2026:application`
- Siblings, using their real REGISTRY ids: `tax-incidence-elasticity-shares>tariff-incidence:connection` (who-pays-a-tariff
  uses `tariff-incidence`, not the brief's `tariff-incidence-pass-through`; its welfare id is
  `tariff-welfare-optimal-tariff`); `price-controls-shortage>monopsony-minimum-wage:connection` (N2, when it exists).
  `deficit-primary-balance` was not checked in can-a-country-go-bankrupt's REGISTRY. Verify before adding.

## Conflicts to flag

- who-pays-a-tariff's `tariff-incidence` already carries 税负归宿 / 税负转嫁 / tax incidence. Q1 also plans to give
  税负归宿 / tax incidence / who pays a sales tax to `tax-wedge-deadweight-loss`. The registrar should decide which single
  node owns them; the general (non-tariff) incidence node would be the natural home.
- who-pays-a-tariff registers `price-elasticity` itself, while the plan puts it on supply-demand #step2 (Q1).
- The brief's §3.0a says page.json `"status": "draft"`; COMMON.md says omit status. Follow COMMON.md.

## Checked / not checked

- Checked: `node tests/models.cjs` 71/71; `node tools/diagrams.cjs` writes 7 partials.
- Not checked: any build, browser render, diagram label room (needs content strings), or English.
