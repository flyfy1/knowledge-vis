# BRIEF — 酱油是怎么酿出来的 (How Soy Sauce Gets Its Flavor)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320, canvas sweep, screenshots at three widths); Claude Code (claude-opus-5-5), independent review 2026-11-12 (first read zh in browser; prose numbers against models.js; models re-derived independently; standards and sources opened; English read and fixed in browser at 1280/390/320; tests extended to English) — see "Independent review" below
Category: food 饮食与风味 / subtopic flavor 味道从哪来 · Stage: senior
Format: long interactive essay, Chinese and English (copy.en.js by a Haiku translator, corrected by the independent reviewer)
Files: index.html, copy.zh.js, models.js, app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs

## The one question

黄豆、小麦、盐、水，四样东西单独都不鲜、不香、不黑。放在一起半年，为什么成了又鲜又香、颜色深褐的酱油？
而同样叫「酱油」的东西，为什么有的要酿半年，有的几天就能做出来？

## Changes from the starting list (TASK file)

- ch1 timeline kept, but every point on it is computed by the ch2 and ch4 models (reuse), not drawn.
- ch2 koji: no separate enzyme-yield curve. The sources give only qualitative temperature preferences
  (protease ≤30 °C, amylase 35–38 °C, protease not enhanced above 40 °C), so the model reports
  "hours above 40 °C" instead of inventing a curve.
- ch3: the mass balance gives protein and available carbohydrate, not total nitrogen. I did not verify the
  nitrogen-to-protein factors, so I left nitrogen out.
- ch4 relay: the controls are salt, temperature and grain ratio, not starting pH. In the model, a starting pH
  of 6–7 barely changes the outcome. Temperature has measured data (Zhou 2019, 15 °C vs 30 °C) and a real
  failure mode.
- ch6 aroma is prose only, with no new model. It reuses ch4 (ethanol, yeast timing) and ch5 (heating).
  I found no data that gives both concentrations and thresholds across brewing.
- ch7: the model is the label arithmetic (stoichiometry plus GB/T 18186 grades). There is no formol titration
  curve, because I did not find a sourced value for formaldehyde's pKa shift.
- ch8: reuses the ch4 relay ("press on day N") and the ch5 Arrhenius model. Low-salt solid-state temperatures
  were not sourced, so that route is not modelled.
- ch9: no quantitative claim about saltiness perception (not verified).

## Chapters, models, published results, tuned parameters

| ch | model | published result | tuned (sensitivity pinned in tests/models.cjs) |
|---|---|---|---|
| 1 | timeline | outputs of ch2/ch4 | — |
| 2 | koji bed | logistic growth × cardinal temperature model (Rosso 1993) + lumped heat balance; surface cooling ∝ 1/depth² | μ 0.4/h, Q 60 °C, k 0.5/h at 4 cm. Deepest bed below 40 °C unturned is 4.2 cm; under ×½/×2 of each, 2.9–6.5 cm |
| 3 | grain mass balance | USDA composition | assumption: brine sugar ∝ available carbohydrate |
| 4 | relay | gamma concept (Zwietering 1992), cardinal pH model (Rosso 1995), Monod, Luedeking–Piret (non-growth), linear buffer, Pitzer a_w | muL, L0, bNG, pAmin, Tmin grid-fitted to 8 of Zhou 2019's 14 pH points (RMS 0.08 on those, 0.15 on all 14 — reviewer). muY, eY, yields, Ks, kd tuned to 2–4% ethanol. pH 5.0 day 13 (8–25); yeast day 30 (19–52); fail salt 20.6% (20.4–20.7); fail temperature 11.6 °C (9.8–15.1 under Tmin ×½/×2); all-soy/koikuchi ethanol 0.41 (0.41–0.43 under yES, 0.25–0.47 under yLS) |
| 5 | browning | Arrhenius | Ea is a slider (20–145) from other systems; default 109 |
| 7 | label | MSG·H2O stoichiometry; GB/T 18186-2025 Table 2 | — |
| 8 | cut short | ch4 + ch5 | as ch4 |
| 9 | sodium | MEXT table | — |

## Sources (each opened by me; what was checked)

