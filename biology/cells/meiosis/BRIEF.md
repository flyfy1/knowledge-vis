# BRIEF · meiosis 减数分裂

category `biology`, stage `senior`. Built-By: Claude Sonnet 5.5 via Mini Claude Code (batch b3); template: cell-structure skeleton + shared b3 scaffold; Verified-By: self-check only (node probe: gamete counts and 2^n types over all orientations, crossover gametes AB/Ab/aB/ab, mitosis identity, RF simulation of 20000 meioses within ±0.01; headless-Chrome sweep; screenshot check); no independent review. Dedup: genetics-probability covers allele segregation and Punnett squares, not chromosome mechanics, crossing over or mitosis comparison.

## Steps
**0 Paired chromosomes.** Knows: cells have chromosomes. Question: why "reduction"? Input n, replicate; seek 2n, n, chromatid counts. Controls: n slider, Replicate (X shapes, chromatids double), Reset (unreplicated). Holds: equal-size bars.
**1 Two divisions.** Knows: pairs. Question: how is number halved and recombined? Input stage 0–7, alignment re-roll, crossing-over toggle; seek chromosome and chromatid counts per stage. Controls: stage slider redraws state computed from the model; re-roll changes which homolog goes left; toggle shows swapped lower segments. Holds: n = 2, one crossover per pair.
**2 Random assortment.** Knows: stage 2 alignment. Question: how many gamete types? Input n, "10 meioses"; seek tally vs 2^n, tallest/expected. Controls: Make 10 adds 40 gametes; Reset clears; n change clears. Holds: no crossing over; human 2^23 = 8,388,608.
**3 Crossing over.** Knows: gametes. Question: do linked genes stay together? Input RF; seek measured RF = recombinants / gametes. Controls: Make 25 adds 100 gametes; RF change clears; dashed expectations. Holds: crossover probability 2·RF per meiosis (max 1).
**4 Versus mitosis.** Knows: both processes. Question: how do outputs differ? Input mode, rerun; seek cells, chromosomes per cell, distinct types. Controls: Mitosis, Meiosis, Run again. Holds: n = 3, crossover probability 0.5 per pair; meiosis can show 2 or 4 types.
**5 Recap.** Quiz: sperm has 23 chromosomes. Links: genetics-probability#step1, cell-structure#step1.

## First-appearance terms
Diploid/haploid, homologous chromosomes, gamete (0); sister chromatid (0); crossing over, tetrad pairing (1); metaphase/anaphase (1); linkage, recombination frequency (3).

## Simulation vs reality
Single crossover per pair, no interference, nondisjunction, sex chromosomes, asymmetric oogenesis or checkpoints; bars not to scale; random draws fluctuate for small counts.
