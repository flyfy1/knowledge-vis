---
lang: en
---

::: strings
back: ← Knowledge Index
pageTitle: Bayes
tagline: A test says you have a disease only 1% of people get, and the test itself is pretty accurate — yet your actual chance of having it is only about 9%. Bayes' theorem is not about how good the test is; it is about how thin the base rate underneath the evidence is. This page turns priors, likelihood ratios and posteriors into a ledger you update with your own hands: check the base rate first, then weigh the evidence.
foot: visual.integ.life · Bayes — one interaction per step
:::

## The test says positive — hold on, place a bet first {#step0 h2=s0t}

::: strings
nav0: 0 The Hook
:::

Step 0 · The Hook {#s0k .step-kicker i18n=text}

A disease with **prevalence 1%**: about 100 in 10,000 people truly have it. You take a test: it catches **90%** of true cases (sensitivity), but it also falsely flags **9%** of healthy people (false-positive rate). Your result comes back **positive**. So: what is the probability you actually have the disease? Place your bet, then we reveal it. {#s0e .explain}

Place your bet: roughly what is the chance you truly have it? {#s0betQ .seq-label i18n=text}

::: html step0-1
bet90: ≈ 90%
bet50: ≈ 50%
bet9: ≈ 9%
bet1: ≈ 1%
s0reveal: Reveal: lay out all 10,000 people ↓
:::

This is no word game: mammograms, infectious-disease screening and airport security alerts all share this exact structure and this exact ledger. Remember the picture: **most of the positive pile is false alarms** — whenever the condition is rare enough. Over the next few steps we turn this count into a formula, and then into a habit. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
s0fbNone: No bet yet — pick what your gut says, then reveal.
s0fbRight: You bet {pick} — **and you are right**. Most people bet 90% or even 50%: they stare at how accurate the test is and forget that only 100 of the 10,000 people are sick at all. Below, we lay out all 10,000 people and count.
s0fbWrong: You bet {pick} — the most common answer in the world, and it is wrong. The test is not the problem; the base is: there are so few sick people that the false alarms outnumber the true cases. Let us lay out all 10,000 people and count.
s0again: Fold it back & re-bet
cAll: 10,000 people, one cell each
cSickCap: 100 orange cells = truly sick
cTPCap: cyan = true positives
cFPCap: orange = false positives
cFNCap: dark red = missed cases
s0ro: Out of 10,000 people: <span>100</span> are sick and <span>90</span> are caught; <span>9,900</span> are healthy and <span>891</span> are falsely flagged. Of the <span>981</span> who test positive, the truly sick are just 90 / 981 = <span>{ppv}</span>. The test did not lie to you — the base of sick people is so thin that false alarms outnumber them.
:::

## Among cards that light the lamp, how many have a star? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 The Prior
:::

::: html step1-1
s1k: Step1 · Measurement direction and posterior
:::

This section applies the same update to a **hypothetical card reader**. H means “the card has a star”; E means “the lamp lights”. Draw one card randomly from a batch. Its marked fraction p, before this reading, is the prior P(H). Assume P(E|H)=90% and P(E|not H)=9%. After seeing the lamp, the question is the reverse P(H|E), not the original 90%. {#s1e .explain}

::: html step1-2
s1priorLab: Marked fraction before the reading: p=P(H) (original log slider)
s1p1: Prior 1% (default)
s1p10: Prior 10%
s1poolTitle: Restrict to lamp results: where do they come from?
s1poolIntro: The whole strip is all lamp results E, normalized to 100%. A is “star and lamp”; B is “no star but lamp”. Their shares within this pool follow the same prior slider above.
s1proof: Why add both sources of lamp results in the denominator?
s1jointA: Among all cards: A=P(H∩E)=0.90p
s1jointB: Among all cards: B=P(not H∩E)=0.09(1−p)
s1evidence: Probability that a random card lights the lamp: P(E)=A+B
s1direction: P(E|H) first restricts to marked cards, then asks about the lamp. P(H|E) first restricts to lamp results, then asks about the star. Their denominators differ. The 90% and 9% concern opposite hypotheses, not complementary events; they need not sum to 100%. These are model probabilities, not actual card counts or measured device performance.
s1source: Conditional probabilities and denominators · textbook
s1chain: Next: Step3 compares new readings with copies (fixed 1% prior; this slider is not transferred)
s1map: Return to Bayesian updating on the knowledge map →
:::

The 90% and 9% are two assumed conditional probabilities, not the reader’s overall accuracy. Only the prior changes here; reader parameters stay fixed. Other sections retain the original test example and do not synchronize this slider. {#s1hint .hint}

::: strings
s1poolCaption: Within lamp results: A with a star≈{yes}; B without a star≈{no}. The denominator is lamp results, not all cards.
s1formula: P(H|E)=A/(A+B)≈{post}. Sum and normalize unrounded A and B before displaying approximate values.
docTitle: Bayes · Check the Base Rate First · One Interaction per Step
s1ro: Prior P(H)≈<span>{prior}</span> + lamp E → Posterior P(H|E)≈<span>{post}</span>. LR=10 stays fixed; posterior probability is not simply ten times the prior.
cPrior: Prior
cPost: Posterior P(H|E)
cHair: too thin to see — and that is the point
:::

## Put on odds glasses: posterior = prior × likelihood ratio {#step2 h2=s2t}

::: strings
nav2: 2 Evidence Multiplies
:::

Step 2 · Evidence Is One Multiplication {#s2k .step-kicker i18n=text}

Probabilities are squeezed between 0 and 1, where multiplication has no room to breathe. Switch to **odds** (probability ÷ its complement): a 1% prior is odds of 1 : 99. Evidence strength is the **likelihood ratio**, LR = P(evidence | sick) / P(evidence | healthy) — the vertical bar reads "given": P(evidence | sick) is the probability that this evidence shows up, given that the person truly is sick (and likewise for healthy). For this test a positive has LR+ = 0.90 / 0.09 = **10**, a negative LR− = 0.10 / 0.91 ≈ **0.11**. Posterior odds = prior odds × LR — one multiplication and you are done. On a log₁₀ odds axis, multiplication becomes a **shift**: the weight of the evidence is exactly how far it pushes you, right or left. {#s2e .explain}

::: html step2-1
s2priorLab: Prior probability (log scale)
s2lrLab: Likelihood ratio LR (log scale)
s2lrPos: Preset: positive LR+ = 10
s2lrNeg: Preset: negative LR− ≈ 0.11
:::

Log-odds has another name: the **weight of evidence**. LR = 10 weighs +1, LR = 100 weighs +2, LR = 0.1 weighs −1. For the first time, evidence can be weighed — and added up. Step 3 chains exactly this. {#s2hint .hint}

::: strings
s2ro: Prior {p0} → odds <span>{o0}</span> (log₁₀ odds {l0}) · × LR {lr} → posterior odds <span>{o1}</span> (log₁₀ odds {l1}) → posterior probability <span>{p1}</span>
cAxisLab: log₁₀ odds axis (corresponding probabilities below)
cPriorPt: prior
cPostPt: posterior
:::

## Do not count the same reading twice {#step3 h2=s3t}

::: strings
nav3: 3 Chaining Evidence
:::

Step 3 · New measurement or old record? {#s3k .step-kicker i18n=text}

Use Step1’s hypothetical card reader: H means a starred card, E a lit lamp. This ledger fixes the prior at 1% (it does not inherit the Step1 slider); P(E|H)=90% and P(E|¬H)=9%. **New measurement** selects a model assumption: readings are conditionally independent both given H and given ¬H. Within either case, knowing previous readings leaves the next lamp probability unchanged. A record number labels its source; it does not prove independence. {#s3e .explain}

::: html step3-1
:::

Predict, then try: Clear → new lit reading R1 → copy R1. Will the probability rise again? Undo the copy, then add a new lit reading R2. Compare the same curve: about 9.17% → 9.17%, versus 9.17% → 50.25%. {#s3task .hint i18n=text}

::: html step3-2
addPos: + New measurement: lit (×10)
addNeg: + New measurement: unlit (×0.11)
s3copy: Copy last record (×1)
undo: Undo last
clear: Clear
s3warn: **A copy is the same known reading, not another measurement.** It adds no information: multiply odds by 1 and the curve stays flat. A genuinely new, dependent measurement can still add information, but needs probabilities conditional on previous results and H / ¬H; do not reuse ×10 automatically. Conditional independence also differs from independence in the mixed population. **The independent product is not a general upper or lower bound.**
:::

A lit lamp has likelihood ratio 0.90 / 0.09 = 10; an unlit lamp has 0.10 / 0.91 ≈ 0.11. Multiply odds, not probability, by this ratio. The horizontal axis counts display entries, including copies. {#s3hint .hint}

::: html step3-3
s3proof: More: why is the independent product not an upper bound?
s3proofIntro: This is a constructed, valid two-reading probability model, not measured reader performance. + means lit and − unlit; +− means lit first, unlit second. Each column sums to 1 under its hypothesis.
s3jointCaption: Joint probabilities given H or ¬H (scroll sideways on narrow screens)
s3pair: Results
s3proofMargins: Each reading still has lamp probability 0.90 given H and 0.09 given ¬H, but the readings are not conditionally independent. Even positive correlation under both hypotheses does not guarantee an upper bound.
s3independent: Conditionally independent: two lit readings, joint probabilities 0.81 / 0.0081 → posterior
s3dependent: Dependent table above: two lit readings, joint probabilities 0.89 / 0.0082 → posterior
s3proofConclusion: With the same 1% prior, the dependent model gives a higher result. This is a counterexample, not a rule for all dependence. Generally use the conditional likelihood ratio below; for a copy of the same known reading, numerator and denominator are both 1.
s3source: Math source: ProbabilityCourse §1.4.4, conditional versus marginal independence
:::

::: strings
s3copied: copy of same reading
s3empty: No records yet
chipPos: lit
chipNeg: unlit
s3ro0: Empty ledger. Posterior = prior = <span>1.00%</span>. Add one lit-lamp measurement first.
s3ro: Odds {chain} → posterior odds <span>{odds}</span> → starred-card probability <span>{post}</span>. Entries: {n}; distinct records: {unique}.
s3cap: The display holds {max} entries, including copies. Undo or clear to continue.
cTrajLab: star probability after each display entry
cStartPt: prior
:::

## A coin whose bias nobody knows {#step4 h2=s4t}

::: strings
nav4: 4 Continuous · The Coin
:::

Step 4 · The Continuous Version {#s4k .step-kicker i18n=text}

Now the continuous version: the coin's heads probability θ is unknown, so the prior is no longer a number but a whole **distribution curve**. Every flip tightens the curve by Bayes' rule: prior Beta(α, β) + data (H heads, T tails) → posterior Beta(α+H, β+T) — a closed-form update, no simulation needed. A secret up front: this coin is actually biased, <strong>θ\* = 0.65</strong> — so you can watch where the posterior is heading. Random flips come from a seeded generator (mulberry32); the seed is printed in the readout, and the same seed replays the same sequence. Manual tallies are counted separately from the random stream — changing the seed restarts only the random stream and never clears the manual tally. {#s4e .explain}

::: html step4-1
priFlat: Flat Beta(1, 1) · no opinion
priWeak: Mild Beta(8, 8) · probably fair
priStrong: Strong Beta(40, 10) · sure it favors heads
flip1: Flip +1
flip10: Flip +10
flip100: Flip +100
manH: Tally a head
manT: Tally a tail
newSeed: New seed
reset: Reset
:::

This page reports the mean and the mode but no credible interval (a credible interval is the range the true θ most likely falls inside) — an interval needs numerical integration of the posterior, a machine of its own; first get clear on how the curve tightens with data. The more flips, the narrower the curve: **the width of the posterior is exactly how much you still do not know**. {#s4hint .hint}

::: strings
dash: —
s4ro: Seed {seed} · random stream: {rh} heads / {rt} tails · manual tally: {mh} heads / {mt} tails · total n = {n} ({h} heads)<br>Posterior Beta(<span>{a}</span>, <span>{b}</span>) · mean <span>{mean}</span> · most likely θ <span>{mode}</span> · prior mean {pmean}
s4seedNote: New seed in place: the random stream restarts from scratch; your manual tally ({mh} heads / {mt} tails) is kept, not cleared.
cPriorPdf: prior
cPostPdf: posterior
cMean: posterior mean
cTrue: true θ\* = 0.65
cRecent: recent random flips (cyan = heads, grey = tails)
cThetaLab: θ (probability of heads)
:::

## With enough data, priors wash out {#step5 h2=s5t}

::: strings
nav5: 5 Washout + Frequencies
:::

Step 5 · Prior Washout + Frequencies Revisited {#s5k .step-kicker i18n=text}

Two priors — flat Beta(1, 1) and the strong opinion Beta(40, 10) — are fed the **same** flip sequence (same seed, θ\* = 0.65). Watch the two posterior curves and the gap between their means: at small n the opinion still rules; by a few hundred flips, the data has washed both curves together. **Washout is real, but data is the price** — the smaller the sample, the more the prior costs you. {#s5e .explain}

::: html step5-1
w10: +10 more
w100: +100 more
w600: Run to 600
:::

Back to plain language: the frequency tree {#s5treeT .sub-t tag=h3 i18n=text}

The same ledger in a different dialect: no probabilities, just head counts. Drag the prevalence slider and the tree's counts and the "truly sick given positive" figure recompute together — the PPV from the formula (positive predictive value — out of everyone who tests positive, the share who are truly sick) and the ratio counted on the tree agree exactly. **Natural frequencies are Bayes in plain clothes**: when a doctor explains a screening result, this tree — not percentages — is the honest way to do it. {#s5treeE .explain}

::: html step5-2
s5prevLab: Prevalence (whole-percent steps)
:::

Why whole percents? At 1% steps, every head count out of 10,000 stays an integer — every number on the tree can be counted directly, with no "expected people" fudge. Drag the slider back to 1% and you are looking at step 0's tree again. {#s5hint .hint}

::: strings
s5ro: Same sequence: seed {seed} · n = {n} · {h} heads · flat-prior posterior mean <span>{ma}</span> · strong-prior posterior mean <span>{mb}</span> · gap <span>{diff}</span>
s5noteSmall: n is still small: the strong prior's posterior is still being dragged by its prior, {diff} away from the flat prior's — this is the half of the truth where priors dominate small samples.
s5noteBig: n is large now: the two prior means differ by only {diff} and the curves nearly coincide — the data has washed the priors out. This half is true too.
cFlatPost: posterior from flat prior
cStrongPost: posterior from strong prior
s5treRo: Per 10,000 people: sick <span>{sick}</span> ({tp} true positives · {fn} missed) · healthy <span>{healthy}</span> ({fp} false positives · {tn} true negatives) · {pool} test positive → truly sick <span>{ppv}</span> · formula PPV agrees: {ppvf} ✓
tbAll: 10,000 people
tbSick: sick
tbHealthy: healthy
tbTP: positive · true
tbFN: negative · missed
tbFP: positive · false alarm
tbTN: negative · true
tbPoolCap: {pool} test positive → truly sick {tp} / {pool} = {ppv}
:::

## Check the base rate first, then weigh the evidence {#step6 h2=s6t}

::: strings
nav6: 6 Finale · Fallacy Guard
:::

Step 6 · Finale {#s6k .step-kicker i18n=text}

Bayes is not a formula; it is a bookkeeping habit: for any new evidence, first ask how thick the base underneath it is, then enter it at its likelihood ratio. It is on duty everywhere in the real world: {#s6e .explain}

::: html step6-1
app1t: Spam filtering
app1d: Every word is a piece of evidence — "free" and "winner" each carry a likelihood ratio — and naive Bayes multiplies the whole email's words together and weighs the result against the prior that a message is spam.
app2t: Medical screening
app2d: This page's running case: for rare diseases, most screening positives are false alarms. A responsible follow-up protocol is just step 3's evidence chain, continued.
app3t: A/B tests & product decisions
app3d: "\"The metric went up\" is one piece of evidence; how much it counts depends on your prior that the change actually works. The wilder the prior, the more data you owe — step 5 priced the washout."
app4t: Machine learning: priors = regularization
app4d: Putting a prior on parameters is the same as adding a penalty term to the loss: the prior says "stay small", the data says "but fit" — the posterior is the truce, the same ledger as step 4.
s6qT: Final guard · the prosecutor's fallacy
s6q: In court, the prosecutor says: "The chance of this DNA evidence appearing on an innocent person is **one in a million**, so the probability the defendant is innocent is one in a million." — Where exactly does that sentence go wrong?
s6qa: The test itself is unreliable; the DNA data is flawed
s6qb: It swaps P(evidence | innocent) for P(innocent | evidence) — conditional probabilities in opposite directions are entirely different things
s6qc: One in a million is so small it can simply be ignored
s6fin: **To close.** This page taught a single move: **check the base rate first, then weigh the evidence** — however loud the evidence shouts, ask how thick the base beneath it is. A prior is not a bias; ignoring the prior is the biggest bias of all.
s6lkClt: What more data does: watch averages grow into a bell →
s6lkKal: The industrial version of posterior-becomes-prior: how Kalman updates, round after round →
s6lkMc: The frequency road: toss enough, and frequency shows probability's face →
s6linkIdx: ← Back to the index, for the next stop on the probability line
:::

::: strings
s6fbNone: Pick one — see whether this page has trained your Bayesian instincts.
s6fbRight: **Correct.** P(evidence | innocent) = one in a million talks about a random innocent person matching the evidence; P(innocent | evidence) still has to be multiplied by the prior and divided by how often the evidence shows up at all — in a city of millions, several innocent people may match. Swap the direction and drop the base rate, and you get step 0's ledger wearing a wig in court.
s6fbWrong: Not quite. Think back to step 0: however accurate a test is, you cannot read P(positive | healthy) as P(healthy | positive). **The error is swapping the two directions of a conditional probability**: P(evidence | innocent) being one in a million does not make P(innocent | evidence) one in a million — the latter still depends on the base: how many people could produce this evidence.
:::
