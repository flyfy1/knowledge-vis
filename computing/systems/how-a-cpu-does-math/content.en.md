---
lang: en
title: How a CPU Does Math: Real Numbers, and Many at Once · A Hands-on Essay
desc: A CPU does hundreds of billions of arithmetic operations on fractions every second, yet it cannot even store 0.1 exactly. This essay starts from 32 bits: how the bits of a floating-point number are laid out, ulps, rounding, subnormals, cancellation, FMA, the FP16, BF16, FP8 and block-scaled formats AI brought into hardware, and then SIMD, AVX-512, SVE and matrix units. A dozen hands-on models, every number computed bit by bit.
---

::: strings
nav.back: ← Index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.pct: {v}%
u.cyc: {v} cycles
u.bits: {v} bits
u.db: {v} dB
u.us: {v} µs
u.ms: {v} ms
u.gf: {v} GFLOPS
u.x: {v}×
mode.rne: round to nearest, ties to even
mode.rtz: toward zero
mode.ru: toward +∞
mode.rd: toward −∞
mode.sr: stochastic rounding
mode.exact: exact value
:::

# How a CPU Does Math: Real Numbers, and Many at Once {#hero}

::: strings
kicker: Computing · Architecture · A hands-on essay
:::

A CPU does hundreds of billions of floating-point operations a second, yet it cannot even store 0.1 exactly.<br>How does it store a fraction, how does it round, and how does one instruction compute a whole row? {.sub}

The CPUs in phones and computers do billions to hundreds of billions of operations a second on numbers with a fractional part: the color of every pixel, every coordinate on a map, every layer of a neural network in a voice assistant. Yet not one of those numbers is exact; even 0.1 is not. This essay asks a single question: **a CPU has only finitely many switches but must compute with infinitely many real numbers, so how does it do it, and what does it give up?** The answer has two halves. The first half (chapters 1–8) is about one number: how its bits are laid out, how dense the grid is, what happens when a value falls between two grid points, how errors accumulate and get amplified, and why AI has cut the bit count all the way down to 8 and 4. The second half (chapters 9–12) is about a row of numbers: where the ability to compute 16, 64, or a whole block of a matrix with one instruction comes from, and what holds it back. {.lead}

The prerequisites are in [[switches-that-compute]] (how switches do addition, and why 0.1 + 0.2 is not 0.3) and [[how-a-cpu-runs-a-program]] (instructions and pipelines). Each model here is a scaled-down version of the real thing: floating-point numbers are rounded bit by bit with exact integer arithmetic, and SIMD and matrix units are counted at the register widths given in the manuals. This essay was written by an AI; the last paragraph of each chapter says what the model leaves out. {.note}

## Fitting a Real Number into 32 Bits {#ch1}

::: strings
toc: Fitting a Real Number into 32 Bits
:::

A floating-point number is binary scientific notation: one sign bit, an exponent field that says where the binary point sits, and a mantissa field that records the significant digits. The number of bits is fixed, so only finitely many values can be stored, and every other number must be replaced by a nearby one. {.law}

A calculator display with ten or so digits can show 6.02 × 10²³ and also 0.000000123. It splits a number into two parts: the significant digits (6.02) and where the decimal point goes (23 places). The first part sets "how precise", the second "how big". A floating-point number does the same thing, only in binary.

The most common 32-bit format (float in C, called binary32 in the standard) splits its 32 bits into three fields: **1 sign bit**, **8 exponent bits**, and **23 mantissa bits**. The exponent field stores "the true exponent plus 127", so the 8-bit values 1 to 254 stand for −126 to +127; the two ends, 0 and 255, are reserved for special uses (chapter 4). That added 127 is called the **bias**. Any nonzero binary number has a leading 1, so that bit is not stored: the 23 mantissa bits are written after the binary point, with an implicit "1." in front. This is the **hidden bit**, which lets 23 stored bits represent 24 significant bits. The value of a number is (−1)<sup>sign</sup> × 1.mantissa × 2<sup>exponent − 127</sup>.

::: diagram dg-f32 keys=dg.f32
cap: Figure 1: 0.1 stored as binary32, 32 bits. Red is the sign, cyan the exponent, gold the mantissa; the bits and values in the figure are computed by the page's model.
aria: Diagram: the 32 bits of binary32 split into a 1-bit sign, an 8-bit exponent and a 23-bit mantissa, filled in with 0.1
ls: Sign
le: Exponent (8 bits)
lm: Mantissa (23 bits)
bs: {=dg.f32.bs}
be: {=dg.f32.be}
bm: {=dg.f32.bm}
vs: +
ve: {=dg.f32.ev}
vm: {=dg.f32.mv}
hid: hidden 1 before the point, not stored
eq: {=dg.f32.val}
eq1: {=dg.f32.val1}
eq2: {=dg.f32.val2}
:::

