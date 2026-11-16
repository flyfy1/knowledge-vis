---
lang: en
---

::: strings
back: ← Knowledge Index
category: Computing & AI
stage: University
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: RSA Public-Key Encryption · Easy to Multiply, Hard to Split
tagline: Multiplying two big primes takes one step; recovering them from the product takes an astronomical number — and that asymmetry makes a public lock and a private key possible.
:::

## Multiplying primes is one step; splitting the product takes a long search {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Easy to multiply
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: A one-way difficulty
:::

This step asks: why is “multiply” so much easier than “factor”? A **prime** is a number divisible only by 1 and itself. Multiplying two primes p and q to get n = p·q takes one multiplication (green). Going back, the plainest way to find p and q from n is **trial division**: try odd numbers from 3 upward until one divides n, about p/2 tries (red line, log scale). The horizontal axis k means p and q have about k digits. The orange dots are trial-division counts really run in your browser (k ≤ 7); the red line beyond k = 7 is extrapolated by formula, not run. **What to do:** drag k: each extra digit multiplies the work by about 10; at k = 30 it is around 10²⁹, which even at 10⁹ steps a second would take millions of billions of years. Trial division is only the crudest method; better ones are in step 5. {#s0e .explain}

::: html step0-2
s0cv: Multiplication 1 step (green) and trial-division steps (red: formula; orange: actually run), log scale
digitsL: Digits k in each prime
:::

::: strings
digitsAxis: digits k in each prime
opsAxis: steps (log scale)
legMul: multiply: 1 step
legFac: trial division: about p/2 steps (formula)
legMeasured: steps actually run (k ≤ 7)
measured: measured by running it
extrap: extrapolated by formula, not run
s0ro: Each prime has about {k} digits, so n has about {nd}: multiplying takes {mul} step; trial division about {fac} steps ({how}); at 10⁹ steps a second that is about {sec} s.
:::

## In modular arithmetic, what path does repeated multiplication by one number trace? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Clock arithmetic
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: Arithmetic on a clock
:::

This step asks: what pattern does the “remainder” operation used by RSA follow? **a mod n** is the remainder when a is divided by n; picture the numbers 0 to n−1 around a circle like a clock face. Start at 1 and multiply by a over and over: 1, a, a², …, reducing mod n each time, hopping around the circle until a number repeats. When a and n are coprime (greatest common divisor 1) the path always returns to 1 in a closed loop; **φ(n)** (Euler’s totient) counts the numbers from 1 to n coprime to n, and Euler’s theorem says a^φ(n) mod n = 1. **What to do:** change n and a: the green dot is the start 1 and the cyan path the hops; if a shares a factor with n it never gets back to 1. The readout gives the loop length, which always divides φ(n). This property is why step 3’s decryption works. {#s1e .explain}

::: html step1-2
s1cv: The numbers 0 to n−1 around a circle: the path from 1 under repeated multiplication by a (mod n)
modL: Modulus n
baseL: Base a
:::

::: strings
chkYes: a^φ(n) mod n = 1 holds and the loop returns to 1 (Euler’s theorem)
chkNo: coprime yet not back at 1? (should not happen)
chkNA: a and n are not coprime, so it never returns to 1
s1ro: a = {a}, n = {n}: path {seq}; loop length {len}; gcd(a, n) = {g}, φ(n) = {phi}; a^φ(n) mod n = {r}. {chk}.
:::

## How do you turn two primes into a public lock and a private key? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Make a key pair
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: Make a key pair
:::

This step asks: how do p and q give a public and a private key? Take two different primes p and q (here 5 to 43), set n = p·q and φ(n) = (p−1)(q−1). Choose a **public exponent** e coprime to φ, then use the **extended Euclidean algorithm** to find d with e·d leaving remainder 1 on division by φ (d is the multiplicative inverse of e mod φ). The table shows each row of the algorithm: r₀ and r₁ are the remainder sequence, q the quotient, x and y the coefficients; the green x in the last row, reduced mod φ, gives d. The **public key** is (e, n), safe to publish; the **private key** is (d, n) and must stay secret — others know n but not φ(n), and computing φ(n) means factoring n first. **What to do:** change p, q and e; the readout verifies e·d = 1 + k·φ. {#s2e .explain}

::: html step2-2
s2cv: The extended Euclid table and the resulting public and private keys
pL: Prime p
qL: Prime q (moves to the next prime if equal to p)
eL: Public exponent e (which number coprime to φ)
:::

::: strings
euclidTitle: finding the inverse of e = {e} modulo φ = {phi}
pubKey: public key (shareable)
privKey: private key (secret)
yes: yes
no: no
s2ro: p = {p}, q = {q}: n = {n}, φ(n) = {phi}; candidate e: {es}; with e = {e} we get d = {d}; check e·d = {prod} = 1 + {k}·{phi}, so e·d mod φ = 1: {ok}.
:::

## Lock with the public key, only the private key opens it {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Encrypt and decrypt
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: Encrypt and decrypt
:::

This step asks: how do you send a number with this key pair? Turn the message into an integer m smaller than n (the **plaintext**). The sender uses the public key to compute the **ciphertext** c = m^e mod n; the receiver uses the private key to compute m′ = c^d mod n and gets m back. Why: e·d = 1 + k·φ(n), and by Euler’s theorem from step 1 (valid for n = p·q as well) m^(e·d) ≡ m. Each dot is (plaintext m, ciphertext c) — the cloud looks scrambled, with no simple rule; the orange dot is your chosen m. The bottom shows m → c → m′. It works by repeated squaring (the readout gives the number of multiplications), not by actually computing m^e. **What to do:** drag m: the orange dot jumps among the scatter but decryption always returns m; the readout checks that every plaintext from 0 to n−1 decrypts correctly. {#s3e .explain}

::: html step3-2
s3cv: The ciphertext c for each plaintext m (point cloud); the orange dot is the chosen m
mL: Plaintext m (below n)
:::

Uses the p, q, e you chose in the previous step and the d computed from them. {#keysFrom2 .note i18n=text}

::: html step3-3
:::

::: strings
mAxis: plaintext m
cAxis: ciphertext c
plain: plaintext m
cipher: ciphertext c
decrypted: decrypted m′
s3ro: m = {m}: c = m^{e} mod {n} = {c}; m′ = c^{d} mod {n} = {back}, equal to m: {ok}. {all} of all {tot} plaintexts decrypt correctly. Encrypting takes {sq} multiplications, decrypting {sq2}.
:::

## Holding only n, how much work does an eavesdropper need to split out p and q? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 The eavesdropper’s bill
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: The eavesdropper’s bill
:::

This step asks: Eve knows only the n in the public key; to break the private key she must factor n. Press Run and she scans with trial division for real, in your browser: the red bar is the fraction tried and the number is how many odd candidates she has tried. The green bar is the legitimate user’s work: encrypting a message with the public exponent e = 65537 takes only a couple of dozen multiplications (drawn by logarithmic length so it can share a ruler with the red bar). **What to do:** choose the size of n (each prime about k digits, up to k = 7, n about 14 digits) and press Run: a small n is split instantly; at k = 7 she needs millions of tries and the red bar runs for a while. Adding digits makes the cost of this method grow exponentially. Reset clears her progress. {#s4e .explain}

::: html step4-2
s4cv: Eve’s trial-division progress (red) and the legitimate user’s encryption work (green)
logNote: the green bar uses the log of the step count, only to compare orders of magnitude with the red bar
run: Run
resetEve: Reset
sizeL: The n to attack (primes about k digits)
:::

::: strings
pause: Pause
eveScan: Eve trial-divides n = {n}
tried: {k} tried
aliceWork: legitimate user encrypting a message
aliceSteps: {k} multiplications
s4ro: n = {n}: trial division needs {steps} tries in all; a legitimate encryption takes about {alice} multiplications; Eve has tried {tried} so far.
s4roDone: Eve found n = {n} = {p} × {q}: {steps} trial divisions against about {alice} multiplications for encryption, a factor of {ratio}. With p and q she can compute φ(n) and the private key d.
:::

## How long must real keys be? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Real key lengths
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: Keys in the real world
:::

This step asks: why are modern RSA keys 2048 bits or more? The fastest known general factoring algorithm today (the general number field sieve) takes about exp((64/9)^(1/3)·(ln n)^(1/3)·(ln ln n)^(2/3)) operations — faster growth than any polynomial but slower than trial division. The plot shows key length against the work needed (log scale); the dashed line is the total work of a machine doing 10¹⁸ operations a second for the age of the universe. This is an order-of-magnitude estimate that ignores constants and implementation. **What to do:** drag the bits: 512 bits is about 10¹⁹ operations (factored in 1999), 1024 bits about 10²⁶, 2048 bits about 10³⁵. One caution: this page teaches “textbook” RSA; real systems add random padding (such as OAEP), and Shor’s algorithm on a quantum computer would factor integers in polynomial time, so the future needs other schemes. {#s5e .explain}

::: html step5-2
s5cv: Work needed to factor an n of that many bits (number field sieve estimate, log scale)
bitsL: Key length (bits)
recapTitle: Recap
recap1: Multiplying primes is easy and factoring a large integer is hard: that asymmetry underlies public-key encryption; trial division takes about p/2 steps and each extra digit multiplies the work by 10.
recap2: Keys: n = p·q, φ = (p−1)(q−1), e coprime to φ, d = e⁻¹ mod φ (extended Euclid); encrypt c = m^e mod n, decrypt m = c^d mod n, which works by Euler’s theorem.
recap3: Textbook RSA is only a demonstration: real systems need long keys, random padding, and a plan for quantum computers.
modelTitle: Scope and limits of this model
modelText: Scope: textbook RSA with very small primes (5–43) and exact BigInt arithmetic; no padding, no signatures, no secure random numbers; “the eavesdropper’s bill” runs plain trial division for real in your browser (k ≤ 7); step 5’s number-field-sieve work is an order-of-magnitude estimate ignoring constants and hardware; quantum attacks such as Shor’s algorithm are not simulated. Do not use this page’s tiny keys to protect anything real.
link1: → Division and remainder: where “mod” comes from
link2: → Hashing: another kind of one-way function
link3: → Exponentials and logarithms: why one more digit means ten times the work
:::

Page complete. {#done .readout .success i18n=text}

::: strings
bitsAxis: bits in n
opsAxis2: operations (log scale)
ageLine: a 10¹⁸ ops/s machine running for the age of the universe
vTrivial: breakable almost at once
vFeasible: breakable within a human lifetime (possibly with many machines)
vLong: far beyond human timescales
s5ro: {b} bits: about 10^{lg} operations; one machine at 10¹⁸ operations a second would need about 10^{yrs} years (order of magnitude): {verdict}.
docTitle: RSA Public-Key Encryption · Easy to Multiply, Hard to Split
:::
