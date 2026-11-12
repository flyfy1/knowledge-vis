# Task: 酱油 (second essay of the food section)

Requested by Yangyu on 2026-11-12: "接着写食物分区的下一篇，酱油". The first essay of the section is
`food/flavor/why-fermented-tofu-tastes-good/` (酱豆腐为什么好吃), live since the same day.

- Directory: `food/flavor/how-soy-sauce-gets-its-flavor/` (category `food` 饮食与风味 / Food & Flavor and
  subtopic `flavor` 味道从哪来 / Where Flavor Comes From already exist). Stage: senior.
- Port: 18895. Scratch: `/tmp/agent-tasks/essays/how-soy-sauce-gets-its-flavor/`.
- Briefs to follow: `specs/essay-briefs/BRIEF-BATCH3.md` (and through it STANDARD.md, BRIEF-COMMON.md, all
  under `specs/essay-briefs/`, not `/tmp`). From `BRIEF-DEEP.md` take only the rule that models are the real
  thing at small scale with a named source. No frontier chapter; a short closing chapter on what is unsettled.
- Structural model: the tofu essay, every file. Copy its conventions (copy keys, `ESSAY_BASE_URL`, the
  language-aware formatting, and the way its two tests exempt the site's bilingual `page-provenance` label,
  which a registrar adds to the hero afterwards).

## The one question

黄豆、小麦、盐、水，四样东西单独都不鲜、不香、不黑。放在一起半年，为什么成了又鲜又香、颜色深褐的酱油？
而同样叫「酱油」的东西，为什么有的要酿半年，有的几天就能做出来？

## Do not repeat the tofu essay

That essay already teaches, with models: why intact protein has no taste and random chain scission (#ch1),
endo- and exo-peptidases (#ch2), glutamate, the umami receptor and Yamaguchi's synergy equation (#ch3), salt,
water activity and minimum a_w for pathogens (#ch4), odour activity values (#ch5), and it has a one-row
summary of soy sauce in its family table (#ch7). Link to those chapters in one line where this essay needs
them and spend the space on what is new in soy sauce. If a chapter here would be the same model with
different numbers, cut it to a paragraph and a link.

## What is new here (starting chapter list; reorder, merge or drop, and report what changed)

1. **四样原料，三种微生物，三段时间.** The whole process on one timeline: koji (2–3 days), moromi in brine
   (months), pressing and heating. This is the map the other chapters hang on.
2. **制曲：先养一批酶.** Aspergillus oryzae / sojae on steamed soybean and roasted wheat, solid-state culture.
   Why the mould is grown first and then killed by the brine: it is there to make enzymes, not to live in the
   product. Growth and enzyme production against temperature and moisture; the heat the bed makes and why
   koji must be turned. Model: a published solid-state growth model (logistic growth with a heat balance, or
   cardinal-temperature growth), with enzyme yield peaking at a different temperature from growth.
3. **为什么要加小麦.** Soy sauce differs from sufu in having starch. Amylases → sugars → food for the next
   two organisms and one half of the browning reaction. Tamari (little wheat) vs koikuchi vs Chinese styles
   as the same model with a different soybean : wheat ratio. Model: the mass balance from the ratio to total
   nitrogen, reducing sugar and what they allow downstream.
4. **盐水里的接力.** In ~17–19% salt the mould dies; Tetragenococcus halophilus grows first and makes lactic
   acid; when the pH has fallen far enough Zygosaccharomyces rouxii takes over and makes ethanol and aroma
   precursors; late yeasts (Candida) follow. Model: two populations with published pH- and salt-dependent
   growth (Monod or cardinal-pH), so that the reader sees the hand-over happen and sees it fail when salt or
   starting pH is wrong. This is the chapter that should be the centrepiece.
5. **酱油为什么是黑的.** The Maillard reaction between the amino acids from ch2 and the sugars from ch3;
   melanoidins; Arrhenius temperature dependence; why the bottle darkens after opening (oxidative browning);
   why 老抽 is darker (caramel colour, a different chemistry) and 生抽 is not "raw". Model: browning kinetics
   against temperature and time from a published rate law and activation energy.
6. **酱油的香.** What the yeast adds that sufu lacks: HEMF and related furanones, 4-ethylguaiacol, methionol,
   and why pasteurisation (火入れ) changes the aroma. Use odour activity values by linking to the tofu essay's
   #ch5; here show only what is specific, for example the heating step.
7. **瓶子上的数字：氨基酸态氮.** The grade number on a Chinese bottle: what amino-acid nitrogen measures
   (formol titration), what it misses, the grade thresholds in the current GB standard, total nitrogen in the
   Japanese JAS grades, and how the number can be raised without brewing longer (added MSG, hydrolysed
   protein). Model: from degree of hydrolysis to the label number, and what adding glutamate does to it.
8. **酿半年和做几天.** High-salt liquid-state (高盐稀态) vs low-salt solid-state (低盐固态) vs acid-hydrolysed
   vegetable protein and 配制酱油: what each skips from chapters 2–6 and what that costs in flavour;
   chloropropanols (3-MCPD) from acid hydrolysis and the limits; what the current Chinese standards allow to
   be called 酱油 (check GB 2717 and GB/T 18186 in their current editions and state the dates).
9. **咸，但不止是咸.** Around 16–18 g salt per 100 mL, yet it does not taste like brine of that strength:
   what acid, umami and sugars do to perceived saltiness, and how reduced-salt soy sauce is made. Keep this
   conditioned; the sensory literature is mixed. Sodium per tablespoon as a plain figure, no dietary advice.
10. **还不清楚的.** Kokumi peptides, which organisms matter in traditional open-vat brewing, and whatever the
    sources show is still argued about.

## Things to get right

- Every figure (salt %, pH trajectory, days, temperatures, total and amino nitrogen, glutamate content,
  activation energies, growth limits of the organisms, 3-MCPD limits, grade thresholds) needs a source opened
  by you, given as a range where the literature gives one. Styles differ a lot (Japanese koikuchi, Cantonese
  生抽, northern 低盐固态, Indonesian kecap); say which style each number belongs to.
- Standards: quote the actual clause and edition, and say what was in force as of November 2026.
- Do not claim one style is better or healthier. No dietary advice; mechanisms and standards only.
- Tuned parameters are labelled as tuned next to the model, and the page says how far the conclusion moves if
  the parameter is halved or doubled (the tofu essay's reviewer had to add this; do it from the start).
- Do not generalise from one measured fraction, product or study to "soy sauce" as a whole (the tofu essay's
  first draft did this with egg-yolk data).
- Existing site pages to link instead of re-teaching (check `pages.config.js` for exact paths and titles):
  the tofu essay's chapters; chemistry/solutions ph-scale, acid-base-equilibrium, titration-curves (for
  formol titration); chemistry/reactions reaction-rates, activation-energy; biology/cells enzymes and
  anything on fermentation or respiration; biology/ecology pages on competition or succession if they fit.
- REGISTRY aliases should be what people type: 酱油是怎么做的, 酱油为什么是黑的, 生抽和老抽的区别, 氨基酸态氮是什么,
  酿造酱油和配制酱油, 酱油开封后为什么变黑, 酱油要不要放冰箱, 酱油为什么那么咸, 米曲霉, 酱油有味精吗, how is soy sauce
  made, light vs dark soy sauce, why is soy sauce brown, what is koji, tamari vs soy sauce, and so on. Do not
  take words the tofu essay already owns (鲜味, 味精, umami, MSG, 水分活度, water activity): one word, one owner.
