# Gap audit: what a curious person still cannot find (2026-11-11)

Read-only audit of knowledge-vis. Nothing in the repository was modified. Files in this directory:

- `questions.json` has two parts. Part 1 (`questions`) is 401 everyday questions. Part 2 (`part2_deep`) is the deep track: 63 ladders, 379 unique rungs, 591 rung entries and 219 frontier questions. Everyday questions are 33.1% of the 1,211 items.
- `results.json` holds every query's top 3 (href, title, score, kind) with its classification. `everyday` covers 4 query variants per question. `deep.rungs` and `deep.frontier` are queried in zh and en. Ladder coverage and the blocking rank are also in this file.
- Working files: `run.cjs` (the harness), `labels_ev.txt` and `labels_rungs.txt` (manual judgements), `deep.txt` (ladders), `sample_out.txt` (copy read for the false-hit sample). None of these were deleted, as instructed.

## Method

- **Matcher.** `run.cjs` loads `pages.config.js`, `atlas/search-index.js` and `atlas/concept-search.js`. It reimplements `siteResults()` from `index.html` with category = all and stage = all. That covers the old substring rule, concept dedup against pages, the essay tie rule, and 8 concepts at most. The harness reproduces the pinned results in `tests/concept-search.cjs` (傅里叶, what is entropy, 房贷怎么还).
- **Everyday set.** It was written before I looked at the catalogue. Each question is run 4 ways: the zh question, the en question, a zh keyword and an en keyword.
  - Sources: China 义务教育/高中 curriculum topics, NGSS, and AP/A-level intro sciences.
  - Google Year in Search 2017 ("how") and 2020 ("why"): blog.google/products/search/year-in-search-2017, thinkwithgoogle.com/consumer-insights/consumer-trends/2020-year-in-search.
  - Live Science, kids' most-asked questions: livescience.com/18099-questions-kids-parents.html.
  - Personal-finance and civics FAQ staples.
  - Frequency is my judgement (high/medium/low, weighted 3/2/1), not measured volume.
- **Deep set.** Topics a well-informed person follows in 2026. Sources:
  - Burrus, 2026 tech trends: burrus.com/articles/future-technology-trends-prediction
  - ABI Research: abiresearch.com/blog/top-technology-trends-2026
  - ST semiconductor trends: blog.st.com/top-tech-trends-2026
  - Stanford SIEPR: siepr.stanford.edu/publications/policy-brief/us-economy-2026-what-watch
  - Atlantic Council: atlanticcouncil.org/dispatches/five-trends-to-watch-in-the-global-economy-in-2026
  - Axios: axios.com/2026/01/05/economy-tariffs-ai
  - WEF chief economists, Jan 2026, via mb.com.ph
  - Plus the coordinator's list. Ladders follow standard intro curricula.
- **Classification of everyday questions.**
  - (a): the page or chapter that answers the question appears in the top 3 for at least one variant.
  - (b): only related material appears.
  - (c): nothing, or only noise.
- **Rung labels.** A = present and adequate (a page or chapter on that idea). S = shallow (a passing mention, an atlas-only node, the wrong level, or content that exists but is not indexed). M = missing.
- **Limits.**
  - The labels are one reviewer's judgement.
  - The frequency weights are guesses.
  - The four essays awaiting registration and the eight being written are not in the index. Their 13 everyday questions are flagged `pendingTopic`.

---

# Part 1. Deep track: mainstream technology and economics, school to frontier

## Coverage

| | adequate | shallow | missing |
|---|---|---|---|
| Unique rungs (379) | 122 (32%) | 57 (15%) | 200 (53%) |
| Rung entries across 63 ladders (591) | 228 (39%) | 95 (16%) | 268 (45%) |
| Tech ladders (40) | 169 (40%) | 69 (16%) | 182 (43%) |
| Economics ladders (23) | 59 (35%) | 26 (15%) | 86 (50%) |

By rung level (A/S/M):

