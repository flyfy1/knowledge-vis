---
lang: en
title: Stablecoins, CBDCs and New Kinds of Money · A Hands-on Essay
desc: What makes a stablecoin worth exactly one dollar? From what counts as money and its tiers, settlement and cross-border payments, why bitcoin is a poor unit of account, how reserve-backed stablecoins hold their peg through arbitrage, how runs break it, the UST death spiral and how issuers earn from Treasury bills, to how the e-CNY differs from Alipay, the US GENIUS Act, EU MiCA and Hong Kong's Stablecoins Ordinance, and where things stand in November 2026. Six hands-on models; mechanisms only, not investment advice.
---

::: strings
nav.back: ← Index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.pct: [EN pending] {v}
u.cents: [EN pending] {v}
u.usd: [EN pending] {v}
u.bn: [EN pending] {v}
u.eur: [EN pending] {v}
u.hours: [EN pending] {v}
u.days: [EN pending] {v}
u.yr: [EN pending] {v}
u.x: [EN pending] {v}
u.none: [EN pending]
u.never: [EN pending]
u.nocap: [EN pending]
:::

# Stablecoins, CBDCs and New Kinds of Money {#hero}

::: strings
kicker: [EN pending]
:::

[EN pending] {.sub}

[EN pending] {.lead}

[EN pending] [[where-money-comes-from]] [[why-one-rate-moves-everything]] {.note}

## [EN pending] {#ch1}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

[EN pending]

::: diagram dg-tiers keys=dg.tiers
cap: [EN pending]
aria: [EN pending]
h: [EN pending]
t1: [EN pending]
d1: [EN pending]
t2: [EN pending]
d2: [EN pending]
t3: [EN pending]
d3: [EN pending]
t4: [EN pending]
d4: [EN pending]
ar: [EN pending]
:::

