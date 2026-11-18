# Review: chemistry/matter/why-atoms-stick-together (2026-11-18)

Reviewer: Claude Code (claude-fable-5-2), independent of the builder. Reviewed and fixed in place, both languages.
The page is a site-template page; every change was made in `content.zh.md`, `content.en.md`, `page.json`,
`models.js` (one comment), `tests/` and `BRIEF.md`, then rebuilt with
`node scripts/build-pages.cjs chemistry/matter/why-atoms-stick-together`. Nothing was committed.

Verdict: ready to register. Open items are listed at the end.

## First-read notes

1. The ladder holds: box → H₂⁺ → filling/Hückel → unequal sharing/lattice → bands → shape → weak forces →
   structure → folding → frontier. Chapter 2's two readings of the bond (kinetic first, virial after contraction) is
   the strongest part and the lab shows both.
2. Chapter 7 claimed more for the simulation than it shows: "energy drift pinned to a few parts in ten thousand"
   is true only for the cold start the test uses, and the "0.4 and 0.5 ε/k" transitions move from run to run.
3. Chapter 3 said He₂⁺ is H₂ plus one electron. It is a three-electron molecule with two helium nuclei.
4. Chapter 10's disputed items were one-sided where the page admitted it had not looked (A-Lab reply), and one
   sentence was wrong (all leaderboard entrants "train on the same data").
5. The chapter 5 lab opens on a "metal" whose readout still shows a 0.3% carrier fraction (the finite-chain gap).
   Not wrong; the sentence explains the gap closes with N. Left as is.

## Models re-derived (independent script, not models.js)

| item | independent result | page |
|---|---|---|
| box, L = 0.2 nm | 9.401 / 2.350 eV, drop 7.051 eV = 680.3 kJ/mol | 9.4 / 2.35 / 7.05 / 680 |
| H₂⁺ LCAO, ζ = 1 (80×80 Gauss–Legendre, prolate spheroidal) | R = 2.493 a₀, D = 1.764 eV, ΔT = −3.19, ΔV = +1.43 eV | 2.49 / 1.76 / 3.19 / 1.43 |
| H₂⁺, ζ optimised | R = 2.003 a₀, ζ = 1.238, D = 2.354 eV, ΔT = +2.354, ΔV = −4.708 eV | 2.00 / 1.24 / 2.35 / 2.35 / 4.71 |
| exact | 0.10263 E_h = 2.793 eV | 2.79 |
| Hückel | butadiene 0.4721, benzene 2, C₄ and C₈ rings gap 0, C₁₀ ring gap 1.236 | same |
| \|β\| from butadiene 217 nm | 4.622 eV; ethene 134, hexatriene 301, C₂₂ 983 nm | 4.62 / 134 / 301 / 983 |
| Madelung, spheres n = 1…4 | 6.000, −0.867, 5.826, −4.509 | 6.00, −0.87, 5.83, −4.51 |
| Madelung, Evjen n = 3; n = 6 | 1.7470; 1.7476 | 1.747 |
| chain | 2 ln 2 = 1.3863 | 1.386 |
| Born–Haber | −411.2 − 107.3 − 495.8 − 121.3 + 348.6 = −787.0 | −787 |
| Born–Landé (M = 1.747565, r₀ = 2.820 Å, n = 8) | −753.4 kJ/mol | −753, 4% |
| carrier factor at 300 K | Si 3.9 × 10⁻¹⁰, diamond 1.1 × 10⁻⁴⁶ | 4 × 10⁻¹⁰, 1 × 10⁻⁴⁶ |
| Coulson | 109.47°; water n = 3.99; H₂S n = 27.3, s = 3.5% | same |
| tight binding | width → 4\|β\|, gap → Δ (closed form ±√((Δ/2)² + 4cos²k)) | same |
| HP walks | (c₉−4)/8+1 = 2,034; (c₁₁−4)/8+1 = 15,037; (c₁₃−4)/8+1 = 110,188 (OEIS A001411) | same |
| Levinthal | 3¹⁰⁰ = 5.2 × 10⁴⁷; 1.6 × 10²⁷ yr; 1.2 × 10¹⁷ ages | 5 × 10⁴⁷ / 2 × 10²⁷ / 1 × 10¹⁷ |
| scalings | 2³ = 8, 2⁷ = 128, 1000^(1/7) = 2.68 | 8 / 128 / 2.7 |
| MD drift, 5,000 steps, dt = 0.01 | 3.4 × 10⁻⁴ (T = 0.2), 9.7 × 10⁻⁴ (0.45), 3.7 × 10⁻³ (1.0) | prose corrected |
| MD phase label vs thermostat T | solid ≤ 0.30; liquid 0.35–0.40; 0.45–0.50 flips between liquid and gas; gas ≥ 0.6 | prose corrected |

