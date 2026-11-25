# Review — economics/markets/when-buyers-cant-see-quality (2026-11-25)

- Reviewer: Claude Code (claude-opus-5-5), independent of the writer. Scope: content (model math re-derived, prose read in full in zh, edited lines in en), sourced-fact spot checks, alias ownership, structural checks. Not a full acceptance pass (per the 2026-11-25 "content first" instruction).
- Verdict: **pass with small fixes applied.** The models are correct and the teaching ladder holds; no model or number had to change. Seven prose fixes in zh and en (below). Ready for registration once the alias decisions below are entered.

## 已核 (checked)

Model numbers re-derived with an independent Python script (/tmp/agent-tasks/econ-graph/review-lemons/check2.py, own bisection and ternary search, not models.js):
- ch1 CRRA g = 2, W 20, L 10, p 2%: CE = 1/(0.98/20 + 0.02/10) = 19.6078 → max premium 3,922, ratio 1.96. Matches.
- ch3 Akerlof continuum p* = b·lo/(2 − b) = 6.0 → share 50% (100 of 200 cars), gains share (p*² − lo²)/(hi² − lo²) = 33.3%; the discrete run's 6.03 / 101 cars / 34% is consistent. Full market iff b(lo + hi)/2 ≥ hi, consistent with the "b ≥ 2 never collapses" line.
- ch4 death spiral: confirmed the final state is a fixed point (40 stayers, premium 11,293 = 1.15 × their mean cost, every stayer's WTP ≥ premium); swept the incentive (0 → 4%, 500 → 18%, 1,000 → 29%, 1,200 → 41%, 1,400 → 67%, 1,500 → 85%, 2,000 → 100%), so "tips between 1,000 and 1,500" holds. ch2 "about 200 ± a dozen or so" = sd √(10,000·0.02·0.98) = 14. OK.
- ch5 Rothschild–Stiglitz: D* = 6.696 (6.70); high-risk premium 20,000, B premium 0.05 × 3.30 = 1,652; loss at D = 3: 0.3 × 0.15 × 7 = 3,150; pooled-offer break threshold λ = 12.6% (13%).
- ch6 Spence: separating range (14 − 8)/4 = 1.5 to 6/2 = 3; at e* = 2 the high type nets 10 < pooled 11; at 1.5 nets 11, a tie. OK.
- ch7 moral hazard: best co-pay 36%, CE 19.076; full cover 19.00; first best 19.204 at care 0.583 (= p0·a·L/2k). OK.
- ch8 Stiglitz–Weiss: limits 23.7 / 28.8 / 42.2 / 66.7%; best rate 23.7% with all groups applying, return 6.6%, F = 0.5 → 50% rationed; gap = 0 → peak at 100%, riskiest group alone, return 20% (= μ − u0). The writer's honesty note is right: with binary projects and zero collateral each group alone pays the bank μ − u0 at its own limit, and mixing in riskier groups only lowers it, so in this toy model rationing needs the "riskier is also worse" gap. The prose says that and says SW conclude rationing *may* occur. Priced-by-score rates 5.2 / 15.9 / 36.0 / 70% (70 > 66.7, so the riskiest group goes unserved). OK.
- ch9 scorecard: 600 at 50:1, +20 per doubling (odds 100 → 620); default applicant (PD 1.5%) → 608. At cutoff 580: 38% rejected and 82% of the 6.3% bad rejected → about 14% of rejected are bad, so "most rejected would have repaid" holds.
- tests/models.cjs: 61/61 checks pass.

Sourced facts spot-checked:
- Akerlof's three rejections: his Nobel essay, "Writing 'The Market for Lemons'" (read via equitablegrowth.org; nobelprize.org returned 403). AER and RES: "triviality"; JPE: referees argued it was wrong ("if this paper was correct, economics would be different"). Prose now says exactly that.
- EU AI Act digital omnibus: law firms agree (Lewis Silkin 2026-07-27, CMS, White & Case, Cuatrecasas) that it was published in the OJ on 24 July 2026 as Regulation (EU) 2026/1744 (OJ:L_202601744), in force 27 July 2026, and moves the Annex III dates from 2 Aug 2026 to 2 Dec 2027. I did not open EUR-Lex itself; the prose now says the OJ text was not opened.
- 2024 bulletin: 132,662.08 万 total, 95%; 居民医保 94,713.73 万 (chinanews 2025-07-14, huanqiu). Matches. Note: the 2025-03 快报 gives 132,637.83 万, so the prose rightly cites the 公报.
- FICO: myFICO "FICO Score versions" says base 300–850, industry versions 250–900. Prose now says so.
- RAND HIE design: 1974–1981, about 2,000 households, more than 5,800 people (NBER w18642 / SIEPR abstract). Matches.

## 已改 (changed; zh and en both)

1. ch3 take: the Akerlof rejection story was stated loosely. Now names the three journals and their reasons, and that the paper appeared in the QJE.
2. ch4 veil of ignorance: "大多数人会选…" / "most people would choose" was an empirical claim nobody measured. Now: a risk-averse person, by ch1's logic, would be willing to choose one price for everyone, which amounts to insuring against being born a high risk. Keeps it a model statement, not a policy position.
3. ch5: "一半以上的人风险低…三成风险高" was inconsistent (λ = 0.3, so 70% are low risk). Now "七成" / "seven in ten".
4. ch5 take: "保险公司只有一家" / "a single insurer" contradicted the prose about a rival offering a pooled contract. Now: competition is not simulated; the model only checks whether one pooled contract could lure the low risks away.
5. ch7 take: "自付就只剩惩罚" / "only a penalty" was loaded wording on a health-adjacent point. Now: a co-pay then only means less cover, with no extra care in return.
6. ch9: FICO range qualified as base versions 300–850 (industry versions 250–900).
7. ch10 e4: added the OJ publication (24 July 2026, Regulation (EU) 2026/1744, in force 27 July 2026) and the source caveat.

## 没核 (not checked)

- RAND "about 39% less than free care" (Aron-Dine, Einav & Finkelstein 2013 Table 2: $2,170 versus −$845). PMC returned a CAPTCHA and the NBER PDF did not extract, so this is still the writer's reading. Plausibility: the raw means in Manning et al. (1987) give about 31%. A 39% figure from the paper's regression table is credible, and the prose names the source and the 2011 dollars.
- 居民医保 2021–2023 (100,866 / 98,349 / 96,294 万): these match my recollection of the bulletins but I did not open them. They sit under "某一方的说法" with both explanations attributed and "no verifiable split" stated, which is the right label.
- The 2025 funding standard of 1,100 / 700 / 400 and the 国办发〔2024〕38 号 details: not re-opened, but consistent with what I know.
- No full browser read in zh/en at 1280/390/320 and no canvas sweep (per the instruction). tests/browser.cjs was run; see the report.
- Only the edited English lines were re-read in full. I spot-read the rest and it is natural; there is no translationese worth fixing.

## Teaching ladder

The ladder runs from first principles to the frontier and is sound. Concave utility leads to the CE and the maximum premium, which become each person's bid in the ch4 pool, and that pool is ch3's lemons logic applied to people. The repairs come in a clear order: screening (ch5, the uninformed side moves), signalling (ch6, the informed side moves; dg-signal makes the contrast explicit), then moral hazard after the contract (ch7) and principal–agent. Credit (ch8–9) reuses the whole chain. Two places are slightly thin but not wrong, so I left them:
- ch5 states the RS non-existence result without saying it is about pure-strategy equilibrium, or that the later fixes exist (Wilson, Riley, Miyazaki–Spence). The prose only says "后来很多理论要处理".
- ch6 says the Spence model has many equilibria, but not that the intuitive criterion picks the least-cost separating one (e* = 1.5 here). That would be a natural one-line bridge from the 1.5 tie.

## Alias ownership (for the registrar)

- 风险厌恶 / risk aversion: **move to `certainty-equivalent-insurance` (#ch1)** and remove them from `risk-pooling` (the risk-pooling concept currently carries zh 风险厌恶 and en risk aversion and risk averse). Reason: risk-pooling uses risk aversion only as a linear mark-up, WTP = (1 + m) × expected loss in step 4. It never teaches the idea itself. #ch1 teaches it with a concave CRRA utility, the certainty equivalent and a live model. Leave "risk averse" with risk-pooling if you want a soft pointer, though I would move it too.
- A second collision the writer did not flag: `market-failure` (scarcity-moves#c6) carries 信息不对称, 柠檬市场, asymmetric information and market for lemons, which are also on `lemons-market`. Recommendation: `lemons-market` owns 柠檬市场 / market for lemons and 信息不对称 / asymmetric information, since this essay is the site's information-economics node. `market-failure` keeps its general aliases (市场失灵, 公共品, …).

## Advice and policy

Not advice: the opening note disclaims it and nothing tells the reader what to buy or borrow. Health policy: ch4 and ch10 present what mandates and underwriting do in the model, cite measured or estimated effects with dates, and say explicitly that the choice is a value judgement. After fixes 2 and 5, no position is taken.