[EN pending] [[where-money-comes-from#ch2|EN]] [[where-money-comes-from#ch3|EN]]

[EN pending]

[EN pending] {.take}

## [EN pending] {#ch2}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

[EN pending] [[why-one-rate-moves-everything#ch5|EN]]

::: diagram dg-chain keys=dg.chain
cap: [EN pending]
aria: [EN pending]
t1: [EN pending]
t2: [EN pending]
a1: [EN pending]
a2: [EN pending]
a3: [EN pending]
a4: [EN pending]
b1: [EN pending]
b2: [EN pending]
b3: [EN pending]
fee: [EN pending]
ramp: [EN pending]
fin: [EN pending]
fin2: [EN pending]
:::

[EN pending]

[EN pending]

[EN pending] {.take}

## [EN pending] {#ch3}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending] [[a-secret-in-public]] [[distributed-systems]] [[hashing]]

[EN pending] {=ch3.lo} {=ch3.hi}

::: lab ch3-model
model.title: [EN pending]
model.how: [EN pending]
ctl.sigma: [EN pending]
ctl.days: [EN pending]
ctl.band: [EN pending]
read.band: [EN pending]
read.out: [EN pending]
read.per: [EN pending]
read.sim: [EN pending]
range: [EN pending] {lo} {hi}
cv.x: [EN pending]
cv.y: [EN pending]
cv.band: [EN pending]
cv.reset: [EN pending]
cv.aria: [EN pending]
say.calm: [EN pending] {gap}
say.some: [EN pending] {gap} {per}
say.often: [EN pending] {gap} {per}
:::

[EN pending] {=ch3.per} {=ch3.gap} {=ch3.sim} {=ch3.per25} {=ch3.calmYears}

[EN pending]

[EN pending] {.take}

## [EN pending] {#ch4}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

::: diagram dg-coin keys=dg.coin
cap: [EN pending]
aria: [EN pending]
iss: [EN pending]
asset: [EN pending]
liab: [EN pending]
a1: [EN pending]
a2: [EN pending]
l1: [EN pending]
mint: [EN pending]
redeem: [EN pending]
pri: [EN pending]
sec: [EN pending]
arb: [EN pending]
:::

[EN pending] <a href="../what-sets-an-exchange-rate/#ch8">EN</a>

::: lab ch4-model
model.title: [EN pending]
model.how: [EN pending]
ctl.fee: [EN pending]
ctl.cap: [EN pending]
ctl.jump: [EN pending]
ctl.closed: [EN pending]
read.min: [EN pending]
read.out: [EN pending]
read.red: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.closed: [EN pending]
cv.aria: [EN pending]
say.held: [EN pending] {min} {out}
say.shut: [EN pending] {min} {out}
say.none: [EN pending] {out} {min}
:::

[EN pending] {=ch4.min} {=ch4.hours} {=ch4.outOpen} {=ch4.minShut} {=ch4.outShut} {=ch4.outNone}

[EN pending]

[EN pending] {.take}

## [EN pending] {#ch5}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

::: diagram dg-waterfall keys=dg.waterfall
cap: [EN pending]
aria: [EN pending]
q: [EN pending]
first: [EN pending]
mid: [EN pending]
last: [EN pending]
r1: [EN pending]
r2: [EN pending]
r2b: [EN pending]
r3: [EN pending]
buf: [EN pending]
:::

[EN pending] [[where-money-comes-from#ch3|EN]] <a href="../why-banks-run/#ch4">EN</a>

::: lab ch5-model
model.title: [EN pending]
model.how: [EN pending] {tol} {tol}
pre.hole: [EN pending]
pre.panic: [EN pending]
pre.genius: [EN pending]
pre.mixed: [EN pending]
ctl.liq: [EN pending]
ctl.hair: [EN pending]
ctl.loss: [EN pending]
ctl.buf: [EN pending]
ctl.jumpy: [EN pending]
read.v0: [EN pending]
read.r: [EN pending]
read.avg: [EN pending]
read.unpaid: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.par: [EN pending]
cv.tol: [EN pending]
cv.out: [EN pending]
cv.aria: [EN pending]
say.calm: [EN pending] {v0} {r}
say.partial: [EN pending] {r} {v}
say.all: [EN pending] {avg}
say.default: [EN pending] {v0} {r} {unpaid} {avg}
:::

[EN pending] {=ch5.loss} {=ch5.jumpy} {=ch5.v0} {=ch5.unpaid} {=ch5.avg}

[EN pending] {=ch5.pLiq} {=ch5.pHair} {=ch5.pJumpy} {=ch5.pBuf} {=ch5.pV0} {=ch5.pUnpaid}

[EN pending] <a href="../why-banks-run/#ch7">EN</a> {.take}

## [EN pending] {#ch6}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

::: diagram dg-terra keys=dg.terra
cap: [EN pending]
aria: [EN pending]
s1: [EN pending]
s1b: [EN pending]
s2: [EN pending]
s2b: [EN pending]
s3: [EN pending]
s3b: [EN pending]
s4: [EN pending]
s4b: [EN pending]
s5: [EN pending]
s5b: [EN pending]
s6: [EN pending]
s6b: [EN pending]
mid: [EN pending]
:::

[EN pending]

[EN pending]

::: lab ch6-model
model.title: [EN pending]
model.how: [EN pending] {shock}
ctl.cover: [EN pending]
ctl.depth: [EN pending]
ctl.cap: [EN pending]
ctl.shock: [EN pending]
ctl.reserve: [EN pending]
read.thr: [EN pending]
read.halt: [EN pending]
read.drop: [EN pending]
read.sup: [EN pending]
read.minP: [EN pending]
read.left: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.y2: [EN pending]
cv.p: [EN pending]
cv.c: [EN pending]
cv.aria: [EN pending]
say.safe: [EN pending] {c} {thr} {drop} {minP}
say.spiral: [EN pending] {c} {thr} {halt} {sup} {left}
say.saved: [EN pending] {res}
:::

[EN pending] {=ch6.cover} {=ch6.depth} {=ch6.thr} {=ch6.shock} {=ch6.halt} {=ch6.supX} {=ch6.pHalt} {=ch6.h35} {=ch6.drop45} {=ch6.resHalt}

[EN pending]

[EN pending] {.take}

## [EN pending] {#ch7}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

::: diagram dg-income keys=dg.income
cap: [EN pending]
aria: [EN pending]
tr: [EN pending]
iss: [EN pending]
int: [EN pending]
dist: [EN pending]
cost: [EN pending]
pro: [EN pending]
hold: [EN pending]
:::

[EN pending]

::: lab ch7-model
model.title: [EN pending]
model.how: [EN pending]
ctl.r: [EN pending]
ctl.eta: [EN pending]
ctl.delta: [EN pending]
read.u: [EN pending]
read.inc: [EN pending]
read.dist: [EN pending]
read.pro: [EN pending]
read.be: [EN pending]
read.best: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.best: [EN pending]
cv.aria: [EN pending]
say.low: [EN pending] {r} {u} {pro}
say.mid: [EN pending] {r} {u} {inc} {pro} {best}
say.high: [EN pending] {r} {best}
say.loss: [EN pending] {r} {pro}
:::

[EN pending] {=ch7.be} {=ch7.shrink} {=ch7.best}

[EN pending] {.take}

## [EN pending] {#ch8}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

::: diagram dg-ecny keys=dg.ecny
cap: [EN pending]
aria: [EN pending]
h1: [EN pending]
h2: [EN pending]
k1: [EN pending]
v1: [EN pending]
k2: [EN pending]
v2: [EN pending]
k3: [EN pending]
v3: [EN pending]
k4: [EN pending]
v4: [EN pending]
k5: [EN pending]
v5: [EN pending]
k6: [EN pending]
v6: [EN pending]
:::

[EN pending]

[EN pending]

::: lab ch8-model
model.title: [EN pending]
model.how: [EN pending] {=ch8.med}
ctl.cap: [EN pending]
ctl.take: [EN pending]
ctl.kind: [EN pending]
kind.central: [EN pending]
kind.bank: [EN pending]
read.mean: [EN pending]
read.capped: [EN pending]
read.share: [EN pending]
read.liq: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.liq: [EN pending]
cv.aria: [EN pending]
say.ok: [EN pending] {cap} {share} {liq}
say.tight: [EN pending] {cap} {share} {liq}
say.short: [EN pending] {share} {liq}
say.bank: [EN pending]
:::

[EN pending] {=ch8.mean} {=ch8.capped} {=ch8.share} {=ch8.liq} {=ch8.ofLiq} {=ch8.calm} {=ch8.c10}

[EN pending] {.take}

## [EN pending] {#ch9}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

::: html dg-rules keys=dg.rules
c1: [EN pending]
c2: [EN pending]
c3: [EN pending]
r1: [EN pending]
r1a: [EN pending]
r1b: [EN pending]
r1c: [EN pending]
r2: [EN pending]
r2a: [EN pending]
r2b: [EN pending]
r2c: [EN pending]
r3: [EN pending]
r3a: [EN pending]
r3b: [EN pending]
r3c: [EN pending]
r4: [EN pending]
r4a: [EN pending]
r4b: [EN pending]
r4c: [EN pending]
:::

[EN pending] {=ch5.gHair} {=ch5.gV0}

[EN pending]

[EN pending] <a href="../../markets/when-buyers-cant-see-quality/">EN</a>

[EN pending] {.take}

## [EN pending] {#ch10}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

### [EN pending] {#h.est .sub3}

{.fl}
- [EN pending] {#e1}
- [EN pending] {#e2}
- [EN pending] {#e3}

### [EN pending] {#h.dem .sub3}

{.fl}
- [EN pending] {=f.usdtShare} {=f.top2} <a href="../what-sets-an-exchange-rate/#ch11">EN</a> {#d1}
- [EN pending] <a href="../../../investment/rates/what-the-yield-curve-says/">EN</a> {#d2}
- [EN pending] {#d3}
- [EN pending] {#d4}

### [EN pending] {#h.claim .sub3}

{.fl}
- [EN pending] {=f.billShare} {=f.excess} {#c1}
- [EN pending] {=f.payShare} {#c2}
- [EN pending] {#c3}
- [EN pending] {#c4}
- [EN pending] {#c5}

[EN pending] {.take}

## [EN pending] {#ch11}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

{.qs}
- [EN pending] {#q1}
- [EN pending] {#q2}
- [EN pending] {#q3}
- [EN pending] {#q4}
- [EN pending] {#q5}

[EN pending] {#sum .sum}

[EN pending] [[where-money-comes-from]] [[why-one-rate-moves-everything]] [[compound-interest]] [[a-secret-in-public]] [[distributed-systems]] {#links}

::: footer
[EN pending]

[EN pending]
:::
