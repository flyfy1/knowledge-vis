# BRIEF · where-wages-come-from（工资是怎么定出来的，AI 会改什么）

- Author agent: Claude Code sub-agent (claude-opus-5-5, thinking: unavailable), essay writer for N2.
- Brief: specs/essay-briefs/TASK-econ-series.md, "Q8 = N2" (line 946), §1.7, §2 (sixth trail).
- Path: `economics/labour/where-wages-come-from/`. New subtopic `labour` (劳动 / Labour): it is not in
  `pages.config.js` yet, so the registrar has to add it. This page did not edit any shared file.

## Status at wrap-up 2026-11-25

The coordinator called the wrap-up while the essay was still at the model stage.

**Done**
- `models.js`: nine pure models, UMD (`window.WageModels`), with equations in the comments.
  1. Cobb–Douglas marginal product.
  2. Monopsony and the minimum wage in two regimes.
  3. Katz–Murphy race between education and technology.
  4. Occupation as a task bundle, with demand elasticity (the ATM case).
  5. Acemoglu–Restrepo task model, σ = 1, with an exact decomposition into productivity, displacement and
     reinstatement.
  6. CES bottleneck (σ = 1/2 reproduces scarcity-moves #c11).
  7. Baumol two-sector model.
  8. CES labour share.
  9. A dated `FRONTIER` table.
- `tests/models.cjs`: 31 identity checks, all passing (`ok 31 checks`).

**Missing: everything else**
- There is no `content.zh.md` or `content.en.md` yet, and no chapter of zh prose was written, so
  `build-pages` cannot run on this directory.
- Also missing: `page.json`, `REGISTRY.json`, `app.js`, `page.css`, `figures/` (labs and at least six
  diagrams) and `bindings.cjs`.
- The page is not buildable and must not be registered.

**Known model issues (fix before writing prose)**
- Task model calibration. In the default "good machines" case, moving I from 0.4 to 0.5 overshoots the
  profitable frontier: I* = 0.482. It also gives a displacement of −18.2% against a productivity gain of only
  +2.0%.
  - Choose the slider range up to I*, or raise M, so that the default shows both effects visibly.
  - `M.soso = 1.2` makes even the baseline unprofitable: the marginal saving at I = 0.4 is −0.21. Re-pick it
    so the baseline saving is small and positive (about 0.05).
- Bundle model: with η = 2, employment peaks at 1.27× at machine cost 10^−1.73. With η ≤ 1, automation never
  raises occupation employment. This is the intended contrast.

**Planned chapter ladder (from the brief, unchanged)**
1. Marginal product.
2. Monopsony.
3. The minimum wage in two markets.
4. The skill premium.
5. Tasks, not jobs. Recap scarcity-moves #c12, then the bundle model.
6. Displacement, productivity and reinstatement (the task model).
7. The bottleneck.
8. Baumol.
9. The labour share.
10. 前沿在哪 (2026-11).
11. Five questions to ask about "AI will replace X% of jobs".

**Coordination with E (`why-some-countries-got-rich`, draft)**
- E's ch9–ch11 already cover Hulten/Acemoglu, the task experiments (Noy–Zhang 40/18, Brynjolfsson et al.
  14/34, Peng 55.8, METR −19, Humlum 3% time saved) and the macro estimates.
- This essay should reuse those values (copied into `FRONTIER.bryn`) and link E with a raw `<a href>` while E
  is a draft. Do not restate the productivity estimates.

## Sources checked on 2026-11-25 (web), for the frontier chapter
- Brynjolfsson, Chandar & Chen, "Canaries in the Coal Mine?", revised 2026-08-12, ADP payroll data
  (digitaleconomy.stanford.edu/news/canariesaug26/).
  - Ages 22–25 in highly exposed occupations are about 19% below the counterfactual as of June 2026. The
    first version (July 2025 data) found 15%.
  - In levels, Nov 2022 to Jun 2026: the two most exposed quintiles fell about 11%, the three least exposed
    grew about 10%.
  - The adjustment runs through hiring, not separations. The authors call these descriptive, not causal.
    The gaps shrink when education is controlled for, there are some pre-trends, and the ADP gaps are
    larger than in national surveys.
- Humlum & Vestergaard, "Large Language Models, Small Labor Market Effects", BFI WP 2025-56 (2025-04-15).
  - Precise nulls on earnings and hours, ruling out effects above 2% two years after.
  - 11 occupations, 25,000 workers, 7,000 workplaces, average time saved 3%.
  - Later NBER w33777 version: "Still Waters, Rapid Currents".
- Yale Budget Lab tracker, update of 2026-04-16 (March CPS data): the occupational mix is changing somewhat
  faster than in past waves, but the change is modest and predates AI.