Thomson minima, the freely jointed chain and the eigen-solvers were checked through `tests/models.cjs` (which compares
them with closed forms), not re-implemented.

## Errors found and fixed

- Ch3: "add one more electron to H₂ and you have He₂⁺" → "the three-electron case is He₂⁺" (zh, en).
- Ch7: energy-conservation sentence and transition temperatures (see table); thermostat constant and steps per frame
  named as chosen for watchability.
- Ch7/footer/models.js comment: argon ε/k = 119.8 K, σ = 3.405 Å are Verlet's (1967) values; Rahman (1964) used
  120 K and 3.4 Å.
- Ch10 lab: the chart draws five bars (ML potential, DFT, HF, CCSD, CCSD(T)); prose and tiles named four. The prose
  now says CCSD is N⁶ and is the fifth bar, and that the ML potential is explained further down.
- Ch9: diagram label "no H touches another H" (the last two H are chain neighbours, which do not count) and
  "all hydrophobic residues buried" in the best-fold sentence (several sit on the rim) reworded in both languages.
- Ch10 A-Lab: added the Nature Author Correction of 2026-01-19 and quoted Leeman et al. exactly.
- Ch10 Matbench Discovery: "first by the leaderboard's combined score", "added" not "submitted"; the 2023 figure tied
  to the first preprint; "everyone trains and tests on the same public data" → same public test.
- Ch10 EPFL: attributed to the EPFL news release and the model named (PET-OAM-XL).
- Ch10 CASP16: quotation corrected to "notably unsuccessful at present".
- Ch10 CrCoNi: the paper's own term (medium-entropy alloy) added.
- Ch6 and ch11: two causal sentences softened (H₂S/PH₃ angle; 42 °C fever).
- Footer: complete list of tuned/conventional parameters; review status.
- English: ch3 "how" line mistranslated (the count does not decide chain or ring); "flat triangle" → "trigonal
  planar"; "screen out" → "identify"; "costs β", "the bill", "down the period", "flown out to the edge", "plus a few
  more" (not in the Chinese), "spread too far apart"; sibling-essay titles matched to their REGISTRY.json.
- English layout: Born–Haber label ⑥ overlapped its value at 1280; the chapter 5 Δ slider was pushed out of its card by
  a long label; the chapter 10 canvas label "Machine-learned potential" was clipped at 320. All shortened.
- English generated text: "1 pairs", "1 folds", "1 years" (readouts, live sentences and a canvas axis) reworded so
  that no plural depends on the number.
- English diagram labels the translator had cut: `dg.forces.kt`, `dg.lj.rep`, `dg.lj.att`, `dg.bp.ext` restored as
  far as the label room allows.

## Sources opened by the reviewer (2026-11-18)

arXiv:2506.23971 (UMA abstract); arXiv:2506.14665 (Skala abstract and version dates); arXiv:2601.16195 (Bigi et al.
abstract); arXiv:2308.14920 v1 and v3 abstracts; matbench-discovery.materialsproject.org (through a summarising
fetch); journals.aps.org PRX Energy 3, 011002 abstract; Europe PMC records for the CASP16 monomer assessment (Yuan et
al.) and the CASP16 summary (Kryshtafovych et al., Proteins 94, 5–14); PMC11168924 (AlphaFold 3, limitations section);
PMC10700131 (GNoME abstract); nature.com/articles/s41586-025-09992-y (A-Lab Author Correction);
Microsoft Research blog on MatterGen.

## Tests

- `tests/models.cjs`: the "English is declared a stub" check is replaced by: no stub declaration; identical key sets;
  no Chinese in any English string; every English live sentence non-trivial; every English frontier item dated;
  placeholders equal between languages. Nothing else changed.
- `tests/browser.cjs`: a stub is now a failure; the width loop adds a toggle-label check and an English attribute
  check (title, meta description, aria-label, title, alt); a language-toggle block checks that switching redraws
  the visible canvas in each language; the every-branch model block now runs in Chinese and in English.

## Open

- Textbook measured values and classic volume/page numbers were compared with memory of the standard references,
  not with an open handbook.
- Not opened: the MatterGen Nature paper (figures are from Microsoft's blog; the page says so); the EPFL news release
  (search summary only); Cheetham & Seshadri, Zhao et al., Ao et al., Liu et al., OMol25 and Jumper et al. were not
  re-opened.
- The chapter 7 lab's live sentence is refreshed every 0.6 s while the "measured temperature" tile updates every frame,
  so the two can differ by a few hundredths of ε/k at a given moment. Left as is.
- `canvas-text-overlap --sweep` reports are summarised in the reviewer's final message; it cannot see text on lines.
- Registration, provenance label and deployment are not part of this review. `tests/models.cjs` still asserts
  "no provenance label yet (unregistered draft)", which the registrar must replace.
