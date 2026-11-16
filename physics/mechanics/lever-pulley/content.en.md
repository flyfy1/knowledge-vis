---
lang: en
---

::: strings
docTitle: Levers & Pulleys · Move the Fulcrum, Feel the Trade — One Interaction per Step
back: ← Knowledge Index
pageTitle: Levers & Pulleys · Move the Fulcrum, Feel the Trade
tagline: How can a small force lift a huge weight? This page keeps two ledgers. The turning ledger is torque: force × lever arm — when both sides match, the lever balances, and sliding the fulcrum changes the force you need at once. But saved force is never free: the work ledger always balances, so every multiple of force saved costs the same multiple of distance. For pulley systems it is even simpler — do not compute, just count the rope segments holding the load. Throughout, g = 10 N/kg and forces are in newtons (N).
foot: visual.integ.life · Levers & Pulleys —— One Interaction per Step series
:::

## The adult scoots toward the fulcrum — and balances the child {#step0 h2=s0t}

::: strings
nav0: 0 Seesaw · Torque
:::

Step 0 · The Seesaw: Torque Enters {#s0k .step-kicker i18n=text}

This step answers one question: **an adult weighs far more than a child — why does scooting toward the pivot let the two balance?** The board turns about the fixed point in the middle, called the **fulcrum**. The farther out someone sits, the “heavier” they press — and what measures that turning push is not force alone but **torque = force × lever arm**. The **lever arm** is the distance from the fulcrum to the line of the force; here gravity pulls straight down, so the arm is simply the horizontal distance to the fulcrum (drawn as a double-headed ruler). Drag the people on the board, or use the sliders, and watch the two torque badges. The board’s own weight is ignored — with the fulcrum dead centre, its torque cancels on the two sides. {#s0e .explain}

::: html step0-1
dragHint0: 3D scene · Drag to orbit; you can also drag a rider on the board to move them (or use the sliders below)
viewBtn: Reset view
s0aLab: Adult position (distance to fulcrum)
s0kLab: Child position (distance to fulcrum)
:::

Conclusion: **turning is decided by torque, not by force alone; equal torques on the two sides mean balance.** One note: the board’s tilt angle on screen is **schematic** (a bigger torque gap tilts it more), while every torque number is truly computed at g = 10 N/kg. Conditions: forces vertical (gravity), and with the board level the arm is the horizontal distance to the fulcrum. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
glFail: The 3D scenes could not load (WebGL is unavailable, or the library files are missing), so this page cannot display in full. Please retry in a modern WebGL-capable browser.
s0ro: Left: {fa} N × {da} m = <span>{ml} N·m</span>; right: {fk} N × {dk} m = <span>{mr} N·m</span>. {verdict}
s0vBal: The two torques are equal — <b>balanced!</b> The heavier person sits closer, and it still levels out.
s0vLeft: The left torque is bigger by {diff} N·m, so the board sinks left. Scoot the adult inward, or the child outward, and hunt for the balance point.
s0vRight: The right torque is bigger by {diff} N·m, so the board sinks right. Scoot the child inward, or the adult outward, and hunt for the balance point.
cAdult: Adult 60 kg
cKid: Child 30 kg
cFulcrum: fulcrum
cBalanced: ✓ Balanced
cTorque: torque {v} N·m
cN: {v} N
cM: {v} m
:::

## Pad the fulcrum closer to the stone, and your hand feels it {#step1 h2=s1t}

::: strings
nav1: 1 Pry Bar Ledger
:::

Step 1 · Pry Bar: The Fulcrum Ledger {#s1k .step-kicker i18n=text}

This step answers: **when prying a boulder, where should the fulcrum go to save the most force — and can the saving be computed on the spot?** A stiff bar that turns about a fulcrum is a **lever**, and a pry bar is one. The force you push down with is the **effort**, its arm the **effort arm**; the boulder’s weight you must overcome is the **resistance**, its arm the **resistance arm**. The boulder weighs G = 800 N and presses on the right end of a 1.5 m bar. Drag the fulcrum slider: as the fulcrum slides, the two arms trade length, the needed effort is computed live from the balance condition, and the ledger shows both sides side by side. {#s1e .explain}

::: html step1-1
dragHint3d: 3D scene · Drag to orbit, or focus the canvas and use the arrow keys
s1lrLab: Resistance arm Lres (fulcrum to stone)
s1try: Try it (pry with the current F)
:::

Conclusion: **the closer the fulcrum hugs the load, the smaller the resistance arm and the longer the effort arm — the more force you save; the saving multiple is Leff/Lres.** But slide the fulcrum until it hugs the stone and F only shrinks — it never reaches zero. There is no effort-free lever. Conditions: the balance bookkeeping of rest or steady prying; the bar’s own weight ignored. {#s1hint .hint}

::: strings
s1ro: Resistance arm Lres = {lr} m, effort arm Leff = {ld} m. To lift the 800 N boulder you need effort F = <span>{f} N</span>: left torque F × Leff = {f} × {ld} = <span>{ml} N·m</span>, right torque G × Lres = 800 × {lr} = <span>{mr} N·m</span> — equal, which is exactly the lever balance condition **F × Leff = G × Lres**. Force saved: Leff/Lres = {ratio}×.
cStone800: Boulder G = 800 N
cHand: hand
cLd: effort arm {v} m
cLr: resistance arm {v} m
cLiftArc: stone rises {v} m along its arc
:::

## Whatever force you save, distance pays back {#step2 h2=s2t}

::: strings
nav2: 2 The Work Ledger
:::

Step 2 · Saving Force Costs Distance: The Work Ledger {#s2k .step-kicker i18n=text}

This step answers: **the part of the force that vanished — did it really disappear for free?** First, a new ledger entry: **work = force × distance moved along the force**, measured in joules (J). Same pry bar (stone G = 600 N): pick an arm ratio, then press “Pry”. The bar turns through one fixed angle; the distance s your hand travels along its arc and the arc length h the stone is lifted are both computed live as “arm × angle”. Below, two “work ledger” bars grow together: the work you put in, Win = F × s, and the work the stone gains, Wout = G × h — watch whether they end up exactly the same length. {#s2e .explain}

::: html step2-1
s2ratioLab: Arm ratio (effort arm : resistance arm)
s2play: ▶ Pry it up
s2ledgerIn: Work in Win = F × s
s2ledgerOut: Work out Wout = G × h
:::

Conclusion: **saving force always costs distance — save N× the force and your hand travels N× as far; Win = Wout, the work ledger never runs a deficit.** Why it must balance: for one shared angle, arc length = arm × angle, so the arc ratio is the arm ratio — exactly the inverse of the force ratio. It is geometry, not approximation. Conditions: the ideal ledger (no friction, no bar weight). {#s2hint .hint}

::: strings
s2replay: Pry again
s2ro: Effort arm {ld} m, resistance arm {lr} m → effort F = <span>{f} N</span>. Hand presses s = {s} m, stone rises h = {h} m: Win = {f} × {s} = <span>{win} J</span>, Wout = 600 × {h} = <span>{wout} J</span> — the two ledgers match to the last digit.
cStone600: Stone G = 600 N
cArcS: s = {v} m
cArcH: h = {v} m
:::

## The wheel at the well mouth saves no force at all {#step3 h2=s3t}

::: strings
nav3: 3 Fixed Pulley
:::

Step 3 · The Fixed Pulley: Direction Only {#s3k .step-kicker i18n=text}

This step answers: **that wheel at the well mouth or flagpole top — does it actually save any force?** A pulley whose axle stays fixed is a **fixed pulley**. One end of the rope holds the load (G = 200 N), the other end is in your hand. The rope slider sets how much rope s you pull out; watch the height h the load rises. Then switch the pull direction (straight down / at an angle) and watch whether the pull force F changes. The whole rope is drawn in one colour and one thickness: in an ideal rope the tension is the same everywhere (no friction, no rope weight). {#s3e .explain}

::: html step3-1
s3down: Pull straight down
s3diag: Pull at an angle
s3sLab: Rope pulled out, s
:::

Conclusion: **a fixed pulley saves neither force nor distance — it only changes the direction of the force.** That direction is exactly what it is worth: you can stand on the ground and pull down, lending your own body weight, instead of climbing up to hug the load. Conditions: ideal pulley (no friction, no rope weight); the pull may point along the rope in any direction, its size never changes. {#s3hint .hint}

::: strings
s3ro: With the fixed pulley: pull force F = <span>{f} N</span>, rope pulled s = {s} m, load rises h = {h} m.<br>Baseline for comparison — lifting directly by hand, no pulley: F is still 200 N, and the load rises exactly as far as your hand lifts it; s and h match to the digit.
cWeight200: Load G = 200 N
cPullDown: pull down
cPullDiag: angled pull
:::

## When the wheel travels with the load, the force is shared by segments {#step4 h2=s4t}

::: strings
nav4: 4 Movable Pulleys & Systems
:::

Step 4 · Movable Pulleys & Systems: Count the Segments {#s4k .step-kicker i18n=text}

This step answers: **what changes when the pulley’s axle moves together with the load?** A pulley whose axle travels with the load is a **movable pulley**; fixed and movable pulleys combined make a **pulley system**. The whole trick is one sentence: the rope segments that directly hold up the movable pulley and the load are the **load-bearing segments** — with that many segments sharing, the pull is that fraction of the total weight. The highlighted segments in the picture are the load-bearing ones; press “Count them one by one” to light them up in turn. Start with a single movable pulley, then switch to the system and change the count. (Ideal bookkeeping: no friction, no movable-pulley or rope weight.) {#s4e .explain}

Count the rope sections supporting the moving pulley, then read F=G/n: more sections mean less force, but less lift for the same rope length. {#s4bridge .hint i18n=text}

::: html step4-1
s4mSingle: Single movable pulley
s4mGroup: Pulley system
s4ropeNote: Rope length is conserved, visibly: however much rope the hand pulls out, the load-bearing segments shorten by exactly that amount in total (each by h = s/n), and the hand travels with the rope end — the rope on screen is never a bit longer or shorter.
s4nLab: Load-bearing segments n
s4n2: 2 segments
s4n3: 3 segments
s4n4: 4 segments
s4sLab: Rope pulled, s
s4count: Count them one by one
:::

Conclusion: **the saving multiple equals the number of load-bearing segments n: F = G/n, paid for with n× the rope distance (h = s/n).** The counting rule: count only the highlighted segments that directly hold the movable pulley and its load. In this page’s winding, an even count sends the free end up out of the movable pulley (that segment bears load — count it), while an odd count lets the free end hang from a fixed pulley (it holds no load — do not count it). Conditions: ideal bookkeeping (no friction, no movable-pulley or rope weight). {#s4hint .hint}

::: strings
s4roA: Single movable pulley: G = 400 N, load-bearing segments n = 2, pull force F = <span>{f} N</span> — exactly half the weight. Rope pulled s = {s} m, load rises h = {h} m; the work ledger once more: Win = {f} × {s} = <span>{win} J</span>, Wout = 400 × {h} = <span>{wout} J</span> — still matching to the digit.
s4roB: Pulley system: G = 600 N, load-bearing segments n = {n}, pull force F = <span>{f} N</span>. Rope pulled s = {s} m, load rises h = {h} m; Win = <span>{win} J</span>, Wout = <span>{wout} J</span> — the ledger balances as always. More segments: smaller F, and less rise for the same pull.
s4countRo: Counted: <b>{n} load-bearing segments</b> in total — the saving multiple is {n}×, F = G/{n}.
cWeight400: Load G = 400 N
cWeight600: Load G = 600 N
cAnchor: fixed end
cFreeUp: pull F ↑
cFreeDown: pull F ↓
:::

## Three questions for three ledgers, then settle the accounts {#step5 h2=s5t}

::: strings
nav5: 5 Quiz · Finale
:::

Step 5 · Self-Test + Finale {#s5k .step-kicker i18n=text}

Every answer hides in the ledgers of the first four steps: torque balance, segment counting, the distance cost. A correct answer locks; a wrong one points you back to the step that holds the key. {#s5e .explain}

Q1. Seesaw: your 80 kg dad sits 1.0 m to the left of the fulcrum. You weigh 40 kg — how far to the right must you sit to balance? {#s5q1 .quiz-q i18n=text}

::: html step5-1
s5q1o0: 1.0 m
s5q1o1: 1.6 m
s5q1o2: 2.0 m
:::

Q2. Pulley system: 3 load-bearing segments hold a 600 N load. How big is the pull force? {#s5q2 .quiz-q i18n=text}

::: html step5-2
s5q2o0: 150 N
s5q2o1: 200 N
s5q2o2: 300 N
:::

Q3. You pull out 3 m of rope on a 4-segment system. How high does the load rise? {#s5q3 .quiz-q i18n=text}

::: html step5-3
s5q3o0: 0.75 m
s5q3o1: 1.25 m
s5q3o2: 12 m
c1h: Torque balance
c1: The turning ledger is torque: when **F × L matches on both sides** (F₁L₁ = F₂L₂), the lever balances. Move the fulcrum, change an arm, and the force needed for the same load changes at once — the adult scoots in and balances the child.
c2h: Saved force costs distance
c2: The work ledger always balances: **Win = Wout**. Save N× the force, pay N× the distance. Check any “effort-saving gadget” against this ledger first: extra work does not exist.
c3h: Count segments, get the multiple
c3: No formula to memorise for pulley systems: count the load-bearing segments n and the pull is **F = G/n**, paid for with n× the rope. The fixed pulley is the special case: one segment, direction only, no force saved at all.
s5fin: From the seesaw to the pulley system it is one set of books: torque rules balance, work rules the total, segments rule the sharing. The inclined plane and the wheel-and-axle are family too — there, the saved force is likewise repaid in distance. When you later meet the page on work and energy, this same ledger continues: energy is simply the name of its grand total.
:::

::: strings
s5q1hint: Hint: go back to Step 0 and balance the ledger — first compute dad’s torque (80×10×1.0); your force is 40×10 N, and your arm must make the two torques equal.
s5q1why: Dad’s torque = 800 N × 1.0 m = 800 N·m; your force is 400 N, so your arm = 800 ÷ 400 = 2.0 m — equal torques balance.
s5q2hint: Hint: go back to Step 4 and count segments — the pull is F = G/n, with n the number of load-bearing segments.
s5q2why: F = G/n = 600 ÷ 3 = 200 N — three segments share the weight.
s5q3hint: Hint: go back to Step 4 and check the cost — h = s/n; more segments, less rise for the same rope.
s5q3why: h = s/n = 3 ÷ 4 = 0.75 m — saving 4× the force costs 4× the rope.
s5ok: "✓ Correct. "
s5no: "✗ Not quite. "
s5idle: Tap an option to answer.
s5hint: All three settled: **2.0 m / 200 N / 0.75 m** — one application each of the torque ledger, the segment count, and the distance cost.
:::