- Eloundou, Manning, Mishkin & Rock, "GPTs are GPTs" (arXiv 2303.10130, 2023).
  - About 80% of US workers have at least 10% of their tasks exposed; about 19% have at least 50%.
  - 15% of tasks can be done faster with an LLM alone, 47–56% with tooling.
  - Three of the four authors were at OpenAI.
- IMF blog, 2024-01-14: about 40% of global employment is exposed (60% in advanced economies, 40% in emerging
  markets, 26% in low-income countries). This measures exposure, not jobs lost.
- Amodei (Anthropic CEO), Axios, 2025-05-28: AI could eliminate half of entry-level white-collar jobs and push
  unemployment to 10–20% within 1–5 years.
  - This is a vendor claim (某方声称). Disclose that this page was written by Anthropic's Claude.
- Anthropic Economic Index, January 2026 report (November 2025 data): augmentation 52%, automation 45% on
  Claude.ai. March 2026 report: coding is 35% of Claude.ai conversations.
  - Vendor data; state the publisher and what it can and cannot show.
- Epoch AI, "LLM inference price trends" (March 2025): the price for a fixed capability falls 9× to 900× a
  year depending on the benchmark (40× for GPT-4-level GPQA).
  - GPT-4 list price at its March 2023 launch was $30 / $60 per million input / output tokens. This comes
    from memory: it was not re-verified.
- Cengiz, Dube, Lindner & Zipperer, QJE 134(3) 2019: 138 state minimum-wage increases from 1979 to 2016. The
  number of low-wage jobs was essentially unchanged over five years.
- Neumark & Shirley, NBER w28388 / Industrial Relations 61(4) 2022: 79.3% of the estimated elasticities are
  negative and 47.9% are negative and significant at 5%. These figures come from the working paper.
- CBO, July 2019, $15 by 2025:
  - pay rises for 17 million workers;
  - median job loss 1.3 million (range about 0 to 3.7 million);
  - 1.3 million people lifted out of poverty.
  - Secondary sources only (NPR); the CBO original was not opened.
- Sokolova & Sorensen, ILR Review 74(1) 2021: 1,320 estimates from 53 studies. Inverse-elasticity estimates
  have a median around 14, and direct estimates are lower.
  - Card 2022's "plausible elasticity" number was NOT verified; do not cite one.
- Karabarbounis & Neiman, QJE 129(1) 2014 (numbers from the NBER w19136 version):
  - the global corporate labour share fell 5 percentage points;
  - σ = 1.25;
  - a 25% fall in the relative price of investment explains about half of the decline.
- Katz & Murphy 1992: a relative-supply coefficient of −0.709 (σ ≈ 1.41). This is from memory, not
  re-verified.
- China, Ministry of Education: 12.7 million 2026 graduates (announced 2025-11-20, 480,000 more than the year
  before); 12.99 million expected for 2027 (announced 2026-11-19).
- Acemoglu & Restrepo 2018 AER and 2019 JEP: only the JEP abstract was read (it confirms the three effects).
  The model equations come from memory of the papers, with γ_L(i) = e^{θi} as a stated simplification. They
  need checking against the paper's text, because its PDF could not be read with the local tools.

## Proposed REGISTRY concepts (six owned, per §1.7)

| id | anchor | needs first |
|---|---|---|
| `wage-marginal-product` | #ch1 | `supply-demand:F`, `marginal-thinking:F`, `income-to-the-scarce:C` |
| `monopsony-minimum-wage` | #ch2 (ch3 attaches as a second lesson) | `wage-marginal-product:F`, `tax-wedge-deadweight-loss:C`, `monopoly-pricing-lerner:C` |
| `skill-premium-education-race` | #ch4 | `wage-marginal-product:F` |
| `task-displacement-reinstatement` | #ch6 (ch5 attaches to the existing `ai-tasks-wages` as a lesson) | `ai-tasks-wages:F`, `wage-marginal-product:F` |
| `baumol-cost-disease` | #ch8 (ch7 attaches to the existing `ai-cheap-thinking` as a lesson) | `relative-prices-after-ai:F`, `wage-marginal-product:F` |
| `ai-labour-evidence-frontier` | #ch10 | `task-displacement-reinstatement:A`, `hypothesis-testing:C` |

- Ch9 (labour share) should become an extra lesson on `income-to-the-scarce` or
  `solow-growth-accounting-tfp`, not a new node.
- Extra proposed edges:
  - `task-displacement-reinstatement>ai-productivity-frontier:connection`, which needs E;
  - `baumol-cost-disease>ai-productivity-frontier:connection`;
  - `regression-correlation>ai-labour-evidence-frontier:connection`.
- Sixth trail join: `relative-prices-after-ai` → `baumol-cost-disease` → (via the edge above)
  `ai-productivity-frontier`. This makes one path once both are live; the registrar should decide.
