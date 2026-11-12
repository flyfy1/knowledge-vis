# Deep-track queue 2 (2026-11-11): topic specs

Each builder gets ONE section of this file. Brief: read `/tmp/agent-tasks/essays/BRIEF-DEEP.md` first (it sends you
to `/tmp/agent-tasks/essays/BRIEF-BATCH3.md`: what to read, file layout, lessons learned, hard rules — work only in
your directory, no commits, no delete commands). The gap audit at `/tmp/agent-tasks/gap-audit/notes.md` lists the
prerequisite ladders and the rungs each essay must supply; read the ladders that cite your topic.
Scratch: `/tmp/agent-tasks/essays/<slug>/`. Check `pages.config.js` for existing pages on your rungs: link them, and
narrow a chapter (saying so in your report) where a rung is already covered at this depth. Essays named "by title"
below are being built by other agents: mention them, never edit them.

---

## 1. how-an-economy-is-measured — port 19001
**How do we know how an economy is doing?** (一个经济体"好不好"，到底是怎么量出来的)
Directory: `economics/<best existing subtopic or new "macro">/how-an-economy-is-measured/` (propose zh/en names if new).
Present each statistic as a construction with choices; name critiques with sources; no forecasts, no advice.
Ladder: GDP three ways on a tiny economy the reader runs (value added avoids double counting; what is not counted)
→ nominal vs real: price indexes as a choice (Laspeyres, Paasche, Fisher, chained, computed on a small basket;
substitution bias; deflator vs CPI) → CPI in practice (weights, owners' equivalent rent, quality adjustment, core
vs headline; the reader re-weights the basket; Boskin-type bias estimates and later reassessments) → growth-rate
traps (annualised q/q vs y/y, base effects, seasonal adjustment on a synthetic series, revisions with a real
vintage history) → comparing countries (market rates vs PPP, Balassa–Samuelson; per-capita vs median; Lorenz and
Gini computed) → labour market (unemployment definitions U-3…U-6, participation, Beveridge curve, Okun's law fitted
on shipped data with instability noted) → the cycle (potential output and the output gap as revised estimates;
who dates recessions; the Sahm rule computed) → productivity (growth accounting: the reader does the Solow
decomposition on shipped data; TFP as residual) → what GDP leaves out (without advocacy) → frontier: digital/free
goods and AI in national accounts, the 2025 SNA, survey response decline, nowcasting, alternative-data price
indexes, latest figures for the largest economies as dated data points (statistical agencies, IMF, OECD, BIS).
Figures of merit: real growth, inflation (which index), unemployment/participation, productivity growth, typical
revision sizes. Shipped data small, public, sourced with URL and retrieval date, checked by the node test.
By title: `economics/money/why-one-rate-moves-everything/`. Read `where-money-comes-from`, `scarcity-moves`, `numbers-lie`.

## 2. why-compute-waits-for-memory — port 19003
**Why does an AI chip spend most of its time waiting?** (AI 芯片为什么大部分时间都在等)
Directory: `computing/systems/why-compute-waits-for-memory/`.
Models are real small simulators. Ladder: fetch–execute and a 5-stage pipeline the reader steps (link
`switches-that-compute`) → memory is far away (sourced latency by level, scaled to human time; a cache simulator —
size, block, associativity — fed a real trace of row-wise vs column-wise matrix walks, plus the measured-in-page
ratio of the two loops on typed arrays) → locality (blocked matrix multiply in the simulator; same big-O, 10×
apart) → the memory wall (bandwidth, not capacity) → more cores (Amdahl and Gustafson; end of Dennard scaling —
chips essay `tech/semiconductors/why-chips-are-hard/` by title) → SIMD and GPUs (throughput over latency; why
neural networks are dense linear algebra: operations and memory traffic for a real layer) → the roofline model
(min(peak FLOP/s, bandwidth × arithmetic intensity); the reader places dot product, stencil, matmul, transformer
inference at batch 1, large-batch training on a CPU and a current accelerator from sourced specs) → why LLM
inference is memory-bound (tokens/s ≈ bandwidth ÷ model bytes, computed for sourced hardware; quantisation,
batching, KV cache) → HBM, packaging, chip-to-chip and rack-scale interconnect; clusters and communication limits →
energy (joules per operation and per bit moved; data-centre power, sourced) → frontier: current accelerators'
compute, bandwidth, capacity; HBM generations; CXL, co-packaged optics; in-memory/neuromorphic claims vs
demonstrations; performance per watt; MLPerf — dated, vendor figures labelled.
Figures of merit: FLOP/s, GB/s, arithmetic intensity, latency, perf/W, tokens/s per dollar.
Browser timing is coarse: show ratios with medians over repeats; never pin absolute times in tests.

