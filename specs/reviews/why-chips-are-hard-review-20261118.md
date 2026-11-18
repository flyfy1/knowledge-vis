# Review · tech/semiconductors/why-chips-are-hard · 2026-11-18

- Reviewer: Claude Code (claude-fable-5-2), independent review (did not write the page).
- Status: **INTERRUPTED before any fix was applied.** The team lead asked for a wind-down (token budget). The
  essay's files are exactly as the reviewer found them. Everything below under "Fixes to apply" is a finding with
  a worked-out fix, not a change that has been made.
- Verdict so far: **ready after the listed fixes**; not ready as it stands (four frontier sentences say more than
  their cited sources, the Nc/Nv note is wrong about its own provenance, one control is mislabelled, and the
  English page has had no browser test run at 390/320).
- Scratch (text dumps of both languages at 1280, section screenshots, downloaded sources, `rederive.py`):
  `/tmp/agent-tasks/essays/review-why-chips-are-hard/`.

## What was done

1. Read the Chinese page top to bottom as rendered in a browser at 1280 (text dump plus screenshots of ch1 and
   ch5; the other section screenshots were taken but not all looked at), before BRIEF.md or code.
2. Read all of `models.js` and `app.js`, BRIEF.md, and the whole English page as rendered at 1280.
3. Re-derived by hand (calculator-level, in the reviewer's notes) the numbers listed under "Re-derivations".
4. Opened sources for the facts listed under "Facts checked".
5. Compared REGISTRY.json aliases with `site-registry.json` / CONCEPT-MAP.md.
6. Ran `node tests/models.cjs` once at the end: `PASS: 478 model and prose checks`. `copy.zh.js` and
   `copy.en.js` have 515 keys each, identical sets. Server on 19021 stopped.

## First-read notes (Chinese, 1280)

1. The hero promises "一座要花上百亿美元的工厂" and no chapter ever returns to what a fab costs. Ch10 is about
   wafer price and yield only. One sourced sentence in ch10 would close it (see fix 9).
2. Ch2: the prose says "默认情况…耗尽区宽 332 纳米" and Figure 2 draws 30 + 302 nm, but the model's default has
   0.60 V forward bias and its tile shows 158 nm. All three are right (332 nm is zero bias) but the reader has
   to work that out; the prose should say "不加电压时".
3. Ch5: the slider reads "80 nm" while the tile under it reads half-pitch "40.2 nm". The slider is logarithmic
   and the pitch is really 80.4 nm; the label rounds it. Looks like an arithmetic error to a reader.
4. Ch5: the illumination button "正入射" (EN "On-axis"; prose "Normal incidence") does not mean normal
   incidence in the model. It is a conventional partially coherent source with σ up to 0.6, which is why it
   reaches half-pitch 50 nm; strictly normal incidence would stop at λ/NA, half-pitch 71.5 nm. The prose two
   paragraphs earlier describes the strict case, so the label contradicts the chapter's own explanation.
5. The ladder holds: 60 mV from ch2 returns in ch3, ch3's transistor is put into ch4's table, ch5's limit is
   used in ch6 and ch7, ch10 points to ch11. The defaults show the effect untouched in every model looked at.
   Ch11 is long (17 rows) but the filter helps.

Smaller: the ch5 law line renders "k₁" with a visible gap before "·λ/NA" in the serif face.

## Re-derivations (independent of models.js; all agree unless noted)

- Ch1: Eg(300) = 1.1245 eV; nᵢ = √(2.8·2.65)×10¹⁹·e^(−Eg/2kT) = 9.76×10⁹. Intrinsic and doped resistivity,
  649 K. "每升高约 9 K 翻一倍": the local slope at 300 K gives 8.4 K, the finite step 300 → 2nᵢ gives ≈ 9 K,
  which is what the test computes; acceptable.
- Ch2: Vbi = kT·ln(10³³/nᵢ²) = 0.775 V; W(0) = 332 nm, split 30 / 302; W(0.6 V) = 158 nm; Emax = 22 kV/cm;
  59.5 mV per decade.
- Ch3 (EKV): at Vdd 0.45 V the on-current is 0.118 of the 0.75 V value (under 1/8 = 0.125: correct), and
  C·V/I gives (0.45/0.75)/0.118 = 5.06×, so "约 5 倍" is correct. Vt 0.3 → 0.2 V: ×24.5. Vt floor 0.30 V
  (n = 1.2), 0.25 V (n = 1).
- Ch4: feature size, voltage, frequency at generation 6 by hand. The eight live-sentence cases and the
  2.7× / 63 % / 10.9× / 256× / 10.7× figures were **not** recomputed (script written, not run).
- Ch5: two-beam argument by hand. With poles over σ 0.7–0.95, a fraction f of each pole collects the first
  order; contrast = 2·a₀·a₁·f / (a₀² + f·a₁²) with a₀ = 0.5, a₁ = 1/π. At half-pitch 37.9 nm f = 0.256 and the
  contrast is 0.295 ≈ 0.3. So the limit is linear in the source sampling and fixed entirely by the two chosen
  numbers (pole edge 0.95, threshold 0.3); the page already says the threshold is the author's, and should say
  the same of the pole range. Conventional σ ≤ 0.6 gives ≈ 50 nm the same way. k₁ floor 35.7 nm, EUV 21.7 nm
  pitch, high-NA 6.5 nm, DOF 36 %: correct. Numerical convergence with 20/50/200/800 points: script written,
  **not run**.
- Ch6: 91.8 eV, 6.42 eV, 0.7¹¹ = 2.0 %, 4.94 W, 2.86 s, 1,259 wph, 2,297 and 3,446 photons, 4.2×10⁵ at 193 nm.
- Ch7: 20,736 nm², 192.9 and 90.78 MTr/mm², 833 for G40M16 two tiers.
- Ch8: λ = 2.32 nm and 5.48 nm by hand. Swing / DIBL / leakage figures **not** recomputed.
- Ch9: Cu conductor 8 × 22 nm, 61 % of 12 × 24; formula matches Steinhögl's (MS term written as
  1/(1 − 3α/2 + 3α² − 3α³ln(1+1/α))); Cu ≈ 14.4 µΩ·cm → 816 Ω/µm; 0.38·r·c·L² = 620 ps. Crossover 39 / 11 nm
  **not** recomputed.