Try it with 0.1. 0.1 = 1.6 × 2⁻⁴, so the exponent field is −4 + 127 = {=ch1.E01}. In binary, 1.6 is 1.1001 1001 1001…, with the 1001 repeating forever ([[switches-that-compute#ch10|Chapter 10 of How a Pile of Switches Learned to Do Arithmetic]] explains why 0.1 cannot be written out exactly in binary). Twenty-three bits cannot hold an endless repeat, so the mantissa is rounded to nearest at bit 23, and the last bit rounds up: the full 32 bits are {=ch1.hex01}. That is exactly {=ch1.v01}, which is {=ch1.err01} larger than 0.1, a relative error of {=ch1.rel01}.

::: lab ch1-model
model.title: Store a number and see each of its bits
model.how: Enter a decimal (a fraction such as 1/3 also works), pick a format, and see which bits it is stored as, what is stored exactly, and how far off it is. Click any bit to flip it: flipping the lowest exponent bit doubles or halves the value; flipping the last mantissa bit moves it only slightly.
ctl.num: Number
ctl.fmt: Format
bits.aria: The bits of this number; press to flip
bit.s: sign bit
bit.e: exponent bit
bit.m: mantissa bit
bit.aria: Bit {i}, {role}, now {v}
read.hex: Hex
read.exp: Exponent
read.expv: {E} − {b} = {k}
read.exp0: 0 (zero or subnormal)
read.expTop: all 1s (infinity or NaN)
read.err: Error (stored − input)
read.rel: Relative error
read.exact: Stored exactly as
say.norm: {x} stored in {fmt} is <em>{v}</em>, off by {err}, a relative error of {rel}. This number is not on the grid, so it is rounded to a nearby one.
say.exact: {x} falls exactly on a grid point of {fmt}, so it is stored with no error.
say.sub: {x} is very small and falls into the subnormal range (chapter 4): it is stored as {v}, with a relative error of {rel}, which is larger than in the normal range.
say.zero: {x} is less than half the smallest positive {fmt} number, so it is stored as 0.
say.inf: {x} is larger than the largest number {fmt} can represent (about {max}), so it is stored as infinity.
say.bad: Please enter a decimal such as 0.1, -2.5e-3, or a fraction such as 1/3.
say.bits: These bits represent <em>{v}</em>. Editing the input box encodes the number you typed again.
say.nan: All exponent bits are 1 and the mantissa is not all 0: this is NaN, "not a number" (chapter 4).
say.infBits: All exponent bits are 1 and the mantissa is all 0: this is infinity.
:::

Switch to 64 bits (double in C, called binary64 in the standard): 11 exponent bits, 52 mantissa bits, bias 1023. 0.1 is stored as {=ch1.v01d}, with an error {=ch1.ratio} times smaller than binary32's, but still not equal to 0.1. Try FP16 and BF16 as well; they are the stars of chapter 7. Both are 16 bits: FP16 gives 10 bits to the mantissa, while BF16 gives only 7, handing the spare bits to the exponent.

These rules are set by the **IEEE 754** standard. Before its first edition in 1985, each computer maker's floating-point formats differed, and the same program could give different results on different machines. The standard unified both the formats and the results of operations: addition, subtraction, multiplication, division and square root must each give exactly what you get by computing the exact value and rounding it once by the rules (chapter 3). The current version is from 2019. "Compute exactly, round only once" is the starting point for every later chapter.

This model handles only storage: it puts an exact number into the nearest grid cell. It uses integers (JavaScript's BigInt) for exact rational arithmetic, so the displayed error is correct to the last digit. The input box accepts only finite decimals and fractions; an irrational number such as π must first be written as a finite decimal. {.take}

## Grid Spacing Grows with Magnitude: ulp {#ch2}

::: strings
toc: Grid Spacing Grows with Magnitude: ulp
:::

On the number line, floating-point numbers are not evenly spaced: the grid doubles in width with every power of 2. So the larger the number, the larger the absolute error, while the relative error stays roughly the same: for binary32 it never exceeds 2⁻²⁴, about 7 significant decimal digits. {.law}

A game stores "seconds since boot" in a 32-bit float. At first the number is small and can be resolved to well under a microsecond. After {=ch2.h17} hours, the clock can only advance in steps of {=ch2.ms17} ms, about as long as one frame (roughly 16.7 ms). After {=ch2.h18} hours, each step is {=ch2.ms18} ms, longer than a frame, and the animation starts to stutter. Not one line of code has changed; only the size of the number has.

The reason lies in the format from chapter 1. The mantissa has 23 bits, so between 1 and 2 adjacent representable numbers differ by 2⁻²³; between 2 and 4 the same 2²³ numbers must span an interval twice as wide, so the spacing becomes 2⁻²²; and so on. The spacing between adjacent floating-point numbers is called the **ulp** (unit in the last place). The gap between 1 and the next number above it is the **machine epsilon**: {=ch2.eps32} for binary32 and {=ch2.eps64} for binary64.

::: diagram dg-grid keys=dg.grid
cap: Figure 2: the numbers a 3-bit-mantissa toy format can represent between 1 and 8, drawn at their true positions. Each segment holds 8 numbers, and the spacing doubles with every power of 2. binary32 works the same way, except each segment holds 2²³ numbers.
aria: Diagram: on the number line, three segments from 1 to 2, 2 to 4 and 4 to 8, each with 8 ticks; the spacing is 1/8, 1/4 and 1/2 in turn
s1: gap 1/8
s2: gap 1/4
s3: gap 1/2
each: each segment has 8 numbers
rel: relative spacing: 1/16 to 1/8
:::

Divide the spacing by the number itself to get the relative spacing. It swings between 2⁻²³ and 2⁻²⁴: it jumps back to its largest value at each power of 2 and then slowly shrinks as the number grows. Rounding to nearest makes an error of at most half a cell, so for any number in binary32's normal range the relative error is at most 2⁻²⁴ ≈ {=ch2.u32}; for binary64 it is 2⁻⁵³ ≈ {=ch2.u64}, roughly 16 decimal digits.

::: lab ch2-model
model.title: How wide the grid is around a number
model.how: Drag the magnitude of the number (on a power-of-2 scale) and pick a format. See the gap to the neighboring cell, the relative gap, and whether adding 1 gets through. The sawtooth below is the relative gap as the magnitude changes; the gold dot is your number.
ctl.fmt: Format
ctl.x: Magnitude of the number
read.x: This number
read.ulp: Gap to the next cell (ulp)
read.rel: Relative gap
read.plus: After adding 1
cv.x: Magnitude (powers of 2) →
cv.y: ↑ Relative gap (powers of 2)
cv.aria: Line chart: the relative gap as a function of magnitude, a sawtooth
cv.sub: subnormal
say.ok: Near {x}, the gap to the next cell is {ulp}, which is less than 1, so adding 1 gets through and gives {s}.
say.lost: Near {x}, the gap to the next cell is {ulp}, at least 2; the 1 added is less than half a cell and is lost, so the result is still {s}.
say.half: Near {x}, neighboring cells are exactly 2 apart; adding 1 lands halfway between them, and round to nearest, ties to even gives {s}.
say.clock: If this number is a clock counting seconds: after {h} hours, its smallest possible step is {ms} ms.
:::

Drag the slider to near 2²⁴ and add 1: binary32 represents consecutive integers only up to {=ch1.int}; above that the gap becomes 2, so {=ch2.lost} cannot be stored and adding 1 changes nothing. JavaScript's numbers (binary64) count consecutively up to 2⁵³. So storing counters, timestamps or coordinates in float goes wrong sooner than you might expect: near longitude 100°, the binary32 gap is {=ch2.lonUlp}°, which is about {=ch2.lonM} m on the equator.

The sawtooth is computed exactly from the format's parameters. The error in a real program also depends on how many operations are done and how each one is rounded; that is the subject of the next three chapters. The leftmost slope segment is the subnormal range, covered in chapter 4. {.take}

## Landing Between Two Cells: Rounding {#ch3}

::: strings
toc: Landing Between Two Cells: Rounding
:::

The exact result of an operation usually falls between two representable numbers, and one of them must be chosen. The rule for choosing is called the rounding mode. A poor rule lets the error build up in one direction. {.law}

At a supermarket checkout, if every price is rounded down, each item is off by only a few cents; but over a year of thousands of purchases, rounding in one direction adds up to real money. If sometimes you round up and sometimes down, the errors largely cancel out.

IEEE 754 requires every addition, subtraction, multiplication and division to be **correctly rounded**: the result must equal the exact value rounded to one cell under the current rounding mode. The binary formats have four modes: **round to nearest, ties to even** (the default), **toward zero** (truncate), **toward +∞**, and **toward −∞**. The 2008 revision added "nearest, ties away from zero", mainly for decimal formats. "Ties to even" means that when the exact value lies exactly halfway between two cells, the cell whose last bit is 0 is chosen. Ties go up half the time and down half the time, so there is no long-run bias.

How does the hardware know which cell the exact value is closest to? It does not keep every bit. After the two mantissas are aligned for addition, it only needs to look three bits past the last bit it keeps: the bit right after it is the **guard** bit, the next is the **round** bit, and all the bits beyond that are OR-ed together into the **sticky** bit. Those three bits are enough to tell "less than half", "exactly half" and "more than half" apart.

::: diagram dg-grs keys=dg.grs
cap: Figure 3: after alignment in an addition, three extra bits past the kept bits are enough to round correctly. Schematic; bit widths not to scale.
aria: Diagram: after the mantissas are aligned and added, the kept bits are followed by the guard, round and sticky bits, with the three cases of rounding below
keep: kept bits
lsb: last bit
g: guard
r: round
s: sticky
sx: rest OR-ed together
c1: below half (GRS < 100)
c1a: drop
c2: exactly half (GRS = 100)
c2a: tie: up if LSB is 1
c3: above half (GRS > 100)
c3a: round up
:::

::: lab ch3-model
model.title: Add the same number many times: what five roundings reach
model.how: Pick a format, the number added each time, and how many times to add it. The five lines are the accumulated sums under five rounding modes; the dashed line is the exact value (each addend is first stored in the format, then multiplied by the count). See which line stalls and which one overshoots.
ctl.fmt: Format
ctl.d: Added each time
ctl.n: Count
cv.x: Number of additions →
cv.y: ↑ Accumulated sum
cv.aria: Line chart: the accumulated sum under five rounding modes as a function of the count, plus the exact value
say.stall: Round to nearest, ties to even, stops at addition {i}, at <em>{v}</em>: there the neighboring cells are {gap} apart, and each addend is either less than half a cell, or exactly half and then rounded to even. Stochastic rounding gives {sr}; the exact value is {ex}.
say.noStall: Round to nearest, ties to even, gives {rne}; the exact value is {ex}, a relative error of {rel}. Toward zero gives {rtz}; toward +∞ gives {ru}. Where the error first appears depends on how long the format's mantissa is.
say.ru: Rounding toward +∞ climbs to {ru}, which is {x} times the exact value: every addition rounds up to the next cell, and the cells keep widening, so it rounds up more and more.
:::

The default is BF16 adding 1 a thousand times. With round to nearest, ties to even, the sum stops growing at {=ch3.stall}: BF16 has a 7-bit mantissa, so at 256 neighboring cells are 2 apart, 256 + 1 lands exactly halfway between 256 and 258, ties to even rounds back to 256, and every later +1 does the same. Round toward zero stops there too. Round toward +∞ is the opposite: every addition moves up a cell, and after 1000 additions the sum is {=ch3.ru}, {=ch3.ruX} times the exact value. **Stochastic rounding** gives a probability based on distance: if the exact value is 0.3 of the way from the cell below, there is a 30% chance of rounding up, which averages out to no bias; after 1000 additions it is {=ch3.sr}. Switch to binary32 and add 0.1 ten thousand times: round to nearest, ties to even gives {=ch3.f32rne}, toward zero gives {=ch3.f32rtz}, and the exact value is {=ch3.f32ex}.

This kind of "adding and getting nowhere" is called **stagnation**. It is the great trouble of low-precision formats: accumulate in BF16 or FP16, and small updates added to a large sum may not register at all. That is why the matrix units of AI accelerators almost always accumulate in a wider format (often binary32); some training chips, and Intel's new AVX10.2 instructions, have started to provide hardware support for stochastic rounding (chapter 13).

Stochastic rounding uses a pseudo-random number with a fixed seed; a different seed gives different results, but the average is unbiased. The model rounds once per step to the format, as the hardware does; it does not simulate intermediate results kept in a wider register (such as the 80-bit registers of the old x87). {.take}

## Near Zero and at Infinity {#ch4}

::: strings
toc: Near Zero and at Infinity
:::

The two extremes of the exponent are reserved for special uses. An all-zero field means zero and subnormal numbers, which let values underflow gradually toward zero. An all-one field means infinity and NaN, so that operations such as division by zero or 0/0 have definite results and the program does not have to stop. {.law}

An odometer that reaches 999999 rolls back to 000000; that is integer overflow ([[switches-that-compute#ch5|Chapter 5 of How a Pile of Switches Learned to Do Arithmetic]]). Floating-point numbers do not roll back. A number that is too large becomes "infinity", a meaningless result becomes "not a number" (NaN), and a number that is too small first loses precision and only then becomes 0.

Start with the small end. The smallest positive normal binary32 number is 2⁻¹²⁶. If the next number below it were 0, there would be a big hole between 0 and 2⁻¹²⁶: two nearby small numbers subtracted could land in the hole and give 0, so a ≠ b while a − b = 0, and then 1/(a − b) is infinity. IEEE 754's remedy: when the exponent field is 0, the hidden bit is no longer 1 but 0, and the exponent is fixed at −126. Such numbers are called **subnormal** (formerly "denormal"). They fill the hole with an evenly spaced grid, with the same spacing as near the smallest normal number; the price is that the closer to 0, the fewer significant bits remain.

::: diagram dg-special keys=dg.special
cap: Figure 4: the three cases of the binary32 exponent field, and the difference between a gap near 0 and subnormals filling it. The lower half is schematic, not to scale.
aria: Diagram: exponent field 0 gives zero and subnormals, 1 to 254 give normal numbers, 255 gives infinity and NaN; below, an empty gap near 0 contrasted with an evenly filled grid made of subnormals
e0: exponent = 0
e0a: zero, subnormals
e0b: hidden bit is 0
en: exponent = 1 … 254
ena: normal numbers
enb: hidden bit is 1
e255: exponent = 255
e255a: mantissa = 0: infinity
e255b: mantissa ≠ 0: NaN
gap: no subnormals: a gap below min normal
fill: subnormals: an even grid fills the gap
z: 0
mn: smallest normal
:::

With subnormals, "if a ≠ b then a − b ≠ 0" holds for every pair of finite numbers. For example, a = 1.5 × 2⁻¹²⁶ and b = 1.25 × 2⁻¹²⁶ give a − b = 2⁻¹²⁸, which is exactly a subnormal number, with no error at all.

::: lab ch4-model
model.title: How many significant digits remain as a number shrinks toward zero
model.how: Drag k to store 1.7 × 2⁻ᵏ in binary32. Watch it move from the normal range into the subnormals, losing one significant bit with each halving, until it becomes 0. Tick "flush to zero" to see what a processor that treats subnormals as 0 does.
ctl.k: k (the number is 1.7 × 2⁻ᵏ)
ctl.ftz: Flush to zero (treat subnormals as 0)
read.val: Stored value
read.cls: Class
read.sig: Significant bits
read.rel: Relative error
cls.norm: normal
cls.sub: subnormal
cls.zero: zero
cls.flushed: flushed to 0
strip.aria: 24 significant bits; lit bits are still kept
say.norm: k = {k}: still in the normal range, all 24 significant bits are there, relative error {rel}, the same as storing 1.7 itself.
say.sub: k = {k}: in the subnormal range, with only {sig} significant bits left, relative error {rel}.
say.zero: k = {k}: less than half the smallest subnormal, so it is stored as 0.
say.flushed: k = {k}: this would be a subnormal with {sig} significant bits, but flush-to-zero mode turns it into 0.
:::

Going down from 2⁻¹²⁷, each halving costs one significant bit: 1.7 × 2⁻¹⁴⁰ has {=ch4.sig140} bits left, with a relative error of {=ch4.rel140}; at k = 149 only {=ch4.sig149} bits remain. Dividing 1 by 2 over and over, binary32 needs {=ch4.halv} halvings to reach 0.

Many processors can be set to treat subnormals as 0: x86 has the FTZ and DAZ control bits, and Arm has the FZ bit. The reason is that on some chips a subnormal takes a slow path, making an operation much slower. With flush-to-zero on, 1 needs only {=ch4.halvFtz} halvings to reach 0; the a − b above also becomes 0, and then 1/(a − b) is infinity. Graphics and audio programs often do this; scientific computing usually does not. In AI's low-precision formats the handling of subnormals varies (chapter 7).

Now the large end. An all-ones exponent with an all-zero mantissa is **infinity**: 1/0 = +∞, −1/0 = −∞, and the largest number doubled is +∞ (overflow). A mantissa that is not all zeros is **NaN** (not a number): 0/0, ∞ − ∞, and the square root of −1 all give NaN. NaN has a notorious property: it equals no number, not even itself, so x != x is the oldest test for NaN. NaN also propagates: in addition, subtraction, multiplication, division and square root, if any operand is NaN, the result is NaN (comparisons are the exception: they return false). After a long chain of computation, you need only look at the final result to know whether something went wrong along the way. The standard also has +0 and −0: they compare equal, but 1/(+0) = +∞ and 1/(−0) = −∞.

On real hardware, flush-to-zero comes in two kinds: FTZ turns subnormal results into 0, and DAZ treats subnormal inputs as 0; the model simulates only the former. How much slower subnormals are depends on the specific chip and operation; it was not measured here, so no numbers are given. {.take}

## How Errors Get Amplified: Cancellation and Summation {#ch5}

::: strings
toc: How Errors Get Amplified: Cancellation and Summation
:::

Subtracting two nearly equal numbers cancels their leading identical bits and pushes an error hidden in the last bit to the front. Adding a long list of numbers lets the error grow with the count; changing the order of the additions can hold it down. {.law}

Measure the height difference of two buildings with a ruler that reads only to the millimeter, then subtract. Both buildings are about 100 meters tall and differ by only a few millimeters. Each reading is off by half a millimeter, so the difference can be off by a millimeter, while the difference itself is only a few millimeters: the error is tens of percent. Two precisely measured numbers have produced a very imprecise difference.

This is called **catastrophic cancellation**. The subtraction itself makes no mistake: when two floating-point numbers are within a factor of two of each other, their difference is exactly representable, so the hardware gives the exact value (Sterbenz's lemma). The damage is done before the subtraction: each number carries a rounding error left by an earlier step, and subtracting cancels the identical significant bits while leaving those errors untouched.

::: diagram dg-cancel keys=dg.cancel
cap: Figure 5: two eight-digit numbers that agree in their first six digits. After subtraction only two significant digits remain, and the error that sat in the last digit now sits in the second. Schematic, written in decimal.
aria: Diagram: two eight-digit numbers that share their first six digits are subtracted; two significant digits remain, and the error moves from the eighth digit to the second
same: first 6 digits match; they cancel
err: last digit: earlier rounding error
res: 2 digits left; error is in the 2nd
:::

A standard example is variance. Textbooks offer two formulas: first compute the mean, then the sum of squared differences of each value from the mean (two passes); or make one pass accumulating x and x², then compute the mean of x² minus the square of the mean (one pass). Mathematically they are identical. But when the data cluster around a large offset, the mean of x² and the square of the mean are two nearly equal large numbers, and the one-pass method performs catastrophic subtraction.

::: lab ch5-var keys=ch5.var
model.title: One data set, three ways to compute the variance
model.how: 1,000 numbers fluctuating around an offset (standard deviation 1), all computed in binary32. Drag the offset and see how far each method is from the exact value. The bar length is the relative error (log scale).
ctl.off: Offset
read.ex: Exact value
read.one: One pass
read.two: Two passes
read.wel: Welford
cv.aria: Bar chart: relative error of the three variance methods, log scale
cv.x: Relative error →
say.ok: Offset {o}: all three methods are fine; the one-pass relative error is {r1}, the two-pass {r2}.
say.bad: Offset {o}: the one-pass method gives <em>{one}</em>, off by {r1}; the two-pass and Welford methods are still close to the exact {ex}.
say.neg: Offset {o}: the one-pass method computes a negative variance, <em>{one}</em>. A variance cannot be negative; this comes entirely from cancellation.
:::

The default data are 1,000 numbers fluctuating around {=ch5.off} with standard deviation 1, computed in binary32. The exact variance is about {=ch5.ex}; the two-pass method gives {=ch5.two}, and the one-pass gives {=ch5.one}. Push the offset to ten thousand and the one-pass method yields {=ch5.one4}: a negative variance. Welford's method, from 1962, also needs only one pass, but it updates the mean as it goes, so each subtraction is between a new value and the current mean, and large cancellation does not occur.

Now the summation itself. Adding from the start to the end rounds at every addition, and the worst-case error grows linearly with the number of terms; worse, the stagnation from chapter 3 sets in: as the sum grows, later small addends are rounded away. There are two remedies. **Pairwise summation** adds neighboring numbers, then adds those results in pairs, like a knockout tournament, so each number passes through only log₂n roundings. **Kahan compensated summation** (1965) uses one extra variable to record what each addition dropped and feeds it back into the next addition.

::: lab ch5-sum keys=ch5.sum
model.title: Summing a long list: running sum, pairwise, Kahan
model.how: Choose the accumulation format and the count. The data are random numbers between 0 and 1 (first stored in the same format). The top shows the three results; the chart below shows relative error against the count, and the gold vertical line marks the current count.
ctl.fmt: Format
ctl.n: Count
read.ex: Exact sum
read.naive: Running sum
read.pair: Pairwise
read.kahan: Kahan
leg.naive: Running sum
leg.pair: Pairwise
leg.kahan: Kahan
cv.x: Count (log scale) →
cv.y: ↑ Relative error
cv.aria: Line chart: relative error of the three summation methods against the count
say.stall: The running sum stops at <em>{naive}</em>, while the exact sum is {ex}; pairwise gives {pair} and Kahan gives {kahan}.
say.ok: Relative error of the running sum {rn}, pairwise {rp}, Kahan {rk}.
:::

The default is BF16 adding {=ch5.N} numbers, with an exact sum of {=ch5.sumEx}. The running sum gives {=ch5.sumNaive}, stuck at 256; pairwise and Kahan both give {=ch5.sumPair}, the BF16 number nearest the exact value, and in this format nothing could be better. Chapter 10 returns to this model: the compiler splits the sum across 8 or 16 lanes, and the result changes.

The data in the model are fixed-seed uniform random numbers, all positive. How big the error is depends on the data: with all positive numbers, summation is easy; when many positive and negative values cancel each other, even the best summation algorithm cannot recover significant bits lost before the subtraction. {.take}

## One Rounding for a Multiply-Add: FMA {#ch6}

::: strings
toc: One Rounding for a Multiply-Add: FMA
:::

A fused multiply-add (FMA) treats a × b + c as one operation: it computes the exact product, adds c, and rounds only once at the end. It is faster and usually more accurate, but it also means the same formula can produce results that differ in the last few bits on machines with and without FMA. {.law}

Think of bookkeeping: multiply unit price by quantity and add the result to the ledger. If each product is first rounded to the cent and then added, you round twice; if every digit of the product is kept until the total is rounded to the cent, you round only once.

Almost every numerical kernel has the form a × b + c: matrix multiplication, convolution, polynomial evaluation, dot products. Modern CPUs implement it as one instruction (x86 has supported it widely since Haswell in 2013), with latency about that of a single multiplication (chapter 11). The multiplier in the hardware computes the full product first (two 24-bit mantissas multiply to 48 bits), without rounding, aligns it with c, adds, and rounds once.

::: diagram dg-fma keys=dg.fma
cap: Figure 6: doing the multiply and the add separately rounds twice; a fused multiply-add sends the full product into the adder and rounds only at the end. Schematic.
aria: Diagram: on the left the product is rounded, then the sum is rounded again; on the right the product is kept in full, c is added, and the result is rounded once
sep: separate: 2 roundings
fus: fused: 1 rounding
mul: multiply
add: add
rnd: round
full: full product (48 bits)
p24: rounded to 24 bits
in: a, b
c: c
out: result
:::

One rounding has a neat consequence. Compute the ordinary rounded product p, then compute fma(a, b, −p): the result is exactly the rounding error of a × b, with no bits lost, because as long as nothing underflows, that error itself always fits. Adding p back gives the exact product. This is the basis of "double-double" software arithmetic and of exact dot products.

::: lab ch6-model
model.title: What x × x − x × x comes to
model.how: Drag x (between 1 and 2) and see the results of x × x − x × x in binary32, computed separately and with FMA. Then drag the length of the dot product and compare how far each algorithm is from the exact value.
ctl.x: x
ctl.n: Dot product length
read.x: x stored as
read.p: x × x rounded
read.sep: Computed separately
read.fma: Using FMA
read.sqrt: Square root of the FMA result
read.dsep: Dot product error (separate)
read.dfma: Dot product error (FMA)
say.pos: Computed separately, the result is 0; with FMA it is <em>{e}</em>, exactly the part lost when x × x was rounded. Its square root is {sq}, but it should be 0. Adding it to p gives exactly the exact x²: {ok}.
say.neg: Computed separately, the result is 0; with FMA it is <em>{e}</em>, a negative number, and its square root is NaN. When the compiler automatically fuses x*x − y*y into an FMA, this happens whenever x equals y.
say.zero: x × x fits exactly with no rounding error, so both methods give 0.
say.yes: yes
say.no: no
:::

By default x = 1.1, stored as {=ch6.x}. Computed separately, x × x − x × x is of course 0; with FMA the result is {=ch6.fused}, exactly the part of x² lost in rounding. The difference can cause real trouble: compilers often fuse x*x − y*y automatically into one FMA (called "contraction"). When x = y, sqrt(x*x − y*y) should be 0, but may give NaN, because the lost part can be negative. Among one thousand values of x taken at steps of 0.001 between 1 and 2, {=ch6.negN} give a negative result, for example x = {=ch6.negX}.

How much does FMA help a dot product? For random vectors of length 1,000, averaged over 1,000 seeds: the separate method has an error of {=ch6.eSep}, FMA {=ch6.eFus}, and FMA is more accurate in only {=ch6.wins} of cases. Each step saves the multiplication's rounding, but the addition's rounding remains, and most of the error comes from the accumulation. FMA's real benefit is speed: one instruction does two operations, the "× 2" in the peak-throughput calculation of chapter 11.

The multiply-adds in the model are done in binary32, and the exact values are computed with integers. Whether a compiler uses FMA automatically depends on the language and compiler options (C's FP_CONTRACT, GCC's -ffp-contract); the same code giving results that differ in the last few digits on two machines is often due to exactly this. {.take}

## Bits Cut for AI: FP16, BF16, FP8 {#ch7}

::: strings
toc: Bits Cut for AI: FP16, BF16, FP8
:::

Each halving of the bit count lets the same chip area do roughly twice as many multiplications, and the same memory hold twice as many numbers. The price is that the bits must be reallocated between exponent and mantissa: exponent bits decide how large and small a value can be, mantissa bits decide how precise. AI's usual choice is to keep the range and sacrifice precision. {.law}

Think of a paper map: you can draw every street of a city, or the provincial borders of a whole country. The sheet is the same size; the wider the view, the coarser the detail.

When training a neural network, the sizes of weights, activations and gradients can differ by more than ten orders of magnitude: gradients are often below 10⁻⁶, and activations occasionally spike to hundreds or thousands. Precision matters less: the random errors in millions of updates largely cancel. So 16-bit formats split in two ways. **FP16** (IEEE 754's binary16) has 5 exponent bits and 10 mantissa bits; its largest value is only {=ch7.fp16max}, and its smallest positive normal number is about {=ch7.fp16min}. **BF16** (bfloat16, first from Google Brain) has 8 exponent bits and 7 mantissa bits: it is binary32 with 16 mantissa bits chopped off. Its range matches binary32; its precision is under 3 decimal digits.

At 8 bits it gets tighter still. Two **8-bit floating-point** formats, proposed by researchers at NVIDIA, Arm and Intel in 2022 and written into a specification by the Open Compute Project (OCP) in 2023, are E4M3 (4 exponent bits, 3 mantissa bits) and E5M2 (5 exponent bits, 2 mantissa bits). E5M2 follows IEEE 754 and keeps infinity and NaN, with a maximum of {=ch7.e5max}. E4M3 gives up infinity to squeeze in more range and reserves only the encoding with all exponent and mantissa bits set for NaN (one per sign), with a maximum of {=ch7.e4max} and a smallest subnormal of 2⁻⁹. The OCP MX specification also defines 6-bit (E2M3, E3M2) and 4-bit (E2M1) floating-point formats: E2M1 has just eight magnitudes, 0, 0.5, 1, 1.5, 2, 3, 4 and 6. How fast GPU tensor cores run with these formats is covered in [[how-a-gpu-computes#ch8|Chapter 8 of How a GPU Computes]].

::: diagram dg-formats keys=dg.formats
cap: Figure 7: how the bits of each format are split (drawn to scale by bit count). Red is the sign, cyan the exponent, gold the mantissa.
aria: Diagram: the sign, exponent and mantissa bit counts of six formats: binary32, FP16, BF16, FP8 E4M3, FP8 E5M2 and FP4 E2M1
name: Format
range: Max
:::

The table below is computed entirely from the format parameters, using the same model as chapter 1. "Decimal digits" is p × log₁₀2, where p is the mantissa length including the hidden bit; "span" is how many powers of 2 separate the largest number from the smallest positive one (log₂ of their ratio).

::: html fmt-table keys=tbl
cap: Table 1: range and precision of each floating-point format (computed by the model from the format parameters)
fmt: Format
bits: Bits
exp: Exponent bits
man: Mantissa bits
max: Max
minN: Min normal
minS: Min subnormal
eps: Machine ε
dig: Decimal digits
span: Span
inf: Infinity
yes: yes
no: no
aria: Table: bit count, range and precision of each floating-point format
:::

::: lab ch7-model
model.title: How much is lost when a set of numbers goes into a low-precision format
model.how: Pick a format and drag the size of this set of numbers (standard deviation, in powers of 10). The histogram shows the distribution of sizes; the grey band is the range where the format represents normal numbers, the purple band is the subnormals, and values to the right of the red line overflow. The readouts give how many of the 4,096 numbers become 0, fall into the subnormals, or overflow, and the median relative error.
ctl.fmt: Format
ctl.s: Size (standard deviation, powers of 10)
read.zero: Become 0
read.sub: Fall into subnormals
read.over: Overflow or clamp to max
read.med: Median relative error
cv.x: Magnitude (powers of 2) →
cv.aria: Histogram: distribution of magnitudes, with the format's subnormal, normal and overflow ranges
cv.norm: normal
cv.sub: subnormal
cv.over: overflow
say.ok: Standard deviation {s} in {f}: nearly all in the normal range; median relative error {med}, set by the number of mantissa bits.
say.under: Standard deviation {s} in {f}: {z} become 0, {sub} fall into subnormals, median relative error {med}. The numbers are too small for the format's range.
say.over: Standard deviation {s} in {f}: {o} exceed the largest number, median relative error {med}. The numbers are too large.
:::

By default, a set of numbers with standard deviation 10⁻⁷ (gradients can be this small) goes into FP16: {=ch7.fp16zero} become 0 outright, nearly all the rest fall into subnormals, and the median relative error is {=ch7.fp16med}. The same numbers in BF16 do not underflow at all, with a median error of {=ch7.bf16med}. That is why training in FP16 needs **loss scaling**: multiply the loss by a large number (say 2¹⁶) so the gradients scale up, and divide back after the computation. BF16 does not need it, which is why most large-model training today uses BF16. Set the size to 1000 and choose E4M3: {=ch7.e4over} of the numbers exceed 448 and are clamped to the maximum; the same numbers in E5M2 do not overflow at all, but the error becomes {=ch7.e5med}. So FP8 training usually uses E4M3 for the forward pass and E5M2 for gradients in the backward pass, and it depends on the scaling of the next chapter.

The numbers in the model are normally distributed; the tails of real weights, activations and gradients are longer. Rounding is round to nearest, ties to even throughout. Outside the range, E4M3, FP6 and FP4 clamp to the maximum; this "saturation" behavior is what the OCP specification requires to be supported. {.take}

## One Scale per Group: INT8 and Block Scaling {#ch8}

::: strings
toc: One Scale per Group: INT8 and Block Scaling
:::

8-bit and 4-bit numbers cannot cover a wide range by themselves, so a group of numbers shares a common scale: the scale sets the overall size, and each number records only its position within the group. Smaller groups fit the scale more closely, but each number carries a larger share of scale bits. {.law}

Picture a score sheet where each student writes only "my score as a fraction of the class's top score", and the top score is written once in the header. The one number in the header sets the size, so each student's cell can be narrow. But if one score was entered a hundred times too large, everyone else is squeezed into the "almost zero" cell, and no one can tell them apart.

The simplest case is INT8 with **one scale for the whole tensor**: find the largest absolute value amax, set the scale s = amax / 127, and store each number as round(x / s), an integer from −127 to 127. For matrix multiplication, the integers are multiplied and added, which is fast and power-efficient, and the two scales are applied once at the end. The problem is the mis-entered score: large language model activations really do contain such **outliers**, a few channels hundreds of times larger than the rest. A single scale accommodates them, and the other numbers are left with only a few steps, or even all become 0.

The remedy is to shrink the scale to a small block. The **MX** (microscaling) specification 1.0, published by the OCP in September 2023 and co-signed by AMD, Arm, Intel, Meta, Microsoft, NVIDIA and Qualcomm, uses blocks of 32 numbers that share one 8-bit scale, E8M0. E8M0 is just a power of 2 (from 2⁻¹²⁷ to 2¹²⁷); each element in the block is FP8, FP6, FP4 or INT8. The rule for choosing the scale is also in the specification: take the largest absolute value in the block, round it down to a power of 2, and divide by the largest power of 2 the element format can represent; values beyond the element range are clamped to the maximum. This way MXFP4 averages 4 + 8/32 = 4.25 bits per number. NVIDIA's **NVFP4** makes a different trade-off: blocks of 16 numbers, a scale in E4M3 (not necessarily a power of 2), plus one FP32 scale for the whole tensor; about 4.5 bits on average.

::: diagram dg-mx keys=dg.mx
cap: Figure 8: top, one scale for the whole tensor. Bottom, the MX format uses blocks of 32 numbers, each block with one 8-bit power-of-2 scale. Schematic; block counts not to scale.
aria: Diagram: at the top, one scale covers the whole tensor; below, every 32 elements form a block with its own 8-bit scale
tensor: whole tensor: one scale
scale: scale
blk: one block of 32 numbers
e8: E8M0: one power of 2
elem: each number: FP8, FP6, FP4 or INT8
out: outlier
hurt: an outlier hurts only its own block
:::

::: lab ch8-model
model.title: With outliers present, how much information do seven schemes keep
model.how: Among 512 numbers with standard deviation 1, four outliers are inserted. Drag the outlier size and pick a scheme to see its detailed readouts. The bars show the signal-to-noise ratio (SNR) of the ordinary values under each scheme (higher is better; each 6 dB is about one more bit of precision); the readouts include the average bits per number.
ctl.a: Outlier size
ctl.s: Scheme
s.int8t: INT8 (per tensor)
s.int8b: INT8 (per 32)
s.mxint8: MXINT8
s.mxfp8: MXFP8
s.mxfp6: MXFP6
s.mxfp4: MXFP4
s.nvfp4: NVFP4
read.bpe: Average bits per number
read.sq: SNR of ordinary values
read.zero: Ordinary values flushed to 0
read.out: Max relative error of outliers
cv.aria: Bar chart: SNR of ordinary values under the seven schemes
cv.y: SNR dB
say.good: {s}: the ordinary values have an SNR of {sq}, and only {z} become 0. At outlier size {a}, this scheme still copes.
say.bad: {s}: the ordinary values have an SNR of only {sq}, and {z} become 0. At outlier size {a}, the scale is stretched by the outlier and the other numbers in the group are crushed.
:::

By default, of the 512 numbers, 4 are outliers of size {=ch8.A}; the rest are normal with standard deviation 1. INT8 with one scale for the whole tensor leaves the ordinary values an SNR of only {=ch8.int8tS} dB, with {=ch8.int8tZ} of the numbers crushed to 0; INT8 with a scale per 32 numbers does better ({=ch8.int8bS} dB). The steadiest is MXFP8: {=ch8.mxfp8S} dB, and the outlier moving from 1 to 1000 barely changes it, because E4M3 itself spans {=ch8.e4span} powers of 2, so both large and small numbers in one block fit. Integer blocks and FP4 blocks fail: if one outlier is in a block, the other 31 numbers of that block are almost entirely destroyed.

This is another reading of the table in chapter 7: block scaling takes care of "how big overall", and the element format takes care of "how much variation within the block". That is why 4-bit formats need smaller blocks (16 for NVFP4) and extra training-time tricks such as stochastic rounding to be usable, while 8-bit formats are already comfortable with blocks of 32. For why reading half as many bytes at inference can make things nearly twice as fast, see [[why-compute-waits-for-memory#ch8|Chapter 8 of Why Compute Waits for Memory]].

The model quantizes a single vector and does no matrix multiplication; SNR is computed only for ordinary values, and the outliers' own error is reported separately. Real outliers often concentrate in a fixed set of channels, and scaling per channel would do better than the results here. NVFP4 is implemented as NVIDIA's blog describes it; details such as scale rounding may differ from the hardware. {.take}

## One Instruction, One Row: SIMD and Masks {#ch9}

::: strings
toc: One Instruction, One Row: SIMD and Masks
:::

SIMD (single instruction, multiple data) splits a wide register into many lanes, and one instruction makes every lane do the same thing. Double the width and the same number of instructions does twice the work. Lanes cannot each go their own way, so an "if" has to become a mask. {.law}

Think of stamping one sheet at a time, or stacking 16 sheets and stamping them all in one press. Stacking works only if every sheet lies in the same position.

x86's SIMD has widened step by step: SSE in 1999 used 128-bit registers, holding four binary32 values at a time; AVX in 2011 went to 256 bits; AVX2 in 2013 brought integer operations up to 256 bits, and the same generation added floating-point FMA. AVX-512 was proposed in 2013 and appeared on chips from 2016: 512 bits, sixteen binary32 values or 64 8-bit integers at once; the vector registers grew from 16 to 32, and it added eight **mask registers**, k0–k7 (k0 means "no mask"). Arm's NEON is 128 bits. A single AVX-512 vfmadd231ps does 16 multiply-adds.

::: diagram dg-lanes keys=dg.lanes
cap: Figure 9: top, a 512-bit register split into 8, 16, 32 or 64 lanes depending on element size. Bottom, one vector addition where each lane adds its own pair; a lane whose mask bit is 0 writes no result. Schematic.
aria: Diagram: a 512-bit register split into 8, 16, 32 and 64 lanes for binary64, binary32, BF16 and INT8; below, a vector addition over four lanes and a mask
reg: one 512-bit register
f64: binary64: 8 lanes
f32: binary32: 16 lanes
f16: BF16: 32 lanes
i8: INT8: 64 lanes
add: one instruction, each lane adds
k: mask k1
off: mask 0: not written
:::

Lanes cannot take separate paths. If a loop contains a test, such as "keep x if it is above the threshold, otherwise write 0", SIMD computes both sides: first one compare instruction, in which the 16 lanes each produce true or false, stored as 16 bits in a mask register; then one masked move, in which lanes with mask 1 take x and lanes with mask 0 write 0. There is no branch, and so no cost of [[how-a-cpu-guesses-ahead#ch2|a mispredicted branch]].

::: lab ch9-model
model.title: One compare instruction, and a row of true and false
model.how: Pick the register width and element type, and drag the threshold. The cells are the lanes of one register; gold marks those above the threshold, which will be kept. Then drag the number of items to process and see how many vector loops it takes, and what the tail mask of the last one is.
ctl.w: Register width
ctl.t: Element type
ctl.thr: Threshold
ctl.n: Items to process
t.f64: binary64
t.f32: binary32
t.f16: FP16
t.i8: INT8
read.lanes: Lanes
read.mask: Mask for this pass
read.vecs: Vector loop passes
read.tail: Tail mask
lanes.aria: Values in one register's lanes; gold for those above the threshold
say.mask: Of {n} lanes, {on} are above the threshold, and the mask is {mask} (bit 0 is lane 0). {N} items take {vecs} vector passes; scalar code takes {N}.
say.tail: The last {tail} items do not fill a register; the tail mask {tm} enables only the first {tail} lanes.
say.tailOld: The last {tail} items do not fill a register; SSE and AVX2 have no mask registers, so this stretch is usually left to scalar code.
say.full: The item count is an exact multiple of the lane count: no tail.
:::

The default is AVX-512, binary32, threshold 0.3: of 16 numbers, {=ch9.on} are above the threshold, and the mask is {=ch9.mask} (bit 0 is lane 0). Processing 1,000 numbers takes {=ch9.vecs} vector loop passes; scalar code takes 1,000. The last {=ch9.tail} numbers do not fill a register; AVX-512 uses the tail mask {=ch9.tm} to enable only the first {=ch9.tail} lanes, so no separate scalar loop is needed to finish. SSE and AVX2 have no mask registers, so the tail is usually handed to scalar code.

One instruction doing 16 jobs does not make things 16 times faster. Data must be moved from memory into registers (chapter 10), multiply-adds have latency (chapter 11), and wider lanes can lower the clock (also chapter 11). The next three chapters take these one at a time.

The instruction model counts only four kinds of operation in the loop (load, compare, select by mask, store); loop control and address arithmetic are not counted, and a real compiler would also unroll the loop. Masks are written in true bit order: lane 0 is the lowest bit. {.take}

## When the Compiler Can Vectorize for You {#ch10}

::: strings
toc: When the Compiler Can Vectorize for You
:::

A compiler rewrites loops into SIMD automatically, but only when it can prove the rewrite does not change the result. Floating-point addition is not associative, so a summation loop is not vectorized by default: split it across 8 lanes and the answer changes. {.law}

Suppose a big pile of coins is counted by ten people, each counting a share, and then the ten subtotals are added: this is faster than one person counting from start to finish. But if each person has to round their count to a round number every so often, the total from ten people and the total from one person can differ by a few.

A loop can be vectorized automatically roughly when: the trip count is known on entry; no iteration depends on another (a[i] = a[i − 1] + … does not qualify); the pointers do not refer to overlapping memory (C's restrict tells the compiler this); and the data are contiguous in memory. The first three concern correctness; the last concerns speed: a 64-byte vector load is best when its bytes sit next to each other.

A 64-byte vector load that does not start on a 64-byte boundary spans two [[how-cpu-caches-work#ch2|cache lines]]. With a 4-byte offset, the share of loads that cross a line is {=ch10.split64}; for 32-byte loads it is {=ch10.split32}. Take every second element (stride 2) and the 16 binary32 values are spread over {=ch10.lines2} cache lines; with stride 16 they are spread over {=ch10.lines16}, and only 1/16 of the bytes read are useful. Data laid out as an "array of structures" (each particle's x, y and z next to each other) behaves this way; switch to a "structure of arrays" (all particles' x values next to each other) and the vector loads become contiguous. Scattered data can be collected with a gather instruction that takes 16 addresses at once, but it still fetches them one address at a time, far slower than contiguous loads.

::: diagram dg-tail keys=dg.tail
cap: Figure 10: top, 19 numbers across 8 lanes: two full passes and a last pass with a mask that enables only 3 lanes. Bottom, a gather takes one number per index from scattered memory. Schematic.
aria: Diagram: 19 elements split into two full 8-lane vectors and a tail that enables only 3 lanes; below, a gather that reads values from scattered memory positions using an index vector
v1: pass 1: all 8 lanes on
v2: pass 2: all 8 lanes on
v3: pass 3: mask 00000111
mem: memory
idx: index vector
gat: gather: each lane reads one address
:::

Back to summation. A vectorized sum works like this: open L lanes; lane j handles elements j, j + L, j + 2L, … and accumulates them separately; finally the L partial sums are added together. That is a different order from one-at-a-time addition, and chapter 5 showed that changing the order of floating-point additions can change the result. That is why C and C++ compilers do not vectorize floating-point summation by default, unless you allow reassociation with options such as -ffast-math or -fassociative-math.

::: lab ch10-model
model.title: One data set, summed with different numbers of lanes
model.how: Pick the format and the count (the same data as the summation model in chapter 5). Each bar is the relative error for one lane count; one lane means a running sum from start to end. Click a lane count to see the detailed readouts.
ctl.fmt: Format
ctl.n: Count
ctl.l: Lanes
read.val: Sum obtained this way
read.ex: Exact sum
read.err: Relative error
cv.aria: Bar chart: relative error of the sum for different lane counts
cv.y: Relative error (log scale)
cv.x: Lanes →
say.diff: {L} lanes give <em>{v}</em>; one lane (a running sum from start to end) gives {v1}, and the exact value is {ex}. With more lanes, each partial sum is smaller, so stagnation arrives later.
say.same: {L} lanes give {v}, which is {same} the one-lane result; the exact value is {ex}.
say.eq: the same as
say.ne: different from (the last few digits differ)
:::

The default is BF16 summing 4,096 numbers between 0 and 1. One lane (a running sum from start to end) gives {=ch10.l1}, stuck at 256; 8 lanes give {=ch10.l8} and 16 lanes give {=ch10.l16}, with the exact value {=ch10.ex}. More lanes mean smaller partial sums, so stagnation comes later and the result is more accurate: vectorization turns the sum into half a pairwise summation. Switch to binary32 with 65,536 numbers: the relative error for one lane is {=ch10.f1} and for 16 lanes {=ch10.f16}; the difference is in the last few digits, but the two still differ. So "vectorization changed the result" usually does not mean it got worse, only that it is different; programs that need every run to give exactly the same result (reconciliation, debugging, reproducible science) must fix the number of lanes and the order of addition.

The data in this model are all positive, and then more lanes almost always help; on data where positive and negative values cancel, that is not necessarily so. Real compilers under -ffast-math also make other rewrites (replacing division with multiplication by a reciprocal, assuming there are no NaNs); these also change results, and they are not simulated here. {.take}

## Latency, Throughput and Clock Speed {#ch11}

::: strings
toc: Latency, Throughput and Clock Speed
:::

A multiply-add takes 4 clock cycles from issue to a usable result, and each cycle can issue two new ones. To keep the multiply-add units full, there must be 4 × 2 = 8 mutually independent multiply-adds in flight at once. Wide vectors can also lower the chip's clock; how far and for how long decide whether it pays. {.law}

On a pipeline, a product passes through 4 stations, one minute each. If the next product must wait until the previous one is completely finished, the pipeline sits empty most of the time; if you have several unrelated jobs at hand, a new one can enter every minute.

{=ch11.lat} cycles of latency and {=ch11.tp} per cycle: these are Agner Fog's measured figures for vector FMA on Intel Skylake and AMD Zen 5 (Zen 4 does one 512-bit per cycle). In a loop like s += a[i] × b[i], the next multiply-add needs the previous result s, so one can issue only every 4 cycles, and of the 8 slots offered by the two multiply-add units only 1 is used. The remedy is several accumulators: s0, s1, … s7 take turns, and are combined at the end. This is Little's law: work in flight = latency × throughput.

::: diagram dg-pipe keys=dg.pipe
cap: Figure 11: two multiply-add units, latency 4 cycles. Top: with one accumulator, each unit waits 4 cycles before issuing again. Bottom: with 8 accumulators taking turns, both units are busy every cycle. Numbers in the cells are accumulator numbers.
aria: Diagram: occupancy of two multiply-add units over time; with one accumulator most slots are idle, with eight accumulators all slots are full
one: 1 accumulator
eight: 8 accumulators
u0: unit 0
u1: unit 1
cyc: clock cycle →
wait: wait 4 cycles
:::

::: lab ch11-fma keys=ch11.fma
model.title: How many accumulators it takes to keep the multiply-add units fed
model.how: Drag the number of accumulators, and pick the core and the loop. The figure above shows the occupancy of the two (or one) multiply-add units over the first 24 cycles, with accumulator numbers in the cells; the readouts give the average multiply-adds issued per cycle, the share of peak, and what is holding it back.
ctl.k: Accumulators
ctl.core: Core
ctl.ker: Loop
core.zen5: two 512-bit FMA (Zen 5)
core.zen4: one 512-bit FMA (Zen 4)
ker.dot: dot product (each multiply-add reads 2 numbers)
ker.sq: sum of squares (each multiply-add reads 1 number)
read.rate: Multiply-adds per cycle
read.pct: Share of peak
read.lim: Limited by
read.gf: At 5.7 GHz (binary32)
lim.latency: latency (too few accumulators)
lim.units: multiply-add units (full)
lim.loads: data reads (2 loads per cycle)
cv.aria: Timeline: which accumulator occupies each multiply-add unit over the first 24 cycles
say.latency: Accumulators: {k}. {r} per cycle, {p} of peak. The multiply-add units are waiting for results; at least {need} accumulators are needed.
say.units: Accumulators: {k}. {r} per cycle, and the multiply-add units are full. Adding more accumulators will not make it faster.
say.loads: Accumulators: {k}. {r} per cycle, {p} of peak. The multiply-add units still have room; the limit is reading only 2 numbers per cycle.
:::

By default there is one accumulator, reaching only {=ch11.k1} of peak. Drag it to 8 and the two multiply-add units are full. But a dot product reads two numbers per multiply-add, and Zen 5 can do only two 512-bit reads per cycle (Chips and Cheese), so a dot product manages at most one multiply-add per cycle, half of peak; a sum of squares reads only one number per multiply-add and can run full. Peak is computed as: frequency × multiply-adds per cycle × lanes per instruction × 2 (one multiply-add counts as two floating-point operations). Zen 5 at 5.7 GHz, with two 512-bit FMAs in binary32, reaches {=ch11.peak} GFLOPS, the theoretical value for one core. On an Apple M4, a single thread on a performance core doing outer products on the SME matrix unit measured {=ch11.m4} GFLOPS of FP32; with only one accumulator tile the figure drops to {=ch11.m4one}, almost exactly a quarter (Remke and Breuer, 2024). That unit likewise needs several independent accumulator tiles used in turn to be kept full. Note that the matrix unit is not one per core: the paper's measurements indicate that the performance cores share it.

Wide vectors draw power (for the relationship between power, voltage and frequency, see [[how-power-reaches-the-cpu#ch2|Chapter 2 of How Power Reaches the CPU]]). From Skylake-SP on, Intel gave AVX-512 its own "frequency license". Travis Downs measured this in 2020 on a Xeon W-2104: ordinary code ran at {=ch11.f0} GHz, AVX code at {=ch11.f1} GHz, and AVX-512 code at {=ch11.f2} GHz. Each switch to a higher license stalls the core for about {=ch11.halt} µs, and after the last 512-bit instruction finishes, the core takes about another {=ch11.relax} µs to return to high frequency. So on this chip a short burst of AVX-512 code slows the ordinary code that follows it for about two-thirds of a millisecond. That is the 2017 generation. Intel's later chips drop much less: the same year, Downs measured an Ice Lake laptop chip (i5-1035G4) and found that 512-bit code on one core fell only from 3.7 GHz to 3.6 GHz, and with several cores busy it ran as fast as ordinary code.

::: lab ch11-lic keys=ch11.lic
model.title: Use AVX-512 now and then: a net speedup or slowdown?
model.how: A program has a stretch of vector code in every millisecond, and ordinary code the rest of the time. Drag how many microseconds of vector code there are (measured as 256-bit code at full speed). Converted to 512 bits, it needs half the cycles, but the clock may drop. The chart shows the frequency over the first 3 milliseconds; the readout gives the overall speed after switching to AVX-512.
ctl.b: Vector code per millisecond
ctl.p: Frequency rule
p.skx: Skylake-SP style (measured on the W-2104)
p.none: no frequency drop
read.sp: Speed after switching to AVX-512
read.share: Share of vector code
cv.x: Time (µs) →
cv.y: ↑ Frequency GHz
cv.aria: Line chart: core frequency over the first 3 milliseconds, with the vector-code stretches marked
say.slow: Vector code is only {sh} of the time: after switching to AVX-512, overall the program is only {sp} times as fast, that is, slower. The frequency drop slows the ordinary code that follows.
say.fast: Vector code is {sh} of the time: after switching to AVX-512, the overall speed is {sp} times the original.
say.none: With no frequency drop, 512 bits can only be faster: vector code is {sh} of the time, and the overall speed is {sp} times the original.
:::

By default there are 20 µs of vector code in each millisecond: after switching to AVX-512, overall the program is only {=ch11.sp20} times as fast, that is, slower. With this chip's parameters, vector code has to take more than half the time to pay off. AMD took another route: Chips and Cheese measured Zen 5 (Ryzen 9 9900X) in 2025 and found no fixed frequency steps. A heavy 512-bit load/store sequence brings the clock down gradually from {=ch11.z0} GHz to about {=ch11.z1} GHz, lasting a dozen or so milliseconds, while 512-bit FMA done only in registers keeps the clock steady. Whether and how far the clock drops, and how long it takes to recover, varies by chip; you have to measure.

The first model assumes the data sit in the L1 cache, and both cores are modeled with two 512-bit reads per cycle (Zen 5's figure); when data must come from memory, the problem becomes the [[why-compute-waits-for-memory#ch7|roofline]]. The second model uses the parameters of the chip Downs measured, and assumes 256-bit code does not trigger a frequency drop (what he measured was "light" 256-bit instructions; heavy 256-bit instructions on that chip also drop to 2.8 GHz). {.take}

## Scalable Vectors and Matrix Units: SVE, SME, AMX {#ch12}

::: strings
toc: Scalable Vectors and Matrix Units: SVE, SME, AMX
:::

Write the vector width into the instruction, and every wider chip means rewriting the program. Arm's SVE lets the same program run on hardware of different widths; matrix units turn "one row at a time" into "one block at a time": read in 2n numbers, do n² multiply-adds. {.law}

A multiplication table: give you one row of 9 numbers and one column of 9 numbers, and you can fill 81 cells. You have read in only 18 numbers, and you have computed 81 products.

SVE (announced in 2016) and SVE2 in Armv9 do not fix the width in the instruction: a vector can be 128 to 2048 bits, chosen by the chip. The program uses a whilelt instruction to generate a **predicate** (similar to a mask); each pass handles "as many lanes as the hardware has", and the last pass automatically enables only the first few. The same binary runs on a 128-bit chip and a 512-bit chip, and the wider one runs faster. The first chip to implement SVE was Fujitsu's A64FX, with 512-bit vectors, in the Fugaku supercomputer. RISC-V's vector extension V takes the same approach, and the RVA23 profile, ratified in October 2024, makes it mandatory.

::: diagram dg-vla keys=dg.vla
cap: Figure 12: the same SVE loop handling 10 binary32 values, run over three widths of hardware. Blue lanes have their predicate enabled; dashed ones are off. Schematic.
aria: Diagram: the same loop takes 3 passes on 128-bit hardware, 2 on 256-bit and 1 on 512-bit, with the last pass enabling only some lanes
h128: 128-bit hardware: 3 passes
h256: 256-bit hardware: 2 passes
h512: 512-bit hardware: 1 pass
same: same binary
:::

::: lab ch12-model
model.title: One loop, on hardware of a different width
model.how: Drag the hardware vector length and the number of items to process (binary32). Each row is one pass of the loop; blue marks the lanes whose predicate is on. The readouts below compare a vector multiply-add with an outer product on a matrix unit: how many multiply-adds one instruction does, and how many multiply-adds each number read in gets.
ctl.vl: Vector length
ctl.n: Items
read.lanes: Lanes
read.trips: Loop passes
read.last: Lanes enabled on the last pass
read.util: Lane utilization
read.fmla: Vector multiply-add: per instruction
read.fmopa: Outer product: per instruction
read.per: Multiply-adds per number read (vector / outer product)
pred.aria: Predicate of each loop pass; blue marks the lanes that are on
pred.more: {n} more passes not shown
say: Vector length {vl} bits, {N} items: {trips} passes, the last pass enables {last} lanes, lane utilization {u}. An outer product does {mo} multiply-adds per instruction, {x} times the vector multiply-add.
:::

By default: 512 bits and 100 numbers, so 16 lanes per pass, {=ch12.trips} passes, and the last pass enables only {=ch12.last} lanes. Now the matrix unit. Arm's **SME** adds a two-dimensional storage array, ZA, to the chip, each side as many bytes as one vector (at 512 bits, 64 × 64 bytes, or 4 KB); the FMOPA instruction takes the outer product of two vectors and adds all n × n products into one block of ZA at once. At 512 bits n = 16, so one instruction does {=ch12.mo} multiply-adds, 16 times the vector multiply-add ({=ch12.mv} multiply-adds). Each number read in gives {=ch12.per} multiply-adds, where the vector multiply-add gives only 0.5. Intel's **AMX** works on the same idea: 8 "tile" registers, each up to 16 rows × 64 bytes; one TDPBF16PS multiplies a 16 × 32 block and a 32 × 16 block of BF16, adding the result into a 16 × 16 binary32 block, a total of {=ch12.amx} multiply-adds. Intel's figure for one core of a 4th-generation Xeon is 1,024 BF16 operations per cycle.

::: diagram dg-outer keys=dg.outer
cap: Figure 13: an outer product: a column of n numbers times a row of n numbers gives n × n products, added into one block of a matrix register. The figure uses n = 4; SME at 512 bits uses n = 16.
aria: Diagram: the outer product of an n-element column and an n-element row fills an n by n grid, which is added into a matrix register
col: column of n numbers
row: row of n numbers
tile: n × n products added into one tile
cnt: read 2n numbers, do n² multiply-adds
:::

This is the same idea as the tensor cores of a GPU ([[how-a-gpu-computes#ch8|Chapter 8 of How a GPU Computes]]): in matrix multiplication every number is used n times, so if it is brought in once and used in place, compute can grow faster than bandwidth. The difference is scale: one matrix unit on a CPU does over a thousand operations per cycle, while a GPU has more than a hundred SMs, each with several tensor cores.

The model counts instructions and lanes only; it does not simulate matrix-unit latency or data movement. SME has a "streaming mode": the unit must switch state before use, and the vector length in that mode may differ from ordinary SVE. Neither is drawn. {.take}

## Where the Frontier Is (November 2026) {#ch13}

::: strings
toc: Where the Frontier Is (November 2026)
:::

In recent years CPU numerical computing has moved in two directions: first, AI's low-precision formats and block scaling have been brought into CPU vector and matrix instructions; second, the same code can run on hardware of different widths. IEEE 754 itself has not changed; what has changed is the ring of formats around it. {.law}

Below are three kinds of claims: what is established (standards and principles); what has been built (who, and when); and vendor specifications, plans and statements. Each item carries its date; the sources are listed at the end of the page.

### Established {#h.est .sub3}

- IEEE 754-2019 is the current floating-point standard: binary16, 32, 64, 128 and other formats, subnormals, infinities and NaN, several rounding modes, and correct rounding for every basic operation. {#e1}
- How errors accumulate and get amplified is classically summarized in Goldberg's 1991 paper "What Every Computer Scientist Should Know About Floating-Point Arithmetic" and in Higham's "Accuracy and Stability of Numerical Algorithms" (2nd edition, 2002). {#e2}
- The OCP 8-bit floating-point specification (June 2023) and the MX specification 1.0 (September 2023) define E4M3, E5M2, FP6, FP4, and the E8M0 scale for blocks of 32. They are industry specifications, not IEEE standards. {#e3}

### Built {#h.demo .sub3}

- Intel AMX: from the 4th-generation Xeon (Sapphire Rapids, shipped January 2023), 8 matrix registers of 1 KB each per core; Intel's figures are 1,024 BF16 operations and 2,048 INT8 operations per core per cycle. {#d1}
- AMD Zen 5 (2024): in its desktop and server versions, the first AMD core to use a full 512-bit datapath for AVX-512, with two 512-bit FMAs per cycle (Agner Fog's tables); it has no fixed AVX-512 frequency step (Chips and Cheese, February 28, 2025). {#d2}
- Apple M4 (2024): the first chip to support Arm SME, with a streaming vector length of 512 bits; a single thread measured {=ch13.m4} GFLOPS for FP32 outer products, on a matrix unit shared by the performance cores (Remke and Breuer, arXiv, September 2024). {#d3}
- RISC-V: the RVA23 profile was ratified in October 2024, making the vector extension V mandatory. {#d4}

### Specifications, plans and claims {#h.claim .sub3}

- Intel AVX10.2 Architecture Specification, revision 7.0 (April 2026): all processors that support AVX10, including the efficiency cores, support 128-, 256- and 512-bit vector lengths (the earlier 256-only tier has been dropped). AVX10.2 adds conversions of FP8 (E5M2, E4M3), BF16 add, subtract, multiply and divide, and an FP16-to-FP8 conversion that takes a bias operand, which the specification says is there so software can implement stochastic rounding. This is a specification, not a product: which chips ship when, and with which version, is for Intel to announce. {#c1}
- Arm announced the Lumex platform and the C1-series CPUs on September 10, 2025, with SME2 across the range, and claimed AI performance "up to 5× faster". That is Arm's own claim, about devices that were not yet on the market at the announcement. {#c2}
- IEEE P3109 (arithmetic formats for machine learning) is still a draft: it defines a family of formats with adjustable bit widths and precision, several rounding and saturation modes including stochastic rounding, and block-scaled operations (Fitzgibbon et al., arXiv, June 2026, revised October). As of November 2026 I have found no report of formal approval. {#c3}
- NVIDIA says NVFP4 loses no more than 1% accuracy relative to FP8 on the DeepSeek-R1-0528 evaluation (NVIDIA technical blog, 2025). This is the vendor's figure. {#c4}

Still unsolved: the numerical stability of low-precision training; which layers can use FP8 or FP4, and when stochastic rounding is required, is settled more by experience than by theory; block-scaled formats still lack a standard as universally accepted as IEEE 754, which P3109 is trying to supply; and CPU matrix units differ from vendor to vendor, so software has to rely on each vendor's libraries to smooth over the differences.

Models, dates and figures go stale: every fact in this chapter describes the state of things in November 2026, so check its date before relying on it. {.take}

## Closing: Three Questions Before You Write Numerical Code {#ch14}

::: strings
toc: Closing: Three Questions Before You Write Numerical Code
:::

You need not memorize every rule. Before writing numerical code, ask three questions: how precise and how big do these numbers need to be? Where will errors accumulate, and where will they be amplified? Can this loop do a whole row at once, and what holds it back? {.law}

{.qs}
- **How precise and how big?** First estimate the range of the numbers and the significant digits needed: a precision of 0.1 mm across a span of a thousand kilometers is 10 orders of magnitude, and binary32 has only 7 digits, which is not enough (chapter 2). Do not use float for counters and timestamps. For AI's weights and activations, see chapters 7 and 8: the range is handled by the scale, and the precision by the format. {#q1}
- **Where do errors accumulate and get amplified?** Look for long sums (use pairwise or Kahan summation, chapter 5), subtraction of nearly equal numbers (rewrite the formula, chapter 5), and low-precision accumulation (use a wider accumulator, chapter 3). Do not test floating-point numbers for exact equality ([[switches-that-compute#ch10|why 0.1 + 0.2 is not 0.3]]). {#q2}
- **Can it do a whole row at once, and what holds it back?** Check whether the compiled assembly uses ymm, zmm or z registers (an online Compiler Explorer shows this at a glance). If not, check dependencies, pointer overlap and data layout (chapter 10). If it is vectorized but still not fast enough, count the accumulators (chapter 11), and check whether the data come from memory ([[why-compute-waits-for-memory#ch7|roofline]]). {#q3}

In one sentence: floating point is a ruler with unevenly spaced marks, and every measurement must round to the nearest mark; SIMD and matrix units are rulers that measure a row or a block at a time. Writing numerical code means choosing the ruler your problem needs, trading off "how precise", "how big" and "how fast". {#sum .sum}

Related essays: [[switches-that-compute]] (gates, adders, and the first encounter with floating point), [[how-a-cpu-runs-a-program]] (instructions and pipelines), [[how-a-cpu-guesses-ahead]] (branch prediction and out-of-order execution: hardware finding independent instructions on its own), [[how-cpu-caches-work]] (cache lines and alignment), [[why-compute-waits-for-memory]] (the roofline and large-model inference), [[how-a-gpu-computes]] (tensor cores and number formats on GPUs). Another long essay, [[what-a-frontier-model-takes|“What It Takes to Build and Run a Frontier Large Language Model”]], covers what a frontier large model takes to train and run. {#links}

::: footer
**Sources.** IEEE Std 754-2019, IEEE Standard for Floating-Point Arithmetic (format parameters, rounding, special values; chapters 1–4). D. Goldberg, "What Every Computer Scientist Should Know About Floating-Point Arithmetic," ACM Computing Surveys 23(1), 1991. N. J. Higham, Accuracy and Stability of Numerical Algorithms, 2nd edition, SIAM, 2002 (summation error, Kahan summation). W. Kahan, "Further remarks on reducing truncation errors," CACM 8(1), 1965. B. P. Welford, "Note on a method for calculating corrected sums of squares and products," Technometrics 4(3), 1962.

P. Micikevicius et al., "FP8 Formats for Deep Learning," arXiv:2209.05433 (2022); OCP 8-bit Floating Point Specification (OFP8) 1.0 (June 2023); OCP Microscaling Formats (MX) Specification 1.0 (September 2023); B. Darvish Rouhani et al., "Microscaling Data Formats for Deep Learning," arXiv:2310.10537 (2023). NVIDIA, "Introducing NVFP4 for Efficient and Accurate Low-Precision Inference" (technical blog, 2025).

Intel, Intel Advanced Vector Extensions 10.2 Architecture Specification, document 361050, revision 7.0 (April 2026); Intel AMX (Intel instruction set extension reference; clang's amxintrin.h). A. Fog, Instruction tables (updated 2025-09-20). T. Downs, "Gathering Intel on Intel AVX-512 Transitions" (2020-01-17); T. Downs, "Ice Lake AVX-512 Downclocking" (2020-08-19). Chips and Cheese, "Zen 5's AVX-512 Frequency Behavior" (2025-02-28). Arm, Scalable Matrix Extension introduction (Arm developer blog); Arm press release, Lumex CSS (2025-09-10). S. Remke and A. Breuer, "Hello SME!," arXiv:2409.18779 (2024). RISC-V International, RVA23 Profile 1.0 (2024-10). A. Fitzgibbon et al., "Novel Aspects of IEEE SA P3109 Arithmetic Formats for Machine Learning," arXiv:2606.04028 (2026).

**Models.** Floating-point formats and rounding: exact rational arithmetic (BigInt) and bit-by-bit rounding per the IEEE 754 rules; the simulations use double precision plus TwoSum to obtain the exact remainder before rounding, and the tests check them one by one against exact algorithms. Variance: one-pass, two-pass, Welford. Summation: sequential, pairwise, Kahan. Block scaling: the scale is taken per OCP MX 1.0 §6.3, and NVFP4 follows NVIDIA's description. Multiply-add pipeline: cycle-by-cycle issue simulation, with parameters from Agner Fog. Frequency licenses: simulated microsecond by microsecond from Downs's measurements. All random numbers use fixed seeds. This essay was written by Claude (Anthropic's AI) and was independently reviewed and revised by another Claude instance on November 16, 2026.
:::