| Level | A | S | M |
|---|---|---|---|
| School | 16 | 2 | 0 |
| High school | 40 | 20 | 36 |
| University intro | 61 | 28 | 82 |
| Frontier | 5 | 7 | 82 |

The site is solid up to the university-intro maths and probability rungs. Fourier, eigenvalues, entropy/KL/cross-entropy, convolution, Markov chains, Monte Carlo, the CLT, gradient descent, backprop, attention, PageRank, Kalman, PID, sampling and modulation are all **present**. The shared rungs the coordinator feared were missing are not the problem.

The problems are:

1. The **physics-of-materials middle**: EM waves, band theory, bonding, thermodynamic driving force, nuclear.
2. **Systems computing**: memory hierarchy, concurrency, databases, networking.
3. Almost all of **macro and finance beyond money creation and bonds**.
4. **The frontier layer itself**: 82 of 94 frontier rungs are missing.

Frontier questions as typed (219): 6 answered, 4 partially answered, 209 not answered (95%). Ten of those 209 return only noise; for example "what is rag" lands on the derivative page because "rag" is a substring of "average".

## Ladders, worst first

Coverage = (A + 0.5·S) / rungs. `*` = an essay on this topic was commissioned today.

| Ladder | A/S/M | Coverage |
|---|---|---|
| AI economics | 0/1/4 | 0.10 |
| Energy markets | 1/0/6 | 0.14 |
| Chips* | 1/4/14 | 0.16 |
| Protein structure | 1/1/7 | 0.17 |
| Platforms / industrial organisation | 1/1/6 | 0.19 |
| Inflation measurement | 1/0/4 | 0.20 |
| Materials | 0/3/4 | 0.21 |
| Photovoltaics | 2/1/8 | 0.23 |
| Fission + fusion* | 3/2/11 | 0.25 |
| Deflation | 1/1/4 | 0.25 |
| Blockchain | 2/2/7 | 0.27 |
| Grid market* | 3/0/8 | 0.27 |
| Business cycles | 1/2/4 | 0.29 |
| Agents / RAG | 1/3/4 | 0.31 |
| Accelerators | 4/2/10 | 0.31 |
| Crypto* | 3/3/8 | 0.32 |
| Operations research | 2/0/4 | 0.33 |
| Displays / AR | 2/3/5 | 0.35 |
| Gene editing | 2/1/4 | 0.36 |
| Space launch | 4/1/7 | 0.38 |
| Exchange rates | 2/2/4 | 0.38 |
| Financial stability | 3/0/5 | 0.38 |
| Databases | 3/1/5 | 0.39 |
| Derivatives | 7/0/11 | 0.39 |

Best covered:

| Ladder | Coverage |
|---|---|
| Statistics | 0.94 |
| Information theory* | 0.94 |
| Computer vision | 0.94 |
| Epidemic modelling | 0.90 |
| Codecs | 0.89 |
| Brain-computer interfaces | 0.75 |

## Missing shared rungs and how many ladders each blocks

The ladder counts include implicit prerequisites that I did not list on every ladder in `deep.txt`. The strict counts from the data are in `results.json` → `deep.blockingRank`. The highest strict counts are:

| Rung | Status | Ladders blocked |
|---|---|---|
| Policy rate | shallow | 5 |
| Cache | shallow | 4 |
| Inflation expectations | missing | 4 |
| Learning curve | missing | 3 |
| Randomised controlled trial | shallow | 3 |
| Leverage | missing | 3 |
| Tariff | missing | 3 |
| Comparative advantage | shallow | 3 |
| Total factor productivity | missing | 3 |
| Government debt | missing | 3 |
| Marginal cost | shallow | 3 |
| Price elasticity | missing | 3 |
| Energy levels | missing | 3 |
| Gibbs free energy | missing | 3 |
| Half-life (radioactive) | shallow | 3 |

Grouped into buildable units:

| Missing cluster | Ladders blocked | Covered by a commissioned essay? |
|---|---|---|
| Energy levels → band gap → semiconductor → pn → diode/LED → MOSFET | chips, pv, displays, memory, accelerators, ev, solar (7) | Yes, the semiconductors essay. Make sure its chapters are registered as concepts others can link to. |
| Macro measurement: GDP, price index/CPI, core inflation, unemployment, aggregate demand, recession | macro, inflation measurement, deflation, growth, labour, debt (6) | No |
| Thermodynamic driving force: 2nd law, Boltzmann factor, Gibbs ΔG, heat conduction | battery*, hydrogen, thermal, protein, materials, climate (6) | Partly. The battery essay will touch ΔG = −nFE. |
| Computer architecture: memory hierarchy, DRAM/HBM, parallel/SIMD/GPU, roofline | accelerators, memory, LLM inference, databases, cloud (5) | No |
| Market power / industrial organisation: elasticity, marginal cost, monopoly, oligopoly, network effects, two-sided markets, price discrimination | platforms, AI economics, energy markets, trade, carbon (5) | No |
| Finance core: leverage, futures, options, random walk/Brownian, Black–Scholes, implied volatility, swaps | derivatives, energy markets, financial stability, bonds, housing (5) | No |
| EM waves, spectrum, antennas | wireless, space, imaging, climate, displays (5) | No (sky colour and CO₂ will each need it) |
| Chemical bonding and intermolecular forces: orbitals, bond types, H-bond, crystals, polymers | protein, materials, battery, pv, drugs (5) | No |
| Reinforcement learning: MDP, value iteration, Q-learning, policy gradient | agents, robotics, LLM (RLHF), autonomy (4) | No |
| Public debt: deficit, r − g, fiscal multiplier | debt, deflation, pensions, macro (4) | No |
| Yield curve, term premium, credit spreads | bonds, financial stability, housing, monetary (4) | Adjacent to the central-bank essay; keep to the market side |
| Molecular biology tools: protein structure/folding, PCR, sequencing, CRISPR | protein, gene editing, drugs, mRNA (4) | Partly. Vaccines covers immunity. |
| Optimisation: convex, Lagrange, LP, SGD | operations research, LLM, mechanism/portfolio (3+) | No |
| SVD / PCA / low rank | search/recsys, codecs, embeddings, LoRA (4) | No |
| Information economics: asymmetric information, adverse selection, moral hazard | financial stability, insurance/risk, credit, platforms (4) | No |
| Concurrency/OS and databases: threads, locks, B-tree, transactions | cloud, databases, software (3) | No |
| Growth: Solow, TFP, ideas, Wright's law | growth, AI economics, pv cost, labour (4) | No |
| Nuclear: binding energy, E = mc², fission, chain reaction, moderation | nuclear, imaging (PET), dating (3) | Fusion only |

## Entry-level gaps in categories that already exist

A visitor's first question finds only advanced material in these places:

- **computing/ml**: all university level. There is no "what is machine learning / a neural network" page. "Neural network" lands on CNN kernels (a false hit).
- **physics/modern**: "量子力学" and "quantum mechanics" return nothing, and quantum-basics is university level.
- **computing/algorithms**: "what is an algorithm" lands on the Big-O step.
- **signal and probability/stochastic**: all university level.
- **psychology**: there is no everyday behaviour or bias page.
- **language**: phonology only.
- **economics**: one essay plus scarcity-moves, which is not indexed.

---

# Part 2. The 30 pages or essays to build next

Ranking: shared missing rungs first, then frontier essays. Excluded: everything commissioned today. ▲ = long essay; ● = single-concept page.

