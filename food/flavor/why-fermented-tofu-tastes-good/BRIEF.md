# Why fermented tofu tastes good (酱豆腐为什么好吃)

Built-By: Claude Code (claude-opus-5-5), 2026-11-12, from scratch
Verified-By: self-check by builder (node model test, browser test zh 1280/390/320, canvas sweep, screenshots, read-through); Claude Code (claude-opus-5-5), independent review 2026-11-12 (first read zh in browser; every prose number against models.js; models re-derived independently; 12 sources opened; English copy read and fixed in browser at 1280/390/320; tests extended to English) — see "Independent review" below
category: `food` 饮食与风味 / Food & Flavor (new) · subtopic: `flavor` 味道从哪来 / Where Flavor Comes From (new) · stage: senior
Format: long interactive essay, Chinese copy only (`copy.en.js` to be written by a later translation step)
Files: index.html, copy.zh.js, models.js (UMD, `window.TofuModels`), app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs

## The one question
豆腐本身几乎没有味道。让它长霉、加盐、放几个月，为什么反而变好吃了？松花蛋里没有任何微生物，为什么也走到了差不多的地方？是不是同一个原理？

Answer on the page (ch7): only half the same. Both break down the protein's structure and both rely on a hostile
environment to keep spoilage out. The half that differs decides the taste: fermented tofu's enzymes cut protein into
free amino acids (free Glu 4.3–5.9× threshold); in the century-egg **yolk** free amino acids and IMP *fall* during
pickling while peptides rise (Gao 2022, yolk only), and free amino acids in the **white** rise (Zhao 2014, total only,
no per-amino-acid data). On the data available the alkali does not produce tasteable umami; the egg's appeal is gel
texture and aroma (ammonia), and the yolk's umami is mainly succinic acid that fresh yolk already has. (Reviewer
narrowed the first version, which said the alkali "only cuts as far as peptides" for the whole egg.)
The planning hypothesis ("half the same", both "cutting protein") was corrected: the egg does not produce taste
molecules the way sufu does.

## Changes from the planning chapter list
- 1 大分子没有味道 and 2 霉是来干活的 kept as two chapters; 6 口感 merged into 2 (texture = the gel network being cut; salt hardness data).
- 8 同一个原理吗 became ch7 with a family table; 9 为什么有人觉得臭 became ch8; 10 要注意的和还不清楚的 became ch9 (the ending, no figure).
- 7 松花蛋 became ch6.
- 香气 (ch5) uses stinky tofu data because no source I opened gives both concentrations and thresholds for sufu odorants.

