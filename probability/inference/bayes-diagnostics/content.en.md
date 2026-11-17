---
lang: en
---

::: strings
pageTitle: Bayes Diagnostics · What a Positive Result Really Tells You
back: ← Knowledge Index
navLabel: Bayes diagnostics steps
tagline: A lab report says "positive". From that one word, how likely is it that you are actually ill? The answer depends on three numbers: how common the disease is, how reliably the test flags people who have it, and how often it falsely flags people who don't. Over seven steps you will assemble them yourself from 1,000 dots and see why "the test catches 90% of patients" is not the same as "90% of positives are patients".
nav0: 0 Guess
nav1: 1 Prior
nav2: 2 Four groups
nav3: 3 New denominator
nav4: 4 Direction
nav5: 5 Test again
nav6: 6 Wrap-up
foot: Written independently by Claude Code (claude-opus-5-5).
lgTP: Ill · positive
lgFN: Ill · negative (missed)
lgFP: Healthy · positive (false alarm)
lgTN: Healthy · negative
lgUnk: Result not shown yet
lgIll: Ill
lgHealthy: Healthy
:::

## The report says positive. How likely is it that you are ill? {#step0 h2=s0t}

Step 0 · Trust your gut {#s0k .step-kicker i18n=text}

This step asks: given a positive result, what is the chance this person really has the disease? Picture a disease that about 2 in every 100 people have. A test for it comes back positive for 90% of **people who have it**, and negative for 95% of **people who don't**, so 5% of healthy people get a false positive. Sam takes the test and it comes back positive. Make a gut guess with the slider, then press "Reveal". {#s0e .explain}

::: html step0-1
guess: Your guess: chance Sam is ill
reveal: Reveal: test 1,000 people like Sam
hide: Hide the answer and guess again
c0aria: 1,000 dots standing for 1,000 people tested in the same situation as Sam
:::

What to look for: after the reveal, find the filled dots first; they are everyone who tested positive. Then count how many of those are pink (really ill) and how many are cyan (healthy but falsely flagged). There are far more filled cyan dots than filled pink ones, and that is why the answer is low. {#s0hint .hint i18n=text}

::: strings
c0titleBefore: 1,000 people tested like Sam (results hidden)
c0titleAfter: Colour = true status, filled = positive
s0readoutBefore: Your guess: {g}. Press "Reveal" to see who the positives are among 1,000 people.
s0readout: You guessed {g}. Among 1,000 such people, about {ill} are ill and {tp} of them test positive; of the {healthy} healthy people, {fp} get a false positive. That is {pos} positives in all, and only {tp} ÷ {pos} ≈ {ppv} of them are ill. {verdict}
verdictHigh: Your guess was high. Most people guess high the first time; the next steps take the reason apart.
verdictClose: Very close! The next steps show where this number comes from.
verdictLow: Your guess was low. A positive does lift the chance more than tenfold from 2%; the next steps show by how much and why.
:::

## Before seeing any result, how likely is "ill"? {#step1 h2=s1t}

Step 1 · Before the test {#s1k .step-kicker i18n=text}

This step asks: with no test result yet, what is the chance that a person picked at random from those being tested is ill? This number is the **prior probability** ("prior" as in before the result), and here it equals the **prevalence**: the share of the tested group that has the disease, written P(ill). The 1,000 dots in the grid are 1,000 people, pink for ill and cyan for healthy. Every head count on this page is an **expected count**: the average number you get from the proportions, which may be fractional; the dots round it to whole people. Actually sampling 1,000 people would give counts that scatter around these values (<a class="xlink" href="../../../probability/basics/probability-frequency/#step2">→ Probability & Frequency, step 2: why proportions settle down with more samples</a>). {#s1e .explain}

::: html step1-1
c1aria: 1,000 people split by true status into ill and healthy
prevLabel: Prevalence P(ill)
:::

What to try: drag the prevalence slowly from 2% to 30% and watch the pink block grow from a sliver into a large patch; drag it back to 0.5% and only 5 pink dots remain. Note how many healthy people there are: you will see that the number of false alarms follows the number of healthy people. The later steps all use the prevalence you set here. {#s1hint .hint i18n=text}

::: strings
c1title: 1,000 people: pink = ill, cyan = healthy
s1readout: Prevalence P(ill) = {p}: of 1,000 people, about {ill} are ill and {healthy} are healthy, roughly 1 ill person for every {ratio} healthy ones.
:::

## How many positives does one test produce among the ill, and among the healthy? {#step2 h2=s2t}

Step 2 · What the test does {#s2k .step-kicker i18n=text}

This step asks: into which two parts does the test split the ill and the healthy, and how many land in each? A test is described by two proportions with **different denominators**. **Sensitivity** is the share of ill people who test positive, written P(positive | ill); the bar "|" reads "among", and whatever sits to its right is the group you divide by. **Specificity** is the share of healthy people who test negative, P(negative | healthy). One minus specificity is the **false-positive rate** P(positive | healthy): the share of healthy people wrongly flagged. Together they cut the 1,000 people into four groups: ill and positive (true positives), ill and negative (missed cases), healthy and positive (false alarms), healthy and negative (true negatives). In the picture, colour shows true status (pink = ill, cyan = healthy), a filled dot means positive and a ring means negative. {#s2e .explain}

::: html step2-1
c2aria: 1,000 people split by true status and test result into four groups
sensLabel: Sensitivity P(positive | ill)
specLabel: Specificity P(negative | healthy)
:::

What to try: hold sensitivity still and drag only specificity from 95% to 99%; the filled cyan dots (false alarms) shrink from about 49 to about 10. Put specificity back at 95% and drag only sensitivity: the rings inside the pink group (missed cases) grow and shrink, while not a single cyan dot changes. Sensitivity only touches the ill row; specificity only touches the healthy row. {#s2hint .hint i18n=text}

::: strings
c2title: Pink ill, cyan healthy; filled = positive
thStatus: True status \ result
thPos: Positive
thNeg: Negative
thTotal: Total
rowIll: Ill
rowHealthy: Healthy
rowTotal: Total
s2readout: Prevalence {p} (set in step 1) · sensitivity {se} · specificity {sp}: {ill} ill people → {tp} positive, {fn} missed; {healthy} healthy people → {fp} false alarms, {tn} negative. False-positive rate = 1 − specificity = {fpr}.
:::

## With a positive report in hand, which group do you count the ill in? {#step3 h2=s3t}

Step 3 · After the result {#s3k .step-kicker i18n=text}

This step asks: given a positive result, what is P(ill | positive)? The key is a **new denominator**. A positive report tells you that you belong to the group of everyone who tested positive; the negatives no longer concern you. So P(ill | positive) = true positives ÷ all positives = true positives ÷ (true positives + false alarms). This number is the **positive predictive value**: the **posterior probability** after seeing a positive ("posterior" as in after the result). A negative works the same way with all negatives as the denominator: P(ill | negative) = missed ÷ (missed + true negatives). The "Grouped by result" picture regroups the 1,000 people by test result, boxes the chosen group in orange and dims the rest; the "x: prevalence" curve chart shows how both posteriors change with prevalence (using the sensitivity and specificity from step 2). {#s3e .explain}

::: html step3-1
seePos: Look at the positives
seeNeg: Look at the negatives
c3aria: 1,000 people regrouped by test result, with the chosen group boxed
c3baria: Curves of the posterior probabilities against prevalence
lgCurvePos: P(ill | positive)
lgCurveNeg: P(ill | negative)
lgTrail: prevalences you visited
clearTrail: Clear the trail
:::

What to try: choose "Look at the positives" and drag prevalence from 0.5% to 30% while watching the mix of pink and cyan inside the orange box; the white dot on the curve chart leaves a trail along the solid curve. The rarer the disease, the larger the share of false alarms among positives. Then choose "Look at the negatives" and repeat: P(ill | negative) stays small, but at high prevalence it climbs to a few percent, so a negative is not a guarantee. To change sensitivity or specificity, go back to step 2; the curves then change shape and the old trail is cleared. {#s3hint .hint i18n=text}

::: strings
c3titlePos: Grouped by result: orange box = all positives
c3titleNeg: Grouped by result: orange box = all negatives
c3btitle: x: prevalence · y: chance ill after the result
s3readoutPos: Positives: the orange box holds {pos} people, {tp} truly ill and {fp} false alarms. P(ill | positive) = {tp} ÷ {pos} ≈ {ppv}, which is {times} times the prior of {p}. {dom}
s3domFP: False alarms outnumber the ill: the healthy group ({healthy}) is far bigger than the ill group ({ill}), so even a false-positive rate as small as {fpr} applied to it yields more people than there are patients.
s3domTP: The truly ill now outnumber the false alarms: the ill group is big enough.
s3readoutNeg: Negatives: the orange box holds {neg} people, {fn} of them ill but missed. P(ill | negative) = {fn} ÷ {neg} ≈ {inp}, below the prior of {p}; put the other way, {npv} of negatives are healthy.
:::

## "90% of patients test positive" versus "90% of positives are patients": same thing? {#step4 h2=s4t}

Step 4 · Keep the direction straight {#s4k .step-kicker i18n=text}

This step asks: can "the test has 90% sensitivity" be restated as "90% of people who test positive are ill"? No. Both sentences count the same cell, ill and positive, but over **different denominators**. Sensitivity P(positive | ill) counts positives within the **ill row** (the pink row in the table); P(ill | positive) counts ill people within the **positive column** (the orange-boxed column). Treating them as the same is called **confusing the inverse**, and it turns up in check-up reports, news stories and courtroom arguments alike. {#s4e .explain}

::: html step4-1
c4aria: Two proportion bars: the positive share of the ill row and the ill share of the positive column
lgRow: Ill row: P(positive | ill)
lgCol: Positive column: P(ill | positive)
:::

What to try: drag only the prevalence. The "Ill row" bar (its positive share) does not budge, while the "Positive column" bar (its ill share) swings widely. The two share a numerator, so they are equal only when the two denominators happen to match (number ill = number positive). {#s4hint .hint i18n=text}

::: html step4-2
quizPrompt: Think it through: a test with 99% sensitivity and 99% specificity is used to screen a group where 0.1% are ill. Someone tests positive. Roughly how likely is it that they are ill?
quizA: About 99%: the test is 99% accurate
quizB: About 9%: most positives are false alarms
quizC: About 0.1%: a positive tells you nothing
check: Check
:::

::: strings
c4rowA: Ill row ({n} people): {v} test positive
c4rowB: Positive column ({n} people): {v} are ill
s4readout: Prevalence {p}: the ill row has {ill} people, {tp} of them positive, so P(positive | ill) = {se}, unaffected by prevalence; the positive column has {pos} people, {tp} of them ill, so P(ill | positive) = {ppv}, which moves with prevalence.
correct: Right. Of 1,000 people about 1 is ill ({tp} positive), while about {fp} of the 999 healthy people get a false positive. P(ill | positive) = {tp} ÷ {pos} ≈ {ppv}, about {times} times the 0.1% prior: the positive is strong evidence, but the starting point is very low.
wrong: Look at the denominator again: of all the positives, how many come from the ill row and how many from the healthy row? Out of 1,000 people only about 1 is ill, but 999 healthy people can be falsely flagged.
:::

## After one positive, a second test is also positive. What now? {#step5 h2=s5t}

Step 5 · Test again {#s5k .step-kicker i18n=text}

This step asks: after a first positive, a second test also comes back positive; what is the chance of illness now? The calculation is exactly the one from step 3, except that the group is now "the people who tested positive the first time": **yesterday's posterior becomes today's prior**. We assume the tests are **independent** once the true status is fixed: an ill person tests positive with probability equal to the sensitivity every time, a healthy person with probability equal to the false-positive rate every time, and one result does not influence the next. Each extra positive therefore multiplies the ill count by the sensitivity and the healthy count by the false-positive rate, so the healthy group shrinks much faster. **Odds** (ill count : healthy count) make this clearest: every positive multiplies the odds by the same number, the **positive likelihood ratio** = sensitivity ÷ false-positive rate, meaning "how many times likelier a positive is for an ill person than for a healthy one" (<a class="xlink" href="../../../probability/inference/bayes-updating/#step2">→ Bayesian Updating, step 2: why evidence acts as a multiplication</a>). {#s5e .explain}

::: html step5-1
again: Test again: positive again
restart: Start over
c5aria: Bar chart: the share of ill people among those left after several positives in a row
lgIllPos: ill people still in the group
lgHealthyPos: healthy people still in the group
:::

What to try: press "Test again: positive again" three times and watch how much of each new bar is pink (with the default settings, about 27%, 87% and 99%). Then go back to step 2, lower specificity to 80%, come back and press "Start over": the false-positive rate is now 20%, the likelihood ratio drops to 4.5, and each positive pushes the chance up far more slowly. Independence is only an assumption: if both rounds use the same kind of test, whatever caused a false alarm (say, cross-reaction with another antibody) tends to repeat, and the second positive is weaker evidence than computed here. {#s5hint .hint i18n=text}

::: strings
c5title: After k positives in a row: share still ill
c5round: {k} pos.
c5count: {n} left
s5readout0: No test yet: the ill make up the prior {p} of 1,000 people ({ill} : {healthy}). Press "Test again: positive again" to start.
s5readout: After {k} positives in a row: about {ill} ill and {healthy} healthy people remain, so P(ill | {k} positives) = {post}. Odds {o0} × {lr}{kk} = {ok} (positive likelihood ratio = {se} ÷ {fpr} = {lr}). {note}
s5max: This demo stops at the 4th test.
:::

## What decides how much a positive report is worth? {#step6 h2=s6t}

Step 6 · Wrap-up {#s6k .step-kicker i18n=text}

::: html step6-1
s6fin: Recap: the **prior** (prevalence) fixes how many people sit in the ill row and in the healthy row; **sensitivity** and **specificity** split each row into positives and negatives; once the result is in, keep only the matching column and count the ill within it, and you have the **posterior probability**. So what a positive report is worth depends both on the test and on the prior you start from. In screening for a rare disease, even a good test can produce more false alarms than true cases among its positives; the usual response is to confirm with a different, independent test rather than to draw conclusions straight away.
formula: "P(ill | +) = P(+ | ill)·P(ill) ÷ [P(+ | ill)·P(ill) + P(+ | healthy)·P(healthy)]\nposterior odds = prior odds × sensitivity ÷ (1 − specificity)"
boundary: Scope: head counts on this page are expected counts, and real samples scatter around them. The prevalence must be the prevalence among people tested in your situation: people with symptoms or in a high-risk group start from a much higher prior, which changes what the same positive report means. The repeat-test calculation assumes results are independent once the true status is fixed. This is a teaching model, not a clinical calculator, and it is not medical advice.
linksTitle: Where to go next
lk1: Bayesian Updating · step 2: why evidence acts as a multiplication →
lk2: Bayesian Updating · step 3: chaining one piece of evidence after another →
lk3: Hypothesis Testing · step 3: misses and power, another pair of error types →
lk4: Probability & Frequency · step 2: why proportions need large samples to settle →
:::
