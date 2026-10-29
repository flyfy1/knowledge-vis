# BRIEF · natural-selection 自然选择

category `biology`, stage `senior`. Built-By: Claude Sonnet 5.5 via Mini Claude Code (batch b3); template: cell-structure skeleton + shared b3 scaffold; Verified-By: self-check only (node probe: hand recursion value, logit law, closed-form generations, stochastic mean vs theory, Wright–Fisher variance vs formula, lag between bark and share; headless-Chrome sweep; screenshot check); no independent review. Dedup: genetics-probability is Punnett/segregation and population-ecology is r–K growth; neither covers selection dynamics.

## Steps
**0 Who gets eaten.** Knows: two heritable colours. Question: how does the environment choose survivors? Input bark b; seek survival w_L = 1 − 0.5b, w_D = 1 − 0.5(1−b) vs measured. Controls: Hunt (random survival of 60 moths), Reset restores moths; b change keeps the current moths but re-draws background. Holds: k = 0.5.
**1 Generations.** Knows: survival differences. Question: how do they accumulate? Input b, p₀; seek p′ = p w_D/(p w_D + (1−p) w_L). Controls: Play (one generation per 0.3 s, up to 60), Reset; b or p₀ change resets. Holds: N = 200, no mutation.
**2 How strong.** Knows: recursion. Question: what sets the speed? Input b, k; seek r = w_D/w_L and generations = Δlogit / ln r. Controls: grey reference curve (b = 0.55) vs orange current. Holds: p₀ = 1%.
**3 Changing world.** Knows: speed depends on r. Question: how does the population follow a changing environment? Input generation, k; seek bark crossing of 0.5 vs share crossing of 50%. Controls: generation scrubs a dot; k changes lag. Holds: sketch bark curve, 0.1% two-way mutation, p₀ = 2%.
**4 Chance vs selection.** Knows: sampling. Question: can chance change the ratio? Input N = 10^x; seek fixed count of 5 shown populations and sd over 40 runs vs √(p(1−p)(1−(1−1/N)^t)). Controls: N slider reruns, "5 new populations" reseeds. Holds: Wright–Fisher, p₀ = 0.5.
**5 Recap.** Quiz: dark moths survive more and pass on colour. Links: dna-replication#step4, genetics-probability#step0, population-ecology#step1.

## First-appearance terms
Heritable variation, predation, survival probability w (0); generation, fitness (1); advantage ratio, log-odds (2); lag (3); genetic drift, fixation, Wright–Fisher (4).

## Simulation vs reality
Two colours, haploid single gene, constant N; peppered-moth literature has been debated; bark curve is a sketch; step 3 adds mutation, steps 1–2 do not (stated in text).
