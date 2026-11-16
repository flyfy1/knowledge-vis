---
lang: en
---

::: strings
docTitle: Equations on a Balance · Do the Same to Both Sides — One Interaction at a Time
back: ← Knowledge Index
pageTitle: Equations on a Balance · Do the Same to Both Sides
tagline: The equals sign is not a “compute the answer” button; it is the needle of a balance — at zero, both sides weigh the same. This page teaches one move only: whatever you do, do the same to both sides — and use it to leave x alone on the left.
foot: visual.integ.life · Equations on a Balance —— One Interaction at a Time series
cLeft: Left pan
cRight: Right pan
cBeam: Beam
cPointer: Needle
compFull: Left pan: {L} · Right pan: {R}
compBoxes: {n} box(es)
compUnits: {n} unit(s)
compEmpty: empty
roBalanced: {comp}<br>Equation: <b>{expr}</b> — both sides weigh the same: <b>balanced</b>.
roLeftHeavy: {comp}<br>Equation: <b>{expr}</b> — the left side is heavier: <b>not balanced</b>.
roRightHeavy: {comp}<br>Equation: <b>{expr}</b> — the right side is heavier: <b>not balanced</b>.
:::

## A Sealed Box of Unknown Weight {#step0 h2=s0t}

::: strings
nav0: 0 Meet the Balance
:::

