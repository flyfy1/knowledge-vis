---
lang: en
---

::: strings
pageTitle: Meiosis · Shuffle, Halve, Make Gametes
tagline: Chromosomes pair up, swap pieces, first separate the homologs and then the sister chromatids: one diploid cell becomes four haploid gametes that are not all alike.
:::

## A diploid cell has its chromosomes in pairs {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Paired chromosomes
:::

::: html step0-1
:::

This step answers: why is it called "meiosis", which means reduction? Most body cells are **diploid** (written 2n): the chromosomes come in pairs, one of each pair from the mother (red) and one from the father (blue), and these two are **homologous chromosomes**. On this page n is the number of homologous pairs, so the cell has 2n chromosomes. To make sperm or eggs (**gametes**) the cell must halve its chromosome number, so each gamete carries one chromosome of each pair and fertilisation restores 2n. Press "replicate": in S phase each chromosome is copied into two identical **sister chromatids** (an X shape); the chromosome count is still 2n but the DNA has doubled. {#s0e .explain}

::: html step0-2
s0o: Change the number of pairs n: count the red and blue chromosomes; press replicate: each becomes an X (two sister chromatids) while the chromosome count stays the same; the readout gives chromosomes and chromatids in the cell and how many a gamete should get.
lPairs: Number of homologous pairs n
bRep: Replicate the chromosomes (S phase)
bUnrep: Reset: back to before replication
:::

::: strings
r0: n = {n} pairs: body-cell chromosomes 2n = {c2}; {state}a gamete should have n = {c1} (one of each pair).
stUnrep: "not replicated yet: chromatids = {c2}; "
stRep: "replicated: each chromosome has 2 sister chromatids, {ch} chromatids in all; "
:::

## Two divisions: homologs first, then sister chromatids {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Two divisions
:::

::: html step1-1
:::

This step answers: how is the chromosome number halved and how do new combinations arise? Meiosis is two divisions in a row. In **meiosis I** homologous chromosomes first pair up (prophase I), may **cross over** and swap pieces between non-sister chromatids, then line up on the equator in metaphase I and are pulled to opposite poles in anaphase I; this is the step that halves the number. In **meiosis II**, like mitosis, sister chromatids separate, giving four haploid cells. The figure uses n = 2 pairs, red and blue showing maternal and paternal origin, and a chromatid whose upper and lower parts differ in colour has crossed over. Drag the slider through the stages. {#s1e .explain}

::: html step1-2
s1o: Drag the stage from 0 to 7: notice at which step the chromosome number drops from 4 (2n) to 2 (n) and which step finally separates sister chromatids; press "re-roll alignment" to see how red and blue recombine in the four final gametes; switch crossing over on to see two colours on one chromatid.
lStage: Division stage
bFlip: Re-roll how the chromosomes line up
bCross: Toggle: crossing over happens
:::

::: strings
stg0: After replication (end of S phase): each chromosome has two sister chromatids
stg1: Prophase I: homologs pair up and may cross over
stg2: Metaphase I: homologous pairs line up on the equator, with random orientation
stg3: Anaphase I: homologs are pulled to opposite poles
stg4: Telophase I: 2 cells, each with n chromosomes (still double)
stg5: Metaphase II: the chromosomes in each cell line up on the equator
stg6: Anaphase II: sister chromatids separate and move to the poles
stg7: Telophase II: 4 haploid gametes, each with n single chromatids
r1: Stage {s}/7: {name}. Alignment: {ori}; crossing over: {cr}. {cnt}
oriTxt: pair {p}: maternal (red) goes to the {side}
sideL: left pole
sideR: right pole
crOn: occurred (once per pair)
crOff: not occurring
cnt1: Chromosomes per cell now: {c}; chromatids per cell: {ch}.
:::

## Random assortment: n pairs can make 2ⁿ kinds of gamete {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Random assortment
:::

::: html step2-1
:::

This step answers: why do children of the same parents differ from one another? In metaphase I, which pole each homologous pair goes to is **independent and random**, so n pairs combine in 2ⁿ ways (ignoring crossing over). Humans have n = 23 and 2²³ = 8,388,608, which is already a lot. Press "do 10 meioses": each one picks orientations at random and produces 4 gametes; the bars below tally how often each combination occurs. The more draws, the closer the bars are to equal. In the code under each bar, R means the pair's maternal (red) chromosome and B the paternal (blue) one. {#s2e .explain}

::: html step2-2
s2o: Set n to 3 (8 combinations) and press several times: first the bars are uneven, then after a few hundred gametes see whether they level out; the readout's "highest / expected" should approach 1.
bMake10: Do 10 meioses (gives 40 gametes)
bReset2: Reset: clear the tally
:::

::: strings
r2: n = {n}: {k} possible gamete types; {m} meioses done giving {g} gametes; types seen {seen}/{k}; tallest bar / expected = {ratio}. For humans (n = 23) there are {human} types.
:::

## Crossing over: linked genes can be reshuffled too {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Crossing over
:::

::: html step3-1
:::

This step answers: must two genes on the same chromosome travel together? Not necessarily. Suppose the maternal chromosome carries A B and the paternal one a b (A and B on the same chromosome are **linked**). With no crossing over, the gametes are only AB and ab (parental types); after a crossover swaps a piece between non-sister chromatids, Ab and aB appear (**recombinant** types). The fraction of recombinant gametes is the **recombination frequency** RF; the farther apart two genes are, the larger RF, up to about 0.5 (equivalent to being unlinked). Press "do 25 meioses" to tally 100 gametes at a time and see whether the recombinant share approaches the RF you set. {#s3e .explain}

::: html step3-2
s3o: Set RF to 0: only parental types; to 0.2: about 20% recombinant (Ab and aB about 10% each); to 0.5: all four types about 25% each; tally more and watch the measured RF approach the setting.
lRf: Recombination frequency RF (between two genes)
bMake100: Do 25 meioses (gives 100 gametes)
bReset3: Reset: clear the tally
:::

::: strings
r3: Set RF = {rf}; {m} meioses done, {g} gametes in all: AB {ab}, ab {ab2}, Ab {r1}, aB {r2}; measured RF = {meas}.
noData: no data yet
:::

## Versus mitosis: number of cells, chromosomes and genetic sameness {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Versus mitosis
:::

::: html step4-1
:::

This step answers: how exactly do meiosis and mitosis differ? Run each once on a cell with n = 3 pairs: **mitosis** replicates and then separates the sister chromatids directly, giving 2 diploid daughter cells (2n = 6) identical to the parent; **meiosis** makes 4 gametes through two divisions, each with only n = 3 chromosomes, and not necessarily alike (alignment is random and each pair crosses over with probability one half). The readout counts the cells, the chromosomes per cell and how many different kinds of cell there are. {#s4e .explain}

::: html step4-2
s4o: Press "mitosis" then "run it again": always 2 identical cells with 6 chromosomes each; then press "meiosis" and run it several times: 4 cells with 3 chromosomes each; sometimes only 2 kinds and sometimes 4 different — why?
bMito: Mitosis
bMeio: Meiosis
bAgain: Run it again at random
:::

::: strings
r4: {kind}: {cells} cells, each with {c} chromosomes; {types} different kinds among them.
kMito: Mitosis
kMeio: Meiosis
:::

## Recap and self-check {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Recap & check
:::

::: html step5-1
:::

**Recap**: (1) body cells are diploid (2n) and gametes are haploid (n); (2) meiosis I separates homologs (halving the number) and II separates sister chromatids; (3) random alignment in metaphase I gives 2ⁿ combinations from n pairs; (4) crossing over reshuffles linked genes, and the recombination frequency RF reflects the distance between genes; (5) mitosis gives 2 identical diploid cells while meiosis gives 4 haploid gametes that are not all alike. {#s5e .explain}

::: html step5-2
qq: A human body cell has 46 chromosomes. How many does a normal sperm have?
qo0: 23
qo1: 46
qo2: 92
s5m: This page is a teaching simplification: each homologous pair crosses over at most once (swapping only the lower part between non-sister chromatids), and it leaves out multiple crossovers, interference, nondisjunction, the special segregation of sex chromosomes, asymmetric divisions in egg formation and meiotic checkpoints; chromosomes are drawn as equal bars and do not reflect real sizes; n goes up to 4 (humans have 23, used only in calculation); random numbers are generated by the page and fluctuate when the counts are small.
lk0: Genetics & probability: how a gamete carries one allele, where the 3:1 in the Punnett square comes from
lk1: Cell structure: the nucleus holds the genetic material
:::

::: strings
lgM: red: maternal
lgP: blue: paternal
lgDash: dashed: expected share for the RF you set
qwhy: A gamete carries one chromosome of each homologous pair, so n = 23 (step 0).
:::
