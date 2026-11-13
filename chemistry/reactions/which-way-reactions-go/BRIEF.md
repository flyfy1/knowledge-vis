# BRIEF — `which-way-reactions-go`

Built-By: Antigravity (gemini-4-hydrogen)  
Authorship note: Initial partial essay implementation (`index.html`, `copy.zh.js`, `models.js`, `app.js`, partial `tests/models.cjs`) was created by an earlier Antigravity run and audited, debugged, completed, documented, and tested in this run.  
Date: 2026-11-13  
Path: `chemistry/reactions/which-way-reactions-go/`

---

## 1. The Essay's Single Question

**What decides which way a chemical reaction goes, how far it gets before stopping, and how fast it travels — and why do thermodynamics and kinetics fight each other in real factories?**

The essay walks a reader from first principles (counting microstates in an isolated system) up through the Boltzmann factor, Gibbs free energy ($\Delta G = \Delta H - T\Delta S$), mixing entropy & interior equilibrium ($\Delta_r G = \Delta G^\circ + RT \ln Q$), activation barriers & catalysts ($k_f / k_r = K$), reaction & electrochemical coupling (ATP hydrolysis, $\Delta G = -nFE$, Ellingham smelting lines), the industrial Haber–Bosch compromise (Gillespie–Beattie equilibrium vs iron-catalyst kinetics), common-tangent phase separation, and 2026 frontier benchmarks for hydrogen electrolysis, direct air capture, ambient ammonia synthesis, and $\text{CO}_2$ electroreduction.

---

## 2. Design Decisions & Figures of Merit

