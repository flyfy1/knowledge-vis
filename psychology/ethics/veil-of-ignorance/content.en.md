---
lang: en
---

::: strings
pageTitle: The Veil of Ignorance · Choosing a Society Before You Know Who You Will Be
back: ← Knowledge index
navLabel: Veil of ignorance steps
tagline: Suppose you must pick a society first and only then learn which position in it you will occupy. How do you choose? Rawls and Harsanyi both start from this picture yet reach different rules: one looks at the worst position, the other at the average.
nav0: 0 Choose, then draw
nav1: 1 Average rule
nav2: 2 Maximin
nav3: 3 Risk attitude
nav4: 4 Cost of levelling
nav5: 5 Wrap-up
foot: visual.integ.life · The Veil of Ignorance
posLabel: position
:::

## Choose a society, then lift the veil to see who you are {#step0 h2=s0t}

Step 0 · A thought experiment {#s0k .step-kicker i18n=text}

This step asks: what kind of problem does choosing become when you do not know who you will be? The philosopher John Rawls (*A Theory of Justice*, 1971) imagines a **veil of ignorance**: whoever chooses the rules of society does not know their class, wealth or social status. Each of the three societies below has five equally sized **positions**; bar height is that position’s **well-being score** (an abstract unit invented for this page, not money). Pick a society, then press “Lift the veil” to land in a random position. {#s0e .explain}

::: html step0-1
choose: I choose
socA: A · Everyone equal
socB: B · High growth, wide gaps
socC: C · Growth with a floor
lift: Lift the veil
resetDraws: Clear record
:::

Each draw adds a dot under that position (history is kept; switching to another society and back keeps each society’s record, and “Clear record” clears only the current one). After a few draws you will feel two thoughts at once: “on average it is fine” and “what if I end up at the bottom?”. The next two steps turn each thought into a rule. {#s0hint .hint i18n=text}

::: strings
soc: Society
again: Again
s0pick: Pick a society first.
s0readout: You chose {soc} and landed in position {pos} (counting from the worst), score {v}. Draws so far: {n}, average {avg}, worst draw {worst}.
s0ready: You chose {soc}. Press “Lift the veil” to see where you land.
:::

## The average rule: you could be anyone, so take the average {#step1 h2=s1t}

Step 1 · The first rule {#s1k .step-kicker i18n=text}

This step asks: if every position is equally likely to be yours, how should you compare? The economist John Harsanyi (in a 1975 critique of Rawls) argued that under complete ignorance you should assume an **equal probability** of occupying each position, and so choose the society with the highest **average well-being** (<a class="xlink" href="../../../probability/basics/expected-value/#step0">→ Expected value, step 0: what a random game pays “on average”</a>). By this rule B (average 45) wins. The chart shows how the **running average** (sum of scores drawn ÷ number of draws) approaches that average when you draw repeatedly from your chosen society. {#s1e .explain}

::: html step1-1
draw100: Draw 100 more
:::

What to do: choose B and press “Draw 100 more” a few times; watch the line settle onto the dashed average. Then switch to A or C. The average rule looks only at the dashed line, not at how low some of the individual draws were. {#s1hint .hint i18n=text}

::: strings
s1readout: {soc}: average {mean} · draws: {n}, running average {run}
:::

## Maximin: secure the worst position first {#step2 h2=s2t}

Step 2 · The second rule {#s2k .step-kicker i18n=text}

This step asks: if the choice is made once and cannot be undone, should you still look only at the average? Rawls argued that the choice behind the veil fixes your whole life prospects and cannot be repeated, so the parties should use the **maximin rule**: compare the well-being of each society’s **worst position** and pick the society whose worst position is best. He gives three conditions for this: there is no basis, or only a very insecure one, for estimating the probability of landing in each position; the maximin choice is itself an acceptable outcome one can live with, so gains above it matter relatively little; and the other options have outcomes one could not accept and live with. Rawls later said the first condition plays a minor role and the second and third are the crucial ones. By this rule A (worst 30) wins; B’s worst is only 10. {#s2e .explain}

::: html step2-1
:::

Red boxes mark each society’s worst position. Facing the same three charts, the two rules pick different societies: the disagreement is not about the data but about how to treat the chance of ending up at the bottom. {#s2hint .hint i18n=text}

::: strings
s2readout: Worst position: A {a} · B {b} · C {c} → maximin picks {win}; the average rule picks {avgWin}
:::

## Risk attitude η: from “only the average” to “only the worst” {#step3 h2=s3t}

Step 3 · Connect the two {#s3k .step-kicker i18n=text}

This step asks: is there middle ground between the two rules? Here is a **teaching knob** (not Rawls’s or Harsanyi’s own formulation): the **degree of risk aversion η** (eta). For each society compute a **certainty equivalent** — the sure score you would accept in place of landing in a random position. At η = 0 it equals the average; the larger η, the more weight the low positions get; for very large η it approaches the worst position. It is the same attitude that makes people buy insurance priced above the expected loss (<a class="xlink" href="../../../probability/basics/expected-value/#step4">→ Expected value, step 4</a>). {#s3e .explain}

::: html step3-1
ceAxis: certainty equivalent
eta: Risk aversion η
:::

What to do: drag η slowly from 0 to 8 and watch the vertical line sweep the three curves on the right: B is highest at first, C after about η = 0.8, A after about η = 3.5. C, “growth with a floor”, wins only in the middle ground. {#s3hint .hint i18n=text}

::: strings
s3readout: η = {eta} · certainty equivalent: A {a} · B {b} · C {c} → picks {win}
etaAxis: η
:::

## More redistribution helps the bottom — but the pie may shrink {#step4 h2=s4t}

Step 4 · When levelling has a cost {#s4k .step-kicker i18n=text}

This step asks: starting from B, how much redistribution would each rule choose? Let the **redistribution share t** be the fraction of each position’s score that is pooled and shared equally. Suppose levelling shrinks the total by the factor (1 − k·t²); the **efficiency loss k** is a teaching parameter invented for this page, not taken from any data. The chart shows three lines against t: the average, the worst position, and the certainty equivalent (the sure score you would accept instead of a random position) at the current η (risk aversion: the larger, the more the low positions count); dots mark each line’s best t. The average rule picks the t with the highest average; maximin picks the t whose worst position is best. {#s4e .explain}

::: html step4-1
bars: the 5 positions at the current t
tLabel: Redistribution share t
kLabel: Efficiency loss k (teaching assumption)
eta4: Risk aversion η
:::

What to do: first set k to 0 (levelling is free) — maximin pushes all the way to t = 1, while the average rule does not care. Then raise k and watch maximin’s best t stop in the middle: levelling further would hurt even the bottom, because the pie shrinks. {#s4hint .hint i18n=text}

::: strings
s4readout: t = {t}: average {mean} · worst {min} · certainty equivalent {ce}　|　best t: average rule {tAvg} · maximin {tMin} · at η = {eta}: {tEta}
anyT: any t (all tie)
tieMark: " (tie at display precision)"
mean: average
worst: worst
ceShort: cert. equiv.
tAxis: redistribution share t
:::

## One veil, two kinds of caution {#step5 h2=s5t}

Wrap-up {#s5k .step-kicker i18n=text}

::: html step5-1
s5fin: The veil of ignorance turns “is this good for me?” into “is this good for whichever position I might hold?”. The **average rule** treats every position as equally likely and averages; the **maximin rule** holds that this choice cannot be repeated and protects the worst position first. Their disagreement can be read as different attitudes to risk, but Rawls himself stresses the special features of the choice situation, not just a temperament that fears risk.
formula: average rule: max mean(x)　maximin: max min(x)　certainty equivalent (teaching): [mean(x^(1−η))]^(1/(1−η))
boundary: Model limits: each society has only five positions and the well-being scores are invented abstract units; risk aversion η and efficiency loss k are this page’s teaching parameters, not Rawls’s or Harsanyi’s original statements and not estimates of any real society. The page makes no claim about how real people would choose behind the veil.
quizPrompt: Which sentence describes the disagreement between the two rules accurately?
quizA: Harsanyi thinks the worst position does not matter; Rawls thinks the average does not matter.
quizB: Harsanyi assumes each position is equally likely and so averages; Rawls holds that a one-off, life-shaping choice, where the other options could turn out unacceptably bad, should secure the worst position first.
quizC: They used different data, so they reached different conclusions.
check: Check
lk1: ↗ Ethics & decisions, step 1: keep expected benefit and uncertainty separate
lk2: ↗ Ethics & decisions, step 2: a better outcome does not erase coerced harm
lk3: ↗ Expected value, step 4: why people pay premiums above the expected loss
lk4: ↗ Risk pooling, step 1: what happens to the average loss when many people pool
:::

::: strings
correct: Right: the disagreement is about how to treat uncertainty, not about the data.
wrong: Look at step 2 again: why do the two rules pick differently from the same three charts?
:::
