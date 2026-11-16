---
lang: en
---

::: strings
docTitle: Division & Remainders · Share Fairly, Name What Is Left — One Interaction at a Time
back: ← Knowledge Index
pageTitle: Division & Remainders · Share Fairly, Name What Is Left
tagline: Multiplication gathers things up to count them; division shares them out. Dividing evenly is luck — having something left over is the norm, and that leftover has a name: the remainder. This page starts by dealing out candies, so quotient, remainder, dividend and divisor are all visible in the trays, and ends with one ledger anyone can check: dividend = divisor × quotient + remainder.
foot: visual.integ.life · Division & Remainders —— one interaction at a time
:::

## Dealing Candies: The One That Will Not Divide {#step0 h2=s0t}

::: strings
nav0: 0 Dealing Candies
:::

Step 0 · The Hook {#s0k .step-kicker i18n=text}

The question for this step: **when sharing things out evenly, what do we do when they do not divide?** First, meet the four names inside the candy story: the total to be shared is the **dividend**, the number of children is the **divisor**, how many each child gets is the **quotient**, and what is left at the end is the **remainder**. Below are 17 candies and 4 children; the candies are dealt one by one, in turns — you are the dealer, so deal until you cannot deal fairly any more. {#s0e .explain}

::: html step0-1
s0totalLab: Total candies (dividend)
s0peopleLab: Share among how many children (divisor)
s0deal1: Deal one
s0play: Auto-deal
s0reset: Start over
:::

Keep the two jobs separate: **the quotient answers “how many each”, the remainder answers “how many are left”**. And notice something odd: whatever total you pick, the remainder is always smaller than the number of children. Push the sliders to 30 candies and 2 children — the remainder is still at most 1. Not a coincidence; the next step is all about it. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
s0pause: Pause
s0roIdle: There are <b>{n}</b> candies in the tray, to share among <b>{p}</b> children. Press “Deal one” to deal them singly, or “Auto-deal” to watch it finish the job.
s0roMid: Dealing: <b>{k}</b> candies dealt, <b>{left}</b> still in the tray. Look at the plates — dealing in turns means nobody is ever more than 1 candy ahead of anyone else.
s0roDone: <b>{n} ÷ {p} = {q} … {r}</b>: each child gets <b>{q}</b> (the quotient), and <b>{r}</b> is left (the remainder). Dealing one more to anyone would give them one more than the others — unfair — so we stop here.
s0roExact: <b>{n} ÷ {p} = {q}</b>: shared out exactly, nothing left — the remainder is <b>0</b>.
s0prog: Progress: {k} / {n} candies dealt.
cTray: Tray (candies not yet dealt)
cKid: Child {i}
cEach: {k} each
cRemain: {r} left · that is the remainder
cExact: Shared exactly · remainder 0
:::

## Why the Remainder Must Be Smaller Than the Divisor {#step1 h2=s1t}

::: strings
nav1: 1 Remainder < Divisor
:::

Step 1 · The Test for “Done” {#s1k .step-kicker i18n=text}

The question for this step: **how far must the sharing go before it counts as “done”?** Start with a lazy deal: 17 candies among 3 children, stopping at only 4 each, with 5 still in the tray. Is that “done”? Drag the “each child first gets” slider (that number is the **quotient**) and let the remainder speak: as long as what is left could still give everyone 1 more, the sharing is not finished. {#s1e .explain}

::: html step1-1
s1totalLab: Total candies (dividend)
s1divLab: Share among how many children (divisor)
s1perLab: Each child first gets (quotient)
s1fix: Top up until done
:::

So “remainder &lt; divisor” is not a rule teachers invented — it is the **test for being done**: the moment the remainder reaches the divisor, one more round is possible and the quotient should go up by 1. Check this line first whenever you verify a division. {#s1hint .hint}

::: strings
s1roMore: The ledger: <b>{n} = {d} × {per} + {r}</b>. The remainder <b>{r}</b> is bigger than the divisor <b>{d}</b> — the tray still holds enough to give everyone 1 more. <b>Not done yet!</b> Drag the quotient up, or press “Top up until done”.
s1roEqual: The ledger: <b>{n} = {d} × {per} + {r}</b>. The remainder <b>{r}</b> is exactly equal to the divisor <b>{d}</b> — it is not smaller than the divisor, and the tray still holds enough to give everyone 1 more. <b>Not done yet!</b> Drag the quotient up, or press “Top up until done”.
s1roDone: The ledger: <b>{n} = {d} × {q} + {r}</b>. The remainder <b>{r}</b> &lt; the divisor <b>{d}</b>: what is left cannot give everyone another one — now it is truly done.
s1roExact: The ledger: <b>{n} = {d} × {q} + 0</b>. Shared out exactly, remainder 0 — and 0 is of course smaller than the divisor too.
cTrayR: {r} left in the tray (the remainder)
cGhost: One more round is possible!
cDone: Done ✓ remainder < divisor
:::

## Division Is Jumping Along a Number Line {#step2 h2=s2t}

::: strings
nav2: 2 Jumps on a Number Line
:::

Step 2 · A Second View {#s2k .step-kicker i18n=text}

The question for this step: **ask it differently — how many divisors fit inside the total?** Same numbers as Step 0: start at 0, and let each jump cover exactly one divisor. Each full jump packs one divisor in. Jump until one more jump would overshoot the total, then look at where you stop and what is missing. {#s2e .explain}

::: html step2-1
s2totalLab: Total (dividend)
s2divLab: How far each jump goes (divisor)
:::

The two sliders in this step — “Total (dividend)” and “How far each jump goes (divisor)” — are the very same numbers as Step 0: change them here and the candy dealing there changes too — both steps are always working on the same problem. {#s2shareNote .hint}

::: html step2-2
s2jump: Jump once
s2play: Auto-jump
s2reset: Restart
:::

::: strings
s2pause: Pause
s2roIdle: Start at 0 and jump <b>{d}</b> at a time. See how many full jumps fit inside <b>{n}</b>. Press “Jump once” or “Auto-jump”.
s2roMid: <b>{k}</b> jumps made, landed on <b>{pos}</b>; the target is <b>{n}</b> — there is room for more.
s2roDone: <b>{n} = {d} × {q} + {r}</b>: <b>{q}</b> full jumps land on {qd}, leaving <b>{r}</b> — not enough for one more whole jump (short by {need}). Same quotient {q}, same remainder {r} as the candy dealing in Step 0.
s2roExact: <b>{n} = {d} × {q}</b>: <b>{q}</b> full jumps land exactly on {n}. Remainder 0.
s2hint: One division, two questions: dealing candies asks “how many each”, jumping asks “how many divisors fit in the total” — and the quotient and remainder come out identical. Jumping is also multiplication run backwards: {q} jumps × {d} each = {qd}, exactly the gathering of rows and columns, reversed. To see how multiplication “gathers”, visit <a class="fourier-link" href="../area-model/#step1">Multiplication Is Area · Step 1 (Dots Become Tiles)</a>.
cTarget: Target {n}
cRemain2: {r} left, less than a jump
:::

## What Weekday Is It 100 Days from Now? {#step3 h2=s3t}

::: strings
nav3: 3 What Weekday?
:::

Step 3 · Remainders at Work {#s3k .step-kicker i18n=text}

The question for this step: **what is a remainder actually good for?** Today is Tuesday. Counting 100 days one by one is miserable — but weekdays repeat every 7 days: after any whole number of weeks, the weekday is exactly where it started. So split 100 into “whole weeks + leftover days”, and **only the remainder moves the answer**. Drag the slider to change the day count and watch the landing cell hop. {#s3e .explain}

::: html step3-1
s3daysLab: Count forward this many days
s3quickLab: Try a few:
:::

Anything that goes in circles is remainder-only: weekdays (a circle of 7), clock faces (12), shift rosters, seats around a table… Divide by the circle length first — the quotient counts the laps, **the remainder is the landing spot**. {#s3hint .hint}

::: strings
s3ro: <b>{n} days = 7 × {w} + {r}</b>: {w} whole weeks slip by and the weekday does not budge; count {r} more days and Tuesday lands on <b>{ans}</b>. Only the remainder {r} decided the answer.
s3ro0: <b>{n} days = 7 × {w} + 0</b>: exactly {w} whole weeks, remainder 0 — it is <b>Tuesday</b> again.
cToday: today
cMidWeeks: {m} week(s) in between: every week is a full 7 days, the landing stays in the same column
wShort: Su,Mo,Tu,We,Th,Fr,Sa
wFull: Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday
:::

## Quiz: Sharing Problems and the Check Ledger {#step4 h2=s4t}

::: strings
nav4: 4 Quiz · The Ledger
:::

Step 4 · The Quiz {#s4k .step-kicker i18n=text}

Your turn. Both questions run on the same ledger: **dividend = divisor × quotient + remainder, with remainder &lt; divisor**. Each explanation is revealed only when you answer correctly; get it wrong and the ledger itself will point at the line that fails. The board above is the ledger — every question you solve fills in its row. {#s4e .explain}

::: html step4-1
s4q1: Q1. 23 books are shared equally among 5 children. How many books does each child get, and how many are left?
s4q1a: 4 each, 3 left
s4q1b: 5 each, 2 left
s4q1c: 3 each, 8 left
s4q2: Q2. Checking backwards: ☆ ÷ 6 = 7 … 4. What is the dividend ☆?
s4fin: This whole page runs on one ledger: **dividend = divisor × quotient + remainder, with remainder &lt; divisor**. Dealing candies, jumping on the number line, counting weekdays — three tellings of the same ledger. Faced with any division, write the ledger first and check it afterwards, and the remainder will never fool you.
lkArea: ← Previous stop: multiplication “gathers” rows and columns into a total (Multiplication Is Area · Step 1) — division takes it apart
lkFrac: The leftover 1 candy has a sequel: cut it up to share it, and you get fractions — 17 ÷ 4 = 4¼ (Fractions · Step 5) →
:::

::: strings
s4q1ok: Correct! The ledger: <b>23 = 5 × 4 + 3</b>, and the remainder 3 &lt; 5 children — fully shared, that is the answer.
s4q1fbB: Not quite — check with the ledger: 5 children × 5 books each = 25 books, but there are only 23. <b>Divisor × quotient can never exceed the dividend</b>; this option cannot even be dealt out.
s4q1fbC: Not quite — check with the test: 8 left is more than the 5 children, so everyone could still get 1 more. <b>Not finished: the remainder must be smaller than the divisor.</b>
s4q2ok: Correct! <b>Dividend = divisor × quotient + remainder = 6 × 7 + 4 = 46</b>. Checking problems need no guessing — just run the ledger backwards.
s4q2fbA: 42 = 6 × 7 is only the “divides exactly” part — do not forget the <b>+ remainder 4</b> at the end of the ledger.
s4q2fbC: 52 fails the ledger check: 6 × 7 + 4 = <b>46</b>. Plug any candidate back into dividend = divisor × quotient + remainder and the wrong ones expose themselves at once.
s4allDone: Both correct — you can now check any division problem yourself with the ledger.
cLedger1: Ledger for Q1
cLedger2: Ledger for Q2
cDividend: dividend
cDivisor: divisor
cQuotient: quotient
cRemainder: remainder
:::
