# Task: 酱豆腐为什么好吃 (first essay of the food section)

Requested by Yangyu on 2026-11-12: "加一篇文章，详细讲一讲为什么酱豆腐这些东西会觉得好吃。酱豆腐还有松花蛋，
如果它们是同样的原理，可能是一个食物的 session。我们可以先以这篇文章作为这个 session 的开始。"

- Directory: `food/flavor/why-fermented-tofu-tastes-good/` (new category `food`, new subtopic `flavor`).
- Registrar names, to put in REGISTRY.json and the report: category `food` = 饮食与风味 / Food & Flavor;
  subtopic `flavor` = 味道从哪来 / Where Flavor Comes From. Stage: senior.
- Port: 18893. Scratch: `/tmp/agent-tasks/essays/why-fermented-tofu-tastes-good/`.
- Briefs to follow: `specs/essay-briefs/BRIEF-BATCH3.md` (and through it STANDARD.md, BRIEF-COMMON.md, all
  under `specs/essay-briefs/`, not `/tmp`). From `BRIEF-DEEP.md` take only the "models must be the real thing
  at small scale, with a named source" rule. No frontier chapter; instead a short closing chapter on what is
  still unsettled.

## The one question

豆腐本身几乎没有味道。让它长霉、加盐、放几个月，为什么反而变好吃了？松花蛋里没有任何微生物，为什么也走到了
差不多的地方？

The reader must leave able to answer the owner's own question: are 酱豆腐 and 松花蛋 the same principle? The
planning answer, to be checked against sources and corrected if wrong: half the same. Both turn large,
tasteless protein into small molecules the tongue and nose can detect. The tool differs: mould enzymes in one,
strong alkali in the other, and the alkali also sets the egg into a gel, which has no counterpart in the tofu.
Say this plainly, and say where the analogy stops.

## Starting chapter list (reorder, merge or drop; report what changed)

1. **大分子没有味道.** Taste receptors bind small molecules; an intact protein does not fit. Free glutamate vs
   glutamate locked in a chain. Model: a chain the reader cuts; count what becomes detectable.
2. **霉是来干活的.** Mucor / Actinomucor on the tofu (毛坯), the proteases and lipases it secretes. Model:
   chain scission statistics. Degree of hydrolysis vs the share of free amino acids and short peptides, endo-
   vs exo-peptidase; this should show why it takes months and not days.
3. **鲜味.** Glutamate and the T1R1/T1R3 receptor; the synergy with 5'-nucleotides (Yamaguchi's published
   mixture equation). Model: the synergy surface with real thresholds.
4. **盐决定谁能活.** Water activity of brine, the minimum a_w for spoilage and pathogenic organisms vs what the
   product sits at, and the cost: salt also slows the enzymes. Model: salt % → a_w → who grows, and the
   ripening rate. Alcohol in the brine belongs here too.
5. **香气.** Lipase → free fatty acids; with the alcohol from the rice wine → esters; sulfur compounds. Odour
   activity value (concentration ÷ threshold) as the model: why a trace compound can dominate.
6. **口感.** Why it spreads like cream cheese: the protein network is cut. Merge into ch.2 if it has no model
   of its own.
7. **松花蛋：不用霉，用碱.** Lime + soda ash → NaOH; diffusion through shell and membrane (Fick, √t);
   denaturation and the gel; why it can re-liquefy if left too long; alkaline hydrolysis, ammonia, H₂S; the
   colours (iron sulfide in the yolk, browning in the white); the pine-flower crystals, including the fact
   that their composition has been argued about. Model: hydroxide diffusing into a sphere, with the gel front.
8. **同一个原理吗.** The two side by side, then the family: soy sauce, cheese, dry-cured ham, fish sauce, natto,
   stinky tofu, as a table of "who does the cutting / what gets cut / what keeps spoilage out". This is the
   chapter that makes it the opening of a section.
9. **为什么有人觉得臭.** Ammonia, sulfur, amines; learned preference; umami as a protein signal. Keep claims
   about why humans like it conditioned: much of it is hypothesis.
10. **要注意的和还不清楚的.** Sodium, biogenic amines, lead in century eggs (the old lead-oxide process, the
    current limits and the "无铅" process: cite the actual GB standard). Mechanisms only, no dietary advice.

## Things to get right

- 酱豆腐 is the northern name for red 腐乳 (红方); say once how 腐乳 / 酱豆腐 / 红方 / 白方 / 青方（臭豆腐乳）
  relate, and what the red is (红曲, Monascus).
- Do not call 松花蛋 "fermented": it is not. Do not repeat the horse-urine story except to say it is false.
- Every figure (free glutamate content, pH, salt %, a_w limits, thresholds, diffusion coefficients, times)
  needs a source opened by you, given as a range where the literature gives a range. Food-science numbers
  vary a lot between products; say so.
- Existing site pages to link instead of re-teaching (check `pages.config.js` for exact paths and titles):
  chemistry/solutions ph-scale, acid-base-equilibrium, dissolution-saturation; chemistry/reactions
  reaction-rates, activation-energy; anything on diffusion or enzymes in biology/cells.
- REGISTRY aliases should include what people actually type: 腐乳为什么好吃, 酱豆腐, 豆腐乳, 臭豆腐为什么臭,
  松花蛋为什么是黑的, 皮蛋有铅吗, 松花是什么, 鲜味是什么, 味精, why is century egg black, what is umami, and so on.
