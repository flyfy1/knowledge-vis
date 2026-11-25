# 稳定币、数字人民币和“新钱” / Stablecoins, CBDCs and New Kinds of Money — BRIEF

- Author: Claude Code (claude-opus-5-5), 2026-11-25, written directly in the Markdown site template.
- English: `content.en.md` is a generated structural stub (`"languages": {"en": "stub"}`), left for a Haiku translation pass.
  Note for the translator: app.js shows $bn amounts ×10 in Chinese (亿美元) and as-is in English (`u.bn: {v} billion`).
- Review: none yet.

## One question
一种新的钱，凭什么和旧的钱一比一？(What makes a new kind of money trade one-for-one with the old?)

## Chapters and models
1. 什么东西算钱 (#ch1): the tiers of money, singleness. Diagram dg-tiers. No model.
2. 一笔付款怎样结清，跨境为什么又慢又贵 (#ch2): settlement, finality, RTGS vs net, correspondent chains. Diagram dg-chain. No model.
3. 比特币是货币吗 (#ch3): a price tag in a volatile unit. Model `unitOfAccount`/`unitPath`: log-normal 90% band and the
   Brownian exit-time result E[τ] = a²/σ² ⇒ σ²/a² repricings a year (seeded daily path shows fewer, because of discrete monitoring).
4. 窄银行 (#ch4): reserve-backed peg. Model `pegSim`: random-walk selling wish + news jump, arbitrage beyond fee f, capacity K/h,
   redemption/minting closed hours 96–155. Diagram dg-coin.
5. 挤兑 (#ch5): run on a peg. Model `runModel`: Diamond–Dybvig parameterised for a reserve pool (liquid share, fire-sale haircut,
   hole, equity buffer, jumpy share, uniform tolerance 0–1%). Exact: buffer ≥ hole ⇒ no run. tests cross-check V(R) against
   why-banks-run `ddPayoffs` (R = 1, s = 1 − h, no loss). Diagram dg-waterfall. Presets: hole, panic, GENIUS-like, mixed (TUNED, illustrative).
6. UST 死亡螺旋 (#ch6): model `spiral`, hourly; depth relative to token market cap; exact small-swap result: coverage falls iff
   c < 1/d − 1. Panic terms (β, γ, κ) are TUNED. Halts at token price $0.0001. Diagram dg-terra.
7. 发行人靠什么赚钱 (#ch7): model `issuer`: Π = U0·e^{−η(r−r0)}·r·(1−δ) − C; peak at r = 1/η. Diagram dg-income.
8. 央行数字货币 (#ch8): model `cbdcCap`: log-normal household deposits (median €5,000, log-sd 1.4, TUNED), closed-form
   E[min(D, cap)]; central- vs bank-liability. Diagram dg-ecny.
9. 规则 (#ch9): GENIUS / MiCA / Hong Kong card table (figures/dg-rules.html); reuses ch5 (GENIUS preset) and ch7 models by name.
10. 前沿在哪 (#ch10): dated items tagged 确立 / 测量 / 声称·争论.
11. 收尾 (#ch11): five questions.

## Sources (opened 2026-11-25 via web search / fetch; most are secondary)
- Stablecoin supply 2026-11-12 (DefiLlama via stablecoininsider.org snapshot, cryptobriefing): total $286.9bn, USDT $175.66bn, USDC $69.88bn; May 2026 peak $309.7bn (CryptoBriefing) vs $315.54bn (edgex).
- Tether Q3 2026 attestation (BDO), via odaily/securities.io/stablecoininsider/bitcoin.com: reserves $191.5bn, Treasuries $132.4bn, T-bills $122.8bn, liabilities ~$183.5bn, excess $7.95bn, Q3 profit ~$1.5bn, gold $19.08bn, BTC $8.37bn. Primary PDF not read.
- Circle Q3 2026 results (Business Wire via finviz; The Block 2026-11-04): reserve income $658m, avg USDC $73.3bn, reserve return rate 3.5%.
- USDC/SVB: Circle $3.3bn at SVB (~8% of reserves) (CNBC, Cointelegraph, Fortune 2023-03-10/11); low 0.87 (Guardian) or 0.88 (Axios, The Block).
- UST/LUNA: Anchor ~19.5% and ~72% of UST supply (Forklog, late Apr 2022); LUNA ~340m → ~6.5tn tokens; depeg 7–9 May 2022 (secondary; order of magnitude). Liu–Makarov–Schoar paper downloaded but could not be read (no PDF tools).
- GENIUS Act: signed 2025-07-18; reserves per 12 U.S.C. 5903 (Cornell LII), ≤93-day Treasuries; interest ban (Skadden, Paul Hastings); OCC final rule 2026-10-21, effective 2027-01-18 (OCC bulletin 2026-50 via The Block/Decrypt).
- MiCA: EMT rules from 2024-06-30; Art. 49 par redemption without fee, Art. 50 interest ban (ESMA interactive rulebook).
- Hong Kong: Stablecoins Ordinance (Cap. 656) in force 2025-08-01 (gov.hk 2025-06-06); first licences HSBC and Anchorpoint 2026-04-10; 36 applicants (HKMA press release 2026-04-10).
- e-CNY: two-tier, 小额匿名、大额依法可溯 (PBoC white paper 2021-07 via news; CCB material); 2.0 from 2026-01-01 deposit-type, interest, reserve requirement, deposit insurance, 100% margin for non-bank operators (Xinhua 2025-12-29, 2026-01-13); usage end-2025 ¥19.5tn / 3.57bn tx; 2.3亿 wallets end-Nov 2025; Jiangsu MAU ~15% (Jiemian/CCTV via search).
- Alipay 备付金 100% 集中交存 by 2019-01-14 (Jiemian, NBD).
- BIS AER 2025 ch. III and 2026 (The Block 2026-06-28): three tests, >99% USD-pegged, ~$320bn end-May 2026.
- FRBSF Economic Letter 2026-26 (2026-09-28): +~$200bn Treasuries over 5 years, more short-term than Japan since 2023, ~$400bn by 2030 projection.
- Standard Chartered $0.8–1.0tn T-bill demand by 2028 (The Block 2026-02-23).
- IMF FDMD Dan Katz speech 2026-08-07: >$30tn volume, $6.1tn cross-border ("some sources"), BIS $390bn payment-related.
- World Bank RPW Q1 2025: 6.49% global average cost of sending $200.
- Digital euro: EP plenary mandate 2026-07-09 (416–169–22); ECB simulated €500–€3,000 caps on 2,025 banks (ECB interviews 2025-12, 2026-06).

## Status at wrap-up 2026-11-25
**Done.** zh content for all 11 chapters, 6 models (models.js), 7 SVG diagrams + 1 rules table, app.js wiring for all six labs,
bindings.cjs (52 bound numbers), page.json (no status), REGISTRY.json (8 concepts), tests/models.cjs (115/115 pass).
`node scripts/build-pages.cjs <dir>` and `--check` pass (warnings only: draft, en stub, raw links to unregistered sibling drafts).

**Missing.** English translation (stub). tests/browser.cjs. No browser render check was run (wrap-up order), so app.js is
verified only by `node --check`; canvas layouts, label overlap and 320 px behaviour are unchecked. Independent review.

**Unverified.** Most frontier figures are from secondary reporting (listed above); the Tether attestation, the UST peak
figures and e-CNY usage numbers in particular. The US Jan-2025 executive order on CBDCs and El Salvador's 2021/2025 bitcoin
law are stated from memory, not re-checked this session. HK reserve/capital details deliberately omitted.

**Links to unregistered siblings (raw `<a>`, registrar should convert to `[[…]]` when they go live):** why-banks-run #ch4, #ch7;
what-sets-an-exchange-rate #ch8, #ch11; markets/when-buyers-cant-see-quality; investment/rates/what-the-yield-curve-says.

**Concepts (REGISTRY.json).** Owned per TASK-econ-series §4.I: money-hierarchy-settlement (#ch1), payment-rails-settlement-finality
(#ch2), stablecoin-peg-reserves (#ch4), stablecoin-run-depeg (#ch5), cbdc-design (#ch8), frontier: stablecoin-regulation-2025 (#ch9)
and stablecoin-frontier-2026 (#ch10). Extra, needs the architect's OK: bitcoin-unit-of-account (#ch3).

**Proposed edges** (from §4.I): money-as-iou>money-hierarchy-settlement:foundation; reserves-floor-system>money-hierarchy-settlement:foundation;
money-hierarchy-settlement>payment-rails-settlement-finality:foundation; money-hierarchy-settlement>stablecoin-peg-reserves:foundation;
bank-run>stablecoin-peg-reserves:foundation; stablecoin-peg-reserves>stablecoin-run-depeg:foundation;
maturity-liquidity-transformation>stablecoin-run-depeg:connection; money-hierarchy-settlement>cbdc-design:foundation;
loans-create-deposits>cbdc-design:foundation; trilemma-exchange-rate-regimes>stablecoin-peg-reserves:connection.
Additional: bank-run-diamond-dybvig>stablecoin-run-depeg:foundation; stablecoin-peg-reserves>stablecoin-regulation-2025:foundation;
stablecoin-run-depeg>stablecoin-regulation-2025:connection; hashing>bitcoin-unit-of-account:connection.
