# BRIEF · dna-replication DNA 复制与翻译

category `biology`, stage `senior`. Built-By: Claude Sonnet 5.5 via Mini Claude Code (batch b3); template: cell-structure skeleton + shared b3 scaffold; Verified-By: self-check only (node probe: codon table spot checks and degeneracy counts, gene translations, transcription round trip, Meselson–Stahl counts, Tm/hydrogen bonds, mutation classes; headless-Chrome sweep; one screenshot check); no independent review. Dedup: cell-structure and genetics-probability do not cover molecular genetics.

## Steps
**0 Base pairing.** Knows: DNA has 4 letters. Question: why do the two strands fit? Input base picks; seek complement, hydrogen bonds, GC%, Tm (Wallace). Controls: A/T/G/C pick the complement at the next slot (wrong picks counted and explained), New strand reseeds and clears, Reset clears pairs and error count. Holds: 12-base example, Wallace rule rough.
**1 Semi-conservative.** Knows: pairing. Question: how are old/new strands shared? Input rounds 0–4; seek molecule counts and centrifuge band fractions. Controls: slider redraws generation tree and tube bands. Holds: Meselson–Stahl idealisation.
**2 Transcription.** Knows: pairing. Question: how is the gene copied? Input position, gene; seek mRNA = complement of template (T→U) equal to coding strand. Controls: slider grows mRNA, gene buttons switch gene (shared with steps 3–4, which also reset mutation). Holds: no promoter/introns.
**3 Translation.** Knows: codon concept. Question: how does mRNA become protein? Input codons read, gene; seek amino acids from the standard table. Controls: slider extends chain; stop codon ends it. Holds: standard code, tRNA not shown.
**4 Mutations.** Knows: translation. Question: what does a mutation do? Input position, substitution/deletion/insertion; seek class. Controls: buttons apply cumulative edits; classification re-computed from translations (none / silent / missense / nonsense / in-frame indel / frameshift); Reset restores gene. Holds: stop-loss is shown as missense; single-base edits only.
**5 Recap.** Quiz: semi-conservative = one old + one new strand. Links: cell-structure#step1, genetics-probability#step0.

## First-appearance terms
Base pair, hydrogen bond, Tm (0); template, semi-conservative replication (1); transcription, mRNA, codon (2); translation, start/stop codon, genetic code, amino acid (3); silent / missense / nonsense / frameshift mutation (4).

## Simulation vs reality
Direction (5′→3′), helicase, primers, Okazaki fragments, proofreading, promoters, introns, tRNA ignored; sequences are made-up short examples; Wallace rule only for very short oligos.