## 3. what-travels-through-empty-space — port 19004
**What is actually travelling when a signal crosses empty space?** (信号穿过真空的时候，到底是什么在传)
Directory: `physics/<subtopic holding electromagnetism/waves>/what-travels-through-empty-space/`.
This is the shared rung the other deep essays link to. Ladder: fields (link existing electrostatics/magnetism) →
Faraday and the displacement current; Maxwell's equations in integral form, each term in words → the wave falls
out: derive the 1-D wave equation; a 1-D FDTD (Yee) simulation where E and B leapfrog; speed 1/√(μ₀ε₀); v = c/n;
reflection/transmission at an interface matched to Fresnel at normal incidence → radiation from accelerating
charge (Larmor, dipole pattern sin²θ, the λ/2 dipole; sky essay's Rayleigh scattering by title) → what a wave
carries (Poynting vector, inverse-square law, radiation pressure of sunlight; polarisation and Malus's law incl.
three polarisers) → one spectrum (radio→gamma on a log axis with λ, f, E = hf; what matter does at each scale;
microwave oven at 2.45 GHz with the "water resonance" myth corrected; infrared and greenhouse gases — climate
essay by title; ionisation threshold; phone radiation stated exactly as agencies conclude, with limits sourced) →
atmospheric windows from a sourced transmission dataset → carrying information (AM/FM/QAM on a carrier; bandwidth;
Friis link budget for Wi-Fi, phone–tower, GPS, Voyager; information-theory essay by title) → guiding and shaping
(fibre: total internal reflection, dB/km vs wavelength, why 1550 nm; diffraction limit 1.22 λ/D for dishes,
telescopes, lithography — chips essay by title; phased-array beam steering simulated) → frontier: 5G/6G bands and
sub-THz, Wi-Fi 7, direct-to-cell and LEO, fibre and free-space optical records, the THz gap, metasurfaces, EUV and
X-ray sources — dated and sourced.
Validate FDTD in the node test (speed, energy conservation, Fresnel, Courant stability).

## 4. which-way-reactions-go — port 19005
**What decides whether a reaction goes — and how far?** (一个反应会不会发生、能走多远，是谁说了算)
Directory: `chemistry/<subtopic holding thermodynamics/equilibrium>/which-way-reactions-go/`.
Ladder: energy alone does not decide (endothermic processes that go) → counting ways (enumerable two-state/lattice
system; S = k ln W; mixing; link existing entropy pages) → the Boltzmann factor derived by counting the bath's
states; populations vs T (reappears in chips, rates, batteries — by title) → ΔG = ΔH − TΔS as total entropy in
disguise; the four-quadrant map with real reactions from tabulated data → how far: G vs extent of reaction has a
minimum from mixing entropy, plotted for a real gas equilibrium; ΔG = ΔG° + RT ln Q; K = e^(−ΔG°/RT); Le Chatelier
as consequence; van 't Hoff → how fast is separate (Arrhenius, transition state; a catalyst speeds A ⇌ B to the
same K, simulated) → coupling (ATP with sourced cellular ΔG; ΔG = −nFE, batteries essay by title; an Ellingham
diagram from tabulated data: carbon smelts iron, aluminium needs electrolysis) → Haber–Bosch (yield vs T, p from
thermodynamic data against rate; the reader runs the plant; sourced conditions, energy use, world share) → phase
behaviour (regular-solution free energy, common tangent, miscibility gap) → frontier: green ammonia and
electrochemical N₂ reduction, electrolyser efficiency vs the thermodynamic minimum, direct air capture's minimum
work vs real plants, CO₂ electroreduction, computational catalyst discovery — dated, claims labelled.
Data from NIST WebBook/JANAF/CRC recorded in BRIEF.md and checked in the node test.

## 5. why-atoms-stick-together — port 19006
**Why do atoms stick together — and why does that decide what everything is like?** (原子为什么会粘在一起，这又怎么决定了一切东西的性质)
Directory: `chemistry/<subtopic holding bonding/structure>/why-atoms-stick-together/`.
Ladder: confinement costs kinetic energy (particle in a box; spreading over two nuclei lowers energy) → H₂⁺ by
LCAO with the standard integrals: a real potential curve, compared with experiment → filling orbitals (H₂, no He₂,
bond order; a Hückel model the reader builds — ethene, butadiene, benzene — eigenvalues solved in the page;
delocalisation energy; HOMO–LUMO gap and colour; link eigenvalue pages) → unequal sharing (electronegativity; a
two-site model from covalent to ionic; Madelung sum converging for a 1-D chain and NaCl; Born–Haber cycle from
tabulated data) → molecule to solid (tight-binding chain: N levels become a band; metal vs gap; two-atom basis
opens a gap — the rung under the chips and photovoltaics essays, by title) → shape (electron-pair repulsion as a
rule of thumb with limits; hybridisation as bookkeeping) → weak forces (dipole, hydrogen bond, dispersion in kJ/mol
against kT; Lennard-Jones and a small 2-D velocity-Verlet MD that melts and boils; boiling points from tabulated
data; ice floats; hydrophobic effect as entropy — thermodynamics essay by title) → structure decides properties
(diamond/graphite/graphene; metals vs ceramics; polymers) → proteins (forces, Levinthal's paradox, an HP lattice
model the reader folds) → frontier: cost scaling and reach of HF/DFT/coupled cluster and DFT's failures,
machine-learned interatomic potentials, AlphaFold-class prediction and limits, generative materials discovery
(claimed vs synthesised and verified, incl. published criticism), 2-D materials, high-entropy alloys — dated.
Validate: H₂⁺ LCAO textbook values, benzene Hückel energies, Madelung 1.7476, LJ minimum, MD energy drift.