- **One shared equation kernel (`models.js`)**: All 9 model chapters call exported pure functions in `models.js`; `tests/models.cjs` asserts both physical identities (sum rules, $\Delta S_{\text{total}} = -\Delta G/T$, microscopic reversibility $k_f/k_r = K$, lever-rule conservation) and verbatim numeric consistency between `models.js` outputs and prose in `copy.zh.js`.
- **Single-source copy**: All user-facing prose, canvas text, readouts, and dynamic `.say` verdicts live in `copy.zh.js` and are referenced via `t(key, vars)`. Zero CJK strings exist in `models.js` or `app.js` (`index.html` contains only `<title>`, `<meta name="description">`, and the `中` language-toggle label; `copy.en.js` is deferred to the English-pass workflow).
- **Performance & accessibility**: All `<canvas>` simulators register with a single `IntersectionObserver` loop (`window.__essayObserve`) so off-screen simulations pause completely, and `(prefers-reduced-motion: reduce)` suppresses autoplay and renders static steady/final states on first paint. All touch targets (`button`, `input[type="range"]`, `select`) enforce $\ge 48\,\text{px}$ tap areas and high-contrast dark tokens matching the repository design system.
- **No fabricated claims in Frontier (#ch9)**: Every row separates **Established** physical floors/baselines, **Demonstrated** peer-reviewed or operational facility outputs, and **Claimed / Target** nameplate capacities or techno-economic targets, all dated (`2021-10` to `2026-10`).

---

## 3. Chapter-by-Chapter Ladder

1. **`#ch1` — Counting Microstates (`S = k_B ln W`)**
   - **Law**: Isolated systems move toward states with overwhelmingly more microstates $W$, not necessarily lower internal energy.
   - **Everyday case**: Ammonium nitrate cold pack ($\text{NH}_4\text{NO}_3$ dissolution absorbs $28.06\,\text{kJ/mol}$ from standard tables / $\sim 25.7\,\text{kJ/mol}$ dilute measurement yet proceeds spontaneously); red/blue lattice mixing with zero interaction energy.
   - **Model**: `einsteinDist(NA, NB, Q)` and `binaryMixingDist(nA, nB)` compute exact multinomial/binomial counts via log-gamma; interactive random walker overlays live exchanges (`energy` and `mixing` modes, sliders `#ch1NA`, `#ch1Q`, `#ch1StepBtn`).
   - **Limit**: Einstein solid assumes equidistant vibrational levels; ideal lattice mixing assumes $\Delta H_{\text{mix}} = 0$.
2. **`#ch2` — Boltzmann Factor (`exp(-E_i / RT)`)**
   - **Law**: Borrowing energy $E_i$ from a thermal bath shrinks the bath's accessible microstates by $\exp(-E_i / RT)$.
   - **Everyday case**: Why room temperature ($RT = 2.49\,\text{kJ/mol}$ at $300\,\text{K}$) leaves $\exp(-50/2.49) \approx 2 \times 10^{-9}$ population above a $50\,\text{kJ/mol}$ bond barrier.
   - **Model**: `boltzmannVsBath(T, dE, NB)` compares exact finite-bath microstate ratios $W_{\text{bath}}(Q_{\text{bath}} - E_i)$ against the infinite-bath Boltzmann limit across 4 levels (`#ch2T`, `#ch2DE`, `#ch2NB`).
   - **Limit**: Integer $1\,\text{kJ/mol}$ Einstein bath spacing so energy quanta subtract cleanly.
3. **`#ch3` — Gibbs Free Energy Ledger (`ΔG = ΔH − TΔS`)**
   - **Law**: At constant $T, p$, $\Delta G = -T \Delta S_{\text{total}}$ folds environment entropy into the system's own state variables.
   - **Everyday case**: Cold pack dissolution ($\Delta G^\circ = -4.35\,\text{kJ/mol}$), limestone calcination ($\text{CaCO}_3 \to \text{CaO} + \text{CO}_2$, flips at $1114\,\text{K} \approx 840\,^\circ\text{C}$), ammonia synthesis (flips at $463\,\text{K} \approx 190\,^\circ\text{C}$), $\text{H}_2\text{O}_2$ (always spontaneous), $\text{O}_2 \to \text{O}_3$ (never thermally spontaneous).
   - **Model**: 7 NIST/JANAF/OpenStax reactions mapped on $\Delta S^\circ$ vs $\Delta H^\circ$ with rotating $\Delta H = T\Delta S$ line (`#ch3T`, `#ch3Rxn`).
   - **Limit**: Constant-$\Delta H^\circ, \Delta S^\circ$ (298.15 K) linear approximation without Kirchhoff $\Delta C_p(T)$ integrals.
4. **`#ch4` — Interior Minimum $G(\xi)$, $K_p$, & Van 't Hoff**
   - **Law**: Ideal mixing entropy makes $\text{d}G/\text{d}\xi \to \pm\infty$ at $\xi \to 0, 1$, creating an interior minimum at $\Delta_r G = \Delta G^\circ + RT \ln Q = 0 \implies K = \exp(-\Delta G^\circ/RT)$. Pressure shifts $Q$; temperature shifts $K$.
   - **Everyday case**: $\text{N}_2\text{O}_4 \rightleftharpoons 2\,\text{NO}_2$ ($\Delta G^\circ = +4.74\,\text{kJ/mol}$ at $298.15\,\text{K}, 1\,\text{bar}$, yet reaches $\xi_{\text{eq}} = 18.9\%$; squeezed to $8.6\%$ at $5\,\text{bar}$; jumps to $72.7\%$ at $350\,\text{K}, 1\,\text{bar}$).
   - **Model**: Exact closed-form quadratic (`n2o4`) and Brent root solver on $Q_p(\xi) = K_p(T)$ (`nh3`), plus coupled Van 't Hoff plot $\ln K_p$ vs $1000/T$ and equilibrium mole fractions (`#ch4Sys`, `#ch4T`, `#ch4P`, `#ch4Xi`).
   - **Limit**: Ideal gas fugacity coefficients $\phi_i = 1$ and constant $\Delta H^\circ$.
5. **`#ch5` — Activation Barriers & Catalyst Equilibrium Invariance**
   - **Law**: $k_f / k_r = K$ locks forward and reverse barrier shifts together: a catalyst speeds approach exponentially ($\propto \exp(\Delta E_{\text{cat}}/RT)$) without moving equilibrium $B_{\text{eq}}$ by a single percent.
   - **Everyday case**: $\text{N}_2 + 3\,\text{H}_2$ sits unreactive at $298\,\text{K}$ despite $\Delta G^\circ = -32.73\,\text{kJ/mol}$ because $E_{a,\text{N}\equiv\text{N}}$ is huge. At $320\,\text{K}, \Delta G^\circ = -4\,\text{kJ/mol}$ ($K = 4.50, B_{\text{eq}} = 81.8\%$), dropping the barrier by $15\,\text{kJ/mol}$ cuts $t_{1/2}$ from $3.37\,\text{s}$ to $0.0120\,\text{s}$ ($281\times$ faster) with identical $B_{\text{eq}}$.
   - **Model**: Exact two-state reversible ODE integrated analytically via $A(t) = A_{\text{eq}} + (1 - A_{\text{eq}})e^{-(k_f+k_r)t}$ (`#ch5Dg`, `#ch5Cat`, `#ch5T`).
   - **Tuned parameters**: Pedagogical time-compression prefactor $A_0 = 1.6 \times 10^8\,\text{s}^{-1}$ and reference barrier $E_{a,0} = 55\,\text{kJ/mol}$ so curve evolution fits a 1–10 second classroom window (explicitly noted in UI and `copy.zh.js`).
6. **`#ch6` — Reaction Coupling, ATP, $\Delta G = -nFE$, & Ellingham Diagram**
   - **Law**: Positive-$\Delta G$ steps proceed when coupled to a strongly negative reaction or electrical work ($\Delta G_{\text{total}} < 0$ or $\Delta G = -nFE$).
   - **Everyday case**: Glucose phosphorylation ($+13.8\,\text{kJ/mol}$) driven by ATP hydrolysis ($\Delta G^{\circ\prime} = -30.5\,\text{kJ/mol}$, shifted deeper at physiological $[\text{ATP}]/[\text{ADP}] \approx 10$ via log10 slider `#ch6Ratio` spanning $10^{-5}$ to $31.6$); coke smelting iron ($\text{FeO}$ crossover $1019\,\text{K} \approx 746\,^\circ\text{C}$) vs zinc ($1264\,\text{K}$) vs alumina ($\text{Al}_2\text{O}_3$ crossover $2312\,\text{K} \approx 2038\,^\circ\text{C}$, requiring Hall–Héroult molten electrolysis: $2.22\,\text{V}$ pure $\text{O}_2$ minimum / $1.19\,\text{V}$ with sacrificial carbon anode at $1240\,\text{K}$).
   - **Model**: `atpCoupling(ratio, pi_mM)` and 7-line constant-$\Delta H^\circ,\Delta S^\circ$ Ellingham diagram (`#ch6Ratio`, `#ch6Pi`, `#ch6Ox`, `#ch6T`).
   - **Limit**: Dilute biochemical activity approximation; constant-enthalpy Ellingham lines omit phase-change kinks (e.g., Zn boiling at $1180\,\text{K}$, Al melting at $933\,\text{K}$).
7. **`#ch7` — Haber–Bosch Reactor Simulator**
   - **Law**: High equilibrium yield demands low $T$; fast $\text{N}_2$ cleavage demands high $T$. Plants compromise at $400\text{–}500\,^\circ\text{C}, 150\text{–}300\,\text{bar}$ with ammonia condensation + gas recycle.
   - **Model**: `haberReactor(T_C, P_bar, tau)` combines Gillespie–Beattie (1930) empirical $\log_{10} K_a(T)$ (with real-gas temperature fit) and first-order approach $1 - \exp(-k_{\text{eff}}\tau)$ capped cleanly at $\xi_{\text{eq}}$. At default $450\,^\circ\text{C}, 200\,\text{bar}, \tau = 1\times$: $\xi_{\text{eq}} = 39.1\%, \xi_{\text{single}} = 20.7\%, y_{\text{NH}_3} = 11.6\%$, loop yield $\approx 90\%$ with $3\%$ purge.
   - **Tuned parameters**: Catalyst rate factor $k_0 = 0.28$ at $450\,^\circ\text{C}$ and apparent $E_a = 120\,\text{kJ/mol}$ calibrated so $\tau = 1$ lands inside real $10\text{–}15\%$ single-pass reactor exit ammonia mole fraction (explicitly stated in `ch7.limit`); non-ideal compressibility factor $Z$ and adiabatic bed $\Delta T$ omitted.
8. **`#ch8` — Regular Solution, Common Tangent, & Phase Separation**
   - **Law**: When repulsive enthalpy $\Omega x(1-x)$ overcomes $RT$ ($T < T_c = \Omega / 2R$, i.e., $w > 2$), common-tangent splitting onto binodal $(x_\alpha, x_\beta)$ saves free energy; inside the spinodal ($\text{d}^2 g / \text{d}x^2 < 0$), decomposition is barrierless.
   - **Everyday case**: Oil-water immiscibility, alloy unmixing, LFP battery flat voltage plateau (`../why-batteries-hold-so-little/#ch3`). Default $T/T_c = 2/3$ ($w = 3.00$) yields binodal $0.071 / 0.929$, spinodal $0.211 / 0.789$, saving $0.1152\,RT$.
   - **Model**: Exact symmetric root solver + lever rule (`#ch8Ttc`, `#ch8X0`).
   - **Limit**: Symmetric Bragg–Williams regular solution with zero excess mixing entropy.
9. **`#ch9` — Thermodynamic Floors vs 2026 Engineering Realities**
   - **Law**: Thermodynamics sets unbreakable minimum energy floors ($1.229\,\text{V}$ / $32.7\,\text{kWh/kg}$ $\text{H}_2$ $\Delta G^\circ$, $33.3\,\text{kWh/kg}$ LHV, $0.49\,\text{GJ/t}$ for $420\,\text{ppm}$ $\text{CO}_2$ separation, $1.15\,\text{V}$ $\text{C}_2\text{H}_4$ $\text{CO}_2\text{RR}$); engineering reality depends on overpotentials, Faradaic efficiency, thermal regeneration losses, and long-duration stability.
   - **Model**: Interactive floor-vs-reality bar comparator across `elec`, `dac` (`#ch9Ppm`), and `co2rr` (`#ch9Vcell`, `#ch9Fe`), dynamically switching `ch9.say.dac` ($\le 2000\,\text{ppm}$) vs `ch9.say.dacHigh` ($> 2000\,\text{ppm}$).
10. **`#ch10` — Five Thermodynamic Questions for Any Energy/Reaction Claim**
    - Actionable summary checklist plus cross-links to site modules.

---

## 4. Sources & Verification Dates (All Verified 2026-11-13)

- **Standard thermodynamic properties ($298.15\,\text{K}$)**: OpenStax *Chemistry 2e*, Appendix G (derived from NIST WebBook / JANAF / CODATA). Verified URL: <https://openstax.org/books/chemistry-2e/pages/g-standard-thermodynamic-properties-for-selected-substances> (Retrieved `2026-11-13`).
- **Ammonia equilibrium correlation $K_a(T)$**: L. J. Gillespie & J. A. Beattie, *Phys. Rev.* **36**, 743 & 1008 (1930); *J. Am. Chem. Soc.* **52**, 4239 (1930). Retrieved `2026-11-13`.
- **Biochemical ATP standard free energy**: Lehninger *Principles of Biochemistry* / BioNumbers ($\Delta G^{\circ\prime}_{\text{ATP}} = -30.5\,\text{kJ/mol}$, glucose phosphorylation $+13.8\,\text{kJ/mol}$ at pH 7, $310.15\,\text{K}$).
- **Global ammonia baseline & energy intensity**: IEA, *Ammonia Technology Roadmap* (Oct 2021) — $185\,\text{Mt}\,\text{NH}_3$ (2020), $\sim 2\%$ global final energy, $\sim 1.3\%$ energy/process $\text{CO}_2$, $28\,\text{GJ/t}$ BAT natural-gas net intensity, $41\,\text{GJ/t}$ global average, $18.6\,\text{GJ/t}$ methane theoretical floor. Primary IEA URL verified via search `2026-11-13`.
- **2025 ammonia production**: U.S. Geological Survey (USGS), *Mineral Commodity Summaries 2026* — "Nitrogen (Fixed)—Ammonia" (Jan 2026, pp. 136–137; world total $\sim 160\,\text{Mt}$ N content in 2025). Retrieved `2026-11-13`.
- **Electrolysis benchmarks**: IEA, *Global Hydrogen Review* (2024–2026 editions) — ALK $50\text{–}65\,\text{kWh/kg}$, PEM $48\text{–}55\,\text{kWh/kg}$ ($51\text{–}69\%$ LHV based on $33.3\,\text{kWh/kg}$ LHV), SOEC $35\text{–}45\,\text{kWh/kg}$ demo. Retrieved `2026-11-13`.
- **Ambient Li-mediated ammonia electrosynthesis**: S. Li et al., *Nature* **629**, 92–97 (2024), DOI: <https://doi.org/10.1038/s41586-024-07276-5> ($300\,\text{h}$ continuous $25\,\text{cm}^2$ flow cell, $64 \pm 1\%$ FE at ambient $T, 1\,\text{bar}$); H.-L. Du et al., *Nature* (2022). Retrieved `2026-11-13`.
- **Direct air capture (IEA + Climeworks + Stratos)**:
  - IEA DAC assessments ($5.4\text{–}10.8\,\text{GJ/t}\,\text{CO}_2$ thermal+electrical range).
  - Climeworks Mammoth H1 2025 ($119\,\text{t}$ net CDR) and H1 2026 ($675\,\text{t}$ net CDR) vs $36\,\text{kt/yr}$ nameplate (`2026-07` disclosures). Retrieved `2026-11-13`.
  - 1PointFive Stratos (West Texas, $500\,\text{kt/yr}$ nameplate, Phase 1 commissioning slowed in mid-2026 by non-process component issue; ramp pushed toward late 2026). Retrieved `2026-11-13`.
- **Green ammonia commercial scale-up**: NEOM Green Hydrogen Company ($4\,\text{GW}$ wind+solar, $2.2\,\text{GW}$ electrolyser, $\sim 600\,\text{t/day}$ $\text{H}_2$, target $\sim 1.2\,\text{Mt/yr}$ green $\text{NH}_3$; commissioning underway in 2026, commercial operations targeted 2027). Retrieved `2026-11-13`.
- **$\text{CO}_2\text{RR}$ to $\text{C}_2\text{H}_4$**: Thermodynamic $E^\circ_{\text{cell}} = 1.15\,\text{V}$ verified from OpenStax Appendix G ($\Delta G^\circ_f(\text{C}_2\text{H}_4(\text{g})) = +68.15\,\text{kJ/mol}$, $12e^-$); MEA literature pilot bands ($50\text{–}75\%$ FE, $300\text{–}500\,\text{mA/cm}^2$, $2.5\text{–}3.5\,\text{V}$, $20\text{–}35\%$ EE).
- **AI catalysis screening**:
  - Meta FAIR, *The Open Catalyst 2025 (OC25) Dataset and Models for Solid-Liquid Interfaces*, arXiv:2509.17862 (~$7.8\,\text{M}$ DFT calculations, $>1.5\,\text{M}$ explicit solvent environments). Retrieved `2026-11-13`.
  - A. K. Cheetham & R. Seshadri, *Chem. Mater.* **36** (8), 3490–3495 (2024), DOI: <https://doi.org/10.1021/acs.chemmater.4c00643> (synthesizability critique of GNoME convex-hull claims). Retrieved `2026-11-13`.

---

## 5. Facts That Will Go Stale

- **Climeworks Mammoth net CDR deliveries** (`675 t` in H1 2026): update after FY 2026 / H1 2027 verified registries.
- **1PointFive Stratos & NEOM commissioning milestones**: update once Phase 1 steady-state $\text{CO}_2$ injection / 2027 green $\text{NH}_3$ exports are verified rather than target estimates.
- **USGS annual global ammonia tonnage** (`~160 Mt N` in MCS 2026): shifts yearly with *Mineral Commodity Summaries 2027+*.
- **Commercial electrolyser stack specific energy** ($48\text{–}65\,\text{kWh/kg}$) & **Li-NRR durability record** ($300\,\text{h}, 64\%\,\text{FE}$): update as pilot flow cells surpass $\ge 1000\,\text{h}$ or higher current densities.
- **$\text{CO}_2\text{RR}$ MEA energy efficiency ($20\text{–}35\%$)** and **OC25 / MLIP benchmark datasets**: rapid turnover expected in 2027+.

---

## 6. Site Prerequisites & Cross-Links

- **Verified live site cross-links (present in `pages.config.js` and `copy.zh.js`)**:
  - `../../../probability/stochastic/entropy/#step2` (`#ch1`, `#ch10`)
  - `../../matter/particles-states/#step0` (`#ch1`)
  - `../chemical-equilibrium/#step0` (`#ch4`, `#ch10`)
  - `../activation-energy/#step0` (`#ch5`, `#ch10`)
  - `../reaction-rates/#step0` (`#ch5`, `#ch10`)
  - `../electrochemistry/#step0` (`#ch6`)
  - `../../../physics/thermal/thermodynamics/#step0` (`#ch10`)
- **Sibling draft cross-links in prose (on disk, not yet live in `pages.config.js`, excluded from `REGISTRY.json` `relatedPages`)**:
  - `../why-batteries-hold-so-little/#ch1`, `#ch6` (`#ch2`, `#ch6`, `#ch10`), `#ch3` (`#ch8`)
  - `《芯片为什么越来越难做》` mentioned unlinked in `#ch2` (`why-chips-are-hard` draft not yet live).
- **Site prerequisites lacking**:
  - Dedicated standalone step-by-step interactive explainer for **chemical potential $\mu_i$ and partial molar quantities** (Ch4 & Ch8 bridge $\Delta_r G$ and common tangent directly here instead).
  - Dedicated standalone **Maxwell–Boltzmann velocity distribution** page (`particles-states` covers qualitative kinetic temperature without quantitative $\exp(-E/RT)$ energy tail).
  - `copy.en.js` for this essay (pending English authoring pass; clicking `EN` currently stays cleanly in Chinese rather than corrupting UI).

---

## 7. Checked / Not Checked

- `node chemistry/reactions/which-way-reactions-go/tests/models.cjs`: **PASS** (`568 passed, 0 failed` — verified NIST/OpenStax thermo math, Gillespie–Beattie $K_a(T)$, Arrhenius catalytic invariance, ATP log-ratio reachability, Haber–Bosch window, regular solution common tangent, frontier floors, and zero missing i18n keys / prose number drift).
- `node scripts/atlas-import-registry.cjs chemistry/reactions/which-way-reactions-go/ --out /tmp/agent-tasks/essays/which-way-reactions-go/preview-lesson.json`: **PASS** (10 concepts, `#ch1`–`#ch10` anchors verified against `index.html`, all `relatedPages` verified live in `pages.config.js`, zero collisions; `atlas/` untouched).
- CJK code hygiene check (`models.js`, `app.js`): **PASS** (`NONE` CJK in JS logic).
- Browser Playwright (`tests/browser.cjs`) & canvas overlap sweep (`tests/canvas-text-overlap.cjs --sweep`): **Pending Playwright lock on port `19005`** (will update this section once completed).
