---
lang: en
---

::: strings
back: ← Knowledge Index
category: Mathematical Foundations
stage: University
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: The Prisoner’s Dilemma & Evolutionary Games · How Cooperation Survives
tagline: In a one-shot game, defecting pays; in repeated games and evolving populations tit-for-tat style cooperation can survive — and the page lets you tune the conditions.
:::

## Whatever the other does, defecting pays more {#step0 h2=s0t pre=1}

::: strings
nav0: 0 One round
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: Why both defect
:::

This step asks: why do two people who would both love to cooperate end up defecting together? Each has two choices: **cooperate** (C) or **defect** (D). In each cell the cyan number is “my” score and the violet one is the other player’s: both cooperate, 3 each; both defect, 1 each; I defect while the other cooperates, I get 5 and they get 0 (and vice versa). A **dominant strategy** is a choice that does no worse whatever the other player picks (see [[game-theory#step2|game theory]]). **What to do:** first click the other player’s move; the green cell marks my best reply. If they cooperate, defecting gives 5 > 3; if they defect, defecting gives 1 > 0 — so defecting is always better for me, yet mutual defection (1+1) is worse than mutual cooperation (3+3). This is a one-off game with no “next time”. {#s0e .explain}

::: html step0-2
s0cv: Payoff matrix: in each cell the left number is my score and the right one the other player’s
opPick: The other plays:
opC: Other cooperates (C)
opD: Other defects (D)
mePick: I play:
meC: I cooperate (C)
meD: I defect (D)
resetPick: Clear choices
:::

::: strings
opMoves: other player’s move
myMoves: my move
mC: cooperate
mD: defect
s0ro0: Pick what “the other plays” first, then see which of my choices scores more.
s0roBest: If the other will {op}: defecting gives me {d}, cooperating gives me {c} → my best reply is to {best}.
s0roPick: I {me}, the other {op}: I get {pm}, they get {po}. My best reply here is to {best}; but if both cooperated each would get {both}.
:::

## The same pair plays many rounds, and strategies appear {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Repeated play
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: The game repeats
:::

This step asks: what happens when the same two players play many rounds? A **strategy** is a rule that picks the next move from the history: **always cooperate**, **always defect**, **tit-for-tat** (cooperate in round 1, then copy the other’s last move), **grim** (cooperate until the other defects once, then defect for ever) and **random** (half and half). Each square above is a round, green = cooperate, red = defect; below is the running score. **What to do:** choose strategies A and B and a number of rounds, and read the score curves: tit-for-tat loses only round 1 to always-defect and then they trade 1 to 1. Change the rounds, switch opponents, and compare. {#s1e .explain}

::: html step1-2
s1cv: Top: each round’s moves; bottom: running scores
playerA: Player A:
nAllC: Always cooperate
nAllD: Always defect
nTft: Tit-for-tat
nGrim: Grim
nRand: Random
playerB: Player B:
reroll: Re-roll the random player
roundsL: Rounds n
:::

::: strings
nGtft: Generous tit-for-tat
roundAxis: round
scoreAxis: running score
cShort: C
dShort: D
s1ro: A ({a}) against B ({b}), {n} rounds: A scores {sa}, B scores {sb}; A cooperated {ca} times, B {cb} times.
:::

## Who scores the most across all opponents? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Round-robin
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: Round-robin
:::

This step asks: if each strategy plays every opponent (and itself), which one has the highest total? The bars on the left are total scores; the heat table on the right shows “row strategy against column strategy”. Random’s scores are averaged over 40 games. **What to do:** set the rounds to 1: always-defect never loses a match and tops the table; as the rounds grow, the accumulated mutual cooperation of tit-for-tat and grim lifts them and the ranking flips. The key is not “nice guys win” but “enough repetition”. This is only a five-strategy tournament; change the opponents and the ranking can change. {#s2e .explain}

::: html step2-2
s2cv: Left: total scores by strategy; right: score table, row strategy against column strategy
:::

::: strings
rowVs: row vs column
nAllCS: allC
nAllDS: allD
nTftS: TFT
nGrimS: grim
nRandS: rand
s2ro: {n} rounds per match: the top total is {win} ({ws}); tit-for-tat {tft}, always-defect {alld}.
:::

## How sure must you be of meeting again for cooperation to pay? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Shadow of the future
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: The shadow of the future
:::

This step asks: when is giving up the sweet temptation to defect worth it? Let δ be the chance that another round follows each round, so you expect 1/(1−δ) more rounds. Against a tit-for-tat or grim opponent, cooperating gives 3 each round, a total value of 3/(1−δ); defecting now gives 5 at once, but afterwards the opponent retaliates and you only get 1 per round, a total of 5 + δ·1/(1−δ). The lines cross at δ\* = (T−R)/(T−P) = (5−3)/(5−1) = 0.5. **What to do:** drag δ: below 0.5 defecting is worth more (red above); above 0.5 cooperating is worth more. This holds only against opponents who retaliate for ever after a defection. {#s3e .explain}

::: html step3-2
s3cv: Total value of cooperating (green) and of defecting once (red) against δ
deltaL: Chance of another round δ
:::

::: strings
deltaAxis: continuation probability δ
valueAxis: expected total score
dstarLabel: threshold δ\* = {d}
legCoop: always cooperate: 3/(1−δ)
legDef: defect now: 5 + δ/(1−δ)
vCoop: cooperating is worth more
vDef: defecting is worth more
s3ro: δ = {d} (expect {len} rounds): cooperating {c}, defecting {x} → {verdict}; threshold δ\* = {ds}.
:::

## Whoever scores higher takes a bigger share next generation {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Evolving population
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: Evolution in a population
:::

This step asks: put these strategies into a big population; how do the shares change over generations? Each generation, every strategy’s share is multiplied by its average score and renormalised, so higher scorers grow — this is **replicator dynamics**. In the triangle each point is a mix of the three strategies (the closer to a corner, the more of that strategy): bottom-left always-cooperate, bottom-right always-defect, top tit-for-tat. The orange path is 80 generations and the white dot is the start. **What to do:** start with the rounds n: at n = 1 always-defect rushes to the bottom-right corner; around n = 20 the defectors first boom by exploiting always-cooperators, then tit-for-tat takes over. Then change the starting shares and see whether the start changes the ending. {#s4e .explain}

::: html step4-2
s4cv: Three-strategy triangle (path) and the current shares
replay: ▶ Replay evolution (5 s)
defStart: Starting share of always-defect
tftStart: Starting share of tit-for-tat
:::

::: strings
genLabel: generation {g}/{n}
s4ro: {n} rounds per match; start: allC {a}% / allD {d}% / TFT {f}%; end: {wn} holds {wp}%. Scores: TFT vs D {tdd}, D vs D {ddd}, TFT vs TFT {ttt}, D vs TFT {dtt}.
:::

## With noise, should you forgive? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Mistakes and forgiveness
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: A world with mistakes
:::

This step asks: if each move is flipped by mistake with some probability (you meant to cooperate but slipped), does tit-for-tat still work? **Noise** e is the chance a move goes wrong. When two tit-for-tat players meet, a single slip sets off a long run of mutual retaliation; **generous tit-for-tat** still cooperates with probability g after a defection and so breaks the cycle. **What to do:** drag e: the red line (tit-for-tat) falls faster than the green (generous tit-for-tat); change g: at g = 0 the lines coincide, while a very large g would invite exploitation (this page only shows self-play, not exploitation). The vertical axis is the long-run average score per round, capped at 3. {#s5e .explain}

::: html step5-2
s5cv: Per-round average score for two identical players against noise
noiseL: Mistake probability e
forgiveL: Forgiveness g
recapTitle: Recap
recap1: In one round defecting is dominant and mutual defection (1+1) is worse than mutual cooperation (3+3); over enough rounds, nice-but-retaliating strategies like tit-for-tat and grim can sustain cooperation.
recap2: Cooperation pays only with a shadow of the future: δ ≥ (T−R)/(T−P); in a population defectors first boom by exploiting, then give way to cooperators who retaliate.
recap3: With noise, pure retaliation spirals into mutual punishment and a little forgiveness restores cooperation — but “best” always depends on who else is in the population.
modelTitle: Scope and limits of this model
modelText: Scope: two players, two moves, fixed payoffs 5/3/1/0, strategies as simple memory rules, an infinite, well-mixed population, and replication in proportion to score (no mutation, no spatial structure). A five-strategy tournament does not generalise; real cooperation also leans on reputation, third-party punishment, communication and kinship, none of which are modelled here. The “evolution” is mathematical share dynamics, not a prediction about real organisms or societies.
link1: → Game theory: dominant strategies and Nash equilibrium
link2: → Natural selection: higher scorers get copied more often
link3: → Population growth: a neighbouring model of changing shares
:::

Page complete. {#done .readout .success i18n=text}

::: strings
noiseAxis: mistake probability e
perRoundAxis: average score per round
legTft: tit-for-tat (g = 0)
legGtft: generous tit-for-tat (g = {g})
s5ro: e = {e}, g = {g}: tit-for-tat self-play scores {a} per round, generous tit-for-tat {b} (maximum {best} without noise).
docTitle: The Prisoner’s Dilemma & Evolutionary Games · How Cooperation Survives
:::