1. ▲ **怎么给一个经济体量体温 / How an Economy Is Measured.** economics/macro. Questions: GDP; recession; CPI; core inflation; "why does inflation feel higher"; unemployment rate; soft landing; stagflation; deflation. Models: circular flow; a CPI basket with substitution bias; unemployment as stocks and flows; an output-gap dial. Risk: low.
2. ▲ **为什么平台赢家通吃 / Why Platforms Win.** economics/markets. Questions: monopoly; antitrust; personalised pricing (大数据杀熟); network effects; platform commission fees; how AI companies make money. Models: monopoly MR = MC; Cournot duopoly; a network-effects tipping curve; two-sided pricing. Risk: contested policy.
3. ▲ **芯片为什么总在等内存 / Why Compute Waits for Memory.** computing/systems. Questions: why GPUs are used for AI; memory wall; TPU; HBM shortage; why LLM inference is expensive; what "compute" is. Models: a cache-hit simulator; a roofline with an arithmetic-intensity slider; SIMD lanes; a systolic array. Risk: vendor numbers age fast.
4. ● **电磁波与频谱 / Electromagnetic Waves and the Spectrum.** physics/electromagnetism. Questions: what is 5G; WiFi; microwave oven; X-rays; why signals weaken through walls; what light is. Model: a radiating dipole plus a frequency slider that shows absorption and penetration in air, walls and water. Risk: low.
5. ● **反应往哪边走：熵与吉布斯自由能 / Which Way Reactions Go (ΔG).** chemistry/reactions. Questions: why batteries have a voltage; electrolysis cost; why proteins fold; heat pumps above 100%. Models: a Boltzmann two-level system; a ΔH–TΔS sign map; ΔG = −nFE. Risk: low.
6. ● **化学键与分子间作用力 / Bonds and the Forces Between Molecules.** chemistry/matter. Questions: chemical bond; hydrogen bond; why ice floats; why salt dissolves; why plastic lasts; graphene. Model: a draggable Lennard-Jones/Morse potential with an electronegativity-difference slider. Risk: low.
7. ▲ **期权和期货是怎么定价的 / Pricing Risk: Futures, Options, Volatility.** investment/derivatives. Questions: how options are priced; VIX; futures vs options; hedging; leverage. Models: a random walk; a binomial tree converging to Black–Scholes; an implied-vol smile; a margin call. Risk: high. It is money adjacent, so it must not read as advice.
8. ▲ **国家会破产吗 / Can a Country Go Bankrupt?** economics/public-finance. Questions: national debt; budget deficit; is US debt a problem; pensions running out; the retirement age. Models: debt/GDP dynamics d′ = d(1 + r)/(1 + g) − pb; a pension pay-as-you-go ratio; a fiscal multiplier. Risk: politically contested, so present the model only.
9. ● **强化学习 / Reinforcement Learning.** computing/ml. Questions: how robots learn; RLHF; AI agents; game-playing AI. Models: value iteration and Q-learning on a gridworld; a policy-gradient toy. Risk: low.
10. ▲ **收益率曲线和信用利差 / The Yield Curve and Credit Spreads.** investment/rates. Questions: inverted yield curve; why Treasury yields rise; junk bonds; term premium. Models: a term structure built from expected rates plus a premium; duration; a default-probability spread. Risk: money adjacent; avoid overlapping the central-bank essay.
11. ▲ **关税到底谁付 / Who Pays a Tariff.** economics/trade. Questions: who pays tariffs; is a trade deficit bad; comparative advantage; why globalisation is retreating; export controls; rare earths. Models: tariff incidence by elasticities; S − I = CA; a Ricardian two-good trade model. Risk: politically contested.
12. ▲ **为什么有的国家富 / Why Some Countries Got Rich, and Will AI Raise Productivity?** economics/growth. Questions: productivity; why China's growth is slowing; AI and productivity; why solar got cheap. Models: a Solow simulator; TFP accounting; a Wright's-law log-log plot. Risk: forecasts are contested.
13. ▲ **核裂变：反应堆怎么不爆 / Fission: How a Reactor Stays Critical.** physics/nuclear. Questions: how a nuclear plant works; SMRs; nuclear waste; is nuclear safe. Models: the binding-energy curve; neutron multiplication k with delayed neutrons; a decay-heat curve. Risk: safety framing needs care.
14. ▲ **信息不对称：柠檬市场与保险 / Lemons and Insurance.** economics/markets. Questions: why insurers exist; adverse selection; moral hazard; credit scores; why banks fail. Models: Akerlof unravelling; an insurance death spiral; screening by deductible. Risk: low.
15. ▲ **光伏：一个光子能换多少电 / Solar Cells.** tech/energy. Questions: solar efficiency limit; perovskite; why solar got cheap; what happens at night. Models: Shockley–Queisser versus band gap against the solar spectrum; an I–V curve with the maximum-power point; a tandem stack. Depends on the semiconductors essay; reuse its pn chapter.
16. ▲ **机器人怎么知道自己在哪、该往哪走 / How a Robot Knows Where It Is and Where to Go.** computing/robotics. Questions: humanoid balance; self-driving perception and planning; lidar; levels of autonomy. Models: a particle filter or SLAM toy; A*; MPC on a cart (Kalman and inverted pendulum already exist). Risk: low.
17. ▲ **大模型怎么训练、为什么推理贵 / Training and Serving an LLM.** computing/ml. Questions: scaling laws; fine-tuning; context window; KV cache; mixture of experts; open weights; hallucination. Models: a scaling-law fit; a KV-cache memory calculator; quantisation error; MoE routing. Risk: a fast-moving field, so date every number. This is the sequel to "how a chatbot writes".
18. ▲ **区块链与共识 / Blockchains and Consensus.** computing/systems. Questions: what Bitcoin mining computes; proof of stake; why a chain can't be changed; Ethereum; stablecoins. Models: a hash chain with tamper propagation; a Merkle proof; PoW difficulty; a BFT quorum; a stablecoin peg run. Risk: money adjacent. Coordinate signatures with the PKC essay.
19. ▲ **蛋白质为什么折成那样 / Why Proteins Fold, and What AlphaFold Did.** biology/molecules. Questions: protein synthesis; why proteins fold; AlphaFold; AI protein design. Models: an HP-lattice folding toy; an energy landscape; a contact map. Risk: AlphaFold claims need sourcing.
20. ▲ **读写DNA：PCR、测序、CRISPR / Reading and Editing DNA.** biology/cells. Questions: what CRISPR is; gene therapy; sickle-cell therapy; why sequencing got cheap; gene-edited babies. Models: PCR doubling; read assembly; guide matching with off-target scoring. Risk: health and ethics.
21. ● **最优化：约束下的最好 / Optimisation Under Constraints.** math/calculus. Questions: linear programming; delivery routing; supply chains; SGD. Models: an LP feasible polygon; Lagrange tangency; SGD noise. Risk: low.
22. ● **奇异值分解与低秩 / SVD and Low Rank.** math/linear-algebra. Questions: recommendations; image compression; PCA; embeddings. Model: rank-k image reconstruction. Risk: low.
23. ● **随机游走与布朗运动 / Random Walks and Brownian Motion.** probability/stochastic. Questions: diffusion; stock prices; the base of diffusion models. Models: a walk ensemble; √t spread. Risk: low.
24. ● **线程、锁与竞态 / Threads, Locks and Races.** computing/systems. Questions: operating systems; how big sites stay up; Kubernetes context. Models: an interleaving race visualiser; a deadlock graph. Risk: low.
25. ● **数据库为什么查得快 / Why Databases Are Fast.** computing/systems. Questions: database index; ACID; SQL vs NoSQL. Models: B-tree insert and split; a write-ahead log replay. Risk: low.
26. ▲ **推荐系统怎么知道你喜欢什么 / How Recommenders Learn You.** computing/ml. Questions: TikTok's algorithm; filter bubbles; ad auctions; RAG and vector search. Models: matrix factorisation; nearest-neighbour retrieval; a feedback-loop drift. Risk: low.
27. ▲ **电价与能源市场 / How Electricity and Oil Are Priced.** economics/energy. Questions: how electricity prices are set; negative prices; virtual power plants; why oil swings; OPEC; LCOE. Models: a merit-order stack with marginal price; storage arbitrage; inelastic oil supply and demand. Risk: data heavy. Pair it with the physical grid essay.
28. ● **电动机与逆变器 / Motors and Inverters.** physics/electromagnetism. Questions: how EV motors work; regenerative braking; EV range and charging. Models: a rotating field from three-phase currents; torque–speed; a regen energy ledger. Risk: low.
29. ▲ **火箭方程与低轨星座 / The Rocket Equation and Low-Orbit Constellations.** earth/astronomy. Questions: reusable rockets; Starlink; why launch is getting cheaper; how long it takes to get to Mars. Models: Tsiolkovsky with staging; a Δv map; constellation coverage and latency. Risk: low.
30. ▲ **AI与工作 / Automation and Jobs.** economics/labour. Questions: will AI take jobs; why wages grow slowly; the low-hire, low-fire market. Models: a task-based displacement and reinstatement model; Baumol cost disease. Risk: contested forecasts. Extend and register scarcity-moves rather than duplicate it.