Step 0 · Meet the Balance {#s0k .step-kicker i18n=text}

The question for this step: **a sealed box (no opening it) — can you find its weight with nothing but a balance and some weights?** First, the parts: the balance has a **left pan and a right pan**, a **beam** across the top and a **needle** in the middle — when the needle points at the center mark and the beam is level, the balance is **balanced** (both sides weigh the same). The small blocks are **weights**; the smallest counts as 1 **unit** on this page (no grams or kilograms). The box’s weight is unknown for now, but it is a definite number — mathematics calls such a quantity an **unknown** and writes the letter **x** as a placeholder. {#s0e .explain}

::: html step0-1
:::

The beam's tilt is exaggerated for visibility; balance is judged only by whether the two sides weigh the same. {#tiltNote .note .tiltnote i18n=text}

::: html step0-2
s0add: ＋ Add one weight
s0remove: － Remove one weight
s0swap: Swap the box (weigh again)
:::

The point: a box’s weight is **definite** — not knowing it yet does not mean it is not there. That is exactly what the unknown x means. One honest note about this page’s setup: this is an **ideal balance** (no friction, a perfect needle). A real balance has a sensitivity limit — a tiny difference may not tilt it visibly. On this page, a difference of 1 unit already counts as unbalanced; that is a teaching simplification. All weights and box weights on this page are whole numbers of units. {#s0hint .hint}

::: html step0-3
start: Start exploring ↓
:::

::: strings
ckTitle: Observation checklist (for yourself — nothing is blocked)
s0roIdle: There is a sealed box on the left pan. Add weights to the right pan one at a time until the beam levels out — note: the readout only tells you which side is heavier, never by how much. The “how much” is exactly what you are weighing.
s0roLeft: The left side is still heavier — the box outweighs the current weights. Add more to the right pan.
s0roRight: The right side has tipped over — too many weights. Take some off.
s0roBalanced: Level! The right pan holds <b>{n}</b> units — so this box weighs <b>{n}</b> units. Weighed, without ever opening the box.
s0roSwapped: A new box: same look, unknown weight. The right pan has been cleared — weigh it again.
s0ckItem: Level the balance yourself once
:::

## It Is Balanced — What Keeps It That Way? {#step1 h2=s1t}

::: strings
nav1: 1 Add & Subtract Both Sides
:::

Step 1 · Add & Subtract on Both Sides {#s1k .step-kicker i18n=text}

The question for this step: **the balance is level — if I add things to the pans (or take things off), what can I do without tipping it?** A statement with an equals sign and equal sides is an **equation** — the equals sign is the moment the needle sits at zero. In the picture, the left pan holds 1 box + 2 units and the right pan 8 units (the box was weighed in Step 0 at 6 units, so 6 + 2 = 8: the sides match). Try the four operation buttons. After every move, the readout reports only the **makeup** of each pan (how many boxes, how many units), never the total weight — build the habit of reading the makeup first. {#s1e .explain}

::: html step1-1
s1addU: Add 1 unit to both sides
s1addB: Add 1 box to both sides
s1subU: Remove 1 unit from both sides
s1one: Add 1 unit to the left pan only (try one side)
s1reset: Back to the starting balance
:::

The conclusion: adding the **same amount** to both sides (or removing the same amount) keeps the balance; touching one side only breaks it. This one move has a name: **do the same thing to both sides** — adding and subtracting are its first form. And remember the note by the readout: the tilt is drawn exaggerated; balance is judged only by equal weights. {#s1hint .hint}

::: strings
s1ckAdd: Tried adding to both sides
s1ckSub: Tried removing from both sides
s1ckOne: Tried one side only, and saw it tip
s1lastAddU: Just now: 1 unit added to both sides.
s1lastAddB: Just now: 1 box added to both sides.
s1lastSubU: Just now: 1 unit removed from both sides.
s1lastOne: Just now: 1 unit added to the left pan only — touch one side only, and the balance is gone. Use “Back to the starting balance” and try another move.
s1whySub: Cannot remove: taking 1 unit from both sides needs units on both pans (left has {lb}, right has {rb}) — one side has none.
:::

## Scale Both Sides Up, Scale Both Sides Down {#step2 h2=s2t}

::: strings
nav2: 2 Multiply & Divide Both Sides
:::

Step 2 · Multiply & Divide Both Sides {#s2k .step-kicker i18n=text}

The question for this step: **if I double everything on both pans at once — or keep only one share of each — does the balance hold?** Multiplication is repeated addition and division is fair sharing (both old friends). The picture shows x + 1 = 4 (this box weighs 3 units). Press “Multiply both sides ×2” and watch each pan’s contents being copied; then press “Divide both sides by k” — each pan is split into k equal shares (**dividing evenly**: nothing left over, no halves) and only one share is kept. There is also, as usual, a “left side only” mistake button. {#s2e .explain}

::: html step2-1
s2mul2: Multiply both sides ×2
s2mul3: Multiply both sides ×3
s2divLab: Divide both sides by:
s2one: Multiply the left side ×2 only (try one side)
s2reset: Back to the starting balance
:::

The conclusion: multiplying both sides by the same **non-zero** number, or dividing both sides by a number that **divides them evenly**, keeps the balance. Both conditions matter: multiplying by 0 would turn both sides into 0 and erase all the information, so ×0 is not offered here; and this page never cuts a weight in half, so only even divisions are allowed. {#s2hint .hint}

::: strings
s2ckMul: Tried multiplying both sides
s2ckDiv: Tried dividing both sides
s2ckOne: Tried one side only, and saw it tip
s2lastMul: Just now: both sides ×{k} — everything on each pan was multiplied by {k}, copied out in full.
s2lastDiv: Just now: both sides ÷{k} — each pan was split into {k} equal shares and only one share kept.
s2lastOne: Just now: only the left side was ×2 — touch one side only, and the balance is gone. Use “Back to the starting balance” and try another move.
s2noDiv: Right now the two sides cannot be divided evenly at the same time: the box counts and unit counts share no common divisor greater than 1.
s2cap: This move is paused: it would overflow the picture (at most 6 boxes and 24 units).
:::

## Leave x Alone on the Left {#step3 h2=s3t}

::: strings
nav3: 3 One-Step Equations
:::

Step 3 · One-Step Equations {#s3k .step-kicker i18n=text}

The question for this step: **x + 3 = 7 — what sequence of moves leaves only the box on the left pan and forces x out into the open?** The process of cornering x like this is called **solving the equation**, and the number you corner is the **solution**. Your only tool is the one move: do the same thing to both sides (balanced means equal weights, so it cannot tip). Wrong turns are fine — the balance stays level, you are just not at the goal yet; adjust or reset at any time. {#s3e .explain}

::: html step3-1
:::

Goal: leave exactly 1 box on the left pan (x all alone on one side). {#goalLine .readout .goal i18n=text}

::: html step3-2
histTitle: Your moves so far
:::

The conclusion: there is no trick to solving equations — use “the same thing to both sides” until x is alone on one side; the number left on the other side is its value. Always finish by checking by substituting (put the solution back; both sides must come out equal). Every equation in this step takes one move and has a whole-number answer. {#s3hint .hint}

::: strings
opAmtLab: Amount per move
opAddU: Add {n} unit(s) to both sides
opSubU: Remove {n} unit(s) from both sides
opMul2: Multiply both sides ×2
opMul3: Multiply both sides ×3
opDivLab: Divide both sides by:
opReset: Reset this step
whySubU: Cannot subtract: both sides must give up units together — the left pan has {lb} unit(s) and the right pan {rb}; one side is short of {n}.
whyMulCap: Cannot multiply: the result would pass the limits (at most 6 boxes, 24 units).
whyDivNone: No number currently divides both pans evenly (a divisor must divide the box count and the unit count on both sides).
histAddU: Move {k}: added {n} unit(s) to both sides
histSubU: Move {k}: removed {n} unit(s) from both sides
histMul: Move {k}: multiplied both sides ×{n}
histDiv: Move {k}: divided both sides by {n}
histNone: No moves yet.
rReady: The left pan holds x alone — time to open the box!
rBtn: Open the box
rReveal: Inside the box: the weight of <b>{xv}</b> units — so <b>x = {xv}</b>. You produced this with your own moves; it is not a guess.
rVerify: **Check by substituting** (put the solution back into the original equation): with x = {xv} in {orig}: the left side = {ls} = <b>{lv}</b>, the right side = <b>{rv}</b> — equal ✓
:::

## Two Moves — You Choose the Order {#step4 h2=s4t}

::: strings
nav4: 4 Two-Step Equations
:::

Step 4 · Two-Step Equations {#s4k .step-kicker i18n=text}

The question for this step: **several boxes mixed with weights (2x + 3 = 11) — one move is not enough, so which move goes first and which second?** The number in front of the boxes is the **coefficient** (the 2 in 2x means 2 boxes). The answer: you choose the order — subtract then divide, or divide then subtract; both roads arrive, and the page only cares that x ends up alone. Every move is written into the trail below, so you can see which road you took. {#s4e .explain}

::: html step4-1
s4next: Next problem
:::

The conclusion: a two-step equation is just “the same thing to both sides” used twice. The problems on this page use only positive constants and positive answers; for an equation whose answer is negative (like x + 9 = 4), how signed numbers add and subtract is on <a class="fourier-link" href="../../arithmetic/negative-numbers/#step3">the Negative Numbers page (walking the number line)</a>; for a fractional coefficient (like ½x = 3), ½ is one number, not two — see <a class="fourier-link" href="../../arithmetic/fractions/#step1">the Fractions page (a fraction is a number)</a>. The solving move stays the same either way. {#s4hint .hint}

::: strings
s4qLab: Problem {i} of 3
s4prog: Solved {k} of 3 problems
:::

## Quiz: Three Problems, One Move {#step5 h2=s5t}

::: strings
nav5: 5 Quiz
:::

Step 5 · Quiz {#s5k .step-kicker i18n=text}

The question for this step: **without the balance animation, can you corner x yourself?** Each answer is judged by the equation itself, and the worked solution appears only after you answer correctly; a wrong answer earns a hint, never the answer. Going back to change moves in earlier steps afterwards will not disturb the problems you have already solved. {#s5e .explain}

::: html step5-1
s5cap: The balance for Q1: x + 5 = 12 (left pan: 1 box + 5 units; right pan: 12 units)
s5q1: Q1 (one-step, back to Step 3): x + 5 = 12. Find x.
s5q2: Q2 (two-step, back to Step 4): 2x + 4 = 14. Find x.
s5q3: Q3 (judge the method, back to Steps 1 & 3): to solve x + 6 = 10, which move is correct?
:::

::: strings
q1ok: Correct! Worked solution: remove {n} from both sides — {e0} becomes <b>{e1}</b>; check by substituting: {chk} ✓
q1bad: Not yet. Think of the one move from Step 3: to leave x alone, what should be done to both sides, and by how much?
q2ok: Correct! Worked solution: remove {n1} from both sides — {e0} becomes {e1}; then divide both sides by {n2} — it becomes <b>{e2}</b>; check by substituting: {chk} ✓
q2bad: Not yet. This one takes two moves: clear the constant on the left first (subtract from both sides), then turn the coefficient into 1 (divide both sides). Walk it again in Step 4.
s5q3a: Subtract 6 from both sides
s5q3b: Take the 6 away from the left side only
s5q3c: Take the 6 away from the right side only
s5q3d: Add 6 to both sides
q3ok: Correct! Subtracting 6 from both sides turns x + 6 = 10 into <b>x = 4</b>; check: 4 + 6 = 10 ✓. The only name worth remembering is the move itself: the same thing to both sides.
q3badSide: That move tips the balance: touching one side only makes the two sides weigh differently (look back at Step 1).
q3badAdd: Wrong direction: adding 6 makes the 6 on the left even bigger — further from x alone (look back at Step 3).
s5done: All three correct — one-step equations, two-step equations and judging the method are all yours.
:::

## The Equals Sign Is a Balance {#step6 h2=s6t}

::: strings
nav6: 6 Finale
:::

Step 6 · Finale {#s6k .step-kicker i18n=text}

The question for this step: **this whole page taught exactly one move — which one?** From weighing a box to solving two-step equations, every operation was the same act: guarding one balance. Below is a replay of a Step 4 problem: watch the makeup of the pans get cleaner, frame by frame, from 2x + 3 = 11 down to x = 4. {#s6e .explain}

::: html step6-1
s6fin: There is no chant for solving equations: **guard one balance — whatever you do, do the same to both sides, until x stands alone on one side.** A last reminder of this page’s limits: the balance here is ideal (no friction, a perfect needle) and every weight is a whole number of units. Equations with negative constants or fractional answers cannot be laid out on these pans — build the groundwork for negative numbers and fractions first (the two links below), then carry the same one move over.
lkNeg: How signed numbers add and subtract: walking the number line → (for equations whose answer is negative, like x + 9 = 4)
lkFrac: A fraction is also a number → (for a fractional coefficient, like ½x = 3 — the move is still: the same thing to both sides)
lkLin: An equation grows into a straight line → (when both sides carry x, first see how an expression becomes the line y = kx + b; where two lines meet is the solution — that is Step 3 of that page, right after this one)
:::

::: strings
s6op1: remove 3 from both sides
s6op2: divide both sides by 2
:::