| figure | source | checked |
|---|---|---|
| koikuchi process: wheat roasted 160–180 °C; koji 2–3 d at 30 °C; brine 22–23%; moromi 6–8 months; product salt 17–18%; mould dies after brining; T. halophilus best at 5–10% salt; lactic acid from glucose, acetic from citrate; Z. rouxii 2–4% ethanol, HEMF, methionol; C. versatilis 4-EG; early moromi pH 6–7; ~300 aroma compounds; Chinese style uses mostly soybean | Ito & Matsuyama 2021, J Fungi 7:658, https://pmc.ncbi.nlm.nih.gov/articles/PMC8399179/ | full text |
| trays 3–5 cm; brine 18–22%; moromi 3–6 months, at least 6 months at high salt; pasteurisation 70–80 °C for 30 min; HDMF/HEMF from pentoses on heating; Z. rouxii pH 4.0–5.0 at 18% salt (Röling 1994); fails above pH 5.5 (Watanabe & Tamai 1992); 0.5% acetic acid in 18% NaCl inhibits; delayed inoculation to day 14 gives more HEMF; less wheat means yeast matters less; KCl bitter above about 10% replacement | Devanthi & Gkatzionis 2019, Food Res Int 120:364, accepted manuscript https://pure-oai.bham.ac.uk/ws/files/72543474/Devanthi_et_al_Soy_sauce_fermaentation_Food_Research_International_2019.pdf | full text |
| Tetragenococcus: slower above 15% NaCl; no growth at pH 5.0; grows to pH 9.0; optimum pH 7; no growth at 23% NaCl (a_w 0.83) at pH 7 | Justé et al., "Genus Tetragenococcus", https://lirias.kuleuven.be/retrieve/193914 | full text |
| koji heat starts ~10 h, rises ~16 h, turning, keep below 40 °C; protease ≤30 °C, amylase 35–38 °C, protease not enhanced above 40 °C; koji a_w falls to 0.90; T. halophilus optimum 25–30 °C | J Fungi 2021 miso/koji review, https://pmc.ncbi.nlm.nih.gov/articles/PMC8307815/ | full text (rice/miso koji, not soy koji) |
| A. oryzae cardinal temperatures: optimum 32–36, min 7–9, max 45–47 °C | Wikipedia "Kōji (food)" (secondary) | read; primary source not opened |
| Z. rouxii pH: CPM fit pHopt 4.0; Ratkowsky pHmax 10.4 | Membré et al. 1999, AEM, https://pmc.ncbi.nlm.nih.gov/articles/PMC91662/ | full text |
| moromi pH, days 5–90 at 30 °C and 15 °C (both laboratory series; reviewer: the 15 °C series runs to day 90, not one month); EC 83.5% formed in hot extraction and sterilisation; 85 °C 30 min | Zhou et al. 2019, Molecules 24:1474, https://pmc.ncbi.nlm.nih.gov/articles/PMC6514843/ | Table 1 values typed into models.js (reviewer re-read the HTML table) |
| soybean:wheat 80:20 / 70:30 (Chinese), 50:50 (Japanese), tamari <10% wheat; acid hydrolysis 4–9 M HCl, 20–35 h, >100 °C; chloropropanols as markers; γ-Glu peptides via CaSR | Diez-Simon et al. 2020, JAFC, https://pmc.ncbi.nlm.nih.gov/articles/PMC7581291/ | full text; its HLFSS="dark", LSFSS="light" mapping not used |
| LS vs HS: HS fermentation usually 3× LS; LS high temperature, short time, dark; AAN HS 9.10 vs LS 4.80 g/L; formol titration to pH 8.2 then 9.2 | Zheng et al. 2024, Foods 13:971, https://pmc.ncbi.nlm.nih.gov/articles/PMC10969990/ | full text |
| formol method (pH 8.2 / 9.2) | PMC12692206 (Sichuan black-soybean soy sauce) | methods |
| Maillard Ea 109 / 125 / 145 kJ/mol | Foods 2025 review, https://pmc.ncbi.nlm.nih.gov/articles/PMC12154226/ | text |
| colour Ea ~20 kJ/mol in sugarcane juice | https://pmc.ncbi.nlm.nih.gov/articles/PMC12191478/ | text |
| browning by heating and by oxidation; shaking browns soy sauce but not the model system | Hashiba 1972, Agric Biol Chem 36:390, doi:10.1271/bbb1961.36.390 | abstract only |
| GB/T 18186-2025: published 2025-05-30, in force 2026-12-01, replaces 2000 ed.; categories 高盐稀态/低盐固态; Table 2 AAN grades; ammonium ≤28%; 5.1.8 (no acid-hydrolysed protein, MSG must not affect grade); 8.2 label | official text, file4.foodmate.net/foodvip/biaozhun/2025/GBT18186-2025dz.pdf; status at std.samr.gov.cn | full text |
| GB/T 18186-2000 ammonium 30% | 南方都市报 2025-10-17 (secondary); 2025 foreword confirms only the ammonium index changed among 理化指标 | 2000 text unreadable (scanned) |
| GB 2717-2018: in force 2019-12-21; fermentation definition; AAN ≥0.4 | foodmate biaozhun/2018/GB2717-2018.pdf | full text |
| GB 2762-2025: in force 2026-09-02; 3-MCPD ≤0.4 mg/kg liquid, 1.0 solid, for condiments with added acid-HVP | foodmate biaozhun/2025/GB2762-2025dz.pdf | Table 12 |
| SAMR 2021-06 notice: no 配制酱油; no acid-HVP in soy sauce | press reprint, https://www.thepaper.cn/newsDetail_forward_13378965 | reprint, not the SAMR page |
| JAS 1703 total nitrogen grades; 特級 = 本醸造; 混合 methods | https://www.maff.go.jp/j/jas/jas_standard/attach/pdf/index-470.pdf | full text |
| Na and salt per 100 g: koikuchi 5700/14.5, usukuchi 6300/16.0, tamari 5100/13.0, reduced 3300/8.3 | MEXT 日本食品標準成分表（八訂）増補2023, fooddb.mext.go.jp 17007/17008/17009/17086 | entries |
| soybean and wheat composition; shoyu Na 5490 mg/100 g | USDA FoodData Central 174270, 168890, 174277 | entries |

