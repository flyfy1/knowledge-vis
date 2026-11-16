---
lang: en
---

::: strings
docTitle: Fractions · Cutting the Whole into Equal Parts — One Interaction at a Time
back: ← Knowledge Index
pageTitle: Fractions · One Number, Cut to Size
tagline: A fraction is not two numbers stacked on top of each other — it is one number: cut the whole into equal parts, take some of them. Once that clicks, equivalence, comparison and addition are all corollaries of the same picture. On this page every cell is truly equal and every value is computed with exact integers — what you measure, what you say and what you compute must be the same number.
foot: visual.integ.life · Fractions —— one interaction at a time
:::

## One Chocolate Bar, Two Ways to Cut It {#step0 h2=s0t}

::: strings
nav0: 0 Two Ways to Cut
:::

Step 0 · The Hook {#s0k .step-kicker i18n=text}

This step answers: **1/2 and 2/4 are written completely differently — which side is actually more?** The same chocolate bar, shared two ways: on the left it is cut into **2 parts, take 1**; on the right into **4 parts, take 2**. Do not calculate yet: guess with your eyes which side gets more, then stack the two pieces and see. {#s0e .explain}

::: html step0-1
s0guessQ: Guess first: who gets more chocolate?
s0bLeft: Left gets more
s0bSame: The same
s0bRight: Right gets more
s0bReveal: Stack them and see
:::

Lesson one about fractions: **how many parts (the denominator)** and **how many you take (the numerator)** must be read together. Looking at either number alone, you can never tell the size. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
s0roIdle: Two identical bars, only the cutting differs. Pick a guess, then press “Stack them and see”.
s0roGuess: Your guess: {g}. Press “Stack them and see” to check.
s0guessLeft: left gets more
s0guessSame: the same
s0guessRight: right gets more
s0roWin: Correct — <b>exactly the same</b>! Stacked, they coincide edge to edge: 2/4 is 1/2, just with every part cut in half once more. The pieces got smaller; the total did not change.
s0roLose: Look at the stack once more: the two pieces coincide <b>exactly — they are equal</b>. 2/4 is 1/2: the pieces are cut finer, the share is unchanged.
s0roReveal: Stacked, they coincide exactly: <b>the same amount</b>! 2/4 is 1/2 — every part cut in half once more; smaller pieces, same total.
cLeft: Left: cut 2, take 1
cRight: Right: cut 4, take 2
cSame: Perfect overlap!
:::

## Denominator = How You Cut, Numerator = How Many You Take {#step1 h2=s1t}

::: strings
nav1: 1 One Number
:::

Step 1 · A Fraction Is One Number {#s1k .step-kicker i18n=text}

This step answers: **is a fraction one number, or two numbers stacked on top of each other?** Drag the slider to change the cutting, click cells on the bar (or use the buttons) to change how many you take. One sentence to keep: **the denominator says into how many equal parts the whole is cut; the numerator says how many of them you take**. The thin number line below shows where this fraction, as a number, sits between 0 and 1. {#s1e .explain}

::: html step1-1
s1denLab: Cut into how many equal parts (denominator)
s1minus: − Take one fewer
s1plus: + Take one more
s1clear: Clear
s1full: Take all
:::

The cells must be **truly equal**: on this page every cell width is the same whole divided by the number of parts, off by at most one pixel. In the land of fractions, “about the same size” does not count. {#s1hint .hint}

::: strings
s1ro: Cut into <span>{b}</span> equal parts, took <span>{a}</span> of them → the fraction is <b>{a}/{b}</b>
s1roZero: Took none → <b>0/{b}</b>, which is 0. Click the cells to start taking.
s1roFull: Took everything → <b>{b}/{b} = 1</b>, exactly one whole. What if you take more than a whole? See Step 5.
s1decEq: As a decimal: {f} = {dec} (it divides exactly — this is the precise value)
s1decAp: As a decimal: {f} ≈ {dec} (it never divides out — the decimal repeats forever, so only an approximation can be written)
cOne: the whole = 1
cPos: where it sits between 0 and 1
:::

## Cut Finer, Same Proportion {#step2 h2=s2t}

::: strings
nav2: 2 Equivalent Fractions
:::

Step 2 · Equivalent Fractions {#s2k .step-kicker i18n=text}

This step answers: **why do 1/2, 2/4 and 4/8 — all written differently — name the same number?** Cut every cell of 1/2 in two and you get 2/4; again, 4/8. In the three rows, the selected parts **end at the very same vertical line** — one number wearing different outfits. Putting an outfit on is called **expanding** (multiply numerator and denominator by the same number); taking it off is **reducing** (divide both by a common factor). {#s2e .explain}

::: html step2-1
s2expLab: Expand (multiply top and bottom):
s2reset: Back to 1/2
s2redLab: Reduce 12/18:
s2redStep: Reduce one step
s2redGcd: Divide by the GCD at once
s2reset2: Start over
:::

A family of equivalent fractions is one number with many spellings; the simplest spelling (numerator and denominator coprime — sharing no common factor above 1) is like its **ID card**. To test whether two fractions are equal, do not trust their looks — reduce both and compare ID cards, or cross-multiply (next step). {#s2hint .hint}

::: strings
s2roExp: Expand: multiply numerator and denominator of {f0} by {k} → <b>{f1}</b>. More cells, smaller cells — the total length selected has not moved at all.
s2roExpMax: Already cut very fine (denominator {d}); multiplying further would squash the cells into a blur — press “Back to 1/2” to restart.
s2roRed: One reduction step: divide numerator and denominator of {f0} by {p} → <b>{f1}</b>.
s2roRedDone: Fully reduced: 12/18 → <b>2/3</b>. 2 and 3 share no common factor above 1 (gcd(2, 3) = 1), so 2/3 is the simplest form of 12/18.
s2gcd: The greatest common divisor gcd(12, 18) = <b>{g}</b>: divide both by {g} in one go, 12/18 → 2/3 — same destination as step by step.
cRows: Three rows: selected parts end at the same line
cExp: Expanding: multiply both by one number
cRed: Reduction chain: 12/18, step by step
:::

## Align the Scales First, Then Compare {#step3 h2=s3t}

::: strings
nav3: 3 Comparing
:::

Step 3 · Comparing Fractions {#s3k .step-kicker i18n=text}

This step answers: **how do you compare two fractions with different denominators — reliably?** With different denominators the cells are different sizes, so comparing numerators alone is meaningless. There are two honest ways to check: **cross-multiplication** (for a/b vs c/d, compute a×d and c×b — plain integers, no room for error) and a **common denominator** (re-cut both bars into lcm(b, d) cells — lcm is the least common multiple of the two denominators — and compare counts). Both roads must reach the same verdict — and your eyes get to guess first. {#s3e .explain}

::: html step3-1
s3labA: Left a/b
s3labB: Right c/d
s3next: Another pair
s3guessQ: Guess with your eyes first:
s3bLeft: Left is bigger
s3bSame: They are equal
s3bRight: Right is bigger
s3verify: Verify both ways
:::

Why not just compare numerators? Because **the numerator counts cells, and the denominator sets the size of each cell**. It is like asking whether 3 centimetres beat 2 inches — align the units first, then the answer means something. And beware the shortcut “bigger denominator means smaller fraction”: that only holds when the numerators are equal. Here we always compare whole fractions. {#s3hint .hint}

::: strings
s3roIdle: Now comparing <b>{a}/{b}</b> and <b>{c}/{d}</b>. Guess first, then press “Verify both ways”.
s3roGuess: Your guess: {g}. Press “Verify both ways” to check — changing your mind is fine; only your last pick counts.
s3guessLeft: left is bigger
s3guessSame: they are equal
s3guessRight: right is bigger
s3roCross: Cross-multiply: {a}×{d} = <b>{ad}</b> and {c}×{b} = <b>{cb}</b>. Since {ad} {rel} {cb}, we get {a}/{b} {rel} {c}/{d}.
s3roLcm: Common denominator: the least common multiple lcm({b}, {d}) = <b>{l}</b>. {a}/{b} = {A}/{l} (takes {A} cells), {c}/{d} = {C}/{l} (takes {C} cells). Counts {A} {rel} {C} — same verdict.
s3verdictWin: Your eyes win this round! Eyes, cross-multiplication and common denominator — all three agree: <b>{a}/{b} {rel} {c}/{d}</b>.
s3verdictLose: The differently-sized cells fooled your eyes this time. Both checks agree: <b>{a}/{b} {rel} {c}/{d}</b>.
s3verdictNone: Both roads agree: <b>{a}/{b} {rel} {c}/{d}</b>. (Next time, guess first — it is more fun.)
relGt: >
relEq: =
relLt: <
relGtW: is greater than
relEqW: equals
relLtW: is less than
cLcmRow: After aligning (both cut into {l} parts)
:::

## Addition: Align the Scales, Then Add {#step4 h2=s4t}

::: strings
nav4: 4 Add: Align First
:::

Step 4 · Addition {#s4k .step-kicker i18n=text}

This step answers: **why can’t you add fractions by “adding the tops and adding the bottoms”?** That is the most common mistake. What is wrong with it? Join the **true lengths** of 1/2 and 1/3 end to end, set them next to the wrong answer 2/5 — the gap speaks for itself. The correct route is unique: find a common denominator first, turning two differently-graduated rulers into one. {#s4e .explain}

::: html step4-1
s4add: Add: 1/2 + 1/3
s4sub: Subtract: 5/6 − 1/3
s4wrong: See the common mistake first
s4right: Now the correct way
s4reset: Reset
:::

A common denominator is not a rule teachers invented — it is a necessity: **with cells of different sizes, numerators cannot be added or subtracted directly**. Align the graduations first (that is all “common denominator” means), and what remains is just counting cells. {#s4hint .hint}

::: strings
s4roIdleAdd: Problem: 1/2 + 1/3. Press “the common mistake” first, then “the correct way”, and compare.
s4roIdleSub: Problem: 5/6 − 1/3. Subtraction follows the same rule as addition: align first, then subtract. Press “the correct way”.
s4roWrong: The mistake: add tops, add bottoms → 2/5. But joining the true lengths above clearly reaches the 5/6 mark — longer than 2/5 by <b>13/30</b> (= 5/6 − 2/5). The answer falls well short; the error is plain to see.
s4roRightAdd: The correct way: the least common multiple lcm(2, 3) = <b>6</b>. Re-cut 1/2 into 3/6 and 1/3 into 2/6; with the scales aligned, the numerators simply add: 3/6 + 2/6 = <b>5/6</b> ≈ 0.8333…. The two bars below line up exactly — that is the proof.
s4roRightSub: Subtraction, same idea: the least common multiple lcm(6, 3) = <b>6</b>. Re-cut 1/3 into 2/6 and take 2 cells away from 5/6: 5/6 − 2/6 = 3/6, which reduces to <b>1/2</b>.
cWrongTag: The wrong answer 2/5
cTrueTag: The two true lengths, joined
cGapTag: short by 13/30
cResTag: The correct result
cJoinTag: joined
cCutTag: the part taken away from 5/6
:::

## Beyond One Whole: Two Ways to Write It {#step5 h2=s5t}

::: strings
nav5: 5 Beyond One Whole
:::

Step 5 · Improper Fractions & Mixed Numbers {#s5k .step-kicker i18n=text}

This step answers: **when the numerator is bigger than the denominator, is it still a proper number — and how do you read it?** A numerator bigger than the denominator is not a disaster — it simply means **more than one whole**. 7/4 says “cut into 4, take 7”: fill the first whole (4 parts), then take 3 more from the second. The other spelling: 1 whole and 3/4 more, written **1¾** — a mixed number. Same number, two spellings, and division is the translator. {#s5e .explain}

::: html step5-1
s5barsT: Count cell by cell: how many wholes does it fill?
s5imp: Improper-fraction spelling
s5mix: Mixed-number spelling
s5next: Another fraction
s5candT: A fraction acting on a quantity: a box of 12 candies
s5bLab: Take this fraction of the box:
:::

Neither spelling is “better”: improper fractions are handier for calculating, mixed numbers are handier for saying out loud (“one and three-quarter cups of water”). What matters is translating freely — and the key is division: numerator ÷ denominator. {#s5hint .hint}

::: strings
s5roImp: <b>{n}/{d}</b>: {n} ÷ {d} = {q} remainder {r} → it fills {q} whole(s) with {r} parts left over → the mixed number <b>{q} {r}/{d}</b>.
s5roInt: <b>{n}/{d}</b>: {n} ÷ {d} = {q} exactly! It is the integer <b>{q}</b> in disguise — an integer wearing fraction clothes.
s5roMix: Mixed number <b>{q} {r}/{d}</b>: {q} whole(s) ({qd} parts) plus {r} more parts makes {n} parts in total → the improper fraction <b>{n}/{d}</b>. The two spellings convert freely.
s5roMixInt: The integer <b>{q}</b>: exactly {q} wholes ({qd}/{d}), nothing left over.
s5bro: <b>{n}/{d}</b> of a box of <span>12</span>: first split 12 into {d} equal shares — each share is 12 ÷ {d} = <span>{per}</span> candies; take {n} shares → {per} × {n} = <b>{taken} candies</b>. Exactly {taken} candies are lit up in the picture — count them.
cWhole: whole {i}
:::

## One Family on the Number Line: Fractions, Decimals, Percents {#step6 h2=s6t}

::: strings
nav6: 6 Finale · Three Faces
:::

Step 6 · Finale {#s6k .step-kicker i18n=text}

This step answers: **are fractions, decimals and percents three kinds of numbers, or three spellings of the same numbers?** One last game: drop numbers onto a number line from 0 to 3. Fractions, decimals and percents take turns — and **different spellings of the same value must land on exactly the same point**. Every landing position is computed from the true value; measure and check that nobody cheats. {#s6e .explain}

::: html step6-1
s6next: Drop the next one
s6reset: Clear and restart
c1h: Three Faces of One Number
c1: Fractions, decimals and percents are three spellings of the same numbers: turn the denominator into 10 or 100 and you get the decimal and the percent. When the division never ends (like 1/3) the decimal repeats forever and only **≈** can be written — but the fraction spelling stays exact.
c2h: Where Fractions Lead
c2: Two tools from this page will serve you for years: **common denominators run on the least common multiple; reducing runs on the greatest common divisor**. In junior school the numbers in fractions turn into letters — the rules stay exactly the same: align the scales first, then work on the numerators.
c3h: Now Practise
c3: Understanding is not the same as being able to do it. The sister site **homework.integ.life** has fraction exercises (common denominators, reducing, comparing, adding and subtracting) with instant checking.
s6fin: A fraction is the first moment a child meets “a number that does not look like an integer”. Step across, and the world of numbers doubles in width: between any two integers live infinitely many more numbers, every one of which can be cut out, measured and computed with.
s6lkMc: Next stop: ratios grow up into probability — toss enough, and frequency shows probability’s face →
:::

::: strings
s6roIdle: Press “Drop the next one” and watch where the first number lands.
s6roItem: <b>{label}</b> lands at {val}.
s6roSame: <b>{label}</b> lands at {val} — <b>the exact same point</b> as {others} dropped earlier! Different spelling, same number.
s6roRep: <b>{label}</b> lands at {val} (its decimal is {dec}, repeating forever; the landing uses the exact fraction value, not the decimal approximation).
s6roDone: All dropped: 1/2 = 0.5 = 50% share a point, and 5/4 = 1.25 = 125% share a point. Three faces, one number.
:::