## Chapters, models and the published result each implements
| ch | model | published result | tuned? |
|---|---|---|---|
| 1 | random cutting of 8 chains (seeded) + exact free share | Montroll & Simha 1940 random scission: free share (2p+(N−2)p²)/N → p² | no |
| 2 | endo/exo peptidases over 90 days | Ziff & McGrady 1985 linear fragmentation equation (random scission) + first-order end trimming; RK4 | **kE = 0.002/d, kX = 0.0219/d tuned** so "both" frees 25% at day 80 (order of Han's FAA/CP 0.24–0.26) |
| 3 | sufu + pork mix, EUC curve | Yamaguchi et al. 1971 EUC = Σaᵢbᵢ + 1218(Σaᵢbᵢ)(Σaⱼbⱼ) | no (sufu nucleotides not measured, set 0) |
| 4 | brine a_w vs pathogen minima; ripening rate vs salt | Pitzer & Mayorga 1973 NaCl osmotic coefficient (25 °C); ICMSF minimum a_w table; Han 2004 rates | the straight line through Han's 3 points is our least-squares fit |
| 5 | OAV bars by day, all 28 compounds with both a concentration and a threshold in the paper (reviewer added 14 the first version omitted) | Rothe & Thomas 1963 odour activity value | no |
| 6 | alkali into a sphere | Crank eq. 6.18, constant surface concentration | **D = 7×10⁻¹¹ m²/s fitted** to white/yolk pH plateaus (~6 d / ~18 d, 80% of surface level); **κ = 0.2 tuned** (surface free alkali per % bath NaOH) to put 4% bath at the 0.8% optimum; density 1.08 g/cm³ and yolk radius 0.7 are rounded assumptions |
| 7 | taste activity values, sufu vs yolk (reuses ch3 thresholds) | TAV = concentration ÷ threshold | no |
| 8 | dilution: what is still smelled (reuses ch5 OAV) | Ullrich & Grosch 1987 aroma extract dilution analysis idea: smelled while OAV ≥ FD | no |

Reuse by name: ch2 (Montroll–Simha line), ch7 (ch3 thresholds; ch4 model for soy-sauce brine a_w), ch8 (ch5 OAV), ch9 (ch4 a_w at 8%).

## Sources (each opened by me; what was checked)
| figure / fact | source | checked |
|---|---|---|
| tofu 547 mg/g dm amino acids, 1.3 free; pehtze 15.6; salted pehtze 351; red sufu FAA 28→88 (8%), 28→63 (11%), 26→42 (14%) over 80 d | Han, Rombouts, Nout 2004, J Food Compos Anal 17:363, doi:10.1016/j.jfca.2003.09.012 | numbers as quoted; rates = (d80−d0)/80 are my arithmetic |
| 14% salt hardness +100%, elasticity +18%; subunits remain at 14%; FAA/CP 0.24–0.26; 8% salt → ~40 d ripening; ≤5% salt sours; FFA fast first 30–40 d then esters | Han et al. 2003, J Sci Food Agric 83:899, doi:10.1002/jsfa.1425 | as quoted |
| Actinomucor elegans 25 °C, RH 95–97%, 48 h; protease 108, lipase 172, glutaminase 176 U/g | Han et al. 2003, Food Chem, doi:10.1016/S0308-8146(02)00347-3 | as quoted |
| starter genera; ripening months; red/white/grey; Wei dynasty | Han et al. 2004 Antonie van Leeuwenhoek PMID 15028872; Han et al. 2001 Int J Food Microbiol PMID 11322691 | as quoted |
| ripening 3–6 months; pehtze 25–30 h | PMC10138062; PMC10149673 | as quoted |
| total Glu 41.35–61.16 g/kg, TAA 281.24–293.73; free Glu 1.29–1.76, free Asp 0.69–0.76, FAA ~18–24 g/kg; 12% ethanol, 90 d; "Glu is responsible for sufu's umami" | Food Sci Nutr 2021, https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8358361/ (Europe PMC full text) | tables 1–2 read; Glu share 14–22% my arithmetic; basis (wet weight) not stated in the paper |
| 腐乳 / 酱豆腐 / 红方 (红曲) / 白方 / 青方 naming | https://zh.wikipedia.org/wiki/豆腐乳 | as quoted |
| sufu key odorants by omission | Xiao et al. 2015 Nat Prod Res, PMID 25790084 (abstract) | compound list |
| T1R1/T1R3 umami receptor; glutamate at the VFT hinge, nucleotide adjacent | Li et al. 2002 PNAS PMC123709; Zhang et al. 2008 PNAS PMC2606899 | mechanism |
| pork IMP 230, Glu 10 mg/100 g; "proteins too large to taste" | Umami Information Center, umamiinfo.com (meat page) | values |
| EUC formula, constant 1218, relative umami Asp 0.077, GMP 2.3, AMP 0.18 | PMC11577124 methods (citing Yang 2022, after Yamaguchi); reviewer: PMC13676911 §2.5 (citing Wen 2022) gives the same equation, constant and coefficients, with concentrations in g/100 g and EUC in g MSG/100 g | formula and units agree in two independent secondary sources; Yamaguchi 1971 (J Food Sci 36:846) original **not opened** (paywalled) |
| thresholds Glu 30, IMP 25, GMP 12.5, AMP 50, succinic 10.6 mg/100 g; yolk Glu 17.45→13.14; total FAA 140.72→106.92; IMP 0.0094→0.0018; succinic 278.42→280.87 (35 d); TCA-soluble peptides rise | Gao et al. 2022 Front Nutr 9:998448, PMC9549109 | tables 1–2; reviewer re-opened: **yolk only** (yolks separated before analysis) |
| free amino acids in preserved duck-egg **white** rise significantly vs fresh white (total only) | Zhao, Tu, Xu, Li, Du 2014, Poult Sci 93:3130, doi:10.3382/ps.2013-03823 (abstract, PubMed 25332139) | reviewer; full text not opened, so no per-amino-acid values |
| MSG alone unpalatable, improves foods, infants | Beauchamp 2009 Am J Clin Nutr | as quoted |
| flavour–nutrient learning | Touzani, Bodnar & Sclafani 2010 PMC2956077; Ackroff 2008 PMC2572688; Myers & Sclafani 2006 | general finding |
| minimum a_w (Campylobacter 0.98 … S. aureus growth 0.83, toxin 0.88; C. botulinum A/B 0.94 with NaCl) | IFT report for FDA, *Evaluation and Definition of Potentially Hazardous Foods* (2001; Compr Rev Food Sci Food Saf 2003 suppl.), ch. 3, Table 3-2 (from ICMSF 1996), fda.gov PDF | reviewer re-read the table: values match; the table lists C. botulinum A&B at 0.93 and the text gives 0.94 with NaCl (0.92 with glycerol); the E. coli row is *enterohaemorrhagic* E. coli (label corrected) |
| NaCl osmotic coefficients for checking Pitzer | Hamer & Wu 1972, reference column in Staples & Nuttall 1977 J Phys Chem Ref Data, Table 2 | 10 points, max |Δφ| 0.0033 |
| Pitzer NaCl parameters β0 0.0765, β1 0.2664, Cφ 0.00127, Aφ 0.3915 | Pitzer & Mayorga 1973 (standard values) | reproduce Hamer & Wu to <0.005 |
| stinky tofu volatiles (days 1–13), thresholds, descriptors; brine microbes; shelf life 5–13 d; indole/skatole not detected | Foods 2023, 12, 1451, PMC10093793 | concentration and threshold tables (reviewer re-extracted both tables from the Europe PMC XML and checked every value in models.js). **The paper's own OAV table disagrees with its concentration table ÷ threshold** for 1-octen-3-ol (all days), p-cresol (day 7 on), 2-phenylethyl acetate, 2-pentylfuran, decadienal (day 10), butanoic acid day 7 (22 vs 20.5), and for (E)-2-nonenal and (E,E)-2,4-nonadienal it gives OAVs on days where the concentration table has no value; 1-dodecanol has two concentration rows (No. 25, 27; page uses 27); hexanal has a threshold but no concentration row (left out). The page recomputes OAV = concentration ÷ threshold throughout and says so in ch5.limit |
| century egg: NaOH, salt, tea, metal salts, 4–6 weeks; sulfides plug pores; Pb prohibited, Cu/Zn; FeS yolk colour; Maillard white colour; alkali liquefaction | Poultry Sci 2023 review PMC9876998 | as quoted |
| white pH 9.78→11.43 (0–6 d), yolk 6.40→10.28 (0–18 d); ammonia dominant odour | PMC13632092 (4.5% NaOH, 4% NaCl, 0.4% CuSO₄, 25 °C) | as quoted |
| gel visible ~week 2; 4% control partial liquefaction weeks 3–6 | Tseng 2026, PMC13471287 | as quoted |
| NaOH in liquid egg: <0.5% no gel, >1.0% liquefaction, 0.8% optimal | PMC13090318 | as quoted |
| yolk solid outer layer, liquid core | PMC11995058 | as quoted |
| horse-urine story false; lime + soda | https://en.wikipedia.org/wiki/Century_egg | as quoted; reaction is standard chemistry |
| 松花 crystals: Mg(OH)₂ hydrate vs amino-acid salt | 马力等 2001《松花蛋“松花”晶体结构的研究》四川工业学院学报 2001(1):48–50 (FTIR matches Mg(OH)₂; via secondary summaries); 张蕾、沙琼、何静、张洪权 2024, 化学教学 2024(8) (XRD, FTIR, SEM, EDS: crystalline Mg(OH)₂; abstract on fx361.com) | reviewer: both analyses support Mg(OH)₂; no original analysis found for the amino-acid-salt account → page now says "fairly sure, not settled" and names both studies; full texts not opened |
| Na⁺ 1.330, OH⁻ 5.270 ×10⁻⁹ m²/s → Nernst–Hartley 2.12×10⁻⁹ | aqion (phreeqc.dat values) | temperature not stated on the page (assumed 25 °C) |
| sodium in fermented bean curd, n = 81: median 3500 mg/100 g, IQR 3000–3851, range 2080–5859 | PMC10609505 | as quoted |
| WHO adult sodium < 2000 mg/day | WHO sodium fact sheet | as quoted |
| grey sufu amines 396.80 mg/kg, tyramine 297.78; 900 mg/kg proposal; EFSA 50 mg histamine / 600 mg tyramine; ethanol lowers amines | PMC10379170 | as quoted |
| lead: GB 2762-2017 eggs 0.2 (皮蛋 0.5), beans 0.5; GB 2762-2022 eggs 0.2 no exception, beans 0.3; GB 2762-2025 issued 2025-09, in force 2026-09-02 | foodmate GB 2762 database (2762.foodvip.net and versions) | table rows. Reviewer: official GB 2762-2022 PDF (gdgrain.gd.gov.cn, text extracted) Table 1: 蛋及蛋制品 0.2 with no 皮蛋 exception; 豆类制品(豆浆除外) 0.3; Appendix A puts 腐乳 under 发酵豆制品 ⊂ 豆类制品 and 皮蛋 under 蛋制品; issued 2022-06-30, in force 2023-06-30. GB 2762-2025: foodmate summary (fsc.foodmate.net itemid 726778) and SGS summary: replaces 2022 edition on 2026-09-02; lead changed only for meat dried products, so eggs 0.2 and bean products 0.3 stand. Release date given as 2025-09-02 (SGS) or 2025-09-25 (foodmate); page says only "September 2025". 2017 values not re-checked by reviewer (two secondary sources agree on 皮蛋 0.5→0.2) |
| "无铅" process = no lead compound added, not zero lead; 黄丹粉 (PbO) slowed alkali and kept the white from re-liquefying | industry report (chinabgao.com freereport 70407) and search summaries | reviewer; secondary only, so the page states only the definition and the mechanism already sourced to the Poult Sci 2023 review |
| soy sauce: A. oryzae/sojae koji; brine 17–20%; product 14–18% | https://en.wikipedia.org/wiki/Soy_sauce | as quoted |
| fish sauce: salt 10–30%; endogenous visceral enzymes + halotolerant bacteria | https://en.wikipedia.org/wiki/Fish_sauce; search results incl. hrcak.srce.hr/352224 | enzymes from secondary summaries only |
| natto: B. subtilis var. natto, 40 °C up to 24 h; ammonia if over-fermented | https://en.wikipedia.org/wiki/Nattō | as quoted |
| cheese: rennet, starters, milk enzymes; salt controls proteolysis | https://en.wikipedia.org/wiki/Cheese_ripening | as quoted |
| ham: endogenous endopeptidases (cathepsins) then exopeptidases; salt inhibits | Jinhua ham review PMC10094101 and Toldrá reviews (search summaries) | general mechanism |

## Terms at first appearance
腐乳/酱豆腐/红方/白方/青方 ch1; 内切酶/外切酶 ch2; 等效鲜味浓度 ch3; 水分活度 ch4; 气味活度值 ch5; 碱液化 ch6; 味觉活度值 ch7; 香气提取物稀释分析 ch8; 生物胺 ch9.

## Checked / not checked
Checked: every prose number derives from models.js (604 checks); endo-only ODE equals Montroll–Simha; Crank volume
mean equals the analytic total uptake; Pitzer vs Hamer & Wu; every live sentence branch evaluated at control extremes.
Not checked / unverifiable: Yamaguchi 1971 original; 松花 crystal composition; sufu nucleotide content (none found);
sufu odorant concentrations/thresholds; the temperature of the aqion diffusion values; the moisture of Han's sufu
(so product-salt ↔ brine-salt is not converted); exact enzymology of fish sauce; egg density and yolk radius ratio.

### Independent review (2026-11-12)
Verified-By: Claude Code (claude-opus-5-5) — independent reviewer, did not build the page. Scope: first read in Chinese
in a browser at 1280 before reading code or this BRIEF; every prose number traced to models.js / tests; each model
re-derived independently; 12 sources opened; English copy read in the browser at 1280/390/320 and corrected; tests
extended to English. Changes are in the working tree, uncommitted.

**Checked, with what:**
- Montroll–Simha: Monte Carlo with an independent RNG, N = 200, p = 0.5 → 0.2524 vs formula 0.2525.
- Fragmentation + end trimming: exact Gillespie simulation of single chains → day-80 free share 0.249 (both), 0.0173
  (exo) vs ODE 0.250 / 0.0175; endo-only ODE = Montroll–Simha with p = 1 − e^(−kE t) to 1e-12.
- Pitzer NaCl: a_w against Robinson & Stokes tabulated values at 1–6 mol/kg, agreement to ≤ 0.0004.
- Crank eq. 6.18: explicit finite-difference solution in a sphere, 70 g egg, day 6 white mean 0.803 vs series 0.802.
- Yamaguchi EUC: equation, constant 1218 and units (g/100 g in, g MSG/100 g out) in two independent secondary sources
  (PMC11577124, PMC13676911); pork 0.010 + 1218 × 0.010 × 0.230 = 2.81 by hand.
- Minimum a_w table against the IFT/FDA report itself (see Sources).
- Stinky-tofu concentrations and thresholds re-extracted from the paper; all 28 usable compounds now in the model.
- Gao 2022 (yolk only) re-opened; Zhao 2014 (white) found; GB 2762-2022 table read in the official PDF.
- Tuning sensitivity: ch2 multiple 4.4–7.4× when either rate is halved or doubled (now stated and pinned);
  ch6 crossing day scales as 1/D (14.6 d at D/2, now stated and pinned); "4% just right" now said to be the tuning.

**Changed by the reviewer:** ch7 law, p1, p2, p4, table row and limit (yolk vs white; claim conditioned to "on the
data available"); ch9.sum to match; ch1.p4 ("≈50% of bonds cut" holds only for random cutting); ch2.p3 (multiple
depends on tuning); ch3.p3 ("一半的原因" → "probably one reason"; 47% is the formula's shape); ch6.p4 (κ is circular
with "4% just right"; D-sensitivity); ch6.p5 and ch9.u1 (pine flower: both positions with sources, "fairly sure, not
settled"); ch9.na (at 8% brine 6 of 9 organisms already grow; the old sentence implied none); ch9.lead (bean-product
change belongs to 2022, not 2025; "无铅" defined; litharge mechanism; 2022 in-force date); ch4 E. coli label;
ch5 data 14 → 28 compounds, readout "of 28", legend "fruity, sweet"; IFT/FDA document title in both footers; ch6 live
sentence day now rounds like its tile. English: ~30 strings (names and pinyin for sufu kinds, "grey sufu"
throughout, "the mould is there to do a job", mode sentence order, singular-safe counts "{n}" instead of "{n} kinds",
"alkali damage" / "alkali-induced liquefaction", natto row, lower-case compound names, common names for three long
ones, doc.desc = REGISTRY desc); full-width colon in stacked-table labels in English (CSS); odour-chart labels
shrink to fit at 320 px; "not detected" drawn above the dilution line; odour canvas 440 → 640 px (600 on phones).

**Not checked by the reviewer:** Yamaguchi 1971 original (paywalled); full texts of Zhao 2014, 马力 2001, 张蕾 2024
(abstracts/summaries only); free glutamate in century-egg white (no data found); Han 2003/2004 numbers, PMC8358361,
the sodium survey, biogenic-amine paper, Beauchamp, umamiinfo pork values, PMC13632092/13471287/13090318 (egg pH and
gel papers) were not re-opened (builder's citations taken as given); GB 2762-2017 values (secondary only); the
fish-sauce, natto, cheese and ham rows of the family table; screen-reader pass with a real screen reader.