## Checked / not checked

Checked by the independent reviewer (2026-11-12), against the source opened:
- GB/T 18186-2025 full text (foodmate PDF): published 2025-05-30, in force 2026-12-01, replaces GB/T 18186-2000
  (originally GB 18186-2000, made recommended in 2017); recommended (GB/T) standard; 3.1 definition; 4 the two
  categories; Table 2 AAN 0.80/0.70/0.55/0.40 (high-salt) and 0.80/0.70/0.60/0.40 (low-salt); ammonium ≤ 28% of AAN;
  foreword lists only ammonium among the changed physical-chemical limits; 5.1.8 verbatim: 「酱油中不应添加酸水解蛋白
  制品，不应添加味精生产过程的结晶母液或者其他含谷氨酸的废液。添加的味精、食品添加剂不应影响酱油质量等级。」;
  8.2 label must state standard, category, AAN, grade.
- GB 2717-2018 full text: published 2018-06-21, in force 2019-12-21, replaces GB 2717-2003; 2.1 definition (microbial
  fermentation); AAN ≥ 0.4 g/100 mL. This mandatory standard, not GB/T 18186, is what makes a non-fermented product
  not "酱油"; the page now says so.
- GB 2762-2025 full text: published 2025-09-02, in force 2026-09-02, replaces GB 2762-2022; Table 12: 3-MCPD
  ≤ 0.4 mg/kg in 调味品 (固态调味品除外) and ≤ 1.0 mg/kg in solid seasonings, footnote "仅限于添加酸水解植物蛋白的产品".
  The page said "liquid seasonings"; now "seasonings other than solid ones", and notes the limit concerns non-soy-sauce
  products.
- JAS 1703:2021 (MAFF PDF): 3.8 本醸造 / 混合醸造 / 混合 definitions; total-N grades koikuchi 1.50/1.35/1.20, usukuchi
  1.15/1.05/0.95, tamari 1.60/1.40/1.20, shiro 特級 0.40–0.80; 特級 must be 本醸造 for koikuchi, usukuchi, tamari,
  shiro, but saishikomi 特級 may be 混合醸造 — the page's "top grade must be fully brewed" was too broad; now scoped.
- MEXT fooddb 17007 and 17008: koikuchi Na 5700 mg / salt 14.5 g; usukuchi 6300 / 16.0 per 100 g.
- Zhou 2019 Table 1 (HTML): the builder's 30 °C values are right; the 15 °C series continues to day 90 (5.01, 4.88,
  4.66, 4.69) and both start at 6.02 on day 5. The fit used 8 of the 14 points (RMS 0.08); against all 14 the RMS is
  0.15, and at 15 °C the model's late pH (≈4.87) is ~0.2 above the measured 4.66–4.69. All points are now drawn
  (hollow = not in the fit) and the error against all is stated and pinned. The paper gives no salt level for the
  laboratory batches (the page had implied one).