Single pages people would ask for, in case there is room: ● 化学平衡外的电极/燃料电池与绿氢 (hydrogen); ● 显示与 OLED (LED depends on the semiconductors essay).

## Existing pages that need an alias or a "start here" section (15)

1. **demos/scarcity-moves.** It has no REGISTRY.json, so none of its ten ideas are searchable. Add concepts: opportunity cost/机会成本, the margin/边际, comparative advantage/比较优势, incentives, market failure, growth from ideas, "your spending is someone's income" (recession), income to the scarce, AI and wages.
2. **expected-value.** Add 期望值 and 数学期望. "期望值" currently finds nothing.
3. **central-limit-theorem.** The "Normal distributions & CLT" concept is anchored on the σ/√n step. Re-anchor "正态分布 / normal distribution / bell curve" to binomial-normal or to the step that draws the bell.
4. **trigonometry.** Add "sine and cosine" (the "&" vs "and" mismatch makes it score 15) and 正弦/余弦.
5. **exponents-logarithms.** Add 指数函数, "exponential function" and "number e". Add a short start-here on e.
6. **circle-intro.** Add 圆周率, pi and "why is pi 3.14".
7. **complex-numbers.** Add 虚数, "imaginary number" and "what is i".
8. **regression-correlation.** Add "linear regression", 线性回归 and 相关不等于因果.
9. **sampling.** Add 采样定理, "sampling theorem" and Nyquist.
10. **quantum-basics / quantum-tunneling.**
    - Add 量子力学, "quantum mechanics", 叠加态 and 波粒二象性.
    - Add the spelling "tunneling" (en "quantum tunneling" finds nothing).
    - Add a start-here section for "what is quantum mechanics".
