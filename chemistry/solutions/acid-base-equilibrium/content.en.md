---
lang: en
---

::: strings
pageTitle: Acid–Base Equilibrium · Splitting and Rejoining Never Stop
back: ← Knowledge Index
navLabel: Acid–base equilibrium steps
tagline: Pour a weak acid into water and only some of its HA molecules split into H⁺ and A⁻. What share splits? What sets that share, and how does it move when you add water, add a salt, or switch acids? In six steps you first watch 200 molecules split and rejoin, then use one constant, Ka, to calculate the share and the pH.
nav0: 0 Both directions
nav1: 1 Acid strength
nav2: 2 Dilution
nav3: 3 Common ion
nav4: 4 End point vs speed
nav5: 5 Wrap-up
foot: Written independently by Claude Code (claude-opus-5-5).
:::

## A weak-acid solution looks perfectly still. Have the molecules actually stopped? {#step0 h2=s0t}

Step 0 · Both directions {#s0k .step-kicker i18n=text}

The question here: once a weak acid dissolves, why does the share of split molecules settle at one value? A **weak acid** is one where only some molecules split in water. We write HA ⇌ H⁺ + A⁻: H⁺ is a hydrogen ion, A⁻ is what is left of HA after it loses H⁺ (its **conjugate base**), and the double arrow says both splitting and rejoining go on. Below are 200 acid molecules at a total concentration c = 0.10 mol/L, so each molecule stands for 0.0005 mol/L. In every short interval, each intact HA has a fixed chance of splitting (the **forward** direction); each H⁺ has a chance of meeting an A⁻ and rejoining that grows with the A⁻ concentration (the **reverse** direction). The more molecules have split, the more often rejoining happens, until both directions run at the same number of events per second. The count of split molecules then stops changing, yet splitting and rejoining never stop: that is a **dynamic equilibrium** (<a class="xlink" href="../../../chemistry/reactions/chemical-equilibrium/#step0">→ Chemical equilibrium, step 0: why equilibrium is dynamic</a>). The **split share α** is the number of split molecules divided by the total. To keep things visible, this acid splits more than most (it behaves like chlorous acid, HClO₂): about a quarter of the molecules are split at equilibrium. {#s0e .explain}

::: html step0-1
lgIntact: Intact HA
lgSplit: Split: A⁻ (green ring) + H⁺ (orange dot)
lgFlashF: Orange flash = just split
lgFlashR: Cyan flash = just rejoined
lgAlpha: Split share α
lgTheory: α from the equilibrium equation
lgFwd: Forward: splits per second
lgRev: Reverse: rejoins per second
restartIntact: Restart with every molecule intact
restartSplit: Restart with every molecule split
:::

What to watch: press “Restart with every molecule intact”. In the split-share chart the green line climbs from 0; in the events chart the orange line (splits) falls from high up while the cyan line (rejoins) rises from 0. Where they meet, the green line flattens. Then press “Restart with every molecule split”: the green line drops from 100% and settles near the same white dashed line, so the end point does not depend on the start. Once it is flat, the grid keeps flashing. Time is slowed down for teaching: in a real solution splitting and rejoining are far faster and equilibrium is reached almost at once, but slowing down does not change the equilibrium share (step 4 checks this). {#s0hint .hint i18n=text}

::: strings
c0grid: 200 acid molecules (one per cell)
c0alpha: Split share α (%) · x-axis: time (s)
c0rate: Events per second (last 2 s) · x-axis: time (s)
pause: Pause
resume: Resume
advance: Advance 5 s
s0readout: t = {t} s · split now: {n}/{N} (α = {alpha}) · forward {fwd}/s, reverse {rev}/s · equilibrium equation: α = {eq}; last-5-s average {avg}.
:::

## Both at 0.10 mol/L, so why is one acid near pH 1 and another near pH 5? {#step1 h2=s1t}

Step 1 · Acid strength {#s1k .step-kicker i18n=text}

The question here: at the same concentration, what sets the split share? Each acid’s own **dissociation constant Ka**. At equilibrium Ka = [H⁺][A⁻] / [HA], where square brackets mean the equilibrium concentration of that species in mol/L. A larger Ka tips the balance toward splitting. Ka depends only on which acid it is and on temperature, not on how much acid you add. Ka values span many powers of ten, so chemists write **pKa = −log Ka**: a Ka ten times larger means a pKa one smaller, and a smaller pKa means a stronger acid. Likewise **pH = −log[H⁺]**, and one pH unit lower means ten times more H⁺ (<a class="xlink" href="../../../chemistry/solutions/ph-scale/#step1">→ pH scale, step 1: one unit is a factor of ten</a>). If x mol per litre has split at equilibrium, then [H⁺] = [A⁻] = x and [HA] = c − x, so x² / (c − x) = Ka. Solving that quadratic gives x, α = x / c and pH = −log x. Both charts below use pKa on the x-axis (weaker acids to the right): the split-share curve plots α on a log scale (each gridline is a factor of ten; on a linear scale every weak acid would be squashed against zero), with the strong acid’s 100% as a grey dashed line at the top; the pH curve plots pH; grey vertical lines mark five common weak acids, and the selected one turns orange. {#s1e .explain}

::: html step1-1
lgCurve: Curve from the quadratic
lgNow: Current choice
lgAcids: Five common weak acids
lgStrong: Strong acid at the same c (fully split)
kaLabel: Ka (log scale)
acidHClO2: HClO₂ chlorous acid
acidHF: HF hydrofluoric acid
acidAcetic: CH₃COOH acetic acid
acidHClO: HClO hypochlorous acid
acidHCN: HCN hydrocyanic acid
:::

What to watch: keep the concentration at 0.10 mol/L and move only the Ka slider or tap an acid. Follow the dot on both curves. Below pKa 0, α is above 90% and the acid behaves almost like a strong one; beyond pKa 3 the split-share curve turns into a straight line: each +2 in pKa drops α by one gridline (to about a tenth) and raises pH by about 1. Ka sets the share, not the speed (step 4). {#s1hint .hint i18n=text}

::: strings
c1alpha: Split share α (log scale) · x-axis: pKa · c = 0.10 mol/L
c1ph: pH · x-axis: pKa
s1readout: Ka = {ka} (pKa = {pka}): x = {x} mol per litre splits, α = {alpha}, about {per} in every 1000 molecules. pH = {ph}; a strong acid at the same concentration gives pH {phs}, a gap of {dph}.
:::

## Dilute acetic acid 100-fold. Does its pH rise by 2, as a strong acid’s would? {#step2 h2=s2t}

Step 2 · Dilution {#s2k .step-kicker i18n=text}

The question here: with Ka fixed and only the total concentration c changing, what happens to α and pH? The instant you dilute, [H⁺], [A⁻] and [HA] all shrink by the same factor. The Ka expression has two concentrations on top and one below, so a tenfold dilution cuts the **reaction quotient Q** (the same expression as Ka, filled with the concentrations right now rather than at equilibrium) to a tenth. With Q < Ka the net reaction runs toward splitting, and α grows. That is why pH rises more slowly than for a strong acid. When α is small, c − x ≈ c and the quadratic reduces to **α ≈ √(Ka / c)** (Ostwald’s dilution law): make c 100 times smaller and α grows 10 times, so [H⁺] falls only 10-fold and pH rises only about 1. Both charts use total concentration c on a log x-axis (more dilute to the right). In the split-share chart the solid line is the exact quadratic and the dashed line is the √(Ka/c) shortcut; in the pH chart the grey dashed line is a strong acid at the same c. {#s2e .explain}

::: html step2-1
lgApprox: Shortcut √(Ka/c)
cLabel: Total concentration c (log scale)
:::

What to watch: pick acetic acid and drag c from 1 mol/L all the way down to the most dilute setting (about 3×10⁻⁵ mol/L). The dot climbs along the solid split-share line. Solid and dashed lines agree for concentrated solutions and part ways once α gets large: the shortcut only holds while α is small. In the pH chart the weak-acid line is gentler than the grey strong-acid line, with about half its slope. Switch to HF and repeat: it approaches 100% much sooner. {#s2hint .hint i18n=text}

::: html step2-2
quizPrompt: Quick check: dilute 0.10 mol/L acetic acid to 0.0010 mol/L (100-fold). Roughly how much does pH rise?
quizA: By 2, same as a strong acid
quizB: By about 1
quizC: Not at all, since Ka is unchanged
check: Check
:::

::: strings
c2alpha: Split share α (%)
c2ph: pH
c2x: Total concentration c (mol/L)
s2readout: {acid}, c = {c} mol/L: α = {alpha} (the shortcut gives {approx}, off by {err}); pH = {ph}, against {phs} for a strong acid. Dilute another tenfold from here: Q drops to a tenth of Ka, the new equilibrium has α = {alpha10}, and pH rises by {dph10} (a strong acid rises by 1.00).
quizRight: Right. pH goes from {ph1} to {ph2}, a rise of only {d}: dilution pushes α from {a1} up to {a2}, which undoes about half of the dilution.
quizWrong: Look at the pH chart again: from c = 0.1 to 0.001 the weak-acid line rises by {d}, about half as much as the grey strong-acid line. The reason is that α grows from {a1} to {a2}.
quizNone: Pick an option first.
:::

## Add the acid’s own A⁻ to the solution. Do more molecules split, or fewer? {#step3 h2=s3t}

Step 3 · Common ion {#s3k .step-kicker i18n=text}

The question here: how does the balance shift when extra A⁻ is already present? Dissolve a salt such as NaA, for example: it splits completely into Na⁺ and A⁻, and that A⁻, shared with the weak acid, is called a **common ion**. At the instant you add the salt nothing has reacted yet, but [A⁻] is higher, so the **reaction quotient Q** (the Ka expression filled with current concentrations) now exceeds Ka. At the molecular level, every H⁺ meets A⁻ more often: rejoining outpaces splitting, the number of split molecules falls, and it keeps falling until both directions match again (<a class="xlink" href="../../../chemistry/reactions/chemical-equilibrium/#step2">→ Chemical equilibrium, step 2: how a system settles after you add more</a>). The simulation reuses the 200 molecules from step 0 (the chlorous-acid-like weak acid at 0.10 mol/L). The small green dots under the grid are the added A⁻; each also stands for 0.0005 mol/L. Na⁺ takes no part and is not drawn. {#s3e .explain}

::: html step3-1
lgExtra: Added A⁻ (from NaA)
sLabel: Added A⁻ concentration s
reset3: Back to s = 0
:::

What to watch: wait for the green split-share line to flatten, then drag s from 0 to 0.10. In the events chart the cyan line (rejoins) jumps above the orange one (splits) and the green line drops; when the two event lines meet again, the green line settles on the new white dashed level. Press “Back to s = 0” and it runs the other way: orange leads and the green line climbs back. {#s3hint .hint i18n=text}

::: strings
c3grid: 200 acid molecules + added A⁻ (small green dots)
s3readout: s = {s} mol/L · split now: {n}/{N} (α = {alpha}) · forward {fwd}/s, reverse {rev}/s · equilibrium equation: α = {eq} (no salt: {eq0}), pH = {ph} (no salt: {ph0}). {qk}
qkUp: At the moment s last changed (using the equilibrium concentrations just before), Q/Ka = {q}: above 1, so the net reaction runs in reverse and fewer molecules stay split.
qkDown: At the moment s last changed (using the equilibrium concentrations just before), Q/Ka = {q}: below 1, so the net reaction runs forward and more molecules split.
qkNone: s has not changed yet: Q/Ka just wobbles around 1.
s3acetic: The same logic applies to acetic acid: 0.10 mol/L acetic acid has pH {ph0} and α = {a0}; dissolve 0.10 mol/L sodium acetate as well (extra A⁻) and the pH becomes {ph1}, with α down to {a1}. That mixture is where buffers begin ({link}).
bufLink: → Buffer capacity, step 1: the A⁻ : HA ratio sets the pH
:::

## Does a large Ka mean the acid splits quickly? {#step4 h2=s4t}

Step 4 · End point vs speed {#s4k .step-kicker i18n=text}

The question here: does Ka decide where the balance lands, or how fast it gets there? The simulation has two chance settings: **kf** is the chance per second that an HA splits, and **kr** sets how often H⁺ and A⁻ rejoin. At equilibrium both directions run at the same rate, kf·[HA] = kr·[H⁺][A⁻], which rearranges to [H⁺][A⁻]/[HA] = kf/kr. So **Ka = kf / kr**: it is only a ratio. Below, groups A and B (400 molecules each) start together with every molecule intact. A stays fixed (the step 0 settings). For B you can change only the speed (kf and kr multiplied by the same factor, so their ratio Ka is unchanged) or only Ka (kf kept, kr changed). Why reactions run fast or slow has its own lesson (<a class="xlink" href="../../../chemistry/reactions/reaction-rates/#step0">→ Reaction rates, step 0: counting successful collisions</a>); a catalyst speeds up both directions at once, which is exactly the “speed only” change (<a class="xlink" href="../../../chemistry/reactions/activation-energy/#step3">→ Activation energy, step 3: catalysts</a>). {#s4e .explain}

::: html step4-1
lgA: Group A (fixed)
lgB: Group B (adjustable)
lgLevelA: A’s equilibrium value
lgLevelB: B’s equilibrium value
speedLabel: Group B speed factor (kf and kr together)
kaBLabel: Group B Ka
rerun: Start both again
:::

What to watch: first drag only the speed factor to ×4. In the split-share chart the orange line (B) flattens before the cyan line (A) but on the same dashed level. Then set the speed back to ×1 and move only Ka: both lines start together but settle at different heights. Every slider change restarts both groups together. {#s4hint .hint i18n=text}

::: strings
c4: Split share α (%) · x-axis: time since the joint start (s)
s4readout: A: Ka = {kaA}, speed ×1 → equilibrium α = {aA}, reaches 90% of it in about {tA} s. B: Ka = {kaB}, speed ×{sp} → equilibrium α = {aB}, in about {tB} s. {verdict}
s4progress: Simulated {t} / {T} s.
vSame: Both groups have the same settings; the lines differ only by random wobble.
vSpeed: Same Ka, different speed: the same end point, B just gets there sooner or later.
vKa: Same speed, different Ka: different end points. Ka decides where it stops.
vBoth: Both changed: the end point depends on Ka alone; the arrival time depends on both the speed factor and Ka.
:::

## Splitting and rejoining never stop; Ka decides where they break even {#step5 h2=s5t}

Step 5 · Wrap-up {#s5k .step-kicker i18n=text}

::: html step5-1
s5fin: The thread, step by step. **Step 0**: a weak acid splits and rejoins at the same time; the split share levels off when both run at the same rate per second, and it lands in the same place whichever end you start from. **Step 1**: Ka sets that share: at 0.10 mol/L, every +2 in pKa cuts α to about a tenth and raises pH by about 1. **Step 2**: dilution drops Q below Ka and α grows, so a 100-fold dilution raises a weak acid’s pH by only about 1. **Step 3**: adding the common ion A⁻ lifts Q above Ka, rejoining wins, α shrinks and pH rises. **Step 4**: Ka is just the ratio of the forward and reverse chances; speeding up both together moves the arrival time, not the end point.
formula: "Ka = [H⁺][A⁻] / [HA]\nx² + (Ka + s)·x − Ka·c = 0\nα = x / c   pH = −log x"
boundary: Scope: 25 °C; the solution is treated as ideal (concentrations stand in for activities); water’s own ionisation is ignored. Every case on this page has [H⁺] ≥ 10⁻⁶ mol/L, where the full solution including water differs by less than 1%, but more dilute or weaker acids need water included (<a class="xlink" href="../../../chemistry/solutions/ph-scale/#step4">→ pH scale, step 4: why diluting an acid never makes it basic</a>). Dilution and added salt change concentrations only; volume changes are ignored. The molecule counts, chance settings and time in the simulations are teaching choices: real solutions split and rejoin far faster, and only their ratio, Ka, matches a real equilibrium.
linksTitle: Where to go next
lk1: → Chemical equilibrium, step 2: how equilibrium shifts when you add more (Le Chatelier)
lk2: → Buffer capacity, step 1: the A⁻ : HA ratio sets the pH
lk3: → Titration curves, step 2: why titrating a weak acid gives a different curve
lk4: → pH scale, step 4: no amount of dilution turns an acid basic
:::
