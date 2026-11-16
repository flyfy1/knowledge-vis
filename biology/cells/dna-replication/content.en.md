---
lang: en
---

::: strings
pageTitle: DNA Replication and Translation · A Zipper, a Copy and an Assembly Line
tagline: Bases pair up like a zipper; in replication each strand is a template, transcription copies a gene into mRNA, and the ribosome builds a protein codon by codon.
:::

## Base pairing: A with T, G with C {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Base pairing
:::

::: html step0-1
:::

This step answers: why do the two strands of DNA "fit"? DNA is built from four bases: A (adenine), T (thymine), G (guanine) and C (cytosine). Between the strands, A always pairs with T (making 2 hydrogen bonds) and G always pairs with C (making 3). Given a template strand, pick the complementary base for each position in turn; a wrong pick is flagged and counted. When done, the page totals the hydrogen bonds by pair type and estimates the temperature needed to pull the duplex apart with the Wallace rule, Tm ≈ 2×(A+T) + 4×(G+C) °C: the more G–C, the tighter. {#s0e .explain}

::: html step0-2
s0o: Pick the complementary bases one by one and note the message when you pick wrong; when finished read the GC content, hydrogen-bond count and Tm; press "another template strand" and pair again to compare Tm between strands.
bA: A adenine
bT: T thymine
bG: G guanine
bC: C cytosine
bNewStrand: Another template strand
bReset0: Reset: clear the paired bases
:::

::: strings
r0: {k}/{n} paired; {err} wrong picks; {status}
st0: Next to pair is the template's {b}.
stOk: All paired: {hb} hydrogen bonds in total, GC content {gc}%, Tm ≈ {tm} °C.
wrong: Wrong: {t} can only pair with {c}.
:::

## Semi-conservative replication: each daughter DNA has one old strand and one new {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Semi-conservative copying
:::

::: html step1-1
:::

This step answers: after DNA copies itself, how are old and new strands shared out? During replication the duplex unwinds and **each old strand is a template** on which a new strand is made by base pairing, so every daughter DNA is one old strand plus one new strand: **semi-conservative replication**. In 1958 Meselson and Stahl labelled DNA with heavy nitrogen (¹⁵N, old strands), moved it to light nitrogen (¹⁴N, new strands) and confirmed this by density centrifugation. In the figure purple is the original two old strands and cyan is newly made strand; on the right is the centrifuge tube, where heavy–heavy, heavy–light and light–light DNA settle at different densities. The slider is the number of rounds. {#s1e .explain}

::: html step1-2
s1o: Move the rounds from 0 to 4: the total number of molecules is 2^rounds, but only 2 molecules ever contain an old strand; in the tube the middle "heavy–light" band is 100% after round 1, then fades while the "light–light" band thickens.
lRounds: Rounds of replication
:::

::: strings
r1: After {r} rounds: {tot} duplex molecules, of which heavy–heavy {hh}, heavy–light {hl}, light–light {ll}; centrifuge bands: heavy–light {fhl}%, light–light {fll}%.
:::

## Transcription: copy the gene into mRNA {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Transcription
:::

::: html step2-1
:::

This step answers: how is the information in a gene copied out? In the nucleus RNA polymerase moves along the DNA **template strand** and builds an **mRNA** by the pairing rules: A pairs with U (RNA uses uracil, U, in place of T), T with A, G with C, C with G. The mRNA's sequence matches the other (coding) strand with T replaced by U. The slider is the number of bases copied so far; every 3 bases of mRNA form a **codon** (used in the next step). {#s2e .explain}

::: html step2-2
s2o: Move the slider from 0 to 18: watch the mRNA grow one letter at a time, each paired with the template letter above it; compare genes 2 and 3; check the relationship between "coding strand" and mRNA in the readout.
lPos: Position
gene1: Gene 1
gene2: Gene 2
gene3: Gene 3
:::

::: strings
r2: {p}/{n} bases transcribed; template: {tpl}; mRNA: {mr}; coding strand (T→U): {cod}.
:::

## Translation: the ribosome builds the protein codon by codon {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Translation
:::

::: html step3-1
:::

This step answers: how does the sequence on mRNA become a protein? The ribosome reads mRNA 3 bases at a time (a **codon**), looks up the amino acid in the **genetic code table** (64 codons in all) and adds it to the chain; AUG is the start codon (coding methionine, Met), and UAA, UAG and UGA are stop codons that code for no amino acid, ending the protein when read. The slider is the number of codons the ribosome has read; the circles below are the growing peptide chain. {#s3e .explain}

::: html step3-2
s3o: Move the slider right one step at a time: the chain gains one amino acid each step; at the stop codon the chain ends; switch to genes 2 and 3 and compare the peptides they make.
lCodon: Codons the ribosome has read
:::

::: strings
r3: Gene {g}: {k}/{m} codons read; the codon just read {cod} → {aa}; peptide: {pep}.
stopW: Stop
nextNone: not started
:::

## Mutations: change one letter, what happens to the protein? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Mutations
:::

::: html step4-1
:::

This step answers: what do small changes in DNA do to the protein? Pick a position on the mRNA and **substitute** a base, or **delete** or **insert** one. The outcomes fall in classes: **silent** (the codon changes but the amino acid does not), **missense** (a different amino acid), **nonsense** (a stop codon appears and the chain ends early) and **frameshift** (inserting or deleting 1–2 bases shifts the grouping of every codon after it). The page re-translates the changed mRNA and compares it with the original protein to name the class. The gene is the one picked in step 3 (you can switch it here). {#s4e .explain}

::: html step4-2
s4o: With gene 1, try: change position 6 to any base (GCU→GCx is always alanine, Ala: silent); change position 4 to C (GCU→CCU, Ala becomes Pro: missense); change position 9 to A (UAC→UAA, a stop codon appears: nonsense); delete a base (frameshift). Press reset to restore.
subA: Change this position to A
subU: Change this position to U
subG: Change this position to G
subC: Change this position to C
bDel: Delete the base at this position
bIns: Insert an A before this position
bReset4: Reset: restore the original gene
:::

::: strings
r4: Original protein: {p0}; after mutation: {p1}; class: {kind}. {note}
kNone: no mutation yet
kSil: silent (protein unchanged)
kMis: missense (an amino acid replaced)
kNon: nonsense (early stop)
kFrame: frameshift (reading frame shifted)
kIn: in-frame insertion/deletion (frame kept, amino acids gained or lost)
mutNote: {n} changes in all; mRNA after changes: {mr}.
:::

## Recap and self-check {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Recap & check
:::

::: html step5-1
:::

**Recap**: (1) A–T (2 hydrogen bonds) and G–C (3 hydrogen bonds) pair complementarily; (2) semi-conservative replication gives every daughter DNA one old and one new strand; (3) in transcription RNA polymerase builds mRNA from the template strand (T becomes U); (4) in translation the ribosome reads 3 bases per codon, looks up the amino acid and stops at a stop codon; (5) the effect of a mutation depends on whether it changes the amino acid, creates an early stop or shifts the frame. {#s5e .explain}

::: html step5-2
qq: Why is DNA replication called "semi-conservative"?
qo0: Both strands of each daughter DNA are newly made
qo1: Each daughter DNA has one old strand and one new strand
qo2: The old DNA is kept whole and a new one is made separately
s5m: This page simplifies a lot: strand direction (5′→3′, antiparallel) is ignored; replication shows only the result, without helicase, primers, Okazaki fragments or proofreading; transcription has no promoters, introns or processing; translation has no tRNA or ribosome structure; the codon table is the standard genetic code; mutations are only substitutions and single-base insertions and deletions; the genes are short example sequences, not real genes; the Wallace rule holds only roughly for very short strands.
lk0: Cell structure: the nucleus is where genetic information is kept
lk1: Genetics & probability: how genes pass on, from gametes to phenotypes
:::

::: strings
lblTpl: template strand
lblNew: new complementary strand
lblGen0: start
lblGenN: round {n}
tubeLight: light
tubeHeavy: heavy
lblOrig: original mRNA
lblMut: mutated mRNA
qwhy: Each old strand serves as a template for one new strand, so each daughter DNA is one old plus one new strand (check the centrifuge bands in step 1).
:::