11. **food-web.** Add 食物链 and "food chain".
12. **water-cycle.** Add 水循环 (the title is 水的循环), 为什么会下雨 and "how does rain form".
13. **electrochemistry.**
    - Add 氧化还原 (it now scores 20).
    - Add redox, 电池原理, "how do batteries work" and 电极电势.
14. **dna-replication.** Add 蛋白质合成, "protein synthesis", 中心法则, "central dogma", mRNA and 核糖体.
15. **hashing / newton-laws / public-health.**
    - Add 哈希表, "hash function" and "hash table".
    - Add 牛顿定律 and 牛顿三大定律.
    - Add "SIR model" and 传染病怎么传播.

Runners-up for the same treatment:

- **inside-a-phone**: add "data compression" and "channel capacity".
- **thermodynamics**: add 热力学第二定律 and "second law".
- **robot-kinematics**: add the zh 机器人运动学.
- **ode-phase-portraits**: add en "differential equation".
- **genetics-probability**: add 孟德尔 and 豌豆.

---

# Part 3. Everyday track (the shorter section)

## Shares

All 401 everyday questions, counts and frequency-weighted shares:

| Area | n | a / b / c (count) | Weighted a / b / c |
|---|---|---|---|
| ALL | 401 | 146 / 22 / 233 | 39% / 5% / 55% |
| Mathematics | 32 | 20 / 2 / 10 | 65 / 8 / 27 |
| Physics | 37 | 23 / 2 / 12 | 61 / 6 / 34 |
| Computing | 31 | 17 / 1 / 13 | 56 / 3 / 40 |
| Chemistry | 28 | 15 / 4 / 9 | 55 / 12 / 33 |
| Money & economics | 33 | 15 / 0 / 18 | 50 / 0 / 50 |
| Biology | 33 | 13 / 0 / 20 | 40 / 0 / 60 |
| Earth & space | 37 | 12 / 3 / 22 | 38 / 8 / 54 |
| Health & body | 36 | 12 / 1 / 23 | 36 / 3 / 62 |
| Society/law/civics | 26 | 7 / 2 / 17 | 28 / 7 / 65 |
| Everyday technology | 32 | 5 / 2 / 25 | 18 / 6 / 76 |
| Language/music/art | 23 | 3 / 1 / 19 | 17 / 6 / 77 |
| Psychology | 27 | 3 / 3 / 21 | 12 / 12 / 77 |
| History & geography | 26 | 1 / 1 / 24 | 5 / 3 / 92 |

