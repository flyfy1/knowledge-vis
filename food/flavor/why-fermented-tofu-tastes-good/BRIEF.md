# Why fermented tofu tastes good (酱豆腐为什么好吃)

Built-By: Claude Code (claude-opus-5-5), 2026-11-12, from scratch
Verified-By: self-check (node model test, browser test zh 1280/390/320, canvas sweep, screenshots, read-through); independent review pending
category: `food` 饮食与风味 / Food & Flavor (new) · subtopic: `flavor` 味道从哪来 / Where Flavor Comes From (new) · stage: senior
Format: long interactive essay, Chinese copy only (`copy.en.js` to be written by a later translation step)
Files: index.html, copy.zh.js, models.js (UMD, `window.TofuModels`), app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs

## The one question
豆腐本身几乎没有味道。让它长霉、加盐、放几个月，为什么反而变好吃了？松花蛋里没有任何微生物，为什么也走到了差不多的地方？是不是同一个原理？

Answer on the page (ch7): only half the same. Both break down the protein's structure and both rely on a hostile
environment to keep spoilage out. The half that differs decides the taste: fermented tofu's enzymes cut protein into
free amino acids (free Glu 4.3–5.9× threshold); the alkali in century egg only cuts as far as peptides, and free
amino acids and IMP in the yolk *fall* during pickling (Gao 2022). The egg's appeal is gel texture and aroma
(ammonia), and its umami is mainly succinic acid that fresh yolk already has.
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
| 5 | OAV bars by day | Rothe & Thomas 1963 odour activity value | no |
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
| EUC formula, constant 1218, relative umami Asp 0.077, GMP 2.3, AMP 0.18 | PMC11577124 methods (citing Yang 2022, after Yamaguchi) | formula; Yamaguchi 1971 original **not opened** |
| thresholds Glu 30, IMP 25, GMP 12.5, AMP 50, succinic 10.6 mg/100 g; yolk Glu 17.45→13.14; IMP 0.0094→0.0018; succinic 278.42→280.87 (35 d) | Gao et al. 2022 Front Nutr, PMC9549109 | tables 1–2 |
| MSG alone unpalatable, improves foods, infants | Beauchamp 2009 Am J Clin Nutr | as quoted |
| flavour–nutrient learning | Touzani, Bodnar & Sclafani 2010 PMC2956077; Ackroff 2008 PMC2572688; Myers & Sclafani 2006 | general finding |
| minimum a_w (Campylobacter 0.98 … S. aureus growth 0.83, toxin 0.88; C. botulinum A/B 0.94 with NaCl) | FDA/IFT "Safe Practices for Food Processes", ch. 3, Table 3-2 (from ICMSF 1996), PDF copy hosted by MSU | table values |
| NaCl osmotic coefficients for checking Pitzer | Hamer & Wu 1972, reference column in Staples & Nuttall 1977 J Phys Chem Ref Data, Table 2 | 10 points, max |Δφ| 0.0033 |
| Pitzer NaCl parameters β0 0.0765, β1 0.2664, Cφ 0.00127, Aφ 0.3915 | Pitzer & Mayorga 1973 (standard values) | reproduce Hamer & Wu to <0.005 |
| stinky tofu volatiles (days 1–13), thresholds, descriptors; brine microbes; shelf life 5–13 d; indole/skatole not detected | Foods 2023, 12, 1451, PMC10093793 | concentration and threshold tables; the paper's own OAV table disagrees with conc/threshold for 1-octen-3-ol, late p-cresol, 2-phenylethyl acetate, 2-pentylfuran and day-10 decadienal; page uses conc ÷ threshold |
| century egg: NaOH, salt, tea, metal salts, 4–6 weeks; sulfides plug pores; Pb prohibited, Cu/Zn; FeS yolk colour; Maillard white colour; alkali liquefaction | Poultry Sci 2023 review PMC9876998 | as quoted |
| white pH 9.78→11.43 (0–6 d), yolk 6.40→10.28 (0–18 d); ammonia dominant odour | PMC13632092 (4.5% NaOH, 4% NaCl, 0.4% CuSO₄, 25 °C) | as quoted |
| gel visible ~week 2; 4% control partial liquefaction weeks 3–6 | Tseng 2026, PMC13471287 | as quoted |
| NaOH in liquid egg: <0.5% no gel, >1.0% liquefaction, 0.8% optimal | PMC13090318 | as quoted |
| yolk solid outer layer, liquid core | PMC11995058 | as quoted |
| horse-urine story false; lime + soda | https://en.wikipedia.org/wiki/Century_egg | as quoted; reaction is standard chemistry |
| 松花 crystals: Mg(OH)₂ hydrate vs amino-acid salt | thepaper.cn article by 刘少伟, citing 马力等 2001 | **original not opened → marked contested on page** |
| Na⁺ 1.330, OH⁻ 5.270 ×10⁻⁹ m²/s → Nernst–Hartley 2.12×10⁻⁹ | aqion (phreeqc.dat values) | temperature not stated on the page (assumed 25 °C) |
| sodium in fermented bean curd, n = 81: median 3500 mg/100 g, IQR 3000–3851, range 2080–5859 | PMC10609505 | as quoted |
| WHO adult sodium < 2000 mg/day | WHO sodium fact sheet | as quoted |
| grey sufu amines 396.80 mg/kg, tyramine 297.78; 900 mg/kg proposal; EFSA 50 mg histamine / 600 mg tyramine; ethanol lowers amines | PMC10379170 | as quoted |
| lead: GB 2762-2017 eggs 0.2 (皮蛋 0.5), beans 0.5; GB 2762-2022 eggs 0.2 no exception, beans 0.3; GB 2762-2025 issued 2025-09-02, in force 2026-09-02 | foodmate GB 2762 database (2762.foodvip.net and versions) | table rows |
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