## 6. a-fair-price-for-a-bet — port 19007
**How can anyone put a fair price on a bet about the future?** (对未来的一个赌注，怎么可能有"公道价")
Directory: `<investment/finance category>/<subtopic>/a-fair-price-for-a-bet/` (propose zh/en subtopic names if new).
Explains mathematics and market structure only: no trading advice, no profitable-strategy claims, state the sourced
evidence on retail option outcomes, present every model with its failures, no forecasts.
Ladder: a forward is not a forecast (cash-and-carry F = S·e^{(r−q)T}; the reader misprices it and sees the
arbitrage) → options (payoff diagrams composed; put–call parity by two portfolios) → the one-step binomial trick
(replication; price independent of the real-world probability, which the reader changes; risk-neutral probability
as accounting) → CRR tree, backward induction, American exercise, convergence → geometric Brownian motion (√T;
link random-walk, normal, CLT pages) → Black–Scholes as the limit; the PDE solved by finite differences and
matched (kinship with the heat equation) → the Greeks; a delta-hedging simulation: hedged P&L spread shrinks with
frequency and its mean matches the premium only if realised volatility equals priced volatility — an option is a
bet on volatility → where it breaks (implied volatility smile from a shipped, sourced snapshot; fat tails vs
sourced index returns and October 1987; clustering; LTCM and 2008, sourced) → beyond (Heston simulated producing a
skew; Monte Carlo; counterparty risk, margin, clearing) → uses and harms (hedging for an airline and a farmer;
leverage; notional vs market value from BIS) → frontier: BIS OTC statistics, exchange volumes, zero-day options and
the volatility debate, retail outcomes evidence, crypto perpetuals' funding, clearing reforms, LIBOR→SOFR, deep
hedging research — dated and sourced.
Validate: parity, tree→BS, PDE vs formula, Greeks vs numerical derivatives, hedging mean with seeded runs (raise
trials, never widen tolerances). By title: `why-one-rate-moves-everything`, `where-a-mortgage-payment-goes`.

## 7. what-a-frontier-model-takes — port 19008
**What does it take to build and run a frontier language model?** (造出并运行一个最前沿的大语言模型，到底需要什么)
Directory: same category/subtopic as the site's machine-learning pages: `<…>/what-a-frontier-model-takes/`.
Sequel to the introductory `how-a-chatbot-writes` (being built; read what exists, start where it stops, by title).
Implement a real tiny transformer in `models.js` (embeddings, multi-head causal self-attention, MLP, residuals,
layer norm, unembedding) with weights trained by a script in the directory on a small task whose attention is
interpretable (character text, or modular addition/sorting), shipped as data (< 300 KB, lazy-loaded); the node test
checks the forward pass against the script's outputs.
Ladder: the block exactly (step a token through; tensor shapes; QKV arithmetic; why residuals and normalisation;
positional schemes) → counting parameters and FLOPs per token (the reader sizes a model against published
configurations) → training (cross-entropy, backprop link, AdamW, schedule; recorded loss curve; heads forming;
perplexity) → scaling laws (Kaplan 2020, Hoffmann 2022 fitted forms: allocate a compute budget; what the fits do
not cover) → the training bill (6·N·D FLOPs → accelerator-hours, energy, cost from sourced throughput and prices;
corpus sizes) → after pretraining (instruction tuning, RLHF and successors in outline; LoRA savings computed;
evaluation and benchmark saturation/leakage) → the inference bill (prefill vs decode; implement the KV cache and
show quadratic → linear with its memory cost; bandwidth bound — `why-compute-waits-for-memory` by title; batching;
quantise the tiny model to 8 and 4 bits and measure; long context cost; cost per million tokens from first
principles vs published prices) → cheaper and better (mixture-of-experts routing toy; distillation; retrieval;
speculative decoding; reasoning tokens and their cost) → inside (ablate a head/circuit in the tiny model;
superposition and sparse autoencoders as research) → frontier: frontier models' disclosed or estimated scale with
uncertainty, context lengths, benchmark standings and limits, price trends, largest clusters and power, leading
open-weight models, multimodality, agents, open questions (scaling and data limits, reasoning, reliability,
alignment and safety as open, with positions), regulation in force — dated; company statements labelled as claims,
estimates as estimates; nothing on consciousness beyond describing the computation and citing the debate.
Figures of merit: parameters, training tokens and FLOPs, context length, tokens/s, cost per million tokens,
benchmark scores with caveats.

## 8+. Next after these (from the audit's ranking; specs to be written)
Public debt dynamics; reinforcement learning; yield curve and credit spreads; who pays a tariff; why countries got
rich (Solow, TFP, learning curves); fission reactors; information asymmetry (lemons, insurance); photovoltaics;
plus `/tmp/agent-tasks/gap-audit/notes.md` recommendations 16–30 and its 15 "needs an alias or start-here" pages.