- Without the 13 pending topics: 388 questions, a 140 / b 21 / c 227.
- (a) usually depends on the right phrasing. Of the 146 (a) cases, only 119 are reached by the zh or en question as typed (zh question 79, en question 104). The rest are found only by the keyword form.

**Thinnest everyday areas**, by weighted (c): history & geography 92%; language/music/art 77%; psychology 77%; everyday technology 76%; society 65%; health 62%.

Within everyday technology, all of these return nothing:

- Kitchen and home: fridge, AC, heat pump, microwave, induction hob, washing machine
- Wireless and devices: WiFi, Bluetooth, 5G, QR codes, wireless charging, noise cancelling
- Vehicles and machines: engines, gearboxes, brakes, helicopters, bicycles, elevators
- Medical and optical: X-ray, MRI, lasers

The everyday mechanisms most worth a model, outside the deep list:

- Heat engines / fridge / heat pump (one essay)
- How planes fly (lift)
- Weather and hurricanes
- The immune system
- Energy balance and weight loss (health risk)
- Cognitive biases / behavioural economics (anchoring, loss aversion, sunk cost)
- Malthus and the industrial revolution as a growth model
- Map projections
- Tides and eclipses

## False-hit rate of (a)

I sampled 62 (a) landings across 13 areas and read the landing copy (`sample_out.txt`). **10 of 62 (16%) do not really answer the question at the asker's level:**

| Question | Where it lands | What is wrong |
|---|---|---|
| "how to calculate probability" | probability-distribution | Explains distributions and expectation, not how to calculate a probability |
| "normal distribution" | CLT σ/√n step | Wrong anchor |
| "how to read the periodic table" | periodic-trends | Trends of properties, not how to read the table |
| "acids and bases" | weak-acid Ka | Too advanced |
| "what causes earthquakes" | seismic-waves | About P/S waves, not the cause |
| "neural network" | CNN kernels | Not an intro to neural networks |
| "what is an algorithm" | Big-O step | Does not say what an algorithm is |
| "how do cell phones work" | handover chapter | Covers one detail only |
| "how does the heart work" | cardiac-output chapter | Not how the heart pumps |
| "where do scales come from" | chords/cadence step | Wrong step; the intervals step is the right one |

Six of the ten are the right page reached at the wrong step or level. Trust (a) at about 84%.

## Search defects (separate from content gaps)

**157 defects:**

- **97 everyday questions** whose answer exists, but at least one natural variant (zh question, en question, zh keyword or en keyword) misses it in the top 3. 13 of these are missed by every variant.
- **60 deep rungs** that are present on the site but not reached by their own term in zh and/or en.