- Independent re-derivation (/tmp/agent-tasks/essays/review-how-soy-sauce-gets-its-flavor/indep.cjs): Arrhenius
  19.63 d / 1.76 h / 188.5 d, fridge 1.79/23.6/67.1, +10 °C factor 1.30–6.67; Pitzer a_w 17% 0.873, 20.8% 0.830;
  CPM yeast γ(4.0) = γ(5.0) = 0.75; MSG·H2O 187.13 g/mol, 7.49% N, 5.34 g and 1.34 g; USDA mass balance 0.52/0.71/0.81,
  24.6 g protein — all match models.js.
- Koji heat balance: the lumped form (generation ∝ growth per volume, conduction loss ∝ 1/depth²) is dimensionally
  right; the 4.2 cm is essentially the calibration target (4 cm tray tuned to just under 40 °C), so the page no longer
  calls it agreement with the 3–5 cm trays; moving Topt over 32–36 and Tmax over 45–47 °C moves it 4.0–4.5 cm (pinned).
- Chemistry corrections: Z. rouxii's cooked-potato odorant is methionol (3-甲硫基丙醇), not 甲硫醇 (methanethiol);
  formol titration counts lysine's side-chain amino group too.

Not verified (left out, or labelled on the page):
- the activation energy of soy sauce browning (none found; slider; the single 19.6-day figure is now always given
  with its Ea and range)
- the A. oryzae cardinal temperatures: still secondary only (Wikipedia; a Japanese brewing guide was found but not
  readable); the page says so and gives the sensitivity
- low-salt solid-state temperature and duration (not modelled)
- the yeast pH window between 0% and 18% salt (interpolated; listed in ch10)
- the formaldehyde pKa shift (no number given)
- saltiness perception (the page now neither asserts nor quantifies it)
- soy sauce density (per-gram figures only)
- the GB/T 18186-2000 text itself: the 30% ammonium cap remains "reported" (press, plus local/group standards using
  30%); the 2000 AAN grades are inferred from the 2025 foreword
- the SAMR June 2021 notice on samr.gov.cn: not found; the page cites it as reprinted by The Paper and Xinhua
- the 生抽/老抽 caramel claim (phrased conditionally)
- the T. halophilus a_w 0.83 / 23% NaCl limit and the Z. rouxii pH window (Justé; Röling via Devanthi) — sources not
  reopened by the reviewer
- the EU 3-MCPD limit (not used)

## Independent review (2026-11-12)

Verified-By: Claude Code (claude-opus-5-5) — independent reviewer, did not build the page. Scope: first read in
Chinese in a browser at 1280 before reading code or this BRIEF; every prose number traced to models.js /
tests/models.cjs; Arrhenius, Pitzer, CPM, CTMI, stoichiometry and mass balance re-derived independently; GB/T
18186-2025, GB 2717-2018, GB 2762-2025, JAS 1703, MEXT and Zhou 2019 Table 1 opened; English read in the browser at
1280/390/320 and corrected; tests extended to English; canvas sweep (scroll-aware) in both languages. Changes are in
the working tree, uncommitted.

Main changes: legal statements now separate what is in force (GB 2717-2018 since 2019-12-21; GB 2762-2025 since
2026-09-02; GB/T 18186-2000) from what takes effect on 2026-12-01 (GB/T 18186-2025, recommended); the "cannot be
called 酱油" claim rests on GB 2717-2018 plus the press-reprinted SAMR notice and is limited to the name and label;
5.1.8 quoted correctly (acid-hydrolysed protein products; MSG crystallisation mother liquor or other glutamate-
containing waste liquid); JAS top-grade rule scoped (saishikomi exception); 3-MCPD scope corrected; Zhou fit error
reported against all measured points; failure thresholds presented as model outputs with their caveats; Ea-dependent
figures always carry their Ea; methionol; lysine; ch9 salt basis (per 100 mL vs per 100 g) and Japanese-data caveat;
saltiness-perception claim no longer asserted; ch8.p4 "first question" → second. English: "blended soy sauce",
"fermented tofu essay", mixed-brewing / blending terms, timeline ticks ("1 hour", "1 day"), capitalised standalone
grade labels, readout labels rewritten, bar-chart labels move above bars when they cannot fit, ch3 style tags and
ch4 threshold labels no longer collide or clip at 320, slider labels wrap at ≤420 px.

Left for the owner: the tofu essay's REGISTRY owns the aliases "soy sauce" and 「酱油是怎么来的」 (its family-table
concept); now that this essay exists they arguably belong here — not changed (shared file outside this directory).
