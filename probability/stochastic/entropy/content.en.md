---
lang: en
---

::: strings
docTitle: Entropy · The Average Surprise · One Interaction per Step
back: ← Knowledge Index
pageTitle: Entropy
tagline: Entropy is the average surprise: the rarer an event, the more information its occurrence carries, and entropy compresses a source's total uncertainty into a single number. It is the absolute limit of compression, the ancestor of machine-learning loss functions, and the same formula as thermodynamic entropy. This page starts with a guessing game and lets you build the scale yourself — then weigh passwords, models, and the universe with it.
foot: visual.integ.life · Entropy — one interaction per step
reset: Reset
:::

## Guess the Next Symbol {#step0 h2=s0t}

::: strings
nav0: 0 Hook
:::

Step 0 · Hook {#s0k .step-kicker i18n=text}

Two symbol machines, each emitting only A, B, C, D. **Machine A** is heavily skewed: A comes up 70% of the time. **Machine B** is uniform: 25% each. Guess first, then reveal, and keep score — you will find A is naturally easy to score on, while B gives you one chance in four no matter what you do. That is not luck; the two sources differ in predictability. And predictability can be weighed. {#s0e .explain}

::: html step0-1
machA: Machine A · Skewed (A = 70%)
guessLab: Guess the next one:
draw10: Draw 10
machB: Machine B · Uniform (25% each)
:::

A trick: on Machine A, always guessing A yields a 70% long-run hit rate — the optimal strategy is always to guess the most probable symbol. Machine B offers no such trick: every symbol is equally surprising. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
s0ro: Guesses <span>{n}</span> · hits <span>{hits}</span> · hit rate <span>{rate}</span> · last one: <span>{last}</span>
s0ro0: No guesses yet — pick a symbol above; guess first, then it reveals.
s0hit: ✓ Hit
s0miss: ✗ It was
s0H: The two entropies, numbers first: Machine A H ≈ <span>{hA} bits/symbol</span> · Machine B H = <span>{hB} bits/symbol</span>. The smaller the entropy, the easier the guessing — the formula is built by hand in Step 2.
:::

## I = −log₂ p: Surprise Has a Price {#step1 h2=s1t}

::: strings
nav1: 1 Pricing Surprise
:::

Step 1 · Pricing Surprise {#s1k .step-kicker i18n=text}

First, price a single event. If an event has probability p, the "surprise" you collect when it happens is I. A good price must satisfy two intuitions: **rarer means more surprising** (smaller p, bigger I; p = 1 gives I = 0); and — given that "rarer means more surprising" — exactly one pricing scheme can make the surprises of independent events **add up**: the logarithm (the second half of this step shows why). Drag the slider and watch the price move with p. {#s1e .explain}

::: html step1-1
pLab: Event probability p (log scale)
pOne: p = 1 (certain)
pHalf: p = 1/2
:::

Why Must It Be a Logarithm? {#s1sub .sub-t tag=h3 i18n=text}

The key requirement is **additivity**: when two independent events happen together, the total surprise should be the sum of the parts. One coin landing heads is worth 1 unit; "two coins both heads" is a p = 1/4 event and must be worth exactly 2 units. Push further: "four coins all heads" has p = 1/16 and can be seen as two independent "both heads" events (p = 1/4 each), so the total must be 2 + 2 = 4 units. Both ledgers below are computed live by the page: log pricing always balances; any other pricing (say 1/p) is caught red-handed — which is why I must be −log p (under a monotonicity assumption, the logarithm is the unique additive price). {#s1e2 .explain}

::: html step1-2
flipBtn: Flip four coins (wait for "all heads")
newSeed: New seed
:::

Three anchors are enough: p = 1/2 → 1 bit, p = 1/8 → 3 bits, p = 1 → 0. This is where the unit "bit" comes from: the surprise of one fair coin flip is exactly one unit. {#s1hint .hint}

::: strings
dash: —
s1ro: p = <span>{p}</span> ({frac}) · surprise I = −log₂ p = <span>{I} bits</span>
cSurpY: Surprise I (bits)
cSurpBar: Surprise of this event
s1add: Log pricing: I(1/4) + I(1/4) = {a} + {a} = <span>{s} bits</span>, and I(1/16) = <span>{j} bits</span> — <span class="good">equal ✓</span><br>With 1/p pricing: {pa} + {pa} = {ps}, but the joint event is priced {pj} — <span class="bad">{ps} ≠ {pj} ✗</span>
s1flip0: Not flipped yet. Press the button to flip four coins at a time and see how long "all heads" takes.
s1flip: Flipped <span>{n}</span> groups of four · "all heads" appeared <span>{hits}</span> times (theoretical probability 1/16 ≈ 6.25%; the frequency settles toward it over long runs, short runs fluctuate — that is normal) · each appearance pays I = 4 bits of surprise = two "both heads" worth 2 bits each · seed {seed}
:::

## The Entropy Workshop: Average the Surprise {#step2 h2=s2t}

::: strings
nav2: 2 Entropy Workshop
:::

Step 2 · Entropy {#s2k .step-kicker i18n=text}

A single event's surprise jumps around, but after a source emits thousands of symbols, the **average surprise per symbol settles onto one number** — the entropy H: each symbol's surprise I = −log₂ p weighted by its own probability. Drag the sliders to build your own distribution (weights auto-normalize), then fire the emitter and watch the average hug H. Convention: a symbol with p = 0 contributes 0·log 0 = 0 (the limit) — it never appears and adds no surprise. {#s2e .explain}

::: html step2-1
wLab: weight
preSkew: Preset: skewed 50/25/15/10
preUni: Preset: uniform (max H)
preOne: Preset: nearly single (min H)
sample1: Sample 1
sample20: Sample 20
sampleRun: Auto-sample
resetSamples: Reset samples
:::

The uniform distribution gives H = 2 bits, the maximum for four symbols: every symbol is equally surprising, so you cannot help being surprised. Squash the distribution to nearly a single symbol and H nears 0: the source has almost no suspense. The sampling curve jitters early and hugs the line as samples pile up — the law of large numbers at work (the star of the Central Limit Theorem page). {#s2hint .hint}

::: strings
sampleStop: Stop
cDistT: Distribution (bar = probability, top number = surprise I)
cRunT: Running average surprise → H (y-axis auto-expands to the largest running average seen)
cHLine: H (theory)
cEmpLine: empirical average
s2ro: Distribution p = [{p}] · entropy H = <span>{H} bits/symbol</span> · sampled <span>{n}</span> · empirical average surprise <span>{emp}</span> · difference from H <span>{diff}</span> (theoretical standard error ≈ σ<sub>I</sub>/√n = {se}; σ<sub>I</sub> is the standard deviation of the surprise I, and the standard error is the typical error of the average surprise itself — it shrinks as you sample more) · seed {seed}
s2ro0: Distribution p = [{p}] · entropy H = <span>{H} bits/symbol</span> · no samples yet — press "Sample" and watch the average surprise hug H · seed {seed}
:::

## A Coin's Hump, and the Floor on Questions {#step3 h2=s3t}

::: strings
nav3: 3 Binary Entropy & 20 Questions
:::

Step 3 · Binary Entropy & Twenty Questions {#s3k .step-kicker i18n=text}

For a two-outcome source (a coin flip), entropy is a function H(p) of the heads probability p, and its graph is the famous **hump**: the peak is exactly 1 bit at p = 0.5, and it falls to 0 as the outcome becomes certain. Drag p and ride the curve. {#s3e .explain}

::: html step3-1
pLab3: Heads probability p
:::

Twenty Questions: Guess a Number from 1–8 {#s3sub .sub-t tag=h3 i18n=text}

The game of twenty questions is, at heart: ask yes/no questions to locate the answer as fast as possible. Guessing one of 1–8, all equally likely, the source entropy is log₂8 = **3 bits**, so any strategy needs at least 3 questions on average — and **binary search** (ask "is it ≤ the midpoint?", halving the range) uses exactly 3 for every number, hitting the floor. Pick a secret number below and run both strategies; the accounts are computed from the decision tree's depths. {#s3e2 .explain}

::: html step3-2
qTarget: Secret number:
qRand: Pick randomly
qBinBtn: Ask by binary search
qSeqBtn: Ask one by one
:::

Why can't the average beat H? Each yes/no question rules out at most half the possibilities, carrying at most 1 bit; locating an answer worth H bits of information takes at least H questions on average. This is the same wall as "average code length ≥ H" in Step 4, stated two ways. {#s3hint .hint}

::: strings
s3ro: p = <span>{p}</span> · H(p) = <span>{H} bits</span> (maximum at p = 0.5, exactly 1 bit; → 0 as p → 0 or 1)
cCurveT: Binary entropy H(p)
cPeak: Peak: p = 0.5, H = 1 bit
qAskLe: Q{i}: is it ≤ {mid}? → {ans}
qAskEq: Q{i}: is it {k}? → {ans}
qYes: yes
qNo: no
qDeduce: The first {i} answers are all "no" — no need to ask: it can only be {n} (elimination)
qFound: 🎯 Found {n} in <span>{c}</span> questions.
qIdle: Pick a secret number, then choose a strategy to see the question log.
qPicked: Secret number picked: <span>{n}</span> — now choose a strategy to see how the question log finds it.
treeT: Binary decision tree (all leaves at depth 3)
nodeQ: ≤ {mid}?
s3dro: Binary search: questions per number [{bd}], average <span>{bm}</span> = H = log₂8 = 3 bits (hits the floor ✓) · One by one: questions per number [{sd}], average <span>{sm}</span> &gt; H (a clumsy strategy — the extra {extra} questions are waste)
:::

## Huffman: Touching the Limit by Hand {#step4 h2=s4t}

::: strings
nav4: 4 Huffman Coding
:::

Step 4 · Huffman Coding {#s4k .step-kicker i18n=text}

Assign binary codewords to symbols: frequent symbols get short codes, rare ones long codes. How low can the average code length go? Shannon says the floor is H. In 1952 Huffman published a greedy algorithm that lands within 1 bit above that wall: **repeatedly merge the two least probable nodes into one**, growing a tree whose root-to-leaf paths are the codewords. Grow the tree step by step below. {#s4e .explain}

::: html step4-1
s4src: The distribution is **shared with the Step 2 workshop**: change the sliders in Step 2 above and the tree here rebuilds for the new distribution; the presets below also set the Step 2 distribution.
preDyadic: Preset: 1/2, 1/4, 1/8, 1/8 (L exactly = H)
hPrev: ← Previous step
hNext: Next step →
hPlay: Auto-play
msgLab: Encode this message:
encodeBtn: Encode
:::

**Tie-breaking rule** (affects the tree's shape, never the bound): among equal weights, the node that entered the list earlier merges first — leaves ordered A→D, internal nodes by creation order. A different rule may grow a different tree and a different L, but every Huffman tree must land in [H, H+1); a reviewer rebuilding the tree with another rule lands in the same interval. {#s4tie .hint}

Try the preset 1/2, 1/4, 1/8, 1/8: L and H agree to three decimals — when every probability is a power of 1/2, Huffman fits H exactly, with no slack. Then try uniform: L = 2 = H, and the fixed-length code was optimal all along. {#s4hint .hint}

::: strings
hPause: Pause
cTreeT: Huffman merging (highlighted pair merges next)
s4step: Step {k}/{total}: {desc}
s4stepInit: Start: {n} leaf nodes (one per symbol)
s4stepMerge: Merge {a} ({pa}) with {b} ({pb}) → new node {ab} ({pab})
s4stepDone: Done: the tree is grown; codewords in the readout below
s4ro: Entropy H = <span>{H} bits</span> · Huffman average code length L = <span>{L} bits/symbol</span> · fixed-length code ({fixed} bits for each of the {n} symbols that can occur): <span>{fixed} bits/symbol</span> · saves {save} bits per symbol
s4bound: Bound check: H = {H} ≤ L = {L} &lt; H + 1 = {H1} ✓ (Shannon's source coding theorem: every prefix code has L ≥ H; Huffman guarantees L &lt; H + 1 — and this ✓ is decided live from the measured H and L, not printed in advance)
s4boundBad: Bound check: H = {H}, L = {L}, H + 1 = {H1} — <span class="bad">outside [H, H+1) ✗</span> (Shannon's source coding theorem says this cannot happen; if you see this line, the page has a bug — please note the distribution)
s4degen: Note: with only **one possible outcome** left, the Huffman tree degenerates to a single leaf — that symbol's codeword is the **empty string** (length 0), so L = 0 = H: the outcome holds no suspense and takes no bits at all to convey, and Shannon's bound is met with equality. The p = 0 symbols never occur and are excluded before the tree is built.
s4codesT: Codeword table (code length = tree depth):
s4codeLine: {s}: p = {p}, codeword <span>{code}</span> (length {len})
s4codeZero: {s}: p = 0 — excluded from the code: it never occurs, needs no codeword (and contributes nothing to L)
s4codeEmpty: {s}: p = {p}, codeword <span>(empty string)</span> (length 0) — the only possible outcome takes no bits at all to convey
s4mro: Message {msg} ({n} symbols) → <span>{bits}</span> · total <span>{count} bits</span> · measured average {emp} bits/symbol (expectation = n × L = {exp} bits; a single message fluctuates, only the long-run average settles on L)
s4mro0: Pick a message and press "Encode" to see how long a bit string it becomes.
s4mroBad: This message contains a symbol with p = 0 — under the current distribution it never occurs, the code table has no codeword for it, and no honest bit string exists. Pick another message, or give it some probability back in Step 2.
:::

## How Expensive Is a Wrong Model? {#step5 h2=s5t}

::: strings
nav5: 5 Cross-Entropy & KL
:::

Step 5 · Cross-Entropy & KL Divergence {#s5k .step-kicker i18n=text}

The real world emits symbols by distribution p, but your model believes the world is q. Price p's data with q's ledger and the average surprise becomes the **cross-entropy** H(p, q); the excess over the true entropy H(p) is the price of being wrong — the **KL divergence**. One line ties them together: H(p, q) = H(p) + KL(p‖q). Drag q's sliders and watch the price move. {#s5e .explain}

::: html step5-1
pLab5: True distribution p
preDyadic2: 1/2, 1/4, 1/8, 1/8
preSharp: Skewed 70/10/10/10
qLab5: Your model q
qCopyBtn: Set q = p (perfect model)
swapBtn: Swap p ↔ q
smoothLab: Smooth q: q′ = 0.99·q + 0.01·uniform (ε = 0.01)
s5inf: ⚠ **q assigns 0 to a symbol that p can actually emit.** In q's ledger that event "cannot happen"; when it does, the surprise is +∞ — cross-entropy and KL are both +∞, and the page shows ∞ honestly rather than hiding behind a big number. In real training this is a model giving probability 0 to a correct class: a single sample blows the loss to infinity. The smoothing toggle above pads every symbol of q with a little probability and yields finite numbers — but that is a different q, and the readout says "smoothed".
:::

Note: KL is always ≥ 0 by definition (Gibbs' inequality); floating-point arithmetic occasionally produces a negative value around −0.000, which this page clamps to 0 for display — mathematically it is 0. {#s5foot .hint}

Callback: the <a class="fourier-link" href="../../../computing/ml/gradient-descent/#step6">Gradient Descent page</a> ends by training a classifier, and what it minimizes is exactly this cross-entropy H(p, q) — with the label distribution p fixed, lowering cross-entropy is the same as lowering KL(p‖q), i.e. pulling the model q toward the truth p. Most of what training calls "loss" is this number. {#s5link .hint}

::: strings
cBarsT: p (cyan) vs q (orange), symbol by symbol
lgP: true p
lgQ: model q
lgQS: model q (smoothed)
s5ro: H(p) = <span>{Hp} bits</span> · cross-entropy H(p, q) = <span>{Hpq} bits</span> · KL(p‖q) = <span>{KL} bits</span> · decomposition check: H(p) + KL = {sum} (residual {res}) · reverse direction KL(q‖p) = <span>{KLr} bits</span> — the two directions differ: KL is not a distance, it is the price of the wrong ledger, and a price has a direction
s5roInf: H(p) = <span>{Hp} bits</span> · cross-entropy H(p, q) = <span>+∞</span> · KL(p‖q) = <span>+∞</span> · reverse KL(q‖p) = <span>{KLr} bits</span> (finite — reverse the direction and the ledger balances again: KL asymmetry in its most extreme form)
s5roSmooth: (smoothed) H(p) = <span>{Hp} bits</span> · cross-entropy H(p, q′) = <span>{Hpq} bits</span> · KL(p‖q′) = <span>{KL} bits</span> · decomposition check: H(p) + KL = {sum} (residual {res}) · reverse KL(q′‖p) = <span>{KLr} bits</span> — note: this is the ledger of the smoothed q′, not of the original q (the original is +∞; see the warning below)
s5hint: First press "Set q = p" and watch KL vanish and cross-entropy equal H(p) exactly. Then drag one of q's sliders to 0 where p is not 0, and watch the +∞ warning. Finally swap p ↔ q and compare the two KL directions.
:::

## The Map of Entropy: One Scale {#step6 h2=s6t}

::: strings
nav6: 6 The Map of Entropy
:::

Step 6 · Finale {#s6k .step-kicker i18n=text}

Finally, hold this scale up to three distant relatives: passwords, thermodynamics, and compression software. They all speak the same language — only the units and constants differ. {#s6e .explain}

::: html step6-1
pwT: ① Password Strength Meter
pwD: When a password is drawn uniformly at random, character by character, its entropy is "length × bits per character". An attacker has no shortcut (uniform randomness leaves no pattern to exploit) and can only try candidates one by one.
lenLab: Password length
cs10: Digits only (10)
cs26: Lowercase (26)
cs62: Letters+digits (62)
cs94: All printable (94)
rateNote: **Conventions, stated openly**: expected guesses = 2<sup>H−1</sup> (on average you search half the space); assumed rate 10<sup>10</sup> guesses/second (fast offline cracking territory). This assumes a truly random password — human-chosen passwords have far less entropy than this, which is a different story; this card weighs only truly random ones.
physT: ② Physical Entropy: One True Sentence
physD: Thermodynamic and information entropy are **the same formula in different units** — not "exactly identical": Gibbs' formula S = −k<sub>B</sub>·Σ p·ln p uses natural logarithms (nats) and multiplies by Boltzmann's constant k<sub>B</sub>, giving joules per kelvin; information entropy uses log<sub>2</sub> and bits — the two differ only by the constant factor k<sub>B</sub>·ln 2. Boltzmann's tombstone formula S = k<sub>B</sub>·ln W is its special case: when W microstates are equally likely, the Gibbs formula reduces to exactly that. Physicists and information theorists really are measuring the same "uncertainty" — at different exchange rates.
compT: ③ The Reality of Compression
compD: Back to Step 4: how small a file can be compressed is floored by its entropy. Zip still squeezes plain text because text's symbol distribution is far from uniform, so its entropy sits below the fixed-length code. Compress an **already-compressed** file again and almost nothing gives — not laziness: its entropy has already been touched, and every remaining bit is "real surprise" with no pattern left to exploit. Encrypted files are the same: good ciphertext should look like uniform random numbers, entropy maxed out, nothing to grab.
s6fin: **To close.** From a guessing game to password strength and thermodynamics, entropy is one scale. It does not measure "disorder" the adjective — it measures "on average, how surprised are you". The probability line closes here: <a class="fourier-link" href="../../inference/bayes-updating/#step2">Bayes</a> showed how beliefs update, the <a class="fourier-link" href="../../statistics/central-limit-theorem/#step0">Central Limit Theorem</a> showed how randomness settles into a bell, and this page showed how uncertainty itself is measured. Three pages, one discipline: keeping honest books when dealing with randomness.
s6linkIdx: ← Back to the index
:::

::: strings
cTimeT: Expected cracking time
tSec: 1 sec
tDay: 1 day
tYear: 1 year
tUniv: Age of universe
s6ro: Alphabet of {size} · log₂{size} = {per} bits per character · total entropy H = <span>{H} bits</span> · expected guesses <span>{g}</span> · expected cracking time <span>{time}</span>
timeSec: about {v} seconds
timeMin: about {v} minutes
timeHour: about {v} hours
timeDay: about {v} days
timeYear: about {v} years
timeUniv: about {v} × the age of the universe (13.8 billion years)
:::