Per-item detail is in `results.json`: `everyday[].searchDefect`, `everyday[].missedVariants`, and `deep.rungs[].searchDefect` with their top 3.

**Causes, most common first:**

1. **Leftover predicate words after `unquestion()`.** 83 variant misses where the keyword form hits but the question form does not (zh 51, en 32). Examples:

   | Typed | After `unquestion()` |
   |---|---|
   | 导数是什么意思 | 导数 意思 |
   | 四季是怎么形成的 | 四季 形成 |
   | 催化剂是怎么起作用的 | 催化剂 起作用 |
   | 利率上升有什么影响 | 利率上升有 影响 |
   | 质数有什么用 | 质数有 用 |
   | 电池是怎么工作的 | 电池 工作 |
   | what causes earthquakes | causes earthquakes |
   | how are genes inherited | genes inherited |
   | why do we get a fever | we get fever |
   | how to calculate probability | to calculate probability |
   | how long do drugs stay in your body | long drugs stay in body |

   Fix:
   - Strip generic predicates: 意思 / 形成 / 工作 / 起作用 / 发生 / 运作 / 影响 / 区别 / 用 / 算 / 有 and 原理.
   - Strip en causes / cause / affect / used for / made of / to / we / get / have / long.
   - Or fall back to "rank by the longest matching content word" when the all-words rule returns nothing.

2. **Missing everyday or textbook aliases.** 42 keyword-form misses. Examples, each with the page that should win:

   | Query | Should land on |
   |---|---|
   | 圆周率, pi | circle-intro |
   | 虚数 | complex-numbers |
   | 标准差 | central-limit-theorem / probability-distribution |
   | 牛顿定律 | newton-laws |
   | 重力 | gravity-orbits |
   | 量子力学 | quantum-basics |
   | 食物链 | food-web |
   | 水循环, rain | water-cycle |
   | 蛋白质合成 | dna-replication |
   | 期望值 | expected-value |
   | 搜索引擎 | pagerank |
   | 机会成本, 比较优势 | scarcity-moves |
   | 经纬度 | latitude-longitude |
   | 单摆, pendulum | the oscillation atlas node |
   | linear regression | regression-correlation |
   | sampling theorem | sampling |
   | hash function | hashing |
   | public key cryptography | rsa-encryption |
   | quantum tunneling | quantum-tunneling |
   | externality (singular) | externalities |

   A structural cause sits behind this: most pages' `tags` are category names ("Biology", "Earth & Space") rather than aliases, so pages without atlas concepts are findable only by their exact title. Fix: aliases in `atlas/graph/aliases.json`, real tags in `pages.config.js`, and a REGISTRY for scarcity-moves.

3. **Two-concept and comparison queries return nothing.** Examples: "mean vs median", "molecule vs atom", "permutations vs combinations", 平均数和中位数有什么区别, "开普勒定律 行星轨道", "attention mechanism transformer", "correlation vs causation". Every word must match one record, and "vs" / 和 / 区别 are not treated as connectors. Fix: split on vs / 和 / 与 / 区别 and union the results.

Further causes:

4. **Wrong anchor or ranking.**
   - 积分 ranks the PID controller and the accelerometer chapter above the integral page.
   - 能量守恒 puts power-converters first.
   - 地震 puts seismic-waves above plate-tectonics.
   - 正态分布 lands on the σ/√n step.
   - 音阶 lands on the chords step.

   Fix: put a page title match above a concept-alias contains match (a ranking rule), and re-anchor the concepts.
5. **Noise on short tokens.** 39 everyday questions with no answer still show results. "pi" → pinhole/PID; "rag" → average; "leverage" → lever page; "why is mars red" → Markov; "how do bubbles form" → bubble sort. Fix: require a word boundary for tokens of 3 characters or fewer.
6. **Unindexed content.** The whole scarcity-moves essay; the power-converters concepts have no anchors.