- Ch10: 90.6 dies, 54.9 %, $342, $623, 81.9 %, $1,299 → $397.

## Nc / Nv for silicon (point 2 of the task)

- **Sze & Lee, *Semiconductor Devices: Physics and Technology*, 3rd ed.** (full text opened): "At room
  temperature (300 K), N_C is 2.86 × 10¹⁹ cm⁻³ for silicon", N_V 2.66 × 10¹⁹, nᵢ = 9.65 × 10⁹; the appendix
  table repeats all three.
- **Sze, Li & Ng, *Physics of Semiconductor Devices*, 4th ed., ch. 1** (Wiley's own excerpt PDF): confirms
  nᵢ = 9.65×10⁹ cm⁻³ at 300 K (problem 12) and the Eg(T) form. The appendix with Nc, Nv is not in the excerpt,
  so **2.8 / 2.65 in Sze & Ng is still not confirmed**; it is evidently the same pair rounded.
- Green 1990 (J. Appl. Phys. 67, 2944), abstract: Nv = 3.1×10¹⁹, nᵢ = 1.08×10¹⁰ at 300 K. Altermatt et al.
  2003 (J. Appl. Phys. 93, 1598), abstract: Sproul & Green's 1.00×10¹⁰ reinterpreted with band-gap narrowing
  gives 9.65×10⁹. Full texts not opened.
- Computed with the page's Eg(300): 2.8/2.65 → 9.76×10⁹; 2.86/2.66 → 9.89×10⁹; Green's 2.86/3.10 → 1.07×10¹⁰;
  Ioffe 3.2/1.8 → 8.60×10⁹.
- **Recommendation (not applied):** switch `NC300, NV300` to 2.86e19, 2.66e19 and cite Sze & Lee. Cascade,
  already computed: nᵢ 9.8 → 9.9×10⁹ (ch1.p3, live sentence), Vbi 0.775 → 0.774 V (ch2.p3), live current at
  0.6 V 6.7 → 6.9 µA, hole density tile 9.5 → 9.8×10³; unchanged: 3.5×10⁵ Ω·cm, 60 万倍, 649 K / 376 °C,
  332 / 30 / 302 / 628 / 158 nm, 22 kV/cm. Re-pin in `tests/models.cjs`. Rewrite `ch1.limit` in both languages:
  the pair is Sze & Lee's; the same book tabulates 9.65×10⁹, which this formula does not reproduce exactly
  (9.9×10⁹) because the tabulated Eg differs; Green's own Nv is 3.1×10¹⁹; Ioffe's pair gives 8.6×10⁹.
  If the values are kept instead, the note must stop implying the pair was chosen freely and say it is the
  rounded Sze pair, unverified in Sze & Ng itself.

## Facts checked, and against what (all opened 2026-11-18)

| Fact on the page | Result | Source |
|---|---|---|
| Steinhögl C = 1.2 | **Confirmed**: "The constant C of the compact model is 1.2 in this case" (p = 0, rectangular) | Steinhögl et al., SISPAD 2003 (authors' own paper), in4.iue.tuwien.ac.at/pdfs/sispad2003/01233629.pdf |
| Ru λ 6.6 nm, ρ₀ 7.1 / 7.6, R 0.40–0.45; Cu on TaN p 0.05, R 0.22, λ 40.6 | Confirmed (Table 1) | Dutta et al., arXiv:1712.03859 |
| EXE:5200B ≥ 175 wph at 50 mJ/cm² | **Confirmed** (page JSON `"figures":"≥ 175"`; annual report "At 175 wafers per hour") | ASML product page (raw HTML); ASML 2025 annual report (SEC) |
| Four EXE systems recognised in 2025; 1,000 W source April 2025; NXE:3800E 220 wph spec | Confirmed. The report also says "We expect our TWINSCAN EXE platform to start supporting high-volume manufacturing in 2027" and 230 wph with PEP-E | ASML 2025 annual report |
| High-NA: 10 systems / 4 customers / 3 more; 135 wph; 84 % → 90 % | Confirmed (Greet Storms, 2 Sept 2026) | Bits&Chips |
| N2 volume production 4Q25, first-generation nanosheet | Confirmed | TSMC 2 nm page |
| > 20 N2 tape-outs; A16 "now shows it in 2027"; A13, A12 in 2029; 5.5-reticle CoWoS | Confirmed | SemiEngineering 2026-04-27; TSMC PR 2026-04-23 |
| 14-reticle CoWoS in 2028, ~10 compute dies, 20 HBM stacks | Confirmed | TSMC PR 2026-04-23 |
| A14 2028, +15 % / −30 % / > 20 % | Confirmed | TSMC PR 2025-04-23 |
| 18A: +15 % perf/W, +30 % density vs Intel 3 | Confirmed as Intel's claim. **"首个型号在 2025 年底出货" is not**: the release says "slated to ship before the end of the year"; The Register (2026-01-05) says laptops ship "as soon as January 27" and does not say a SKU shipped in 2025 | Intel newsroom 2025-10-09; The Register |
| "PowerVia 是第一个进入量产的背面供电方案" | **Not in the cited source.** "Industry-first" is Intel's own wording on its 18A page (search-result level) | Intel newsroom 2025-10-09 |
| Exynos 2600 on 2 nm GAA | Confirmed | Samsung product page |
| Blackwell 208 B, two reticle-limit dies, 10 TB/s, 4NP | Confirmed | NVIDIA newsroom 2024-03-18 |
| imec Ru 16 nm pitch, 656 Ω/µm average, ≥ 90 % at 18–22 nm | Confirmed (also: ~40 % of 16 nm structures met target) | imec PR 2025-06-03 |
| Kirin 9030 on SMIC N+3, less scaled than 5 nm | Confirmed; the DUV multi-patterning clause is correctly hedged on the page | TechInsights 2025-12-11 |
| CFET inverter at 48 nm gate pitch; imec A5 ~2032 | Confirmed. **"IEEE Spectrum 的报道说可能要到 2030 年代中期" not found**: the cited URL returns 404 and no December 2024 Spectrum piece turned up | eeNews Europe 2024-10-11 |
| Rapidus prototyping, 2027 target | Confirmed. **The president's caution is not in the cited article.** A 2026-11-10 TrendForce item (citing Bloomberg) says Rapidus is "at least several months behind schedule" and that a spokesperson said it "remains fully committed to beginning mass production in the second half of fiscal 2027" | The Register 2025-07-18; TrendForce 2026-11-10 |
| Cu/Ru crossover "线宽 10 到 17 纳米" | Only 17 nm supported: "ruthenium surpasses copper's conductivity for line CDs of 17nm or less"; barriers "at least 3 to 4nm thick"; Cu mfp 40 nm. The 10 nm end and Moon et al. 2023 itself not found | SemiEngineering 2025-08-21 |
| Intel 10 nm cobalt at M0/M1 | Supported: the IEDM 2017 paper's title ends "…and Cobalt Local Interconnects"; WikiChip gives M0, M1 (WikiChip page itself refused the connection) | search results |
| Hero "上百亿美元" | Order of magnitude supported: TSMC, 4 March 2025, total US investment US$165 billion; the added US$100 billion covers three fabs, two packaging plants and an R&D centre | TSMC PR pr.tsmc.com/english/news/3210 |

Not verified: water n = 1.44 at 193 nm (NIST record has no abstract; secondary only); Mo/Si 75 % theoretical
limit (secondary, page already says "常被引为"); Caughey–Thomas parameters (secondary only); Samsung 3 nm
release of 2022-06-30 (fetch timed out twice); IRDS 2025 lithography (PDF is encrypted, could not be read):
"first production use 2027" and "46 nm pitch + double patterning" rest on the builder's reading.

## Fixes to apply (none applied)

1. **Nc/Nv**: as recommended above (models.js, ch1.p3, ch1.limit, ch2.p3 in both languages, test pins).
2. **fr.i18a**: say Intel stated in October 2025 that the first SKU would ship before year end; laptops on sale
   from 27 January 2026 (The Register).
3. **fr.bspdn**: "Intel 称 PowerVia 是业界第一个…" (a company claim), or drop "第一个".
4. **fr.cfet**: delete the IEEE Spectrum clause and the Spectrum entry in `FRONTIER[cfet].src`.
5. **fr.rapidus**: delete the president's caution; optionally add the November 2026 report with `asOf`
   `2026-11` and TrendForce in `src`.
6. **fr.hnaprod**: add ASML's own expectation (2025 annual report: EXE platform to start supporting
   high-volume manufacturing in 2027), since the IRDS file could not be reopened.
7. **ch9.p4**: replace "文献…10 到 17 纳米之间" with the one supported figure (about 17 nm line width, trade
   press, August 2025), both languages.
8. **ch5**: rename `ch5.illum.on` to 常规照明 / "Conventional"; in ch5.p3 write "常规照明（圆盘光源，σ ≤ 0.6）"
   / "Conventional illumination (a disc source, σ ≤ 0.6)" instead of 正入射 / "Normal incidence"; state the
   dipole range σ 0.7–0.95 in ch5.limit as the author's choice. In `app.js` round the pitch from the
   logarithmic slider (integer at ≥ 20 nm, 0.1 nm below) so the label and the half-pitch tile agree.
9. **Hero promise**: one sentence in ch10 on fab cost with the TSMC figure above, as a company announcement.
10. **ch2.p3**: "不加电压时耗尽区宽 332 纳米" / "at zero bias".
11. **`ch5.split.note1`** (empty in both languages): remove the key from both files and in `app.js` use
    `splitNote: P.split > 1 ? t('ch5.split.note' + P.split) : ''`.
12. **ch11 dates in English**: `app.js` already formats English dates with `toLocaleString`, but with
    `month: 'short'` ("Sep 2026"); change to `'long'`. The English `ch11.date` value `{y}-{m}` is never used;
    either pass `{mon}` and make it `"{mon} {y}"`, or leave it. One row (`hnaprod`, asOf `2025`) reads
    "As of 2025", which is fine.
13. **English wording** (copy.en.js): `ch3.say.nonideal` starts with a capital after a comma ("…mV/decade, A
    little worse"); `ch7.unit.tiers` gives "1 layers"; `ch9.say.ru` gives "466 Ω/µm per micrometre";
    `ch8.shape.finfet` "FinFET fin" → "FinFET", `ch8.shape.gaa` "Gate-all-around GAA" → "Gate-all-around
    (GAA)"; ch8.p1 "There are two bad results. When the drain voltage is high…" lists three things; ch10.p3
    "Area cannot grow without limit, and there is also a hard ceiling"; ch12.law "first ask four numbers" →
    "ask for four numbers".

## English: what was checked

- Whole page read at 1280 as rendered. Apart from item 13 it reads as written English, says what the Chinese
  says, and has no 万 / 成 / `10^x` formats. The only CJK in the rendered text is the 中 toggle button.
- Link texts match the registered English titles before " · " for all twelve linked pages
  (`site-registry.json`); every link target exists.
- Toggle: two buttons "中" and "EN" with a divider in both languages; group `aria-label` "语言" / "Language".
- Document title and meta description are translated.

## Alias overlaps with live pages (point 4; nothing edited)

| REGISTRY concept | Alias | Live page that already has it |
|---|---|---|
| dennard-scaling | 登纳德缩放 / Dennard scaling | `why-compute-waits-for-memory#ch5` (exact alias) |
| semiconductor-frontier | CoWoS | `why-compute-waits-for-memory#ch9` (exact alias) |
| mosfet-subthreshold-swing | 阈值电压 / threshold voltage | `what-a-drive-is-made-of#ch4` (exact; "threshold voltage distribution") |
| die-yield-cost | 芯粒 / chiplets (also 小芯片) | `how-a-computer-is-wired#ch7`, heading "芯粒之间的连线 / Links Between Chiplets" (wins by heading) |
| interconnect-rc-delay | interconnect | headings and aliases in `how-a-computer-is-wired` (ch6, ch7, ch9, ch10) and `coherent-interconnects` (ch10, ch12, ch13) |
| mosfet-subthreshold-swing | 晶体管 / transistor | contained in headings of `switches-that-compute#ch1`, `#ch11`, `how-a-gpu-computes#ch1`, `how-pixels-reach-a-screen#ch8` |
| pn-junction | 二极管 / diode | contained in `power-converters#step3` "开关与二极管 / Switches & diodes" |

The comparison was by normalised string (exact, or containment for names of three characters or more), over
`site-registry.json` concepts and aliases; page anchors there carry ids only, so heading overlaps come from
concept titles and CONCEPT-MAP.md.

## NOT checked

- Any layout at 390 or 320 in either language; the English page at any width other than the 1280 text dump;
  screenshots of the eleven diagrams in English; diagram label overlap.
- `tests/browser.cjs` was not run and **not extended** for English (BRIEF says it adds English checks once
  `copy.en.js` exists; unverified). `tests/canvas-text-overlap.cjs --sweep` was not run.
- Keyboard operation, focus visibility, reduced motion, 48 px targets, language switch redrawing canvases.
- Live sentences at control extremes (only the default states were read, plus the branch logic in `app.js`).
- The numeric re-derivations marked "not recomputed" above; `rederive.py` in the scratch directory is written
  and unrun.
- `copy.zh.js` / `copy.en.js` key by key (only the rendered text and the keys quoted above), `index.html`,
  `tests/*.cjs` beyond the ch1 block, REGISTRY.json beyond its aliases.
- BRIEF.md "Checked / not checked" has a pointer to this file; the reviewer line there says the review is
  incomplete.
